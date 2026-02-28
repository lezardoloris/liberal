import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql, and, ne, isNotNull, lt } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';

/**
 * POST /api/cron/streak-check
 *
 * Resets streaks for users who didn't earn any XP yesterday (Europe/Paris).
 * Called by Railway cron daily at 00:05 Europe/Paris.
 * Protected by CRON_SECRET bearer token.
 *
 * Repos mode: users with dailyGoal=0 get up to 3 streak-protected days per month.
 * Their reposDaysUsedThisMonth counter is incremented instead of resetting streak.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return apiError('UNAUTHORIZED', 'Invalid cron secret', 401);
  }

  try {
    // Get yesterday's date in Paris timezone
    const now = new Date();
    const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    parisDate.setDate(parisDate.getDate() - 1);
    const yesterday = `${parisDate.getFullYear()}-${String(parisDate.getMonth() + 1).padStart(2, '0')}-${String(parisDate.getDate()).padStart(2, '0')}`;

    // Reset monthly repos counter on 1st of month
    const today = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    if (today.getDate() === 1) {
      await db
        .update(users)
        .set({ reposDaysUsedThisMonth: 0, updatedAt: new Date() })
        .where(sql`${users.reposDaysUsedThisMonth} > 0`);
    }

    // Handle repos mode users: dailyGoal=0, still have streak, missed yesterday
    // Protect their streak (up to 3 days/month)
    const reposProtected = await db
      .update(users)
      .set({
        reposDaysUsedThisMonth: sql`${users.reposDaysUsedThisMonth} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          sql`${users.dailyGoal} = 0`,
          sql`${users.currentStreak} > 0`,
          isNotNull(users.lastActiveDate),
          lt(users.lastActiveDate, yesterday),
          sql`${users.reposDaysUsedThisMonth} < 3`,
          sql`${users.deletedAt} IS NULL`,
        ),
      )
      .returning({ id: users.id });

    // Reset streaks for users who:
    // 1. Have an active streak (>0)
    // 2. Have a lastActiveDate before yesterday (missed at least 1 day)
    // 3. Are NOT in repos mode with remaining protection days
    // 4. Don't have streak freeze tokens to auto-consume
    const resetResult = await db
      .update(users)
      .set({
        currentStreak: 0,
        updatedAt: new Date(),
      })
      .where(
        and(
          ne(users.currentStreak, 0),
          isNotNull(users.lastActiveDate),
          lt(users.lastActiveDate, yesterday),
          sql`${users.deletedAt} IS NULL`,
          // Exclude repos mode users who still have protection
          sql`NOT (${users.dailyGoal} = 0 AND ${users.reposDaysUsedThisMonth} <= 3)`,
          // Exclude users with streak freeze (those are consumed in awardXp)
          sql`${users.streakFreezeCount} = 0`,
        ),
      )
      .returning({ id: users.id });

    return apiSuccess({
      streaksReset: resetResult.length,
      reposProtected: reposProtected.length,
      checkedAt: now.toISOString(),
      yesterdayParis: yesterday,
    });
  } catch (error) {
    console.error('Streak check cron error:', error);
    return apiError('INTERNAL_ERROR', 'Streak check failed', 500);
  }
}
