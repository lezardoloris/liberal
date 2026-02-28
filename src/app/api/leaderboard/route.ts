import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { getTopLeaderboard } from '@/lib/api/leaderboard';

export const revalidate = 300; // ISR 5 min

export async function GET(request: NextRequest): Promise<Response> {
  const ip = getClientIp(request.headers);
  const rateLimitError = await checkRateLimit('api', ip);
  if (rateLimitError) {
    return apiError('RATE_LIMITED', rateLimitError, 429);
  }

  try {
    const ranked = await getTopLeaderboard(50);
    return apiSuccess(ranked);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur lors du chargement du classement', 500);
  }
}
