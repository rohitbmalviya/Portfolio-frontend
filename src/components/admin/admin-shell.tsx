'use client';

// ============================================================
//  AdminShell — page wrapper inside the admin layout.
//  Provides a consistent header + scrollable content area.
//  Each page wraps with its own ToastProvider so hooks work.
// ============================================================

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminShell({ title, description, actions, children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div>
          <h1
            className="text-[20px] font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              color: 'var(--text)',
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="text-[13px] mt-0.5"
              style={{ color: 'var(--muted)' }}
            >
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>

      {/* Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
