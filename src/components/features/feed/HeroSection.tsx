'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ChevronDown, PlusCircle, Skull, DollarSign, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactEUR, formatCompactNumber } from '@/lib/utils/format';
import type { PlatformStats } from '@/lib/api/stats';

interface HeroSectionProps {
  stats?: PlatformStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AnimatePresence initial={false}>
      {!collapsed ? (
        <motion.section
          key="hero-expanded"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          aria-label="Présentation de Nicolas Paye"
          className="border-border-default mb-6 overflow-hidden rounded-xl border bg-surface-secondary"
        >
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {/* Top row: headline + collapse */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-text-primary text-2xl leading-tight font-black tracking-tight sm:text-3xl md:text-4xl">
                TRONÇONNONS LES <span className="text-chainsaw-red">DÉPENSES PUBLIQUES.</span>
              </h1>
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Réduire la présentation"
                className="text-text-muted hover:bg-surface-elevated hover:text-text-secondary shrink-0 rounded-md p-1.5 transition-colors"
              >
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* KPI cards — stats page style */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-chainsaw-red/20 bg-chainsaw-red/5 p-3">
                <Skull className="size-4 text-chainsaw-red" aria-hidden="true" />
                <p className="mt-1 font-display text-xl font-black tabular-nums text-chainsaw-red sm:text-2xl">
                  {stats ? formatCompactEUR(stats.totalAmountEur) : '--'}
                </p>
                <p className="text-[10px] text-text-muted sm:text-xs">documentés</p>
              </div>
              <div className="rounded-lg border border-border-default bg-surface-elevated/50 p-3">
                <DollarSign className="size-4 text-text-muted" aria-hidden="true" />
                <p className="mt-1 font-display text-xl font-bold tabular-nums text-text-primary sm:text-2xl">
                  {stats ? formatCompactEUR(stats.costPerTaxpayer) : '--'}
                </p>
                <p className="text-[10px] text-text-muted sm:text-xs">par contribuable</p>
              </div>
              <div className="rounded-lg border border-border-default bg-surface-elevated/50 p-3">
                <FileText className="size-4 text-text-muted" aria-hidden="true" />
                <p className="mt-1 font-display text-xl font-bold tabular-nums text-text-primary sm:text-2xl">
                  {stats ? formatCompactNumber(stats.totalSubmissions) : '--'}
                </p>
                <p className="text-[10px] text-text-muted sm:text-xs">signalements</p>
              </div>
            </div>

            {/* CTA + feedback row */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Link
                href="/submit"
                className={cn(
                  'bg-chainsaw-red inline-flex items-center gap-2 rounded-lg px-4 py-2',
                  'shadow-chainsaw-red/20 text-sm font-semibold text-white shadow-md',
                  'hover:bg-chainsaw-red-hover transition-all duration-200',
                  'focus-visible:ring-chainsaw-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                )}
                id="hero-cta-submit"
              >
                <PlusCircle className="size-4" aria-hidden="true" />
                Signaler une dépense
              </Link>
              <p className="text-text-muted text-xs">
                <a
                  href="https://github.com/lezardoloris/CestNicolasQuiPaye"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary decoration-text-muted/30 hover:text-text-primary font-medium underline"
                >
                  Proposer une amélioration
                </a>
              </p>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="hero-collapsed"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mb-4"
        >
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Déplier la présentation"
            className={cn(
              'border-border-default flex w-full items-center justify-between gap-2 rounded-lg border',
              'bg-surface-secondary text-text-secondary px-4 py-2.5 text-sm',
              'hover:bg-surface-elevated hover:text-text-primary transition-colors',
            )}
          >
            <span className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt=""
                width={120}
                height={20}
                className="h-4 w-auto opacity-60"
              />
              <span className="font-medium">Tronçonnons les dépenses publiques.</span>
              <span className="text-text-muted hidden sm:inline">
                — Chaque euro compte. Chaque citoyen aussi.
              </span>
            </span>
            <ChevronDown
              className="text-text-muted size-4 rotate-180"
              aria-hidden="true"
              style={{ transform: 'rotate(180deg)' }}
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
