// ============================================================
//  ProjectsGridSection — compact grid (all or filtered).
//  Server component.
// ============================================================

import { SectionHeading } from '@/components/ui/section-heading';
import { ProjectCard } from './project-card';
import { getProjects } from '@/lib/api';
import type { ProjectsGridData } from '@/lib/types';

interface ProjectsGridSectionProps {
  data: ProjectsGridData;
  sectionNumber?: string;
}

export async function ProjectsGridSection({ data, sectionNumber }: ProjectsGridSectionProps) {
  const projects = await getProjects();

  // Filter
  let filtered = projects;
  if (data.filter === 'featured') {
    filtered = projects.filter((p) => p.featured);
  } else if (data.filter && data.filter !== 'all') {
    filtered = projects.filter((p) => p.tags.includes(data.filter!));
  }

  if (data.limit) filtered = filtered.slice(0, data.limit);

  return (
    <section className="py-16" aria-labelledby="projects-grid-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'All Projects'} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
