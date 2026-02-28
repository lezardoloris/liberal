/**
 * TEMPORARY — Fix seeded entries dates so they appear in feeds.
 * The reseed endpoint backdated entries 6 months; the hot feed's stale
 * filter hides anything older than 7 days with score < 10.
 *
 * This updates all isSeeded=1 entries to spread across the last 5 days.
 * Remove after use.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const key = request.headers.get('x-reseed-key');
  if (!key || key !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const seeded = await db
      .select({ id: submissions.id, title: submissions.title })
      .from(submissions)
      .where(eq(submissions.isSeeded, 1))
      .orderBy(submissions.id);

    if (seeded.length === 0) {
      return NextResponse.json({ error: 'No seeded entries found' }, { status: 404 });
    }

    const now = new Date();
    let updated = 0;

    for (let i = 0; i < seeded.length; i++) {
      // Spread across the last 5 days with hourly variation
      const hoursBack = Math.floor((i / seeded.length) * 5 * 24);
      const createdAt = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

      // With 0 votes, hotScore formula gives 0 (sign=0).
      // Give each a small upvote count so hotScore is meaningful.
      const upvotes = 3 + (i % 8); // 3-10 upvotes each
      const score = upvotes;
      const sign = 1;
      const order = Math.log10(Math.max(score, 1));
      const seconds = createdAt.getTime() / 1000;
      const hotScore = order + (sign * seconds) / 45000;

      await db
        .update(submissions)
        .set({
          createdAt,
          upvoteCount: upvotes,
          hotScore: String(hotScore),
          updatedAt: now,
        })
        .where(eq(submissions.id, seeded[i].id));
      updated++;
    }

    return NextResponse.json({
      ok: true,
      updated,
      message: `Updated ${updated} seeded entries with recent dates and initial votes`,
    });
  } catch (error) {
    console.error('Fix dates error:', error);
    return NextResponse.json(
      { error: 'Fix failed', details: String(error) },
      { status: 500 },
    );
  }
}
