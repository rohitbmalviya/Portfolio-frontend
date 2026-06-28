'use client';

// ============================================================
//  Admin Media Library — VIEW ONLY
//  - Images grouped by category into sections
//  - Per-group ScreenshotLightbox (click to zoom, ◀/▶ within group)
//  - Copy-URL utility (no server mutation)
//  No upload / update / delete — images are managed in their own
//  forms (project screenshots, blog cover, award photo, og-image).
// ============================================================

import { useEffect, useState } from 'react';
import { Copy, Image, Check } from 'lucide-react';
import { adminMedia, type MediaRecord } from '@/lib/admin-api';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { LoadingRows, EmptyState } from '@/components/admin/ui';
import {
  ScreenshotLightbox,
  LightboxTrigger,
} from '@/components/projects/screenshot-lightbox';
import { formatBlogDate } from '@/lib/utils';
import { getConfigOptions } from '@/lib/api';
import { MEDIA_CATEGORY_LABELS } from '@/lib/media';

// ── Category section order ────────────────────────────────────

// Fallback grouping order — used when the config API returns nothing.
const CATEGORIES = MEDIA_CATEGORY_LABELS;

/**
 * Groups media by category and orders groups by `categoryOrder`.
 * Any category not in the order list is appended alphabetically.
 */
function groupMedia(
  items: MediaRecord[],
  categoryOrder: readonly string[],
): [string, MediaRecord[]][] {
  const presetSet = new Set<string>(categoryOrder);
  const map = new Map<string, MediaRecord[]>();
  for (const item of items) {
    const cat = item.category ?? 'Misc';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }

  const result: [string, MediaRecord[]][] = [];
  for (const cat of categoryOrder) {
    if (map.has(cat)) result.push([cat, map.get(cat)!]);
  }
  const extras = [...map.keys()]
    .filter((k) => !presetSet.has(k))
    .sort((a, b) => a.localeCompare(b));
  for (const cat of extras) result.push([cat, map.get(cat)!]);

  return result;
}

// ── Main component ────────────────────────────────────────────

function MediaContent() {
  const { error: toastError, info } = useToast();
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Category order driven from config API; falls back to the hardcoded CATEGORIES constant.
  const [categoryOrder, setCategoryOrder] = useState<readonly string[]>(CATEGORIES);

  useEffect(() => {
    setLoading(true);
    adminMedia
      .list()
      .then((data) =>
        setMedia(
          [...data].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        ),
      )
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load media.'),
      )
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load category order from config; fall back to the hardcoded CATEGORIES constant.
  useEffect(() => {
    getConfigOptions('media_categories').then((opts) => {
      if (opts.length > 0) setCategoryOrder(opts.map((o) => o.value));
    });
  }, []);

  async function copyUrl(item: MediaRecord) {
    try {
      await navigator.clipboard.writeText(item.cloudinaryUrl);
      setCopiedId(item.id);
      info('URL copied to clipboard.');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toastError('Failed to copy. Select and copy the URL manually.');
    }
  }

  const groups = groupMedia(media, categoryOrder);

  return (
    <AdminShell
      title="Media Library"
      description="Browse all uploaded images, grouped by category. View only — images are managed in their own forms."
    >
      {loading ? (
        <LoadingRows rows={3} />
      ) : media.length === 0 ? (
        <EmptyState
          icon={<Image size={20} />}
          title="No media yet"
          description="Images you upload in projects, blog posts, achievements, and og-image fields will appear here — grouped by category."
        />
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(([category, items]) => {
            const lightboxImages = items.map((m) => ({
              url: m.cloudinaryUrl,
              alt: m.alt ?? '',
            }));

            return (
              <section key={category} aria-labelledby={`cat-heading-${category}`}>
                {/* Category heading */}
                <div className="flex items-center gap-2 mb-3">
                  <h2
                    id={`cat-heading-${category}`}
                    className="text-[12px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--muted)' }}
                  >
                    {category}
                  </h2>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      color: 'var(--muted)',
                    }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Per-group lightbox wraps the grid */}
                <ScreenshotLightbox screenshots={lightboxImages}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {items.map((item, indexInGroup) => (
                      <div
                        key={item.id}
                        className="group rounded-[10px] overflow-hidden border"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--surface)',
                        }}
                      >
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.cloudinaryUrl}
                            alt={item.alt ?? 'Uploaded media'}
                            className="w-full h-32 object-cover block"
                            loading="lazy"
                            width={item.width ?? 300}
                            height={item.height ?? 128}
                          />

                          <LightboxTrigger
                            index={indexInGroup}
                            className="absolute inset-0 cursor-zoom-in"
                            ariaLabel={`Zoom: ${item.alt ?? 'image'}`}
                          />

                          {/* Hover overlay — copy URL only (pointer-events:none
                              passes clicks to the zoom trigger; the button opts in) */}
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              pointerEvents: 'none',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => copyUrl(item)}
                              className="w-8 h-8 rounded-full grid place-items-center"
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                pointerEvents: 'auto',
                              }}
                              aria-label="Copy image URL"
                              title="Copy URL"
                            >
                              {copiedId === item.id ? (
                                <Check size={14} aria-hidden="true" />
                              ) : (
                                <Copy size={14} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Card footer — metadata only (no controls) */}
                        <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <p
                            className="text-[11px] truncate font-mono"
                            style={{ color: 'var(--muted)' }}
                            title={item.alt ?? item.publicId}
                          >
                            {item.alt ?? item.publicId}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                            {item.width && item.height
                              ? `${item.width}×${item.height} · `
                              : ''}
                            {formatBlogDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScreenshotLightbox>
              </section>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminMediaPage() {
  return (
    <ToastProvider>
      <MediaContent />
    </ToastProvider>
  );
}
