// ============================================================
//  FeaturedProjectsSection — 2-col project card grid.
//  Fetches featured projects from API. Server component.
// ============================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProjectCard } from './project-card';
import { getProjects } from '@/lib/api';
import { FALLBACK_PROJECTS } from '@/lib/fallback-data';
import type { FeaturedProjectsData } from '@/lib/types';

interface FeaturedProjectsSectionProps {
  data: FeaturedProjectsData;
  sectionNumber?: string;
}

export async function FeaturedProjectsSection({ data, sectionNumber }: FeaturedProjectsSectionProps) {
  let projects = await getProjects();
  if (projects.length === 0) projects = FALLBACK_PROJECTS;

  const limit = data.limit ?? 4;
  let featured = projects.filter((p) => p.featured).slice(0, limit);
  if (featured.length === 0) featured = projects.slice(0, limit);

  // If specific IDs are specified, use those
  if (data.projectIds && data.projectIds.length > 0) {
    const idSet = new Set(data.projectIds);
    featured = projects.filter((p) => idSet.has(p.id)).slice(0, limit);
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
