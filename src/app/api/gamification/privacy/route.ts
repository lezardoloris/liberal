import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  const [user] = await db
    .select({
      showXpPublicly: users.showXpPublicly,
      showLevelPublicly: users.showLevelPublicly,
      showStreakPublicly: users.showStreakPublicly,
      showBadgesPublicly: users.showBadgesPublicly,
      leagueOptOut: users.leagueOptOut,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return apiError('NOT_FOUND', 'Utilisateur introuvable', 404);
  }

  return apiSuccess(user);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('UNAUTHORIZED', 'Connexion requise', 401);
  }

  try {
    const body = await request.json();
    const allowedKeys = [
      'showXpPublicly',
      'showLevelPublicly',
      'showStreakPublicly',
      'showBadgesPublicly',
      'leagueOptOut',
    ] as const;

    const updates: Record<string, boolean> = {};
    for (const key of allowedKeys) {
      if (typeof body[key] === 'boolean') {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return apiError('VALIDATION_ERROR', 'Aucun parametre valide', 400);
    }

    await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return apiSuccess({ ...updates });
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
