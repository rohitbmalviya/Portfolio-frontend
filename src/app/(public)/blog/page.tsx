// ============================================================
//  /blog — Blog post index.
//  ISR: revalidate every 60s.
// ============================================================

import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/api';
import { FALLBACK_BLOG_POSTS } from '@/lib/fallback-data';
import { BlogCard } from '@/components/sections/blog-card';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Technical writing on production systems, architecture, fintech engineering, and full-stack development.',
  openGraph: {
    title: 'Blog — Rohit Malviya',
    description:
      'Deep dives on production systems, Monte Carlo engines, multi-tenant SaaS, and more.',
  },
};

export default async function BlogIndexPage() {
  let posts = await getBlogPosts();
  if (posts.length === 0) posts = FALLBACK_BLOG_POSTS;

  return (
    <div className="py-16">
      <div className="wrap">
        {/* Header */}
        <div className="mb-12 max-w-[600px]">
          <p className="font-mono text-[--accent] text-[13px] tracking-[1px] mb-4">~/blog</p>
          <h1 className="font-display font-bold text-[clamp(32px,5vw,52px)] leading-[1.1] tracking-[-1px] text-[--text] mb-4">
            Writing
          </h1>
          <p className="text-[--muted] text-[17px] leading-relaxed">
            Technical deep-dives on production systems, architecture decisions, and the craft of
            shipping software.
          </p>
        </div>

        {/* Posts grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-mono text-[--muted] text-[14px] mb-2">// no posts yet</p>
            <p className="text-[--muted]">Posts are coming soon — check back shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
