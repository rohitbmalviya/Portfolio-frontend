'use client';

// ============================================================
//  Admin Configuration — manage option-list items for dropdowns.
//  Seeded keys: contact_link_types, social_link_types,
//               media_categories.
//  No create/delete of whole sets; only edit items of each key.
// ============================================================

import { useEffect, useState } from 'react';
import { Plus, Save, SlidersHorizontal, Trash2 } from 'lucide-react';
import { adminConfig } from '@/lib/admin-api';
import type { Configuration, ConfigOption } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  EmptyState,
  LoadingRows,
} from '@/components/admin/ui';

// ── Card for one config set ───────────────────────────────────

interface ConfigCardProps {
  config: Configuration;
  saving: boolean;
  onItemsChange: (items: ConfigOption[]) => void;
  onSave: () => void;
}

function ConfigCard({ config, saving, onItemsChange, onSave }: ConfigCardProps) {
  function updateItem(index: number, patch: Partial<ConfigOption>) {
    const next = config.items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onItemsChange(next);
  }

  function removeItem(index: number) {
    onItemsChange(config.items.filter((_, i) => i !== index));
  }

  function addItem() {
    onItemsChange([...config.items, { value: '', label: '' }]);
  }

  return (
    <AdminCard>
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>
            {config.label}
          </h2>
          <code
            className="text-[11px]"
            style={{
              color: 'var(--muted)',
              fontFamily: 'var(--font-jetbrains-mono)',
            }}
          >
            {config.key}
          </code>
        </div>
        <AdminButton loading={saving} onClick={onSave} type="button">
          <Save size={14} aria-hidden="true" />
          Save
        </AdminButton>
      </div>

      {/* Column headers (only when items exist) */}
      {config.items.length > 0 && (
        <div
          className="grid gap-2 mb-2 px-1"
          style={{ gridTemplateColumns: '1fr 1fr auto' }}
        >
          <p className="text-[12px] font-medium" style={{ color: 'var(--muted)' }}>
            Value
          </p>
          <p className="text-[12px] font-medium" style={{ color: 'var(--muted)' }}>
            Label
          </p>
          <span style={{ width: '88px' }} />
        </div>
      )}

      {/* Item rows */}
      <div className="flex flex-col gap-2 mb-3">
        {config.items.length === 0 ? (
          <p className="text-[13px] py-1" style={{ color: 'var(--muted)' }}>
            No options yet. Add one below.
          </p>
        ) : (
          config.items.map((item, i) => (
            <div
              key={i}
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: '1fr 1fr auto' }}
            >
              <AdminInput
                placeholder="e.g. github"
                value={item.value}
                aria-label={`Option ${i + 1} value`}
                onChange={(e) => updateItem(i, { value: e.target.value })}
              />
              <AdminInput
                placeholder="e.g. GitHub"
                value={item.label}
                aria-label={`Option ${i + 1} label`}
                onChange={(e) => updateItem(i, { label: e.target.value })}
              />
              <AdminButton
                variant="danger"
                size="sm"
                type="button"
                aria-label={`Remove option: ${item.label || item.value || String(i + 1)}`}
                onClick={() => removeItem(i)}
              >
                <Trash2 size={13} aria-hidden="true" />
                Remove
              </AdminButton>
            </div>
          ))
        )}
      </div>

      <AdminButton variant="ghost" size="sm" type="button" onClick={addItem}>
        <Plus size={14} aria-hidden="true" />
        Add option
      </AdminButton>
    </AdminCard>
  );
}

// ── Main page content ─────────────────────────────────────────

function ConfigContent() {
  const { success, error: toastError } = useToast();
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    adminConfig
      .list()
      .then(setConfigs)
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load configuration.'),
      )
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateItems(key: string, items: ConfigOption[]) {
    setConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, items } : c)),
    );
  }

  async function handleSave(cfg: Configuration) {
    setSaving((prev) => ({ ...prev, [cfg.key]: true }));
    try {
      const updated = await adminConfig.update(cfg.key, { items: cfg.items });
      setConfigs((prev) =>
        prev.map((c) => (c.key === cfg.key ? updated : c)),
      );
      success(`"${cfg.label}" saved.`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving((prev) => ({ ...prev, [cfg.key]: false }));
    }
  }

  if (loading) {
    return (
      <AdminShell title="Configuration">
        <LoadingRows rows={3} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Configuration"
      description="Manage option lists used by dropdowns across the admin (link types, media categories, etc.)."
    >
      {configs.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal size={20} />}
          title="No configuration sets found"
          description="Seed the database to populate the seeded keys: contact_link_types, social_link_types, media_categories."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {configs.map((cfg) => (
            <ConfigCard
              key={cfg.key}
              config={cfg}
              saving={saving[cfg.key] ?? false}
              onItemsChange={(items) => updateItems(cfg.key, items)}
              onSave={() => handleSave(cfg)}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

// ── Page export ───────────────────────────────────────────────

export default function AdminConfigPage() {
  return (
    <ToastProvider>
      <ConfigContent />
    </ToastProvider>
  );
}
