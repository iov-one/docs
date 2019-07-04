---
id: tx-sign-spec
title: Transaction signitures 
sidebar_label: Transaction signatures 
---

In this section, we will explain how to sign **Weave transactions**.

## Authentication and Authorization

General overview of definitions on this section:

- *Authentication* defines who is requesting this transaction. 

- *Authorization* determines if the necessary conditions to assume the required *permission* to execute the action.

- *Permission* is the right to perform a specific type of action, like send tokens from an account, or release an escrow. These permissions can be assigned to an individual, but more general to a *Condition*.

- *Conditions* define what checks a transaction must fulfill to be able to access given permission. They must be serializable and can be stored along with an object.

The simplest example to cover all definitions is “who can transfer money out of an account”. In many blockchains, they hash the __public key__ and use that to form an __address__. Then this address is used as a __primary key__ to an account balance. A user can send tokens to any address, and if I have signed with a public key, which hashes to the address of this account, then I can __authorize__ payments out of the account. In this case, the *signature* is __authentication__, we must have transfer __permission__ on this account, and the __condition__ is the presence of a signature with a public key that hashes to the account’s address.

## Serialization
Conditions format defined as `(extension, type, data)` in general. __ed25519__ public key signature could be represented as `("sigs", "ed25519", <address>)` and theoretically __sha256__ hashlock could be as `("hash", "sha256", <hash>)`. 

## Signing transactions

After the steps in [Weave transactions](transaction.md) is followed, created **Tx** is ready to be signed to be authenticated and authorized by *Weave/bnsd*. 

Signature body format is:

| version     | len(chainID)     | chainID          | nonce                 | signBytes                  |
|--------:    |--------------    |--------------    |-------------------    |------------------------    |
| 4bytes      | uint8            | ascii string     | int64 (bigendian)     | serialized transaction     |

- **version** is the current way to prefix the bytes. Its current value is `00000000 11001010 11111110 00000000`. As hex `0, 0xCA, 0xFE, 0`. Please refer to [iov-one/weave/sigs/SignCodeV1](https://github.com/iov-one/weave/blob/v0.18.0/x/sigs/controller.go#L14).

After this arbitrary bytes put together, this is then prehashed with __sha512__ before fed into
the public key signing/verification step. This step is applied in order to guarantee signing could be done by a ledger. 

After having the hashed transaction and signed with the wallet's **ed25519** private key, you have your **Signed transaction** at your will.

