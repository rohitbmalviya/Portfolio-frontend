import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Design token aliases — these map to the CSS custom properties
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'accent-glow': 'var(--accent-glow)',
      },
      maxWidth: {
        wrap: '1080px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow), 0 0 0 1px var(--accent-glow)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
