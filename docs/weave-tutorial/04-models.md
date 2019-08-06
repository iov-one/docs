---
id: models
title: Models
sidebar_label: Models
---

> [PR#6](https://github.com/iov-one/tutorial/pull/6): _Create models_

We defined our state in [codec section](weave-tutorial/03-codec.md). To use models in weave we have to wrap our model with some functionalities and enforce it is a **morm.Model**

Ensure our `OrderBook` fulfills morm.Model. This is just a helper so the compiler will complain loudly here if you forget to implement a method. Guaranteeing it *I am trying to implement this interface*.

```go
var _ morm.Model = (*OrderBook)(nil)
```

Now let's explain on our model's identity

## Auto incremented identities

`morm.Model` covers auto-incremented IDs for you. All you have to define `GetID` and `SetID` methods. If you defined `bytes id = 2 [(gogoproto.customname) = "ID"];`  on `codec.proto` you do not even need to write `GetID` method by yourself, Thanks to prototool it will be generated automatically. You will only need to define SetID method.

## Custom identity

To use your custom identity, do not define `bytes id = 2 [(gogoproto.customname) = "ID"];` on `codec.proto`. You can use any other field as an index with logic on top. Just write `SetID` and `GetID` logic that uses your index.

Now you see how indexing works in Weave. Let's see the other wonders of the framework.

To our model to fulfill **Model** it must be [Clonable](https://github.com/iov-one/weave/blob/master/orm/interfaces.go#L34).

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

## Validation

We will want to fill in these Validate methods to enforce any invariants we demand of the data to keep our database clean. Anyone who has spent much time dealing with production applications knows how “invalid data” can start creeping in without a strict database schema, this is what we do in code.

We can do some basic checks and return an error if any of them does not pass:

```go
func (o *OrderBook) Validate() error {
    var errs error

    errs = errors.AppendField(errs, "Metadata", o.Metadata.Validate())
    errs = errors.AppendField(errs, "ID", isGenID(o.ID, true))
    errs = errors.AppendField(errs, "MarketID", isGenID(o.MarketID, false))

    if !coin.IsCC(o.AskTicker) {
        errs = errors.AppendField(errs, "AskTicker", errors.ErrCurrency)
    }
    if !coin.IsCC(o.BidTicker) {
        errs = errors.AppendField(errs, "BidTicker", errors.ErrCurrency)
    }

    if o.TotalAskCount < 0 {
        errs = errors.AppendField(errs, "TotalAskCount", errors.ErrModel)
    }
    if o.TotalBidCount < 0 {
        errs = errors.AppendField(errs, "TotalBidCount", errors.ErrModel)
    }

    return errs
}
```

We use `errors.AppendField`, It enables multi error validation.

## Errors

Here are some weave errors taken from [weave/errors](https://github.com/iov-one/weave/blob/master/errors/errors.go "Weave errors"):

```go
// ErrUnauthorized is used whenever a request without sufficient
// authorization is handled.
ErrUnauthorized = Register(2, "unauthorized")

// ErrNotFound is used when a requested operation cannot be completed
// due to missing data.
ErrNotFound = Register(3, "not found")

// ErrMsg is returned whenever an event is invalid and cannot be
// handled.
ErrMsg = Register(4, "invalid message")
```

What is with these `ErrXYZ()` calls you may think? Well, we could return a “normal” error like `errors.New("fail")`, but we wanted two more features. First of all, it helps debugging enormously to have a stack trace of where the error occurred. For this, we use [pkg/errors](https://github.com/pkg/errors "go/pkg") that attach a stack trace to the error that can optionally be printed later with a `Printf("%+v", err)`. We also want to return a unique abci error code, which may be interpreted by client applications, either programmatically or to provide translations of the error message client side.

For these reasons, weave provides some utility methods and common error types in the errors [package](https://godoc.org/github.com/iov-one/weave/errors). The ABCI Code attached to the error is then returned in the [DeliverTx Result](https://github.com/iov-one/weave/blob/v0.20.0/abci.go#L114-L126).

Every package ideally can define it’s own custom error types and error codes, generally in a file called [errors.go](https://github.com/iov-one/weave/blob/master/x/sigs/errors.go). The key elements are:

```go
// ABCI Response Codes
// tutorial reserves 400 ~ 420.
const (
    CodeInvalidText    uint32 = 400
)

var (
    errTitleTooLong       = fmt.Errorf("Title is too long")
    errInvalidAuthorCount = fmt.Errorf("Invalid number of blog authors")
)

// Error code with no arguments, check on code not particular type
func ErrTitleTooLong() error {
    return errors.WithCode(errTitleTooLong, CodeInvalidText)
}
func IsInvalidTextError(err error) bool {
    return errors.HasErrorCode(err, CodeInvalidText)
}

// You can also prepend a variable message using WithLog
func ErrInvalidAuthorCount(count int) error {
    msg := fmt.Sprintf("authors=%d", count)
    return errors.WithLog(msg, errInvalidAuthorCount, CodeInvalidAuthor)
```

_"I want to point out again and make it persistent in your mind: Extensive Validation is crucial."_
