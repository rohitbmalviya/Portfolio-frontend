// ============================================================
//  AchievementDetail — detail view for a single Achievement.
//  Design language matches ProjectDetail / BlogDetail:
//    back link · image/icon header · title/date · description.
//  Uses ScreenshotLightbox for the award image when present.
//  Server component.
// ============================================================

import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { ScreenshotLightbox, LightboxTrigger } from '@/components/projects/screenshot-lightbox';
import type { Achievement } from '@/lib/types';

export function AchievementDetail({ item }: { item: Achievement }) {
  const year = item.date ? new Date(item.date).getFullYear() : null;
  const lightboxImages = item.image ? [{ url: item.image, alt: item.title }] : [];

  return (
    <div className="py-12">
      <ScreenshotLightbox screenshots={lightboxImages}>
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
          {/* Image / icon */}
          <div className="mb-6">
            {item.image ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] rounded-[14px] object-cover border border-[--border]"
                />
                <LightboxTrigger
                  index={0}
                  ariaLabel={`View ${item.title} photo full size`}
                  className="absolute inset-0 rounded-[14px] cursor-zoom-in transition-colors hover:bg-black/10"
                />
              </div>
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-[14px] border border-[--border] bg-[--accent-dim] flex items-center justify-center text-[--accent]"
                aria-hidden="true"
              >
                <Trophy size={28} />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-[clamp(24px,4vw,38px)] leading-[1.1] tracking-[-1px] text-[--text] mb-3">
            {item.title}
          </h1>

          {/* Date */}
          {year !== null && (
            <div className="flex items-center gap-2 font-mono text-[13px] text-[--muted] pb-6 border-b border-[--border]">
              <span className="text-[--accent] font-semibold">{year}</span>
            </div>
          )}
        </div>

        {/* ── DESCRIPTION ──────────────────────────────────── */}
        <section aria-labelledby="description-heading" className="max-w-[640px]">
          <h2
            id="description-heading"
            className="font-display font-semibold text-[20px] text-[--text] mb-4 pb-3 border-b border-[--border] tracking-[-0.3px]"
          >
            About this achievement
          </h2>
          <p className="text-[--muted] text-[16px] leading-[1.75]">{item.description}</p>
        </section>
      </div>
      </ScreenshotLightbox>
    </div>
  );
}
