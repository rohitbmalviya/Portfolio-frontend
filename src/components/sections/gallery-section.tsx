// ============================================================
//  GallerySection — image grid. Server component.
//  Clicking a thumbnail opens the fullscreen lightbox via
//  the GalleryGrid client child.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import type { GalleryData } from '@/lib/types';
import { GalleryGrid } from './gallery-grid';

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
        <GalleryGrid images={data.images} />
      </div>
    </section>
  );
}
