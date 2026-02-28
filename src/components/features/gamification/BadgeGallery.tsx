'use client';

import { Shield, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MVP_BADGES } from '@/lib/gamification/xp-config';

interface EarnedBadge {
  slug: string;
  name: string;
  description: string;
  category: string;
  earnedAt: string;
}

interface BadgeGalleryProps {
  earnedBadges: EarnedBadge[];
}

const CATEGORY_LABELS: Record<string, string> = {
  contribution: 'Contribution',
  quality: 'Qualite',
  streak: 'Serie',
  social: 'Social',
  moderation: 'Moderation',
  code: 'Code',
  special: 'Special',
};

export function BadgeGallery({ earnedBadges }: BadgeGalleryProps) {
  const earnedSlugs = new Set(earnedBadges.map((b) => b.slug));

  const badgesByCategory = MVP_BADGES.reduce(
    (acc, badge) => {
      const cat = badge.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({
        ...badge,
        earned: earnedSlugs.has(badge.slug),
        earnedAt: earnedBadges.find((b) => b.slug === badge.slug)?.earnedAt,
      });
      return acc;
    },
    {} as Record<string, Array<typeof MVP_BADGES[number] & { earned: boolean; earnedAt?: string }>>,
  );

  return (
    <Card className="border-border-default bg-surface-secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display text-text-primary">
          Badges ({earnedBadges.length}/{MVP_BADGES.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(badgesByCategory).map(([category, badges]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {badges.map((badge) => (
                <div
                  key={badge.slug}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                    badge.earned
                      ? 'border-chainsaw-red/30 bg-chainsaw-red/5'
                      : 'border-border-default bg-surface-elevated opacity-50'
                  }`}
                  title={badge.description}
                >
                  {badge.earned ? (
                    <Shield className="mt-0.5 size-4 shrink-0 text-chainsaw-red" />
                  ) : (
                    <Lock className="mt-0.5 size-4 shrink-0 text-text-muted" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${badge.earned ? 'text-text-primary' : 'text-text-muted'}`}>
                      {badge.name}
                    </p>
                    <p className="text-[10px] text-text-muted line-clamp-2">
                      {badge.description}
                    </p>
                    {badge.earned && badge.earnedAt && (
                      <p className="mt-0.5 text-[10px] text-text-muted">
                        {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
