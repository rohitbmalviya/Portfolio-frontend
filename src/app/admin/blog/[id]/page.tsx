'use client';

// ============================================================
//  Blog post create / edit form
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminBlog } from '@/lib/admin-api';
import type { BlogPost } from '@/lib/types';
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
import { ImageUpload } from '@/components/admin/image-upload';
import { MediaCategory } from '@/lib/media';

type FormState = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>;

const EMPTY: FormState = {
  slug: '',
  title: '',
  excerpt: '',
  coverImage: '',
  tags: [],
  body: '',
  readingTime: null,
  published: false,
};

function BlogFormContent({ postId }: { postId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const isNew = !postId;

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    adminBlog
      .get(postId)
      .then((p) => {
        setForm({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          coverImage: p.coverImage ?? '',
          tags: p.tags ?? [],
          body: p.body,
          readingTime: p.readingTime ?? null,
          published: p.published,
        });
      })
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load post.'))
      .finally(() => setLoading(false));
  }, [postId, toastError]);

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
        coverImage: form.coverImage || undefined,
      };
      if (isNew) {
        const created = await adminBlog.create(payload);
        success('Post created.');
        router.replace(`/admin/blog/${created.id}`);
      } else {
        await adminBlog.update(postId!, payload);
        success('Post saved.');
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
      title={isNew ? 'New Blog Post' : `Edit: ${form.title || 'Post'}`}
      actions={
        <AdminButton loading={saving} onClick={handleSubmit} type="button">
          <Save size={14} aria-hidden="true" />
          {isNew ? 'Create post' : 'Save changes'}
        </AdminButton>
      }
    >
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-[13px] mb-5 transition-colors hover:text-[var(--accent)]"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All posts
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Post Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Title *"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              className="sm:col-span-2"
            />
            <AdminInput
              label="Slug *"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              hint="URL-safe"
              required
            />
            <AdminInput
              label="Reading time (min)"
              type="number"
              value={form.readingTime ?? ''}
              onChange={(e) =>
                set('readingTime', e.target.value ? Number(e.target.value) : null)
              }
              min={1}
            />
            <div>
              <TagsInput
                label="Tags"
                value={form.tags}
                onChange={(tags) => set('tags', tags)}
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea
                label="Excerpt"
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Cover Image
          </h2>
          <ImageUpload
            category={MediaCategory.Blogs}
            value={form.coverImage ?? null}
            onChange={(url) => set('coverImage', url ?? '')}
            hint="Recommended: 1200×630px"
            entitySlug={form.slug}
          />
        </AdminCard>

        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Body (MDX)
          </h2>
          <AdminTextarea
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            rows={20}
            style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '13px' }}
            hint="Full MDX / Markdown content"
          />
        </AdminCard>

        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Publishing
          </h2>
          <AdminToggle
            label="Published (visible on public site)"
            checked={form.published}
            onChange={(v) => set('published', v)}
          />
        </AdminCard>

        <div className="flex justify-end">
          <AdminButton loading={saving} type="submit">
            <Save size={14} aria-hidden="true" />
            {isNew ? 'Create post' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </AdminShell>
  );
}

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';
  return (
    <ToastProvider>
      <BlogFormContent postId={isNew ? null : params.id} />
    </ToastProvider>
  );
}
