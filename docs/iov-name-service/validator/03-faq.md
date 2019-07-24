---
id: faq
title: Validator FAQ
sidebar_label: FAQ
---

## How do I make my full-node a validator?

A validator is added to the validator set by governance, so you cannot directly add your validator to the set.  Instead, run `curl --silent --fail 'http://localhost:16657/status' | jq -r .result.validator_info.pub_key.value` on your validator and submit the resulting 44 character pub_key to IOV via the ticket that was created when you applied for the validator program.  Once we have your validator's pub_key then we'll add it to the validator set.

## Why is my validator's voting_power only one when I see others with more than one?

IOV runs validators with higher voting_power so that the chain doesn't get halted if other validators go offline.

## How do I create an address for IOV tokens?

At the time of writing, you need to use [iov-core](https://github.com/iov-one/iov-core/blob/3bbcf3c07679f2a0b09db3bf26dd59cc8de17f78/packages/iov-core/README.md).  In the near future you'll be able to use a web app as your wallet that'll be able to create and address, register names, and send tokens.
