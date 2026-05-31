'use client';

// ============================================================
//  Admin Skills CRUD — list + inline create/edit + reorder
// ============================================================

import { useEffect, useState } from 'react';
import { Plus, Wrench, ChevronUp, ChevronDown, Pencil, Trash2, Save, X } from 'lucide-react';
import { adminSkills } from '@/lib/admin-api';
import type { Skill, SkillGroup, SkillLevel } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminCard,
  AdminBadge,
  AdminInput,
  AdminSelect,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';

const GROUP_OPTIONS: { value: SkillGroup; label: string }[] = [
  { value: 'LANGUAGES', label: 'Languages' },
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'DATA', label: 'Data' },
  { value: 'CLOUD_DEVOPS', label: 'Cloud / DevOps' },
  { value: 'AI', label: 'AI' },
];

const LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'EXPERT', label: 'Expert' },
  { value: 'PROFICIENT', label: 'Proficient' },
  { value: 'FAMILIAR', label: 'Familiar' },
];

const LEVEL_BADGE: Record<SkillLevel, 'accent' | 'success' | 'muted'> = {
  EXPERT: 'accent',
  PROFICIENT: 'success',
  FAMILIAR: 'muted',
};

interface EditingSkill {
  id?: string;
  name: string;
  group: SkillGroup;
  level: SkillLevel;
  order: number;
}

const EMPTY_EDIT: EditingSkill = {
  name: '',
  group: 'LANGUAGES',
  level: 'PROFICIENT',
  order: 0,
};

function SkillsContent() {
  const { success, error: toastError } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingSkill | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminSkills
      .list()
      .then((data) => setSkills([...data].sort((a, b) => a.order - b.order)))
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function move(index: number, dir: -1 | 1) {
    const next = [...skills];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    const ri = next.map((s, i) => ({ ...s, order: i }));
    setSkills(ri);
    try {
      await adminSkills.reorder(ri.map((s) => ({ id: s.id, order: s.order })));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Reorder failed.');
    }
  }

  async function handleSave() {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        const updated = await adminSkills.update(editing.id, {
          name: editing.name,
          group: editing.group,
          level: editing.level,
        });
        setSkills((p) => p.map((s) => (s.id === editing.id ? updated : s)));
        success('Skill updated.');
      } else {
        const created = await adminSkills.create({
          name: editing.name,
          group: editing.group,
          level: editing.level,
          order: skills.length,
        });
        setSkills((p) => [...p, created]);
        success('Skill added.');
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
      await adminSkills.delete(deleteTarget.id);
      setSkills((p) => p.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Skill deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell
      title="Skills"
      description="Manage skill groups, levels and order."
      actions={
        <AdminButton onClick={() => setEditing({ ...EMPTY_EDIT, order: skills.length })}>
          <Plus size={14} aria-hidden="true" /> Add skill
        </AdminButton>
      }
    >
      {/* Add / edit inline form */}
      {editing && (
        <AdminCard className="mb-5">
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            {editing.id ? 'Edit skill' : 'New skill'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AdminInput
              label="Name *"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              autoFocus
            />
            <AdminSelect
              label="Group"
              value={editing.group}
              onChange={(e) => setEditing({ ...editing, group: e.target.value as SkillGroup })}
              options={GROUP_OPTIONS}
            />
            <AdminSelect
              label="Level"
              value={editing.level}
              onChange={(e) => setEditing({ ...editing, level: e.target.value as SkillLevel })}
              options={LEVEL_OPTIONS}
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <AdminButton variant="ghost" size="sm" onClick={() => setEditing(null)}>
              <X size={13} aria-hidden="true" /> Cancel
            </AdminButton>
            <AdminButton size="sm" loading={saving} onClick={handleSave} type="button">
              <Save size={13} aria-hidden="true" />
              {editing.id ? 'Update' : 'Add skill'}
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {loading ? (
        <LoadingRows />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={<Wrench size={20} />}
          title="No skills yet"
          action={
            <AdminButton onClick={() => setEditing({ ...EMPTY_EDIT })}>
              <Plus size={14} /> Add first skill
            </AdminButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {skills.map((skill, index) => (
            <AdminCard key={skill.id} className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                  className="disabled:opacity-30" aria-label="Move up" style={{ color: 'var(--muted)' }}>
                  <ChevronUp size={13} />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === skills.length - 1}
                  className="disabled:opacity-30" aria-label="Move down" style={{ color: 'var(--muted)' }}>
                  <ChevronDown size={13} />
                </button>
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                  {skill.name}
                </span>
                <AdminBadge variant="muted">{skill.group}</AdminBadge>
                <AdminBadge variant={LEVEL_BADGE[skill.level]}>{skill.level}</AdminBadge>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditing({
                      id: skill.id,
                      name: skill.name,
                      group: skill.group,
                      level: skill.level,
                      order: skill.order,
                    })
                  }
                  aria-label="Edit skill"
                >
                  <Pencil size={13} aria-hidden="true" />
                </AdminButton>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(skill)}
                  aria-label="Delete skill"
                >
                  <Trash2 size={13} aria-hidden="true" />
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete skill"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AdminShell>
  );
}

export default function AdminSkillsPage() {
  return (
    <ToastProvider>
      <SkillsContent />
    </ToastProvider>
  );
}
