'use client';

// ============================================================
//  Admin Pages list — shows all pages, links to section editor
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, ExternalLink } from 'lucide-react';
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
  AdminSelect,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { ToastProvider } from '@/components/admin/toast';

const PAGE_TYPE_OPTIONS = [
  { value: 'HOME', label: 'Home' },
  { value: 'PROJECTS', label: 'Projects' },
  { value: 'BLOG', label: 'Blog' },
  { value: 'ABOUT', label: 'About' },
  { value: 'CONTACT', label: 'Contact' },
  { value: 'CUSTOM', label: 'Custom' },
];

function PagesContent() {
  const { success, error: toastError } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('CUSTOM');

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

  async function handleCreate() {
    if (!newSlug.trim() || !newTitle.trim()) return;
    setCreating(true);
    try {
      const payload: CreatePagePayload = {
        slug: newSlug.trim(),
        title: newTitle.trim(),
        type: newType as CreatePagePayload['type'],
      };
      const page = await adminPages.create(payload);
      setPages((p) => [...p, page]);
      setShowCreate(false);
      setNewSlug('');
      setNewTitle('');
      setNewType('CUSTOM');
      success('Page created.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to create page.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminPages.delete(deleteTarget.id);
      setPages((p) => p.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Page deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to delete page.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell
      title="Pages & Sections"
      description="Manage pages and their section blocks."
      actions={
        <AdminButton onClick={() => setShowCreate(true)}>
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
            <AdminButton onClick={() => setShowCreate(true)}>
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
                  <AdminBadge variant="muted">{page.type}</AdminBadge>
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
                  /{page.slug} · {page.sections?.length ?? 0} sections
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
                    <ExternalLink size={13} aria-hidden="true" />
                  </AdminButton>
                </Link>
                <Link href={`/admin/pages/${page.id}`}>
                  <AdminButton variant="ghost" size="sm" type="button">
                    Edit sections
                  </AdminButton>
                </Link>
                {!page.isSystem && (
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(page)}
                  >
                    Delete
                  </AdminButton>
                )}
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowCreate(false)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-[440px] rounded-[16px] border p-6"
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
              <AdminInput
                label="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. About"
                autoFocus
              />
              <AdminInput
                label="Slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. about"
                hint="URL path — no leading slash"
              />
              <AdminSelect
                label="Page type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                options={PAGE_TYPE_OPTIONS}
              />
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <AdminButton variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                Cancel
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete page"
        description={`Delete "${deleteTarget?.title}"? This will also delete all its sections. This cannot be undone.`}
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
