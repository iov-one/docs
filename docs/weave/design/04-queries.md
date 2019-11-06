---
id: queries
title: Queries
sidebar_label: Queries
---

Once transactions are executed on the blockchain, we would like to be able to query the new state of the system. The ABCI interface and Tendermint rpc expose a standard query functionality for key-value pairs. Weave provides more advanced queries, such as over ranges of data, prefix searches, and queries on secondary indexes. To do so, we also need to provide a specification for the query request and response format that goes beyond raw bytes.

## ABCI Format

```go
type RequestQuery struct {
    Data   []byte  // also known as "key"
    Path   string
    Height int64
    Prove  bool
}
```

The request uses `Height` to select which block height to query and `Prove` to determine if we should also return Merkle proofs for the response. Note that "block height to query" is shorthand for "query the state produced after executing all transactions included in all blocks up to _and including_ `Height`". For various reasons internal to Tendermint, the root hash of this state is included as `AppHash` in the block at `Height+1`.

The actual data that we wish to read is declared in `Path` and `Data`. `Path` defines what kind of query this is, much like the path in an http get request. `Data` is an arbitrary argument. In the typical case, `Path = /key` and `Data = <key bytes>` to query a given key directly in the Merkle tree. However, if you wish to query the account balance, you will have to know how we define the account keys internally.

```go
// tendermint v0.31.5
type ResponseQuery struct {
    Code      uint32
    Log       string
    Info      string
    Index     int64
    Key       []byte
    Value     []byte
    Proof     []byte
    Height    int64
    Codespace string
}
```

That's a lot of fields... let's skip through them. `Code` is set to non-zero only when there is an error in processing the query. `Log` and `Info` are human-readable strings for debugging or extra info. `Index` _may_ be the location of this key in the Merkle tree, but that is not well defined.

Now to the important ones. `Height`, as above, the the block height of the tree we queried and is always set, even if the query had 0 to request "most recent". `Key` is the key of the Merkle tree we got, `Value` is the value stored at that key (may be empty if there is no value), and `Proof` is a Merkle proof in an undefined format.

## Weave Request Types

As we see above, the request format doesn't actually define what possible types are for either `Path` or `Data` and leaves it up to the application. This is good for a generic query interface, but to allow better code reuse between Weave extensions, as well as ease of development of Weave clients, we define a standard here for all Weave modules.

### Constructing Paths

Paths includes the resource we want to get:

- Raw Key: `/`
- Bucket: `/[bucket]`
- Index: `/[bucket]/[index]`

By default, we expect `Data` to include a raw key to match in that context. However, we can also append a modifier to change that behavior:

- `?prefix` =\> `Data` is a raw prefix (query returns N results, all items that start with this prefix)

### Examples

[blog.NewBlogBucket](https://github.com/iov-one/blog-tutorial/blob/master/x/blog/bucket.go#L26-L33) keeps blogs, along with a secondary index named as `user` that indexes blogs to users. It is registered under ["/blogs"](https://github.com/iov-one/blog-tutorial/blob/master/x/blog/handler.go#L20-L26) in the QueryHandler

Path: `/`, Data: `0123456789` (hex):  
db.Get(`0123456789`)

Path: `/blogs`, Data: `00CAFE00` (hex):
blog.NewBlogBucket().One(`00CAFE00`)

Path: `/blogs/user`, Data: `A230B....` (address):  
blog.NewBlogBucket().ByIndex("user").Get(address)

Path: `/?prefix`, Data: `0123456789` (hex):  
db.Iterator(`0123456789`, `012345678A`)

### Weave Response Types

Some queries return single responses, others multiple. Rather than build a complex switch statement in either the client or the application, the simplest approach is to learn from other databases, and always return a `ResultSet`. A higher-level client wrapper can provide nicer interfaces, but this provides a consistent format they can build on.

- `Key`: {key\*}
- `Value`: {value\*}

Key and value may have 0 to N elements, but they must have the same length. For any index `i`, `Result.i = {Key.i, Value.i}`. We define a simple protobuf format for ResultSet, which is used both in Key and Value, which has some helper methods to iterate over the pairs joined into Models.

### Usage In Extensions

A given app can hard-code the handler for `/`, and `?prefix`, but we need a way to register these with the root handler. The `app.StoreApp.Query` method can use a lookup from `Path` to handler. It will strip of the modifier (if any first), and call into a handler like:

```go
type QueryHandler interface {
    Query(modifier string, data []byte) Iterator
}
```

These then can be registered with a `Router` that also implements QueryHandler, just as we use `app.Router` and define `RegisterRoutes` in each extension. We just add another method `RegisterQueries`.

## Merkle Proofs

**Proofs are not yet implemented.** This is both due to prioritization of other features, and also as we wish to provide a solid proof format that is useful for IBC as well, and watching Cosmos-SDK development so we can maintain compatibility. As this format is recently stabilized inside the Cosmos hub, implementation in Weave should not be too far off. If want you can follow up the issue on [github](https://github.com/iov-one/weave/issues/5 'Define proofs for query #5').
