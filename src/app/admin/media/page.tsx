'use client';

// ============================================================
//  Admin Media Library
//  - Grid of all uploaded Cloudinary assets
//  - Drag-drop / click upload
//  - Copy URL to clipboard
//  - Delete with confirm
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  Copy,
  Trash2,
  Image,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { adminMedia, type MediaRecord } from '@/lib/admin-api';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';
import { formatBlogDate } from '@/lib/utils';

function MediaContent() {
  const { success, error: toastError, info } = useToast();
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    adminMedia
      .list()
      .then((data) =>
        setMedia([...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )),
      )
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load media.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFiles = useCallback(
    async (files: FileList) => {
      setUploading(true);
      try {
        const results = await Promise.all(
          Array.from(files).map((f) => adminMedia.upload(f, f.name)),
        );
        setMedia((prev) => [...results.reverse(), ...prev]);
        success(`${results.length} file(s) uploaded.`);
      } catch (err) {
        toastError(err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setUploading(false);
      }
    },
    [success, toastError],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminMedia.delete(deleteTarget.id);
      setMedia((p) => p.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Asset deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

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

  return (
    <AdminShell
      title="Media Library"
      description="Cloudinary-hosted images for your portfolio."
      actions={
        <AdminButton onClick={() => inputRef.current?.click()} loading={uploading}>
          <Upload size={14} aria-hidden="true" />
          Upload
        </AdminButton>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="mb-6 rounded-[12px] border-2 border-dashed px-6 py-8 text-center transition-colors duration-150"
        style={{
          borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
          backgroundColor: dragOver ? 'var(--accent-dim)' : 'var(--surface)',
        }}
        aria-label="Drop files here to upload"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} style={{ color: dragOver ? 'var(--accent)' : 'var(--muted)' }} aria-hidden="true" />
            <p className="text-[14px]" style={{ color: dragOver ? 'var(--accent)' : 'var(--text)' }}>
              Drop images here or{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{ color: 'var(--accent)' }}
                className="underline underline-offset-2"
              >
                browse files
              </button>
            </p>
            <p className="text-[12px]" style={{ color: 'var(--muted)' }}>PNG, JPG, WebP · multiple allowed</p>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingRows rows={3} />
      ) : media.length === 0 ? (
        <EmptyState
          icon={<Image size={20} />}
          title="No media uploaded yet"
          description="Upload images to use in projects, blog posts, and more."
          action={
            <AdminButton onClick={() => inputRef.current?.click()}>
              <Upload size={14} /> Upload first image
            </AdminButton>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-[10px] overflow-hidden border transition-colors"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
              }}
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.cloudinaryUrl}
                alt={item.alt ?? 'Uploaded media'}
                className="w-full h-32 object-cover"
                loading="lazy"
                width={item.width ?? 300}
                height={item.height ?? 128}
              />

              {/* Overlay on hover */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
              >
                <button
                  type="button"
                  onClick={() => copyUrl(item)}
                  className="w-8 h-8 rounded-full grid place-items-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                  aria-label="Copy image URL"
                  title="Copy URL"
                >
                  {copiedId === item.id ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <Copy size={14} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="w-8 h-8 rounded-full grid place-items-center transition-colors"
                  style={{ backgroundColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
                  aria-label="Delete image"
                  title="Delete"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Footer info */}
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
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete image"
        description="This will permanently delete the image from Cloudinary. Any references to this image will break."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
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
