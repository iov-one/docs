---
id: rest-api
title: REST API
sidebar_label: REST API
---

The other way to connect to the IOV Name Service is to run the [IOV Name Service Rest API](https://github.com/iov-one/bns/tree/master/cmd/bnsapi) on the top of your full node. This is a usefull way if you want to connect to the IOV Name Service from a mobile wallet.

## Getting started

- You need first to setup a full node. You can [check this page](/docs/iov-name-service/validator/testnet) to have all the informaiton needed.
- Install the IOV Name Service API Rest on your full node following the [readme information](https://github.com/iov-one/bns/tree/master/cmd/bnsapi)

## API

### General

- `GET /info`: returns information about this instance of `bnsapi`.

### Block

- `GET /block/:height`: returns block details by height

### Starname

- `GET /account/accounts`: returns the list of all starnames.
- `GET /account/accounts/:owner`: returns a list of all starnames owned by someone.
- `GET /account/domains`: returns a list of all premium starnames.