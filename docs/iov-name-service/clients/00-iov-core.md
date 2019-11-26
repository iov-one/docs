---
id: iov-core
title: IOV Core
sidebar_label: IOV Core
---

When you are building a web-based application, a desktop application or a block explorer, the natural way to connect to the IOV Name Service is to use the multi-package typescript library: [IOV Core](https://github.com/iov-one/iov-core).

## What is IOV Core?

[IOV Core](https://github.com/iov-one/iov-core) is a powerful typescript library which contains multiple packages to:
- manage all your private keys with [iov-keycontrol](https://github.com/iov-one/iov-core/tree/master/packages/iov-keycontrol)
- connect to the IOV Name Service with [iov-bns](https://github.com/iov-one/iov-core/tree/master/packages/iov-bns)
- experiment with all its features using a CLI with [iov-cli](https://github.com/iov-one/iov-core/tree/master/packages/iov-cli)

And also:

- connect to different chains with [iov-multichain](https://github.com/iov-one/iov-core/tree/master/packages/iov-multichain) including Ethereum with [iov-ethereum](https://github.com/iov-one/iov-core/tree/master/packages/iov-ethereum)

## Using iov-cli From IOV Core To Connect To The IOV Name Service

The best way to understand how IOV Core (v. 16.0) works and how you can create a human readable address such as `antoine*iov` which is linked to an Cosmos address for example is to use the [iov-cli](https://github.com/iov-one/iov-core/tree/master/packages/iov-cli) and follow the readme below:

## Setup

> *You need npm and terminal access to complete this tutorial.*

In order to have access to iov-cli, we need to install it, so let's create a small project and add package dependencies

```bash
mkdir mycliwallet
cd mycliwallet
npm init -yes
npm install @iov/cli
```

> *You can also install iov-cli globally, or using yarn, just check [this link](https://github.com/iov-one/iov-core/tree/master/packages/iov-cli#installation-and-first-run) for more details*

Is time to start our cli, in the same terminal that we added the package, execute:

```sh
./node_modules/.bin/iov-cli
>>
```

Now we have access to our iov terminal session.
> *You will see a list of functions that are available to use. They are grouped by package and export some of IOV Core functionality*

## Initial Configuration

Time to write some code in our iov terminal.
If we want to use a cli wallet, we need:

a profile and a connection to a testnet

```ts
const profile = new UserProfile();
const signer = new MultiChainSigner(profile);
const { connection } = await signer.addChain(createBnsConnector("wss://rpc-private-a-x-dancenet.iov.one"));
const chainId = connection.chainId();
chainId
```
yields
```ts
>‘iov-dancenet’
```

a wallet and an IOV address connected to our profile. We will generate a random mnemonic

```ts
const randomEntropy = Random.getBytes(32);
const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await randomEntropy));
const myIdentity = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(0));
const myAddress = signer.identityToAddress(myIdentity);
console.log("secret random mnemonic: ", profile.printableSecret(wallet.id));
```

If you want to know my secret (doo da do), it was:

```nme
company buddy electric crouch boss noble lift machine other unfair toilet pill barely mass sunny beach lamp release ancient call zoo mask grit puppy
```

and myAddress:

```
tiov1azf4469g720ea3pzgtctz7tm9ema7kgft7pyqf
```

## Get Some IOV Tokens On My Account

We are connected to iov-dancenet (testnet), so we can use iov faucet to get some tokens

```ts
const faucet = new IovFaucet("https://faucet.x-dancenet.iov.one/");
await faucet.credit(myAddress, "IOV" as TokenTicker);
```

Check that the account has some tokens now

```ts
let myAccount = await connection.getAccount({ address: myAddress });
myAccount
```
yeilds
```ts
>> { address: 'tiov1azf4469g720ea3pzgtctz7tm9ema7kgft7pyqf',
  balance:
    [ { quantity: '10000000000',
        fractionalDigits: 9,
        tokenTicker: 'IOV' } ],
  pubkey: undefined }
```

## Register a Name in IOV Name Service

Now is time to use one of the iov value propositions: a human readable address that works as a non fungible token and allows storage of multiple addresses from multiple blockchains

First we need to create the transaction body. You can add as many chainId/address pairs a you like, following the list template below:
> *use your username here, mine is already taken ;)*

```ts
.editor // initiate a multi-line editor mode

const registrationTx = await connection.withDefaultFee<RegisterUsernameTx& WithCreator>({
  kind: "bns/register_username",
  creator: myIdentity,
  targets: [
    { chainId: chainId, address: myAddress },
    { chainId: "cosmoshub-3" as ChainId, address: "cosmos17w5kw28te7r5vn4qu08hu6a4crcvwrrgzmsrrn" as Address}
  ],
  username: "antoine*iov",
});

^D // Ctrl-d to finish the editor mode
```

Now we sign, post and confirm the transaction

```ts
await signer.signAndPost(registrationTx);
const bnsConnection = connection as BnsConnection;
const myAccountBNS  = await bnsConnection.getUsernames({ owner: myAddress });
myAccountBNS
```
yields
```ts
>> [ { id: 'antoine*iov',
       owner: 'tiov188ayx37py2r86wz5a4a2vrn4ejrwhnnte4n7kc',
       targets: [ [Object], [Object] ]
       }]
```
and
```ts
myAccountBNS[0].targets
```
yields
```ts
>> [ { chainId: 'iov-dancenet', address: 'tiov1azf4469g720ea3pzgtctz7tm9ema7kgft7pyqf' }, { chainId: 'cosmoshub-3', address: 'cosmos17w5kw28te7r5vn4qu08hu6a4crcvwrrgzmsrrn' } ]
```

That is it! Welcome to the world of Personalized Names :)

## Extra Mile: Send IOV Tokens to a Personalized Name

To showcase the importance of a human friendly name address, we will send some tokens from a new account, to the Personalized Name previously generated into IOV Name Service

Open a new terminal in `mycliwallet` and run `./node_modules/.bin/iov-cli`.

Repeat the steps from **Initial Configuration** and **Get some IOV tokens on my account**.

First, we need to get the recipient personalized address (“antoine*iov” in this case)

```ts
const recipientData = await bnsConnection.getUsernames({ username: "antoine*iov" });
recipientData
```
yields
```ts
>> [ { id: 'antoine*iov',
    owner: 'tiov166jr0qk6arhq7rj7acjmfgyx0p48x8vw3zvmry',
    targets: [ [Object], [Object] ] } ]
```

> *YES!! You got it!! We search by username, no need to copy/paste/barcode scan string addresses*

Now that we have the list of addresses registered by the user in `recipientData`, we will search for a specific address in a specific chain (“iov-dancenet” chain in this case)

```ts
const recipientChainAddressPair = recipientData[0].targets.find(chainaddrPair => chainaddrPair.chainId === 'iov-dancenet');
```

Create the transaction

```ts
.editor // initiate a multi-line editor mode

const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
  kind: "bcp/send",
  creator: myIdentity,
  sender: bnsCodec.identityToAddress(myIdentity),
  recipient: recipientChainAddressPair.address,
  memo: "My first transaction by username B-)",
  amount: {
    quantity: "100000",
    fractionalDigits: 9,
    tokenTicker: "IOV" as TokenTicker,
  }
});

^D // Ctrl-d to finish the editor mode
```

Now we sign, post and confirm the transaction

```ts
await signer.signAndPost(sendTx);
(await connection.getAccount({ address: myAddress })).balance;
```

Your balance should be “9799900000”. And if you just sent IOV tokens to antoine*iov, thank you!
