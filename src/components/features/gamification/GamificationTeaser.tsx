import Link from 'next/link';
import { Zap, Target, FileText, MessageSquare, Calendar } from 'lucide-react';
import { LEVEL_THRESHOLDS } from '@/lib/gamification/xp-config';

const XP_HIGHLIGHTS = [
  { icon: FileText, label: 'Signalement', xp: '+50 XP', color: 'text-blue-500' },
  { icon: Target, label: 'Source ajoutée', xp: '+20 XP', color: 'text-green-500' },
  { icon: MessageSquare, label: 'Note communauté', xp: '+15 XP', color: 'text-purple-500' },
  { icon: Calendar, label: 'Bonus du jour', xp: '+10 XP', color: 'text-orange-500' },
];

export function GamificationTeaser() {
  const firstLevels = LEVEL_THRESHOLDS.slice(0, 5);

  return (
    <div className="bg-surface-primary border-border-default rounded-2xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-500" />
        <h2 className="text-text-primary text-sm font-semibold">Gagnez de l&apos;XP</h2>
      </div>

      <div className="space-y-2">
        {XP_HIGHLIGHTS.map(({ icon: Icon, label, xp, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-text-secondary text-xs">{label}</span>
            </div>
            <span className="text-text-primary text-xs font-semibold">{xp}</span>
          </div>
        ))}
      </div>

      <div className="border-border-default mt-4 border-t pt-3">
        <p className="text-text-secondary mb-2 text-xs font-medium">Progressez dans les rangs</p>
        <div className="space-y-1">
          {firstLevels.map((lvl) => (
            <div key={lvl.level} className="flex items-center gap-2">
              <span className="bg-drapeau-rouge/10 text-drapeau-rouge flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold">
                {lvl.level}
              </span>
              <span className="text-text-primary text-xs">{lvl.title}</span>
              <span className="text-text-secondary ml-auto text-[10px]">{lvl.minXp.toLocaleString('fr-FR')} XP</span>
            </div>
          ))}
          <p className="text-text-secondary text-center text-[10px] italic">...et 15 rangs de plus</p>
        </div>
      </div>

      <Link
        href="/register"
        className="bg-drapeau-rouge mt-4 block w-full rounded-lg py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        Créer mon compte
      </Link>
    </div>
  );
}
