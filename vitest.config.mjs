import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '.tmp-vitest/vite',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
