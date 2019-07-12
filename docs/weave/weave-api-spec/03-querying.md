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
