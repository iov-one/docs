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
IMAGE_IOVNS=https://github.com/iov-one/weave/releases/download/v0.21.2/bnsd-0.21.2-linux-amd64.tar.gz
IMAGE_IOVNS_OPTS=""
IMAGE_TM=https://github.com/iov-one/tendermint-build/releases/download/v0.31.11-iov1/tendermint-0.31.11-linux-amd64.tar.gz
IMAGE_TM_OPTS="\
--consensus.create_empty_blocks=false \
--moniker='moniker' \
--p2p.laddr=tcp://0.0.0.0:16656 \
--p2p.seeds=352ba402a2461020689c86cab599c8a44bd49a33@35.198.191.90:26656,88af4a6c555c058e530c124babfa9f9fb12a01b2@35.234.78.200:26656 \
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
wget ${IMAGE_IOVNS} && sha256sum $(basename $IMAGE_IOVNS) | grep d1cba6d3a43a555875421d14a6c8d05660a2f1fd51e6f762707520aed9af10fe && tar xvf $(basename $IMAGE_IOVNS) || echo 'BAD BINARY!'
wget ${IMAGE_TM}    && sha256sum $(basename $IMAGE_TM)    | grep 9d7db111e35408f1b115456f0f7a83a4d516c66a78c4f59b9d84501ba7477bce && tar xvf $(basename $IMAGE_TM) || echo 'BAD BINARY!'

# initialize the IOV Name Service
su - iov
set -o allexport ; source /etc/systemd/system/iovns.env ; set +o allexport # pick-up env vars

mkdir -p ${DIR_WORK} && cd ${DIR_WORK}

# initialize tendermint
${DIR_IOVNS}/tendermint init --home=${DIR_WORK}
curl --fail https://gist.githubusercontent.com/webmaster128/9a87d0967fe2caa95d84ee6288c648c2/raw/70c95107b2b4cb8ed3c0d24ae1f3f43a55d81cff/genesis.json > config/genesis.json
sha256sum config/genesis.json | grep 6c80ea4724726bedd2d36e73bf025007ef898fcb06be17e3ba3e51f32d29b8fa || echo 'BAD GENESIS FILE!'
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
--p2p.seeds=352ba402a2461020689c86cab599c8a44bd49a33@35.198.191.90:26656,88af4a6c555c058e530c124babfa9f9fb12a01b2@35.234.78.200:26656 \
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
