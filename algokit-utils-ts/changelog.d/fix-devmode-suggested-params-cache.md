## Fixes

- `AlgorandClient` no longer caches suggested params when connected to an algod node in developer mode, so `firstValid`/`lastValid` keep up with the per-transaction blocks. An explicit `setSuggestedParamsCacheTimeout` still takes precedence.
