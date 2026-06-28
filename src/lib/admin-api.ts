// ============================================================
//  lib/admin-api.ts — Authenticated admin API client
//  All calls send credentials:'include' so the httpOnly
//  access_token cookie is forwarded automatically.
//  On 401, redirects to /admin/login (client-side).
//
//  Response envelope: every backend endpoint returns { data: T }.
//  adminFetch / adminUpload unwrap the envelope and return T.
// ============================================================

import type {
  Page,
  Section,
  SectionData,
  SectionType,
  PageType,
  Project,
  BlogPost,
  Skill,
  SkillGroup,
  SkillLevel,
  SkillGroupSection,
  Experience,
  Education,
  Achievement,
  SiteSettings,
  ConfigOption,
  Configuration,
  ContactMessage,
  ContactThread,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ── Media (from backend schema) ───────────────────────────────

export interface MediaRecord {
  id: string;
  cloudinaryUrl: string;
  publicId: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  type?: string | null;
  category: string;
  createdAt: string;
}

// ── Auth DTOs ─────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string };
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
}

// ── Generic write DTOs ────────────────────────────────────────

export type CreatePagePayload = Pick<
  Page,
  'slug' | 'title' | 'type'
> & Partial<Omit<Page, 'id' | 'slug' | 'title' | 'type' | 'sections' | '_count' | 'createdAt' | 'updatedAt'>>;

export type UpdatePagePayload = Partial<CreatePagePayload>;

export interface CreateSectionPayload {
  pageId: string;
  type: SectionType;
  order?: number;
  data?: SectionData;
}

export type UpdateSectionPayload = Partial<{
  type: SectionType;
  order: number;
  enabled: boolean;
  data: SectionData;
}>;

export interface ReorderItem {
  id: string;
  order: number;
}

export type CreateProjectPayload = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export type CreateBlogPayload = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>;
export type UpdateBlogPayload = Partial<CreateBlogPayload>;

export interface CreateSkillPayload {
  group: SkillGroup;
  name: string;
  level: SkillLevel;
  order?: number;
}
export type UpdateSkillPayload = Partial<CreateSkillPayload>;

export type CreateExperiencePayload = Omit<Experience, 'id'>;
export type UpdateExperiencePayload = Partial<CreateExperiencePayload>;

export type CreateEducationPayload = Omit<Education, 'id'>;
export type UpdateEducationPayload = Partial<CreateEducationPayload>;

export interface CreateAchievementPayload {
  title: string;
  description: string;
  date?: string | null;
  image?: string | null;
  order?: number;
}
export type UpdateAchievementPayload = Partial<CreateAchievementPayload>;

export type UpdateSettingsPayload = Partial<
  Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>
>;

// ── Low-level fetch ───────────────────────────────────────────

// All backend responses are wrapped: { data: T }
interface ApiEnvelope<T> {
  data: T;
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    // Redirect to login — safe to call from client components
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { message?: string };
      message = body?.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  // 204 No Content — no body to parse
  if (res.status === 204) return undefined as T;

