'use client';

// ============================================================
//  Admin Projects list — all projects with feature/publish
//  toggles and reorder arrows.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Star, Globe, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { adminProjects } from '@/lib/admin-api';
import type { Project } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminCard,
  AdminBadge,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';

function ProjectsContent() {
  const { success, error: toastError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminProjects.list();
      setProjects([...data].sort((a, b) => a.order - b.order));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggleFeatured(p: Project) {
    try {
      const updated = await adminProjects.toggleFeatured(p.id);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update.');
    }
  }

  async function handleTogglePublished(p: Project) {
    try {
      const updated = await adminProjects.togglePublished(p.id);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update.');
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...projects];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reindexed = next.map((p, i) => ({ ...p, order: i }));
    setProjects(reindexed);
    try {
      await adminProjects.reorder(reindexed.map((p) => ({ id: p.id, order: p.order })));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Reorder failed.');
      await load();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminProjects.delete(deleteTarget.id);
      setProjects((p) => p.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Project deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell
      title="Projects"
      description="Manage portfolio projects."
      actions={
        <Link href="/admin/projects/new">
          <AdminButton>
            <Plus size={14} aria-hidden="true" /> New project
          </AdminButton>
        </Link>
      }
    >
      {loading ? (
        <LoadingRows />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={20} />}
          title="No projects yet"
          action={
            <Link href="/admin/projects/new">
              <AdminButton><Plus size={14} /> Add project</AdminButton>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((project, index) => (
            <AdminCard key={project.id} className="flex items-center gap-3">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 shrink-0" aria-hidden="true">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="disabled:opacity-30"
                  aria-label="Move up"
                  style={{ color: 'var(--muted)' }}
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === projects.length - 1}
                  className="disabled:opacity-30"
                  aria-label="Move down"
                  style={{ color: 'var(--muted)' }}
                >
                  <ChevronDown size={13} />
                </button>
              </div>
              <GripVertical size={14} style={{ color: 'var(--muted)' }} aria-hidden="true" className="shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                    {project.title}
                  </span>
                  {project.featured && (
                    <AdminBadge variant="accent">Featured</AdminBadge>
                  )}
                  {project.published ? (
                    <AdminBadge variant="success">Published</AdminBadge>
                  ) : (
                    <AdminBadge variant="warning">Draft</AdminBadge>
                  )}
                </div>
                <p className="text-[12px] mt-0.5 font-mono truncate" style={{ color: 'var(--muted)' }}>
                  {project.slug} · {project.proofType}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 shrink-0 flex-wrap">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFeatured(project)}
                  title={project.featured ? 'Unfeature' : 'Feature'}
                >
                  <Star size={13} aria-hidden="true" className={project.featured ? 'fill-current' : ''} />
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTogglePublished(project)}
                  title={project.published ? 'Unpublish' : 'Publish'}
                >
                  <Globe size={13} aria-hidden="true" />
                  {project.published ? 'Unpublish' : 'Publish'}
                </AdminButton>
                <Link href={`/admin/projects/${project.id}`}>
                  <AdminButton variant="ghost" size="sm" type="button">Edit</AdminButton>
                </Link>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(project)}
                >
                  Delete
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AdminShell>
  );
}

export default function AdminProjectsPage() {
  return (
    <ToastProvider>
      <ProjectsContent />
    </ToastProvider>
  );
}
