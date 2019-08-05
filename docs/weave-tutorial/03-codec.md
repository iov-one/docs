---
id: codec
title: Codec
sidebar_label: Codec
---

> [PR#1](https://github.com/iov-one/tutorial/pull/1): _Create order book models_

Weave defines simple `Marshaller` and `Persistent` interface standards. These interfaces are automatically implemented by any code autogenerated by protoc from protobuf files, and we recommend using .proto files to specify the serialization format for any persistent data in our application (internal state as well as transactions and messages). However, if you have never worked with protobuf, this might be a bit of a challenge, so we explain a simple workflow that we use in weave based projects.

## Create Codec file

The first thing is: imagine the shape of your classes. This `Codec` should be defined in [proto3](https://developers.google.com/protocol-buffers/docs/proto3) syntax. There are a number of different `int encodings`, `byte slices`, `strings`, and nested structures. And fields may be repeated. So forget complex types with methods now and just focus on the actual data structure.

Codec is the first the component that needs to be designed. Keep in mind that this part is the most important since whole module will depend on _codec_. You can think codec it as _model_ in mvc pattern. Yet it is not simple as model. Codec defines the whole application state models and more. On this file we would not go far as explaining every proto message. One example for each message and state would be enough. Further more if you want to see all the implementation, you can check out [tutorial](https://github.com/iov-one/tutorial/blob/master/x/orderbook/codec.proto)

## State

In the previous section we explained how to define your domain thus attributes if models. Here `Trade` is defined as proto message. The [x/codec.proto](https://github.com/iov-one/tutorial/blob/master/x/orderbook/codec.proto#L75-L88) file defines the `Trade` type rather simply, once you remove the comments, this is all that is left:

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

Note that the package defined in the protobuf file must match the package name used by the Go language code in the same directory.

You can also import types from one proto file into another. Make sure to use the full github path in order that the generated go code has properly working imports. The package name above is also used as a namespace for the imported protobuf definitions. This is how [x/cash](https://github.com/iov-one/weave/blob/master/x/cash/codec.proto) creates a wallet that contains an array of tokens of different currencies.
There are 2 critical points that needs to be explained in state models and messages.

Firstly, You must have noticed:

```protobuf
weave.Metadata metadata = 1;
```

`weave.Metadata` allows you to use *Migration* extension. Migration extension allows upgrading the code on chain without any downtime. This will be explained in more detail in further sections.

Second one is how the magic `ID` field works. This will be explained in [Models](weave-tutorial/04-models.md) section.

## Message Definitions

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

## Compiling Proto Files

To compile protobuf files, you need to have the [protoc](https://github.com/google/protobuf#protocol-compiler-installation) binary installed and a language-specific translator (gogo-protobuf in this case). This can be a bit of a pain, especially the first time, so the default **weave-starter-kit** [Makefile](https://github.com/iov-one/weave-starter-kit/blob/master/Makefile) contains some helpers for you.

After defining your state and messages run `make protoc`. This script will download `prototool`(basically a docker image that is for making protooling easier) and compile codec.proto file `codec.pb.go` file.
Now we have scaffold of our application thanks to auto-generated *codec.pb.go* file.

## Using Autogenerated Structs

The first time through the above process may appear tedious, but once you get the hang of it, you just have to add a few lines to a _.proto_ file and type `make protoc`. Et viola! You have a bunch of fresh *.pb.go files that provide efficient, portable serialization for your code.

But how do you use those structs? Taking `Amount` from [x/codec.proto](https://orkunkl.github.com/iov-one/tutorial/blob/master/x/orderbook/codec.proto#L10-L23) as an example, we see a `x/codec.pb.go` file with `type Amount struct {...}` that very closely mirrors the content of the codec.proto file, as well as a number of methods. There are some auto-generated getters, which can be useful to fulfill interfaces or to query field of _nil_ objects without panicking. And then there are some (very long) **Marshal** and **Unmarshal** methods. These are the meat of the matter. They fulfill the Persistent interface and let us write code like this:

```go
orig := Amount{Whole: 123, franctional: 2}
bz, err := orig.Marshal()
parsed := Amount{}
err = parsed.Unmarshal(bz)
```

This is fine, but what happens when I want to add custom logic to my Amount struct, perhaps adding validation logic, or code to add two coins? Luckily for us, go allows you two write methods for your structs in any file in the same package. That means that we can just inherit the struct definition and all the serialization logic and just append the methods we care about. [x/amount.go](https://github.com/iov-one/tutorial/blob/master/x/orderbook/amount.go) is a great example of extending the functionality, with code like:

```go
// IsPositive returns true if the value is greater than 0
func (a *Amount) IsPositive() bool {
    return a.Whole > 0 ||
        (a.Whole == 0 && a.Fractional > 0)
}

// IsNegative returns true if the value is less than 0
func (a *Amount) IsNegative() bool {
    return a.Whole < 0 ||
        (a.Whole == 0 && a.Fractional < 0)
}
```

This is a quite productive workflow and I recommend trying it out. You may find it doesn’t work for you and you can try other approaches, like copying the protobuf generated structs into some custom-writen structs you like and then copying back into protobuf structs for serialization. You can also try playing with special [gogo-protobuf](https://github.com/gogo/protobuf/blob/master/extensions.md) flags in your protobuf files to shape the autogenerated code into the exact shape you want.

## Notes About oneof

**oneof** is a powerful feature to produce union/sum types in your protobuf structures. For example, you may have a public key which may be one of many different algorithms, and can define cases for each, which can be swtiched upon in runtime. We also use this for the transaction to enumerate a set of possible messages that can be embedded in the transaction. A transaction may have any one of them and serialize and deserialize properly. Type-safety is enforced in compile-time and we can switch on the kind on runtime, quite nice. (Example from [bcp-demo](https://github.com/iov-one/bcp-demo/blob/master/app/codec.proto)):

```protobuf
oneof sum {
  cash.SendMsg send_msg = 1;
  namecoin.CreateTokenMsg new_token_msg = 2;
  namecoin.SetWalletNameMsg set_name_msg = 3;
  escrow.CreateMsg create_escrow_msg = 4;
  escrow.ReleaseMsg release_escrow_msg = 5;
  escrow.ReturnMsg return_escrow_msg = 6;
  escrow.UpdatePartiesMsg update_escrow_msg = 7;
}
```

The only problem is that the generated code is ugly to some people’s eyes. This lies in the fact that there is no clean way to express sum types in golang, and you have to force an interface with private methods in order to close the set of possible types. Although some people have been so revolted by this code that they prefered to [write their own serialization library](https://github.com/tendermint/go-amino "go-amino"), I would suggest just taking the breath and getting to know it. Here are the relevant pieces:

```go
type Tx struct {
    // msg is a sum type over all allowed messages on this chain.
    //
    // Types that are valid to be assigned to Sum:
    //  *Tx_SendMsg
    //  *Tx_CreateTokenMsg
    //  *Tx_SetNameMsg
    //  *Tx_CreateMsg
    //  *Tx_ReleaseMsg
    //  *Tx_ReturnMsg
    //  *Tx_UpdateEscrowMsg
    Sum isTx_Sum `protobuf_oneof:"sum"`
...
}

type isTx_Sum interface {
    isTx_Sum()
    MarshalTo([]byte) (int, error)
    Size() int
}

type Tx_SendMsg struct {
    SendMsg *cash.SendMsg `protobuf:"bytes,1,opt,name=send_msg,json=sendMsg,oneof"`
}
type Tx_CreateTokenMsg struct {
    CreateTokenMsg *namecoin.CreateTokenMsg `protobuf:"bytes,2,opt,name=new_token_msg,json=newTokenMsg,oneof"`
}
```

We now have some intermediate structs that give us a layer of indirection in order to enforce the fact we can now securely switch over all possible `tx.Sum` fields, with [code like this](https://github.com/iov-one/bcp-demo/blob/master/app/tx.go#L33-61):

```go
sum := tx.GetSum()
switch t := sum.(type) {
case *Tx_SendMsg:
    return t.SendMsg, nil
case *Tx_SetNameMsg:
    return t.SetNameMsg, nil
case *Tx_CreateTokenMsg:
    return t.CreateTokenMsg, nil
case *Tx_CreateMsg:
    return t.CreateMsg, nil
case *Tx_ReleaseMsg:
    return t.ReleaseMsg, nil
case *Tx_ReturnMsg:
    return t.ReturnMsg, nil
case *Tx_UpdateEscrowMsg:
    return t.UpdateEscrowMsg, nil
}
```