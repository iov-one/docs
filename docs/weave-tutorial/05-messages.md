---
id: messages
title: Messages
sidebar_label: Messages
---

> [PR#2](https://github.com/iov-one/tutorial/pull/2): _Create msgs_

Messages are requests for a change in the state, the action part of a transaction. They also need to be persisted (to be sent over the wire and stored on the blockchain), and must also be validated. They later are passed into [Handlers](https://godoc.org/github.com/iov-one/weave#Handler) to be processed and effect change in the blockchain state.

## Messages vs. Transactions

A message is a request to make change and this is the basic element of a blockchain. A transaction contains a message along with metadata and authorization information, such as fees, signatures, nonces, and time-to-live.

A [Transaction](https://godoc.org/github.com/iov-one/weave#Tx) is fundamentally defined as anything persistent that holds a message:

```go
type Tx interface {
    Persistent
    // GetMsg returns the action we wish to communicate
    GetMsg() (Msg, error)
}
```

And every application can extend Tx with additional functionality, such as [Signatures](https://godoc.org/github.com/iov-one/weave/x/sigs#SignedTx), [Fees](https://godoc.org/github.com/iov-one/weave/x/cash#FeeTx), or anything else your application needs. The data placed in the Transaction is meant to be anything that applies to all modules, and is processed by a **Middleware**.

A [Message](https://godoc.org/github.com/iov-one/weave#Msg) is also persistent and can be pretty much anything that an extension defines. The only necessary feature of a Message is `Path() string` method which provides the required route to the Handler.

When we define a concrete transaction type for one application, we define it in protobuf with a set of possible messages that it can contain. Every application can add optional field to the transaction and allow a different set of messages, and the Handlers and Decorators work orthogonally to this, regardless of the **concrete** Transaction type.

## Defining Messages

Messages are similar to the `POST`, `DELETE`, `PUT` endpoints in a typical REST API. They are the way to effect a change in the system. Ignoring the issue of authentication and rate limitation, which is handled by the Decorators / Middleware, when we design Messages, we focus on all possible state transitions and the information they need to proceed.

In the Orderbook example, we can imagine:

- Create market
- Create order book
- Create order

## Dive into Code

First create your `msg.go` file. This is where the magic will happen.
Then create an __init()__ function and register to migration schema:

```go
func init() {
    // Migration needs to be registered for every message introduced in the codec.
    migration.MustRegister(1, &CreateOrderBookMsg{}, migration.NoModification)
}
```

Define path that will be used for routing messages to handler:

```go
// Path implementes weave.Msg interface.
func (CreateOrderBookMsg) Path() string {
    return "orderbook/create_orderbook"
}
```

After that ensure your message is a `weave.Msg`:

```go
var _ weave.Msg = (*CreateOrderBookMsg)(nil)
```

## Validation

While validation of data models is much more like SQL constraints: “**max length 20**”, “**not null**”, “**constaint foo > 3**”, validation of messages is validating potentially malicious data coming in from external sources and should be validated more thoroughly. One may want to use regexp to avoid control characters or null bytes in a “string” input. Maybe restrict it to alphanumeric or ascii characters, strip out html, or allow full utf-8. Addresses must be checked to be the valid length. Amount being sent to be positive (else I send you -5 ETH and we have a **TakeMsg**, instead of **SendMsg**).

Validate method on a message must only provide a sanity check for the data it represents and must not rely on any external state. Message can only ensure the data format and hardcoded logic. It cannot validate business logic. Business logic is validated in a **handler**.

The validation of messages should be a lot more thorough and well tested than the validation on data models, which is as much documentation of acceptable values as it is runtime security.

`Validate` method of `CreateOrderBookMsg`:

```go
// Validate ensures the CreateOrderBookMsg is valid
func (m CreateOrderBookMsg) Validate() error {
    var errs error

    errs = errors.AppendField(errs, "Metadata", m.Metadata.Validate())
    errs = errors.AppendField(errs, "MarketID", validateID(m.MarketID))

    if !coin.IsCC(m.AskTicker) {
        errs = errors.AppendField(errs, "AskTicker", errors.ErrCurrency)
    }
    if !coin.IsCC(m.BidTicker) {
        errs = errors.AppendField(errs, "BidTicker", errors.ErrCurrency)
    }
    if m.BidTicker <= m.AskTicker {
        errs = errors.Append(errs,
            errors.Field("BidTicker", errors.ErrCurrency, "ask must be before bid"))
    }
    return errs
}
```

```go
// validateID returns an error if this is not an 8-byte ID
// as expected for orm.IDGenBucket
func validateID(id []byte) error {
    if len(id) == 0 {
        return errors.Wrap(errors.ErrEmpty, "id missing")
    }
    if len(id) != 8 {
        return errors.Wrap(errors.ErrInput, "id is invalid length (expect 8 bytes)")
    }
    return nil
}
```

You must have noticed we even validate if `ID`'s lenght is not 0 and equal to 8 and tickers are actually string tickers. **Remember** the more validation the more solid your application is. If you **constrain** possible inputs, you can write **less** validation in the business logic.
