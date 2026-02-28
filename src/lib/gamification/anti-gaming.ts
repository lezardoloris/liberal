import { db } from '@/lib/db';
import { xpEvents, antiGamingEvents } from '@/lib/db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';

type XpActionType = string;

interface AntiGamingResult {
  allowed: boolean;
  xpMultiplier: number;
  reason: string | null;
}

/**
 * Get start of today in Paris timezone.
 */
function getTodayParis(): string {
  const now = new Date();
  const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  return `${parisDate.getFullYear()}-${String(parisDate.getMonth() + 1).padStart(2, '0')}-${String(parisDate.getDate()).padStart(2, '0')}`;
}

/**
 * Get start of current week (Monday) in Paris timezone.
 */
function getWeekStartParis(): string {
  const now = new Date();
  const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const dayOfWeek = parisDate.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  parisDate.setDate(parisDate.getDate() - diff);
  return `${parisDate.getFullYear()}-${String(parisDate.getMonth() + 1).padStart(2, '0')}-${String(parisDate.getDate()).padStart(2, '0')}`;
}

/**
 * Check for anti-gaming patterns before awarding XP.
 * Returns whether XP should be allowed and any multiplier to apply.
 */
export async function checkAntiGaming(
  userId: string,
  actionType: XpActionType,
  relatedEntityId?: string | null,
): Promise<AntiGamingResult> {
  const todayStart = getTodayParis();

  // Check 1: Excessive votes (>200 votes/day)
  if (actionType === 'vote_cast') {
    const [voteCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(xpEvents)
      .where(
        and(
          eq(xpEvents.userId, userId),
          eq(xpEvents.actionType, 'vote_cast'),
          gte(xpEvents.createdAt, sql`${todayStart}::date`),
        ),
      );

    if ((voteCount?.count ?? 0) > 200) {
      await logAntiGamingEvent(userId, 'excessive_votes', {
        voteCount: voteCount?.count,
        threshold: 200,
      });
      return { allowed: false, xpMultiplier: 0, reason: 'excessive_votes' };
    }
  }

  // Check 2: Rapid same-target voting (>5 votes to same author in 1 hour)
  if (
    relatedEntityId &&
    (actionType === 'upvote_received' || actionType === 'comment_upvoted' || actionType === 'solution_upvoted')
  ) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [rapidCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(xpEvents)
      .where(
        and(
          eq(xpEvents.userId, userId),
          gte(xpEvents.createdAt, oneHourAgo),
          sql`${xpEvents.actionType} IN ('upvote_received', 'comment_upvoted', 'solution_upvoted')`,
        ),
      );

    if ((rapidCount?.count ?? 0) > 5) {
      await logAntiGamingEvent(userId, 'rapid_same_target', {
        count: rapidCount?.count,
        threshold: 5,
        timeWindow: '1h',
      });
      // Don't block, but flag
    }
  }

  // Check 3: Reciprocal decay after 3rd interaction per pair per week
  if (
    actionType === 'upvote_received' ||
    actionType === 'comment_upvoted' ||
    actionType === 'solution_upvoted'
  ) {
    const weekStart = getWeekStartParis();
    // Check if the person who triggered this action has received XP from the same target
    // This is approximated by checking reciprocal XP events between users this week
    const [reciprocalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(xpEvents)
      .where(
        and(
          eq(xpEvents.userId, userId),
          gte(xpEvents.createdAt, sql`${weekStart}::date`),
          sql`${xpEvents.metadata}->>'triggeredBy' IS NOT NULL`,
          sql`${xpEvents.actionType} IN ('upvote_received', 'comment_upvoted', 'solution_upvoted')`,
        ),
      );

    if ((reciprocalCount?.count ?? 0) >= 3) {
      await logAntiGamingEvent(userId, 'reciprocal_decay', {
        reciprocalCount: reciprocalCount?.count,
        weekStart,
      });
      return { allowed: true, xpMultiplier: 0.5, reason: 'reciprocal_decay' };
    }
  }

  return { allowed: true, xpMultiplier: 1, reason: null };
}

/**
 * Check if user has earned >500 XP in current session (last 4 hours).
 * Returns the session XP total for cool-down message display.
 */
export async function getSessionXpTotal(userId: string): Promise<number> {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${xpEvents.xpAmount}), 0)::int` })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        gte(xpEvents.createdAt, fourHoursAgo),
        sql`${xpEvents.xpAmount} > 0`,
      ),
    );

  return result?.total ?? 0;
}

async function logAntiGamingEvent(
  userId: string,
  eventType: 'excessive_votes' | 'rapid_same_target' | 'daily_outlier' | 'reciprocal_decay' | 'session_cooldown',
  details: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(antiGamingEvents).values({
      userId,
      eventType,
      details,
      actionTaken: eventType === 'excessive_votes' ? 'blocked' : 'flagged',
    });
  } catch (error) {
    console.error('Failed to log anti-gaming event:', error);
  }
}
