// ============================================================
//  BlogTeaserSection — latest N blog post teasers.
//  Server component.
// ============================================================

import Link from 'next/link';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Tag } from '@/components/ui/tag';
import { getBlogPosts } from '@/lib/api';
import { FALLBACK_BLOG_POSTS } from '@/lib/fallback-data';
import { formatBlogDate, readingTimeLabel } from '@/lib/utils';
import type { BlogTeaserData } from '@/lib/types';

interface BlogTeaserSectionProps {
  data: BlogTeaserData;
  sectionNumber?: string;
}

export async function BlogTeaserSection({ data, sectionNumber }: BlogTeaserSectionProps) {
  let posts = await getBlogPosts();
  if (posts.length === 0) posts = FALLBACK_BLOG_POSTS;

  const limit = data.limit ?? 3;
  const latest = posts.slice(0, limit);

  return (
    <section className="py-16" id="blog" aria-labelledby="blog-teaser-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Latest from the Blog'} />

        <div className="space-y-5">
          {latest.map((post) => (
            <article
              key={post.id}
              className={[
                'bg-[--surface] border border-[--border] rounded-[14px] p-5',
                'transition-all duration-[250ms]',
                'hover:border-[--accent] hover:-translate-y-[2px]',
                'hover:shadow-[var(--card-shadow),0_0_0_1px_var(--accent-glow)]',
              ].join(' ')}
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <h3 className="font-display font-semibold text-[17px] text-[--text] mb-2 group-hover:text-[--accent] transition-colors duration-150 tracking-[-0.3px]">
                  {post.title}
                </h3>
              </Link>

              <p className="text-[--muted] text-[14px] leading-[1.6] mb-3">{post.excerpt}</p>

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
                {post.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-7 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-[13px] text-[--accent] hover:opacity-75 transition-opacity"
          >
            All posts
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
