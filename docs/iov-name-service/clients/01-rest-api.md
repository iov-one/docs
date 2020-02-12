---
id: rest-api
title: REST API
sidebar_label: REST API
---

You can connect to the IOV Name Service to run the [IOV Name Service Rest API](https://github.com/iov-one/bns/tree/master/cmd/bnsapi) on the top of your full node.

## Getting started

- You need first to setup a full node. You can [check this page](/docs/iov-name-service/validator/testnet) to have all the information needed.
- Install the IOV Name Service API Rest on your full node following the [readme information](https://github.com/iov-one/bns/tree/master/cmd/bnsapi)

## API

You can see the full list of endpoints:
http://exchangenet-bnsapi.iov.one/docs/index.html

### General

- `GET /info`: returns information about this instance of `bnsapi`.

### Block

- `GET /block/:height`: returns block details by height

### Starname

- `GET /account/accounts`: returns the list of all starnames.
- `GET /account/accounts/:owner`: returns a list of all starnames owned by someone.
- `GET /account/domains`: returns a list of all premium starnames.