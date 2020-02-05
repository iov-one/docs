---
id: testnet-dancenet
title: Upgrade dancenet to bnsd v1.0.0
sidebar_label: Testnet (deprecated)
---

> This document is only for current mainnet validators: **Cosmostation, StateWith.Us, HashQuark, Node A Team, Forbole, 01node.com, Bianjie, ChainLayer, syncnode, and Stake Capital**.

## Use systemd for running a sentry node or validator

This document assumes that `basename`, `curl`, `expr`, `grep`, `jq`, `sed`, `sha256sum`, and `wget` are installed on your system, and user `iov` exists.  You should be able to copy-and-paste the following commands into a terminal and end up with a running node.  You'll have to do this procedure on at least two machines to implement a sentry node architecture.

```sh
sudo su # make life easier for the next ~100 lines

cd /etc/systemd/system

# create an environment file for the IOV Name Service services
cat <<__EOF_IOVNS_ENV__ > iovns.env
# directories (without spaces to ease pain)
DIR_IOVNS=/opt/iovns/bin
DIR_WORK=/home/iov/dancenet

# images
IMAGE_IOVNS=https://github.com/iov-one/weave/releases/download/v0.25.1/bnsd-0.25.1-linux-amd64.tar.gz
IMAGE_IOVNS_OPTS=""
IMAGE_TM=https://github.com/iov-one/tendermint-build/releases/download/v0.31.11-iov1/tendermint-0.31.11-linux-amd64.tar.gz
IMAGE_TM_OPTS="\
--consensus.create_empty_blocks=false \
--moniker='moniker' \
--p2p.laddr=tcp://0.0.0.0:16656 \
--p2p.seeds=2cc394bcbb0a5c31f906a92d13efc7326861d08c@34.89.253.221:26656 \
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

# create iovns.service
cat <<'__EOF_IOVNS_SERVICE__' | sed -e 's@__DIR_IOVNS__@'"$DIR_IOVNS"'@g' > iovns.service
[Unit]
Description=IOV Name Service
After=network-online.target
Requires=iovns-tm.service
PartOf=iovns-tm.service

[Service]
Type=simple
User=iov
Group=iov
EnvironmentFile=/etc/systemd/system/iovns.env
ExecStart=__DIR_IOVNS__/bnsd \
   -home=${DIR_WORK} \
   start \
   -bind=unix://${DIR_WORK}/${SOCK_TM} \
   $IMAGE_IOVNS_OPTS
LimitNOFILE=4096
Restart=on-failure
RestartSec=3
StandardError=journal
StandardOutput=journal
SyslogIdentifier=iovns

[Install]
WantedBy=multi-user.target
__EOF_IOVNS_SERVICE__

# create iovns-tm.service
cat <<'__EOF_IOVNS_TM_SERVICE__' | sed -e 's@__DIR_IOVNS__@'"$DIR_IOVNS"'@g' > iovns-tm.service
[Unit]
Description=Tendermint for IOV Name Service
After=iovns.service
Requires=iovns.service

[Service]
Type=simple
User=iov
Group=iov
EnvironmentFile=/etc/systemd/system/iovns.env
ExecStart=__DIR_IOVNS__/tendermint node \
   --home=${DIR_WORK} \
   --proxy_app=unix://${DIR_WORK}/${SOCK_TM} \
   $IMAGE_TM_OPTS
LimitNOFILE=4096
Restart=on-failure
RestartSec=3
StandardError=journal
StandardOutput=journal
SyslogIdentifier=iovns-tm

[Install]
WantedBy=multi-user.target iovns.service
__EOF_IOVNS_TM_SERVICE__

# hack around ancient versions of systemd
expr $(systemctl --version | grep -m 1 -P -o "\d+") '<' 239 && {
   sed --in-place 's!\$IMAGE_IOVNS_OPTS!'"$IMAGE_IOVNS_OPTS"'!' /etc/systemd/system/iovns.service
   sed --in-place 's!\$IMAGE_TM_OPTS!\'"$IMAGE_TM_OPTS"'!' /etc/systemd/system/iovns-tm.service
}

systemctl daemon-reload

# download gitian built binaries; bnsd is the IOV Name Service daemon
mkdir -p ${DIR_IOVNS} && cd ${DIR_IOVNS}
wget ${IMAGE_IOVNS} && sha256sum $(basename $IMAGE_IOVNS) | grep 9dd8cd8a64f8324b388f9b75d4be8a60df0024e4b55032d43b1d96b69c0c07af && tar xvf $(basename $IMAGE_IOVNS) || echo 'BAD BINARY!'
wget ${IMAGE_TM}    && sha256sum $(basename $IMAGE_TM)    | grep 9d7db111e35408f1b115456f0f7a83a4d516c66a78c4f59b9d84501ba7477bce && tar xvf $(basename $IMAGE_TM) || echo 'BAD BINARY!'

# initialize the IOV Name Service
su - iov
set -o allexport ; source /etc/systemd/system/iovns.env ; set +o allexport # pick-up env vars

mkdir -p ${DIR_WORK} && cd ${DIR_WORK}

# initialize tendermint
${DIR_IOVNS}/tendermint init --home=${DIR_WORK}
curl --fail https://rpc-private-a-x-dancenet.iov.one/genesis | jq -r .result.genesis > config/genesis.json
sha256sum config/genesis.json | grep 54bdd7c6a0a3f7ee359d6e5229b7123ab6f6433b38f1786b81fc93fcec34c2c8 || echo 'BAD GENESIS FILE!'
[[ -f ~/node_key.json ]] && cp -av ~/node_key.json config
[[ -f ~/priv_validator_key.json ]] && cp -av ~/priv_validator_key.json config
sed --in-place 's!^timeout_commit .*!timeout_commit = "5s"!' config/config.toml # options not available via command line
sed --in-place 's!^create_empty_blocks .*!create_empty_blocks = false!' config/config.toml
sed --in-place 's!^create_empty_blocks_interval .*!create_empty_blocks_interval = "300s"!' config/config.toml

# initialize IOV Name Service (bnsd)
${DIR_IOVNS}/bnsd -home=${DIR_WORK} init -i | grep initialised

exit # iov

journalctl -f | grep iovns & # watch the chain sync
systemctl start iovns.service

exit # root
```

