// ============================================================
//  FeaturedProjectsSection — 2-col project card grid.
//  Fetches featured projects from API. Server component.
// ============================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProjectCard } from './project-card';
import { getProjects } from '@/lib/api';
import type { FeaturedProjectsData } from '@/lib/types';

interface FeaturedProjectsSectionProps {
  data: FeaturedProjectsData;
  sectionNumber?: string;
}

export async function FeaturedProjectsSection({ data, sectionNumber }: FeaturedProjectsSectionProps) {
  const projects = await getProjects();

  const limit = data.limit ?? 4;
  let featured: typeof projects;

  if (data.mode === 'selected') {
    // Prefer data.ids (new); fall back to legacy data.projectIds
    const idsToUse =
      data.ids && data.ids.length > 0 ? data.ids
        : data.projectIds && data.projectIds.length > 0 ? data.projectIds
        : [];
    if (idsToUse.length > 0) {
      const idSet = new Set(idsToUse);
      featured = projects.filter((p) => idSet.has(p.id));
    } else {
      featured = projects.slice(0, limit);
    }
  } else {
    // Default: auto-select featured projects; legacy projectIds honored for old data
    featured = projects.filter((p) => p.featured).slice(0, limit);
    if (featured.length === 0) featured = projects.slice(0, limit);
    if (data.projectIds && data.projectIds.length > 0) {
      const idSet = new Set(data.projectIds);
      featured = projects.filter((p) => idSet.has(p.id)).slice(0, limit);
    }
  }

  return (
    <section className="py-16" id="work" aria-labelledby="featured-projects-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Selected Work'} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* View all */}
        <div className="mt-8 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-[13px] text-[--accent] hover:opacity-75 transition-opacity"
          >
            View all projects
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
