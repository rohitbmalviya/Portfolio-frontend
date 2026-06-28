// ============================================================
//  /blog/[slug] — Individual blog post.
//  Renders MDX/markdown body with syntax highlighting.
//  ISR: revalidate every 60s.
// ============================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { getBlogPost, getBlogPosts } from '@/lib/api';
import { Tag } from '@/components/ui/tag';
import { ScreenshotLightbox, LightboxTrigger, LightboxImg } from '@/components/projects/screenshot-lightbox';
import { formatBlogDate, readingTimeLabel } from '@/lib/utils';
import { SITE_OWNER } from '@/lib/site';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} — ${SITE_OWNER}`,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImage
        ? [{ url: post.coverImage, alt: post.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  // All zoomable images on this post: cover first, then markdown body images.
  const bodyImageUrls = post.body
    ? [...post.body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1])
    : [];
  const lightboxImages = [
    ...(post.coverImage ? [{ url: post.coverImage, alt: post.title }] : []),
    ...bodyImageUrls.map((url) => ({ url, alt: '' })),
  ];

  return (
    <div className="py-12">
      <div className="wrap">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-[13px] text-[--muted] hover:text-[--accent] transition-colors duration-150 mb-10"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to blog
        </Link>

        <ScreenshotLightbox screenshots={lightboxImages}>
        <article className="max-w-[720px]">
          {/* Header */}
          <header className="mb-10">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}

            <h1 className="font-display font-bold text-[clamp(26px,4vw,40px)] leading-[1.15] tracking-[-0.8px] text-[--text] mb-5">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 font-mono text-[12px] text-[--muted] pb-6 border-b border-[--border]">
              {post.publishedAt && (
                <span className="flex items-center gap-2">
                  <Calendar size={13} aria-hidden="true" />
                  <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                </span>
              )}
              {post.readingTime && (
                <span className="flex items-center gap-2">
                  <Clock size={13} aria-hidden="true" />
                  {readingTimeLabel(post.readingTime)}
                </span>
              )}
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative aspect-[21/9] rounded-[12px] overflow-hidden border border-[--border] mb-10">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 720px) 100vw, 720px"
                className="object-cover"
                priority
              />
              <LightboxTrigger
                index={0}
                ariaLabel="View cover image full size"
                className="absolute inset-0 z-10 cursor-zoom-in transition-colors hover:bg-black/10"
              />
            </div>
          )}

          {/* Excerpt */}
          <p className="text-[--muted] text-[18px] leading-[1.7] mb-8 italic border-l-2 border-[--accent] pl-4">
            {post.excerpt}
          </p>

          {/* Body */}
          {post.body && post.body.trim() !== '' ? (
            <div className="prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeHighlight]}
                components={{ img: LightboxImg }}
              >
                {post.body}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="bg-[--surface] border border-[--border] rounded-[12px] p-8 text-center">
              <p className="font-mono text-[--muted] text-[13px] mb-2">{'// full post coming soon'}</p>
              <p className="text-[--muted] text-[14px]">
                This post is being drafted. Check back shortly.
              </p>
            </div>
          )}
        </article>
        </ScreenshotLightbox>
      </div>
    </div>
  );
}
