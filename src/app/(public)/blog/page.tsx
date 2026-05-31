// ============================================================
//  /blog — Blog post index.
//  ISR: revalidate every 60s.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { getBlogPosts } from '@/lib/api';
import { FALLBACK_BLOG_POSTS } from '@/lib/fallback-data';
import { Tag } from '@/components/ui/tag';
import { formatBlogDate, readingTimeLabel } from '@/lib/utils';

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

        {/* Posts list */}
        {posts.length > 0 ? (
          <div className="space-y-5 max-w-[760px]">
            {posts.map((post) => (
              <article
                key={post.id}
                className={[
                  'bg-[--surface] border border-[--border] rounded-[14px] overflow-hidden',
                  'transition-all duration-[250ms]',
                  'hover:border-[--accent] hover:-translate-y-[2px]',
                  'hover:shadow-[var(--card-shadow),0_0_0_1px_var(--accent-glow)]',
                ].join(' ')}
              >
                {/* Cover image */}
                {post.coverImage && (
                  <div className="relative h-[200px]">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 760px) 100vw, 760px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}

                  <Link href={`/blog/${post.slug}`} className="group block mb-2">
                    <h2 className="font-display font-semibold text-[20px] text-[--text] group-hover:text-[--accent] transition-colors duration-150 tracking-[-0.4px] leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-[--muted] text-[14px] leading-[1.65] mb-4">{post.excerpt}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-[--muted] font-mono">
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} aria-hidden="true" />
                        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                      </span>
                    )}
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} aria-hidden="true" />
                        {readingTimeLabel(post.readingTime)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
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
