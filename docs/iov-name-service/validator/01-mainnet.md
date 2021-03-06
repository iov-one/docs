---
id: mainnet
title: Setup A Mainnet Validator Node
sidebar_label: Mainnet
---

> If you were informed that your validator's Quality Score is sufficiently high to join the mainnet then congratulations!  If not then this document is not for you.

This document assumes that you are migrating your testnet nodes to use the mainnet binaries and seed nodes.  Given that, the setup for the mainnet is basically identical to that for a testnet.  The only difference between the two is the `/etc/systemd/system/iovns.env` file.

## Update /etc/systemd/system/iovns.env

You should be able to copy-and-paste the following commands into a terminal on each of your nodes and then be ready to join the mainnet.

```sh
sudo su # make life easier for the next ~60 lines

systemctl stop iovns.service

cd /etc/systemd/system

# overwrite the environment file for the IOV Name Service services
cat <<__EOF_IOVNS_ENV__ > iovns.env
# directories (without spaces to ease pain)
DIR_IOVNS=/opt/iovns/bin
DIR_WORK=/home/iov/mainnet

# images
IMAGE_IOVNS=https://github.com/iov-one/weave/releases/download/v1.0.4/bnsd-1.0.4-linux-amd64.tar.gz
IMAGE_IOVNS_OPTS=""
IMAGE_TM=https://github.com/iov-one/tendermint-build/releases/download/v0.31.12-iov1/tendermint-0.31.12-linux-amd64.tar.gz
IMAGE_TM_OPTS="\
--consensus.create_empty_blocks=false \
--moniker='moniker' \
--p2p.laddr=tcp://0.0.0.0:16656 \
--p2p.persistent_peers=0d8a77eba6dceea0cf5d30758987c90df9a3ca3c@167.99.194.126:16656 \
--rpc.laddr=tcp://127.0.0.1:16657 \
--rpc.unsafe=false \
"

# socket
SOCK_TM=iovns.sock

# uid/gid
IOV_GID=$(id iov -g)
IOV_UID=$(id iov -u)
__EOF_IOVNS_ENV__

chgrp iov iovns.env
chmod g+r iovns.env

set -o allexport ; source /etc/systemd/system/iovns.env ; set +o allexport # pick-up env vars

# download gitian built binaries; bnsd is the IOV Name Service daemon
mkdir -p ${DIR_IOVNS} && cd ${DIR_IOVNS}
wget ${IMAGE_IOVNS} && sha256sum $(basename $IMAGE_IOVNS) | grep 98061912b5476198f6210e35d0c8d82fb7e60c63fdc9846419f9a0369a4b6abe && tar xvf $(basename $IMAGE_IOVNS) || echo 'BAD BINARY!'
wget ${IMAGE_TM}    && sha256sum $(basename $IMAGE_TM)    | grep a11a257d7882585ff11b9da0302acd0ba79dc8a5c296123434e50df93f5b8084 && tar xvf $(basename $IMAGE_TM) || echo 'BAD BINARY!'

# initialize the IOV Name Service
su - iov
set -o allexport ; source /etc/systemd/system/iovns.env ; set +o allexport # pick-up env vars

mkdir -p ${DIR_WORK} && cd ${DIR_WORK}

# initialize tendermint
${DIR_IOVNS}/tendermint init --home=${DIR_WORK}
curl --fail https://rpc-private-a-vip-mainnet.iov.one/genesis | jq -r .result.genesis > config/genesis.json
sha256sum config/genesis.json | grep f3c2c31b3c9aefabeccb85d8e9f8b265c81cf907ac456737872308df00b600ea || echo 'BAD GENESIS FILE!'
sed --in-place 's!^timeout_commit .*!timeout_commit = "5s"!' config/config.toml # options not available via command line
sed --in-place 's!^create_empty_blocks .*!create_empty_blocks = false!' config/config.toml
sed --in-place 's!^create_empty_blocks_interval .*!create_empty_blocks_interval = "300s"!' config/config.toml

# initialize IOV Name Service (bnsd)
${DIR_IOVNS}/bnsd -home=${DIR_WORK} init -i | grep initialised

exit # iov

journalctl -f | grep iovns & # watch the chain sync
systemctl start iovns.service # it takes about 30 seconds for the chain sync to start

exit # root
```

> At this point you're running a full-node that can be examined at `http://localhost:16657/status`.


## Specialize the nodes

Now that you have sentry node(s) and a validator, they need to be made aware of their role and pointed at each other.

### Sentry node configuration

Change `/etc/systemd/system/iovns.env` so that each of your sentry nodes gossip while keeping their validator hidden.  Be mindful of `--rpc.unsafe=true` below, you might not want that.  **On the validator node**, execute `curl -s http://localhost:16657/status | jq -r .result.node_info.id` to get the value for `VALIDATOR_ID`.  Change the `IMAGE_TM_OPTS` variable to something like

```sh
IMAGE_TM_OPTS="\
--moniker='sentry' \
--p2p.persistent_peers=0d8a77eba6dceea0cf5d30758987c90df9a3ca3c@167.99.194.126:16656 \
--p2p.pex=true \
--p2p.private_peer_ids='VALIDATOR_ID' \
--rpc.unsafe=true \
"
```

There are a lot more tendermint configuration options available than those shown above.  Customize them as you see fit.  When you're done customizing then execute `sudo systemctl restart iovns.service` on each sentry node.

### Validator configuration

Change `/etc/systemd/system/iovns.env` so that the node gossips with its sentry node(s) only, ie set **`p2p.pex=false`** and add an explicit list of `p2p.persistent_peers`.  Obtain the sentry node ids for `p2p.persistent_peers` by executing `curl -s http://localhost:16657/status | jq -r .result.node_info.id` **on each sentry node**.  You know the IP and PORT of the nodes, so include them appropriately.  Change the `IMAGE_TM_OPTS` variable to something like

```sh
IMAGE_TM_OPTS="\
--moniker='validator' \
--priv_validator_laddr='tcp://HSM_IP:HSM_PORT' \
--p2p.persistent_peers='SENTRY_ID0@SENTRY_IP0:SENTRY_PORT0,SENTRY_ID1@SENTRY_IP1:SENTRY_PORT1' \
--p2p.pex=false \
--rpc.unsafe=false \
"
```

When you're done customizing then execute `sudo systemctl restart iovns.service`.

## Light-up the validator

Once your sentry nodes and validator are synchronzied with the chain then the final step to becoming a mainnet validator is to submit your validator's pub_key to IOV.  **On your validator node**, execute `curl --silent --fail http://localhost:16657/status | jq -r .result.validator_info.pub_key.value` and reply with the resulting 44 character pub_key to the ticket that was issued to you when you applied for <a href="https://support.iov.one/hc/en-us/requests/new?ticket_form_id=360000417771" target="_blank">the validator program</a>.  (There's no `create-validator` command like in Cosmos; validators are added via governance.)
