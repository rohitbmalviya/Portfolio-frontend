import type { SocialLink } from './types';

/** A valid social link has string `type` and `value`. */
function isValidSocial(s: unknown): s is SocialLink {
  return (
    !!s &&
    typeof s === 'object' &&
    typeof (s as SocialLink).type === 'string' &&
    typeof (s as SocialLink).value === 'string'
  );
}

/**
 * `SiteSettings.socials` is a Prisma `Json` field that can be EITHER the new
 * `SocialLink[]` array (`[{ type, value }]`) OR the legacy object map
 * (`{ github, linkedin, … }`). This always returns a clean `SocialLink[]`,
 * filtering out any malformed entries so a bad row can never crash a render.
 */
export function normalizeSocials(raw: unknown): SocialLink[] {
  if (Array.isArray(raw)) {
    return raw.filter(isValidSocial);
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, v]) => typeof v === 'string' && Boolean(v))
      .map(([type, value]) => ({ type, value: value as string }));
  }
  return [];
}
