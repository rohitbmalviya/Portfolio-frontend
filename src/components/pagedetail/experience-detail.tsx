// ============================================================
//  ExperienceDetail — detail view for a single Experience item.
//  Design language matches ProjectDetail / BlogDetail:
//    back link · logo/icon header · role/company/dates · bullets.
//  Server component.
// ============================================================

import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Experience } from '@/lib/types';

export function ExperienceDetail({ item }: { item: Experience }) {
  return (
    <div className="py-12">
      <div className="wrap">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[13px] text-[--muted] hover:text-[--accent] transition-colors duration-150 mb-10"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to home
        </Link>

        {/* ── HEADER ───────────────────────────────────────── */}
        <div className="max-w-[760px] mb-12">
          {/* Logo / icon */}
          <div className="mb-6">
            {item.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.logo}
                alt={`${item.company} logo`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-[12px] border border-[--border] object-contain bg-white/5"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-[12px] border border-[--border] bg-[--accent-dim] flex items-center justify-center text-[--accent]"
                aria-hidden="true"
              >
                <Building2 size={24} />
              </div>
            )}
          </div>

          {/* Role */}
          <h1 className="font-display font-bold text-[clamp(26px,4vw,40px)] leading-[1.1] tracking-[-1px] text-[--text] mb-3">
            {item.role}
          </h1>

          {/* Company · location · dates */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-[--muted] mb-2 pb-6 border-b border-[--border]">
            <span className="text-[--accent] font-semibold">{item.company}</span>
            <span className="text-[--border]" aria-hidden="true">·</span>
            <span>{item.location}</span>
            <span className="text-[--border]" aria-hidden="true">·</span>
            <time>
              {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : 'Present'}
            </time>
          </div>
        </div>

        {/* ── BULLETS ──────────────────────────────────────── */}
        {item.bullets.length > 0 && (
          <section aria-labelledby="responsibilities-heading" className="max-w-[760px]">
            <h2
              id="responsibilities-heading"
              className="font-display font-semibold text-[20px] text-[--text] mb-6 pb-3 border-b border-[--border] tracking-[-0.3px]"
            >
              Responsibilities &amp; Highlights
            </h2>
            <ul className="space-y-4 list-none">
              {item.bullets.map((bullet, i) => (
                <li
                  key={i}
                  className="text-[15px] text-[--muted] leading-[1.7] flex gap-3"
                >
                  <span className="text-[--accent] mt-[4px] shrink-0 text-[12px]" aria-hidden="true">▸</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
