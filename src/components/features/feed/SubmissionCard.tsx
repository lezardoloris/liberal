'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  formatEUR,
  formatCompactEUR,
  formatEURPrecise,
  formatRelativeTime,
  truncate,
} from '@/lib/utils/format';
import { VoteButtonInline } from '@/components/features/voting/VoteButtonInline';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { SourceBadge } from '@/components/features/sources/SourceBadge';
import { PinnedNote } from '@/components/features/notes/PinnedNote';
import { MessageSquare, Flame, Zap } from 'lucide-react';
import { getCategoryDef } from '@/lib/constants/categories';
import { getLevelFromXp } from '@/lib/gamification/xp-config';
import type { SubmissionCardData } from '@/types/submission';

interface SubmissionCardProps {
  submission: SubmissionCardData;
  index?: number;
}

function getOutrageTier(costPerTaxpayer: string | null): {
  border: string;
  bg: string;
  isExtreme: boolean;
} {
  if (!costPerTaxpayer) return { border: 'border-l-border-default', bg: '', isExtreme: false };
  const cost = parseFloat(costPerTaxpayer);
  if (cost >= 10)
    return { border: 'border-l-chainsaw-red', bg: 'bg-chainsaw-red/[0.03]', isExtreme: true };
  if (cost >= 1) return { border: 'border-l-chainsaw-red/50', bg: 'bg-chainsaw-red/[0.02]', isExtreme: false };
  if (cost >= 0.1) return { border: 'border-l-text-muted', bg: '', isExtreme: false };
  return { border: 'border-l-text-muted', bg: 'bg-surface-secondary', isExtreme: false };
}

export function SubmissionCard({ submission, index = 0 }: SubmissionCardProps) {
  const score = submission.upvoteCount - submission.downvoteCount;
  const category = getCategoryDef(submission.ministryTag);
  const outrage = getOutrageTier(submission.costPerTaxpayer);
  const authorLevelInfo = submission.authorLevel ? getLevelFromXp(submission.authorLevel) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5), ease: 'easeOut' }}
      role="article"
      aria-label={`${submission.title}, score: ${score}, cout: ${formatEUR(submission.amount)}`}
      className={cn(
        'group relative rounded-lg border border-border-default',
        'bg-surface-secondary',
        outrage.bg,
        'transition-all duration-200 hover:border-border-default/80 hover:bg-surface-elevated',
        'border-l-[5px]',
        'card-hover-lift',
        outrage.border,
      )}
    >
      {/* Stretched link — makes entire card clickable */}
      <Link
        href={`/s/${submission.id}`}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary"
        aria-label={truncate(submission.title, 120)}
        tabIndex={-1}
      />

      <div className="pointer-events-none relative z-1 p-4">
        {/* Top section: stacked on mobile, row on desktop */}
        <div className="md:flex md:items-start md:justify-between md:gap-4">
          <div className="min-w-0 space-y-2 md:flex-1">
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              {category && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4',
                    category.color,
                    category.bgColor,
                  )}
                >
                  <category.icon className="size-3" aria-hidden="true" />
                  {category.label}
                </span>
              )}
              <SourceBadge
                sourceUrl={submission.sourceUrl}
                sourceCount={submission.sourceCount}
              />
              <span aria-hidden="true">&middot;</span>
              <time
                dateTime={
                  typeof submission.createdAt === 'string'
                    ? submission.createdAt
                    : submission.createdAt.toISOString()
                }
              >
                {formatRelativeTime(submission.createdAt)}
              </time>
              {authorLevelInfo && authorLevelInfo.level > 1 && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-chainsaw-red/70"
                    title={`Nv.${authorLevelInfo.level} ${authorLevelInfo.title}`}
                  >
                    <Zap className="size-2.5" />
                    Nv.{authorLevelInfo.level}
                  </span>
                </>
              )}
              {submission.authorStreak && submission.authorStreak >= 3 ? (
                <Flame className="size-3 text-text-muted" />
              ) : null}
            </div>

            {/* Cost badges: above title on mobile, hidden on desktop (shown top-right instead) */}
            <div className="flex flex-wrap items-center gap-1.5 md:hidden">
              {submission.costPerTaxpayer && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold leading-4 tabular-nums',
                    outrage.isExtreme
                      ? 'bg-chainsaw-red/15 text-chainsaw-red'
                      : 'bg-warning/15 text-warning',
                  )}
                >
                  {outrage.isExtreme && <Flame className="size-3" aria-hidden="true" />}
                  {formatEURPrecise(submission.costPerTaxpayer)}/citoyen
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-chainsaw-red/10 px-2 py-0.5 text-[11px] font-black tabular-nums text-chainsaw-red">
                {formatCompactEUR(Number(submission.amount))}
              </span>
            </div>

            {/* Title + Description */}
            <div>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-text-primary transition-colors group-hover:text-chainsaw-red md:text-lg">
                {truncate(submission.title, 120)}
              </h3>
              {submission.description && (
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                  {truncate(submission.description, 200)}
                </p>
              )}
            </div>
          </div>

          {/* Cost badges: top-right on desktop */}
          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            {submission.costPerTaxpayer && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold leading-4 tabular-nums',
                  outrage.isExtreme
                    ? 'bg-chainsaw-red/15 text-chainsaw-red'
                    : 'bg-chainsaw-red/10 text-chainsaw-red/80',
                )}
              >
                {outrage.isExtreme && <Flame className="size-3" aria-hidden="true" />}
                {formatEURPrecise(submission.costPerTaxpayer)}/citoyen
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-chainsaw-red/10 px-2.5 py-0.5 text-xs font-black tabular-nums text-chainsaw-red">
              {formatCompactEUR(Number(submission.amount))}
            </span>
          </div>
        </div>

        {/* Pinned Community Note */}
        {submission.pinnedNoteBody && (
          <div className="mt-3">
            <PinnedNote body={submission.pinnedNoteBody} />
          </div>
        )}

        {/* Action Bar */}
        <div className="pointer-events-auto mt-3 flex items-center gap-1">
          <VoteButtonInline
            submissionId={submission.id}
            serverCounts={{
              up: submission.upvoteCount,
              down: submission.downvoteCount,
            }}
          />

          <Link
            href={`/s/${submission.id}#commentaires`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
              'text-xs font-medium text-text-muted',
              'transition-colors hover:bg-surface-elevated hover:text-text-secondary',
            )}
            aria-label={`${submission.commentCount} commentaires`}
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            <span>{submission.commentCount}</span>
          </Link>

          <span className="flex-1" />

          <ShareButton
            submissionId={submission.id}
            title={submission.title}
            costPerTaxpayer={
              submission.costPerTaxpayer
                ? parseFloat(submission.costPerTaxpayer)
                : undefined
            }
            variant="compact"
            className="h-auto min-h-0 min-w-0 rounded-full border-none bg-transparent px-3 py-1.5 text-xs font-medium text-text-muted shadow-none hover:bg-surface-elevated hover:text-text-secondary"
          />
        </div>
      </div>
    </motion.article>
  );
}
