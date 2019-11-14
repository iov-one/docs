---
id: troubleshooter
title: Troubleshooter
sidebar_label: Troubleshooter
---

## Common errors

### Genesis doc must include non-empty chain_id

- The genesis object is included in a rpc response frame, so it must be extracted from the "result" object.

```sh
curl https://SOME_HOST_WITH_RPC_PORT/genesis | jq .result.genesis > config/genesis.json
```

### failed to start a server: listen unix /tendermint/iovns.sock: bind: address already in use

- The clean-up of the iovns.sock socket failed.

```sh
rm ${DIR_WORK}/iovns.sock
```

### No blocks are being produced

- The IOV Name Service chain does not produce empty blocks unless 5 minutes have transpired.
