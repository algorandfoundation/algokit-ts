# 9.2.3-beta.3 - November 6th, 2026

## Fixes

- Prevent duplicate asset, account, and app references when automatically populating app call resources. Previously, a transaction that referenced both app locals and asset holdings for the same account could have the same asset added to its foreign asset references multiple times.

# 9.2.3-beta.2 - October 19th, 2026

## Fixes

- Correct migration guide links in the README and typos in API documentation ([#625](https://github.com/algorandfoundation/algokit-utils-ts/pull/625)).

# 9.2.3-beta.1 - October 5th, 2026

## Fixes

- Match app id exactly in AppClient error handling ([#620](https://github.com/algorandfoundation/algokit-utils-ts/issues/620))

# 9.2.2 - September 3rd, 2026

## Fixes

- Bundle correct type declarations via tsc ([#613](https://github.com/algorandfoundation/algokit-utils-ts/issues/613))
