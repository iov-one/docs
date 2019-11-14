---
id: faq
title: Validator FAQ
sidebar_label: FAQ
---

## How do I make my full-node a validator?

A validator is added to the validator set by governance, so you cannot directly add your validator to the set.  Instead, run `curl --silent --fail 'http://localhost:16657/status' | jq -r .result.validator_info.pub_key.value` on your validator and submit the resulting 44 character pub_key to IOV via the ticket that was created when you applied for the validator program.  Once we have your validator's pub_key then governance will add it to the validator set.

## Why is my validator's voting_power only one when I see others with more than one?

IOV runs validator(s) with higher voting_power on testnets so that the chain doesn't get halted if other validators go offline.

## How do I create an address for IOV tokens?

Install the <a href="https://chrome.google.com/webstore/detail/neuma/gegmganblgchemddleocdoadmljledcj" target="blank_">Neuma</a> browser extension and then browse to <a href="https://wallet.iov.one" target="blank_">https://wallet.iov.one</a>.
