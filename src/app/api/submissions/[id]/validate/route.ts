import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { isValidUUID } from '@/lib/utils/validation';
import { db } from '@/lib/db';
import { submissions, communityValidations, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getLevelFromXp } from '@/lib/gamification/xp-config';
import { getValidationWeight, MIN_VALIDATION_LEVEL, VALIDATION_THRESHOLDS } from '@/lib/utils/validation-weight';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('api', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  const { id: submissionId } = await params;
  if (!isValidUUID(submissionId)) {
    return apiError('VALIDATION_ERROR', 'ID de soumission invalide', 400);
  }

  const body = await request.json();
  const verdict = body.verdict;
  const reason = body.reason || null;

  if (verdict !== 'approve' && verdict !== 'reject') {
    return apiError('VALIDATION_ERROR', 'Verdict invalide (approve ou reject)', 400);
  }

  try {
    // Get user level
    const [user] = await db
      .select({ totalXp: users.totalXp })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return apiError('NOT_FOUND', 'Utilisateur introuvable', 404);
    }

    const level = getLevelFromXp(user.totalXp);
    if (level.level < MIN_VALIDATION_LEVEL) {
      return apiError(
        'FORBIDDEN',
        `Niveau ${MIN_VALIDATION_LEVEL} requis pour valider (vous êtes niveau ${level.level})`,
        403,
      );
    }

    // Check submission exists and user is not the author
    const [submission] = await db
      .select({ authorId: submissions.authorId, moderationStatus: submissions.moderationStatus })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return apiError('NOT_FOUND', 'Signalement introuvable', 404);
    }

    if (submission.authorId === session.user.id) {
      return apiError('FORBIDDEN', 'Vous ne pouvez pas valider votre propre signalement', 403);
    }

    const weight = getValidationWeight(level.level);

    // Upsert validation
    await db
      .insert(communityValidations)
      .values({
        submissionId,
        userId: session.user.id,
        verdict,
        weight,
        reason,
      })
      .onConflictDoUpdate({
        target: [communityValidations.userId, communityValidations.submissionId],
        set: { verdict, weight, reason },
      });

    // Recalculate weights
    const [weights] = await db
      .select({
        approveWeight: sql<number>`coalesce(sum(case when ${communityValidations.verdict} = 'approve' then ${communityValidations.weight} else 0 end), 0)`,
        rejectWeight: sql<number>`coalesce(sum(case when ${communityValidations.verdict} = 'reject' then ${communityValidations.weight} else 0 end), 0)`,
      })
      .from(communityValidations)
      .where(eq(communityValidations.submissionId, submissionId));

    const approveWeight = Number(weights.approveWeight);
    const rejectWeight = Number(weights.rejectWeight);

    // Update submission weights
    await db
      .update(submissions)
      .set({ approveWeight, rejectWeight })
      .where(eq(submissions.id, submissionId));

    // Auto-resolve check
    let autoResolved: 'approved' | 'rejected' | null = null;
    const { minApproveWeight, minRejectWeight, approveRatio, rejectRatio } = VALIDATION_THRESHOLDS;

    if (approveWeight >= minApproveWeight && approveWeight > rejectWeight * approveRatio) {
      await db
        .update(submissions)
        .set({ moderationStatus: 'approved' })
        .where(eq(submissions.id, submissionId));
      autoResolved = 'approved';
    } else if (rejectWeight >= minRejectWeight && rejectWeight > approveWeight * rejectRatio) {
      await db
        .update(submissions)
        .set({ moderationStatus: 'rejected' })
        .where(eq(submissions.id, submissionId));
      autoResolved = 'rejected';
    }

    // Award XP for moderation
    const { awardXp } = await import('@/lib/gamification/xp-engine');
    const xpResult = await awardXp(session.user.id, 'moderation_action', submissionId, 'submission');
    const xp = xpResult.awarded
      ? {
          amount: xpResult.xpAmount + (xpResult.dailyBonusAwarded ? xpResult.dailyBonusXp : 0),
          total: xpResult.totalXp,
          leveledUp: xpResult.leveledUp,
          newLevel: xpResult.newLevel,
          newLevelTitle: xpResult.newLevelTitle,
        }
      : null;

    return apiSuccess({
      verdict,
      weight,
      approveWeight,
      rejectWeight,
      autoResolved,
      xp,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors de la validation', 500);
  }
}
