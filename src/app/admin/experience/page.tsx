'use client';

// ============================================================
//  Admin Experience CRUD — list + create/edit modal + reorder
// ============================================================

import { useEffect, useState } from 'react';
import { Plus, Briefcase, ChevronUp, ChevronDown, Pencil, Trash2, Save, X } from 'lucide-react';
import { adminExperience } from '@/lib/admin-api';
import type { Experience } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  BulletsInput,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';

type FormState = Omit<Experience, 'id'>;

const EMPTY: FormState = {
  role: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  bullets: [],
  order: 0,
};

function ExperienceContent() {
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(FormState & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminExperience
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
      await adminExperience.reorder(ri.map((x) => ({ id: x.id, order: x.order })));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Reorder failed.');
    }
  }

  async function handleSave() {
    if (!editing || !editing.role.trim() || !editing.company.trim()) return;
    setSaving(true);
    try {
      const payload: Omit<Experience, 'id'> = {
        role: editing.role,
        company: editing.company,
        location: editing.location,
        startDate: editing.startDate,
        endDate: editing.endDate,
        bullets: editing.bullets,
        order: editing.order,
      };
      if (editing.id) {
        const updated = await adminExperience.update(editing.id, payload);
        setItems((p) => p.map((x) => (x.id === editing.id ? updated : x)));
        success('Experience updated.');
      } else {
        const created = await adminExperience.create({ ...payload, order: items.length });
        setItems((p) => [...p, created]);
        success('Experience added.');
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
      await adminExperience.delete(deleteTarget.id);
      setItems((p) => p.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Experience deleted.');
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
      title="Experience"
      description="Manage work experience entries."
      actions={
        <AdminButton onClick={() => setEditing({ ...EMPTY, order: items.length })}>
          <Plus size={14} aria-hidden="true" /> Add experience
        </AdminButton>
      }
    >
      {/* Edit form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setEditing(null)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-[600px] rounded-[16px] border p-6 overflow-y-auto max-h-[90vh]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exp-form-title"
          >
            <h2
              id="exp-form-title"
              className="text-[18px] font-semibold mb-5"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
            >
              {editing.id ? 'Edit experience' : 'New experience'}
            </h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminInput
                  label="Role *"
                  value={editing.role}
                  onChange={(e) => set('role', e.target.value)}
                  autoFocus
                />
                <AdminInput
                  label="Company *"
                  value={editing.company}
                  onChange={(e) => set('company', e.target.value)}
                />
                <AdminInput
                  label="Location"
                  value={editing.location}
                  onChange={(e) => set('location', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <AdminInput
                    label="Start date"
                    value={editing.startDate}
                    onChange={(e) => set('startDate', e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                  <AdminInput
                    label="End date"
                    value={editing.endDate}
                    onChange={(e) => set('endDate', e.target.value)}
                    placeholder="YYYY-MM-DD or Present"
                  />
                </div>
              </div>
              <BulletsInput
                label="Bullet points"
                value={editing.bullets}
                onChange={(b) => set('bullets', b)}
              />
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
          icon={<Briefcase size={20} />}
          title="No experience entries yet"
          action={
            <AdminButton onClick={() => setEditing({ ...EMPTY })}>
              <Plus size={14} /> Add first entry
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
                <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                  {item.role} — {item.company}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {item.location} · {item.startDate} → {item.endDate}
                </p>
                {item.bullets.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-0.5">
                    {item.bullets.slice(0, 2).map((b, i) => (
                      <li key={i} className="text-[12px] flex gap-1.5" style={{ color: 'var(--muted)' }}>
                        <span aria-hidden="true" style={{ color: 'var(--accent)' }}>·</span>
                        {b}
                      </li>
                    ))}
                    {item.bullets.length > 2 && (
                      <li className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        +{item.bullets.length - 2} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <AdminButton variant="ghost" size="sm"
                  onClick={() => setEditing({ id: item.id, ...item })}
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
        title="Delete experience"
        description={`Delete "${deleteTarget?.role} at ${deleteTarget?.company}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AdminShell>
  );
}

export default function AdminExperiencePage() {
  return (
    <ToastProvider>
      <ExperienceContent />
    </ToastProvider>
  );
}
