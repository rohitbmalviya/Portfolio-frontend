'use client';

// ============================================================
//  Project create / edit form
//  Route: /admin/projects/new  →  create
//         /admin/projects/:id  →  edit
//
//  Deferred-upload flow:
//   Create → adminProjects.create → get id → reconcileMultiMedia
//   Update → adminProjects.update → reconcileMultiMedia
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminProjects } from '@/lib/admin-api';
import { reconcileMultiMedia } from '@/lib/media-save';
import { MediaCategory } from '@/lib/media';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminInput,
  AdminTextarea,
  AdminToggle,
  AdminButton,
  AdminCard,
  TagsInput,
  LoadingRows,
} from '@/components/admin/ui';
import { MultiImageUpload, type ImageValue } from '@/components/admin/image-upload';

// ── Form state ─────────────────────────────────────────────────

interface FormState {
  slug: string;
  title: string;
  oneLiner: string;
  role: string;
  tags: string[];
  stack: string[];
  metric: string;
  liveUrl: string;
  screenshots: ImageValue[];
  overview: string;
  contribution: string;
  body: string;
  featured: boolean;
  order: number;
  published: boolean;
}

const EMPTY_FORM: FormState = {
  slug: '',
  title: '',
  oneLiner: '',
  role: '',
  tags: [],
  stack: [],
  metric: '',
  liveUrl: '',
  screenshots: [],
  overview: '',
  contribution: '',
  body: '',
  featured: false,
  order: 0,
  published: false,
};

