---
id: welcome 
title: Welcome to IOV Weave's documentation
sidebar_label: Welcome
---

![image](assets/weave-logo.jpg)

[IOV Weave](https://github.com/iov-one/weave) is a framework to quickly build your custom [ABCI application](https://github.com/tendermint/abci) to power a blockchain based on the best-of-class BFT Proof-of-stake [Tendermint consensus engine](https://tendermint.com). It provides much commonly used functionality that can quickly be imported in your custom chain, as well as a simple framework for adding the custom functionality unique to your project.

Some of the highlights of Weave include a Merkle-tree backed data store, a highly configurable extension system that also applies to the core logic such as fees and signature validation. Weave also brings powerful customizations initialised from the genesis file. In addition there is a simple ORM which sits on top of a key-value store that also has proveable secondary indexes. There is a flexible permissioning system to use contracts as first-class actors, “No empty blocks” for quick synchronizing on quiet chains, and the ability to introduce “product fees” for transactions that need to charge more than the basic anti-spam fees. We have also added support for "migrations" that can switch on modules, or enable logic updates, via on-chain feature switch transactions.

## Existing Modules

|Module|Description|
|------|-----------|
|[Cash](https://github.com/iov-one/weave/tree/master/x/cash)|Wallets that support fungible tokens and fee deduction functionality|
|[Sigs](https://github.com/iov-one/weave/tree/master/x/sigs)|Validate ed25519 signatures|
|[Multisig](https://github.com/iov-one/weave/tree/master/x/multisig)|Supports first-class multiple signature contracts, and allow modification of membership|
|[AtomicSwap](https://github.com/iov-one/weave/tree/master/x/aswap)|Supports HTLC for cross-chain atomic swaps, according to the [IOV Atomic Swap Spec](https://github.com/iov-one/iov-core/blob/master/docs/atomic-swap-protocol-v1.md)|
|[Escrow](https://github.com/iov-one/weave/tree/master/x/escrow)|The arbiter can safely hold tokens, or use with timeouts to release on vesting schedule|
|[Governance](https://github.com/iov-one/weave/tree/master/x/gov)|Hold on-chain elections for text proposals, or directly modify application parameters|
|[PaymentChannels](https://github.com/iov-one/weave/tree/master/x/paychan)|Unidirectional payment channels, combine micro-payments with one on-chain settlement|
|[Distribution](https://github.com/iov-one/weave/tree/master/x/distribution)|Allows the safe distribution of income among multiple participants using configurations. This can be used to distribute fee income.|
|[Batch](https://github.com/iov-one/weave/tree/master/x/batch)|Used for combining multiple transactions into one atomic operation. A powerful example is in creating single-chain swaps.|
|[Validators](https://github.com/iov-one/weave/tree/master/x/batch)|Used in a PoA context to update the validator set using either multisig or the on-chain elections module|
|[Username](https://github.com/iov-one/weave/tree/master/cmd/bnsd/x/nft/username)|Example nft used by bnsd. Maps usernames to multiple chain addresses, including reverse lookups|
|[MessageFee](https://github.com/iov-one/weave/tree/master/x/msgfee)|Validator-subjective minimum fee module, designed as an anti-spam measure.|
|[Utils](https://github.com/iov-one/weave/tree/master/x/utils)|A range of utility functions such as KeyTagger which is designed to enable subscriptions to database.|

### In Progress

Light client proofs, custom token issuance and support for IBC (Inter Blockchain Communication) are currently being designed.

## Basic Blockchain Terminology

If you are new to blockchains (or Tendermint), this is a crash course in just enough theory to follow the rest of the setup. [Read all](weave/design/01-blockchain.md)

### Immutable Event Log

If you are coming from working on typical databases, you can think of the blockchain as an immutable [transaction log](https://en.wikipedia.org/wiki/Transaction_log) . If you have worked with [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) you can consider a block as a set of events that can always be replayed to create a [materialized view](https://docs.microsoft.com/en-us/azure/architecture/patterns/materialized-view) . Maybe you have a more theoretical background and recognize that a blockchain is a fault tolerant form of [state machine replication](https://en.wikipedia.org/wiki/State_machine_replication#Ordering_Inputs) . [Read more](weave/design/01-blockchain.md#immutable-event-log)

### General Purpose Computer

Ethereum pioneered the second generation of blockchain, where they realized that we didn't have to limit ourselves to handling payments, but actually have a general purpose state machine. [Read more](weave/design/01-blockchain.md#general-purpose-computer)

### Next Generation

Since that time, many groups are working on "next generation" solutions that take the learnings of Ethereum and attempt to build a highly scalable and secure blockchain that can run general purpose programs. [Read more](weave/design/01-blockchain.md#next-generation)

### Eventual finality

All Proof-of-Work systems use eventual finality, where the resource cost of creating a block is extremely high. After many blocks are gossiped, the longest chain of blocks has the most work invested in it, and thus is the true chain. [Read more](weave/design/02-consensus.md#eventual-finality)

### Immediate finality

An alternative approach used to guarantee constency comes out of academic research into Byzantine Fault Tolerance from the 80s and 90s, which "culminated" in [PBFT](http://pmg.csail.mit.edu/papers/osdi99.pdf) . [Read more](weave/design/02-consensus.md#immediate-finality)

### Authentication

One interesting attribute of blockchains is that there are no trusted nodes, and all transactions are publically visible and can be copied. [Read more](weave/design/03-authentication.md)

### Upgrading the state machine

Of course, during the lifetime of the blockchain, we will want to update the software and expand functionality. However, the new software must also be able to re-run all transactions since genesis. [Read more](weave/design/04-state.md#upgrading-the-state-machine)

### UTXO vs Account Model

There are two main models used to store the current state. The main model for bitcoin and similar chains is called UTXO, or Unspent transaction output. The account model creates one account per public key address and stores the information there. [Read more](weave/design/04-state.md#utxo-vs-account-model)

### Merkle Proofs

Merkle trees are like binary trees, but hash the children at each level. This allows us to provide a [proof as a chain of hashes](https://www.certificate-transparency.org/log-proofs-work). [Read more](weave/design/04-state.md#merkle-proofs)

Running an Existing Application
-------------------------------

A good way to get familiar with setting up and running an application is to follow the steps in the [mycoin](mycoind/installation.html) sample application. You can run this on your local machine. If you don't have a modern Go development environment already set up, please [follow these instructions](mycoind/setup.html).

To connect a node to the BNS testnet on a cloud server, the steps to set up an instance on Digital Ocean are explored in this [blog post](https://medium.com/iov-internet-of-values/a-guide-to-deploy-a-validator-on-hugnet-3335192e11d5).

Once you can run the blockchain, you will probably want to connect with it. You can view a sample wallet app for the BNS testnet at <https://wallet.hugnet.iov.one> Those that are comfortable with Javascript, should check out our [IOV Core Library](mycoind/iovcore.html) which allows easy access to the blockchain from a browser or node environment.

Configuring your Blockchain
---------------------------

When you ran the `mycoind` tutorial, you ran the following lines to configure the blockchain:

``` {.sourceCode .console}
tendermint init --home ~/.mycoind
mycoind init CASH bech32:tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp
```

This is nice for automatic initialization for dev mode, but for deploying a real network, we need to look under the hood and figure out how to configure it manually.

### Tendermint Configuration

Tendermint docs provide a brief introduction to the tendermint cli. Here we highlight some of the more important options and explain the interplay between cli flags, environmental variables, and config files, which all provide a way to customize the behavior of the tendermint daemon. [Read More](configuration/tendermint.html)

### Application State Configuration

The application is fed `genesis.json` the first time it starts up via the `InitChain` ABCI message. There are three fields that the application cares about: `chain_id`, `app_state`, and `validators`. To learn more about these fields [Read More](configuration/application.html)

### Setting the Validators

Since Tendermint uses a traditional BFT algorithm to reach consensus on blocks, signatures from specified validator keys replace hashes used to mine blocks in typical PoW chains. This also means that the selection of validators is an extremely important part of the blockchain security. [Read More](configuration/validators.html)

Building your own Application
-----------------------------

Before we get into the strucutre of the application, there are a few design principles for weave (but also tendermint apps in general) that we must keep in mind.

### Determinism

The big key to blockchain development is determinism. Two binaries with the same state must **ALWAYS** produce the same result when passed a given transaction. [Read More](design/overview.html#determinism)

### Abstract Block Chain Interface (ABCI)

To understand this design, you should first understand what an ABCI application is and how that level blockchain abstraction works. ABCI is the interface between the tendermint daemon and the state machine that processes the transactions, something akin to wsgi as the interface between apache/nginx and a django application. [Read More](design/overview.html#abci)

### Persistence

All data structures that go over the wire (passed on any external interface, or saved to the key value store), must be able to be serialized and deserialized. An application may have any custom binary format it wants, although all standard weave extensions use protobuf. [Read More](design/overview.html#persistence)
