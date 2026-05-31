// ============================================================
//  (public) group layout — Nav + Footer wrapper.
//  Leaves room for app/(admin) to have its own layout.
// ============================================================

import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';
import { ParticlesBackground } from '@/components/layout/particles-background';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Constellation background — fixed, behind everything (z-0) */}
      <ParticlesBackground />

      {/* Content sits above the canvas */}
      <div className="relative z-10">
        <Nav />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
