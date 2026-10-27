// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import remarkGithubAlerts from 'remark-github-alerts'
import starlightTypeDoc from 'starlight-typedoc'
import remarkFixIndexUrls from '../../tooling/remark-fix-index-urls'
import remarkRebaseLinks from '../../tooling/remark-rebase-links'
import sidebarConfig from './sidebar.config.json'

// The combined GitHub Pages deployment sets DOCS_SITE and DOCS_BASE to serve this site under a sub-path.
const base = process.env.DOCS_BASE ?? '/algokit-subscriber-ts/'

// https://astro.build/config
export default defineConfig({
  site: process.env.DOCS_SITE ?? 'https://algorandfoundation.github.io',
  base,
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkFixIndexUrls, [remarkRebaseLinks, { from: '/algokit-subscriber-ts/', to: base }]],
  },
  integrations: [
    starlight({
      title: 'AlgoKit Subscriber TypeScript',
      customCss: [
        'remark-github-alerts/styles/github-colors-light.css',
        'remark-github-alerts/styles/github-colors-dark-media.css',
        'remark-github-alerts/styles/github-base.css',
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/algorandfoundation/algokit-subscriber-ts' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/algorand' },
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/index.ts', '../src/types/index.ts'],
          tsconfig: '../tsconfig.build.json',
          output: 'api',
          sidebar: {
            label: 'API Reference',
            collapsed: true,
          },
          typeDoc: {
            excludeReferences: true,
            gitRevision: 'main',
            entryFileName: 'index',
          },
        }),
      ],
      sidebar: sidebarConfig,
    }),
  ],
})
