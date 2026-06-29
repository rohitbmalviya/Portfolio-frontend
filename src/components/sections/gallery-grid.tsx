'use client';

// ============================================================
//  GalleryGrid — client child of GallerySection.
//  Wraps the image grid in ScreenshotLightbox so clicking
//  any thumbnail opens the shared fullscreen viewer.
// ============================================================

import Image from 'next/image';
import type { GalleryData } from '@/lib/types';
import {
  ScreenshotLightbox,
  LightboxTrigger,
} from '@/components/projects/screenshot-lightbox';

interface GalleryGridProps {
  images: GalleryData['images'];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  return (
    <ScreenshotLightbox screenshots={images}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, i) => (
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
            <LightboxTrigger
              index={i}
              className="absolute inset-0 cursor-zoom-in"
              ariaLabel={
                img.alt
                  ? `View ${img.alt} full screen`
                  : `View image ${i + 1} full screen`
              }
            />
          </div>
        ))}
      </div>
    </ScreenshotLightbox>
  );
}
