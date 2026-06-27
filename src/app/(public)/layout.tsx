// ============================================================
//  (public) group layout — Nav + Footer wrapper.
//  Leaves room for app/(admin) to have its own layout.
//
//  This is a Server Component: it fetches nav pages via ISR
//  (revalidate 60 s) and passes them to the client Nav.
//  If the API is unreachable, getNav() returns [] and Nav
//  falls back to its built-in static link set.
// ============================================================

import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';
import { ParticlesBackground } from '@/components/layout/particles-background';
import { getNav } from '@/lib/api';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = await getNav();

  return (
    <>
      {/* Constellation background — fixed, behind everything (z-0) */}
      <ParticlesBackground />

      {/* Content sits above the canvas */}
      <div className="relative z-10">
        <Nav navItems={navItems} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
