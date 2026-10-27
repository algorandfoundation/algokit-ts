import { defineConfig } from 'vitest/config'

// Shared test setup. Each package's vitest.config.ts merges its own options into this with `mergeConfig`.
export default defineConfig({
  appType: 'custom',
  test: {
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'html'],
    },
    // LocalNet (`algokit localnet start`)
    env: {
      ALGOD_TOKEN: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      ALGOD_SERVER: 'http://localhost',
      ALGOD_PORT: '4001',
      KMD_PORT: '4002',
      INDEXER_TOKEN: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      INDEXER_SERVER: 'http://localhost',
      INDEXER_PORT: '8980',
    },
  },
})
