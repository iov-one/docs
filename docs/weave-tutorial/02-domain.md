---
id: domain 
title: Defining the Domain 
sidebar_label: Domain 
---

The first thing we consider is the data we want to store (the state). After that, we can focus on the messages, which trigger state transitions. All blockchain state must be stored in our merkle-ized store, that provide validity hashes and proofs. This is exposed to the application as a basic key-value store, which also allows in-order iteration over the keys. On top of this, we have built some tools like secondary indexes and sequences, similar to how [storm adds an ORM](https://github.com/asdine/storm#simple-crud-system) on top of [boltdb’s key-value store](https://github.com/boltdb/bolt#using-buckets). We have avoided struct tags and tried to type as strictly as we can (without using generics).

We are building an Orderbook application. This topic is quite hot at the time of writing this tutorial.

- **Markets** will contain rules as to who (which public keys) may create an **order book** or who can cancel an order. The blockchain may have multiple markets. Each market may have multiple orderbooks. Each token pair can only have one orderbook per market.
There is no global chain owner, but each market has one that adds order books and sets fees. This could be one person, a multisig, or a governance contract (DAO). When adding an order  book, the market with a given market ID is checked, then look up the owner *for that market*. Rather than having one owner that can create order books for all markets, each market stores who can update it.

- **Order books** will define which Ask/Bid market it holds and the number of available orders. Orderbook will contain orders and trades.

- **Orders** will be posted by traders who want to buy or sell tokens with given price and amount. Order may have 2 sides: **Ask** and **Bid**.
- An order may have 3 states:
  - **Open** means the order is waiting to be settled
  - **Done** means the order has been settled
  - **Cancel** means the order has been cancelled by the owner

- **Trade** is a settled order.

You can find more info on [tutorial repo](https://github.com/iov-one/tutorial/blob/master/x/orderbook/README.md "README.md"). Defining domain as _README_ in the module is a good practice.

## Primary Keys

Some of this data belongs in the primary key, the rest in the value. Weave introduces the concept of an *Object* which contains a `Key([]byte)` and `Value(Persistent struct)`. It can be cloned and validated. When we query we will receive this object, so we can place some critical information in the Key and expect it to always be present.

The primary key must be a unique identifier and it should be the main way we want to access the data. We will be using `morm` package for externally indexing models. External index means `ID` proto fields in this context. On the other side, plain `orm` makes indexing via any field. For example, if we were to model a Blog we could index it using its title.
