// ============================================================
//  GallerySection — image grid. Server component.
// ============================================================

import Image from 'next/image';
import { SectionHeading } from '@/components/ui/section-heading';
import type { GalleryData } from '@/lib/types';

interface GallerySectionProps {
  data: GalleryData;
  sectionNumber?: string;
}

export function GallerySection({ data, sectionNumber }: GallerySectionProps) {
  if (!data.images || data.images.length === 0) return null;

  return (
    <section className="py-16" aria-labelledby={data.heading ? 'gallery-heading' : undefined}>
      <div className="wrap">
        {data.heading && (
          <SectionHeading number={sectionNumber} title={data.heading} />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-video rounded-[12px] overflow-hidden border border-[--border]"
            >
              <Image
                src={img.url}
                alt={img.alt ?? ''}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
