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
As mentioned in the previous sections, Weave uses tendermint as consensus engine thus queries are made to data store via `abci_queries`. Therefore when you make a query actually you do the call to tendermint's abci protocol. For more info about underlyings refer to [tendermint/abciquery](https://tendermint.com/rpc/#abciquery).

Via running the JSON-RPC/HTTP call below, __hugnet__ testnet could be queried so you can see an example response.

``` bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query", "params": { "path": "/tokens", "data": "" } }' https://bns.hugnet.iov.one/
```

### Bucket paths

Every bucket registered under Weave is accessed using __paths__. On the example curl command above given path parameter says the bucket wanted to be accessed is the tokens bucket.

Some available bucket paths: `/wallets`, `/auth`, `/aswaps` ...

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
  - `wallets` are queried for the accounts starting with from `0123456789` to `012345678A`

## Responses

Since weave queries routed to tendermint abci protocol, tendermint enforces responses to be in `key/value` format. Reference: [tendermint/abci-spec#query](https://tendermint.readthedocs.io/en/v0.21.0/abci-spec.html#query).

```bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query", "params": { "path": "/wallets?prefix", "data": "CBC76ADED2C9DB439DB4C8D714CF26" } }' https://bns.davenet.iov.one/
```

When the curl command above executed, this response will be received:

```json
{
  "jsonrpc": "2.0",
  "id": "foobar321",
  "result": {
    "response": {
      "key": "ChljYXNoOsvHat7SydtDnbTI1xTPJtrlIpqR",
      "value": "ChAKAggBEgoIlZrvOhoDSU9W",
      "height": "2506"
    }
  }
}
```

Since the request is with prefix, meaning multiple values will be returned.

### Parsing responses

The `key` and `value` values here are encoded with [ResultSet](https://github.com/iov-one/weave/blob/v0.18.0/spec/proto/app/results.proto#L5-L9). In order to decode ResultSet, import protobuf definition as mentioned in [docs/weave/transaction](https://github.com/iov-one/docs/blob/master/docs/weave/weave-api-spec/01-transaction.md#L102). You can take a look at [iov-core](https://github.com/iov-one/iov-core/blob/v0.15.0/packages/iov-bns/src/bnsconnection.ts#L674-L679) implementation.

__Important:__ Every key must include the bucket's name as prefix. As you can see on [iov-core/iov-bns](https://github.com/iov-one/iov-core/blob/v0.15.0/packages/iov-bns/src/bnsconnection.ts#L159-L177) and [iov-core/iov-bns/bnsconnection/getAccount](https://github.com/iov-one/iov-core/blob/v0.15.0/packages/iov-bns/src/bnsconnection.ts#L341) every key field in the ResultSet must begin with `cash:`

## Available bucket paths by package name

- __Username__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/cmd/bnsd/x/username/model.go#L73): `username:`
  - `/usernames` -> takes `id` as data, returns [bnsd/x/username/username.Token](https://github.com/iov-one/weave/blob/master/cmd/bnsd/x/username/codec.proto#L7-L26)
  - `/usernames?prefix` -> takes prefix as data, returns `ResultSet`
  - 
- __Cash__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/cash/model.go#L18): `cash:`
  - `/wallets` -> takes `id`(8 bytes), returns [x/cash.Set](https://github.com/iov-one/weave/blob/v0.18.0/x/cash/codec.proto#L11-L14) by id
  - `/wallets?prefix` -> takes prefix as data, returns `ResultSet`

- __Sigs__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/sigs/model.go#L117): `sigs:`
  - `/auth` -> takes address `id`(8 bytes) returns [x/sigs.UserData](https://github.com/iov-one/weave/blob/v0.18.0/spec/proto/x/sigs/codec.proto#L13-L17) by id
  - `/auth?prefix` -> takes prefix as data, returns `ResultSet`

- __Multisig__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/multisig/model.go#L86): `multisig:`
  - `/contracts` -> takes `id`(8 bytes) returns [x/multisig.Contract](https://github.com/iov-one/weave/blob/v0.18.0/x/multisig/codec.proto#L8-L21)
  - `/contracts?prefix` -> takes prefix as data, returns `ResultSet`

- __Atomic swaps__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/aswap/model.go#L85): `swap:`
  - `/aswaps` -> takes `id`(8 bytes) returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/master/x/aswap/codec.proto#L9-L29)
  - `/aswaps/source` -> takes `source` as secondary index (8 bytes) returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/master/x/aswap/codec.proto#L9-L29)
  - `/aswaps/destination` -> takes `destination` as secondary index (8 bytes) returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/master/x/aswap/codec.proto#L9-L29)
  - `/aswaps/preimage_hash` -> takes `preimage_hash` as secondary index (8 bytes) returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/master/x/aswap/codec.proto#L9-L29)
  - `/aswaps?prefix` -> takes prefix as data, returns `ResultSet`

- __Escrow__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/escrow/model.go#L113): `escrow:`
  - `/escrows` -> takes `id`(8 bytes) returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/master/x/escrow/codec.proto#L9-L28)
  - `/escrows/source` -> takes `source` as secondary index (8 bytes) returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/master/x/escrow/codec.proto#L9-L28)
  - `/escrows/destination` -> takes `destination` as secondary index (8 bytes) returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/master/x/escrow/codec.proto#L9-L28)
  - `/escrows/arbiter` -> takes `/arbiter` as secondary index (8 bytes) returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/master/x/escrow/codec.proto#L9-L28)
  - `/escrows?prefix` -> takes prefix as data, returns `ResultSet`

- __Governance__
  - Electorates
    - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/bucket.go#L17): `electorate:`
    - `electorates` takes `id`(8 bytes) returns [x/gov.Electorate](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L9-L23)
    - `electorates/elector`

- __Payment channels__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/paychan/model.go#L67): `paychan:`
  - `/paychans` -> takes `id`(8 bytes) returns [x/paychan.PaymentChannel](https://github.com/iov-one/weave/blob/v0.18.0/x/paychan/codec.proto#L10-L36)
  - `/paychans?prefix` -> takes prefix as data, returns `ResultSet`

- __Distribution__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/distribution/model.go#L110): `revenue:`
  - `/revenues` -> takes `id`(8 bytes) returns [x/distribution](https://github.com/iov-one/weave/blob/master/x/v0.18.0/codec.proto#L8-L34)
  - `/revenues?prefix` -> takes prefix as data, returns `ResultSet`

- __Currency__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/currency/model.go#L55): `tokeninfo:`
  - `/tokens` -> takes `id`(8 bytes) returns [x/currency.TokenInfo](https://github.com/iov-one/weave/blob/v0.18.0/x/currency/codec.proto#L7-L12)
  - `/tokens?prefix` -> takes prefix as data, returns `ResultSet`

- __Validators__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/validators/model.go#L16): `uvalid:`
  - `/validators` -> takes `id`(8 bytes) returns [x/validators.Accounts](https://github.com/iov-one/weave/blob/v0.18.0/x/validators/codec.proto#L14-L18)
  - `/validators?prefix` -> takes prefix as data, returns `ResultSet`

- __Anti spam__
  - [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/msgfee/model.go#L48): `msgfee:`
  - `/msgfee` -> takes `id` (8 bytes) returns [x/msgfee.MsgFee](https://github.com/iov-one/weave/blob/v0.18.0/x/msgfee/codec.proto#L9-L16)
  - `/msgfee?prefix` -> takes prefix as data, returns `ResultSet`
  - `/minfee` -> takes `id` (8 bytes) returns [x/msgfee.MsgFee](https://github.com/iov-one/weave/blob/v0.18.0/x/msgfee/codec.proto#L9-L16)
  - `/minfee?prefix` -> takes prefix as data, returns `ResultSet`


