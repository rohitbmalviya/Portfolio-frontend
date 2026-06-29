'use client';

// ============================================================
//  Blog post create / edit form
//
//  Deferred-upload flow:
//   Create → adminBlog.create → get id → reconcileMultiMedia
//   Update → adminBlog.update → reconcileMultiMedia
//  images[0] becomes the cover (handled by the backend).
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminBlog } from '@/lib/admin-api';
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
  excerpt: string;
  images: ImageValue[];
  tags: string[];
  body: string;
  readingTime: number | null;
  published: boolean;
}

const EMPTY: FormState = {
  slug: '',
  title: '',
  excerpt: '',
  images: [],
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

  // Track originalMediaIds to detect additions/removals on update.
  const originalMediaIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    adminBlog
      .get(postId)
      .then((p) => {
        const existingImages: ImageValue[] = (p.images ?? []).map((img) => ({
          mediaId: img.mediaId,
          url: img.url,
          alt: img.alt ?? '',
        }));
        originalMediaIdsRef.current = existingImages.map((img) =>
          'mediaId' in img ? img.mediaId : '',
        );
        setForm({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          images: existingImages,
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
      const { images, ...rest } = form;
      const payload = { ...rest };

      let ownerId: string;

      if (isNew) {
        const created = await adminBlog.create(payload);
        ownerId = created.id;
        const errors = await reconcileMultiMedia({
          values: images,
          originalMediaIds: [],
          ownerId,
          ownerType: 'blog',
          usage: 'image',
          category: MediaCategory.Blogs,
          entitySlug: form.slug,
        });
        if (errors.length > 0) {
          toastError(`Post created, but some images failed: ${errors.join('; ')}`);
        } else {
          success('Post created.');
        }
        router.replace(`/admin/blog/${created.id}`);
      } else {
        await adminBlog.update(postId!, payload);
        ownerId = postId!;
        const errors = await reconcileMultiMedia({
          values: images,
          originalMediaIds: originalMediaIdsRef.current,
          ownerId,
          ownerType: 'blog',
          usage: 'image',
          category: MediaCategory.Blogs,
          entitySlug: form.slug,
        });
        if (errors.length > 0) {
          toastError(`Saved, but some images failed: ${errors.join('; ')}`);
        } else {
          success('Post saved.');
        }
        // Refresh to reflect server state.
        const refreshed = await adminBlog.get(postId!);
        const refreshedImages: ImageValue[] = (refreshed.images ?? []).map((img) => ({
          mediaId: img.mediaId,
          url: img.url,
          alt: img.alt ?? '',
        }));
        originalMediaIdsRef.current = refreshedImages.map((img) =>
          'mediaId' in img ? img.mediaId : '',
        );
        setForm((f) => ({ ...f, images: refreshedImages }));
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
          {saving ? 'Saving…' : isNew ? 'Create post' : 'Save changes'}
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
            Images
          </h2>
          <p className="text-[12px] mb-3" style={{ color: 'var(--muted)' }}>
            The first image becomes the cover. Recommended: 1200×630 px.
            Images are uploaded when you save. Reorder with the arrows on hover.
          </p>
          <MultiImageUpload
            category={MediaCategory.Blogs}
            value={form.images}
            onChange={(items) => set('images', items)}
            entitySlug={form.slug}
            max={4}
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
          <AdminButton loading={saving} type="submit" disabled={saving}>
            <Save size={14} aria-hidden="true" />
            {saving ? 'Saving…' : isNew ? 'Create post' : 'Save changes'}
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
