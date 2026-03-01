import { db } from '@/lib/db';
import { users, xpEvents } from '@/lib/db/schema';
import { eq, sql, ilike } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';

// ONE-TIME route: promote lezardoloris to admin + level 2
// DELETE THIS FILE after use
export async function GET(): Promise<Response> {
  try {
    // Find user by display name
    const [user] = await db
      .select({ id: users.id, displayName: users.displayName, totalXp: users.totalXp, role: users.role })
      .from(users)
      .where(ilike(users.displayName, 'lezardoloris'));

    if (!user) {
      return apiError('NOT_FOUND', 'User lezardoloris not found', 404);
    }

    // Promote to admin
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));

    // Grant XP to reach level 2 (100 XP minimum)
    const xpNeeded = Math.max(0, 100 - user.totalXp);
    if (xpNeeded > 0) {
      await db.insert(xpEvents).values({
        userId: user.id,
        actionType: 'admin_manual',
        xpAmount: xpNeeded,
        metadata: { reason: 'Promote to level 2' },
      });
      await db
        .update(users)
        .set({ totalXp: sql`${users.totalXp} + ${xpNeeded}` })
        .where(eq(users.id, user.id));
    }

    return apiSuccess({
      done: true,
      userId: user.id,
      previousRole: user.role,
      newRole: 'admin',
      previousXp: user.totalXp,
      newXp: user.totalXp + xpNeeded,
      xpGranted: xpNeeded,
    });
  } catch (error) {
    console.error('Promote error:', error);
    return apiError('INTERNAL_ERROR', String(error), 500);
  }
}
