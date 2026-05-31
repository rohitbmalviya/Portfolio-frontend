'use client';

// ============================================================
//  Project create / edit form
//  Route: /admin/projects/new  →  create
//         /admin/projects/:id  →  edit
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminProjects } from '@/lib/admin-api';
import type { Project, ProofType } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminToggle,
  AdminButton,
  AdminCard,
  TagsInput,
  LoadingRows,
} from '@/components/admin/ui';
import { MultiImageUpload, ImageUpload } from '@/components/admin/image-upload';

type FormState = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: FormState = {
  slug: '',
  title: '',
  oneLiner: '',
  role: '',
  tags: [],
  stack: [],
  metric: '',
  proofType: 'NONE',
  liveUrl: '',
  screenshots: [],
  architectureImg: '',
  overview: '',
  contribution: '',
  body: '',
  featured: false,
  order: 0,
  published: false,
};

const PROOF_TYPE_OPTIONS: { value: ProofType; label: string }[] = [
  { value: 'NONE', label: 'None' },
  { value: 'LIVE_DEMO', label: 'Live Demo' },
  { value: 'LIVE_LOGIN', label: 'Live (Login)' },
  { value: 'ARCHITECTURE', label: 'Architecture Diagram' },
];

function ProjectFormContent({ projectId }: { projectId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!projectId);
  const [saving, setSaving] = useState(false);
  const isNew = !projectId;

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    adminProjects
      .get(projectId)
      .then((p) => {
        setForm({
          slug: p.slug,
          title: p.title,
          oneLiner: p.oneLiner,
          role: p.role,
          tags: p.tags ?? [],
          stack: p.stack ?? [],
          metric: p.metric,
          proofType: p.proofType,
          liveUrl: p.liveUrl ?? '',
          screenshots: (p.screenshots ?? []) as Project['screenshots'],
          architectureImg: p.architectureImg ?? '',
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
      const payload = {
        ...form,
        liveUrl: form.liveUrl || undefined,
        architectureImg: form.architectureImg || undefined,
      };
      if (isNew) {
        const created = await adminProjects.create(payload);
        success('Project created.');
        router.replace(`/admin/projects/${created.id}`);
      } else {
        await adminProjects.update(projectId!, payload);
        success('Project saved.');
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
          {isNew ? 'Create project' : 'Save changes'}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-[760px]" noValidate>
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

        {/* Proof & Links */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Proof & Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminSelect
              label="Proof type"
              value={form.proofType}
              onChange={(e) => set('proofType', e.target.value as ProofType)}
              options={PROOF_TYPE_OPTIONS}
            />
            <AdminInput
              label="Live URL"
              type="url"
              value={form.liveUrl ?? ''}
              onChange={(e) => set('liveUrl', e.target.value)}
              placeholder="https://…"
            />
          </div>
        </AdminCard>

        {/* Media */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Media
          </h2>
          <div className="flex flex-col gap-5">
            <MultiImageUpload
              label="Screenshots"
              value={form.screenshots as Array<{ url: string; alt: string }>}
              onChange={(items) => set('screenshots', items)}
            />
            <ImageUpload
              label="Architecture diagram"
              value={form.architectureImg ?? null}
              onChange={(url) => set('architectureImg', url ?? '')}
              hint="For NDA projects without a live URL"
            />
          </div>
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

        {/* Flags */}
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
          <AdminButton loading={saving} type="submit">
            <Save size={14} aria-hidden="true" />
            {isNew ? 'Create project' : 'Save changes'}
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
