'use client';

import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useGamificationStore } from '@/stores/gamification-store';
import { getLevelFromXp } from '@/lib/gamification/xp-config';

interface XpResponseData {
  amount: number;
  total: number;
  leveledUp: boolean;
  newLevel: number | null;
  newLevelTitle: string | null;
  streak: number;
  sessionCooldown?: boolean;
}

/**
 * Hook that provides a callback to process XP data from API responses.
 * Call `processXpResponse(data)` in your mutation's `onSuccess` to trigger
 * XP toasts, update the store, and track daily progress.
 */
export function useXpResponse() {
  const addXpToast = useGamificationStore((s) => s.addXpToast);
  const incrementTodayXp = useGamificationStore((s) => s.incrementTodayXp);
  const setStats = useGamificationStore((s) => s.setStats);
  const loaded = useGamificationStore((s) => s.loaded);
  const cooldownShown = useRef(false);

  const processXpResponse = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (apiResponse: any) => {
      if (!loaded) return;

      const xp: XpResponseData | null = apiResponse?.data?.xp ?? apiResponse?.xp ?? null;
      if (!xp || xp.amount <= 0) return;

      // Trigger the XP toast animation
      addXpToast(xp.amount, xp.leveledUp, xp.newLevelTitle);

      // Update today's XP and total in the store
      incrementTodayXp(xp.amount);

      // Update level info if changed
      if (xp.leveledUp && xp.newLevel) {
        const levelInfo = getLevelFromXp(xp.total);
        setStats({
          level: levelInfo.level,
          levelTitle: levelInfo.title,
          totalXp: xp.total,
        });
      }

      // Update streak
      if (xp.streak > 0) {
        setStats({ currentStreak: xp.streak });
      }

      // Session cool-down message (>500 XP in 4h)
      if (xp.sessionCooldown && !cooldownShown.current) {
        cooldownShown.current = true;
        toast('Bonne session ! Tu as bien contribue aujourd\'hui.', { duration: 5000 });
      }
    },
    [loaded, addXpToast, incrementTodayXp, setStats],
  );

  return { processXpResponse };
}
