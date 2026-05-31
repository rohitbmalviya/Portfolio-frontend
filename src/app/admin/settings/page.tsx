'use client';

// ============================================================
//  Admin Site Settings — singleton PATCH
// ============================================================

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { adminSettings } from '@/lib/admin-api';
import type { SiteSettings, SocialLinks, DefaultTheme } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminTextarea,
  AdminSelect,
} from '@/components/admin/ui';

type FormState = Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY: FormState = {
  name: '',
  tagline: '',
  email: '',
  location: '',
  socials: {},
  resumeUrl: '',
  defaultTheme: 'DARK',
  brandAccent: '',
  footerText: '',
  ogTitle: '',
  ogDescription: '',
};

function SettingsContent() {
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminSettings
      .get()
      .then((s) => {
        setForm({
          name: s.name,
          tagline: s.tagline,
          email: s.email,
          location: s.location,
          socials: s.socials ?? {},
          resumeUrl: s.resumeUrl ?? '',
          defaultTheme: s.defaultTheme,
          brandAccent: s.brandAccent ?? '',
          footerText: s.footerText ?? '',
          ogTitle: s.ogTitle ?? '',
          ogDescription: s.ogDescription ?? '',
        });
      })
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setSocial(key: string, val: string) {
    setForm((f) => ({
      ...f,
      socials: { ...((f.socials as SocialLinks) ?? {}), [key]: val },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSettings.update({
        ...form,
        resumeUrl: form.resumeUrl || undefined,
        brandAccent: form.brandAccent || undefined,
        footerText: form.footerText || undefined,
        ogTitle: form.ogTitle || undefined,
        ogDescription: form.ogDescription || undefined,
      });
      success('Settings saved.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Settings">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </AdminShell>
    );
  }

  const socials = (form.socials as SocialLinks) ?? {};

  return (
    <AdminShell
      title="Site Settings"
      description="Global portfolio settings and defaults."
      actions={
        <AdminButton loading={saving} onClick={handleSubmit} type="button">
          <Save size={14} aria-hidden="true" />
          Save settings
        </AdminButton>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-[640px]" noValidate>
        {/* Identity */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Rohit Malviya"
            />
            <AdminInput
              label="Location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Bangkok, TH"
            />
            <AdminInput
              label="Tagline"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              className="sm:col-span-2"
              placeholder="Full-Stack Engineer"
            />
            <AdminInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            <AdminInput
              label="Resume URL"
              type="url"
              value={form.resumeUrl ?? ''}
              onChange={(e) => set('resumeUrl', e.target.value)}
              placeholder="https://…"
            />
          </div>
        </AdminCard>

        {/* Socials */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Social Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="GitHub"
              value={socials.github ?? ''}
              onChange={(e) => setSocial('github', e.target.value)}
              placeholder="https://github.com/username"
            />
            <AdminInput
              label="LinkedIn"
              value={socials.linkedin ?? ''}
              onChange={(e) => setSocial('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
            <AdminInput
              label="Twitter / X"
              value={socials.twitter ?? ''}
              onChange={(e) => setSocial('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
            />
          </div>
        </AdminCard>

        {/* Theme & Branding */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Theme & Branding
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminSelect
              label="Default theme"
              value={form.defaultTheme}
              onChange={(e) => set('defaultTheme', e.target.value as DefaultTheme)}
              options={[
                { value: 'DARK', label: 'Dark' },
                { value: 'LIGHT', label: 'Light' },
              ]}
            />
            <AdminInput
              label="Brand accent (hex)"
              value={form.brandAccent ?? ''}
              onChange={(e) => set('brandAccent', e.target.value)}
              placeholder="#22D3EE"
            />
            <AdminTextarea
              label="Footer text"
              value={form.footerText ?? ''}
              onChange={(e) => set('footerText', e.target.value)}
              rows={2}
              className="sm:col-span-2"
            />
          </div>
        </AdminCard>

        {/* OG / SEO */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Default SEO / Open Graph
          </h2>
          <div className="flex flex-col gap-4">
            <AdminInput
              label="OG title"
              value={form.ogTitle ?? ''}
              onChange={(e) => set('ogTitle', e.target.value)}
            />
            <AdminTextarea
              label="OG description"
              value={form.ogDescription ?? ''}
              onChange={(e) => set('ogDescription', e.target.value)}
              rows={3}
            />
          </div>
        </AdminCard>

        <div className="flex justify-end">
          <AdminButton loading={saving} type="submit">
            <Save size={14} aria-hidden="true" />
            Save settings
          </AdminButton>
        </div>
      </form>
    </AdminShell>
  );
}

export default function AdminSettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  );
}
