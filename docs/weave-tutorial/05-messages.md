---
id: messages
title: Messages
sidebar_label: Messages
---

> [PR#2](https://github.com/iov-one/tutorial/pull/2): _Create msgs_

This is where we wrap our auto generated message types with useful and vital functionalities. Before getting into this section I want to remind you *validation* is **EXTREMELY**  important. First create your `msg.go` file. This is where the magic will happen

First create an __init()__ function and register to migration schema

```go
func init() {
    // Migration needs to be registered for every message introduced in the codec.
    migration.MustRegister(1, &CreateOrderBookMsg{}, migration.NoModification)
}
```

Define routes for messages

```go
func (CreateOrderBookMsg) Path() string {
    return "orderbook/create_orderbook"
}
```

After that ensure your message is a `weave.Msg`

```go
var _ weave.Msg = (*CreateOrderBookMsg)(nil)
```

We need to validate our messages if they fulfill all the conditions such as any missing data or format incompatibilities:

```go
func (m CreateOrderBookMsg) Validate() error {
    if err := m.Metadata.Validate(); err != nil {
        return errors.Wrap(err, "metadata")
    }
    if err := validID(m.MarketID); err != nil {
        return errors.Wrap(err, "market id")
    }
    if !coin.IsCC(m.AskTicker) {
        return errors.Wrapf(errors.ErrCurrency, "Invalid Ask Ticker: %s", m.AskTicker)
    }
    if !coin.IsCC(m.BidTicker) {
        return errors.Wrapf(errors.ErrCurrency, "Invalid Bid Ticker: %s", m.BidTicker)
    }
    if m.BidTicker <= m.AskTicker {
        return errors.Wrapf(errors.ErrCurrency, "ask (%s) must be before bid (%s)", m.AskTicker, m.BidTicker)
    }
    return nil
}
```

```go
func validID(id []byte) error {
    if len(id) == 0 {
        return errors.Wrap(errors.ErrEmpty, "id missing")
    }
    if len(id) != 8 {
        return errors.Wrap(errors.ErrInput, "id is invalid length (expect 8 bytes)")
    }
    return nil
}
```

You must have notice we even validate if `ID`'s lenght is not 0 and equal to 8 and tickers are actually string tickers. **Remember** more validation more solid your application is. If you **constrain** possible inputs, **less** checks in the business logic.
