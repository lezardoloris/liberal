import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { submissions, users, communityValidations } from '@/lib/db/schema';
import { eq, and, desc, isNull, ne, notExists, sql } from 'drizzle-orm';
import { getLevelFromXp } from '@/lib/gamification/xp-config';
import { MIN_VALIDATION_LEVEL } from '@/lib/utils/validation-weight';

export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('api', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  try {
    // Check user level
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
        `Niveau ${MIN_VALIDATION_LEVEL} requis pour valider`,
        403,
      );
    }

    // Get pending submissions the user hasn't voted on and didn't author
    const pending = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        slug: submissions.slug,
        description: submissions.description,
        amount: submissions.amount,
        sourceUrl: submissions.sourceUrl,
        authorDisplay: submissions.authorDisplay,
        approveWeight: submissions.approveWeight,
        rejectWeight: submissions.rejectWeight,
        createdAt: submissions.createdAt,
      })
      .from(submissions)
      .where(
        and(
          eq(submissions.moderationStatus, 'pending'),
          eq(submissions.status, 'published'),
          isNull(submissions.deletedAt),
          ne(submissions.authorId, session.user.id),
          notExists(
            db
              .select({ one: sql<number>`1` })
              .from(communityValidations)
              .where(
                and(
                  eq(communityValidations.submissionId, submissions.id),
                  eq(communityValidations.userId, session.user.id),
                ),
              ),
          ),
        ),
      )
      .orderBy(desc(submissions.createdAt))
      .limit(20);

    return apiSuccess(pending);
  } catch (error) {
    console.error('Pending submissions error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du chargement', 500);
  }
}
