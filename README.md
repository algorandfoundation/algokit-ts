# AlgoKit TypeScript Monorepo

This repository combines the following AlgoKit TypeScript projects into a single monorepo:

| Directory | Source repository |
| ------------------------------ | ------------------------------------------------------------------------ |
| `algokit-client-generator-ts/` | https://github.com/algorandfoundation/algokit-client-generator-ts |
| `algokit-subscriber-ts/` | https://github.com/algorandfoundation/algokit-subscriber-ts |
| `algokit-utils-ts/` | https://github.com/algorandfoundation/algokit-utils-ts |

## Development

The monorepo uses [pnpm workspaces](https://pnpm.io/workspaces). The pnpm version is pinned via `packageManager` in the root `package.json`.

```sh
pnpm install         # install dependencies for every package (single root pnpm-lock.yaml)
pnpm run build       # build all packages
pnpm run test        # test all packages (requires `algokit localnet start`)
pnpm run audit       # audit each package's dependencies

pnpm --filter ./algokit-utils-ts run test   # run a script in a single package
```

Packages that depend on each other use the local copy via `workspace:*`: `algokit-client-generator-ts` uses `algokit-utils-ts`, and `algokit-subscriber-ts` uses both. These links point at each dependency's built `dist/` folder, so run `pnpm run build` after a fresh clone, and after changing a package, before type-checking or testing the packages that depend on it. The root `build` script builds the packages in dependency order.

Workspace-wide settings (the dependency catalog, overrides, `minimumReleaseAge`, allowed build scripts, peer dependency rules and accepted audit findings) live in `pnpm-workspace.yaml`.

Dependency versions are defined once in the `catalog` in `pnpm-workspace.yaml`, and each `package.json` references them with `"<dep>": "catalog:"`. `catalogMode: strict` means you should add and update dependencies with pnpm rather than editing `package.json` by hand:

```sh
pnpm --filter ./algokit-utils-ts add -D some-dep   # adds some-dep to the catalog and writes "catalog:"
pnpm --filter ./algokit-utils-ts add -D vitest     # already cataloged: writes "catalog:"
pnpm --filter ./algokit-utils-ts add -D vitest@3   # fails: outside the catalog's range
```

To upgrade a dependency, change its version in the catalog and run `pnpm install`. Every package that uses it moves together. `peerDependencies` are the exception: they stay as ranges in each `package.json`.

## Releases

Each package is versioned and released independently with [semfrag](https://github.com/joe-p/semfrag), which replaced semantic-release. The packages share the sections in the root `semfrag.json`. Each package has its own `CHANGELOG.md` and `changelog.d/` directory.

Every change to a package's `src/` needs a fragment in that package's `changelog.d/`. The PR workflow checks for one. A fragment is a markdown file with one or more of the sections from `semfrag.json`:

```md
## Fixes

- Describe the change from the user's point of view
```

Fragment sections and the version bump each one triggers:

| Section | Bump |
| ------------------ | ----- |
| `Breaking Changes` | major |
| `Features` | minor |
| `Fixes` | patch |

The release workflow (`.github/workflows/release.yml`) runs after CI passes. It releases the packages one at a time, in dependency order: utils, client-generator, then subscriber. Each package with pending fragments is released like this:

1. **Push to `main`**: the fragments are merged into the changelog and promoted to the next beta, e.g. `9.2.3-beta.2`, which is published to npm under the `main` dist-tag.
1. **Manual run** (*Run workflow*, choosing all packages or one): the package's betas are promoted to a stable release, e.g. `9.2.3`, and published under `latest`. This replaces the old `release` branch and *Prod Publish* workflow.

Each release commits the changelog and the `package.json` version to `main`. It also creates a git tag and a GitHub release named after the package, for example `algokit-utils-v9.2.3`, `algokit-client-generator-v6.0.2` and `algokit-subscriber-v3.4.1`.

To preview a release locally, run [`semfrag`](https://github.com/joe-p/semfrag#install) from a package directory: `semfrag generate --dry-run`.

## Docs

The `algokit-utils-ts` and `algokit-subscriber-ts` docs sites are published together to this repository's GitHub Pages site, each under its own path:

| Path | Site |
| -------------- | ------------------------------------------------ |
| `/` | Landing page linking to each site, and to the `algokit-client-generator-ts/docs` folder on GitHub (`.github/pages/index.html`) |
| `/utils/` | `algokit-utils-ts/docs` |
| `/subscriber/` | `algokit-subscriber-ts/docs` |

The docs workflow (`.github/workflows/pages.yml`) runs on every push to `main` and can be run manually. It builds the packages and both sites, combines them with the landing page and deploys the result. A repository has only one Pages deployment, so every run rebuilds and replaces all the sites together.

Each site reads its URL from environment variables, set by the workflow from `actions/configure-pages` so the sites work under any repository name or custom domain:

- `DOCS_SITE`: the origin, e.g. `https://algorandfoundation.github.io`.
- `DOCS_BASE`: the path the site is served under, e.g. `/algokit-monorepo-ts/utils/`.

Without them the sites fall back to their old standalone paths (`/algokit-utils-ts/` and `/algokit-subscriber-ts/`), so `pnpm run docs:dev` in a package works as before. To build a site the way it's deployed:

```sh
DOCS_BASE=/algokit-monorepo-ts/utils/ pnpm --dir algokit-utils-ts run docs:build
```

To add another package's site, build it with its own `DOCS_BASE` in `pages.yml`, copy its `dist/` into `_site/`, and link it from the landing page.

### DevPortal

The [Algorand Developer Portal](https://github.com/algorandfoundation/devportal) imports the same docs from a tarball, `devportal-docs.tar.gz`, attached to a rolling GitHub prerelease. The DevPortal docs workflow (`.github/workflows/devportal-docs.yml`) runs on every push to `main` and can be run manually. For each package it builds the docs site, packages its content, sidebar and a `manifest.json`, and uploads the tarball to that package's release:

| Package | Release |
| ----------------------- | -------------------------------- |
| `algokit-utils-ts` | `algokit-utils-docs-latest` |
| `algokit-subscriber-ts` | `algokit-subscriber-docs-latest` |

The sites are built with their standalone base paths (`/algokit-utils-ts/`, `/algokit-subscriber-ts/`), which the manifest's `base` passes on so the DevPortal can rewrite links.

## TODO

Outstanding work from the move to a monorepo and semfrag:

- [ ] **npm trusted publishing**: each package's trusted publisher on npmjs.com still points at its old repository. Change it to this repository with the workflow `release.yml`.
- [ ] **Old docs sites**: the `algokit-utils-ts` and `algokit-subscriber-ts` repositories still serve their last docs build at `algorandfoundation.github.io/algokit-utils-ts/` and `/algokit-subscriber-ts/`, and it won't be updated. The package READMEs now link to the new site. Turn off Pages in those repositories once the new site is live, or leave the old sites up for existing links.
- [ ] **DevPortal import**: the DevPortal still imports `algokit-utils-ts` and `algokit-subscriber-ts` docs from the old repositories' `docs-latest` releases. Its import configs (`imports/configs/algokit-utils` and `imports/configs/algokit-subscriber`) need to point at this repository, and its import script (`scripts/import-release-docs.ts`) needs to support a release tag per variant, since it always uses `docs-latest`. Each package now publishes to its own release (see [DevPortal](#devportal)).

## How the history was preserved

Each project's full commit history from its `main` branch was imported. The history was rewritten so that each file appears to have always been in its subdirectory. Commands like `git log -- algokit-utils-ts/src/...` and `git blame` therefore work normally on any file without needing `--follow`.

The import was done with [`git filter-repo`](https://github.com/newren/git-filter-repo):

```sh
WORK=$(mktemp -d)
REPOS="algokit-client-generator-ts algokit-subscriber-ts algokit-utils-ts"

# 1. Clone each source repo and rewrite its history into a subdirectory
for r in $REPOS; do
  git clone --no-local --single-branch --branch main ../../algorandfoundation/$r $WORK/$r
  uvx git-filter-repo --source $WORK/$r --target $WORK/$r --to-subdirectory-filter $r
done

# 2. Start an empty root commit and merge each rewritten history into it
git checkout --orphan main
git commit --allow-empty -m "chore: init monorepo"
for r in $REPOS; do
  git fetch --no-tags $WORK/$r main:import/$r
  git merge --allow-unrelated-histories --no-edit import/$r -m "chore: import $r history"
  git branch -D import/$r
done
```

Notes:

- Only commits on each repo's `main` branch were imported. Other branches and tags were not.
- Commit hashes differ from the original repositories because the file paths changed. Authors, dates and commit messages are unchanged.
- The source repos were at the following commits when they were imported:
  - `algokit-client-generator-ts`: `c55e01f` (326 commits)
  - `algokit-subscriber-ts`: `3710d57` (278 commits)
  - `algokit-utils-ts`: `d467f20a` (772 commits)

## Changes

Changes made to the imported projects after they were combined into this monorepo.

### pnpm workspaces

The projects previously used npm, each with its own `package-lock.json`. They are now a single pnpm workspace with one root `pnpm-lock.yaml`. pnpm 12 is used because pnpm 11.0.6 failed to resolve some packages under `minimumReleaseAge` (registry metadata missing the `time` field).

Configuration that moved to the root:

- **Lockfiles**: the per-package `package-lock.json` files and the docs sites' own `pnpm-lock.yaml` files were replaced by the root `pnpm-lock.yaml`.
- **Release age**: the per-package `.npmrc` setting `min-release-age=7` became `minimumReleaseAge: 10080` (7 days, in minutes) in `pnpm-workspace.yaml`.
- **Overrides**: the npm `overrides` from each `package.json` were merged into `overrides` in `pnpm-workspace.yaml`. pnpm applies them to the whole workspace; where packages disagreed, the stricter range was kept.
- **Install scripts**: pnpm only runs dependency install scripts that are explicitly allowed. `allowBuilds` in `pnpm-workspace.yaml` allows them for prisma, esbuild and sharp.
- **Docs packages**: both docs sites were named `docs`. They are now `algokit-utils-docs` and `algokit-subscriber-docs`, marked private, and no longer pin their own `packageManager`.

Things that broke and how they were fixed:

- **Undeclared dependencies**: npm's flat `node_modules` let packages use dependencies they never declared. pnpm's strict layout doesn't. `@types/node` was added to all three packages and `fast-glob` to `algokit-subscriber-ts`.
- **`preserveSymlinks` in client-generator**: `tsconfig.json` and `tsconfig.non-strict.json` set `preserveSymlinks: true`, likely a leftover from `npm link`. pnpm links packages from its store, so TypeScript could no longer resolve vitest's internal types. The option was removed.
- **Prisma client generation**: npm ran `prisma generate` automatically from `@prisma/client`'s install script because it found the `prisma.schema` field in subscriber's `package.json`. Under pnpm that script runs from the workspace root and doesn't find the schema. Subscriber now has `"postinstall": "prisma generate"`. Scripts are stripped from the published `dist/package.json`, so this doesn't affect consumers.
- **Audit**: `better-npm-audit` wraps `npm audit` and needs a `package-lock.json`. It was removed, and each package's `audit` script now runs `pnpm --filter . audit`, which audits only that package. The accepted findings from the `.nsprc` files moved to `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`. Only one of those findings still applies: the `braces` advisory (GHSA-vfj7-8cjw-p6xm), which has no fix. The other exceptions were for packages bundled inside npm itself, which pnpm's audit doesn't check.
- **npm commands in scripts and docs**: `npm run`/`npx` in package scripts, VS Code launch configs and contributor docs were changed to `pnpm run`/`pnpm exec`. Install instructions for end users still use `npm install`.
- **VS Code test launch config** (`algokit-utils-ts`): `npm test -- --run <file>` became `pnpm test --run <file>`. pnpm passes a literal `--` through to vitest, which then ignores the file filter and runs every test.

### `workspace:*` linking

The packages previously installed each other from npm: client-generator used `@algorandfoundation/algokit-utils@^9.0.0`, and subscriber used `@algorandfoundation/algokit-client-generator@^5.0.0` plus algokit-utils as an auto-installed peer dependency. They now use the local workspace copies:

- `algokit-client-generator-ts` has `@algorandfoundation/algokit-utils: workspace:*` in `devDependencies`.
- `algokit-subscriber-ts` has `@algorandfoundation/algokit-utils: workspace:*` and `@algorandfoundation/algokit-client-generator: workspace:*` in `devDependencies`. This moves subscriber from client-generator 5.x to the local 6.x, including the `algokitgen` binary that `algokit generate client` uses to regenerate `tests/contract/client.ts`.
- `peerDependencies` ranges are unchanged, because they're what consumers of the published packages see. `devDependencies` aren't copied into the published `package.json`, so `workspace:*` never gets published.

Things that broke and how they were fixed:

- **Packages are published from `dist/`**: utils and client-generator build into `dist/` and releases publish that folder, so the package roots have no `index.js`. Both now set `publishConfig.directory: "dist"` and `publishConfig.linkDirectory: true`, which makes pnpm link dependents to `dist/` rather than the package root. Because of this the dependency has to be built before its dependents are type-checked or tested. On a fresh clone the links dangle until `pnpm run build` runs.
- **pnpm-only `publishConfig` keys leaking into the published package**: `scripts/copy-package-json.ts` copies `publishConfig` into `dist/package.json`. It now removes `directory` and `linkDirectory`, and removes `publishConfig` entirely if that leaves it empty, so the published `package.json` is the same as before.
- **Peer dependency warnings**: workspace packages had placeholder versions (`0.1.0` and `0.0.0`) because semantic-release set the real version when publishing, so peer ranges like `^9.0.0` never matched the linked copy. They now carry their real versions (see [Releases](#releases)), but between stable releases these are prereleases such as `9.2.3-beta.1`, which `^9.0.0` doesn't match either. `peerDependencyRules.allowedVersions` in `pnpm-workspace.yaml` accepts any version of the two linked packages.

### Dependency catalog

Each package previously listed its own dependency versions, and shared tools had drifted apart (for example TypeScript 5.4 to 6.0 and ESLint 9 to 10). Every external dependency version now lives in the [pnpm catalog](https://pnpm.io/catalogs) in `pnpm-workspace.yaml`, and `package.json` files use `catalog:`:

- **Shared dependencies** were aligned on the newest version any package used. This upgraded TypeScript to 6.0 and ESLint to 10 in client-generator and utils, Prettier from 3.2.5 to 3.9 in subscriber, and `eslint-config-prettier` (10), `cpy-cli` (7) and `@algorandfoundation/tealscript` (0.107) in utils.
- **Single-package dependencies** were moved into the catalog with their existing ranges, so their resolved versions didn't change.
- **Not cataloged**: `peerDependencies`, because each package's range is its own minimum supported version and is what consumers see, and the `workspace:*` links between packages.
- **`catalogMode: strict`**: `pnpm add` writes `catalog:`, adds new dependencies to the catalog, and rejects versions outside the catalog range. This only applies to `pnpm add`. pnpm doesn't check versions edited into `package.json` by hand.

Things that broke and how they were fixed:

- **`catalog:` would be published as-is**: releases run `npm publish` on `dist/`. Unlike `pnpm publish`, it doesn't replace `catalog:` with a version, and `scripts/copy-package-json.ts` copies `dependencies` and `peerDependencies` into `dist/package.json` unchanged. The script now reads versions from `pnpm-workspace.yaml` (using `yaml`, a new dev dependency) and fails the build if a catalog entry is missing or a `workspace:` specifier would be published.
- **TypeScript 6** (utils): `baseUrl` is deprecated and fails the `dist` type check. Nothing depended on it (there are no `paths` or imports relative to the root), so it was removed from `tsconfig.base.json`.
- **ESLint 10's recommended rules** (utils): `no-useless-assignment` flagged dead `getAccountConfigFromEnvironment` calls in `getAccount` and an unused `0n` initial value in `assetOptOut`. Both were removed. `preserve-caught-error` flagged the "Fees were too small" error in `AppClient`, which now sets `cause` to the original error.
- **Prettier 3.9** (subscriber): the subscriber code didn't match Prettier's output even before the upgrade, and formatting isn't checked in CI, so `pnpm run format` would reformat 9 files. They were left unformatted for a separate change.

### Docs publishing

Each docs site was previously deployed to its own repository's GitHub Pages site, at a fixed base path (`/algokit-utils-ts/` and `/algokit-subscriber-ts/`). They're now deployed together from this repository (see [Docs](#docs)):

- **Base path**: each `astro.config.mjs` reads `site` and `base` from `DOCS_SITE` and `DOCS_BASE`, falling back to the old values.
- **Hardcoded links** (utils): many hand-written pages link to other pages with absolute paths starting `/algokit-utils-ts/`. Rather than editing them, a new remark plugin (`docs/plugins/remark-rebase-links.ts`) rewrites that prefix to the configured base at build time. The homepage hero links, which are in frontmatter and aren't processed by remark, were made relative, matching the subscriber site.
- **DevPortal**: the per-package `publish-devportal-docs.yml` workflows were replaced by `.github/workflows/devportal-docs.yml` at the root. They used the DevPortal's shared `publish-devportal-docs` action, which can't be used from a monorepo: it names the docs after the repository and uploads every package's tarball to the same `docs-latest` release, so the packages would overwrite each other. The new workflow repeats the action's steps, with a release per package. Tarballs are no longer attached to versioned releases. The DevPortal only imports `docs-latest`, and the `v*` tags that triggered that upload no longer exist.
- **README links**: the package READMEs now link to the new site. The utils README's migration guide links, which pointed at files that no longer exist, link to the guides on the site.
