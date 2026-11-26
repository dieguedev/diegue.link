import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { testEnv } from './tests/env';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    env: testEnv,
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
  },
});
