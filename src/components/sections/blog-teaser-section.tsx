// ============================================================
//  BlogTeaserSection — latest N blog post teasers.
//  Server component.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import { SectionCta } from '@/components/ui/section-cta';
import { BlogCard } from '@/components/sections/blog-card';
import { getBlogPosts } from '@/lib/api';
import type { BlogTeaserData } from '@/lib/types';

interface BlogTeaserSectionProps {
  data: BlogTeaserData;
  sectionNumber?: string;
}

export async function BlogTeaserSection({ data, sectionNumber }: BlogTeaserSectionProps) {
  const posts = await getBlogPosts();

  // Honor selection filter; default (mode absent or 'latest') = show by limit.
  // Only apply limit when it is a positive number — no hard default cap.
  const displayPosts =
    data.mode === 'selected' && data.ids && data.ids.length > 0
      ? (() => { const idSet = new Set(data.ids); return posts.filter((p) => idSet.has(p.id)); })()
      : data.limit && data.limit > 0
        ? posts.slice(0, data.limit)
        : posts;

  return (
    <section className="py-16" id="blog" aria-labelledby="blog-teaser-heading">
      <div className="wrap">
        {data.heading ? (
          <SectionHeading number={sectionNumber} title={data.heading} />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        <SectionCta cta={data.cta} />
      </div>
    </section>
  );
}
