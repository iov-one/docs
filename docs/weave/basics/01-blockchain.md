---
id: blockchain
title: Blockchain
sidebar_label: Blockchain
---

A "blockchain" in the simplest sense is a chain of blocks. By chain, we mean each block is cryptographically linked to the proceeding block, and through recursion we can securely query the entire history from any block back to the genesis. A block is a set of transactions, along with this link, and some optional metadata that varies depending on the blockchain.

## Immutable Event Log

If you are coming from working on typical databases, you can think of the blockchain as an immutable [transaction log](https://en.wikipedia.org/wiki/Transaction_log). If you have worked with [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) you can consider a block as a set of events that can always be replayed to create a [materialized view](https://docs.microsoft.com/en-us/azure/architecture/patterns/materialized-view). Maybe you have a more theoretical background and recognize that a blockchain is a fault-tolerant form of [state machine replication](https://en.wikipedia.org/wiki/State_machine_replication#Ordering_Inputs).

The point is to prove that a given node's knowledge of a block is valid (more on that in [consensus](./consensus.html)).
Each node can cryptographically prove it by reproducing the valid history to that block, and by replaying that sequence of blocks the node reproduces the current state. Many nodes performing this simultaneously create a [Byzantine Fault-Tolerant](https://en.wikipedia.org/wiki/Byzantine_fault_tolerance) state machine. Since (most) computer programs can be mapped to state machines, we end up with an [unstoppable world computer](https://www.ethereum.org/).

This means a blockchain is fully trusted and the state represents the correct function of the programs that run on it. This allows for extremely high levels of trust in a program, levels that were previously reserved for highly controlled, centralized systems, such as banks or governments. The first generation of blockchain, Bitcoin, proved it was possible to run a system with many unknown and mutually untrusting parties, yet produce a system that is harder to hack than any bank (bitcoin hacks involve grabbing someone's wallet, not manipulating the blockchain). This was a true marvel of vision and engineering and laid the stage for all future development, and many other projects tried to fork bitcoin to create a custom blockchain.

## General Purpose Computer

Ethereum pioneered the second generation of blockchain, where they realized that we didn't have to limit ourselves to handling payments but could actually have a general-purpose state machine. They wanted to allow experimentation at orders of magnitude faster than forking bitcoin, and produced the EVM (Ethereum Virtual Machine) that can run sandboxed code uploaded by any user. Since then, hundreds of projects have experimented with porting other types of logic to the blockchain and have demonstrated its utility for [decentralized governance](https://aragon.one/), [currency trading](https://0xproject.com/), [prediction markets](https://gnosis.pm/), even [collectible trading games](https://www.cryptokitties.co/), and much more...

While Ethereum demonstrated the potential of blockchain technology in many areas, it also provided some [high-profile examples](https://www.cryptocompare.com/coins/guides/the-dao-the-hack-the-soft-fork-and-the-hard-fork/) of how [hard it is to write secure contracts](https://medium.com/chain-cloud-company-blog/parity-multisig-hack-again-b46771eaa838). As it became more popular, it also showed a popular application can [overload the capacity of the network](https://dealbreaker.com/2017/12/ethereum-the-crypto-network-that-will-transform-everything-struggles-to-handle-digital-beanie-babies/).

## Next Generation

Since that time, many groups are working on "next generation" solutions that take the learnings of Ethereum and attempt to build a highly scalable and secure blockchain that can run general-purpose programs. One pioneering project is [Tendermint](https://tendermint.com/), which provides a highly efficient Byzantine-Fault Tolerant blockchain engine that offers guaranteed finality within **1-5 seconds**. It was designed from the ground up to allow many projects to [plug their application logic](https://tendermint.readthedocs.io/en/master/app-development.html#abci-design) into the engine easily. [Weave](https://github.com/iov-one/weave) is a framework that provides many common tools to help you build ABCI apps rapidly. You can just focus on writing the application logic and the interface and rely on high-quality and extensible libraries to solve most of the difficult problems with building a blockchain.
