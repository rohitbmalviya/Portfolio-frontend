// ============================================================
//  /projects — all projects in a single unified grid.
//  ISR: revalidate every 60s.
// ============================================================

import type { Metadata } from 'next';
import { getPage, getProjects, getSiteSettings } from '@/lib/api';
import { ProjectCard } from '@/components/sections/project-card';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('projects'), getSiteSettings()]);
  return buildPageMetadata({ page, settings, fallbackTitle: 'Projects' });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="py-16">
      <div className="wrap">
        {/* Page header */}
        <div className="mb-12 max-w-[640px]">
          <p className="font-mono text-[--accent] text-[13px] tracking-[1px] mb-4">
            ~/projects
          </p>
          <h1 className="font-display font-bold text-[clamp(32px,5vw,52px)] leading-[1.1] tracking-[-1px] text-[--text] mb-4">
            Production Systems
          </h1>
          <p className="text-[--muted] text-[17px] leading-relaxed">
            8 shipped platforms across fintech, AI hiring, real-estate, insurance, and meeting
            automation — mostly full-stack ownership at Humancloud Technologies.
          </p>
        </div>

        {/* All projects — one unified grid (ordered best-first) */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-[--muted] text-center py-24">No projects found.</p>
        )}
      </div>
    </div>
  );
}
