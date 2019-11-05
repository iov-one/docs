---
id: state
title: State Machine
sidebar_label: State Machine
---

Inside each block is a sequence of transactions applied to a state machine (run by a program). There is also the state (database) representing the materialized view of all transactions included in all blocks up to this point, as executed by the state machine.

## Upgrading the state machine

Of course, during the lifetime of the blockchain, we will want to update the software and expand functionality. However, the new software must also be able to re-run all transactions since its genesis (the birth of the chain) and produce the same state as the active network that keeps updating software over time. That means all historical blocks must be interpreted in the same way by new and old clients.

Bitcoin classifies various approaches to upgrading as [soft forks](https://en.bitcoin.it/wiki/Softfork) or [hard forks](https://en.bitcoin.it/wiki/Hardfork). Ethereum has a table defining the block height at which [various functionality changes](https://github.com/ethereum/go-ethereum/blob/master/params/config.go#L33-L45) and add checks for the [currently activated behavior](https://github.com/ethereum/go-ethereum/blob/master/core/vm/evm.go#L157-L166) based on block height at various places. This allows one server to handle multiple historical behaviors, but it can also add lots of dead code over time...

## UTXO vs Account Model

There are two main models used to store the current state. The main model for bitcoin and similar chains is called UTXO, or Unspent transaction output. Every transaction has at least one input and an output, and the system checks if the inputs are unspent. If they have not been spent, they are then marked spent and the resulting outputs are created. If not, the transaction fails.

This provides interesting ways to obfuscate identity (but not secure against sophisticated network analysis like ZCash) and allows easy parallelization of the transaction processing. However, it is quite hard to map non-payment systems (like voting or breeding crypto-kitties) to such a system. Therefore, it is mainly used for payment networks.

The account model creates one account per public key address and stores the information there. Sending money reduces the balance of one account and increments the balance of another by that same amount, minus transaction fees. More complex logic can be expressed, that many developers are used to from interacting with databases or key-value stores.

The downside is that the account affords an observer an easy view of all activity by one key. Sure you have pseudoanonymity, but if you make one payment to me, I now can see your entire investment and voting history with little effort. Another downside is that it becomes harder to parallelize transaction processing, as sending from one account and receiving payments will conflict with each other. In practice, no production chain uses optimistic concurrency for account-based systems.

## Merkle Proofs

Weave uses an account model much like Ethereum, and leaves anonymity to other developments like [mixnets](https://en.wikipedia.org/wiki/Mix_network) and [zkSNARKs](https://z.cash/technology/zksnarks.html).

Under the hood, we use a key-value store, where different modules write their data to different key-spaces. This is not a normal key-value store (like redis or leveldb), but rather [Merkle trees](https://www.codeproject.com/Articles/1176140/Understanding-Merkle-Trees-Why-use-them-who-uses-t). Merkle trees are like binary trees, but hash the children at each level. This allows us to provide a [proof as a chain of hashes](https://www.certificate-transparency.org/log-proofs-work) the same height as the tree. This proof can guarantee that a given key-value pair is in the tree with a given root hash. This root hash is then added to a block header after running the transactions, and validated by [consensus](./consensus.rst). If a client [follows the headers](https://blog.cosmos.network/light-clients-in-tendermint-consensus-1237cfbda104), they can securely verify if a node is providing them the correct data, for example, their account balance.

In practice, the block header can maintain multiple hashes, each one being the Merkle root of another tree. Thus, a client can use a header to prove the validity, state and presence of a transaction, or current validator set.
