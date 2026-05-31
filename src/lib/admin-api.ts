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
  Experience,
  Achievement,
  AchievementType,
  SiteSettings,
  ProofType,
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
> & Partial<Omit<Page, 'id' | 'slug' | 'title' | 'type' | 'sections' | 'createdAt' | 'updatedAt'>>;

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

export interface CreateAchievementPayload {
  title: string;
  description: string;
  year?: string;
  type: AchievementType;
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
  list: () => adminFetch<Page[]>('/api/pages'),

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

  get: (id: string) => adminFetch<Project>(`/api/projects/${id}`),

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

  get: (id: string) => adminFetch<BlogPost>(`/api/blog/${id}`),

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
  list: () => adminFetch<Skill[]>('/api/skills'),

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

// ── Achievements ──────────────────────────────────────────────

export const adminAchievements = {
  list: () => adminFetch<Achievement[]>('/api/achievements'),

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

  upload: (file: File, alt?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    if (alt) fd.append('alt', alt);
    return adminUpload<MediaRecord>('/api/media', fd);
  },

  delete: (id: string) =>
    adminFetch<void>(`/api/media/${id}`, { method: 'DELETE' }),
};

// ── Helpers re-exported for convenience ───────────────────────

export type { PageType, SectionType };
