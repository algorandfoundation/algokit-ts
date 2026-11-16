## Features

- `TransactionComposer` now throws a descriptive error when a group contains duplicate transactions (the same transaction ID), for example when identical calls are composed with cached suggested params, instead of letting the network reject the group.
