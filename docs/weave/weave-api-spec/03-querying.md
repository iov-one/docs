---
id: weave-query-spec
title: Querying Weave
sidebar_label: Querying Weave
---

In this section querying weave for data will be explained. Before diving into the details, Weave internals such as __buckets__ and __paths__ must be explained.

## Buckets

Buckets are the structures that enables accessing and writing to __Key-Value__ database in an organized and controlled manner. Buckets stores the data as well as the indexes, secondary indexes that refer to the data.

## Accessing buckets
[//]: # (TODO give reference to weave/tendermint or abci documentation here)
As mentioned in the previous sections Weave uses tendermint as consensus engine thus queries are made to data store via `abci_queries`. Refer to [tendermint/abciquery](https://tendermint.com/rpc/#abciquery).

Via running the curl command down below you can see the response format from `tokens` bucket:
``` bash
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321", "method": "abci_query", "params": { "path": "/tokens?prefix", "data": "" } }' https://bns.hugnet.iov.one/
```
