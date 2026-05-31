'use client';

// ============================================================
//  ImageUpload — reusable Cloudinary upload component.
//  Supports drag-drop or click-to-browse.
//  Calls POST /api/media and returns the cloudinaryUrl.
// ============================================================

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { adminMedia } from '@/lib/admin-api';
import { cn } from '@/lib/utils';
import { useToast } from './toast';

interface ImageUploadProps {
  value?: string | null;       // current URL (existing value)
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  accept = 'image/*',
}: ImageUploadProps) {
  const { error: toastError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const media = await adminMedia.upload(file, file.name);
        onChange(media.cloudinaryUrl);
      } catch (err) {
        toastError(
          err instanceof Error ? err.message : 'Upload failed. Try again.',
        );
      } finally {
        setUploading(false);
      }
    },
    [onChange, toastError],
  );

  function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
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

      {value ? (
        // Preview with remove button
        <div className="relative w-full rounded-[10px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Upload preview"
            className="w-full max-h-48 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full grid place-items-center transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff' }}
            aria-label="Remove image"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ) : (
        // Drop zone
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image — click or drag and drop"
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 py-10',
            'rounded-[10px] border-2 border-dashed cursor-pointer',
            'transition-colors duration-150',
            dragOver && 'bg-[var(--accent-dim)]',
          )}
          style={{
            borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
            backgroundColor: dragOver ? 'var(--accent-dim)' : 'var(--surface-2)',
          }}
          onClick={() => !uploading && inputRef.current?.click()}
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
          {uploading ? (
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: 'var(--accent)' }}
              aria-label="Uploading…"
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── MultiImageUpload ──────────────────────────────────────────
// For project screenshots (array of {url, alt})

import type { MediaItem } from '@/lib/types';

interface MultiImageUploadProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  label?: string;
}

export function MultiImageUpload({ value, onChange, label }: MultiImageUploadProps) {
  const { error: toastError } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map((f) => adminMedia.upload(f, f.name)),
      );
      const newItems: MediaItem[] = results.map((r) => ({
        url: r.cloudinaryUrl,
        alt: r.alt ?? '',
      }));
      onChange([...value, ...newItems]);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
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

      {/* Thumbnails grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((item, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div
                className="relative rounded-[8px] overflow-hidden border"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt || `Screenshot ${i + 1}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full grid place-items-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff' }}
                  aria-label={`Remove screenshot ${i + 1}`}
                >
                  <X size={10} aria-hidden="true" />
                </button>
              </div>
              <input
                type="text"
                value={item.alt}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="Alt text…"
                className="px-2 py-1 rounded-[6px] border text-[11px] outline-none focus:border-[var(--accent)]"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
                aria-label={`Alt text for screenshot ${i + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
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
        aria-label="Upload screenshots"
      >
        {uploading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <ImageIcon size={16} aria-hidden="true" />
        )}
        <span className="text-[13px] font-medium">
          {uploading ? 'Uploading…' : 'Add screenshots'}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
