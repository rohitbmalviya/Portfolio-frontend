// ============================================================
//  MetricsSection — standalone metric strip. Server component.
// ============================================================

import type { MetricsData } from '@/lib/types';

interface MetricsSectionProps {
  data: MetricsData;
}

export function MetricsSection({ data }: MetricsSectionProps) {
  return (
    <section className="py-12 border-y border-[--border]" aria-label="Key metrics">
      <div className="wrap">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 font-mono text-[13px] text-[--muted]">
          {(data.items ?? []).map((m) => (
            <div key={m.label} className="text-center">
              <b className="block text-[28px] font-display text-[--text] mb-[2px] tracking-[-0.5px]">
                {m.value}
              </b>
              {m.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
