## Features

- App updates can now change the app's global schema and extra program pages in place (consensus v42). `AppUpdateParams` has a new optional `resize` field (`schema.globalInts`, `schema.globalByteSlices`, `extraPages`) with absolute target values, and extra program pages are increased automatically when the updated programs don't fit.
- The app deployer now treats only local schema increases as a breaking schema change. Global schema and extra program page changes are applied in place on update, with target sizes taken from `createParams` (or `updateParams.resize`). Reducing them requires the new `allowStateShrinking` deploy parameter and is never inferred from the compiled programs.
- The `algosdk` peer dependency is now `^3.9.0`.
