// ============================================================
//  CtaSection — full-width call-to-action block. Server component.
// ============================================================

import { LinkButton } from '@/components/ui/button';
import type { CtaData } from '@/lib/types';

interface CtaSectionProps {
  data: CtaData;
}

export function CtaSection({ data }: CtaSectionProps) {
  return (
    <section className="py-16" aria-labelledby="cta-heading">
      <div className="wrap">
        <div className="bg-[--surface] border border-[--border] rounded-[16px] px-8 py-10 text-center max-w-[600px] mx-auto">
          <h2
            id="cta-heading"
            className="font-display font-bold text-[24px] tracking-[-0.5px] text-[--text] mb-3"
          >
            {data.heading}
          </h2>
          {data.text && (
            <p className="text-[--muted] text-[16px] mb-6 leading-relaxed">{data.text}</p>
          )}
          {data.button && (
            <LinkButton href={data.button.href} variant="primary">
              {data.button.label}
            </LinkButton>
          )}
        </div>
      </div>
    </section>
  );
}
