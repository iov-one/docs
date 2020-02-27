---
id: rest-api
title: REST API of the IOV Name Service
sidebar_label: REST API of the IOV Name Service
---

## Getting started
The easiest way to query the IOV Name Service is through our REST API. On the IOV Name Service, you can resolve a starname, query a balance of an iov address and many others things.

You can query the REST API of the IOV Name Service at this URL: https://bnsapi.iov.one/.
## How to resolve a starname
To resolve a starname, you need to query on your Rest API server the endpoint
- `GET /username/resolve/:mystarname` returns all the information about the specific starname including list of crypto-addresses.

Example on the REST API for the IOV Name Service mainnet: https://bnsapi.iov.one/username/resolve/thematrix*iov

## List of endpoints
You can see the full list of endpoints for IOV Name Service Mainnet at this URL:	https://bnsapi.iov.one/docs/.

## Running your node
Alternatively, you may prefer to run your own node and your own Rest API server.
1. You can read the [full node set up instructions](/docs/iov-name-service/validator/testnet).
2. You can read the [the REST API instructions to setup a Rest API server](https://github.com/iov-one/bns/tree/master/cmd/bnsapi).

## Sending transactions to the IOV Name Service
The REST API only helps for GETting info from the chain. The next step is for you to be able to send messages to the IOV Name service
to register or edit starnames.
To do this, the short way is to use IOV Core library. IOV Core manages the keys and signatures for the IOV Name Service and other blockchains.
You can read the [IOV Core documentation](/docs/iov-name-service/clients/iov-core).

The longer way is to access the IOV Name Service directly and implementing the protobuf messages yourself.
[You can read how to do that here](/docs/iov-name-service/clients/weave-transaction-spec).
