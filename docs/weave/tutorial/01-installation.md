---
id: installation
title: Installation
sidebar_label: Installation
---

To run our system, we need two components:

* `blog`, our custom ABCI blog application
* `tendermint`, a powerful blockchain consensus engine

If you have never used tendermint before, you should read the [ABCI Overview](https://tendermint.com/docs/introduction/introduction.html#abci-overview>) and ideally through to the bottom of the page. The end result is that we have three programs communicating:

```
    +---------+                     +------------+                      +----------+
    |   blog  |  <- (local) ABCI -> | Tendermint |   <- websocket ->    | client   |
    +---------+                     +------------+                      +----------+
```

`blog` and `tendermint` run on the same computer and communicate via a binary protocol over localhost or a UNIX socket. Together they form a 'blockchain.' In a real setup, you would have dozens (or hundreds) of computers running this backend communicating over a self-adjusting p2p gossip network to replicate the state. For application development (and demos) one copy will work, but has none of the fault tolerance of a real blockchain.

You can connect to tendermint rpc via various client libraries. We recommend [IOV Core](iov-core-tutorial/introduction) which has very good support for weave-based apps, as well as different blockchains (such as Ethereum and Lisk).

## Installing dependencies

### Requirements

* [Go 1.12.14+](https://golang.org/doc/install)
* [Tendermint 0.31.11](https://github.com/tendermint/tendermint/tree/v0.31.11)
  * [Installation](https://github.com/tendermint/tendermint/blob/master/docs/introduction/install.md)
* [weave](https://github.com/iov-one/weave)
  * `go get github.com/iov-one/weave`
* [docker](https://docs.docker.com/install/)

## Installing backend applications

* Clone blog app `git clone https://github.com/iov-one/blog-tutorial/`
* Checkout compatible blog app weave version of tendermint from [compatibility chart](https://github.com/iov-one/weave/blob/master/COMPATIBILITY.md). Blog applications latest version supports tendermint `v0.31.11`. Make sure you are installed the compatible version of tendermint.

**Note** we use ``go mod`` for dependency management. This is enabled by default in Go 1.12+.

```sh
# cd into to your workspace that is not in your $GOPATH
git clone https://github.com/iov-one/blog-tutorial
cd blog-tutorial
make install
# test it built properly
tendermint version
# 0.3X.X-YYYYYYYY
blog version
# v0.1X.X-YYYYYYYY
```

Those were the most recent versions as of the time of the writing, your code should be a similar version. If you have an old version of the code, you may have to delete it to force go to rebuild:

```sh
rm `which tendermint`
rm `which blog`
```

## Fork Weave Starter Kit

We have created the [Weave starter kit](https://github.com/iov-one/weave-starter-kit) to increase project development speed and reduce burden of copying code around when beginning a project. It contains the boiler plate code and has already written code logic that you can get hints.

## Initialize the Blockchain

Before we start the blockchain, we need to set up the initial state. This is defined in a genesis block. Both `tendermint` and `blog` have a directory to store configuration and internal database state. By default those are `~/.tendermint` and `~/.blog`. However, to make things simpler, we will ask them both to put everything in the same directory.

First, we create a default genesis file, the private key for the validator to sign blocks, and a default config file.

```sh
# make sure you really don't care what was in this directory and...
rm -rf ~/.blog
# initialize state on default folder ~/.blog
make inittm
```

You can take a look in this directory if you are curious. The most important piece for us is `~/.blog/config/genesis.json`. You may also notice `~/.blog/config/config.toml` with lots of [options to set](https://tendermint.com/docs/tendermint-core/configuration.html#options) for power users.

We want to add a bunch of tokens to the account we just made before launching the blockchain. And we'd also like to enable the indexer, so we can search for our transactions by id (default state is off). But rather than have you fiddle with the config files by hand, you can just run this to do the setup:

```sh
blog init CASH bech32:tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp
```

Make sure you enter the same hex address, this account gets the tokens. You can take another look at `~/.blog/config/genesis.json` after running this command. The important change was to "app_state". You can also create this by hand later to give many people starting balances, but let's keep it simple for now and get something working. Feel free to wipe out the directory later and reinitialize another blockchain with custom configuration to experiment.

You may ask from where this address comes. It is a demo account derived from our test mnemonic: `dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion` using the hd derivation path: `m/44'/988'/0'`. This is the path used by our wallet, so you can enter your mnemonic in our web-wallet and see this account. Note that you can define the addresses both in *hex:* and *bech32:* formats (if prefix is omitted, hex is assumed)

## Start the Blockchain

We have a private key and setup all the configuration.
The only thing left is to start this blockchain running.

```sh
# start the tendermint with default config
make runtm
blog start
```

hint: For help and explanations for the tendermint node commands: `tendermint node --help`

This connects over `tcp://localhost:26658` by default, to use UNIX sockets (arguably more secure), try the following:

```sh
tendermint node --home ~/.blog --proxy_app=unix://$HOME/abci.socket > ~/.blog/tendermint.log &
blog start -bind=unix://$HOME/abci.socket
```

Open a new window and type in `tail -f  ~/.blog/tendermint.log` and you will be able to see the output. That means the blockchain is working away and producing new blocks, one per second.

![image](assets/tail-log.png)

Note: if you did anything funky during setup and managed to get yourself a rogue tendermint node running in the background, you might encounter errors like `panic: Error initializing DB: resource temporarily unavailable`. A quick `killall tendermint` should get you back on track.
