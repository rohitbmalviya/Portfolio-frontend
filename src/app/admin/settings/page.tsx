'use client';

// ============================================================
//  Admin Site Settings — singleton PATCH
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { Save, Loader2, Plus, Trash2, Upload, Download, ExternalLink } from 'lucide-react';
import { adminSettings, adminMedia } from '@/lib/admin-api';
import type { SiteSettings, SocialLink, DefaultTheme } from '@/lib/types';
import { getConfigOptions } from '@/lib/api';
import type { ConfigOption } from '@/lib/api';
import { normalizeSocials } from '@/lib/socials';
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
  socials: [],
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
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [socialTypeOptions, setSocialTypeOptions] = useState<ConfigOption[]>([]);

  // Load social link types from config API — backend is the sole source of truth.
  useEffect(() => {
    getConfigOptions('social_link_types').then((opts) => {
      setSocialTypeOptions(opts);
    });
  }, []);

  async function uploadResume(file: File) {
    setUploadingResume(true);
    try {
      const media = await adminMedia.upload(file, file.name);
      setForm((f) => ({ ...f, resumeUrl: media.cloudinaryUrl }));
      success('Résumé uploaded.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Résumé upload failed.');
    } finally {
      setUploadingResume(false);
    }
  }

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
          socials: normalizeSocials(s.socials),
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

  function setSocialRow(index: number, patch: Partial<SocialLink>) {
    setForm((f) => {
      const next = (f.socials as SocialLink[]).map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      );
      return { ...f, socials: next };
    });
  }

  function addSocialRow() {
    setForm((f) => ({
      ...f,
      socials: [...(f.socials as SocialLink[]), { type: 'website', value: '' }],
    }));
  }

  function removeSocialRow(index: number) {
    setForm((f) => ({
      ...f,
      socials: (f.socials as SocialLink[]).filter((_, i) => i !== index),
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

  const socials = form.socials as SocialLink[];

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
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
            {/* Résumé — upload to Cloudinary, with preview + download */}
            <div>
              <label className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
                Résumé (PDF)
              </label>
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])}
              />

              {form.resumeUrl ? (
                <div
                  className="mt-1.5 rounded-[10px] border overflow-hidden"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <iframe
                    src={form.resumeUrl}
                    title="Résumé preview"
                    className="w-full h-64 bg-white"
                  />
                  <div
                    className="flex flex-wrap items-center gap-2 p-2 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <a href={form.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <AdminButton variant="ghost" size="sm" type="button">
                        <ExternalLink size={13} aria-hidden="true" /> View
                      </AdminButton>
                    </a>
                    <a href={form.resumeUrl} download>
                      <AdminButton variant="ghost" size="sm" type="button">
                        <Download size={13} aria-hidden="true" /> Download
                      </AdminButton>
                    </a>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      type="button"
                      loading={uploadingResume}
                      onClick={() => resumeInputRef.current?.click()}
                    >
                      <Upload size={13} aria-hidden="true" /> Replace
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      type="button"
                      onClick={() => set('resumeUrl', '')}
                    >
                      <Trash2 size={13} aria-hidden="true" /> Remove
                    </AdminButton>
                  </div>
                </div>
              ) : (
                <div className="mt-1.5">
                  <AdminButton
                    variant="ghost"
                    type="button"
                    loading={uploadingResume}
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    <Upload size={14} aria-hidden="true" /> Upload résumé (PDF)
                  </AdminButton>
                </div>
              )}
            </div>
          </div>
        </AdminCard>

        {/* Socials */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Social Links
          </h2>
          <div className="flex flex-col gap-2">
            {socials.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="flex-1">
                  <AdminSelect
                    value={row.type}
                    onChange={(e) => setSocialRow(i, { type: e.target.value })}
                    options={socialTypeOptions}
                  />
                </div>
                <div className="flex-1">
                  <AdminInput
                    type={row.type === 'email' ? 'email' : 'url'}
                    placeholder="https://…"
                    value={row.value}
                    onChange={(e) => setSocialRow(i, { value: e.target.value })}
                  />
                </div>
                <AdminButton
                  variant="danger"
                  size="sm"
                  type="button"
                  aria-label="Remove social link"
                  onClick={() => removeSocialRow(i)}
                >
                  <Trash2 size={13} aria-hidden="true" /> Remove
                </AdminButton>
              </div>
            ))}
            <AdminButton
              variant="ghost"
              size="sm"
              type="button"
              onClick={addSocialRow}
            >
              <Plus size={14} aria-hidden="true" /> Add link
            </AdminButton>
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
