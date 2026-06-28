// ============================================================
//  BlogTeaserSection — latest N blog post teasers.
//  Server component.
// ============================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { BlogCard } from '@/components/sections/blog-card';
import { getBlogPosts } from '@/lib/api';
import type { BlogTeaserData } from '@/lib/types';

interface BlogTeaserSectionProps {
  data: BlogTeaserData;
  sectionNumber?: string;
}

export async function BlogTeaserSection({ data, sectionNumber }: BlogTeaserSectionProps) {
  const posts = await getBlogPosts();

  // Honor selection filter; default (mode absent or 'latest') = show by limit
  const displayPosts =
    data.mode === 'selected' && data.ids && data.ids.length > 0
      ? (() => { const idSet = new Set(data.ids); return posts.filter((p) => idSet.has(p.id)); })()
      : posts.slice(0, data.limit ?? 3);

  return (
    <section className="py-16" id="blog" aria-labelledby="blog-teaser-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Latest from the Blog'} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
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
