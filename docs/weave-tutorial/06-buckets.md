---
id: buckets
title: Buckets
sidebar_label: Buckets
---

> [PR#8](https://github.com/iov-one/tutorial/pull/8): _Create buckets_
\
[PR#9](https://github.com/iov-one/tutorial/pull/9): _Add indexer for market using marketID, askTicker, bidTicker_

When running your handlers, you get access to the root **KVStore**, which is an abstraction level similar to boltdb or leveldb. It is our data warehouse. An extension can opt-in to using one or more Buckets to store the data. Buckets offer the following advantages:

- Isolation between extensions (each Bucket has a unique prefix that is transparently prepended to the keys)
- Type safety (enforce all data stored in a Bucket is the same type, to avoid parse errors later on)
- Indexes (Buckets are well integrated with the secondary indexes and keep them in sync every time data is modified)
- Querying (Buckets can easily register query handlers including prefix queries and secondary index queries)

All extensions from weave use Buckets, so for compatibility as well as the features, please use Buckets in your app, unless you have a very good reason not to (and know what you are doing).

To do so, you will have to wrap your state data structures into [Objects](https://godoc.org/github.com/iov-one/weave/orm#Object). The simplest way is to use `SimpleObj`:

```go
// It can be used as a template for type-safe objects
type SimpleObj struct {
    key   []byte
    value CloneableData
```

And extend your protobuf objects to implement `CloneableData`:

```go
    Clone() Object
}

// CloneableData is an intelligent Value that can be embedded
// in a simple object to handle much of the details.
```

This basically consists of adding _Copy()_ and _Validate()_ to the objects in `codec.pb.go`. On [Models](weave-tutorial/04-models.md) section, we implemented _Copy()_ and _Validate()_ as you remember. Now it makes sense right!

## Dive into Code

Let's define `MarketBucket` that will hold `Market` information and write a function that creates a market. This is a basic `morm/model_bucket` without any secondary index.

```go
type MarketBucket struct {
    morm.ModelBucket
}

func NewMarketBucket() *MarketBucket {
    b := morm.NewModelBucket("market", &Market{})
    return &MarketBucket{
        ModelBucket: b,
    }
}
```

Now create your `OrderBookBucket` with secondary indexes. Secondary indexes enable us to insert and query models with ease. You can think is as SQL indexes.

```go
type OrderBookBucket struct {
    morm.ModelBucket
}

// NewOrderBookBucket initates orderbook with required indexes
func NewOrderBookBucket() *OrderBookBucket {
    b := morm.NewModelBucket("orderbook", &OrderBook{},
        morm.WithIndex("market", marketIDindexer, false),
        morm.WithIndex("marketWithTickers", marketIDTickersIndexer, true),
    )

    return &OrderBookBucket{
        ModelBucket: b,
    }
}
```

Let's explain what the heck is `morm.WithIndex("market", marketIDindexer, false)`?

## Secondary Indexes

Sometimes we need another index for the data. Generally, we will look up an order book from the market it belongs to and it’s index in the market. But what if we want to list all orderbooks of a market overall order books? For this, we need to add a secondary index on the order books to query by market. This is a typical case and weave provides nice support for this functionality.

We add an indexing method to take any object, enforce the type to be a proper Orderbook, then extract the index we want. This can be a field or any deterministic transformation of one (or multiple) fields. The output of the index becomes key in another query. Bucket provides a simple method to query by index.

**marketIDindexer** is a secondary index with only market ID. This is a simple index form to implement.
It binds OrderBook to a MarketId(*bytes*)

Weave uses uniformed *bytes* as indexes. This improves performance.

```go
func marketIDindexer(obj orm.Object) ([]byte, error) {
    if obj == nil || obj.Value() == nil {
        return nil, nil
    }
    ob, ok := obj.Value().(*OrderBook)
    if !ok {
        return nil, errors.Wrapf(errors.ErrState, "expected orderbook, got %T", obj.Value())
    }
    return ob.MarketID, nil
}
```

You must have ideas flying around in your mind like **how are we going to make a compound index? Really!? Is it all weave has?**

Don't worry. Weave is like a swiss knife with a lot of blockchain features.

Here is how we create compound index for morm buckets:

```go
func BuildMarketIDTickersIndex(orderbook *OrderBook) []byte {
    askTickerByte := make([]byte, tickerByteSize)
    copy(askTickerByte, orderbook.AskTicker)

    bidTickerByte := make([]byte, tickerByteSize)
    copy(bidTickerByte, orderbook.BidTicker)

    return bytes.Join([][]byte{orderbook.MarketID, askTickerByte, bidTickerByte}, nil)
}
```

*BuildMarketIDTickersIndex = indexByteSize = 8(MarketID) + ask ticker size + bid ticker size*

Sample market id index with tickers = `000000056665820070797900`

`000000056665820070797900` = 00000005(**MarketID = 5**) + 6665200(**BAR ticker in bytes**) + 70797900(**FOO ticker in bytes**)

## Custom Bucket

Want to enforce the data consistency on the buckets. All data is validated before saving, but we also need to make sure that all data is the proper type of object before saving. Unfortunately, this is quite difficult to do compile-time without generic, so a typical approach is to embed the orm.Bucket in another struct and just force validation of the object type runtime before save. Truth time: `morm.ModelBucket` is a refinement of `weave/orm.ModelBucket`. It uses auto-incrementing sequences(id) under the hood. We used morm modules instead of orm to show you even buckets are customizable to your needs. You can compare [morm](https://github.com/iov-one/tutorial/blob/master/morm/model_bucket.go#L40) and [weave/orm](https://github.com/iov-one/weave/tree/master/orm) and see how to implement your custom bucket.
