// ============================================================
//  Admin Login layout — minimal, no sidebar.
//  The parent admin layout would normally enforce auth,
//  but the login route needs to be public.
// ============================================================

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
