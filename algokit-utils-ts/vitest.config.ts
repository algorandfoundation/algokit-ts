import { defineConfig, mergeConfig } from 'vitest/config'
import base from '../tooling/vitest.base'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      projects: ['.'],
    },
  }),
)
