---
id: testnet
title: Setup A Testnet Validator Node
sidebar_label: Testnet
---

## Familiarize yourself with Gitian

Downloading and running a binary makes most sane people nervous.  <a href="https://gitian.org/" target="_blank">Gitian</a> introduces a level of trust for binary artifacts and is the <a href="https://medium.com/iov-internet-of-values/distribute-open-source-software-the-right-and-verifiable-way-fe12f58df062" target="_blank">distribution method</a> chosen by IOV and other blockchains including Bitcoin and <a href="https://medium.com/tendermint/reproducible-builds-8c2eebb9a486" target="_blank">Cosmos</a>.  We'll use binaries built using gitian and systemd to drive the IOV Name Service blockchain.

## Use systemd for running a sentry node or validator

This document is not for beginners.  It assumes that you know how to setup a sentry node architecture for Tendermint nodes.

> Hint: When upgrading from an old testnet to a new one, you can maintain your node id and validator pub_key across testnets by doing the following before performing the upgrade:

```sh
export USER_IOV=iov # "iov" is not recommended

su - $USER_IOV
set -o allexport ; source /etc/systemd/system/starname.env ; set +o allexport # pick-up env vars
cp -av ${DIR_WORK}/config/*_key.json ~
exit
```

This document assumes that `basename`, `curl`, `grep`, `jq`, `sed`, `sha256sum`, and `wget` are installed on your system, and user `$USER_IOV` exists.  You should be able to copy-and-paste the following commands into a terminal and end up with a running node.  You'll have to do this procedure on at least two machines to implement a sentry node architecture.

```sh
sudo su # make life easier for the next ~100 lines

cd /etc/systemd/system

export USER_IOV=iov # "iov" is not recommended

# create an environment file for the IOV Name Service services
cat <<__EOF_IOVNS_ENV__ > starname.env
# operator variables
CHAIN_ID=iovns-galaxynet
MONIKER=$(hostname)
USER_IOV=${USER_IOV}

# directories (without spaces to ease pain)
DIR_IOVNS=/opt/iovns/bin
DIR_WORK=/home/${USER_IOV}/galaxynet

# artifacts
IOVNS=https://github.com/iov-one/iovns/releases/download/v0.4.1/iovns-0.4.1-linux-amd64.tar.gz
__EOF_IOVNS_ENV__

chgrp ${USER_IOV} starname.env
chmod g+r starname.env

set -o allexport ; source /etc/systemd/system/starname.env ; set +o allexport # pick-up env vars

# create starname.service
cat <<__EOF_STARNAME_SERVICE__ > starname.service
[Unit]
Description=IOV Name Service
After=network-online.target
#PartOf=iovnsapi.service

[Service]
Type=simple
User=$(id ${USER_IOV} -u -n)
Group=$(id ${USER_IOV} -g -n)
EnvironmentFile=/etc/systemd/system/starname.env
ExecStart=${DIR_IOVNS}/iovnsd.sh
LimitNOFILE=4096
#Restart=on-failure
#RestartSec=3
StandardError=journal
StandardOutput=journal
SyslogIdentifier=iovnsd

[Install]
WantedBy=multi-user.target
__EOF_STARNAME_SERVICE__

systemctl daemon-reload

# download gitian built binaries; iovnsd is the IOV Name Service daemon
mkdir -p ${DIR_IOVNS} && cd ${DIR_IOVNS}
wget ${IOVNS} && sha256sum $(basename ${IOVNS}) | grep 34e7610bb87fed342d8575f462338aeba45f72ef6654c6dd1fb9829500fb41cf && tar xvf $(basename ${IOVNS}) || echo 'BAD BINARY!'

# create iovnsd.sh, a wrapper for iovnsd
cat <<__EOF_IOVNSD_SH__ > iovnsd.sh
#!/bin/bash

exec $PWD/iovnsd start \\
  --consensus.create_empty_blocks 'false' \\
  --consensus.create_empty_blocks_interval '300s' \\
  --home ${DIR_WORK} \\
  --minimum-gas-prices '10.0uiov' \\
  --moniker '${MONIKER}' \\
  --p2p.laddr 'tcp://0.0.0.0:46656' \\
  --p2p.persistent_peers '55afc476b4aaeea5ea784f40117ef5a047097116@64.227.40.19:46656' \\
  --rpc.laddr 'tcp://127.0.0.1:46657' \\
  --rpc.unsafe 'true' \\

__EOF_IOVNSD_SH__

chgrp ${USER_IOV} iovnsd.sh
chmod a+x iovnsd.sh

# initialize the IOV Name Service
su - ${USER_IOV}
set -o allexport ; source /etc/systemd/system/starname.env ; set +o allexport # pick-up env vars

mkdir -p ${DIR_WORK} && cd ${DIR_WORK}

# initialize IOV Name Service (iovnsd)
${DIR_IOVNS}/iovnsd init ${MONIKER} --chain-id ${CHAIN_ID} --home ${DIR_WORK} 2>&1 | jq -r .chain_id

curl --fail https://rpc.cluster-galaxynet.iov.one/genesis | jq -r .result.genesis  > config/genesis.json
sha256sum config/genesis.json | grep a4a89f3475d767b13945aad48744a675e7de0d056f3439c5aca6807980bd92d2 || echo 'BAD GENESIS FILE!'
[[ -f ~/node_key.json ]] && cp -av ~/node_key.json config
[[ -f ~/priv_validator_key.json ]] && cp -av ~/priv_validator_key.json config

exit # ${USER_IOV}

journalctl -f -u starname.service & # watch the chain sync
systemctl start starname.service

exit # root
```

