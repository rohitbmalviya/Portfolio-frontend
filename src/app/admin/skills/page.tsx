'use client';

// ============================================================
//  Admin Skills CRUD — grouped list + inline create/edit + reorder
//  Data source: GET /api/skills/grouped (SkillGroupSection[]).
//  After every mutation the page re-fetches listGrouped() so
//  the displayed groups always reflect the authoritative server
//  order — no client-side group juggling required.
// ============================================================

import { useEffect, useState } from 'react';
import { Plus, Wrench, ChevronUp, ChevronDown, Pencil, Trash2, Save, X } from 'lucide-react';
import { adminSkills } from '@/lib/admin-api';
import { getConfigOptions } from '@/lib/api';
import type { ConfigOption } from '@/lib/api';
import type { Skill, SkillGroup, SkillLevel, SkillGroupSection } from '@/lib/types';
import { SkillIcon } from '@/components/ui/skill-icon';
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
  group: '',
  level: 'PROFICIENT',
  order: 0,
};

function SkillsContent() {
  const { success, error: toastError } = useToast();
  const [sections, setSections] = useState<SkillGroupSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingSkill | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [groupOptions, setGroupOptions] = useState<ConfigOption[]>([]);

  // Load skill group options from the DB-driven config key.
  useEffect(() => {
    getConfigOptions('skill_groups').then(setGroupOptions);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Total skill count across all groups — used as the `order` value for new skills.
  const totalSkills = sections.reduce((sum, s) => sum + s.skills.length, 0);

  // Re-fetch the grouped list from the API and update state.
  // Called after every mutation so the displayed groups always match the server.
  async function refetch() {
    const data = await adminSkills.listGrouped();
    setSections(data);
  }

  useEffect(() => {
    setLoading(true);
    adminSkills
      .listGrouped()
      .then((data) => setSections(data))
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reorder within a group: swap the order values of two adjacent skills,
  // persist via the reorder endpoint, then re-fetch to sync state.
  async function move(skill: Skill, dir: -1 | 1) {
    const section = sections.find((sec) => sec.group === skill.group);
    if (!section) return;

    // section.skills is already sorted by `order` (the API guarantees this).
    const groupSkills = section.skills;
    const idx = groupSkills.findIndex((s) => s.id === skill.id);
    const t = idx + dir;
    if (t < 0 || t >= groupSkills.length) return;

    const a = groupSkills[idx];
    const b = groupSkills[t];
    try {
      await adminSkills.reorder([
        { id: a.id, order: b.order },
        { id: b.id, order: a.order },
      ]);
      await refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Reorder failed.');
    }
  }

  async function handleSave() {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        await adminSkills.update(editing.id, {
          name: editing.name,
          group: editing.group,
          level: editing.level,
        });
        success('Skill updated.');
      } else {
        await adminSkills.create({
          name: editing.name,
          group: editing.group,
          level: editing.level,
          order: totalSkills,
        });
        success('Skill added.');
      }
      setEditing(null);
      await refetch();
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
      setDeleteTarget(null);
      success('Skill deleted.');
      await refetch();
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
        <AdminButton
          onClick={() =>
            setEditing({
              ...EMPTY_EDIT,
              group: groupOptions[0]?.value ?? '',
              order: totalSkills,
            })
          }
        >
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
              options={groupOptions}
            />
            <AdminSelect
              label="Level"
              value={editing.level}
              onChange={(e) => setEditing({ ...editing, level: e.target.value as SkillLevel })}
              options={LEVEL_OPTIONS}
            />
          </div>
          <div className="flex gap-2 justify-end items-center mt-4">
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>
              <X size={14} aria-hidden="true" /> Cancel
            </AdminButton>
            <AdminButton loading={saving} onClick={handleSave} type="button">
              <Save size={14} aria-hidden="true" />
              {editing.id ? 'Update' : 'Add skill'}
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {loading ? (
        <LoadingRows />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={<Wrench size={20} />}
          title="No skills yet"
          action={
            <AdminButton
              onClick={() =>
                setEditing({ ...EMPTY_EDIT, group: groupOptions[0]?.value ?? '' })
              }
            >
              <Plus size={14} /> Add first skill
            </AdminButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.group}>
              <div className="flex items-center gap-2 mb-3">
                <h2
                  className="text-[12px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  {section.label}
                </h2>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--muted)',
                  }}
                >
                  {section.skills.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {section.skills.map((skill, idx) => (
                  <AdminCard key={skill.id} className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => move(skill, -1)}
                        disabled={idx === 0}
                        className="disabled:opacity-30"
                        aria-label="Move up"
                        style={{ color: 'var(--muted)' }}
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(skill, 1)}
                        disabled={idx === section.skills.length - 1}
                        className="disabled:opacity-30"
                        aria-label="Move down"
                        style={{ color: 'var(--muted)' }}
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[14px] font-medium inline-flex items-center gap-1.5"
                        style={{ color: 'var(--text)' }}
                      >
                        <SkillIcon name={skill.name} size={15} />
                        {skill.name}
                      </span>
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
                      >
                        <Pencil size={13} aria-hidden="true" /> Edit
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(skill)}
                      >
                        <Trash2 size={13} aria-hidden="true" /> Delete
                      </AdminButton>
                    </div>
                  </AdminCard>
                ))}
              </div>
            </section>
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
