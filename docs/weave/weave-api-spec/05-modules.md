---
id: modules
title: Modules
sidebar_label: Modules
---

## Username

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/cmd/bnsd/x/username/model.go#L73): `username:`
- `/usernames` -> returns [bnsd/x/username/username.Token](https://github.com/iov-one/weave/blob/v0.21.0/cmd/bnsd/x/username/codec.proto#L7-L26) by `id`(8 bytes) or empty result
- `/usernames?prefix` -> returns one or more `Token` that begin with that prefix
- **Message paths**
  - `username/register_token` -> [bnsd/x/username.RegisterTokenMsg](https://github.com/iov-one/weave/blob/v0.21.0/cmd/bnsd/x/username/codec.proto#L45-L53)
  - `username/transfer_token` -> [bnsd/x/username.TransferTokenMsg](https://github.com/iov-one/weave/blob/v0.21.0/cmd/bnsd/x/username/codec.proto#L55-L65)
  - `username/change_token_targets` -> [bnsd/x/username.ChangeTokenTargetMsg](https://github.com/iov-one/weave/blob/v0.21.0/cmd/bnsd/x/username/codec.proto#L66-L76)

## Batch

- **Message paths**
  - `batch/execute_batch` -> [bnsd/ExecuteBatchMsg](https://github.com/iov-one/weave/blob/v0.21.0/cmd/bnsd/app/codec.proto#L68-L94), [bnsd/ExecuteProposalBatchMsg](https://github.com/iov-one/weave/blob/v0.21.0/cmd/bnsd/app/codec.proto#L120-L142)

## Migration

- **Message paths**
  - `migration/upgrade_schema` -> [migration.UpdateSchemaMsg](https://github.com/iov-one/weave/blob/v0.21.0/migration/codec.proto#L25-L32)

## Cash

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/cash/model.go#L18): `cash:`
- `/wallets` -> returns [x/cash.Set](https://github.com/iov-one/weave/blob/v0.21.0/x/cash/codec.proto#L11-L14) by `id` (8 bytes) or empty result
- `/wallets?prefix` -> returns one or more `Set` that begin with that prefix
- **Message paths**
  - `cash/send` -> [x/cash.SendMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/cash/codec.proto#L16-L30)
  - `update_configuration` -> [x/cash.UpdateConfigurationMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/cash/codec.proto#L48-L53)

## Sigs

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/sigs/model.go#L117): `sigs:`
- `/auth` -> returns [x/sigs.UserData](https://github.com/iov-one/weave/blob/v0.21.0/spec/proto/x/sigs/codec.proto#L13-L17) by `id`(8 bytes) or empty result
- `/auth?prefix` -> returns one or more `UserData` that begin with that prefix
- **Message paths**
  - `sigs/bump_sequence` -> [x/sigs.BumpSequenceMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/sigs/codec.proto#L30-L42)

## Multisig

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/multisig/model.go#L86): `multisig:`
- `/contracts` -> returns [x/multisig.Contract](https://github.com/iov-one/weave/blob/v0.21.0/x/multisig/codec.proto#L8-L21) by `id` (8 bytes) or empty result
- `/contracts?prefix` -> returns one or more `Contract` that begin with that prefix
- **Message paths**
  - `multisig/create` -> [x/multisig.CreateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/multisig/codec.proto#L32-L37)
  - `multisig/update` -> [x/multisig.UpdateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/multisig/codec.proto#L39-L44)

## Atomic swaps

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/model.go#L85): `swap:`
- `/aswaps` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/codec.proto#L9-L29) by `id` (8 bytes) or empty result
- `/aswaps/source` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/codec.proto#L9-L29) by `source`(20 bytes address) as secondary index or empty result
- `/aswaps/destination` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/codec.proto#L9-L29) by `destination`(20 bytes address) as secondary index or empty result
- `/aswaps/preimage_hash` -> returns [x/aswap.Swap](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/codec.proto#L9-L29) by `preimage_hash`(32 bytes sha256 hash) as secondary index or empty result
- `/aswaps?prefix` -> returns one or more `Swap` that begin with that prefix
- **Message paths**
  - `aswap/create` -> [x/aswap.CreateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/codec.proto#L33-L46)
  - `aswap/release` -> [x/aswap.ReleaseMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/codec.proto#L48-L58)
  - `aswap/return` -> [x/aswap.ReturnMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/aswap/codec.proto#L59-L66)

## Escrow

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/model.go#L113): `escrow:`
- `/escrows` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/codec.proto#L9-L28) by `id`(8 bytes) or empty result
- `/escrows/source` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/codec.proto#L9-L28) by `source`(20 bytes address) as secondary index or empty result
- `/escrows/destination` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/codec.proto#L9-L28) by `destination`(20 bytes address) as secondary index or empty result
- `/escrows/arbiter` -> returns [x/escrow.Escrow](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/codec.proto#L9-L28) by `arbiter` (20 bytes address) as secondary index
- `/escrows?prefix` -> returns one or more `Escrow` that begin with that prefix
- **Message paths**
  - `escrow/create` -> [x/escrow.CreateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/codec.proto#L31-L46)
- `escrow/release` -> [x/escrow.ReleaseMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/codec.proto#L48-L56)
- `escrow/return` -> [x/escrow.ReturnMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/codec.proto#L58-L63)
- `escrow/UpdateParties` -> [x/escrow.UpdatePartiesMsg](https://github65-L76)

## Payment channels

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/paychan/model.go#L67): `paychan:`
- `/paychans` -> returns [x/paychan.PaymentChannel](https://github.com/iov-one/weave/blob/v0.21.0/x/paychan/codec.proto#L10-L36) by `id`(8 bytes) or empty result
- `/paychans?prefix` -> returns one or more `PaymentChannel` that begin with that prefix
- **Message paths**
  - `paychan/create` -> [x/paychan.CreateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/paychan/codec.proto#L40-L59)
  - `paychan/transfer` -> [x/paychan.TransferMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/paychan/codec.proto#L73-L80)
  - `paychan/close` -> [x/paychan.CloseMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/paychan/codec.proto#L82-L93)

## Distribution

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/distribution/model.go#L110): `revenue:`
- `/revenues` -> returns [x/distribution.Revenue](https://github.com/iov-one/weave/blob/v0.21.0/x/distribution/codec.proto#L8-L20) by `id`(8 bytes) or empty result
- `/revenues?prefix` -> returns one or more `Revenue` that begin with that prefix
- **Message paths**
  - `distribution/create` -> [x/distribution.CreateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/distribution/codec.proto#L38-L48)
  - `distribution/distribute` -> [x/distribution.DistributeMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/distribution/codec.proto#L50-L58)
  - `distribution/reset` -> [x/distribution.ResetMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/distribution/codec.proto#L60-L72)

## Currency

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/currency/model.go#L55): `tokeninfo:`
- `/tokens` -> returns [x/currency.TokenInfo](https://github.com/iov-one/weave/blob/v0.21.0/x/currency/codec.proto#L7-L12) by `id`(8 bytes) or empty result
- `/tokens?prefix` -> returns one or more `TokenInfo` that begin with that prefix
- **Message paths**
  - `currency/create` -> [x/currency.CreateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/currency/codec.proto#L14-L21)

## Validators

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/validators/model.go#L16): `uvalid:`
- `/validators` -> returns [x/validators.Accounts](https://github.com/iov-one/weave/blob/v0.21.0/x/validators/codec.proto#L14-L18) by `id`(8 bytes) or empty result
- `/validators?prefix` -> returns one or more `Accounts` that begin with that prefix
- **Message paths**
  - `validators/apply_diff` -> [x/validators.ApplyDiffMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/validators/codec.proto#L8-L13)

## Anti spam

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/msgfee/model.go#L48): `msgfee:`
- `/msgfee` -> returns [x/msgfee.MsgFee](https://github.com/iov-one/weave/blob/v0.21.0/x/msgfee/codec.proto#L9-L16) by `id`(8 bytes) or empty result
- `/msgfee?prefix` -> returns one or more `MsgFee` that begin with that prefix
- `/minfee` -> returns [x/msgfee.MsgFee](https://github.com/iov-one/weave/blob/v0.21.0/x/msgfee/codec.proto#L9-L16) by `id`(8 bytes) or empty result
- `/minfee?prefix` -> returns one or more `MsgFee` that begin with that prefix

## Governance

### Electorate

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/bucket.go#L17): `electorate:`
- `/electorate` -> returns [x/gov.Electorate](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L9-L24) by `id`(8 bytes) or empty result
- `/electorate?prefix` -> returns one or more `Electorate` that begin with that prefix
- **Message paths**
  - `gov/update_electorate` -> [x/gov.UpdateElectorateMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L249-L257)

### Elector

- Elector is a multikey index of electorate
- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/bucket.go#L18): `elector:`
- `/electorate/elector` -> returns [x/gov.Elector](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L24-L32) by `elector`(20 bytes address) or empty result
- `/electorate/elector?prefix` -> returns one or more `Elector` that begin with that prefix

### Election rules

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/bucket.go#L51): `electnrule:`
- `/electionRule` -> returns [x/gov.ElectionRule](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L33-L63) by `id`(8 bytes) or empty result
- `/electionRules?prefix` -> returns one or more `ElectionRule` that begin with that prefix
- **Message paths**
  - `gov/update_election_rule` -> [x/gov.UpdateElectionRuleMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L258-L279)
  - `gov/create_text_resolution` -> [x/gov.CreateTextResolutionMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L241-L247)

### Proposal

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/bucket.go#L77): `proposal:`
- `/proposal` -> returns [x/gov.Proposal](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L78-L116) by `id`(8 bytes) or empty result
- `/proposal?prefix` -> returns one or more `Proposal` that begin with that prefix
- **Message paths**
  - `gov/create_proposal` -> [x/gov.CreateProposalMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L185-L205)
  - `gov/delete_proposal` -> [x/gov.DeleteProposalMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L206-L211)

### Vote

- [key prefix](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/bucket.go#L186): `vote:`
- `/vote` -> returns [x/gov.Vote](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L169-L179) by `id`(8 bytes) or empty result
- `/vote?prefix` -> returns one or more `Vote` that begin with that prefix
- `/vote/proposal` -> returns [x/gov.Vote](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L169-L179) by `id`(8 bytes) or empty result
- `/vote/proposal?prefix` -> returns one or more `Vote` that begin with that prefix
  -- `/vote/elector` -> returns [x/gov.Vote](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L169-L179) by `id`(8 bytes) or empty result
- `/vote/elector?prefix` -> returns one or more `Vote` that begin with that prefix
- **Message paths**
  - `gov/vote` -> [x/gov.VoteMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L221-L231)
  - `gov/tally` -> [x/gov.TallyMsg](https://github.com/iov-one/weave/blob/v0.21.0/x/gov/codec.proto#L233-L239)
