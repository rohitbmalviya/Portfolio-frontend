// ============================================================
//  Home page — /
//  Fetches page from GET /api/pages/home.
//  Falls back to a fully inline static home if API is down.
//  ISR: revalidate every 60s.
// ============================================================

import type { Metadata } from 'next';
import { getPage } from '@/lib/api';
import { SectionRenderer } from '@/components/sections/section-renderer';
import { HeroSection } from '@/components/sections/hero-section';
import { AboutSection } from '@/components/sections/about-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { FeaturedProjectsSection } from '@/components/sections/featured-projects-section';
import { AchievementsSection } from '@/components/sections/achievements-section';
import { BlogTeaserSection } from '@/components/sections/blog-teaser-section';
import { ContactSection } from '@/components/sections/contact-section';
import type { Section } from '@/lib/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Rohit Malviya — Full-Stack Engineer',
  description:
    'Full-stack engineer (2+ yrs) building production SaaS & bank-grade systems across TypeScript, Go, Python & Java. Architected a Monte Carlo platform for Siam Commercial Bank.',
};

// Static fallback sections — shown when the API is unreachable.
// This is the complete Home page defined inline so the site ships
// without requiring a running backend.
const FALLBACK_SECTIONS: Section[] = [
  {
    id: 'hero',
    pageId: 'home',
    type: 'HERO',
    order: 0,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: {
      eyebrow: '// FULL-STACK ENGINEER · PUNE, INDIA',
      name: 'Rohit Malviya.',
      gradientLine: 'I build production systems.',
      subhead:
        'From a bank-grade Monte Carlo engine to multi-tenant SaaS platforms — I ship across TypeScript, Go, Python & Java. 2+ years turning hard problems into shipped products at Humancloud Technologies.',
      buttons: [
        { label: 'View résumé →', href: '/resume.pdf', style: 'primary' },
        { label: 'GitHub', href: 'https://github.com/rohithumancloud', style: 'ghost' },
        { label: 'LinkedIn', href: 'https://linkedin.com/in/rohitbmalviya', style: 'ghost' },
        {
          label: 'Email',
          href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'rohitbmalviya@gmail.com'}`,
          style: 'ghost',
        },
      ],
      metrics: [
        { value: '8', label: 'production platforms' },
        { value: '5', label: 'languages shipped' },
        { value: '1.2k+', label: 'tests written (SCB)' },
        { value: 'Bank', label: 'grade fintech' },
      ],
    },
  },
  {
    id: 'about',
    pageId: 'home',
    type: 'ABOUT',
    order: 1,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: {
      heading: 'About',
      paragraphs: [
        "I'm a full-stack engineer at Humancloud Technologies (Pune). In 2+ years I've shipped production software across hiring, fintech, real-estate, insurance, and meeting-AI — comfortable owning a feature from the database to the pixel.",
        'I work across the stack and across languages: Angular & Next.js on the front; Express, FastAPI, Spring Boot & Go on the back; PostgreSQL & Oracle for data; Docker, Kubernetes & Helm to ship it. My favorite work sits where the problem is genuinely hard — like architecting a bank-grade Monte Carlo simulation platform for Siam Commercial Bank (TensorFlow GBM with Cholesky-correlated paths, over Oracle, end to end).',
        'I care about correctness, clean architecture, and actually shipping. I hold a B.E. in AI & Data Science (CGPA 8.9) and earned Humancloud\'s "Going Beyond" award for delivering critical production features.',
      ],
    },
  },
  {
    id: 'skills',
    pageId: 'home',
    type: 'SKILLS',
    order: 2,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: { heading: 'Skills', source: 'skills-table' },
  },
  {
    id: 'experience',
    pageId: 'home',
    type: 'EXPERIENCE',
    order: 3,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: { heading: 'Experience', source: 'experience-table' },
  },
  {
    id: 'featured',
    pageId: 'home',
    type: 'FEATURED_PROJECTS',
    order: 4,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: { heading: 'Selected Work', auto: 'featured', limit: 4 },
  },
  {
    id: 'achievements',
    pageId: 'home',
    type: 'ACHIEVEMENTS',
    order: 5,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: { heading: 'Achievements & Education', source: 'achievements-table' },
  },
  {
    id: 'blog',
    pageId: 'home',
    type: 'BLOG_TEASER',
    order: 6,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: { heading: 'Latest from the Blog', limit: 3 },
  },
  {
    id: 'contact',
    pageId: 'home',
    type: 'CONTACT',
    order: 7,
    enabled: true,
    createdAt: '',
    updatedAt: '',
    data: {
      heading: "Let's build something.",
      blurb:
        'Open to senior full-stack, backend, and fintech engineering roles. The fastest way to reach me is email — I reply quickly.',
      showForm: false,
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'rohitbmalviya@gmail.com',
      socials: {
        github: 'https://github.com/rohithumancloud',
        linkedin: 'https://linkedin.com/in/rohitbmalviya',
      },
      resumeUrl: '/resume.pdf',
    },
  },
];

export default async function HomePage() {
  const page = await getPage('home');
  const sections = page?.sections ?? FALLBACK_SECTIONS;

  return <SectionRenderer sections={sections} />;
}
