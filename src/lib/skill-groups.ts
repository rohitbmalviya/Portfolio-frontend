// ============================================================
//  lib/skill-groups.ts — Canonical skill group order + labels.
//  Single source of truth consumed by the public SkillsSection
//  (offline fallback grouping) and the admin skills CRUD page
//  (group dropdown options). The backend remains authoritative
//  for the live-API order; this mirrors it for offline use.
// ============================================================

import type { SkillGroup } from './types';

/** Canonical display order for all six skill groups. */
export const SKILL_GROUP_ORDER: SkillGroup[] = [
  'LANGUAGES',
  'FRONTEND',
  'BACKEND',
  'DATA',
  'CLOUD_DEVOPS',
  'AI',
];

/** Human-readable labels keyed by SkillGroup. */
export const SKILL_GROUP_LABELS: Record<SkillGroup, string> = {
  LANGUAGES: 'Languages',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATA: 'Data',
  CLOUD_DEVOPS: 'Cloud / DevOps',
  AI: 'AI',
};

/** Derived options array — ready for <select> or dropdown rendering. */
export const SKILL_GROUP_OPTIONS: { value: SkillGroup; label: string }[] =
  SKILL_GROUP_ORDER.map((g) => ({ value: g, label: SKILL_GROUP_LABELS[g] }));
