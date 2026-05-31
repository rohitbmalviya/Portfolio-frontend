// ============================================================
//  ProjectCard — matches the sample card exactly.
//  hover: border-accent + lift + shadow + glow ring.
//  Server component.
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Star } from 'lucide-react';
import { Tag, Pill } from '@/components/ui/tag';
import { proofLabel } from '@/lib/utils';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const label = proofLabel(project.proofType);
  const isArch = project.proofType === 'ARCHITECTURE';
  const hasScreenshot = project.screenshots && project.screenshots.length > 0;

  return (
    <article
      className={[
        'bg-[--surface] border border-[--border] rounded-[16px] overflow-hidden',
        'transition-all duration-[250ms]',
        'hover:border-[--accent] hover:-translate-y-[4px]',
        'hover:shadow-[var(--card-shadow),0_0_0_1px_var(--accent-glow)]',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div
        className={[
          'h-[150px] border-b border-[--border] relative flex items-center justify-center',
          'font-mono text-[12px] text-[--muted]',
          hasScreenshot ? '' : 'bg-gradient-to-br from-[--thumb-from] to-[--thumb-to]',
        ].join(' ')}
        aria-hidden={!hasScreenshot}
      >
        {hasScreenshot ? (
          <Image
            src={project.screenshots[0].url}
            alt={project.screenshots[0].alt || project.title}
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <span className="select-none">{isArch ? '[ system diagram ]' : '[ screenshot ]'}</span>
        )}

        {/* Proof label pill */}
        {label && (
          <Pill className="absolute top-3 left-3">{label}</Pill>
        )}

        {/* Featured star */}
        {project.featured && (
          <span className="absolute top-3 right-3 text-[--accent]" aria-label="Featured project">
            <Star size={14} fill="currentColor" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="px-[22px] pt-5 pb-6">
        <h3 className="font-display text-[18px] font-semibold mb-[6px] text-[--text] tracking-[-0.3px]">
          {project.title}
        </h3>
        <p className="font-mono text-[13px] text-[--accent] mb-[10px]">{project.role}</p>
        <p className="text-[--muted] text-[14px] mb-[14px] leading-[1.6]">{project.oneLiner}</p>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" aria-label="Technologies used">
            {project.tags.slice(0, 5).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap items-center gap-[18px] text-[13px] mt-1">
          {project.liveUrl && project.proofType !== 'ARCHITECTURE' && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--accent] hover:opacity-75 transition-opacity flex items-center gap-1"
              aria-label={`${project.title} — live demo (opens in new tab)`}
            >
              Live demo
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          )}
          <Link
            href={`/projects/${project.slug}`}
            className="text-[--muted] hover:text-[--text] transition-colors duration-150"
          >
            {isArch ? 'Architecture & role →' : 'Details →'}
          </Link>
        </div>
      </div>
    </article>
  );
}