  // Unwrap { data: T } envelope returned by every backend controller
  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

// Multipart upload (no Content-Type — browser sets boundary)
async function adminUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { message?: string };
      message = body?.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // Unwrap { data: T } envelope
  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

// ── Auth ──────────────────────────────────────────────────────

export const adminAuth = {
  login: (payload: LoginPayload) =>
    adminFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => adminFetch<MeResponse>('/api/auth/me'),

  logout: () =>
    adminFetch<void>('/api/auth/logout', { method: 'POST' }),
};

// ── Pages ─────────────────────────────────────────────────────

export const adminPages = {
  // ?admin=true returns pages with their sections array populated,
  // which lets the list UI show section counts.
  list: () => adminFetch<Page[]>('/api/pages?admin=true'),

  // Fetch a single page with all its sections by primary key (ID).
  // Uses the dedicated /id/:id route to avoid conflating IDs with slugs.
  get: (id: string) =>
    adminFetch<Page>(`/api/pages/id/${id}`),

  getBySlug: (slug: string) =>
    adminFetch<Page>(`/api/pages/${slug}?admin=true`),

  create: (payload: CreatePagePayload) =>
    adminFetch<Page>('/api/pages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdatePagePayload) =>
    adminFetch<Page>(`/api/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/pages/${id}`, { method: 'DELETE' }),
};

// ── Sections ──────────────────────────────────────────────────

export const adminSections = {
  create: (payload: CreateSectionPayload) =>
    adminFetch<Section>('/api/sections', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateSectionPayload) =>
    adminFetch<Section>(`/api/sections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/sections/${id}`, { method: 'DELETE' }),

  reorder: (sections: ReorderItem[]) =>
    adminFetch<void>('/api/sections/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ sections }),
    }),

  toggle: (id: string) =>
    adminFetch<Section>(`/api/sections/${id}/toggle`, { method: 'PATCH' }),
};

// ── Projects ──────────────────────────────────────────────────

export const adminProjects = {
  list: () => adminFetch<Project[]>('/api/projects?admin=true'),

  get: (id: string) => adminFetch<Project>(`/api/projects/id/${id}`),

  create: (payload: CreateProjectPayload) =>
    adminFetch<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateProjectPayload) =>
    adminFetch<Project>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/projects/${id}`, { method: 'DELETE' }),

  reorder: (items: ReorderItem[]) =>
    adminFetch<void>('/api/projects/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ projects: items }),
    }),

  toggleFeatured: (id: string) =>
    adminFetch<Project>(`/api/projects/${id}/feature`, { method: 'PATCH' }),

  togglePublished: (id: string) =>
    adminFetch<Project>(`/api/projects/${id}/publish`, { method: 'PATCH' }),
};

// ── Blog ──────────────────────────────────────────────────────

export const adminBlog = {
  list: () => adminFetch<BlogPost[]>('/api/blog?admin=true'),

  get: (id: string) => adminFetch<BlogPost>(`/api/blog/id/${id}`),

  create: (payload: CreateBlogPayload) =>
    adminFetch<BlogPost>('/api/blog', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateBlogPayload) =>
    adminFetch<BlogPost>(`/api/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/blog/${id}`, { method: 'DELETE' }),

  togglePublished: (id: string) =>
    adminFetch<BlogPost>(`/api/blog/${id}/publish`, { method: 'PATCH' }),
};

// ── Skills ────────────────────────────────────────────────────

export const adminSkills = {
  /** GET /api/skills/grouped — skills pre-grouped in canonical order, empty groups omitted. */
  listGrouped: () => adminFetch<SkillGroupSection[]>('/api/skills/grouped'),

  create: (payload: CreateSkillPayload) =>
    adminFetch<Skill>('/api/skills', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateSkillPayload) =>
    adminFetch<Skill>(`/api/skills/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/skills/${id}`, { method: 'DELETE' }),

  reorder: (items: ReorderItem[]) =>
    adminFetch<void>('/api/skills/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ skills: items }),
    }),
};

// ── Experience ────────────────────────────────────────────────

export const adminExperience = {
  list: () => adminFetch<Experience[]>('/api/experience'),

  get: (id: string) => adminFetch<Experience>(`/api/experience/${id}`),

  create: (payload: CreateExperiencePayload) =>
    adminFetch<Experience>('/api/experience', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateExperiencePayload) =>
    adminFetch<Experience>(`/api/experience/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/experience/${id}`, { method: 'DELETE' }),

  reorder: (items: ReorderItem[]) =>
    adminFetch<void>('/api/experience/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ experience: items }),
    }),
};

// ── Education ─────────────────────────────────────────────────

export const adminEducation = {
  list: () => adminFetch<Education[]>('/api/education'),

  get: (id: string) => adminFetch<Education>(`/api/education/${id}`),

  create: (payload: CreateEducationPayload) =>
    adminFetch<Education>('/api/education', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateEducationPayload) =>
    adminFetch<Education>(`/api/education/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/education/${id}`, { method: 'DELETE' }),

  reorder: (items: ReorderItem[]) =>
    adminFetch<void>('/api/education/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ education: items }),
    }),
};

// ── Achievements ──────────────────────────────────────────────

export const adminAchievements = {
  list: () => adminFetch<Achievement[]>('/api/achievements'),

  get: (id: string) => adminFetch<Achievement>(`/api/achievements/${id}`),

  create: (payload: CreateAchievementPayload) =>
    adminFetch<Achievement>('/api/achievements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateAchievementPayload) =>
    adminFetch<Achievement>(`/api/achievements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/achievements/${id}`, { method: 'DELETE' }),

  reorder: (items: ReorderItem[]) =>
    adminFetch<void>('/api/achievements/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ achievements: items }),
    }),
};

// ── Settings ──────────────────────────────────────────────────

export const adminSettings = {
  get: () => adminFetch<SiteSettings>('/api/settings'),

  update: (payload: UpdateSettingsPayload) =>
    adminFetch<SiteSettings>('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// ── Media ─────────────────────────────────────────────────────

export const adminMedia = {
  list: () => adminFetch<MediaRecord[]>('/api/media'),

  upload: (
    file: File,
    alt?: string,
    category?: string,
    entitySlug?: string,
    sequence?: number,
  ) => {
    const fd = new FormData();
    fd.append('file', file);
    if (alt) fd.append('alt', alt);
    if (category) fd.append('category', category);
    if (entitySlug) fd.append('entitySlug', entitySlug);
    if (sequence !== undefined) fd.append('sequence', String(sequence));
    return adminUpload<MediaRecord>('/api/media', fd);
  },

  update: (id: string, payload: { category?: string; alt?: string }) =>
    adminFetch<MediaRecord>(`/api/media/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    adminFetch<void>(`/api/media/${id}`, { method: 'DELETE' }),
};

