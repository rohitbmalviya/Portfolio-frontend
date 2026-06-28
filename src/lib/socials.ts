import type { SocialLink } from './types';

/**
 * `SiteSettings.socials` is a Prisma `Json` field that can be EITHER the new
 * `SocialLink[]` array (`[{ type, value }]`) OR the legacy object map
 * (`{ github, linkedin, … }`). This always returns a `SocialLink[]`.
 */
export function normalizeSocials(raw: unknown): SocialLink[] {
  if (Array.isArray(raw)) return raw as SocialLink[];
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, string>)
      .filter(([, v]) => Boolean(v))
      .map(([type, value]) => ({ type, value }));
  }
  return [];
}
