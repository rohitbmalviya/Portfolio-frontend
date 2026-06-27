'use client';

// ============================================================
//  Achievement create / edit form
//  Route: /admin/achievements/new  →  create
//         /admin/achievements/:id  →  edit
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminAchievements } from '@/lib/admin-api';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ImageUpload } from '@/components/admin/image-upload';
import {
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminCard,
  LoadingRows,
} from '@/components/admin/ui';
import { DatePicker } from '@/components/admin/date-picker';

// ── Form state ─────────────────────────────────────────────────
// `date` is stored as YYYY-MM-DD string (what <input type="date"> uses),
// or empty string when null.
// `image` is stored as a Cloudinary URL string, or empty string when null.

interface FormState {
  title: string;
  description: string;
  date: string;
  image: string;
  order: number;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  date: '',
  image: '',
  order: 0,
};

function AchievementFormContent({ achievementId }: { achievementId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!achievementId);
  const [saving, setSaving] = useState(false);
  const isNew = !achievementId;

  // Load existing achievement by id
  useEffect(() => {
    if (!achievementId) return;
    setLoading(true);
    adminAchievements
      .get(achievementId)
      .then((ach) => {
        setForm({
          title: ach.title,
          description: ach.description,
          // API may return a full ISO datetime — slice to YYYY-MM-DD for the date input
          date: ach.date ? ach.date.slice(0, 10) : '',
          image: ach.image ?? '',
          order: ach.order,
        });
      })
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load achievement.'),
      )
      .finally(() => setLoading(false));
  }, [achievementId, toastError]);

  // Prefill order for brand-new entry: max(existing) + 1
  useEffect(() => {
    if (achievementId) return;
    adminAchievements
      .list()
      .then((list) => {
        const maxOrder = list.length > 0 ? Math.max(...list.map((a) => a.order)) : -1;
        setForm((f) => ({ ...f, order: maxOrder + 1 }));
      })
      .catch(() => {});
  }, [achievementId]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toastError('Title is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        // Empty string → null; otherwise the YYYY-MM-DD value
        date: form.date || null,
        image: form.image || null,
        order: form.order,
      };
      if (isNew) {
        const created = await adminAchievements.create(payload);
        success('Achievement created.');
        router.replace(`/admin/achievements/${created.id}`);
      } else {
        await adminAchievements.update(achievementId!, payload);
        success('Achievement saved.');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Loading…">
        <LoadingRows />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={isNew ? 'New Achievement' : `Edit: ${form.title || 'Achievement'}`}
      actions={
        <AdminButton loading={saving} onClick={handleSubmit} type="button">
          <Save size={14} aria-hidden="true" />
          {isNew ? 'Create achievement' : 'Save changes'}
        </AdminButton>
      }
    >
      <Link
        href="/admin/achievements"
        className="inline-flex items-center gap-1.5 text-[13px] mb-5 transition-colors hover:text-[var(--accent)]"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All achievements
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
        {/* Title / Description */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Achievement Details
          </h2>
          <div className="flex flex-col gap-4">
            <AdminInput
              label="Title *"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              autoFocus
              placeholder="e.g. Going Beyond Award"
            />
            <AdminTextarea
              label="Description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Brief description of the achievement…"
            />
          </div>
        </AdminCard>

        {/* Date */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Date
          </h2>
          <DatePicker
            label="Date (optional)"
            value={form.date}
            onChange={(v) => set('date', v)}
            placeholder="Pick a date… (optional)"
          />
        </AdminCard>

        {/* Award image */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Award Image (optional)
          </h2>
          <ImageUpload
            label="Upload an award photo or certificate"
            hint="Recommended: square or landscape, under 2 MB"
            value={form.image || null}
            onChange={(url) => set('image', url ?? '')}
          />
        </AdminCard>

        {/* Display Order */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Display Order
          </h2>
          <AdminInput
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) => set('order', Number(e.target.value))}
            hint="Lower number appears first in the list"
          />
        </AdminCard>

        <div className="flex justify-end">
          <AdminButton loading={saving} type="submit">
            <Save size={14} aria-hidden="true" />
            {isNew ? 'Create achievement' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </AdminShell>
  );
}

export default function AdminAchievementEditPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';

  return (
    <ToastProvider>
      <AchievementFormContent achievementId={isNew ? null : params.id} />
    </ToastProvider>
  );
}
