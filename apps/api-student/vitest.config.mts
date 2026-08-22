import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    // Downloading the in-memory Mongo binary on a cold machine is slow.
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
})
