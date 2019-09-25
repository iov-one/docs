---
id: tx-sign-spec
title: Transaction Signatures
sidebar_label: Transaction Signatures
---

In this section, we will explain how to sign **transactions**.

## Authentication and Authorization

To execute desired actions and state changes on **Weave-based** blockchains, every transaction must be validated, authenticated and then authorized to perform the action. In the realm of blockchains this is achieved by using signatures.

Weave uses the `ed25519` signing algorithm to achieve this important feature.
After following the steps in [Weave transactions](weave/weave-api-spec/02-transaction.md), created **Tx** must be signed. But first Weave _conditions_ role in signing must be explained.

Conditions format defined as `(extension, type, data)` in general.

Condition with **ed25519** public key signature could be represented as `("sigs", "ed25519", <address>)`.

Here is the basic Go presentation of condition:

`condition := fmt.Sprintf("%s/%s/%X", extension, type, data)` where **condition** looks something like `sigs/ed25519/636f6e646974696f6e64617461`.

## Signing transactions

After the steps in [Weave transactions](weave/weave-api-spec/02-transaction.md) are followed, the created **Tx** is ready to be signed, authenticated, and authorized by _Weave/bnsd_.

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
