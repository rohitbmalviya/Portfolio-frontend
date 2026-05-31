// ============================================================
//  lib/types.ts — TypeScript mirror of the backend Prisma schema
//  Source of truth: portfolio-backend/prisma/schema.prisma + step4 §3.2
// ============================================================

// ── Enums ─────────────────────────────────────────────────────

export type PageType =
  | 'HOME'
  | 'PROJECTS'
  | 'PROJECT_DETAIL'
  | 'BLOG'
  | 'BLOG_POST'
  | 'ABOUT'
  | 'CONTACT'
  | 'CUSTOM';

export type SectionType =
  | 'HERO'
  | 'ABOUT'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'FEATURED_PROJECTS'
  | 'PROJECTS_GRID'
  | 'BLOG_TEASER'
  | 'ACHIEVEMENTS'
  | 'EDUCATION'
  | 'CONTACT'
  | 'METRICS'
  | 'RICH_TEXT'
  | 'CTA'
  | 'GALLERY';

export type ProofType = 'LIVE_DEMO' | 'LIVE_LOGIN' | 'ARCHITECTURE' | 'NONE';

export type SkillGroup =
  | 'LANGUAGES'
  | 'FRONTEND'
  | 'BACKEND'
  | 'DATA'
  | 'CLOUD_DEVOPS'
  | 'AI';

export type SkillLevel = 'EXPERT' | 'PROFICIENT' | 'FAMILIAR';

export type AchievementType = 'AWARD' | 'EDUCATION' | 'MENTORING';

export type DefaultTheme = 'DARK' | 'LIGHT';

// ── Shared sub-shapes ─────────────────────────────────────────

export interface MediaItem {
  url: string;
  alt: string;
}

// ── Page + Section ────────────────────────────────────────────

export interface Page {
  id: string;
  slug: string;
  title: string;
  type: PageType;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  navLabel?: string | null;
  navOrder: number;
  showInNav: boolean;
  published: boolean;
  isSystem: boolean;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  pageId: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  data: SectionData;
  createdAt: string;
  updatedAt: string;
}

// ── Per-section data shapes (step4 §3.2) ─────────────────────

export interface HeroButton {
  label: string;
  href: string;
  style: 'primary' | 'ghost';
}

export interface HeroMetric {
  value: string;
  label: string;
}

export interface HeroData {
  eyebrow: string;
  name: string;
  gradientLine: string;
  subhead: string;
  buttons: HeroButton[];
  metrics: HeroMetric[];
}

export interface AboutData {
  heading: string;
  paragraphs: string[];
}

export interface SkillInline {
  label: string;
  items: string[];
}

export interface SkillsData {
  heading: string;
  source?: 'skills-table';
  groups?: SkillInline[];
}

export interface ExperienceData {
  heading: string;
  source?: 'experience-table';
}

export interface FeaturedProjectsData {
  heading: string;
  projectIds?: string[];
  auto?: 'featured';
  limit?: number;
}

export interface ProjectsGridData {
  heading: string;
  filter?: 'all' | 'featured' | string;
  limit?: number;
}

export interface BlogTeaserData {
  heading: string;
  limit?: number;
}

export interface AchievementsData {
  heading: string;
  source?: 'achievements-table';
}

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
  detail?: string;
}

export interface EducationData {
  heading: string;
  items: EducationItem[];
}

export interface ContactData {
  heading: string;
  blurb: string;
  showForm: boolean;
  email: string;
  socials?: Record<string, string>;
  resumeUrl?: string;
}

export interface MetricsData {
  items: Array<{ value: string; label: string }>;
}

export interface RichTextData {
  heading?: string;
  body: string;
}

export interface CtaData {
  heading: string;
  text: string;
  button: { label: string; href: string };
}

export interface GalleryData {
  heading?: string;
  images: MediaItem[];
}

// Discriminated union for exhaustive section rendering
export type SectionData =
  | HeroData
  | AboutData
  | SkillsData
  | ExperienceData
  | FeaturedProjectsData
  | ProjectsGridData
  | BlogTeaserData
  | AchievementsData
  | EducationData
  | ContactData
  | MetricsData
  | RichTextData
  | CtaData
  | GalleryData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Record<string, any>;

// ── Project ───────────────────────────────────────────────────

export interface Project {
  id: string;
  slug: string;
  title: string;
  oneLiner: string;
  role: string;
  tags: string[];
  stack: string[];
  metric: string;
  proofType: ProofType;
  liveUrl?: string | null;
  screenshots: MediaItem[];
  architectureImg?: string | null;
  overview: string;
  contribution: string;
  body: string;
  featured: boolean;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── BlogPost ──────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  tags: string[];
  body: string;
  readingTime?: number | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Skill ─────────────────────────────────────────────────────

export interface Skill {
  id: string;
  group: SkillGroup;
  name: string;
  level: SkillLevel;
  order: number;
}

// ── Experience ────────────────────────────────────────────────

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  order: number;
}

// ── Achievement ───────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  year?: string | null;
  type: AchievementType;
  order: number;
}

// ── SiteSettings ──────────────────────────────────────────────

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

export interface SiteSettings {
  id: string;
  name: string;
  tagline: string;
  email: string;
  location: string;
  socials: SocialLinks;
  resumeUrl?: string | null;
  defaultTheme: DefaultTheme;
  brandAccent?: string | null;
  footerText?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── API response wrappers ─────────────────────────────────────

export interface ApiList<T> {
  data: T[];
  total?: number;
}
