// ============================================================
//  ExperienceSection — timeline of work experience.
//  Fetches from API or falls back. Server component.
// ============================================================

import { Building2 } from 'lucide-react';
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
  const all = fetched.length > 0 ? fetched : FALLBACK_EXPERIENCE;

  // Honor selection filter; default (mode absent or 'all') = show everything
  const experiences =
    data.mode === 'selected' && data.ids && data.ids.length > 0
      ? (() => { const idSet = new Set(data.ids); return all.filter((e) => idSet.has(e.id)); })()
      : all;

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
              {/* Timeline dot — always present */}
              <span
                className="absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full bg-[--accent]"
                aria-hidden="true"
              />

              {/* Header — flex row with optional logo */}
              <div className="mb-3 flex gap-3 items-start">
                {exp.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={exp.logo}
                    alt={`${exp.company} logo`}
                    width={40}
                    height={40}
                    className="w-10 h-10 shrink-0 rounded-[8px] border border-[--border] object-contain bg-white/5 mt-0.5"
                  />
                ) : (
                  <div
                    className="w-10 h-10 shrink-0 rounded-[8px] border border-[--border] bg-[--accent-dim] flex items-center justify-center text-[--accent] mt-0.5"
                    aria-hidden="true"
                  >
                    <Building2 size={18} />
                  </div>
                )}
                <div>
                  <h3 className="font-display font-semibold text-[18px] text-[--text] tracking-[-0.3px]">
                    {exp.role}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="font-mono text-[13px] text-[--accent]">{exp.company}</span>
                    <span className="text-[--border]" aria-hidden="true">·</span>
                    <span className="text-[13px] text-[--muted]">{exp.location}</span>
                    <span className="text-[--border]" aria-hidden="true">·</span>
                    <time className="font-mono text-[12px] text-[--muted]">
                      {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </time>
                  </div>
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
