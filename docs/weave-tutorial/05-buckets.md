---
id: buckets
title: Buckets
sidebar_label: Buckets
---

> [PR#8](https://github.com/iov-one/tutorial/pull/8): _Create buckets_
\
[PR#9](https://github.com/iov-one/tutorial/pull/9): _Add indexer for market using marketID, askTicker, bidTicker_

Buckets are the components that we will use to interact with the KV store. It is our data warehouse.

Check out [morm](https://github.com/iov-one/tutorial/blob/master/morm/model_bucket.go#L40) package. It is enhanced version of [weave/orm](https://github.com/iov-one/weave/tree/master/orm) with indexes for making queries easier.
Lets dive in to code now.

First define `MarketBucket` that will hold `Market` informations and write a function creates a market. This is a basic `morm/model_bucket` without any indexes.

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

Now create your `OrderBookBucket` with secondary indexes. Seoncary indexes enable us inserting and querying models with ease. You can think is as SQL indexes.

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

*marketIDindexer* is an index with only market id. This is a simple index form to implement.
It just bindinds OrderBook to a MarketId(*bytes*)

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

You must have ideas flying around on your mind like **how are we going to make an compound index? Really!? Is it all weave has?**

Do not worry. Weave is like a swiss knife with a lot of blockchain features.

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

*BuildMarketIDTickersIndex =  indexByteSize = 8(MarketID) + ask ticker size + bid ticker size*

Sample market id index with tickers = `000000056665820070797900`

`000000056665820070797900` = 00000005(**MarketID = 5**) + 6665200(**BAR ticker in bytes**) + 70797900(**FOO ticker in bytes**)