At this point you're running a full-node that can be examined at `http://localhost:16657/status`.

> The most important file from the procedure above is `/etc/systemd/system/iovns.env`.  It defines binaries, the socket that allows `iovns.service` and `iovns-tm.service` to communicate with each other, and IOV Name Service and tendermint options.

Using `/etc/systemd/system/iovns.env`, rather than specifying values directly in the service files, obviates the need to do `systemctl daemon-reload` on every option change.  Most values in `/etc/systemd/system/iovns.env` are self explanatory; however, there are a few of note:

- for IOV Name Service
  - `IMAGE_IOVNS_OPTS` allows you to customize the anti-spam fee, etc.
- for Tendermint
  - `IMAGE_TM_OPTS` allows you to customize the configuration of tendermint, including `priv_validator_laddr`, `p2p.pex`, `p2p.persistent_peers`, `p2p.private_peer_ids`, etc.  **In other words, it's `/etc/systemd/system/iovns.env` that determines whether the node will act as a sentry or validator based on `priv_validator_laddr` and `p2p.*` options.**  Please refer to the <a href="https://tendermint.com/docs/tendermint-core/configuration.html#options" target="blank_">tendermint documentation for the options</a>.

> Old versions of systemd (CentOs) cannot take advantage of the dynamism of `/etc/systemd/system/iovns.env` like modern versions can.  Consequently, the service files themselves are where `bnsd` (IOV Name Service) and `tendermint` options must be specified.

## Point the nodes at each other

Now that you have sentry node(s) and a validator, they need to be made aware of their role and pointed at each other.

### Sentry node configuration

In the most rudimentary form, a sentry node is meant to gossip with other nodes but keep its associated validator hidden.  Change `/etc/systemd/system/iovns.env` so that the node gossips while keeping its validator hidden.  Be mindful of `--rpc.unsafe=true` below, you might not want that.  **On the validator node**, execute `curl -s http://localhost:16657/status | jq -r .result.node_info.id` to get the value for `VALIDATOR_ID`.

```sh
IMAGE_TM_OPTS="\
--moniker='sentry' \
--p2p.seeds=2cc394bcbb0a5c31f906a92d13efc7326861d08c@34.89.253.221:26656 \
--p2p.pex=true \
--p2p.private_peer_ids='VALIDATOR_ID' \
--rpc.unsafe=true \
"
```

There are a lot more tendermint configuration options available than those shown above.  Customize them as you see fit and then execute `sudo systemctl restart iovns.service`.

### Validator configuration

As mentioned, it's `/etc/systemd/system/iovns.env` that determines whether the node will act as a sentry or validator based on `p2p.*` options and `priv_validator_laddr` if you're using an HSM.  Change `/etc/systemd/system/iovns.env` so that the node gossips with its sentry node(s) only, ie set **`p2p.pex=false`** and add an explicit list of `p2p.persistent_peers`.  Obtain the sentry node ids for `p2p.persistent_peers` by executing `curl -s http://localhost:16657/status | jq -r .result.node_info.id` **on each sentry node**.  You know the IP and PORT of the nodes, so include them appropriately.

```sh
IMAGE_TM_OPTS="\
--moniker='validator' \
--priv_validator_laddr='tcp://HSM_IP:HSM_PORT' \
--p2p.persistent_peers='SENTRY_ID0@SENTRY_IP0:SENTRY_PORT0,SENTRY_ID1@SENTRY_IP1:SENTRY_PORT1' \
--p2p.pex=false \
--rpc.unsafe=false \
"
```

Execute `sudo systemctl restart iovns.service`

### Update the bnsd binary on all nodes

TODO

### Signal that you're running bnsd v1.0.0

TODO

### Wait for the migration to be triggered

TODO
