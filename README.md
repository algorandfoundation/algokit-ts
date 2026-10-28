# AlgoKit TypeScript

This monorepo contains the core TypeScript libraries and tools for [AlgoKit](https://github.com/algorandfoundation/algokit-cli), making it easier to build, test, deploy, and index applications on the Algorand blockchain.

## Packages

| Package                                                                                                                      | Directory                                                       | Description                                                                         | Docs                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [`@algorandfoundation/algokit-utils`](https://www.npmjs.com/package/@algorandfoundation/algokit-utils)                       | [`algokit-utils-ts/`](./algokit-utils-ts)                       | Core Algorand utilities providing a high-level, intuitive interface over `algosdk`. | [Docs](https://algorandfoundation.github.io/algokit-ts/utils/) · [README](./algokit-utils-ts/README.md)           |
| [`@algorandfoundation/algokit-client-generator`](https://www.npmjs.com/package/@algorandfoundation/algokit-client-generator) | [`algokit-client-generator-ts/`](./algokit-client-generator-ts) | Generates type-safe TypeScript clients for ARC-56 and ARC-32 smart contracts.       | [Usage](./algokit-client-generator-ts/docs/usage.md) · [README](./algokit-client-generator-ts/README.md)          |
| [`@algorandfoundation/algokit-subscriber`](https://www.npmjs.com/package/@algorandfoundation/algokit-subscriber)             | [`algokit-subscriber-ts/`](./algokit-subscriber-ts)             | Configurable transaction subscription and indexing library for Algorand.            | [Docs](https://algorandfoundation.github.io/algokit-ts/subscriber/) · [README](./algokit-subscriber-ts/README.md) |

Shared build, lint, test, and documentation configuration lives in the private [`tooling/`](./tooling) workspace package (`algokit-tooling`).

## Requirements

- **Node.js**: `>=22.0`
- **pnpm**: `12.11.2` (pinned via `packageManager` in [`package.json`](./package.json))
- **[AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli)**: Required to run LocalNet for integration tests (`algokit localnet start`)

## Development

This repository uses [pnpm workspaces](https://pnpm.io/workspaces) with a single root lockfile and a strict dependency catalog in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml).

```sh
# Install dependencies across all workspace packages
pnpm install

# Build all packages in dependency order (utils -> client-generator -> subscriber)
pnpm run build

# Run tests across all packages (requires `algokit localnet start`)
pnpm run test

# Lint, type-check, format, and audit
pnpm run lint
pnpm run check-types
pnpm run format
pnpm run audit
```

To run a script in a single package, use `pnpm --filter`:

```sh
pnpm --filter ./algokit-utils-ts run test
pnpm --filter ./algokit-client-generator-ts run check-types
pnpm --filter ./algokit-subscriber-ts run lint
```

> [!IMPORTANT]
> Cross-package dependencies (`algokit-client-generator-ts` -> `algokit-utils-ts`, and `algokit-subscriber-ts` -> both) link to each dependency's built `dist/` directory. Run `pnpm run build` after cloning and after modifying an upstream package before type-checking or testing its dependents.

### Managing Dependencies

External dependency versions are centrally managed in the `catalog` in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) with `catalogMode: strict`. Add or update dependencies using `pnpm` rather than editing `package.json` by hand:

```sh
pnpm --filter ./algokit-utils-ts add -D <pkg>
```

### Documentation

The documentation sites for `algokit-utils-ts` and `algokit-subscriber-ts` are built with Astro Starlight and deployed together to [GitHub Pages](https://algorandfoundation.github.io/algokit-ts/):

```sh
# Start a local dev server for a package's docs site
pnpm --dir algokit-utils-ts run docs:dev
pnpm --dir algokit-subscriber-ts run docs:dev

# Build the docs sites
pnpm --dir algokit-utils-ts run docs:build
pnpm --dir algokit-subscriber-ts run docs:build
```

## Contributing & Releases

Each package is versioned and released independently using [semfrag](https://github.com/joe-p/semfrag).

Any pull request that modifies a package's `src/` directory must include a changelog fragment file in that package's `changelog.d/` directory (e.g., `algokit-utils-ts/changelog.d/my-change.md`) containing one or more of the sections defined in [`semfrag.json`](./semfrag.json):

```markdown
## Fixes

- Describe the change from the user's point of view
```

| Section            | Version Bump |
| ------------------ | ------------ |
| `Breaking Changes` | `major`      |
| `Features`         | `minor`      |
| `Fixes`            | `patch`      |

- **Beta releases**: Pushing to `main` automatically merges pending fragments into each package's `CHANGELOG.md` and publishes a beta version to npm under the `main` dist-tag.
- **Stable releases**: Running the [Release workflow](./.github/workflows/release.yml) manually promotes pending beta versions to a stable release on npm under the `latest` dist-tag.

For deeper details on workspace architecture, shared tooling, DevPortal docs publishing, and how the repository history was combined, see [`MONOREPO.md`](./MONOREPO.md).

## License

All packages in this repository are licensed under the [MIT License](./algokit-utils-ts/LICENSE).
