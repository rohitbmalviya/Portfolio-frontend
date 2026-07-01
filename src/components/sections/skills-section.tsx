// ============================================================
//  SkillsSection — grouped skill chips with Simple Icons.
//  Data source: GET /api/skills/grouped (SkillGroupSection[]).
//  Server component.
//
//  SkillsCards is extracted and exported so ContentBlockSection
//  can reuse the card markup without duplicating it.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import { SectionCta } from '@/components/ui/section-cta';
import { SkillIcon } from '@/components/ui/skill-icon';
import { getSkillsGrouped } from '@/lib/api';
import type { SkillsData, SkillGroupSection } from '@/lib/types';

// ── Cards-only sub-component (reused by ContentBlockSection) ──

interface SkillsCardsProps {
  sections: SkillGroupSection[];
}

export function SkillsCards({ sections }: SkillsCardsProps) {
  return (
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
  );
}

// ── Full section (unchanged rendering) ────────────────────────

interface SkillsSectionProps {
  data: SkillsData;
  sectionNumber?: string;
}

export async function SkillsSection({ data, sectionNumber }: SkillsSectionProps) {
  // Fetch grouped skills from the API; returns [] when the API is unreachable.
  let sections: SkillGroupSection[] = await getSkillsGrouped();

  // Apply per-section-instance selection filter.
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
        {data.heading ? (
          <SectionHeading number={sectionNumber} title={data.heading} />
        ) : null}
        <SkillsCards sections={sections} />

        <SectionCta cta={data.cta} />
      </div>
    </section>
  );
}
