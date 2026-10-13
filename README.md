# AlgoKit TypeScript Monorepo

This repository combines the following AlgoKit TypeScript projects into a single monorepo:

| Directory                      | Source repository                                                        |
| ------------------------------ | ------------------------------------------------------------------------ |
| `algokit-client-generator-ts/` | https://github.com/algorandfoundation/algokit-client-generator-ts       |
| `algokit-subscriber-ts/`       | https://github.com/algorandfoundation/algokit-subscriber-ts             |
| `algokit-utils-ts/`            | https://github.com/algorandfoundation/algokit-utils-ts                  |

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
