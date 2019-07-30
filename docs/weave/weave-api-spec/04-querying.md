---
id: weave-query-spec
title: Querying Weave
sidebar_label: Querying Weave
---

In this section querying Weave for data will be explained. Before diving into the details, Weave internals such as **buckets** and **paths** must be explained.

## Buckets

Buckets are the structures that enable accessing and writing to **Key-Value** database in an organized and controlled manner. Buckets stores the data as well as the [indexes](#Primary-indexes), [secondary indexes](#Secondary-indexes) that enables you to access the data.

### Accessing buckets

[//]: # 'TODO give reference to Weave/tendermint or ABCI documentation'

As mentioned in the previous sections, Weave uses tendermint as consensus engine thus queries are made to data store via `abci_queries`. Therefore when you make a query you do the call to tendermint's `ABCI` protocol. For more info about underlying refer to [tendermint/abciquery](https://tendermint.com/rpc/#abciquery).

Via running the JSON-RPC/HTTP call below, **kissnet** testnet could be queried so you can see an example response.

```bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321",
"method": "abci_query", "params": { "path": "/escrows/source", "data": "0000000000000000000000000000000000000000" } }' \
https://bns.kissnet.iov.one/
```

### Bucket paths

A bucket data can be queried using that bucket unique path to identify it.
The above curl command is reading username Token entity using _/tokens_ path.

Some available bucket paths: `/wallets`, `/auth`, `/aswaps` ...

## Indexes

### Primary indexes

For accessing the data resides inside buckets, indexes are used. E.g. to access wallet with primary index `00CAFE00`**(hex)**, call has to be made to `/wallets` path with index as data.

[//]: # 'TODO change testnet URLs to mainnet after it is launched'

```bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query", "params": { "path": "/wallets", "data": "CBC76ADED2C9DB439DB4C8D714CF26DAE5229A91" } }' https://bns.kissnet.iov.one/
```

- Path: `/`, Data: `0123456789` (hex) -> db.Get(`0123456789`)

  - Queries made to root (`/`) are direct queries to the key-value DB without an index.

- Path: `/wallets`, Data: `00CAFE00` (hex) -> wallets.Get(`00CAFE00`)
  - `wallets` are queried for the account with address `00CAFE00`.

### Secondary indexes

Another way to access data is using **secondary indexes**. Via secondary indexes, data could have multiple ways to be accessed. E.g. wallets are registered under a name so there might be some use cases for accessing them with names. `/wallets` + `/name` = `/wallets/name` indicates that bucket will be queried using name index that will be sent in the data field.

- Path: `/wallets/name`, Data: `4A6F686E` (raw: `John`): wallets.Index("name").Get("4A6F686E")
  - `wallets` are queried for the account with name `John`.

### Multikey indexes

There might be some cases where one index has multiple values. Multikeys exists for this purpose. Query response will be multiple values instead of one.

### Prefixes

There might be cases where all the data with has the same index prefix wanted to be retrieved. For this purpose you can do prefix searches using `?prefix` endpoints

- Queries that made using prefix without a data field would result as listing all the objects saved under the bucket

  - E.g. query below will return all the wallets saved under wallet bucket in [ResultSet](#Responses) response format

    ```bash
    curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query",
    "params": { "path": "/wallets?prefix", "data": "" } }' \
    https://bns.kissnet.iov.one/
    ```

  - E.g. query below will return all the tokens saved under token bucket in again ResultSet.

    ```bash
      curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query",
      "params": { "path": "/tokens?prefix", "data": "" } }' \
      https://bns.kissnet.iov.one/
    ```

- Path: `/wallets?prefix`, Data: `0123456789` (hex) -> db.Iterator(`0123456789`, `012345678A`)
  - `wallets` are queried for the accounts starting with from `0123456789` to `012345678A`

## Responses

Since Weave queries routed to tendermint ABCI protocol, tendermint enforces responses to be in `key/value` format. Reference: [tendermint/abci-spec#query](https://tendermint.readthedocs.io/en/v0.21.0/abci-spec.html#query).

```bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query", "params": { "path": "/wallets?prefix", "data": "CBC76ADED2C9DB439DB4C8D714CF26" } }' https://bns.kissnet.iov.one/
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
      "height": "529"
    }
  }
}
```

### Empty result or not found

For non-existent objects Weave returns the current block height. Such as:

```bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321",
"method": "abci_query", "params": { "path": "/wallets?prefix", "data": "0123456789" } }' \
https://bns.kissnet.iov.one/
```

The response will be:

```json
{
  "jsonrpc": "2.0",
  "id": "foobar321",
  "result": {
    "response": {
      "height": "527" <--- current block height
    }
  }
}
```

Since the request is with prefix, meaning multiple values will be returned.

### Parsing responses

The `key` and `value` values here are encoded with [ResultSet](https://github.com/iov-one/weave/blob/v0.20.0/spec/proto/app/results.proto#L5-L9). In order to decode ResultSet, import protobuf definition as mentioned in [Weave Transactions](weave/weave-api-spec/02-transaction.md). You can take a look at [iov-core](https://github.com/iov-one/iov-core/blob/v0.15.0/packages/iov-bns/src/bnsconnection.ts#L674-L679) implementation.

**Important:** Every key will include the bucket's name as prefix. As you can see on [iov-core/iov-bns](https://github.com/iov-one/iov-core/blob/v0.15.0/packages/iov-bns/src/bnsconnection.ts#L159-L177) and [iov-core/iov-bns/bnsconnection/getAccount](https://github.com/iov-one/iov-core/blob/v0.15.0/packages/iov-bns/src/bnsconnection.ts#L341) every key field in the ResultSet must begin with `cash:`
