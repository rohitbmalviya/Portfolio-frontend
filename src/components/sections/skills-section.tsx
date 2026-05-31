// ============================================================
//  SkillsSection — 3-col grid of skill columns.
//  Can render from data.groups (inline) or fallback data.
//  Server component.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import { Chip } from '@/components/ui/tag';
import { getSkills } from '@/lib/api';
import { FALLBACK_SKILLS } from '@/lib/fallback-data';
import { groupBy } from '@/lib/utils';
import type { SkillsData, Skill } from '@/lib/types';

const GROUP_LABELS: Record<string, string> = {
  LANGUAGES: '// LANGUAGES',
  FRONTEND: '// FRONTEND',
  BACKEND: '// BACKEND',
  DATA: '// DATA',
  CLOUD_DEVOPS: '// CLOUD / DEVOPS',
  AI: '// AI / ML',
};

const GROUP_ORDER = ['LANGUAGES', 'FRONTEND', 'BACKEND', 'DATA', 'CLOUD_DEVOPS', 'AI'];

interface SkillsSectionProps {
  data: SkillsData;
  sectionNumber?: string;
}

export async function SkillsSection({ data, sectionNumber }: SkillsSectionProps) {
  // Fetch from API or fall back
  let skills: Skill[] = [];
  if (data.source === 'skills-table' || !data.groups) {
    skills = await getSkills();
    if (skills.length === 0) skills = FALLBACK_SKILLS;
  }

  const grouped =
    data.groups ??
    GROUP_ORDER.map((group) => ({
      label: GROUP_LABELS[group] ?? group,
      items: (groupBy(skills, (s) => s.group)[group] ?? [])
        .sort((a, b) => a.order - b.order)
        .map((s) => s.name),
    })).filter((g) => g.items.length > 0);

  return (
    <section className="py-16" id="skills" aria-labelledby="skills-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Skills'} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grouped.map((col) => (
            <div
              key={col.label}
              className="bg-[--surface] border border-[--border] rounded-[14px] p-5"
            >
              <h3 className="font-mono text-[12px] text-[--accent] mb-[14px] tracking-[0.5px]">
                {col.label}
              </h3>
              <div className="flex flex-wrap gap-x-[6px] gap-y-[8px]">
                {col.items.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
