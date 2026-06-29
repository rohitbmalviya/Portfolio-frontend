'use client';

// ============================================================
//  Achievement create / edit form
//  Route: /admin/achievements/new  →  create
//         /admin/achievements/:id  →  edit
//
//  Deferred-upload flow:
//   Create → adminAchievements.create → get id → reconcileSingleMedia
//   Update → adminAchievements.update → reconcileSingleMedia
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminAchievements } from '@/lib/admin-api';
import { reconcileSingleMedia } from '@/lib/media-save';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ImageUpload, type ImageValue } from '@/components/admin/image-upload';
import {
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminCard,
  LoadingRows,
} from '@/components/admin/ui';
import { DatePicker } from '@/components/admin/date-picker';

// ── Form state ─────────────────────────────────────────────────
// `imageValue` holds the current ImageValue (existing or pending).

interface FormState {
  title: string;
  description: string;
  date: string;
  imageValue: ImageValue | null;
  order: number;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  date: '',
  imageValue: null,
  order: 0,
};

function AchievementFormContent({ achievementId }: { achievementId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!achievementId);
  const [saving, setSaving] = useState(false);
  const isNew = !achievementId;

  // Track the original mediaId so we can delete it if replaced/removed.
  const originalMediaIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!achievementId) return;
    setLoading(true);
    adminAchievements
      .get(achievementId)
      .then((ach) => {
        const imageValue: ImageValue | null =
          ach.imageMediaId && ach.image
            ? { mediaId: ach.imageMediaId, url: ach.image }
            : null;
        originalMediaIdRef.current = ach.imageMediaId ?? null;
        setForm({
          title: ach.title,
          description: ach.description,
          date: ach.date ? ach.date.slice(0, 10) : '',
          imageValue,
          order: ach.order,
        });
      })
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load achievement.'),
      )
      .finally(() => setLoading(false));
  }, [achievementId, toastError]);

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
        date: form.date || null,
        order: form.order,
      };

      let ownerId: string;

      if (isNew) {
        const created = await adminAchievements.create(payload);
        ownerId = created.id;
        const errors = await reconcileSingleMedia({
          value: form.imageValue,
          originalMediaId: null,
          ownerId,
          ownerType: 'achievement',
          usage: 'image',
          category: 'Raw',
        });
        if (errors.length > 0) {
          toastError(`Achievement created, but image upload failed: ${errors.join('; ')}`);
        } else {
          success('Achievement created.');
        }
        router.replace(`/admin/achievements/${created.id}`);
      } else {
        await adminAchievements.update(achievementId!, payload);
        ownerId = achievementId!;
        const errors = await reconcileSingleMedia({
          value: form.imageValue,
          originalMediaId: originalMediaIdRef.current,
          ownerId,
          ownerType: 'achievement',
          usage: 'image',
          category: 'Raw',
        });
        if (errors.length > 0) {
          toastError(`Saved, but image update had issues: ${errors.join('; ')}`);
        } else {
          success('Achievement saved.');
        }
        // Refresh to get updated image info.
        const refreshed = await adminAchievements.get(achievementId!);
        originalMediaIdRef.current = refreshed.imageMediaId ?? null;
        const imageValue: ImageValue | null =
          refreshed.imageMediaId && refreshed.image
            ? { mediaId: refreshed.imageMediaId, url: refreshed.image }
            : null;
        setForm((f) => ({ ...f, imageValue }));
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
          {saving ? 'Saving…' : isNew ? 'Create achievement' : 'Save changes'}
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

        {/* Award image — deferred upload */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Award Image (optional)
          </h2>
          <ImageUpload
            label="Upload an award photo or certificate"
            hint="Recommended: square or landscape, under 2 MB. Uploaded when you save."
            value={form.imageValue}
            onChange={(val) => set('imageValue', val)}
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
          <AdminButton loading={saving} type="submit" disabled={saving}>
            <Save size={14} aria-hidden="true" />
            {saving ? 'Saving…' : isNew ? 'Create achievement' : 'Save changes'}
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
