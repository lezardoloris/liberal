'use client';

import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getLevelColor(level: number): string {
  if (level >= 15) return 'bg-chainsaw-red/15 text-chainsaw-red ring-1 ring-chainsaw-red/30';
  if (level >= 7) return 'bg-chainsaw-red/10 text-chainsaw-red';
  return 'bg-surface-elevated text-text-muted';
}

export function LevelBadge({ level, title, size = 'sm', className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        getLevelColor(level),
        sizeClasses[size],
        className,
      )}
    >
      <span className="tabular-nums">Nv.{level}</span>
      <span className="hidden sm:inline">{title}</span>
    </span>
  );
}
