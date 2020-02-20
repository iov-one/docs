---
id: iov-core
title: IOV Core
sidebar_label: IOV Core
---

In case you are using javascript, you can query, register and edit a starname such as `antoine*iov` using [IOV Core](https://github.com/iov-one/iov-core).

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
const { connection } = await signer.addChain(createBnsConnector("ws://rpc-private-a-x-exchangenet.iov.one:16657"));
const chainId = connection.chainId;
chainId
```
yields
```ts
>‘iov-exchangenet’
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

## Get Some IOV Tokens

We are connected to iov-exchangenet (testnet), so we can use iov faucet to get some tokens

```ts
const faucet = new IovFaucet("http://faucet.x-exchangenet.iov.one:8080/");
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
    [ { quantity: '500000000000',
        fractionalDigits: 9,
        tokenTicker: 'IOV' } ],
  pubkey: undefined }
```

## Register a starname in the IOV Name Service

Now is time to use one of the IOV Name Service's value propositions: a human readable address that works as a non-fungible token and allows storage of multiple addresses from multiple blockchains.

From a marketing perspective, a starname has multiple [personalities](/docs/intro#what-is-a-starname).  From a technical perspective, a starname consists of a `domain`, which is on the right of the `*`, and `name`, which is on the left of the `*`.  Together `name*domain` are an `account`.  Accounts are created within a domain, so we have to register our domain to get started.

First we need to create the transaction body:

```ts
.editor // initiate a multi-line editor mode

const registerDomainTx = await connection.withDefaultFee<RegisterDomainTx>({
  kind: "bns/register_domain",
  chainId: chainId,
  domain: `domain${Math.floor(Math.random()*10e9)}`,
  admin: myAddress,
  hasSuperuser: true,
  msgFees: [],
  accountRenew: 100,
  },
  myAddress,
);

^D // Ctrl-d to finish the editor mode
```

Now we sign, post and confirm the transaction

```ts
await signer.signAndPost(myIdentity, registerDomainTx);
// wait a few seconds for your transaction to be executed
const bnsConnection = connection as BnsConnection;
const myDomains = await bnsConnection.getDomains({ admin: myAddress });
myDomains
```
yields
```ts
[
  {
    domain: 'domain7374968770',
    admin: 'tiov1f75ge60msmn6p0su9wsp3k7lknfptadjef7f36',
    validUntil: 1613761734,
    hasSuperuser: true,
    msgFees: [],
    accountRenew: 100
  }
]

```
Now that you have a domain you can register a name within it in order to create an account.  The procedure is effectively identical to that above, but with the `RegisterAccountTx` transaction:
```ts
.editor // initiate a multi-line editor mode

const registerAccountTx = await connection.withDefaultFee<RegisterAccountTx>({
  kind: "bns/register_account",
  chainId: chainId,
  domain: myDomains[0].domain,
  name: "many_accounts_per_domain",
  owner: myAddress,
  targets: [
    {
      chainId: "cosmos:cosmoshub-3" as ChainId,
      address: "cosmos1ylz6tqpgz0flpl6h5szmj6mmzyr598rqe3908y" as Address
    },
    {
      chainId: "bip122:000000000019d6689c085ae165831e93" as ChainId, // bitcoin
      address: "3QJev38iDbvdaM4DoWkGoKyQTYAXv812RY" as Address
    },
  ],
  },
  myAddress,
);

^D // Ctrl-d to finish the editor mode
```

Now we sign, post and confirm the transaction

```ts
await signer.signAndPost(myIdentity, registerAccountTx);
// wait a few seconds for your transaction to be executed
const myAccounts = await bnsConnection.getAccounts({ owner: myAddress });
myAccounts
```
yields
```ts
[
  {
    domain: 'domain7374968770',
    name: undefined,
    owner: 'tiov1f75ge60msmn6p0su9wsp3k7lknfptadjef7f36',
    validUntil: 1582204234,
    targets: [],
    certificates: []
  },
  {
    domain: 'domain7374968770',
    name: 'many_accounts_per_domain',
    owner: 'tiov1f75ge60msmn6p0su9wsp3k7lknfptadjef7f36',
    validUntil: 1582205781,
    targets: [ [Object], [Object] ],
    certificates: []
  }
]
```
and
```ts
myAccounts[1].targets
```
yields
```ts
[
  {
    chainId: 'cosmos:cosmoshub-3',
    address: 'cosmos1ylz6tqpgz0flpl6h5szmj6mmzyr598rqe3908y'
  },
  {
    chainId: 'bip122:000000000019d6689c085ae165831e93',
    address: '3QJev38iDbvdaM4DoWkGoKyQTYAXv812RY'
  }
]
```


That is it! Welcome to the world of starnames! :)

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

Now that we have the list of addresses registered by the user in `recipientData`, we will search for a specific address in a specific chain (“iov-exchangenet” chain in this case)

```ts
const recipientChainAddressPair = recipientData[0].targets.find(chainaddrPair => chainaddrPair.chainId === 'iov-exchangenet');
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