// ── Dashboard stats (single call for all content counts) ──────

export interface DashboardCounts {
  pages: number;
  projects: number;
  blogPosts: number;
  skills: number;
  experience: number;
  education: number;
  achievements: number;
  media: number;
}

export const adminStats = {
  get: () => adminFetch<DashboardCounts>('/api/stats'),
};

// ── Configuration ─────────────────────────────────────────────

export const adminConfig = {
  /** GET /api/config — list all config sets */
  list: () => adminFetch<Configuration[]>('/api/config'),

  /** GET /api/config/:key — fetch a single config set by key */
  get: (key: string) => adminFetch<Configuration>(`/api/config/${key}`),

  /** PATCH /api/config/:key — upsert items (and optionally label) for a key */
  update: (
    key: string,
    payload: { label?: string; items: ConfigOption[] },
  ) =>
    adminFetch<Configuration>(`/api/config/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// ── Contact (admin) ───────────────────────────────────────────

/** ContactThread with messages guaranteed to be present (returned by getThread). */
export type ContactThreadDetail = ContactThread & { messages: ContactMessage[] };

export const adminContact = {
  /** GET /api/contact/threads — list all threads, newest-last-message first. */
  listThreads: () => adminFetch<ContactThread[]>('/api/contact/threads'),

  /** GET /api/contact/unread-count — returns { count } of unread threads. */
  unreadCount: () => adminFetch<{ count: number }>('/api/contact/unread-count'),

  /** GET /api/contact/threads/:id — full thread with all messages. */
  getThread: (id: string) =>
    adminFetch<ContactThreadDetail>(`/api/contact/threads/${id}`),

  /** PATCH /api/contact/threads/:id/read — marks thread as read. */
  markRead: (id: string) =>
    adminFetch<void>(`/api/contact/threads/${id}/read`, { method: 'PATCH' }),

  /** POST /api/contact/threads/:id/reply — sends a reply. */
  reply: (id: string, body: string) =>
    adminFetch<ContactMessage>(`/api/contact/threads/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  /** DELETE /api/contact/threads/:id — permanently removes a thread. */
  remove: (id: string) =>
    adminFetch<void>(`/api/contact/threads/${id}`, { method: 'DELETE' }),

  /** POST /api/contact/sync — triggers a Gmail/IMAP sync on the backend. */
  sync: () =>
    adminFetch<void>('/api/contact/sync', { method: 'POST' }),

  /**
   * POST /api/contact/compose — create a new outbound thread.
   * Returns the newly-created thread with its messages array populated.
   */
  compose: (payload: {
    to: string;
    name?: string;
    subject?: string;
    body: string;
  }) =>
    adminFetch<ContactThreadDetail>('/api/contact/compose', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * PATCH /api/contact/read-all — mark every unread thread as read.
   * Returns the number of threads updated.
   */
  readAll: () =>
    adminFetch<{ updated: number }>('/api/contact/read-all', {
      method: 'PATCH',
    }),
};

// ── Helpers re-exported for convenience ───────────────────────

export type { PageType, SectionType, ConfigOption, Configuration, ContactMessage, ContactThread };
