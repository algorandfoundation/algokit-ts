## Fixes

- `AppManager.compileTeal` now throws an error listing any unresolved `TMPL_*` template variables instead of sending them to algod, which failed with an unclear `strconv.ParseUint` error.
