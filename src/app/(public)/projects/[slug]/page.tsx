// ============================================================
//  /projects/[slug] — Project detail page.
//  ISR: revalidate every 60s.
// ============================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { ExternalLink, ArrowLeft, Lock } from 'lucide-react';
import { getProject, getProjects } from '@/lib/api';
import { FALLBACK_PROJECTS } from '@/lib/fallback-data';
import { Tag, Pill } from '@/components/ui/tag';
import { LinkButton } from '@/components/ui/button';
import { proofLabel } from '@/lib/utils';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects().catch(() => FALLBACK_PROJECTS);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: project.title,
    description: project.oneLiner,
    openGraph: {
      title: `${project.title} — Rohit Malviya`,
      description: project.oneLiner,
      images: project.screenshots[0]
        ? [{ url: project.screenshots[0].url, alt: project.screenshots[0].alt || project.title }]
        : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  let project = await getProject(slug);

  // Fallback to static data if API is down
  if (!project) {
    project = FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null;
  }

  if (!project) notFound();

  const label = proofLabel(project.proofType);
  const isArch = project.proofType === 'ARCHITECTURE';
  const hasScreenshot = project.screenshots && project.screenshots.length > 0;

  return (
    <div className="py-12">
      <div className="wrap">
        {/* Back */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-[13px] text-[--muted] hover:text-[--accent] transition-colors duration-150 mb-10"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to projects
        </Link>

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14 items-start">
          {/* Left: meta */}
          <div>
            {label && <Pill className="mb-4">{label}</Pill>}

            <h1 className="font-display font-bold text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-1px] text-[--text] mb-3">
              {project.title}
            </h1>

            <p className="font-mono text-[14px] text-[--accent] mb-4">{project.role}</p>

            <p className="text-[--muted] text-[17px] leading-relaxed mb-6">{project.oneLiner}</p>

            {/* Stack tags */}
            {project.stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6" aria-label="Tech stack">
                {project.stack.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            )}

            {/* Metric */}
            {project.metric && (
              <p className="font-mono text-[12px] text-[--muted] mb-6">{project.metric}</p>
            )}

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && !isArch && (
                <LinkButton
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  aria-label={`${project.title} — live demo (opens in new tab)`}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  {label === 'live demo' ? 'Live demo' : 'Visit project'}
                </LinkButton>
              )}
              {isArch && (
                <div className="flex items-center gap-2 font-mono text-[13px] text-[--muted]">
                  <Lock size={14} aria-hidden="true" />
                  On-prem / NDA — no public URL
                </div>
              )}
            </div>
          </div>

          {/* Right: screenshot / arch diagram */}
          <div
            className={[
              'rounded-[16px] overflow-hidden border border-[--border]',
              'aspect-video relative',
              !hasScreenshot && !project.architectureImg
                ? 'bg-gradient-to-br from-[--thumb-from] to-[--thumb-to] flex items-center justify-center'
                : '',
            ].join(' ')}
          >
            {hasScreenshot ? (
              <Image
                src={project.screenshots[0].url}
                alt={project.screenshots[0].alt || project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : project.architectureImg ? (
              <Image
                src={project.architectureImg}
                alt={`${project.title} architecture diagram`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4"
                priority
              />
            ) : (
              <span className="font-mono text-[12px] text-[--muted] select-none">
                {isArch ? '[ architecture diagram ]' : '[ screenshot ]'}
              </span>
            )}
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          <div className="space-y-10">

            {/* Overview */}
            <section aria-labelledby="overview-heading">
              <h2
                id="overview-heading"
                className="font-display font-semibold text-[20px] text-[--text] mb-4 pb-3 border-b border-[--border] tracking-[-0.3px]"
              >
                Overview
              </h2>
              <p className="text-[--muted] text-[16px] leading-[1.75]">{project.overview}</p>
            </section>

            {/* My Contribution */}
            <section aria-labelledby="contribution-heading">
              <h2
                id="contribution-heading"
                className="font-display font-semibold text-[20px] text-[--text] mb-4 pb-3 border-b border-[--border] tracking-[-0.3px]"
              >
                My Contribution
              </h2>
              <p className="text-[--muted] text-[16px] leading-[1.75]">{project.contribution}</p>
            </section>

            {/* Architecture */}
            {(project.architectureImg || isArch) && (
              <section aria-labelledby="arch-heading">
                <h2
                  id="arch-heading"
                  className="font-display font-semibold text-[20px] text-[--text] mb-4 pb-3 border-b border-[--border] tracking-[-0.3px]"
                >
                  Architecture
                </h2>
                {project.architectureImg ? (
                  <div className="rounded-[12px] border border-[--border] overflow-hidden">
                    <Image
                      src={project.architectureImg}
                      alt={`${project.title} architecture diagram`}
                      width={900}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="rounded-[12px] border border-[--border] bg-gradient-to-br from-[--thumb-from] to-[--thumb-to] h-[200px] flex items-center justify-center font-mono text-[13px] text-[--muted]">
                    [ architecture diagram — coming soon ]
                  </div>
                )}
              </section>
            )}

            {/* Full body (MDX/markdown) */}
            {project.body && project.body.trim() !== '' && (
              <section aria-label="Project deep dive">
                <div className="prose">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSlug, rehypeHighlight]}
                  >
                    {project.body}
                  </ReactMarkdown>
                </div>
              </section>
            )}

            {/* NDA note for SCB */}
            {isArch && (
              <aside
                className="flex items-start gap-3 bg-[--surface] border border-[--border] rounded-[12px] p-4"
                aria-label="NDA notice"
              >
                <Lock size={16} className="text-[--muted] mt-[2px] shrink-0" aria-hidden="true" />
                <p className="text-[--muted] text-[14px] leading-relaxed">
                  <strong className="text-[--text]">NDA / Bank system.</strong> This is an
                  on-premises bank deployment (VPN-only). No public URL, no screenshots by design.
                  Architecture and role scope are shown above.
                </p>
              </aside>
            )}
          </div>

          {/* Sidebar: tech stack + key metrics */}
          <aside className="space-y-6">
            {/* Tech stack */}
            {project.stack.length > 0 && (
              <div className="bg-[--surface] border border-[--border] rounded-[14px] p-5">
                <h3 className="font-mono text-[12px] text-[--accent] mb-3 tracking-[0.5px]">
                  // TECH STACK
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Key metric */}
            {project.metric && (
              <div className="bg-[--surface] border border-[--border] rounded-[14px] p-5">
                <h3 className="font-mono text-[12px] text-[--accent] mb-3 tracking-[0.5px]">
                  // KEY METRICS
                </h3>
                <p className="text-[--muted] text-[13px] leading-relaxed">{project.metric}</p>
              </div>
            )}

            {/* Additional screenshots */}
            {project.screenshots.length > 1 && (
              <div className="bg-[--surface] border border-[--border] rounded-[14px] p-5">
                <h3 className="font-mono text-[12px] text-[--accent] mb-3 tracking-[0.5px]">
                  // SCREENSHOTS
                </h3>
                <div className="space-y-3">
                  {project.screenshots.slice(1).map((s, i) => (
                    <div key={i} className="relative aspect-video rounded-[8px] overflow-hidden border border-[--border]">
                      <Image
                        src={s.url}
                        alt={s.alt || `${project.title} screenshot ${i + 2}`}
                        fill
                        sizes="280px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
