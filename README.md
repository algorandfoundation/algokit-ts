# AlgoKit TypeScript Monorepo

This repository combines the following AlgoKit TypeScript projects into a single monorepo:

| Directory                      | Source repository                                                        |
| ------------------------------ | ------------------------------------------------------------------------ |
| `algokit-client-generator-ts/` | https://github.com/algorandfoundation/algokit-client-generator-ts       |
| `algokit-subscriber-ts/`       | https://github.com/algorandfoundation/algokit-subscriber-ts             |
| `algokit-utils-ts/`            | https://github.com/algorandfoundation/algokit-utils-ts                  |

## Development

The monorepo uses [pnpm workspaces](https://pnpm.io/workspaces). The pnpm version is pinned via `packageManager` in the root `package.json`.

```sh
pnpm install         # install dependencies for every package (single root pnpm-lock.yaml)
pnpm run build       # build all packages
pnpm run test        # test all packages (requires `algokit localnet start`)
pnpm run audit       # audit each package's dependencies

pnpm --filter ./algokit-utils-ts run test   # run a script in a single package
```

Workspace-wide settings (overrides, `minimumReleaseAge`, allowed build scripts and accepted audit findings) live in `pnpm-workspace.yaml`.

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
