import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Enforce accessible anchor usage
      '@next/next/no-html-link-for-pages': 'error',
      // Allow explicit any only in data-layer types
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;
