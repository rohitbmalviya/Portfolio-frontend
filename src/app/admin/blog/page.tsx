'use client';

// ============================================================
//  Admin Blog list
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Rss, Globe } from 'lucide-react';
import { adminBlog } from '@/lib/admin-api';
import type { BlogPost } from '@/lib/types';
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
import { formatBlogDate } from '@/lib/utils';

function BlogContent() {
  const { success, error: toastError } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminBlog
      .list()
      .then(setPosts)
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load posts.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggle(post: BlogPost) {
    try {
      const updated = await adminBlog.togglePublished(post.id);
      setPosts((p) => p.map((x) => (x.id === post.id ? updated : x)));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminBlog.delete(deleteTarget.id);
      setPosts((p) => p.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      success('Post deleted.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell
      title="Blog"
      description="Manage blog posts."
      actions={
        <Link href="/admin/blog/new">
          <AdminButton><Plus size={14} aria-hidden="true" /> New post</AdminButton>
        </Link>
      }
    >
      {loading ? (
        <LoadingRows />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Rss size={20} />}
          title="No blog posts yet"
          action={
            <Link href="/admin/blog/new">
              <AdminButton><Plus size={14} /> Write first post</AdminButton>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <AdminCard key={post.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                    {post.title}
                  </span>
                  {post.published ? (
                    <AdminBadge variant="success">Published</AdminBadge>
                  ) : (
                    <AdminBadge variant="warning">Draft</AdminBadge>
                  )}
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {post.slug}
                  {post.publishedAt && ` · ${formatBlogDate(post.publishedAt)}`}
                  {post.readingTime && ` · ${post.readingTime} min read`}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0 flex-wrap">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(post)}
                >
                  <Globe size={13} aria-hidden="true" />
                  {post.published ? 'Unpublish' : 'Publish'}
                </AdminButton>
                <Link href={`/admin/blog/${post.id}`}>
                  <AdminButton variant="ghost" size="sm" type="button">Edit</AdminButton>
                </Link>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(post)}
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
        title="Delete post"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AdminShell>
  );
}

export default function AdminBlogPage() {
  return (
    <ToastProvider>
      <BlogContent />
    </ToastProvider>
  );
}
