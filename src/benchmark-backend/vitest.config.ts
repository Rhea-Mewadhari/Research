import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    env: {
      JWT_SECRET: 'test-secret-for-vitest',
    },
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/dist/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['json'],
      include: ['src/services/productService.ts'],
      reportsDirectory: 'coverage',
    },
  },
});
