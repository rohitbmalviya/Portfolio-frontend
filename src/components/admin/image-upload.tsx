'use client';

// ============================================================
//  ImageUpload — deferred-upload components.
//  Images are NOT uploaded on file-pick — they're held as
//  local objectURL previews and uploaded on Save by the form.
//  The form's Save handler calls reconcileMultiMedia /
//  reconcileSingleMedia from src/lib/media-save.ts.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  X,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { MediaCategory } from '@/lib/media';
import { cn } from '@/lib/utils';
import { useToast } from './toast';

// ── Value union ────────────────────────────────────────────────

/**
 * Represents a single image slot in a form field.
 *
 * - **Existing**: already in Cloudinary — has `mediaId` + a Cloudinary URL.
 * - **Pending**: user picked a local file — has `file` + an objectURL preview.
 *   The file is uploaded to Cloudinary only when the form is saved.
 */
export type ImageValue =
  | { mediaId: string; url: string; alt?: string }  // existing (Cloudinary)
  | { file: File; url: string; alt?: string };       // pending  (local objectURL)

// ── ImageUpload (single) ──────────────────────────────────────

interface ImageUploadProps {
  value?: ImageValue | null;
  onChange: (value: ImageValue | null) => void;
  label?: string;
  hint?: string;
  accept?: string;
  /** Routing metadata — passed through to the save step via category prop. */
  category?: MediaCategory;
  /** Used as the Cloudinary folder slug for Projects / Blogs. */
  entitySlug?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  accept = 'image/*',
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track the objectURL this component instance created so we can revoke it.
  const ownUrlRef = useRef<string | null>(null);

  // When value is cleared or replaced with an existing item, revoke any
  // objectURL we hold (the pending arm is gone).
  useEffect(() => {
    if (!value || !('file' in value)) {
      if (ownUrlRef.current) {
        URL.revokeObjectURL(ownUrlRef.current);
        ownUrlRef.current = null;
      }
    }
  }, [value]);

  // Revoke on unmount.
  useEffect(() => {
    return () => {
      if (ownUrlRef.current) {
        URL.revokeObjectURL(ownUrlRef.current);
        ownUrlRef.current = null;
      }
    };
  }, []);

  function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    // Revoke the previous objectURL (if any) before creating a new one.
    if (ownUrlRef.current) {
      URL.revokeObjectURL(ownUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(files[0]);
    ownUrlRef.current = objectUrl;
    onChange({ file: files[0], url: objectUrl });
    // Reset so the same file can be re-picked.
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove() {
    // Revoke if we own this objectURL.
    if (value && 'file' in value && ownUrlRef.current) {
      URL.revokeObjectURL(ownUrlRef.current);
      ownUrlRef.current = null;
    }
    onChange(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </span>
      )}

      {value?.url ? (
        // ── Preview state ─────────────────────────────────────
        <div
          className="relative w-full rounded-[10px] overflow-hidden border"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt="Upload preview"
            className="w-full max-h-48 object-cover cursor-zoom-in"
            onClick={() => setZoomed(true)}
          />
          {/* Pending badge */}
          {'file' in value && (
            <span
              className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Pending — saved on submit
            </span>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full grid place-items-center transition-colors"
            style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
            aria-label="Remove image"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ) : (
        // ── Drop zone ─────────────────────────────────────────
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image — click or drag and drop"
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 py-10',
            'rounded-[10px] border-2 border-dashed cursor-pointer',
            'transition-colors duration-150',
          )}
          style={{
            borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
            backgroundColor: dragOver ? 'var(--accent-dim)' : 'var(--surface-2)',
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()
          }
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => handleFile(e.target.files)}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            className="w-11 h-11 rounded-[10px] grid place-items-center border"
            style={{
              backgroundColor: 'var(--accent-dim)',
              borderColor: 'var(--accent)',
            }}
            aria-hidden="true"
          >
            <Upload size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
              Drop image here or{' '}
              <span style={{ color: 'var(--accent)' }}>browse</span>
            </p>
            {hint && (
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
                {hint}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lightbox — full-size preview */}
      {zoomed && value?.url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--overlay-scrim)' }}
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt="Full preview"
            className="max-w-full max-h-full object-contain rounded-[8px]"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center"
            style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
            aria-label="Close preview"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── MultiImageUpload ──────────────────────────────────────────
// Used for project screenshots and blog images.
// Never uploads — appends { file, url: objectURL } on pick.
// The form's Save handler calls reconcileMultiMedia.

interface MultiImageUploadProps {
  value: ImageValue[];
  onChange: (items: ImageValue[]) => void;
  label?: string;
  /** Max images allowed. Upload button is hidden when reached. Default 4. */
  max?: number;
  /** Routing metadata — passed through to the save step. */
  category?: MediaCategory;
  entitySlug?: string;
}

export function MultiImageUpload({
  value,
  onChange,
  label,
  max = 4,
}: MultiImageUploadProps) {
  const { error: toastError } = useToast();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track all objectURLs this component instance created so we can revoke them.
  const ownUrlsRef = useRef<Set<string>>(new Set());

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + value.length) % value.length)),
    [value.length],
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % value.length)),
    [value.length],
  );

