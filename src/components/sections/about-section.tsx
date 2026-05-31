// ============================================================
//  AboutSection — about paragraphs. Server component.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import type { AboutData } from '@/lib/types';

interface AboutSectionProps {
  data: AboutData;
  sectionNumber?: string;
}

export function AboutSection({ data, sectionNumber }: AboutSectionProps) {
  return (
    <section className="py-16" id="about" aria-labelledby="about-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'About'} />
        <div className="max-w-[680px] space-y-4">
          {(data.paragraphs ?? []).map((para, i) => (
            <p key={i} className="text-[--muted] text-[16px] leading-[1.7]">
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
