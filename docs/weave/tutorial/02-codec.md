---
id: codec
title: Codec
sidebar_label: Codec
---

> [PR#1](https://github.com/iov-one/tutorial/pull/1): _Create order book models_

Codec is the first the component that needs to be designed. Keep in mind that this part is the most important since whole module will depend on _codec_. You can think codec it as _model_ in mvc pattern. Yet it is not simple as model. Codec defines the whole application state models and more.

## State

```protobuf
message Trade {
    weave.Metadata metadata = 1;
        bytes id = 2 [(gogoproto.customname) = "ID"];
        bytes order_book_id = 3 [(gogoproto.customname) = "OrderBookID"];
        bytes order_id = 4 [(gogoproto.customname) = "OrderID"];
        bytes taker = 5 [(gogoproto.casttype) = "github.com/iov-one/weave.Address"];
        bytes maker = 6 [(gogoproto.casttype) = "github.com/iov-one/weave.Address"];
        coin.Coin maker_paid = 7;
        coin.Coin taker_paid = 8;
        int64 executed_at = 9 [(gogoproto.casttype) = "github.com/iov-one/weave.UnixTime"];
    }
```

As you can see above, weave is heavily using `bytes` for identites, addresses etc. At first glance this might seem difficult to handle but if you take a look at [x/orderbook/bucket](https://github.com/iov-one/tutorial/blob/master/x/orderbook/bucket.go#L125) you can see it is very useful for indexing and performance

There are 2 critical points that needs to be explained in state models and messages.

Firstly, You must have noticed:

```protobuf
weave.Metadata metadata = 1;
```

`weave.Metadata` allows you to use *Migration* extension. Migration extension allows upgrading the code on chain without any downtime. This will be explained in more detail in further sections.

Second one is how the magic `ID` field works. This will be explained in [Models](weave/tutorial/04-models.md) section.

## Message definitions

```protobuf
    message CreateOrderMsg {
        weave.Metadata metadata = 1;
        bytes trader = 2 [(gogoproto.casttype) = "github.com/iov-one/weave.Address"];
        bytes order_book_id = 3 [(gogoproto.customname) = "OrderBookID"];
        coin.Coin offer = 4;
        Amount price = 5;
    }
```

As you can see above we define type necessary fields that will be used by `handler` to interact with application state.

After defining your state and messages run `make protoc` and make sure `prototool` creates your `codec.pb.go` file successfully.
Now we have scaffold of our application thanks to auto-generated *codec.pb.go* file.
