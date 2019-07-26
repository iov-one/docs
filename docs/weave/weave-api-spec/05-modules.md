---
id: modules
title: Modules
sidebar_label: Modules
---

## Username

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/cmd/bnsd/x/username/model.go#L73): `username:`
- `/usernames` -> returns [bnsd/x/username/username.Token](https://github.com/iov-one/weave/blob/v0.18.0/cmd/bnsd/x/username/codec.proto#L7-L26) by `id`(8 bytes) or empty result
- `/usernames?prefix` -> returns 1 or more `Token` that begin with that prefix

## Cash

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/cash/model.go#L18): `cash:`
- `/wallets` -> returns [x/cash.Set](https://github.com/iov-one/weave/blob/v0.18.0/x/cash/codec.proto#L11-L14) by `id` (8 bytes) or empty result
- `/wallets?prefix` -> returns 1 or more `Set` that begin with that prefix

## Sigs

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/sigs/model.go#L117): `sigs:`
- `/auth` -> returns [x/sigs.UserData](https://github.com/iov-one/weave/blob/v0.18.0/spec/proto/x/sigs/codec.proto#L13-L17) by `id`(8 bytes) or empty result
- `/auth?prefix` -> returns 1 or more `UserData` that begin with that prefix

## Multisig

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/multisig/model.go#L86): `multisig:`
- `/contracts` -> returns [x/multisig.Contract](https://github.com/iov-one/weave/blob/v0.18.0/x/multisig/codec.proto#L8-L21) by `id` (8 bytes) or empty result
- `/contracts?prefix` -> returns 1 or more `Contract` that begin with that prefix

## Atomic swaps

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/aswap/model.go#L85): `swap:`
- `/aswaps` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.18.0/x/aswap/codec.proto#L9-L29) by `id` (8 bytes) or empty result
- `/aswaps/source` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.18.0/x/aswap/codec.proto#L9-L29) by `source`(20 bytes address) as secondary index or empty result
- `/aswaps/destination` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.18.0/x/aswap/codec.proto#L9-L29) by `destination`(20 bytes address) as secondary index or empty result
- `/aswaps/preimage_hash` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.18.0/x/aswap/codec.proto#L9-L29) by `preimage_hash`(32 bytes sha256 hash) as secondary index or empty result
- `/aswaps?prefix` -> returns 1 or more `Swap` that begin with that prefix

## Escrow

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/escrow/model.go#L113): `escrow:`
- `/escrows` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.18.0/x/escrow/codec.proto#L9-L28) by `id`(8 bytes) or empty result
- `/escrows/source` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.18.0/x/escrow/codec.proto#L9-L28) by `source`(20 bytes address) as secondary index or empty result
- `/escrows/destination` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.18.0/x/escrow/codec.proto#L9-L28) by `destination`(20 bytes address) as secondary index or empty result
- `/escrows/arbiter` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.18.0/x/escrow/codec.proto#L9-L28) by `arbiter` (20 bytes address) as secondary index
- `/escrows?prefix` -> returns 1 or more `Escrow` that begin with that prefix

## Payment channels

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/paychan/model.go#L67): `paychan:`
- `/paychans` -> returns [x/paychan.PaymentChannel](https://github.com/iov-one/weave/blob/v0.18.0/x/paychan/codec.proto#L10-L36) by `id`(8 bytes) or empty result
- `/paychans?prefix` -> returns 1 or more `PaymentChannel` that begin with that prefix

## Distribution

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/distribution/model.go#L110): `revenue:`
- `/revenues` -> returns [x/distribution.Revenue](https://github.com/iov-one/weave/blob/v0.18.0/x/distribution/codec.proto#L8-L20) by `id`(8 bytes) or empty result
- `/revenues?prefix` -> returns 1 or more `Revenue` that begin with that prefix

## Currency

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/currency/model.go#L55): `tokeninfo:`
- `/tokens` -> returns [x/currency.TokenInfo](https://github.com/iov-one/weave/blob/v0.18.0/x/currency/codec.proto#L7-L12) by `id`(8 bytes) or empty result
- `/tokens?prefix` -> returns 1 or more `TokenInfo` that begin with that prefix

## Validators

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/validators/model.go#L16): `uvalid:`
- `/validators` -> returns [x/validators.Accounts](https://github.com/iov-one/weave/blob/v0.18.0/x/validators/codec.proto#L14-L18) by `id`(8 bytes) or empty result
- `/validators?prefix` -> returns 1 or more `Accounts` that begin with that prefix

## Anti spam

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/msgfee/model.go#L48): `msgfee:`
- `/msgfee` -> returns [x/msgfee.MsgFee](https://github.com/iov-one/weave/blob/v0.18.0/x/msgfee/codec.proto#L9-L16) by `id`(8 bytes) or empty result
- `/msgfee?prefix` -> returns 1 or more `MsgFee` that begin with that prefix
- `/minfee` -> returns [x/msgfee.MsgFee](https://github.com/iov-one/weave/blob/v0.18.0/x/msgfee/codec.proto#L9-L16) by `id`(8 bytes) or empty result
- `/minfee?prefix` -> returns 1 or more `MsgFee` that begin with that prefix

## Governance

### Electorate

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/bucket.go#L17): `electorate:`
- `/electorate` -> returns [x/gov.Electorate](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L9-L24) by `id`(8 bytes) or empty result
- `/electorate?prefix` -> returns 1 or more `Electorate` that begin with that prefix

### Elector

- Elector is a multikey index of electorate
- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/bucket.go#L18): `elector:`
- `/electorate/elector` -> returns [x/gov.Elector](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L24-L32) by `elector`(20 bytes address) or empty result
- `/electorate/elector?prefix` -> returns 1 or more `Elector` that begin with that prefix

### Election rules

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/bucket.go#L51): `electnrule:`
- `/electionRule` -> returns [x/gov.ElectionRule](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L33-L63) by `id`(8 bytes) or empty result
- `/electionRules?prefix` -> returns 1 or more `ElectionRule` that begin with that prefix

### Proposal

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/bucket.go#L77): `proposal:`
- `/proposal` -> returns [x/gov.Proposal](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L78-L116) by `id`(8 bytes) or empty result
- `/proposal?prefix` -> returns 1 or more `Proposal` that begin with that prefix

### Vote

- [key prefix](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/bucket.go#L186): `vote:`
- `/vote` -> returns [x/gov.Vote](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L169-L179) by `id`(8 bytes) or empty result
- `/vote?prefix` -> returns 1 or more `Vote` that begin with that prefix
- `/vote/proposal` -> returns [x/gov.Vote](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L169-L179) by `id`(8 bytes) or empty result
- `/vote/proposal?prefix` -> returns 1 or more `Vote` that begin with that prefix
  -- `/vote/elector` -> returns [x/gov.Vote](https://github.com/iov-one/weave/blob/v0.18.0/x/gov/codec.proto#L169-L179) by `id`(8 bytes) or empty result
- `/vote/elector?prefix` -> returns 1 or more `Vote` that begin with that prefix
