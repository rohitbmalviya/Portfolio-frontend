'use client';

// ============================================================
//  Admin shared UI primitives
//  AdminInput, AdminSelect, AdminTextarea, AdminToggle,
//  AdminCard, ConfirmDialog, AdminBadge, LoadingRows, EmptyState
// ============================================================

import { forwardRef, useId, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Loader2, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── AdminInput ────────────────────────────────────────────────

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium"
            style={{ color: 'var(--text)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2.5 rounded-[10px] border text-[14px] outline-none',
            'transition-colors duration-150',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'focus:border-[--accent]',
            className,
          )}
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border)',
            color: 'var(--text)',
          }}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-[12px]" style={{ color: '#f87171' }} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[12px]" style={{ color: 'var(--muted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);
AdminInput.displayName = 'AdminInput';

// ── AdminTextarea ─────────────────────────────────────────────

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, hint, className, id, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `ta-${generatedId}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium"
            style={{ color: 'var(--text)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            'w-full px-3 py-2.5 rounded-[10px] border text-[14px] outline-none resize-y',
            'transition-colors duration-150',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'focus:border-[--accent]',
            className,
          )}
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font-inter)',
            // Caller overrides (e.g. custom fontFamily/fontSize) are spread last
            // so they win, but the theme tokens above are always the baseline.
            ...style,
          }}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-[12px]" style={{ color: '#f87171' }} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[12px]" style={{ color: 'var(--muted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);
AdminTextarea.displayName = 'AdminTextarea';

// ── AdminSelect ───────────────────────────────────────────────

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `sel-${generatedId}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium"
            style={{ color: 'var(--text)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3 py-2.5 pr-9 rounded-[10px] border text-[14px] outline-none',
              'transition-colors duration-150 cursor-pointer appearance-none',
              'focus:border-[--accent]',
              className,
            )}
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border)',
              color: 'var(--text)',
            }}
            aria-invalid={error ? true : undefined}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted)' }}
          />
        </div>
        {error && (
          <p className="text-[12px]" style={{ color: '#f87171' }} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
AdminSelect.displayName = 'AdminSelect';

// ── AdminToggle ───────────────────────────────────────────────

interface AdminToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function AdminToggle({ checked, onChange, label, disabled }: AdminToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-6 rounded-full border-0 transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        style={{
          backgroundColor: checked ? 'var(--accent)' : 'var(--surface-2)',
          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200',
          )}
          style={{
            backgroundColor: checked ? 'var(--surface)' : 'var(--muted)',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
          }}
          aria-hidden="true"
        />
      </button>
      {label && (
        <span className="text-[13px]" style={{ color: 'var(--text)' }}>
          {label}
        </span>
      )}
    </label>
  );
}

// ── AdminCard ─────────────────────────────────────────────────

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('rounded-[12px] border p-5', className)}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {children}
    </div>
  );
}

// ── AdminBadge ────────────────────────────────────────────────

type BadgeVariant = 'accent' | 'success' | 'warning' | 'error' | 'muted';

export function AdminBadge({
  children,
  variant = 'muted',
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  const styles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    accent: {
      bg: 'var(--accent-dim)',
      color: 'var(--accent)',
      border: 'var(--accent)',
    },
    success: {
      bg: 'rgba(74,222,128,0.1)',
      color: '#4ade80',
      border: 'rgba(74,222,128,0.3)',
    },
    warning: {
      bg: 'rgba(251,191,36,0.1)',
      color: '#fbbf24',
      border: 'rgba(251,191,36,0.3)',
    },
    error: {
      bg: 'rgba(248,113,113,0.1)',
      color: '#f87171',
      border: 'rgba(248,113,113,0.3)',
    },
    muted: {
      bg: 'var(--surface-2)',
      color: 'var(--muted)',
      border: 'var(--border)',
    },
  };

  const s = styles[variant];

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
    >
      {children}
    </span>
  );
}

// ── AdminButton ───────────────────────────────────────────────

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
}

export function AdminButton({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: AdminButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 leading-none font-semibold rounded-[10px] border transition-all duration-200 cursor-pointer';

  const variants = {
    primary: 'bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)] hover:shadow-[0_0_24px_var(--accent-glow)]',
    ghost: 'bg-transparent border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--muted)]',
    danger: 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-9 px-4 text-[13px]',
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {loading && (
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-[380px] rounded-[16px] border p-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
            style={{ backgroundColor: 'rgba(248,113,113,0.12)' }}
            aria-hidden="true"
          >
            <AlertTriangle size={18} style={{ color: '#f87171' }} />
          </div>
          <div>
            <h2
              id="confirm-title"
              className="text-[15px] font-semibold mb-1"
              style={{ color: 'var(--text)' }}
            >
              {title}
            </h2>
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
              {description}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <AdminButton variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            <X size={13} aria-hidden="true" />
            Cancel
          </AdminButton>
          <AdminButton
            size="sm"
            variant="danger"
            onClick={onConfirm}
            loading={loading}
          >
            <Trash2 size={13} aria-hidden="true" />
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

// ── LoadingRows ───────────────────────────────────────────────

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-[10px] border animate-pulse"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      {icon && (
        <div
          className="w-12 h-12 rounded-[12px] grid place-items-center border mb-1"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--muted)',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <p
        className="text-[15px] font-medium"
        style={{ color: 'var(--text)' }}
      >
        {title}
      </p>
      {description && (
        <p className="text-[13px] max-w-[320px]" style={{ color: 'var(--muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── TagsInput ─────────────────────────────────────────────────
// Comma/Enter delimited tag input

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function TagsInput({
  value,
  onChange,
  label,
  placeholder = 'Add tag…',
  error,
}: TagsInputProps) {
  const [input, setInput] = useState('');

  function addTag(raw: string) {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <div
        className="flex flex-wrap gap-1.5 px-3 py-2 rounded-[10px] border min-h-[42px] focus-within:border-[var(--accent)] transition-colors"
        style={{
          backgroundColor: 'var(--surface-2)',
          borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border)',
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border text-[12px]"
            style={{
              backgroundColor: 'var(--accent-dim)',
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={11} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px]"
          style={{ color: 'var(--text)' }}
          aria-label={label ?? 'Tags input'}
        />
      </div>
      {error && (
        <p className="text-[12px]" style={{ color: '#f87171' }} role="alert">
          {error}
        </p>
      )}
      <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
        Press Enter or comma to add
      </p>
    </div>
  );
}

// ── BulletsInput ──────────────────────────────────────────────

interface BulletsInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function BulletsInput({
  value,
  onChange,
  label,
  placeholder = 'Add bullet point…',
}: BulletsInputProps) {
  const [input, setInput] = useState('');

  function add() {
    const v = input.trim();
    if (v) { onChange([...value, v]); setInput(''); }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <div className="flex flex-col gap-1.5">
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
              aria-hidden="true"
            />
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...value];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 px-3 py-2 rounded-[8px] border text-[13px] outline-none focus:border-[var(--accent)] transition-colors"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label="Remove bullet"
              className="text-[var(--muted)] hover:text-red-400 transition-colors"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        ))}
        <div className="flex gap-2 items-stretch">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder={placeholder}
            className="flex-1 h-9 px-3 rounded-[8px] border text-[13px] outline-none focus:border-[var(--accent)] transition-colors"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            aria-label="Add new bullet"
          />
          <AdminButton variant="ghost" onClick={add} type="button">
            <Plus size={13} aria-hidden="true" />
            Add
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
