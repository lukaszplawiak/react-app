import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';
import vitestPlugin from '@vitest/eslint-plugin';

export default tseslint.config(
  // --- Base ---
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // --- All source files ---
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Promise: 'readonly',
        Error: 'readonly',
        Math: 'readonly',
        Number: 'readonly',
        String: 'readonly',
        Boolean: 'readonly',
        Object: 'readonly',
        Array: 'readonly',
        JSON: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React 19: no longer needs React in scope
      'react/react-in-jsx-scope': 'off',
      // TypeScript handles prop types
      'react/prop-types': 'off',
      // Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      // Import order is handled by @trivago/prettier-plugin-sort-imports via Prettier.
      // Enabling import/order here would create a conflict between two tools
      // doing the same job — Prettier wins because it runs on save/commit.
    },
  },

  // --- Test files ---
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    plugins: {
      vitest: vitestPlugin,
    },
    languageOptions: {
      globals: {
        ...vitestPlugin.environments.env.globals,
      },
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      'react/display-name': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // --- Prettier (must be last — disables formatting rules) ---
  prettierConfig,
);