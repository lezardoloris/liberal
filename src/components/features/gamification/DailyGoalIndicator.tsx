'use client';

import { useGamificationStore } from '@/stores/gamification-store';
import { Target, Check } from 'lucide-react';

export function DailyGoalIndicator() {
  const todayXp = useGamificationStore((s) => s.todayXp);
  const dailyGoal = useGamificationStore((s) => s.dailyGoal);
  const loaded = useGamificationStore((s) => s.loaded);

  if (!loaded || dailyGoal === 0) return null;

  const progress = Math.min(100, Math.floor((todayXp / dailyGoal) * 100));
  const completed = todayXp >= dailyGoal;

  return (
    <div className="flex items-center gap-1.5">
      {completed ? (
        <Check className="size-3.5 text-green-500" />
      ) : (
        <Target className="size-3.5 text-text-muted" />
      )}
      <div className="relative h-1.5 w-10 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500' : 'bg-chainsaw-red/60'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-text-muted">
        {todayXp}/{dailyGoal}
      </span>
    </div>
  );
}
