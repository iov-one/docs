---
id: setup
title: Validator setup
sidebar_label: Setup
---

> IOV does not recommend using docker in production; however, it can be used to start building your validator's quality score on our testnet if you so choose.

This document is not for beginners.  It assumes that you know how to setup a sentry node architecture for Tendermint nodes.

> Hint: When upgrading from an old testnet to a new one, you can maintain your node id and validator pub_key across testnets by doing the following before performing the upgrade:

```sh
su - iov
set -o allexport ; source /etc/systemd/system/iovns.env ; set +o allexport # pick-up env vars
cp -av ${DIR_WORK}/config/*_key.json ~
exit
```

## Systemd for running a sentry node or validator

This document assumes that `curl`, `docker`, `jq`, and `which` are installed on your system, and user `iov` in groups `iov` and `docker` exists.  You should be able to copy-and-paste the following commands into a terminal and end up with a running node.  You'll have to do this procedure on at least two machines to implement a sentry node architecture.

```sh
sudo su # make life easier for the next ~100 lines

cd /etc/systemd/system

# create an environment file for the IOV Name Service services
cat <<__EOF_IOVNS_ENV__ > iovns.env
# directories
DIR_TM=/tendermint
DIR_WORK=/home/iov/lovenet

# docker options
DOCKER_IOVNS_OPTS="--rm"
DOCKER_TM_OPTS="--rm -p16656:26656 -p16657:26657"

# docker cid files
FILE_CID_IOVNS=iovns.cid
FILE_CID_TM=iovns-tm.cid

# images
IMAGE_IOVNS=iov1/bnsd:v0.20.0
IMAGE_IOVNS_OPTS=""
IMAGE_TM=iov1/tendermint:v0.31.5
IMAGE_TM_OPTS="\
--moniker='moniker' \
--p2p.persistent_peers='ce812b7220b91acf11b8bb91905fe20466ffbd5c@35.195.61.59:26656' \
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

# deal with inconsistent systemd PATH among distributions
export CAT=$(which --skip-alias cat)
export DOCKER=$(which --skip-alias docker)
export RM=$(which --skip-alias rm)
export SH=$(which --skip-alias sh)

# create iovns.service
cat <<'__EOF_IOVNS_SERVICE__' | sed -e 's@__CAT__@'"$CAT"'@g' -e 's@__DOCKER__@'"$DOCKER"'@g' -e 's@__RM__@'"$RM"'@g' -e 's@__SH__@'"$SH"'@g' > iovns.service
[Unit]
Description=IOV Name Service
After=network-online.target
Requires=docker.service

[Service]
Type=simple
User=iov
Group=iov
EnvironmentFile=/etc/systemd/system/iovns.env
ExecStart=__DOCKER__ run $DOCKER_IOVNS_OPTS \
   --cidfile=${DIR_WORK}/${FILE_CID_IOVNS} \
   --read-only \
   --user=${IOV_UID}:${IOV_GID} \
   --volume=${DIR_WORK}:${DIR_TM} \
   ${IMAGE_IOVNS} \
      -home=${DIR_TM} \
      start \
      -bind="unix://${DIR_TM}/${SOCK_TM}" \
      $IMAGE_IOVNS_OPTS
ExecStop=__SH__ -c "__DOCKER__ stop $(__CAT__ ${DIR_WORK}/${FILE_CID_IOVNS})"
ExecStopPost=__RM__ -fv ${DIR_WORK}/${FILE_CID_IOVNS}
#Restart=on-failure
#RestartSec=3
StandardError=journal
StandardOutput=journal
SyslogIdentifier=iovns

[Install]
WantedBy=multi-user.target
__EOF_IOVNS_SERVICE__

# create iovns-tm.service
cat <<'__EOF_IOVNS_TM_SERVICE__' | sed -e 's@__CAT__@'"$CAT"'@g' -e 's@__DOCKER__@'"$DOCKER"'@g' -e 's@__RM__@'"$RM"'@g'  -e 's@__SH__@'"$SH"'@g' > iovns-tm.service
[Unit]
Description=Tendermint for IOV Name Service
After=iovns.service
Requires=docker.service

[Service]
Type=simple
User=iov
Group=iov
EnvironmentFile=/etc/systemd/system/iovns.env
ExecStart=__DOCKER__ run "$DOCKER_TM_OPTS" \
   --cidfile=${DIR_WORK}/${FILE_CID_TM} \
   --read-only \
   --user=${IOV_UID}:${IOV_GID} \
   --volume=${DIR_WORK}:${DIR_TM} \
   ${IMAGE_TM} node \
      --proxy_app="unix://${DIR_TM}/${SOCK_TM}" \
      $IMAGE_TM_OPTS
ExecStop=__SH__ -c "__DOCKER__ stop $(__CAT__ ${DIR_WORK}/${FILE_CID_TM})"
ExecStopPost=__RM__ -fv ${DIR_WORK}/${FILE_CID_TM}
#Restart=on-failure
#RestartSec=3
StandardError=journal
StandardOutput=journal
SyslogIdentifier=iovns-tm

[Install]
WantedBy=multi-user.target
__EOF_IOVNS_TM_SERVICE__

systemctl daemon-reload
exit # root

# initialize the IOV Name Service
su - iov
set -o allexport ; source /etc/systemd/system/iovns.env ; set +o allexport # pick-up env vars

docker pull ${IMAGE_TM}
docker pull ${IMAGE_IOVNS}

mkdir -p ${DIR_WORK}
cd ${DIR_WORK}

# initialize tendermint
docker run --rm --user=${IOV_UID}:${IOV_GID} -v ${DIR_WORK}:${DIR_TM} ${IMAGE_TM} init
curl --fail https://rpc.lovenet.iov.one/genesis | jq '.result.genesis' > config/genesis.json
[[ -f ~/node_key.json ]] && cp -av ~/node_key.json config
[[ -f ~/priv_validator_key.json ]] && cp -av ~/priv_validator_key.json config

# initialize IOV Name Service (bnsd)
docker run --rm --user=${IOV_UID}:${IOV_GID} -v ${DIR_WORK}:${DIR_TM} ${IMAGE_IOVNS} -home=${DIR_TM} init -i | grep initialised

exit # iov

journalctl -f | grep iovns & # watch the chain sync
systemctl start iovns.service
systemctl start iovns-tm.service

exit # root
```

