// ============================================================
//  EducationDetail — detail view for a single Education item.
//  Design language matches ProjectDetail / BlogDetail:
//    back link · logo/icon header · degree/school/period · detail.
//  Server component.
// ============================================================

import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import type { Education } from '@/lib/types';

function yr(d: string): number {
  return new Date(d).getFullYear();
}

function getPeriodText(item: Education): string {
  return `${yr(item.startDate)} – ${item.endDate ? yr(item.endDate) : 'Present'}`;
}

export function EducationDetail({ item }: { item: Education }) {
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
        <div className="max-w-[640px] mb-12">
          {/* Logo / icon */}
          <div className="mb-6">
            {item.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.logo}
                alt={`${item.school} logo`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-[12px] border border-[--border] object-contain bg-white/5"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-[12px] border border-[--border] bg-[--accent-dim] flex items-center justify-center text-[--accent]"
                aria-hidden="true"
              >
                <GraduationCap size={24} />
              </div>
            )}
          </div>

          {/* Degree */}
          <h1 className="font-display font-bold text-[clamp(24px,4vw,38px)] leading-[1.1] tracking-[-1px] text-[--text] mb-3">
            {item.degree}
          </h1>

          {/* School · period · optional detail */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-[--muted] pb-6 border-b border-[--border]">
            <span className="text-[--accent] font-semibold">{item.school}</span>
            <span className="text-[--border]" aria-hidden="true">·</span>
            <time>{getPeriodText(item)}</time>
            {item.detail && (
              <>
                <span className="text-[--border]" aria-hidden="true">·</span>
                <span>{item.detail}</span>
              </>
            )}
          </div>
        </div>

        {/* ── DETAIL ───────────────────────────────────────── */}
        {item.detail && (
          <section aria-labelledby="detail-heading" className="max-w-[640px]">
            <h2
              id="detail-heading"
              className="font-display font-semibold text-[20px] text-[--text] mb-4 pb-3 border-b border-[--border] tracking-[-0.3px]"
            >
              Details
            </h2>
            <p className="text-[--muted] text-[16px] leading-[1.75]">{item.detail}</p>
          </section>
        )}
      </div>
    </div>
  );
}
