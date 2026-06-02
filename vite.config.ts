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
      // Thresholds rounded down to nearest 5% below current coverage.
      // Current: statements 84.7%, branches 71%, functions 73.5%, lines 84.7%
      // Raise these thresholds as new tests are added.
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 70,
        lines: 80,
      },
      reporter: ['text', 'lcov'],
    },
  },
});