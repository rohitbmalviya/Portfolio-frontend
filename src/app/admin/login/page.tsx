'use client';

// ============================================================
//  Admin Login Page
//  POST /api/auth/login — sets httpOnly access_token cookie.
//  On success redirects to /admin dashboard.
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { adminAuth } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminAuth.login({ email, password });
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-[400px] rounded-[16px] border p-8"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="w-12 h-12 rounded-[12px] grid place-items-center mx-auto mb-4 border"
            style={{
              backgroundColor: 'var(--accent-dim)',
              borderColor: 'var(--accent)',
            }}
          >
            <Lock size={20} style={{ color: 'var(--accent)' }} aria-hidden="true" />
          </div>
          <h1
            className="text-[24px] font-semibold tracking-tight mb-1"
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              color: 'var(--text)',
            }}
          >
            Admin Login
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
            Portfolio dashboard — restricted access
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-[10px] text-[14px] border"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: '#f87171',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-[13px] font-medium mb-1.5"
              style={{ color: 'var(--text)' }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--muted)' }}
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  'w-full pl-9 pr-4 py-3 rounded-[10px] border text-[14px] outline-none',
                  'transition-colors duration-150',
                )}
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = 'var(--accent)')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'var(--border)')
                }
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-medium mb-1.5"
              style={{ color: 'var(--text)' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--muted)' }}
                aria-hidden="true"
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-3 rounded-[10px] border text-[14px] outline-none transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = 'var(--accent)')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'var(--border)')
                }
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ color: 'var(--muted)' }}
              >
                {showPassword ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-2 w-full py-3 rounded-[10px] border text-[14px] font-semibold',
              'transition-all duration-200 flex items-center justify-center gap-2',
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            )}
            style={{
              backgroundColor: 'var(--accent-dim)',
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