At this point you're running a full-node that can be examined at `http://localhost:16657/status`.

> The most important file from the procedure above is `/etc/systemd/system/iovns.env`.  It defines docker image versions and options, directories that allow the `iovns.service` and `iovns-tm.service` to communicate with each other, and IOV Name Service and tendermint options.

Using `/etc/systemd/system/iovns.env`, rather than specifying values directly in the service files, obviates the need to do `systemctl daemon-reload` on every option change.  Most values in `/etc/systemd/system/iovns.env` are self explanatory; however, there are a few of note:

- for IOV Name Service
  - `IMAGE_IOVNS_OPTS` allows you to customize the anti-spam fee, etc.
- for Tendermint
  - `DOCKER_TM_OPTS` is important because it exposes tendermint ports.
  - `IMAGE_TM_OPTS` allows you to customize the configuration of tendermint, including `priv_validator_laddr`, `p2p.pex`, `p2p.persistent_peers`, `p2p.private_peer_ids`, etc.  **In other words, it's `/etc/systemd/system/iovns.env` that determines whether the node will act as a sentry or validator based on `priv_validator_laddr` and `p2p.*` options.**  Please refer to the <a href="https://tendermint.com/docs/tendermint-core/configuration.html#options" target="blank_">tendermint documentation for the options</a>.

## Point the nodes at each other

Now that you have sentry node(s) and a validator, they need to be made aware of their role and pointed at each other.

### Sentry node configuration

In the most rudimentary form, a sentry node is meant to gossip with other nodes but keep its associated validator hidden.  Change `/etc/systemd/system/iovns.env` so that the node gossips while keeping its validator hidden.  Be mindful of `--rpc.unsafe=true` below, you might not want that.  **On the validator node**, execute `curl -s http://localhost:16657/status | jq -r .result.node_info.id` to get the value for `VALIDATOR_ID`.

```sh
IMAGE_TM_OPTS="\
--moniker='sentry' \
--p2p.persistent_peers='ce812b7220b91acf11b8bb91905fe20466ffbd5c@35.195.61.59:26656' \
--p2p.pex=true \
--p2p.private_peer_ids='VALIDATOR_ID' \
--rpc.unsafe=true \
"
```

There are a lot more tendermint configuration options available than those shown above.  Customize them as you see fit.

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

## Light-up the validator

Once your sentry nodes and validator are sync'ed then the final step to becoming a validator is to submit your validator's pub_key to IOV.  **On your validator node**, execute `curl --silent --fail http://localhost:16657/status | jq -r .result.validator_info.pub_key.value` and reply with the resulting 44 character pub_key to the ticket that was issued to you when you applied for the validator program.  (There's no `create-validator` command like in Cosmos; validators are added via governance, which is just IOV on the testnet, for the moment.)
