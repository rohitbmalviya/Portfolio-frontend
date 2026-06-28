// ============================================================
//  lib/site.ts — Centralized site identity constants.
//  Set NEXT_PUBLIC_SITE_OWNER in .env.local to adapt this
//  portfolio to a different owner without touching source files.
// ============================================================

export const SITE_OWNER =
  process.env.NEXT_PUBLIC_SITE_OWNER ?? 'Rohit Malviya';

/** Full default <title> used on the root layout and the home page. */
export const SITE_TITLE = `${SITE_OWNER} — Full-Stack Engineer`;

/** Template used for page-level <title> tags: "%s — Owner". */
export const SITE_TITLE_TEMPLATE = `%s — ${SITE_OWNER}`;
