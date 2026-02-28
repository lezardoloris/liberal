'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PrivacySettings {
  showXpPublicly: boolean;
  showLevelPublicly: boolean;
  showStreakPublicly: boolean;
  showBadgesPublicly: boolean;
  leagueOptOut: boolean;
}

const SETTINGS_CONFIG = [
  { key: 'showXpPublicly' as const, label: 'XP total', description: 'Afficher vos points XP sur votre profil public' },
  { key: 'showLevelPublicly' as const, label: 'Niveau', description: 'Afficher votre niveau et titre sur votre profil public' },
  { key: 'showStreakPublicly' as const, label: 'Serie', description: 'Afficher votre serie de jours sur votre profil public' },
  { key: 'showBadgesPublicly' as const, label: 'Badges', description: 'Afficher vos badges sur votre profil public' },
  { key: 'leagueOptOut' as const, label: 'Masquer classement', description: 'Ne pas apparaitre dans le classement public' },
];

export function PrivacyControls() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gamification/privacy')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setSettings(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    if (!settings) return;

    const prev = { ...settings };
    setSettings({ ...settings, [key]: value });

    try {
      const res = await fetch('/api/gamification/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) {
        setSettings(prev);
        toast.error('Erreur lors de la mise a jour');
      }
    } catch {
      setSettings(prev);
      toast.error('Erreur lors de la mise a jour');
    }
  };

  if (loading || !settings) {
    return (
      <Card className="border-border-default bg-surface-secondary">
        <CardContent className="py-6">
          <div className="h-40 animate-pulse rounded bg-surface-elevated" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border-default bg-surface-secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-text-primary font-display text-base">
          Confidentialite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SETTINGS_CONFIG.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label htmlFor={key} className="text-text-primary text-sm font-medium">
                {label}
              </label>
              <p className="text-text-muted text-xs">{description}</p>
            </div>
            <button
              id={key}
              role="switch"
              type="button"
              aria-checked={settings[key]}
              onClick={() => updateSetting(key, !settings[key])}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                settings[key] ? 'bg-chainsaw-red' : 'bg-surface-elevated',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform',
                  settings[key] ? 'translate-x-[18px]' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
