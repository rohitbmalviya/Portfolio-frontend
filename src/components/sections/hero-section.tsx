// ============================================================
//  HeroSection — matches the sample hero exactly.
//  Server component; buttons are plain <a> tags (no client JS needed).
// ============================================================

import Link from 'next/link';
import type { HeroData } from '@/lib/types';

interface HeroSectionProps {
  data: HeroData;
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <header className="pt-24 pb-[72px]" id="hero">
      <div className="wrap">
        {/* Eyebrow */}
        <p className="font-mono text-[--accent] text-[13px] tracking-[1px] mb-[18px]">
          {data.eyebrow}
        </p>

        {/* H1 */}
        <h1
          className="font-display font-bold leading-[1.05] tracking-[-1.5px]"
          style={{ fontSize: 'clamp(40px, 6vw, 68px)' }}
        >
          {data.name}
          <br />
          <span
            className="bg-gradient-to-r from-[--grad-from] to-[--grad-to] bg-clip-text text-transparent"
          >
            {data.gradientLine}
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-[--muted] text-[19px] max-w-[620px] mt-[22px] leading-relaxed">
          {data.subhead}
        </p>

        {/* CTA buttons */}
        {data.buttons && data.buttons.length > 0 && (
          <div className="flex flex-wrap gap-[14px] mt-[34px]">
            {data.buttons.map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
                target={btn.href.startsWith('http') ? '_blank' : undefined}
                rel={btn.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={
                  btn.style === 'primary'
                    ? [
                        'px-[22px] py-[12px] rounded-[10px] border text-[14px] font-semibold',
                        'bg-[--accent-dim] border-[--accent] text-[--accent]',
                        'transition-all duration-200',
                        'hover:shadow-[0_0_24px_var(--accent-glow)] hover:-translate-y-[2px]',
                      ].join(' ')
                    : [
                        'px-[22px] py-[12px] rounded-[10px] border text-[14px] font-semibold',
                        'bg-transparent border-[--border] text-[--muted]',
                        'transition-all duration-200',
                        'hover:text-[--text] hover:border-[--muted]',
                      ].join(' ')
                }
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}

        {/* Metric strip */}
        {data.metrics && data.metrics.length > 0 && (
          <div className="flex flex-wrap gap-[30px] mt-[46px] border-t border-[--border] pt-6 font-mono text-[13px] text-[--muted]">
            {data.metrics.map((m) => (
              <div key={m.label}>
                <b className="block text-[24px] font-display text-[--text] mb-[2px]">{m.value}</b>
                {m.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
