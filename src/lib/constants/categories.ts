import {
  Landmark, Palette, FlaskConical, MapPin, Factory,
  Monitor, Shield, Briefcase, Leaf, Wheat,
  Building2, Heart, Zap, Train, GraduationCap, Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryDef {
  slug: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: 'Institutions', label: 'Institutions', icon: Landmark, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Culture', label: 'Culture', icon: Palette, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Recherche', label: 'Recherche', icon: FlaskConical, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Aménagement', label: 'Amenagement', icon: MapPin, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Industrie', label: 'Industrie', icon: Factory, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Numérique', label: 'Numerique', icon: Monitor, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Défense', label: 'Defense', icon: Shield, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Travail', label: 'Travail', icon: Briefcase, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Environnement', label: 'Environnement', icon: Leaf, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Agriculture', label: 'Agriculture', icon: Wheat, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Collectivités', label: 'Collectivites', icon: Building2, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Social', label: 'Social', icon: Heart, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Énergie', label: 'Energie', icon: Zap, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Transport', label: 'Transport', icon: Train, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Éducation', label: 'Education', icon: GraduationCap, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
  { slug: 'Santé', label: 'Sante', icon: Stethoscope, color: 'text-text-muted', bgColor: 'bg-surface-elevated' },
];

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategoryDef(slug: string | null): CategoryDef | null {
  if (!slug) return null;
  return CATEGORY_MAP.get(slug) ?? null;
}
