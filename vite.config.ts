import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/setupTests.ts',
        'src/types/**',
        'src/constants/**',
        'src/config.ts',
        'src/index.tsx',
      ],
      // Thresholds set just below current coverage to prevent regression.
      // Current: lines 58.8%, branches 40.69%, functions 51.76%, statements 60.03%
      // Raise these thresholds as new tests are added.
      thresholds: {
        lines: 55,
        branches: 38,
        functions: 48,
        statements: 57,
      },
      reporter: ['text', 'lcov'],
    },
  },
});