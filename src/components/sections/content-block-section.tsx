// ============================================================
//  ContentBlockSection — flexible CMS block.
//  Renders eyebrow + heading + paragraphs + optional collection.
//  All fields are optional / admin-set.
//  Returns null only when there is no header AND no collection items.
//  Async Server Component — fetches collection data when source is set.
// ============================================================

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SectionCta } from '@/components/ui/section-cta';
import {
  getProjects,
  getBlogPosts,
  getSkillsGrouped,
  getExperience,
  getEducation,
  getAchievements,
} from '@/lib/api';
import { ProjectCard } from './project-card';
import { BlogCard } from './blog-card';
import { ExperienceCards } from './experience-section';
import { EducationCards } from './education-section';
import { SkillsCards } from './skills-section';
import { AchievementsCards } from './achievements-section';
import type { ContentBlockData, SkillGroupSection } from '@/lib/types';

interface ContentBlockSectionProps {
  data: ContentBlockData;
  /** Accepted for interface consistency but not rendered — block has its own header. */
  sectionNumber?: string;
}

export async function ContentBlockSection({ data }: ContentBlockSectionProps) {
  const hasHeader = !!(
    data.eyebrow ||
    data.heading ||
    (data.paragraphs && data.paragraphs.length > 0)
  );

  const isCenter = data.align === 'center';
  const source = data.source;
  const mode = data.mode ?? 'all';
  const limit = data.limit;
  const ids = data.ids ?? [];

  // ── Fetch + filter collection ─────────────────────────────────
  // mode logic:
  //   selected → filter by ids[], preserve order, then cap by limit
  //   latest   → take first `limit` items (intended for "newest N")
  //   all      → show all, optionally capped by limit
  let collectionNode: ReactNode = null;

  if (source && source !== 'none') {
    if (source === 'projects') {
      let projects = await getProjects();
      if (mode === 'selected' && ids.length > 0) {
        const idMap = new Map(projects.map((p) => [p.id, p]));
        projects = ids.flatMap((id) => (idMap.has(id) ? [idMap.get(id)!] : []));
      }
      if (limit) projects = projects.slice(0, limit);

      if (projects.length > 0) {
        collectionNode = (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        );
      }
    } else if (source === 'blog') {
      let posts = await getBlogPosts();
      if (mode === 'selected' && ids.length > 0) {
        const idMap = new Map(posts.map((p) => [p.id, p]));
        posts = ids.flatMap((id) => (idMap.has(id) ? [idMap.get(id)!] : []));
      }
      if (limit) posts = posts.slice(0, limit);

      if (posts.length > 0) {
        collectionNode = (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
            {posts.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        );
      }
    } else if (source === 'skills') {
      let sections: SkillGroupSection[] = await getSkillsGrouped();
      if (mode === 'selected' && ids.length > 0) {
        const idSet = new Set(ids);
        sections = sections
          .map((sec) => ({ ...sec, skills: sec.skills.filter((s) => idSet.has(s.id)) }))
          .filter((sec) => sec.skills.length > 0);
      }
      if (limit) sections = sections.slice(0, limit);

      if (sections.length > 0) {
        collectionNode = <SkillsCards sections={sections} />;
      }
    } else if (source === 'experience') {
      let experiences = await getExperience();
      if (mode === 'selected' && ids.length > 0) {
        const idMap = new Map(experiences.map((e) => [e.id, e]));
        experiences = ids.flatMap((id) => (idMap.has(id) ? [idMap.get(id)!] : []));
      }
      if (limit) experiences = experiences.slice(0, limit);

      if (experiences.length > 0) {
        collectionNode = <ExperienceCards experiences={experiences} />;
      }
    } else if (source === 'education') {
      let education = await getEducation();
      if (mode === 'selected' && ids.length > 0) {
        const idMap = new Map(education.map((e) => [e.id, e]));
        education = ids.flatMap((id) => (idMap.has(id) ? [idMap.get(id)!] : []));
      }
      if (limit) education = education.slice(0, limit);

      if (education.length > 0) {
        collectionNode = <EducationCards items={education} />;
      }
    } else if (source === 'achievements') {
      let achievements = await getAchievements();
      if (mode === 'selected' && ids.length > 0) {
        const idMap = new Map(achievements.map((a) => [a.id, a]));
        achievements = ids.flatMap((id) => (idMap.has(id) ? [idMap.get(id)!] : []));
      }
      if (limit) achievements = achievements.slice(0, limit);

      if (achievements.length > 0) {
        collectionNode = <AchievementsCards achievements={achievements} />;
      }
    }
  }

  // Return null only when there is no header AND no collection items.
  if (!hasHeader && !collectionNode) return null;

  return (
    <section className="py-16" aria-label={data.heading ?? 'Content block'}>
      <div className="wrap">
        {/* ── Header ─────────────────────────────────────────── */}
        {hasHeader && (
          <div className={cn(isCenter && 'text-center')}>
            {data.eyebrow && (
              <p className="font-mono text-[12px] text-[--accent] mb-3 tracking-[0.5px] uppercase">
                {data.eyebrow}
              </p>
            )}
            {data.heading && (
              <h2 className="font-display font-semibold text-[26px] tracking-[-0.5px] text-[--text] mb-4">
                {data.heading}
              </h2>
            )}
            {data.paragraphs && data.paragraphs.length > 0 && (
              <div
                className={cn(
                  'space-y-3',
                  isCenter ? 'max-w-[600px] mx-auto' : 'max-w-[640px]',
                )}
              >
                {data.paragraphs.map((p, i) => (
                  <p key={i} className="text-[--muted] text-[16px] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Collection cards ───────────────────────────────── */}
        {collectionNode && (
          <div className={cn(hasHeader && 'mt-10')}>{collectionNode}</div>
        )}

        {/* ── CTA ────────────────────────────────────────────── */}
        <SectionCta cta={data.cta} />
      </div>
    </section>
  );
}
