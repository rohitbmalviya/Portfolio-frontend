// ============================================================
//  ExperienceSection — timeline of work experience.
//  Fetches from API or falls back. Server component.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import { getExperience } from '@/lib/api';
import { FALLBACK_EXPERIENCE } from '@/lib/fallback-data';
import { formatDate } from '@/lib/utils';
import type { ExperienceData } from '@/lib/types';

interface ExperienceSectionProps {
  data: ExperienceData;
  sectionNumber?: string;
}

export async function ExperienceSection({ data, sectionNumber }: ExperienceSectionProps) {
  const fetched = await getExperience();
  const experiences = fetched.length > 0 ? fetched : FALLBACK_EXPERIENCE;

  return (
    <section className="py-16" id="experience" aria-labelledby="experience-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Experience'} />

        <div className="space-y-8 max-w-[760px]">
          {experiences.map((exp) => (
            <article
              key={exp.id}
              className="relative pl-6 border-l-2 border-[--border]"
            >
              {/* Dot */}
              <span
                className="absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full bg-[--accent]"
                aria-hidden="true"
              />

              {/* Header */}
              <div className="mb-3">
                <h3 className="font-display font-semibold text-[18px] text-[--text] tracking-[-0.3px]">
                  {exp.role}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="font-mono text-[13px] text-[--accent]">{exp.company}</span>
                  <span className="text-[--border]" aria-hidden="true">·</span>
                  <span className="text-[13px] text-[--muted]">{exp.location}</span>
                  <span className="text-[--border]" aria-hidden="true">·</span>
                  <time className="font-mono text-[12px] text-[--muted]">
                    {formatDate(exp.startDate)} — {exp.endDate === 'Present' ? 'Present' : formatDate(exp.endDate)}
                  </time>
                </div>
              </div>

              {/* Bullets */}
              {exp.bullets.length > 0 && (
                <ul className="space-y-[6px] list-none">
                  {exp.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="text-[14px] text-[--muted] leading-[1.65] flex gap-2"
                    >
                      <span className="text-[--accent] mt-[3px] shrink-0" aria-hidden="true">▸</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
