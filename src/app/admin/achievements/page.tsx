'use client';

// ============================================================
//  Admin Achievements CRUD
// ============================================================

import { useEffect, useState } from 'react';
import { Plus, Trophy, ChevronUp, ChevronDown, Pencil, Trash2, Save, X } from 'lucide-react';
import { adminAchievements } from '@/lib/admin-api';
import type { Achievement, AchievementType } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminCard,
  AdminBadge,
  AdminInput,
  AdminTextarea,
  AdminSelect,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';

const TYPE_OPTIONS: { value: AchievementType; label: string }[] = [
  { value: 'AWARD', label: 'Award' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'MENTORING', label: 'Mentoring' },
];

const TYPE_BADGE: Record<AchievementType, 'accent' | 'success' | 'warning'> = {
  AWARD: 'accent',
  EDUCATION: 'success',
  MENTORING: 'warning',
};

type FormState = Omit<Achievement, 'id' | 'order'>;

const EMPTY: FormState = {
  title: '',
  description: '',
  year: '',
  type: 'AWARD',
};

function AchievementsContent() {
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(FormState & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminAchievements
      .list()
      .then((data) => setItems([...data].sort((a, b) => a.order - b.order)))
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    const ri = next.map((x, i) => ({ ...x, order: i }));
    setItems(ri);
    try {
      await adminAchievements.reorder(ri.map((x) => ({ id: x.id, order: x.order })));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Reorder failed.');
    }
  }

  async function handleSave() {
    if (!editing || !editing.title.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        const updated = await adminAchievements.update(editing.id, {
          title: editing.title,
          description: editing.description,
          year: editing.year ?? undefined,
          type: editing.type,
        });
        setItems((p) => p.map((x) => (x.id === editing.id ? updated : x)));
        success('Achievement updated.');
      } else {
        const created = await adminAchievements.create({
          title: editing.title,
          description: editing.description,
          year: editing.year ?? undefined,
          type: editing.type,
          order: items.length,
        });
        setItems((p) => [...p, created]);
        success('Achievement added.');
      }
      setEditing(null);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAchievements.delete(deleteTarget.id);
      setItems((p) => p.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Achievement deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    if (!editing) return;
    setEditing({ ...editing, [key]: val });
  }

  return (
    <AdminShell
      title="Achievements"
      description="Awards, education milestones, and mentoring."
      actions={
        <AdminButton onClick={() => setEditing({ ...EMPTY })}>
          <Plus size={14} aria-hidden="true" /> Add achievement
        </AdminButton>
      }
    >
      {/* Modal form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setEditing(null)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-[500px] rounded-[16px] border p-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ach-form-title"
          >
            <h2
              id="ach-form-title"
              className="text-[18px] font-semibold mb-5"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
            >
              {editing.id ? 'Edit achievement' : 'New achievement'}
            </h2>
            <div className="flex flex-col gap-4">
              <AdminInput
                label="Title *"
                value={editing.title}
                onChange={(e) => set('title', e.target.value)}
                autoFocus
              />
              <AdminTextarea
                label="Description"
                value={editing.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-3">
                <AdminInput
                  label="Year"
                  value={editing.year ?? ''}
                  onChange={(e) => set('year', e.target.value || undefined)}
                  placeholder="e.g. 2024"
                />
                <AdminSelect
                  label="Type"
                  value={editing.type}
                  onChange={(e) => set('type', e.target.value as AchievementType)}
                  options={TYPE_OPTIONS}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <AdminButton variant="ghost" size="sm" onClick={() => setEditing(null)}>
                <X size={13} aria-hidden="true" /> Cancel
              </AdminButton>
              <AdminButton size="sm" loading={saving} onClick={handleSave} type="button">
                <Save size={13} aria-hidden="true" />
                {editing.id ? 'Update' : 'Add'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingRows />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Trophy size={20} />}
          title="No achievements yet"
          action={
            <AdminButton onClick={() => setEditing({ ...EMPTY })}>
              <Plus size={14} /> Add first
            </AdminButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <AdminCard key={item.id} className="flex items-start gap-3">
              <div className="flex flex-col gap-0.5 shrink-0 mt-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                  className="disabled:opacity-30" aria-label="Move up" style={{ color: 'var(--muted)' }}>
                  <ChevronUp size={13} />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}
                  className="disabled:opacity-30" aria-label="Move down" style={{ color: 'var(--muted)' }}>
                  <ChevronDown size={13} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                    {item.title}
                  </span>
                  {item.year && (
                    <span className="text-[12px] font-mono" style={{ color: 'var(--muted)' }}>
                      {item.year}
                    </span>
                  )}
                  <AdminBadge variant={TYPE_BADGE[item.type]}>{item.type}</AdminBadge>
                </div>
                {item.description && (
                  <p className="text-[12px] mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <AdminButton variant="ghost" size="sm"
                  onClick={() => setEditing({ id: item.id, title: item.title, description: item.description, year: item.year ?? '', type: item.type })}
                  aria-label="Edit">
                  <Pencil size={13} aria-hidden="true" />
                </AdminButton>
                <AdminButton variant="danger" size="sm"
                  onClick={() => setDeleteTarget(item)}
                  aria-label="Delete">
                  <Trash2 size={13} aria-hidden="true" />
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete achievement"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AdminShell>
  );
}

export default function AdminAchievementsPage() {
  return (
    <ToastProvider>
      <AchievementsContent />
    </ToastProvider>
  );
}