At this point you're running a full-node that can be examined at `http://localhost:46657/status`.  Repeat the above procedure on as many sentry nodes as you have and once more on your validator node.

## Point the nodes at each other

Now that you have sentry node(s) and a validator, they need to be made aware of their role and pointed at each other.

### Sentry node configuration

In the most rudimentary form, a sentry node is meant to gossip with other nodes but keep its associated validator hidden.  Change `${DIR_IOVNS}/iovnsd.sh` so that the node gossips while keeping its validator hidden.  Be mindful of `--rpc.unsafe true` below, you might not want that.  **On the validator node**, execute `curl -s http://localhost:46657/status | jq -r .result.node_info.id` to get the value for `VALIDATOR_ID`.

```sh
exec "$PWD/iovnsd start \
...
--moniker 'sentry' \
--p2p.laddr 'tcp://0.0.0.0:46656' \
--p2p.persistent_peers '55afc476b4aaeea5ea784f40117ef5a047097116@64.227.40.19:46656' \
--rpc.laddr 'tcp://127.0.0.1:46657' \
--rpc.unsafe 'true' \
"
```

There are a lot more tendermint configuration options available than those shown above.  Customize them as you see fit and then execute `sudo systemctl restart starname.service`.

### Validator configuration

As mentioned, it's `${DIR_IOVNS}/iovnsd.sh` that determines whether the node will act as a sentry or validator based on `p2p.*` options and `priv_validator_laddr` if you're using an HSM.  Change `${DIR_IOVNS}/iovnsd.sh` so that the node gossips with its sentry node(s) only, ie set **`p2p.pex false`** and add an explicit list of `p2p.persistent_peers`.  Obtain the sentry node ids for `p2p.persistent_peers` by executing `curl -s http://localhost:46657/status | jq -r .result.node_info.id` **on each sentry node**.  You know the IP and PORT of the nodes, so include them appropriately.

```sh
IMAGE_TM_OPTS="\
--moniker 'validator' \
--priv_validator_laddr 'tcp://HSM_IP:HSM_PORT' \
--p2p.persistent_peers 'SENTRY_ID0@SENTRY_IP0:SENTRY_PORT0,SENTRY_ID1@SENTRY_IP1:SENTRY_PORT1' \
--p2p.pex 'false' \
--rpc.unsafe 'false' \
"
```

Execute `sudo systemctl restart starname.service`

### Hardware Security Module (HSM) configuration

Assuming that you're already running `tmkms` for another chain, update your `tmkms.toml` file:
```sh
sudo su # make life easier for the next 20 lines

set -o allexport ; source /etc/systemd/system/starname.env ; set +o allexport # pick-up env vars

export ADDR_VALIDATOR="tcp://id@example1.example.com:46658" # or addr = "unix:///path/to/socket"
export FILE_SECRET=/path/to/secret_connection.key
export FILE_TMKMS=/path/to/tmkms.toml

grep ${CHAIN_ID} ${FILE_TMKMS} || { cat <<__EOF_TMKMS_UPDATE__ >> ${FILE_TMKMS}
[[chain]]
id = "${CHAIN_ID}"
key_format = { type = "bech32", account_key_prefix = "starpub", consensus_key_prefix = "starvalconspub" }
state_file = "${DIR_WORK}/config/priv_validator_state.json"
# state_hook = { cmd = ["/path/to/block/height_script", "--example-arg", "starname network"] }

[[validator]]
addr = "${ADDR_VALIDATOR}"
chain_id = "${CHAIN_ID}"
secret_key = "${FILE_SECRET}"
protocol_version = "v0.33" # "legacy" is the default
__EOF_TMKMS_UPDATE__

sed --in-place "s/\(chain_ids.*\)\"/\\1\", \"${CHAIN_ID}\"/" ${FILE_TMKMS}
}

exit # root
```

## Light-up the validator

Once your sentry nodes and validator are sync'ed then the final step to becoming a validator is to execute the `create-validator` command like for any Cosmos-based chain.  We don't have a faucet yet so ping us on the starname channel on discord and we'll send you some tokens.  The testnet's token is denominated in `uvoi`, so your create validator command will look something like
```sh
iovnscli tx staking create-validator \
  --amount 1000000uvoi \
  --from ${SIGNER} \
  --gas-prices 500000uvoi \
  --node https://rpc.cluster-galaxynet.iov.one:443
```

Happy validating!
