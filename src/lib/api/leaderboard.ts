import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc, isNull } from 'drizzle-orm';
import { getLevelFromXp } from '@/lib/gamification/xp-config';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  levelTitle: string;
  streak: number;
  submissionCount: number;
}

export async function getTopLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  const rows = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      anonymousId: users.anonymousId,
      avatarUrl: users.avatarUrl,
      totalXp: users.totalXp,
      currentStreak: users.currentStreak,
      submissionCount: users.submissionCount,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.totalXp))
    .limit(limit);

  return rows
    .filter((r) => r.totalXp > 0)
    .map((row, i) => {
      const level = getLevelFromXp(row.totalXp);
      return {
        rank: i + 1,
        displayName: row.displayName || `Citoyen ${row.anonymousId}`,
        avatarUrl: row.avatarUrl,
        totalXp: row.totalXp,
        level: level.level,
        levelTitle: level.title,
        streak: row.currentStreak,
        submissionCount: row.submissionCount,
      };
    });
}
