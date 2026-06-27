// ============================================================
//  AchievementsSection — awards and recognitions.
//  Server component.
// ============================================================

import { Trophy } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScreenshotLightbox, LightboxTrigger } from '@/components/projects/screenshot-lightbox';
import { getAchievements } from '@/lib/api';
import { FALLBACK_ACHIEVEMENTS } from '@/lib/fallback-data';
import type { AchievementsData } from '@/lib/types';

interface AchievementsSectionProps {
  data: AchievementsData;
  sectionNumber?: string;
}

export async function AchievementsSection({ data, sectionNumber }: AchievementsSectionProps) {
  const fetched = await getAchievements();
  const all = fetched.length > 0 ? fetched : FALLBACK_ACHIEVEMENTS;

  // Honor selection filter; default (mode absent or 'all') = show everything
  const achievements =
    data.mode === 'selected' && data.ids && data.ids.length > 0
      ? (() => { const idSet = new Set(data.ids); return all.filter((a) => idSet.has(a.id)); })()
      : all;

  // All award photos → one shared lightbox (click any to zoom, ◀/▶ across them)
  const lightboxImages = achievements
    .filter((a) => a.image)
    .map((a) => ({ url: a.image as string, alt: a.title }));
  const imageUrls = lightboxImages.map((i) => i.url);

  return (
    <section className="py-16" id="achievements" aria-labelledby="achievements-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Achievements'} />

        <ScreenshotLightbox screenshots={lightboxImages}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[900px]">
          {achievements.map((item) => {
            const year = item.date ? new Date(item.date).getFullYear() : null;
            return (
              <div
                key={item.id}
                className="bg-[--surface] border border-[--border] rounded-[14px] p-5 flex flex-col gap-3"
              >
                {/* Award image (if present) or icon */}
                {item.image ? (
                  <div className="relative w-10 h-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-[10px] object-cover border border-[--border]"
                    />
                    <LightboxTrigger
                      index={imageUrls.indexOf(item.image)}
                      ariaLabel={`View ${item.title} photo full size`}
                      className="absolute inset-0 rounded-[10px] cursor-zoom-in transition-colors hover:bg-black/10"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-[10px] bg-[--accent-dim] flex items-center justify-center text-[--accent]">
                    <Trophy size={16} aria-hidden={true} />
                  </div>
                )}
                <div>
                  <h3 className="font-display font-semibold text-[16px] text-[--text] mb-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[--muted] text-[13px] leading-[1.55]">{item.description}</p>
                  {year !== null && (
                    <p className="font-mono text-[11px] text-[--accent] mt-2">{year}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </ScreenshotLightbox>
      </div>
    </section>
  );
}
