'use client';

// ============================================================
//  Page section editor
//  - Page Settings panel (collapsible) — edit all page fields
//  - Multi-select + bulk delete for sections
//  - Per-section drag-reorder, toggle enabled, inline data form
//  - All deletes route through ConfirmDialog
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { adminPages, adminSections } from '@/lib/admin-api';
import type { Page, Section, SectionType, SectionData } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminBadge,
  AdminSelect,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';
import { ImageUpload } from '@/components/admin/image-upload';
import { SectionDataForm } from '@/components/admin/section-data-form';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────

const SECTION_TYPE_OPTIONS: { value: SectionType; label: string }[] = [
  { value: 'HERO', label: 'Hero' },
  { value: 'ABOUT', label: 'About' },
  { value: 'SKILLS', label: 'Skills' },
  { value: 'EXPERIENCE', label: 'Experience' },
  { value: 'FEATURED_PROJECTS', label: 'Featured Projects' },
  { value: 'BLOG_TEASER', label: 'Blog Teaser' },
  { value: 'ACHIEVEMENTS', label: 'Achievements' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'CONTACT', label: 'Contact' },
  { value: 'METRICS', label: 'Metrics' },
  { value: 'RICH_TEXT', label: 'Rich Text' },
  { value: 'CTA', label: 'Call to Action' },
  { value: 'GALLERY', label: 'Gallery' },
];

// ── Page settings form type ───────────────────────────────────

interface PageSettingsForm {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string | null;
  navLabel: string;
  navOrder: number;
  showInNav: boolean;
  published: boolean;
  isSystem: boolean;
}

function pageToForm(p: Page): PageSettingsForm {
  return {
    title: p.title,
    slug: p.slug,
    metaTitle: p.metaTitle ?? '',
    metaDescription: p.metaDescription ?? '',
    ogImage: p.ogImage ?? null,
    navLabel: p.navLabel ?? '',
    navOrder: p.navOrder,
    showInNav: p.showInNav,
    published: p.published,
    isSystem: p.isSystem,
  };
}

// ── SectionRow ────────────────────────────────────────────────

