---
id: setup
title: Validator Setup
sidebar_label: Setup
---

This document is a work in progress.


```sh
# get docker images
IMAGE_IOVNS=iov1/bnsd:v0.18.0
IMAGE_TM=iov1/tendermint:v0.31.5

docker pull $IMAGE_TM
docker pull $IMAGE_IOVNS
docker images

# give the testnet a home
mkdir -p davenet/config
cd davenet
curl --fail https://bns.davenet.iov.one/genesis | jq '.result.genesis' > config/genesis.json

# initialize the containers just once - the private key is in config/priv_validator_key.json
docker run --rm -v $(pwd):/tendermint ${IMAGE_TM} init
docker run --rm -v $(pwd):/tendermint ${IMAGE_IOVNS} -home=/tendermint init -i | grep initialised

# run the IOV Name Service
docker run \
   --rm \
   -d \
   -v $(pwd):/tendermint \
   ${IMAGE_IOVNS} \
      -home=/tendermint start \
      -bind=unix:///tendermint/app.sock

# run tendermint
docker run \
   --rm \
   -d \
   -p 16656:26656 \
   -p 16657:26657 \
   -v $(pwd):/tendermint \
   ${IMAGE_TM} node \
      --home /tendermint \
      --p2p.seeds=08b73c11b3209f2044945a56555d867be7b003b4@34.76.70.139:26656 \
      --proxy_app="unix:///tendermint/app.sock"
```
At this point you're running a full-node that can be examined at `http://localhost:16657/status`.  More to come...
