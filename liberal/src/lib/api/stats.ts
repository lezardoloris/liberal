import { db } from '@/lib/db';
import { submissions, votes, ipVotes } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import type { StatsData } from '@/types/stats';

export interface PlatformStats {
  totalSubmissions: number;
  totalAmountEur: number;
  totalUniqueVoters: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [submissionStats, authVoters, anonVoters] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published')),

    db
      .select({
        count: sql<number>`count(distinct ${votes.userId})`,
      })
      .from(votes),

    db
      .select({
        count: sql<number>`count(distinct ${ipVotes.ipHash})`,
      })
      .from(ipVotes),
  ]);

  return {
    totalSubmissions: submissionStats[0]?.count ?? 0,
    totalAmountEur: submissionStats[0]?.totalAmount ?? 0,
    totalUniqueVoters:
      (authVoters[0]?.count ?? 0) + (anonVoters[0]?.count ?? 0),
  };
}

export async function getFullStats(): Promise<StatsData> {
  const [
    totalsRow,
    authVoters,
    anonVoters,
    byCategory,
    top10,
    overTime,
  ] = await Promise.all([
    // Totals
    db
      .select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
        totalUpvotes: sql<number>`coalesce(sum(${submissions.upvoteCount}), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published')),

    // Auth voters
    db
      .select({ count: sql<number>`count(distinct ${votes.userId})` })
      .from(votes),

    // Anon voters
    db
      .select({ count: sql<number>`count(distinct ${ipVotes.ipHash})` })
      .from(ipVotes),

    // By category
    db
      .select({
        category: sql<string>`coalesce(${submissions.ministryTag}, 'Autre')`,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published'))
      .groupBy(submissions.ministryTag)
      .orderBy(desc(sql`sum(${submissions.amount}::numeric)`)),

    // Top 10 by amount
    db
      .select({
        id: submissions.id,
        title: submissions.title,
        amount: sql<number>`${submissions.amount}::numeric`,
        ministryTag: submissions.ministryTag,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published'))
      .orderBy(desc(sql`${submissions.amount}::numeric`))
      .limit(10),

    // Over time (monthly)
    db
      .select({
        month: sql<string>`to_char(${submissions.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${submissions.amount}::numeric), 0)`,
      })
      .from(submissions)
      .where(eq(submissions.status, 'published'))
      .groupBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM')`),
  ]);

  // Compute cumulative amounts
  let cumulative = 0;
  const timelineData = overTime.map((row) => {
    cumulative += row.totalAmount;
    return {
      month: row.month,
      count: row.count,
      cumulativeAmount: cumulative,
    };
  });

  return {
    totals: {
      submissions: totalsRow[0]?.count ?? 0,
      totalAmountEur: totalsRow[0]?.totalAmount ?? 0,
      totalUpvotes: totalsRow[0]?.totalUpvotes ?? 0,
      uniqueVoters: (authVoters[0]?.count ?? 0) + (anonVoters[0]?.count ?? 0),
    },
    byCategory,
    top10,
    overTime: timelineData,
  };
}
