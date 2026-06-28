import type { NavPage } from './types';

export interface NavLinkBase {
  label: string;
  href: string;
}

/**
 * Converts nav pages (from GET /api/pages/nav) into {label, href} links.
 * Shared by the navbar and the footer so both render the same nav.
 *   label = navLabel ?? title (lowercased) · href = '/' for home, else '/{slug}'
 */
export function navLinksFromPages(pages: NavPage[]): NavLinkBase[] {
  return pages.map((p) => ({
    label: (p.navLabel ?? p.title).toLowerCase(),
    href: p.slug === 'home' ? '/' : `/${p.slug}`,
  }));
}
