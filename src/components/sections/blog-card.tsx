// ============================================================
//  BlogCard — image card styled like ProjectCard.
//  Whole card is clickable (stretched link) → /blog/:slug.
//  Server component.
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { Tag } from '@/components/ui/tag';
import { formatBlogDate, readingTimeLabel } from '@/lib/utils';
import type { BlogPost } from '@/lib/types';

export function BlogCard({ post }: { post: BlogPost }) {
  const hasCover = !!post.coverImage;

  return (
    <article
      className={[
        'relative group bg-[--surface] border border-[--border] rounded-[16px] overflow-hidden',
        'transition-all duration-[250ms]',
        'hover:border-[--accent] hover:-translate-y-[4px]',
        'hover:shadow-[var(--card-shadow),0_0_0_1px_var(--accent-glow)]',
      ].join(' ')}
    >
      {/* Stretched link — the entire card navigates to the post */}
      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-[1]"
      />

      {/* Cover */}
      <div
        className={[
          'h-[150px] border-b border-[--border] relative flex items-center justify-center',
          'font-mono text-[12px] text-[--muted]',
          hasCover ? '' : 'bg-gradient-to-br from-[--thumb-from] to-[--thumb-to]',
        ].join(' ')}
        aria-hidden={!hasCover}
      >
        {hasCover ? (
          <Image
            src={post.coverImage as string}
            alt={post.title}
            fill
            sizes="(max-width: 760px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span className="select-none">[ cover ]</span>
        )}
      </div>

      {/* Body */}
      <div className="px-[22px] pt-5 pb-6">
        <h3 className="font-display text-[18px] font-semibold mb-[8px] text-[--text] tracking-[-0.3px] group-hover:text-[--accent] transition-colors duration-150">
          {post.title}
        </h3>
        <p className="text-[--muted] text-[14px] mb-[14px] leading-[1.6] line-clamp-3">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[--muted] font-mono">
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

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