  // Revoke objectURLs for items that have been removed from value by the parent
  // (e.g. after a successful save replaces pending items with existing ones).
  const prevValueRef = useRef<ImageValue[]>(value);
  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    for (const item of prev) {
      if ('file' in item && ownUrlsRef.current.has(item.url)) {
        const stillPresent = value.some((v) => 'file' in v && v.url === item.url);
        if (!stillPresent) {
          URL.revokeObjectURL(item.url);
          ownUrlsRef.current.delete(item.url);
        }
      }
    }
  }, [value]);

  // Revoke all on unmount. Capture the ref value so it's stable in cleanup.
  useEffect(() => {
    const urls = ownUrlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  // Keyboard navigation in lightbox.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const atMax = value.length >= max;

  function handleFiles(files: FileList) {
    if (atMax) {
      toastError(`Maximum ${max} images allowed.`);
      return;
    }
    const remaining = max - value.length;
    const fileArray = Array.from(files).slice(0, remaining);
    const newItems: ImageValue[] = fileArray.map((f) => {
      const url = URL.createObjectURL(f);
      ownUrlsRef.current.add(url);
      return { file: f, url };
    });
    onChange([...value, ...newItems]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeItem(index: number) {
    const item = value[index];
    if ('file' in item && ownUrlsRef.current.has(item.url)) {
      URL.revokeObjectURL(item.url);
      ownUrlsRef.current.delete(item.url);
    }
    // Clamp lightbox index after removal
    if (lightboxIndex !== null) {
      if (value.length - 1 === 0) setLightboxIndex(null);
      else if (lightboxIndex >= value.length - 1) setLightboxIndex(value.length - 2);
    }
    onChange(value.filter((_, i) => i !== index));
  }

  function moveItem(from: number, direction: -1 | 1) {
    const to = from + direction;
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }

  function updateAlt(index: number, alt: string) {
    const next = [...value];
    next[index] = { ...next[index], alt };
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </span>
      )}

      {/* Thumbnails grid — 2 per row */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {value.map((item, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div
                className="relative aspect-video rounded-[8px] overflow-hidden border cursor-zoom-in group"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => setLightboxIndex(i)}
                role="button"
                tabIndex={0}
                aria-label={`View image ${i + 1} full size`}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setLightboxIndex(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt ?? `Image ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />

                {/* Pending badge */}
                {'file' in item && (
                  <span
                    className="absolute bottom-1 left-1 text-[9px] px-1 py-0.5 rounded font-medium leading-none pointer-events-none"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                    aria-hidden="true"
                  >
                    Pending
                  </span>
                )}

                {/* Reorder buttons — visible on hover */}
                <div className="absolute top-1 left-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(i, -1); }}
                    disabled={i === 0}
                    className="w-5 h-5 rounded grid place-items-center disabled:opacity-30"
                    style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
                    aria-label={`Move image ${i + 1} earlier`}
                  >
                    <ArrowUp size={10} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(i, 1); }}
                    disabled={i === value.length - 1}
                    className="w-5 h-5 rounded grid place-items-center disabled:opacity-30"
                    style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
                    aria-label={`Move image ${i + 1} later`}
                  >
                    <ArrowDown size={10} aria-hidden="true" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full grid place-items-center"
                  style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>

              {/* Alt text */}
              <input
                type="text"
                value={item.alt ?? ''}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="Alt text…"
                className="px-2 py-1 rounded-[6px] border text-[11px] outline-none focus:border-[var(--accent)]"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
                aria-label={`Alt text for image ${i + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload button / max reached message */}
      {atMax ? (
        <p className="text-[12px] text-center py-2" style={{ color: 'var(--muted)' }}>
          Maximum {max} image{max !== 1 ? 's' : ''} reached
        </p>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 rounded-[10px] border-2 border-dashed transition-colors duration-150"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--muted)',
            backgroundColor: 'var(--surface-2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--muted)';
          }}
          aria-label="Upload images"
        >
          <ImageIcon size={16} aria-hidden="true" />
          <span className="text-[13px] font-medium">Add images (max {max})</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Lightbox — full-size preview with prev/next */}
      {lightboxIndex !== null && value[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--overlay-scrim)' }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value[lightboxIndex].url}
            alt={value[lightboxIndex].alt ?? `Image ${lightboxIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-[8px]"
            onClick={(e) => e.stopPropagation()}
          />

          {value.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center"
                style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center"
                style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
                aria-label="Next image"
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
              <div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[12px]"
                style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
              >
                {lightboxIndex + 1} / {value.length}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center"
            style={{ backgroundColor: 'var(--overlay-btn)', color: '#fff' }}
            aria-label="Close preview"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
