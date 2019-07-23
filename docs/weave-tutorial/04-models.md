---
id: models
title: Models
sidebar_label: Models
---

> [PR#6](https://github.com/iov-one/tutorial/pull/6): _Create models_

We defined our state in [codec section](weave-tutorial/02-codec.md). In order to use models in weave we have to wrap our model with some functionalities and enforce it is a **morm.Model**

Ensure our `OrderBook` fulfills morm.Model. This is just a helper so the compiler will complain loudly here if you forget to implement a method. Guaranteeing it *I am trying to implement this interface*.

```go
var _ morm.Model = (*OrderBook)(nil)
```

Now lets explain on our models identity:

## Auto incremented identities

`morm.Model` covers auto incremented IDs for you. All you have to define `GetID` and `SetID` methods. If you defined `bytes id = 2 [(gogoproto.customname) = "ID"];`  on `codec.proto` you do not even need to write `GetID` method by yourself, Thanks to prototool it will be generated automatically. You will only need to define SetID method.

## Custom identity

For using your custom identity, do not define `bytes id = 2 [(gogoproto.customname) = "ID"];` on `codec.proto`. You can use any other field as index with logic on top. Just write `SetID` and `GetID` logic that uses your index.

Now you see how indexing works in Weave. Lets see the other wonders of the framework.

In order to our model to fulfill **Model** it must be [Clonable](https://github.com/iov-one/weave/blob/master/orm/interfaces.go#L34).

This is how you ensure it:

```go
func (o *OrderBook) Copy() orm.CloneableData {
    return &OrderBook{
        Metadata:      o.Metadata.Copy(),
        ID:            copyBytes(o.ID),
        MarketID:      copyBytes(o.MarketID),
        AskTicker:     o.AskTicker,
        BidTicker:     o.BidTicker,
        TotalAskCount: o.TotalAskCount,
        TotalBidCount: o.TotalBidCount,
    }
}
```

Another contstraint **Model** enforces same as messages is the `Validate` method.

```go
func (o *OrderBook) Validate() error {
    if err := isGenID(o.ID, true); err != nil {
        return err
    }
    if err := isGenID(o.MarketID, false); err != nil {
        return errors.Wrap(err, "market id")
    }
    if !coin.IsCC(o.AskTicker) {
        return errors.Wrap(errors.ErrModel, "invalid ask ticker")
    }
    if !coin.IsCC(o.BidTicker) {
        return errors.Wrap(errors.ErrModel, "invalid bid ticker")
    }
    if o.TotalAskCount < 0 {
        return errors.Wrap(errors.ErrModel, "negative total ask count")
    }
    if o.TotalBidCount < 0 {
        return errors.Wrap(errors.ErrModel, "negative total bid count")
    }
    return nil
}
```

_"I want to point out again and make it persistent in your mind: Extensive Validation is crucial."_
