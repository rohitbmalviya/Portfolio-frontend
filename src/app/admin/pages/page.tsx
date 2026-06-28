'use client';

// ============================================================
//  Admin Pages list — shows all pages, links to section editor
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, FileText, Pencil, Plus, Trash2, X, AlertTriangle } from 'lucide-react';
import { adminPages, type CreatePagePayload } from '@/lib/admin-api';
import type { Page } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import {
  AdminButton,
  AdminCard,
  AdminBadge,
  LoadingRows,
  EmptyState,
  ConfirmDialog,
  AdminInput,
  AdminTextarea,
  AdminToggle,
} from '@/components/admin/ui';
import { ImageUpload } from '@/components/admin/image-upload';
import { useToast } from '@/components/admin/toast';
import { ToastProvider } from '@/components/admin/toast';

function PagesContent() {
  const { success, error: toastError } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  // deleteTarget drives both dialogs — rendered differently based on section count
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newMetaTitle, setNewMetaTitle] = useState('');
  const [newMetaDescription, setNewMetaDescription] = useState('');
  const [newOgImage, setNewOgImage] = useState<string | null>(null);
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavOrder, setNewNavOrder] = useState(0);
  const [newShowInNav, setNewShowInNav] = useState(false);
  const [newPublished, setNewPublished] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminPages.list();
      setPages(data);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to load pages.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create ──────────────────────────────────────────────────

  function resetCreateForm() {
    setNewTitle('');
    setNewSlug('');
    setNewMetaTitle('');
    setNewMetaDescription('');
    setNewOgImage(null);
    setNewNavLabel('');
    setNewNavOrder(0);
    setNewShowInNav(false);
    setNewPublished(false);
  }

  /** Open the create modal with navOrder pre-filled to max(existing) + 1 */
  function openCreateModal() {
    const maxOrder = pages.length > 0 ? Math.max(...pages.map((p) => p.navOrder)) : -1;
    setNewNavOrder(maxOrder + 1);
    setShowCreate(true);
  }

  async function handleCreate() {
    if (!newSlug.trim() || !newTitle.trim()) return;
    setCreating(true);
    try {
      const payload: CreatePagePayload = {
        slug: newSlug.trim(),
        title: newTitle.trim(),
        // Omit nullable strings when empty so the backend keeps its own defaults
        ...(newMetaTitle.trim() ? { metaTitle: newMetaTitle.trim() } : {}),
        ...(newMetaDescription.trim() ? { metaDescription: newMetaDescription.trim() } : {}),
        ...(newOgImage ? { ogImage: newOgImage } : {}),
        ...(newNavLabel.trim() ? { navLabel: newNavLabel.trim() } : {}),
        navOrder: newNavOrder,
        showInNav: newShowInNav,
        published: newPublished,
      };
      const page = await adminPages.create(payload);
      setPages((p) => [...p, page]);
      setShowCreate(false);
      resetCreateForm();
      success('Page created.');
    } catch (err) {
      // 409 = duplicate slug/title — backend message shown, form stays open
      toastError(err instanceof Error ? err.message : 'Failed to create page.');
    } finally {
      setCreating(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  // Only called when sections = 0 (has-sections case is blocked by warning dialog)

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminPages.delete(deleteTarget.id);
      setPages((p) => p.filter((x) => x.id !== deleteTarget.id));
      success('Page deleted.');
    } catch (err) {
      // 409 from backend — show its message, keep page in list
      toastError(err instanceof Error ? err.message : 'Failed to delete page.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // Derived: section count from _count (list API returns counts, not full arrays)
  const deleteSectionCount = deleteTarget?._count?.sections ?? 0;
  const deleteTargetHasSections = deleteSectionCount > 0;

  return (
    <AdminShell
      title="Pages & Sections"
      description="Manage pages and their section blocks."
      actions={
        <AdminButton onClick={openCreateModal}>
          <Plus size={14} aria-hidden="true" /> New page
        </AdminButton>
      }
    >
      {loading ? (
        <LoadingRows />
      ) : pages.length === 0 ? (
        <EmptyState
          icon={<FileText size={20} />}
          title="No pages yet"
          description="Create your first page to start building sections."
          action={
            <AdminButton onClick={openCreateModal}>
              <Plus size={14} /> Create page
            </AdminButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pages.map((page) => (
            <AdminCard key={page.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="text-[14px] font-medium hover:text-[var(--accent)] transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {page.title}
                  </Link>
                  {page.published ? (
                    <AdminBadge variant="success">Published</AdminBadge>
                  ) : (
                    <AdminBadge variant="warning">Draft</AdminBadge>
                  )}
                  {page.isSystem && (
                    <AdminBadge variant="accent">System</AdminBadge>
                  )}
                </div>
                <p className="text-[12px] mt-0.5 font-mono" style={{ color: 'var(--muted)' }}>
                  /{page.slug} · {page._count?.sections ?? 0} sections
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${page.title} on public site`}
                >
                  <AdminButton variant="ghost" size="sm" type="button">
                    <ExternalLink size={13} aria-hidden="true" /> View
                  </AdminButton>
                </Link>
                <Link href={`/admin/pages/${page.id}`}>
                  <AdminButton variant="ghost" size="sm" type="button">
                    <Pencil size={13} aria-hidden="true" /> Edit sections
                  </AdminButton>
                </Link>
                {/* System pages must NOT show a Delete button at all */}
                {!page.isSystem && (
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(page)}
                  >
                    <Trash2 size={13} aria-hidden="true" /> Delete
                  </AdminButton>
                )}
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* ── Create modal ──────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => { setShowCreate(false); resetCreateForm(); }}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-[520px] rounded-[16px] border p-6 my-8"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-page-title"
          >
            <h2
              id="create-page-title"
              className="text-[18px] font-semibold mb-5"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
            >
              New Page
            </h2>
            <div className="flex flex-col gap-4">
              {/* Title + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. About"
                  autoFocus
                  required
                />
                <AdminInput
                  label="Slug"
                  value={newSlug}
                  onChange={(e) =>
                    setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                  }
                  placeholder="e.g. about"
                  hint="URL path — no leading slash"
                  required
                />
              </div>

              {/* Nav label + Nav order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Nav label"
                  value={newNavLabel}
                  onChange={(e) => setNewNavLabel(e.target.value)}
                  placeholder="Label shown in navigation"
                />
                <AdminInput
                  label="Nav order"
                  type="number"
                  value={newNavOrder}
                  onChange={(e) => setNewNavOrder(parseInt(e.target.value, 10) || 0)}
                  min={0}
                />
              </div>

              {/* Meta title */}
              <AdminInput
                label="Meta title"
                value={newMetaTitle}
                onChange={(e) => setNewMetaTitle(e.target.value)}
                placeholder="<title> for SEO (leave blank to use page title)"
              />

              {/* Meta description */}
              <AdminTextarea
                label="Meta description"
                value={newMetaDescription}
                onChange={(e) => setNewMetaDescription(e.target.value)}
                placeholder="<meta name=description> for SEO"
                rows={3}
              />

              {/* OG Image */}
              <ImageUpload
                label="OG Image"
                value={newOgImage}
                onChange={setNewOgImage}
                hint="Social-share preview image ~1200×630."
              />

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-1">
                <AdminToggle
                  label="Show in nav"
                  checked={newShowInNav}
                  onChange={setNewShowInNav}
                />
                <AdminToggle
                  label="Published"
                  checked={newPublished}
                  onChange={setNewPublished}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-5">
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => { setShowCreate(false); resetCreateForm(); }}
              >
                <X size={13} aria-hidden="true" /> Cancel
              </AdminButton>
              <AdminButton
                size="sm"
                loading={creating}
                onClick={handleCreate}
                disabled={!newSlug.trim() || !newTitle.trim()}
              >
                Create page
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete: page HAS sections → warning-only (no delete action) ── */}
      {!!deleteTarget && deleteTargetHasSections && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sections-block-title"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setDeleteTarget(null)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-[380px] rounded-[16px] border p-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                style={{ backgroundColor: 'rgba(251,191,36,0.12)' }}
                aria-hidden="true"
              >
                <AlertTriangle size={18} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <h2
                  id="sections-block-title"
                  className="text-[15px] font-semibold mb-1"
                  style={{ color: 'var(--text)' }}
                >
                  Can&apos;t delete this page
                </h2>
                <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                  &ldquo;{deleteTarget.title}&rdquo; still has {deleteSectionCount}{' '}
                  section{deleteSectionCount !== 1 ? 's' : ''}. Delete all its sections
                  first, then you can delete the page.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <AdminButton variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                <Check size={13} aria-hidden="true" /> Got it
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete: page has NO sections → normal confirm dialog ── */}
      <ConfirmDialog
        open={!!deleteTarget && !deleteTargetHasSections}
        title="Delete page?"
        description={`"${deleteTarget?.title}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete page"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AdminShell>
  );
}

export default function AdminPagesPage() {
  return (
    <ToastProvider>
      <PagesContent />
    </ToastProvider>
  );
}
