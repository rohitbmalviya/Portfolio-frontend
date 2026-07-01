// ============================================================
//  SectionRenderer — maps section.type → component.
//  Renders all enabled sections of a page in order.
//  Each component is a Server Component; heavy async ones
//  (Skills, Experience, etc.) fetch their own data.
// ============================================================

import { HeroSection } from './hero-section';
import { AboutSection } from './about-section';
import { SkillsSection } from './skills-section';
import { ExperienceSection } from './experience-section';
import { FeaturedProjectsSection } from './featured-projects-section';
import { ProjectsGridSection } from './projects-grid-section';
import { BlogTeaserSection } from './blog-teaser-section';
import { AchievementsSection } from './achievements-section';
import { EducationSection } from './education-section';
import { ContactSection } from './contact-section';
import { MetricsSection } from './metrics-section';
import { RichTextSection } from './rich-text-section';
import { CtaSection } from './cta-section';
import { GallerySection } from './gallery-section';
import { ContentBlockSection } from './content-block-section';

import type { Section, SectionType } from '@/lib/types';
import type {
  HeroData, AboutData, SkillsData, ExperienceData,
  FeaturedProjectsData, ProjectsGridData, BlogTeaserData,
  AchievementsData, EducationData, ContactData,
  MetricsData, RichTextData, CtaData, GalleryData,
  ContentBlockData,
} from '@/lib/types';

// Section numbers for display (aligned with sample's "01.", "02." pattern)
// Generated from sorted order.
function sectionNumber(idx: number): string {
  return String(idx + 1).padStart(2, '0');
}

interface SectionRendererProps {
  sections: Section[];
}

export async function SectionRenderer({ sections }: SectionRendererProps) {
  // Sort by order, keep only enabled
  const enabled = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  // Sections that do NOT receive a sequential number prefix.
  // Everything else (ABOUT, SKILLS, EXPERIENCE, …) is numbered.
  // CONTENT_BLOCK renders its own custom header (eyebrow + heading) so no number is needed.
  const NON_NUMBERED_SECTIONS = new Set<SectionType>([
    'HERO', 'METRICS', 'RICH_TEXT', 'CTA', 'GALLERY', 'CONTENT_BLOCK',
  ]);
  let numberedCount = 0;

  return (
    <>
      {enabled.map((section) => {
        const isNumbered = !NON_NUMBERED_SECTIONS.has(section.type);
        const num = isNumbered ? sectionNumber(numberedCount++) : undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = section.data as any;

        switch (section.type) {
          case 'HERO':
            return <HeroSection key={section.id} data={data as HeroData} />;

          case 'ABOUT':
            return <AboutSection key={section.id} data={data as AboutData} sectionNumber={num} />;

          case 'SKILLS':
            return <SkillsSection key={section.id} data={data as SkillsData} sectionNumber={num} />;

          case 'EXPERIENCE':
            return <ExperienceSection key={section.id} data={data as ExperienceData} sectionNumber={num} />;

          case 'FEATURED_PROJECTS':
            return (
              <FeaturedProjectsSection
                key={section.id}
                data={data as FeaturedProjectsData}
                sectionNumber={num}
              />
            );

          case 'PROJECTS_GRID':
            return (
              <ProjectsGridSection
                key={section.id}
                data={data as ProjectsGridData}
                sectionNumber={num}
              />
            );

          case 'BLOG_TEASER':
            return (
              <BlogTeaserSection
                key={section.id}
                data={data as BlogTeaserData}
                sectionNumber={num}
              />
            );

          case 'ACHIEVEMENTS':
            return (
              <AchievementsSection
                key={section.id}
                data={data as AchievementsData}
                sectionNumber={num}
              />
            );

          case 'EDUCATION':
            return (
              <EducationSection
                key={section.id}
                data={data as EducationData}
                sectionNumber={num}
              />
            );

          case 'CONTACT':
            return (
              <ContactSection
                key={section.id}
                data={data as ContactData}
                sectionNumber={num}
              />
            );

          case 'METRICS':
            return <MetricsSection key={section.id} data={data as MetricsData} />;

          case 'RICH_TEXT':
            return (
              <RichTextSection
                key={section.id}
                data={data as RichTextData}
                sectionNumber={num}
              />
            );

          case 'CTA':
            return <CtaSection key={section.id} data={data as CtaData} />;

          case 'GALLERY':
            return <GallerySection key={section.id} data={data as GalleryData} />;

          case 'CONTENT_BLOCK':
            return (
              <ContentBlockSection
                key={section.id}
                data={data as ContentBlockData}
                sectionNumber={num}
              />
            );

          default:
            // Unknown section type — render nothing in production, warn in dev
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[SectionRenderer] Unknown section type: ${section.type}`);
            }
            return null;
        }
      })}
    </>
  );
}
