// ============================================================
//  FeaturedProjectsSection — 2-col project card grid.
//  Fetches featured projects from API. Server component.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import { SectionCta } from '@/components/ui/section-cta';
import { ProjectCard } from './project-card';
import { getProjects } from '@/lib/api';
import type { FeaturedProjectsData } from '@/lib/types';

interface FeaturedProjectsSectionProps {
  data: FeaturedProjectsData;
  sectionNumber?: string;
}

export async function FeaturedProjectsSection({ data, sectionNumber }: FeaturedProjectsSectionProps) {
  const projects = await getProjects();

  // Only apply a limit when data.limit is a positive number — no hard default cap.
  const cap = <T,>(arr: T[]): T[] =>
    data.limit && data.limit > 0 ? arr.slice(0, data.limit) : arr;

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
      featured = cap(projects);
    }
  } else {
    // Default: auto-select featured projects; legacy projectIds honored for old data
    featured = cap(projects.filter((p) => p.featured));
    if (featured.length === 0) featured = cap(projects);
    if (data.projectIds && data.projectIds.length > 0) {
      const idSet = new Set(data.projectIds);
      featured = cap(projects.filter((p) => idSet.has(p.id)));
    }
  }

  return (
    <section className="py-16" id="work" aria-labelledby="featured-projects-heading">
      <div className="wrap">
        {data.heading ? (
          <SectionHeading number={sectionNumber} title={data.heading} />
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <SectionCta cta={data.cta} />
      </div>
    </section>
  );
}
