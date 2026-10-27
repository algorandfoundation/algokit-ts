import { defineConfig, mergeConfig } from 'vitest/config'
import base from '../tooling/vitest.base'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      // Sometimes indexer catchup is slowwwww...
      testTimeout: 20_000,
      coverage: {
        exclude: ['src/types/*.*'],
      },
    },
  }),
)
