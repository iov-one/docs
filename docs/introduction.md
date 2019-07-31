---
id: intro
title: Welcome to IOV 
sidebar_label: Introduction 
---

We'll point you to the docs and repos you need to get started: first, this document contains a "How to Get Started" section and further below, we have included a brief introduction to IOV for those not already familiar with the project.

**IOV** is building a Universal Name Service for Wallets and Dapps.

We are providing a IOV Name Service which is a register for names used in the blockchain ecosystem, such as personal value addresses, asset names, blockchain names for developers or companies. We believe naming things makes them easier to use for everyone.

We are also providing a toolkit to build apps that can easily use and swap all assets from all blockchains. We believe the future of apps is there.

Enjoy and please send us feedback !

## How to Get Started

We are building technology to **run a blockchain of names**, the IOV Name Service, and build clients for our blockchain. The code to do this is in [Weave](https://github.com/iov-one/weave "Weave Repository"). You can setup a REST API to query IOV Name Service in [IOVNS-rest-api](https://github.com/iov-one/iovns-rest-api "IOVNS-rest-api Repository").You can build a client to the blockchain by using [iov-cli](https://github.com/iov-one/iov-core/blob/master/packages/iov-cli/README.md "IOV-Client Repository").

We are also building a technology that allows you to **build apps that can access all blockchains**. We are still at the beginning, but you can start building an app that works with Tendermint, Lisk and Rise at the moment, soon ethereum, by using our library **iov-core**. Click [here](https://iov-one.github.io/iov-core-docs/latest/iov-core/index.html "How to Use IOV-Core") to get started.

Finally, if you are running a blockchain technology and want **to be compatible with IOV-Core**, we will release full BCP specifications soon. In the meantime, you can start looking at our [code](https://github.com/iov-one/iov-core/tree/master/packages/iov-bns "Codec") and our [documentation](https://iov-one.github.io/iov-core-docs/latest/iov-core/index.html "How to Use IOV-Core") to get familiar with how it all works.

You're free to explore the GitHub, all feedback is welcome!

## Introduction to IOV

We're building an interoperability solution for the blockchain industry that will be open source and totally decentralized. Our product suite thus solves user experience problems that we believe must be solved in order to bring blockchain tech into mainstream mass adoption. By design, the product suite also offers mutual benefits to key parties in the blockchain ecosystem (not only end users but also blockchain devs, app creators, entrepreneurs, and network miners) in order to facilitate widespread industry adoption.

To briefly introduce the product suite:

**IOV Name Service (INS)** is our DNS for blockchains. It is used for name asset registration (including human friendly addresses).

**IOV Weave** is a framework to quickly build your custom ABCI application to power a blockchain based on the best-of-class BFT Proof-of-stake Tendermint consensus engine. We built IOV Name Service using weave.

**IOV Wallet** is our universal wallet with cross-chain atomic swaps and human friendly addresses. Both desktop and chrome extension versions are being built.

**IOV Chrome Extension** is our Google Chrome Extension to connect to different chains and get a human friendly addresses

**IOV-Core** is the client for the IOV network. It is designed to run in standard JavaScript environments so that third party app developers can build e-commerce payment apps, DEXes, wallets, social media tipping apps, etc. that run in standard web browsers.
