---
id: upgrade
title: Switching Testnet
sidebar_label: Switching Testnet
---

> Hint: When upgrading from an old testnet to a new one, you can maintain your node id and validator pub_key across testnets by doing the following before performing the upgrade:

```sh
su - iov
set -o allexport ; source /etc/systemd/system/iovns.env ; set +o allexport # pick-up env vars
cp -av ${DIR_WORK}/config/*_key.json ~
exit
```

Then [follow the procedure to setup your validator node](/docs/iov-name-service/validator/setup)