interface SectionRowProps {
  section: Section;
  index: number;
  total: number;
  expanded: boolean;
  saving: boolean;
  selected: boolean;
  onSelectChange: (checked: boolean) => void;
  onToggleExpand: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
  onSaveData: (data: SectionData) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

function SectionRow({
  section,
  index,
  total,
  expanded,
  saving,
  selected,
  onSelectChange,
  onToggleExpand,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
  onDelete,
  onSaveData,
  onDragStart,
  onDragOver,
  onDrop,
}: SectionRowProps) {
  const [localData, setLocalData] = useState<SectionData>(section.data);

  useEffect(() => {
    setLocalData(section.data);
  }, [section.data]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        'rounded-[12px] border transition-colors duration-150',
        selected && 'ring-1 ring-[var(--accent)]',
      )}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: selected ? 'var(--accent)' : 'var(--border)',
        opacity: section.enabled ? 1 : 0.6,
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectChange(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${section.type} section`}
          className="w-4 h-4 shrink-0 cursor-pointer rounded"
          style={{ accentColor: 'var(--accent)' }}
        />

        {/* Drag handle */}
        <GripVertical
          size={16}
          aria-hidden="true"
          className="cursor-grab active:cursor-grabbing shrink-0"
          style={{ color: 'var(--muted)' }}
        />

        {/* Move up/down */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move section up"
            className="disabled:opacity-30 transition-opacity"
            style={{ color: 'var(--muted)' }}
          >
            <ChevronUp size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move section down"
            className="disabled:opacity-30 transition-opacity"
            style={{ color: 'var(--muted)' }}
          >
            <ChevronDown size={13} aria-hidden="true" />
          </button>
        </div>

        {/* Type + index */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-[13px] font-medium font-mono" style={{ color: 'var(--text)' }}>
            {section.type}
          </span>
          <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
            #{index + 1}
          </span>
          {!section.enabled && <AdminBadge variant="muted">Hidden</AdminBadge>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleEnabled}
            aria-label={section.enabled ? 'Hide section' : 'Show section'}
            title={section.enabled ? 'Hide section' : 'Show section'}
            className="w-7 h-7 grid place-items-center rounded-[6px] transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--muted)' }}
          >
            {section.enabled ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? 'Collapse section editor' : 'Expand section editor'}
            aria-expanded={expanded}
            className="w-7 h-7 grid place-items-center rounded-[6px] transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--muted)' }}
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete section"
            className="w-7 h-7 grid place-items-center rounded-[6px] transition-colors hover:bg-[var(--surface-2)] hover:text-red-400"
            style={{ color: 'var(--muted)' }}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expanded data form */}
      {expanded && (
        <div className="border-t px-4 py-4" style={{ borderColor: 'var(--border)' }}>
          <SectionDataForm type={section.type} data={localData} onChange={setLocalData} />
          <div className="flex justify-end mt-4">
            <AdminButton size="sm" loading={saving} onClick={() => onSaveData(localData)} type="button">
              <Save size={13} aria-hidden="true" />
              Save section
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────

function PageSectionEditorContent({ pageId }: { pageId: string }) {
  const { success, error: toastError } = useToast();

  // ── Load state ───────────────────────────────────────────────
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // ── Page settings ────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<PageSettingsForm>({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    ogImage: null,
    navLabel: '',
    navOrder: 0,
    showInNav: false,
    published: false,
    isSystem: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  // Warning shown when user tries to switch isSystem from true → false
  const [isSystemWarningOpen, setIsSystemWarningOpen] = useState(false);

  // ── Section state ─────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState<SectionType>('RICH_TEXT');
  const [addingSection, setAddingSection] = useState(false);

  // ── Multi-select ──────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const dragIndex = useRef<number | null>(null);

  // Derived
  const allSelected = sections.length > 0 && selectedIds.size === sections.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  // ── Load ──────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    try {
      // GET /api/pages/id/:id — returns page with all sections (incl. disabled)
      const p = await adminPages.get(pageId);
      setPage(p);
      setSections([...(p.sections ?? [])].sort((a, b) => a.order - b.order));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load page.';
      // Treat an explicit 404 / "not found" response as a real missing page;
      // any other error (5xx, network) shows the retryable error state instead.
      const is404 = msg.includes('404') || msg.toLowerCase().includes('not found');
      if (is404) {
        setNotFound(true);
      } else {
        setLoadError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => { load(); }, [load]);

  // Sync settings form whenever page data changes (load or after save)
  useEffect(() => {
    if (page) setSettingsForm(pageToForm(page));
  }, [page]);

  // Keep select-all checkbox indeterminate when partially selected
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // ── Settings helpers ──────────────────────────────────────────

  function updateSetting<K extends keyof PageSettingsForm>(key: K, value: PageSettingsForm[K]) {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Handle isSystem toggle.
   * Switching from true → false is a destructive change (removes deletion
   * protection), so we require explicit confirmation first.
   * Switching from false → true is applied immediately.
   */
  function handleIsSystemToggle(newValue: boolean) {
    if (settingsForm.isSystem && !newValue) {
      // Ask for confirmation before removing the system flag
      setIsSystemWarningOpen(true);
    } else {
      updateSetting('isSystem', newValue);
    }
  }

  function confirmTurnOffSystem() {
    updateSetting('isSystem', false);
    setIsSystemWarningOpen(false);
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const updated = await adminPages.update(pageId, {
        title: settingsForm.title,
        slug: settingsForm.slug,
        metaTitle: settingsForm.metaTitle || null,
        metaDescription: settingsForm.metaDescription || null,
        ogImage: settingsForm.ogImage,
        navLabel: settingsForm.navLabel || null,
        navOrder: settingsForm.navOrder,
        showInNav: settingsForm.showInNav,
        published: settingsForm.published,
        isSystem: settingsForm.isSystem,
      });
      setPage(updated);
      success('Page settings saved.');
    } catch (err) {
      // 409 = duplicate slug/title; surface backend message
      toastError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  }

  // ── Drag reorder ──────────────────────────────────────────────

  function handleDragStart(_e: React.DragEvent, index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, _index: number) {
    e.preventDefault();
  }

  async function handleDrop(_e: React.DragEvent, dropIndex: number) {
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    const reindexed = next.map((s, i) => ({ ...s, order: i }));
    setSections(reindexed);
    dragIndex.current = null;
    setReordering(true);
    try {
      await adminSections.reorder(reindexed.map((s) => ({ id: s.id, order: s.order })));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Reorder failed.');
      await load();
    } finally {
      setReordering(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reindexed = next.map((s, i) => ({ ...s, order: i }));
    setSections(reindexed);
    adminSections
      .reorder(reindexed.map((s) => ({ id: s.id, order: s.order })))
      .catch((err) => toastError(err instanceof Error ? err.message : 'Reorder failed.'));
  }

  // ── Toggle enabled ────────────────────────────────────────────

  async function handleToggle(section: Section) {
    try {
      const updated = await adminSections.toggle(section.id);
      setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Toggle failed.');
    }
  }

  // ── Save section data ─────────────────────────────────────────

  async function handleSaveData(section: Section, data: SectionData) {
    setSavingId(section.id);
    try {
      const updated = await adminSections.update(section.id, { data });
      setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
      success('Section saved.');
      setExpandedId(null);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSavingId(null);
    }
  }

  // ── Delete (single) — routed through ConfirmDialog ────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminSections.delete(deleteTarget.id);
      setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      success('Section deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ── Delete (bulk) ─────────────────────────────────────────────

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkDeleting(true);
    try {
      await Promise.all(ids.map((id) => adminSections.delete(id)));
      setSections((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      success(`${ids.length} section${ids.length > 1 ? 's' : ''} deleted.`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Bulk delete failed.');
    } finally {
      setBulkDeleting(false);
    }
  }

  // ── Add section ───────────────────────────────────────────────

  async function handleAddSection() {
    setAddingSection(true);
    try {
      const section = await adminSections.create({
        pageId,
        type: newSectionType,
        order: sections.length,
        data: {},
      });
      setSections((prev) => [...prev, section]);
      setShowAddSection(false);
      success(`${newSectionType} section added.`);
      setExpandedId(section.id);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to add section.');
    } finally {
      setAddingSection(false);
    }
  }

  // ── Guard states ──────────────────────────────────────────────

  if (loading) {
    return (
      <AdminShell title="Loading…">
        <LoadingRows />
      </AdminShell>
    );
  }

  if (loadError) {
    return (
      <AdminShell title="Error loading page">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div
            className="w-12 h-12 rounded-[12px] grid place-items-center border"
            style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)' }}
          >
            <AlertCircle size={20} style={{ color: '#f87171' }} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>
              Failed to load page
            </p>
            <p className="text-[13px] mt-1 max-w-[320px]" style={{ color: 'var(--muted)' }}>
              {loadError}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/pages">
              <AdminButton variant="ghost">
                <ArrowLeft size={14} aria-hidden="true" />
                All pages
              </AdminButton>
            </Link>
            <AdminButton onClick={load}>
              <RotateCcw size={14} aria-hidden="true" />
              Retry
            </AdminButton>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (notFound) {
    return (
      <AdminShell title="Page not found">
        <EmptyState
          title="Page not found"
          description="This page does not exist or may have been deleted."
          action={
            <Link href="/admin/pages">
              <AdminButton variant="ghost">
                <ArrowLeft size={14} aria-hidden="true" />
                Back to pages
              </AdminButton>
            </Link>
          }
        />
      </AdminShell>
    );
  }

  // page is non-null here — load succeeded
  if (!page) return null;

  return (
    <AdminShell
      title={page.title}
      description={`/${page.slug} · ${sections.length} section${sections.length !== 1 ? 's' : ''}`}
      actions={
        <div className="flex gap-2 items-center">
          {reordering && (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--muted)' }} aria-label="Saving order…" />
          )}
          <AdminButton onClick={() => setShowAddSection(true)}>
            <Plus size={14} aria-hidden="true" /> Add section
          </AdminButton>
        </div>
      }
    >
      {/* Back link */}
      <Link
        href="/admin/pages"
        className="inline-flex items-center gap-1.5 text-[13px] mb-5 transition-colors hover:text-[var(--accent)]"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All pages
      </Link>

      {/* ── Page Settings Panel ─────────────────────────────────── */}
      <div
        className="rounded-[12px] border mb-6 overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Collapsible header */}
        <button
          type="button"
          onClick={() => setSettingsOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[var(--surface-2)]"
          aria-expanded={settingsOpen}
          aria-controls="page-settings-body"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Settings size={14} aria-hidden="true" style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <span
              className="text-[14px] font-semibold shrink-0"
              style={{ color: 'var(--text)' }}
            >
              Page Settings
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {page.isSystem && <AdminBadge variant="accent">System</AdminBadge>}
              {page.published
                ? <AdminBadge variant="success">Published</AdminBadge>
                : <AdminBadge variant="warning">Draft</AdminBadge>
              }
              {page.showInNav && <AdminBadge variant="muted">In nav</AdminBadge>}
            </div>
          </div>
          <ChevronDown
            size={16}
            aria-hidden="true"
            style={{
              color: 'var(--muted)',
              flexShrink: 0,
              transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* Settings body */}
        {settingsOpen && (
          <div
            id="page-settings-body"
            className="border-t flex flex-col gap-4 px-5 py-5"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Title + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Title"
                value={settingsForm.title}
                onChange={(e) => updateSetting('title', e.target.value)}
                placeholder="Page title"
              />
              <AdminInput
                label="Slug"
                value={settingsForm.slug}
                onChange={(e) =>
                  updateSetting('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))
                }
                placeholder="url-slug"
                hint="No leading slash"
              />
            </div>

            {/* Nav label */}
            <AdminInput
              label="Nav label"
              value={settingsForm.navLabel}
              onChange={(e) => updateSetting('navLabel', e.target.value)}
              placeholder="Label shown in navigation"
            />

            {/* Nav order (half-width) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Nav order"
                type="number"
                value={settingsForm.navOrder}
                onChange={(e) =>
                  updateSetting('navOrder', parseInt(e.target.value, 10) || 0)
                }
                min={0}
              />
            </div>

            {/* Meta title */}
            <AdminInput
              label="Meta title"
              value={settingsForm.metaTitle}
              onChange={(e) => updateSetting('metaTitle', e.target.value)}
              placeholder="<title> for SEO (leave blank to use page title)"
            />

            {/* Meta description */}
            <AdminTextarea
              label="Meta description"
              value={settingsForm.metaDescription}
              onChange={(e) => updateSetting('metaDescription', e.target.value)}
              placeholder="<meta name=description> for SEO"
              rows={3}
            />

            {/* OG Image */}
            <ImageUpload
              label="OG Image"
              value={settingsForm.ogImage}
              onChange={(url) => updateSetting('ogImage', url)}
              hint="Social-share preview image shown when the page link is shared (WhatsApp, LinkedIn, X). ~1200×630."
            />

            {/* Toggles — Show in nav, Published, System page */}
            <div className="flex flex-wrap gap-6 pt-1">
              <AdminToggle
                label="Show in nav"
                checked={settingsForm.showInNav}
                onChange={(v) => updateSetting('showInNav', v)}
              />
              <AdminToggle
                label="Published"
                checked={settingsForm.published}
                onChange={(v) => updateSetting('published', v)}
              />
              <AdminToggle
                label="System page"
                checked={settingsForm.isSystem}
                onChange={handleIsSystemToggle}
              />
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <AdminButton loading={savingSettings} onClick={handleSaveSettings} type="button">
                <Save size={13} aria-hidden="true" />
                Save settings
              </AdminButton>
            </div>
          </div>
        )}
      </div>

      {/* ── Sections ─────────────────────────────────────────────── */}
      {sections.length === 0 ? (
        <EmptyState
          icon={<Plus size={20} />}
          title="No sections yet"
          description="Add your first section to start building this page."
          action={
            <AdminButton onClick={() => setShowAddSection(true)}>
              <Plus size={14} /> Add section
            </AdminButton>
          }
        />
      ) : (
        <>
          {/* Multi-select toolbar */}
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  allSelected
                    ? setSelectedIds(new Set())
                    : setSelectedIds(new Set(sections.map((s) => s.id)))
                }
                className="w-4 h-4 cursor-pointer rounded"
                style={{ accentColor: 'var(--accent)' }}
                aria-label="Select all sections"
              />
              <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
                {selectedIds.size > 0
                  ? `${selectedIds.size} of ${sections.length} selected`
                  : 'Select all'}
              </span>
            </label>

            {selectedIds.size > 0 && (
              <AdminButton
                variant="danger"
                size="sm"
                onClick={() => setBulkDeleteConfirm(true)}
              >
                <Trash2 size={13} aria-hidden="true" />
                Delete selected ({selectedIds.size})
              </AdminButton>
            )}
          </div>

          {/* Sections list */}
          <div className="flex flex-col gap-2" role="list" aria-label="Page sections">
            {sections.map((section, index) => (
              <div key={section.id} role="listitem">
                <SectionRow
                  section={section}
                  index={index}
                  total={sections.length}
                  expanded={expandedId === section.id}
                  saving={savingId === section.id}
                  selected={selectedIds.has(section.id)}
                  onSelectChange={(checked) =>
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(section.id);
                      else next.delete(section.id);
                      return next;
                    })
                  }
                  onToggleExpand={() =>
                    setExpandedId((id) => (id === section.id ? null : section.id))
                  }
                  onMoveUp={() => move(index, -1)}
                  onMoveDown={() => move(index, 1)}
                  onToggleEnabled={() => handleToggle(section)}
                  onDelete={() => setDeleteTarget(section)}
                  onSaveData={(data) => handleSaveData(section, data)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add section modal */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowAddSection(false)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-[400px] rounded-[16px] border p-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-section-title"
          >
            <h2
              id="add-section-title"
              className="text-[18px] font-semibold mb-5"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
            >
              Add Section
            </h2>
            <AdminSelect
              label="Section type"
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value as SectionType)}
              options={SECTION_TYPE_OPTIONS}
            />
            <div className="flex gap-2 justify-end mt-5">
              <AdminButton variant="ghost" size="sm" onClick={() => setShowAddSection(false)}>
                <X size={13} aria-hidden="true" /> Cancel
              </AdminButton>
              <AdminButton size="sm" loading={addingSection} onClick={handleAddSection} type="button">
                <Plus size={13} aria-hidden="true" /> Add section
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* isSystem → false warning (requires confirmation) */}
      <ConfirmDialog
        open={isSystemWarningOpen}
        title="Turn off system page?"
        description={`"${page.title}" is a core page that powers your live site. Turning off 'System' allows it to be deleted and may break public navigation. Continue?`}
        confirmLabel="Turn off System"
        onConfirm={confirmTurnOffSystem}
        onCancel={() => setIsSystemWarningOpen(false)}
      />

      {/* Single-delete ConfirmDialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete section?"
        description={`The "${deleteTarget?.type}" section will be permanently removed from this page. This can't be undone.`}
        confirmLabel="Delete section"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Bulk-delete ConfirmDialog */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Delete ${selectedIds.size} section${selectedIds.size !== 1 ? 's' : ''}?`}
        description={`${selectedIds.size} selected section${selectedIds.size !== 1 ? 's' : ''} will be permanently removed from this page. This can't be undone.`}
        confirmLabel={`Delete ${selectedIds.size}`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleting}
      />
    </AdminShell>
  );
}

export default function AdminPageSectionEditorPage() {
  const params = useParams<{ id: string }>();

  return (
    <ToastProvider>
      <PageSectionEditorContent pageId={params.id} />
    </ToastProvider>
  );
}
