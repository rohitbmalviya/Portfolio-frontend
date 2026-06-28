'use client';

// ============================================================
//  ScreenshotLightbox — shared client lightbox for the public
//  project detail page. Wrap the screenshot region in
//  <ScreenshotLightbox screenshots={...}> and drop a
//  <LightboxTrigger index={n} /> overlay on each clickable image.
//  Click an image → full-screen preview with ◀ / ▶ + keyboard.
// ============================================================

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/** Minimal shape — structurally satisfied by MediaItem, Project.screenshots items,
 *  BlogPost.images items, and hand-built { url, alt } objects alike. */
type LightboxItem = { url: string; alt?: string };

interface LightboxApi {
  open: (index: number) => void;
  openUrl: (url: string) => void;
}

const LightboxContext = createContext<LightboxApi | null>(null);

export function ScreenshotLightbox({
  screenshots,
  children,
}: {
  screenshots: LightboxItem[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setIndex(i), []);
  const openUrl = useCallback(
    (url: string) => {
      const i = screenshots.findIndex((s) => s.url === url);
      if (i >= 0) setIndex(i);
    },
    [screenshots],
  );
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + screenshots.length) % screenshots.length)),
    [screenshots.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % screenshots.length)),
    [screenshots.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, close, prev, next]);

  const current = index !== null ? screenshots[index] : null;

  return (
    <LightboxContext.Provider value={{ open, openUrl }}>
      {children}

      {current && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--overlay-scrim)' }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.alt ?? 'Screenshot'}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-[8px]"
            onClick={(e) => e.stopPropagation()}
          />

          {screenshots.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center text-white"
                style={{ backgroundColor: 'var(--overlay-btn)' }}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center text-white"
                style={{ backgroundColor: 'var(--overlay-btn)' }}
                aria-label="Next image"
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
              <div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[12px] text-white"
                style={{ backgroundColor: 'var(--overlay-btn)' }}
              >
                {index! + 1} / {screenshots.length}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full grid place-items-center text-white"
            style={{ backgroundColor: 'var(--overlay-btn)' }}
            aria-label="Close preview"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </LightboxContext.Provider>
  );
}

export function LightboxTrigger({
  index,
  className,
  ariaLabel,
}: {
  index: number;
  className?: string;
  ariaLabel?: string;
}) {
  const ctx = useContext(LightboxContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.open(index)}
      className={className}
      aria-label={ariaLabel ?? 'View full image'}
    />
  );
}

// Use as ReactMarkdown's `img` renderer so body images open the lightbox.
export function LightboxImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ctx = useContext(LightboxContext);
  const { src, alt, className, ...rest } = props;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={src}
      alt={alt ?? ''}
      className={`cursor-zoom-in rounded-[8px] ${className ?? ''}`}
      onClick={() => typeof src === 'string' && ctx?.openUrl(src)}
    />
  );
}