function ProjectFormContent({ projectId }: { projectId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!projectId);
  const [saving, setSaving] = useState(false);
  const isNew = !projectId;

  // Track originalMediaIds to detect additions/removals on update.
  const originalMediaIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    adminProjects
      .get(projectId)
      .then((p) => {
        const existingScreenshots: ImageValue[] = (p.screenshots ?? []).map((s) => ({
          mediaId: s.mediaId,
          url: s.url,
          alt: s.alt ?? '',
        }));
        originalMediaIdsRef.current = existingScreenshots.map((s) =>
          'mediaId' in s ? s.mediaId : '',
        );
        setForm({
          slug: p.slug,
          title: p.title,
          oneLiner: p.oneLiner,
          role: p.role,
          tags: p.tags ?? [],
          stack: p.stack ?? [],
          metric: p.metric,
          liveUrl: p.liveUrl ?? '',
          screenshots: existingScreenshots,
          overview: p.overview,
          contribution: p.contribution,
          body: p.body,
          featured: p.featured,
          order: p.order,
          published: p.published,
        });
      })
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load project.'))
      .finally(() => setLoading(false));
  }, [projectId, toastError]);

  // Prefill `order` for a brand-new project to the next free slot.
  useEffect(() => {
    if (projectId) return;
    adminProjects
      .list()
      .then((ps) => {
        const maxOrder = ps.length > 0 ? Math.max(...ps.map((p) => p.order)) : -1;
        setForm((f) => ({ ...f, order: maxOrder + 1 }));
      })
      .catch(() => {});
  }, [projectId]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toastError('Title and slug are required.');
      return;
    }
    setSaving(true);
    try {
      const { screenshots, ...rest } = form;
      const payload = {
        ...rest,
        liveUrl: form.liveUrl || undefined,
      };

      let ownerId: string;

      if (isNew) {
        const created = await adminProjects.create(payload);
        ownerId = created.id;
        // Upload pending screenshots linked to the new project.
        const errors = await reconcileMultiMedia({
          values: screenshots,
          originalMediaIds: [],
          ownerId,
          ownerType: 'project',
          usage: 'image',
          category: MediaCategory.Projects,
          entitySlug: form.slug,
        });
        if (errors.length > 0) {
          toastError(`Project created, but some images failed: ${errors.join('; ')}`);
        } else {
          success('Project created.');
        }
        router.replace(`/admin/projects/${created.id}`);
      } else {
        await adminProjects.update(projectId!, payload);
        ownerId = projectId!;
        const errors = await reconcileMultiMedia({
          values: screenshots,
          originalMediaIds: originalMediaIdsRef.current,
          ownerId,
          ownerType: 'project',
          usage: 'image',
          category: MediaCategory.Projects,
          entitySlug: form.slug,
        });
        if (errors.length > 0) {
          toastError(`Saved, but some images failed: ${errors.join('; ')}`);
        } else {
          success('Project saved.');
        }
        // Refresh to reflect server state (new mediaIds, resolved order).
        const refreshed = await adminProjects.get(projectId!);
        const refreshedScreenshots: ImageValue[] = (refreshed.screenshots ?? []).map((s) => ({
          mediaId: s.mediaId,
          url: s.url,
          alt: s.alt ?? '',
        }));
        originalMediaIdsRef.current = refreshedScreenshots.map((s) =>
          'mediaId' in s ? s.mediaId : '',
        );
        setForm((f) => ({ ...f, screenshots: refreshedScreenshots }));
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Loading…">
        <LoadingRows />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={isNew ? 'New Project' : `Edit: ${form.title || 'Project'}`}
      actions={
        <AdminButton loading={saving} onClick={handleSubmit} type="button">
          <Save size={14} aria-hidden="true" />
          {saving ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
        </AdminButton>
      }
    >
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-[13px] mb-5 transition-colors hover:text-[var(--accent)]"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All projects
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
        {/* Basic info */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Basic Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Title *"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
            />
            <AdminInput
              label="Slug *"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              hint="URL-safe identifier"
              required
            />
            <AdminInput
              label="One-liner"
              value={form.oneLiner}
              onChange={(e) => set('oneLiner', e.target.value)}
              placeholder="e.g. Bank-grade Monte Carlo platform"
              className="sm:col-span-2"
            />
            <AdminInput
              label="Role"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              placeholder="e.g. Full-Stack Engineer"
            />
            <AdminInput
              label="Headline metric"
              value={form.metric}
              onChange={(e) => set('metric', e.target.value)}
              placeholder="e.g. 148 models · 185 endpoints"
            />
          </div>
        </AdminCard>

        {/* Tags & Stack */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Tags & Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TagsInput
              label="Tags"
              value={form.tags}
              onChange={(tags) => set('tags', tags)}
            />
            <TagsInput
              label="Stack"
              value={form.stack}
              onChange={(stack) => set('stack', stack)}
              placeholder="Add technology…"
            />
          </div>
        </AdminCard>

        {/* Links */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Links
          </h2>
          <AdminInput
            label="Live URL"
            type="url"
            value={form.liveUrl ?? ''}
            onChange={(e) => set('liveUrl', e.target.value)}
            placeholder="https://…"
          />
        </AdminCard>

        {/* Media — deferred upload */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Media
          </h2>
          <p className="text-[12px] mb-3" style={{ color: 'var(--muted)' }}>
            Images are uploaded when you save. Reorder with the arrows on hover.
          </p>
          <MultiImageUpload
            label="Screenshots"
            category={MediaCategory.Projects}
            value={form.screenshots}
            onChange={(items) => set('screenshots', items)}
            entitySlug={form.slug}
            max={4}
          />
        </AdminCard>

        {/* Content */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Content
          </h2>
          <div className="flex flex-col gap-4">
            <AdminTextarea
              label="Overview"
              value={form.overview}
              onChange={(e) => set('overview', e.target.value)}
              rows={4}
            />
            <AdminTextarea
              label="My Contribution"
              value={form.contribution}
              onChange={(e) => set('contribution', e.target.value)}
              rows={4}
            />
            <AdminTextarea
              label="Body (MDX)"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={14}
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '13px' }}
              hint="Full MDX content for the detail page"
            />
          </div>
        </AdminCard>

        {/* Publishing */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Publishing
          </h2>
          <div className="flex flex-col gap-3">
            <AdminToggle
              label="Published (visible on public site)"
              checked={form.published}
              onChange={(v) => set('published', v)}
            />
            <AdminToggle
              label="Featured (shown in featured section)"
              checked={form.featured}
              onChange={(v) => set('featured', v)}
            />
            <AdminInput
              label="Order"
              type="number"
              value={form.order}
              onChange={(e) => set('order', Number(e.target.value))}
              hint="Lower number appears first"
            />
          </div>
        </AdminCard>

        <div className="flex justify-end">
          <AdminButton loading={saving} type="submit" disabled={saving}>
            <Save size={14} aria-hidden="true" />
            {saving ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </AdminShell>
  );
}

export default function AdminProjectEditPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';

  return (
    <ToastProvider>
      <ProjectFormContent projectId={isNew ? null : params.id} />
    </ToastProvider>
  );
}
