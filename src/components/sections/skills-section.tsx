// ============================================================
//  SkillsSection — grouped skill chips with Simple Icons.
//  Data source: GET /api/skills/grouped (SkillGroupSection[]).
//  The API delivers skills pre-grouped in canonical order with
//  empty groups already omitted and skills sorted by `order`.
//  The per-section selection filter (mode/ids/groups) is applied
//  here on top of the API result.
//  Offline fallback: if getSkillsGrouped() returns [], FALLBACK_SKILLS
//  are shaped into the same SkillGroupSection[] structure locally.
//  Server component.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import { SkillIcon } from '@/components/ui/skill-icon';
import { getSkillsGrouped } from '@/lib/api';
import { FALLBACK_SKILLS } from '@/lib/fallback-data';
import type { SkillsData, Skill, SkillGroup, SkillGroupSection } from '@/lib/types';

// ── Offline fallback helpers ──────────────────────────────────
// Used ONLY when getSkillsGrouped() returns [].
// Mirrors the canonical order the backend uses so the fallback
// rendering is consistent with the live API.

const CANONICAL_ORDER: SkillGroup[] = [
  'LANGUAGES',
  'FRONTEND',
  'BACKEND',
  'DATA',
  'CLOUD_DEVOPS',
  'AI',
];

const CANONICAL_LABELS: Record<SkillGroup, string> = {
  LANGUAGES: 'Languages',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATA: 'Data',
  CLOUD_DEVOPS: 'Cloud / DevOps',
  AI: 'AI',
};

/** Shape FALLBACK_SKILLS into the same SkillGroupSection[] the API would return. */
function groupFallbackSkills(skills: Skill[]): SkillGroupSection[] {
  const map: Record<string, Skill[]> = {};
  for (const s of skills) {
    (map[s.group] ??= []).push(s);
  }
  return CANONICAL_ORDER
    .filter((g) => (map[g]?.length ?? 0) > 0)
    .map((g) => ({
      group: g,
      label: CANONICAL_LABELS[g],
      skills: (map[g] ?? []).sort((a, b) => a.order - b.order),
    }));
}

// ── Component ─────────────────────────────────────────────────

interface SkillsSectionProps {
  data: SkillsData;
  sectionNumber?: string;
}

export async function SkillsSection({ data, sectionNumber }: SkillsSectionProps) {
  // Fetch grouped skills from the API; fall back to local data when offline.
  let sections: SkillGroupSection[] = await getSkillsGrouped();
  if (sections.length === 0) {
    sections = groupFallbackSkills(FALLBACK_SKILLS);
  }

  // Apply per-section-instance selection filter.
  // This is a data.mode concern (set in the CMS section config), not
  // the API's job — the API always returns all skills.
  //
  //   mode === 'selected' + ids   → keep only skills whose id is in the set;
  //                                  drop groups with no remaining skills.
  //   mode === 'selected' + groups (legacy) → keep only the listed groups.
  //   default / 'all'             → show everything.
  if (data.mode === 'selected') {
    if (Array.isArray(data.ids) && data.ids.length > 0) {
      const idSet = new Set(data.ids);
      sections = sections
        .map((sec) => ({ ...sec, skills: sec.skills.filter((s) => idSet.has(s.id)) }))
        .filter((sec) => sec.skills.length > 0);
    } else if (Array.isArray(data.groups) && data.groups.length > 0) {
      const groupSet = new Set(data.groups);
      sections = sections.filter((sec) => groupSet.has(sec.group));
    }
  }

  return (
    <section className="py-16" id="skills" aria-labelledby="skills-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Skills'} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => (
            <div
              key={sec.group}
              className="bg-[--surface] border border-[--border] rounded-[14px] p-5"
            >
              {/* Preserve the existing // LABEL mono heading style using the API label. */}
              <h3 className="font-mono text-[12px] text-[--accent] mb-[14px] tracking-[0.5px]">
                {`// ${sec.label.toUpperCase()}`}
              </h3>
              <div className="flex flex-wrap gap-x-[6px] gap-y-[8px]">
                {sec.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="inline-flex items-center gap-[5px] font-mono text-[13px] text-[--text] bg-[--surface-2] border border-[--border] px-[11px] py-[5px] rounded-[8px]"
                  >
                    <SkillIcon name={skill.name} size={14} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
