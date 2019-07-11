---
id: weave-query-spec
title: Querying Weave
sidebar_label: Querying Weave
---

In this section querying weave for data will be explained. Before diving into the details, Weave internals such as __buckets__ and __paths__ must be explained.

## Buckets

Buckets are the structures that enable accessing and writing to __Key-Value__ database in an organized and controlled manner. Buckets stores the data as well as the indexes, secondary indexes that refer to the data.

### Accessing buckets

[//]: # (TODO give reference to weave/tendermint or abci documentation)
As mentioned in the previous sections, Weave uses tendermint as consensus engine thus queries are made to data store via `abci_queries`. Refer to [tendermint/abciquery](https://tendermint.com/rpc/#abciquery).

Via running the JSON-RPC/HTTP call below, __hugnet__ testnet could be queried so you can see an example response.

``` bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query", "params": { "path": "/tokens", "data": "" } }' https://bns.hugnet.iov.one/
```

### Bucket paths

Every bucket registered under Weave is accessed using __paths__. On the example curl command above given path parameter says the bucket wanted to be accessed is the tokens bucket. 

Here are the major bucket paths registered under BNSD:

| Bucket           | Path          | Reference                                                                                                     |
|------------------|---------------|---------------------------------------------------------------------------------------------------------------|
| __Cash__             | `wallets`     | [weave/x/cash/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/cash/handler.go#L14)                   |
| __Sigs__             | `auth`        | [weave/x/sigs/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/sigs/decorator.go#L19)                                |
| __MultiSig__         | `contracts`   | [weave/x/multisig/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/multisig/handlers.go#L22)          |
| __Atomic swaps__     | `aswaps`      | [weave/x/aswaps/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/aswap/handler.go#L34)                |
| __Escrow__           | `escrows`     | [weave/x/escrow/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/escrow/handler.go#L35)               |
| __Governance__       | *See reference* | [weave/x/gov/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/handler.go#L27...L30)               |
| __Payment channels__ | `paychans`    | [weave/x/paychan/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/paychan/handler.go#L20)             |
| __Distribution__     | `revenues`    | [weave/x/distribution/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/distribution/handler.go#L20)   |
| __Currency__         | `tokens`      | [weave/x/currency/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/currency/handler.go#L13)           |
| __Validators__       | `validators`  | [weave/x/validators/handler](https://github.com/iov-one/weave/blob/v0.18.0/x/validators/handler.go#L22)       |
| __Anti-spam__        | `minfee`      | [weave/x/msgfee/antispam_query](https://github.com/iov-one/weave/blob/v0.18.0/x/msgfee/antispam_query.go#L29) |

## Indexes

### Primary indexes

For accessing the data resides inside buckets, indexes are used. E.g.  to access wallet with primary index `00CAFE00`__(hex)__, call has to be made to `/wallets` path with index as data.

```bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query", "params": { "path": "/wallets", "data": "00CAFE00" } }' https://bns.antnet.iov.one/
```

- Path: ``/``, Data: ``0123456789`` (hex) -> db.Get(``0123456789``)
  - Queries made to root (`/`) are direct queries to the key-value db without an index.

- Path: ``/wallets``, Data: ``00CAFE00`` (hex) -> wallets.Get(``00CAFE00``)
  - `wallets` are queried for the account with address `00CAFE00`.

### Secondary indexes

Another way to access data is using __secondary indexes__. Via secondary indexes data could have multiple ways to be accessed. E.g. wallets are registered under a name so there might be some use cases for accessing them with names. `/wallets` + `/name` = `/wallets/name` indicates that bucket will be queried using name index that will be sent in the data field.

- Path: ``/wallets/name``, Data: "John" (raw): wallets.Index("name").Get("John")
  - `wallets` are queried for the account with name `John`.

### Prefixes

There might be cases which all the data with index that begins with prefix. `wallets`

- Path: ``/wallets?prefix``, Data: ``0123456789`` (hex) -> db.Iterator(``0123456789``, ``012345678A``)
