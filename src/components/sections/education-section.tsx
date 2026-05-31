// ============================================================
//  EducationSection — inline items from section data.
//  Server component.
// ============================================================

import { GraduationCap } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import type { EducationData } from '@/lib/types';

interface EducationSectionProps {
  data: EducationData;
  sectionNumber?: string;
}

export function EducationSection({ data, sectionNumber }: EducationSectionProps) {
  return (
    <section className="py-16" id="education" aria-labelledby="education-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Education'} />
        <div className="space-y-4 max-w-[640px]">
          {(data.items ?? []).map((item, i) => (
            <div
              key={i}
              className="bg-[--surface] border border-[--border] rounded-[14px] p-5 flex gap-4"
            >
              <div className="w-9 h-9 shrink-0 rounded-[10px] bg-[--accent-dim] flex items-center justify-center text-[--accent]">
                <GraduationCap size={16} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-[17px] text-[--text] mb-1">{item.degree}</h3>
                <p className="text-[--muted] text-[14px]">{item.school}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="font-mono text-[12px] text-[--accent]">{item.period}</span>
                  {item.detail && (
                    <>
                      <span className="text-[--border]">·</span>
                      <span className="text-[13px] text-[--muted]">{item.detail}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
