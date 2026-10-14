// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import remarkGithubAlerts from 'remark-github-alerts'
import starlightTypeDoc from 'starlight-typedoc'
import remarkFixIndexUrls from './plugins/remark-fix-index-urls'
import remarkRebaseLinks from './plugins/remark-rebase-links'
import sidebarConfig from './sidebar.config.json'

// The combined GitHub Pages deployment sets DOCS_SITE and DOCS_BASE to serve this site under a sub-path.
const base = process.env.DOCS_BASE ?? '/algokit-utils-ts/'

// https://astro.build/config
export default defineConfig({
  site: process.env.DOCS_SITE ?? 'https://algorandfoundation.github.io',
  base,
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkFixIndexUrls, [remarkRebaseLinks, { from: '/algokit-utils-ts/', to: base }]],
  },
  integrations: [
    starlight({
      title: 'AlgoKit Utils TypeScript',
      customCss: [
        'remark-github-alerts/styles/github-colors-light.css',
        'remark-github-alerts/styles/github-colors-dark-media.css',
        'remark-github-alerts/styles/github-base.css',
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/algorandfoundation/algokit-utils-ts' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/algorand' },
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/index.ts', '../src/types/*.ts', '../src/testing/index.ts'],
          tsconfig: '../tsconfig.build.json',
          output: 'api',
          typeDoc: {
            entryPointStrategy: 'expand',
            exclude: ['**/*.spec.ts'],
            excludeReferences: true,
            // We are generating reference docs, not type-checking the project
            // (that is handled by `pnpm run check-types`), so skip TypeDoc's
            // type-checking pass which otherwise fails the docs build.
            skipErrorChecking: true,
            gitRevision: 'main',
            entryFileName: 'index',
          },
        }),
      ],
      sidebar: sidebarConfig,
    }),
  ],
})
