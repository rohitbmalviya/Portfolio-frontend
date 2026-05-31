'use client';

// ============================================================
//  Page section editor
//  - Lists sections in drag-reorder order
//  - Add section (predefined type picker)
//  - Toggle enabled/disabled per section
//  - Edit each section's typed data form inline
//  - Persists reorder via PATCH /sections/reorder
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Save,
} from 'lucide-react';
import { adminPages, adminSections } from '@/lib/admin-api';
import type { Page, Section, SectionType, SectionData } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminCard,
  AdminBadge,
  AdminSelect,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';
import { SectionDataForm } from '@/components/admin/section-data-form';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SECTION_TYPE_OPTIONS: { value: SectionType; label: string }[] = [
  { value: 'HERO', label: 'Hero' },
  { value: 'ABOUT', label: 'About' },
  { value: 'SKILLS', label: 'Skills' },
  { value: 'EXPERIENCE', label: 'Experience' },
  { value: 'FEATURED_PROJECTS', label: 'Featured Projects' },
  { value: 'PROJECTS_GRID', label: 'Projects Grid' },
  { value: 'BLOG_TEASER', label: 'Blog Teaser' },
  { value: 'ACHIEVEMENTS', label: 'Achievements' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'CONTACT', label: 'Contact' },
  { value: 'METRICS', label: 'Metrics' },
  { value: 'RICH_TEXT', label: 'Rich Text' },
  { value: 'CTA', label: 'Call to Action' },
  { value: 'GALLERY', label: 'Gallery' },
];

// ── Drag-to-reorder list ──────────────────────────────────────

interface SectionRowProps {
  section: Section;
  index: number;
  total: number;
  expanded: boolean;
  saving: boolean;
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

  // Sync when section data changes from outside
  useEffect(() => {
    setLocalData(section.data);
  }, [section.data]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className="rounded-[12px] border transition-colors duration-150"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        opacity: section.enabled ? 1 : 0.6,
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Drag handle */}
        <GripVertical
          size={16}
          aria-hidden="true"
          className="cursor-grab active:cursor-grabbing shrink-0"
          style={{ color: 'var(--muted)' }}
        />

        {/* Move up/down buttons */}
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

        {/* Type + info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span
            className="text-[13px] font-medium font-mono"
            style={{ color: 'var(--text)' }}
          >
            {section.type}
          </span>
          <span
            className="text-[11px] font-mono"
            style={{ color: 'var(--muted)' }}
          >
            #{index + 1}
          </span>
          {!section.enabled && (
            <AdminBadge variant="muted">Hidden</AdminBadge>
          )}
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
            {section.enabled ? (
              <Eye size={14} aria-hidden="true" />
            ) : (
              <EyeOff size={14} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? 'Collapse section editor' : 'Expand section editor'}
            aria-expanded={expanded}
            className="w-7 h-7 grid place-items-center rounded-[6px] transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--muted)' }}
          >
            <Pencil size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete section"
            className="w-7 h-7 grid place-items-center rounded-[6px] transition-colors hover:text-red-400"
            style={{ color: 'var(--muted)' }}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div
          className="border-t px-4 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <SectionDataForm
            type={section.type}
            data={localData}
            onChange={setLocalData}
          />
          <div className="flex justify-end mt-4">
            <AdminButton
              size="sm"
              loading={saving}
              onClick={() => onSaveData(localData)}
              type="button"
            >
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
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState<SectionType>('RICH_TEXT');
  const [addingSection, setAddingSection] = useState(false);

  const dragIndex = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await adminPages.get(pageId);
      setPage(p);
      const sorted = [...(p.sections ?? [])].sort((a, b) => a.order - b.order);
      setSections(sorted);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to load page.');
    } finally {
      setLoading(false);
    }
  }, [pageId, toastError]);

  useEffect(() => { load(); }, [load]);

  // ── Drag reorder ────────────────────────────────────────────

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

    // Persist
    setReordering(true);
    try {
      await adminSections.reorder(reindexed.map((s) => ({ id: s.id, order: s.order })));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Reorder failed.');
      await load(); // rollback
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

  // ── Toggle enabled ──────────────────────────────────────────

  async function handleToggle(section: Section) {
    try {
      const updated = await adminSections.toggle(section.id);
      setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Toggle failed.');
    }
  }

  // ── Save section data ───────────────────────────────────────

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

  // ── Delete ──────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminSections.delete(deleteTarget.id);
      setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Section deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  // ── Add section ─────────────────────────────────────────────

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
      setExpandedId(section.id); // auto-open to fill data
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to add section.');
    } finally {
      setAddingSection(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Loading…">
        <LoadingRows />
      </AdminShell>
    );
  }

  if (!page) {
    return (
      <AdminShell title="Page not found">
        <EmptyState title="Page not found" description="The requested page could not be loaded." />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={page.title}
      description={`/${page.slug} · ${sections.length} sections`}
      actions={
        <div className="flex gap-2">
          {reordering && (
            <Loader2 size={16} className="animate-spin self-center" style={{ color: 'var(--muted)' }} />
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
        <div className="flex flex-col gap-2" role="list" aria-label="Page sections">
          {sections.map((section, index) => (
            <div key={section.id} role="listitem">
              <SectionRow
                section={section}
                index={index}
                total={sections.length}
                expanded={expandedId === section.id}
                saving={savingId === section.id}
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
                Cancel
              </AdminButton>
              <AdminButton size="sm" loading={addingSection} onClick={handleAddSection} type="button">
                Add section
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete section"
        description={`Delete this ${deleteTarget?.type} section? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
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
