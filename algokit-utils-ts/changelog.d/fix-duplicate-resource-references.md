## Fixes

- Prevent duplicate asset, account, and app references when automatically populating app call resources. Previously, a transaction that referenced both app locals and asset holdings for the same account could have the same asset added to its foreign asset references multiple times.
