import type { Link, Root } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Remark plugin that rewrites internal links written against a fixed base path
 * to the configured Astro `base`.
 *
 * The hand-written docs link to pages with absolute paths such as
 * `/algokit-utils-ts/capabilities/app/`, but the site can be deployed under a
 * different base (e.g. `/algokit-monorepo-ts/utils/` on the combined GitHub
 * Pages site).
 */
export default function remarkRebaseLinks({ from, to }: { from: string; to: string }) {
  return (tree: Root) => {
    if (from === to) return
    visit(tree, 'link', (node: Link) => {
      if (node.url.startsWith(from)) node.url = to + node.url.slice(from.length)
    })
  }
}
