---
id: tx-sign-spec
title: Sign a transaction
sidebar_label: Sign a transaction
---

After the steps in [IOV Name Service transactions](/docs/iov-name-service/clients/weave-transaction-spec) are followed, the created **Tx** is ready to be signed, authenticated, and authorized by _IOV Name Service_.

Signature input body format is:

| version | len(chainID) | chainID      | nonce             | signBytes              |
| ------: | ------------ | ------------ | ----------------- | ---------------------- |
|  4bytes | uint8        | ascii string | int64 (bigendian) | serialized transaction |

- **version** is the current way to prefix the bytes. Its current value is hex `00xCA0xFE00`. Please refer to [iov-one/weave/sigs/SignCodeV1](https://github.com/iov-one/weave/blob/v0.21.0/x/sigs/controller.go#L14).

After this arbitrary bytes is put together, which must feed the output of a hashing algorithm (or max 64 bytes) into the ed25519 signature calculation, this is then prehashed with **sha512** before fed into the public key signing/verification step. This step is applied to guarantee signing could be done by a ledger.

After having the hashed transaction signed with the wallet's **ed25519** private key, you have your **signed transaction** at your disposal.

Weave signing algorithm pseudocode:

```
chainID = "bns-hugnet"
versionAsHex = 0, 0xCA, 0xFE, 00
nonce = 100
tx = weave.Tx

chainIDBytes = toBytes(chainID)
versionAsBytes = toBytes(versionAsHes) = 00000000110010101111111000000000
nonceBytes = toBigEndianBytes(nonce)
serializedTx = toBytes(tx)

inSig = append(versionAsBytes, byte(chainId.length), chainIDBytes, nonceBytes, serializedTx)

midSig = sha512(inSig)

signature = wallet.ed25519.private.sign(midSig)
```
