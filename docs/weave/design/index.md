Protocol Documentation {#title}
======================

Table of Contents
-----------------

-   [app/results.proto](#app%2fresults.proto)
    -   [MResultSet](#app.ResultSet)
-   [cmd/bnsd/app/codec.proto](#cmd%2fbnsd%2fapp%2fcodec.proto)
    -   [MCronTask](#bnsd.CronTask)
    -   [MExecuteBatchMsg](#bnsd.ExecuteBatchMsg)
    -   [MExecuteBatchMsg.Union](#bnsd.ExecuteBatchMsg.Union)
    -   [MExecuteProposalBatchMsg](#bnsd.ExecuteProposalBatchMsg)
    -   [MExecuteProposalBatchMsg.Union](#bnsd.ExecuteProposalBatchMsg.Union)
    -   [MProposalOptions](#bnsd.ProposalOptions)
    -   [MTx](#bnsd.Tx)
-   [cmd/bnsd/x/username/codec.proto](#cmd%2fbnsd%2fx%2fusername%2fcodec.proto)
    -   [MBlockchainAddress](#username.BlockchainAddress)
    -   [MChangeTokenTargetsMsg](#username.ChangeTokenTargetsMsg)
    -   [MRegisterTokenMsg](#username.RegisterTokenMsg)
    -   [MToken](#username.Token)
    -   [MTransferTokenMsg](#username.TransferTokenMsg)
-   [codec.proto](#codec.proto)
    -   [MMetadata](#weave.Metadata)
    -   [MPubKey](#weave.PubKey)
    -   [MValidatorUpdate](#weave.ValidatorUpdate)
    -   [MValidatorUpdates](#weave.ValidatorUpdates)
-   [coin/codec.proto](#coin%2fcodec.proto)
    -   [MCoin](#coin.Coin)
-   [crypto/models.proto](#crypto%2fmodels.proto)
    -   [MPrivateKey](#crypto.PrivateKey)
    -   [MPublicKey](#crypto.PublicKey)
    -   [MSignature](#crypto.Signature)
-   [migration/codec.proto](#migration%2fcodec.proto)
    -   [MConfiguration](#migration.Configuration)
    -   [MSchema](#migration.Schema)
    -   [MUpgradeSchemaMsg](#migration.UpgradeSchemaMsg)
-   [orm/codec.proto](#orm%2fcodec.proto)
    -   [MCounter](#orm.Counter)
    -   [MMultiRef](#orm.MultiRef)
    -   [MVersionedIDRef](#orm.VersionedIDRef)
-   [x/aswap/codec.proto](#x%2faswap%2fcodec.proto)
    -   [MCreateMsg](#aswap.CreateMsg)
    -   [MReleaseMsg](#aswap.ReleaseMsg)
    -   [MReturnMsg](#aswap.ReturnMsg)
    -   [MSwap](#aswap.Swap)
-   [x/batch/codec.proto](#x%2fbatch%2fcodec.proto)
    -   [MByteArrayList](#batch.ByteArrayList)
-   [x/cash/codec.proto](#x%2fcash%2fcodec.proto)
    -   [MConfiguration](#cash.Configuration)
    -   [MFeeInfo](#cash.FeeInfo)
    -   [MSendMsg](#cash.SendMsg)
    -   [MSet](#cash.Set)
    -   [MUpdateConfigurationMsg](#cash.UpdateConfigurationMsg)
-   [x/cron/codec.proto](#x%2fcron%2fcodec.proto)
    -   [MTaskResult](#cron.TaskResult)
-   [x/currency/codec.proto](#x%2fcurrency%2fcodec.proto)
    -   [MCreateMsg](#currency.CreateMsg)
    -   [MTokenInfo](#currency.TokenInfo)
-   [x/distribution/codec.proto](#x%2fdistribution%2fcodec.proto)
    -   [MCreateMsg](#distribution.CreateMsg)
    -   [MDestination](#distribution.Destination)
    -   [MDistributeMsg](#distribution.DistributeMsg)
    -   [MResetMsg](#distribution.ResetMsg)
    -   [MRevenue](#distribution.Revenue)
-   [x/escrow/codec.proto](#x%2fescrow%2fcodec.proto)
    -   [MCreateMsg](#escrow.CreateMsg)
    -   [MEscrow](#escrow.Escrow)
    -   [MReleaseMsg](#escrow.ReleaseMsg)
    -   [MReturnMsg](#escrow.ReturnMsg)
    -   [MUpdatePartiesMsg](#escrow.UpdatePartiesMsg)
-   [x/gov/codec.proto](#x%2fgov%2fcodec.proto)
    -   [MCreateProposalMsg](#gov.CreateProposalMsg)
    -   [MCreateTextResolutionMsg](#gov.CreateTextResolutionMsg)
    -   [MDeleteProposalMsg](#gov.DeleteProposalMsg)
    -   [MElectionRule](#gov.ElectionRule)
    -   [MElector](#gov.Elector)
    -   [MElectorate](#gov.Electorate)
    -   [MFraction](#gov.Fraction)
    -   [MProposal](#gov.Proposal)
    -   [MResolution](#gov.Resolution)
    -   [MTallyMsg](#gov.TallyMsg)
    -   [MTallyResult](#gov.TallyResult)
    -   [MUpdateElectionRuleMsg](#gov.UpdateElectionRuleMsg)
    -   [MUpdateElectorateMsg](#gov.UpdateElectorateMsg)
    -   [MVote](#gov.Vote)
    -   [MVoteMsg](#gov.VoteMsg)
    -   [EProposal.ExecutorResult](#gov.Proposal.ExecutorResult)
    -   [EProposal.Result](#gov.Proposal.Result)
    -   [EProposal.Status](#gov.Proposal.Status)
    -   [EVoteOption](#gov.VoteOption)
-   [x/gov/sample\_test.proto](#x%2fgov%2fsample_test.proto)
    -   [MProposalOptions](#gov.ProposalOptions)
-   [x/msgfee/codec.proto](#x%2fmsgfee%2fcodec.proto)
    -   [MMsgFee](#msgfee.MsgFee)
-   [x/multisig/codec.proto](#x%2fmultisig%2fcodec.proto)
    -   [MContract](#multisig.Contract)
    -   [MCreateMsg](#multisig.CreateMsg)
    -   [MParticipant](#multisig.Participant)
    -   [MUpdateMsg](#multisig.UpdateMsg)
-   [x/paychan/codec.proto](#x%2fpaychan%2fcodec.proto)
    -   [MCloseMsg](#paychan.CloseMsg)
    -   [MCreateMsg](#paychan.CreateMsg)
    -   [MPayment](#paychan.Payment)
    -   [MPaymentChannel](#paychan.PaymentChannel)
    -   [MTransferMsg](#paychan.TransferMsg)
-   [x/sigs/codec.proto](#x%2fsigs%2fcodec.proto)
    -   [MBumpSequenceMsg](#sigs.BumpSequenceMsg)
    -   [MStdSignature](#sigs.StdSignature)
    -   [MUserData](#sigs.UserData)
-   [x/validators/codec.proto](#x%2fvalidators%2fcodec.proto)
    -   [MAccounts](#validators.Accounts)
    -   [MApplyDiffMsg](#validators.ApplyDiffMsg)
-   [Scalar Value Types](#scalar-value-types)

app/results.proto {#app/results.proto}
-----------------

[Top](#title)

### ResultSet {#app.ResultSet}

ResultSet contains a list of keys or values

Field

Type

Label

Description

results

[bytes](#bytes)

repeated

cmd/bnsd/app/codec.proto {#cmd/bnsd/app/codec.proto}
------------------------

[Top](#title)

### CronTask {#bnsd.CronTask}

CronTask is a format used by the CronMarshaler to marshal and unmarshal
cron

task.

When there is a gap in message sequence numbers - that most likely means
some

old fields got deprecated. This is done to maintain binary
compatibility.

Field

Type

Label

Description

authenticators

[bytes](#bytes)

repeated

Authenticators contains a list of conditions that authenticate execution
of this task. This is one of the main differences between the CronTask
and Tx entities. CronTask is created interanlly and does not have to be
signed. Because we use the same handlers as for the Tx to process a cron
task, we must provide authentication method. This attribute contains all
authentication conditions required for execution, that will be inserted
into the context.

escrow\_release\_msg

[escrow.ReleaseMsg](#escrow.ReleaseMsg)

escrow\_return\_msg

[escrow.ReturnMsg](#escrow.ReturnMsg)

distribution\_distribute\_msg

[distribution.DistributeMsg](#distribution.DistributeMsg)

aswap\_release\_msg

[aswap.ReleaseMsg](#aswap.ReleaseMsg)

gov\_tally\_msg

[gov.TallyMsg](#gov.TallyMsg)

### ExecuteBatchMsg {#bnsd.ExecuteBatchMsg}

ExecuteBatchMsg encapsulates multiple messages to support batch
transaction

Field

Type

Label

Description

messages

[ExecuteBatchMsg.Union](#bnsd.ExecuteBatchMsg.Union)

repeated

### ExecuteBatchMsg.Union {#bnsd.ExecuteBatchMsg.Union}

Field

Type

Label

Description

cash\_send\_msg

[cash.SendMsg](#cash.SendMsg)

escrow\_create\_msg

[escrow.CreateMsg](#escrow.CreateMsg)

escrow\_release\_msg

[escrow.ReleaseMsg](#escrow.ReleaseMsg)

escrow\_return\_msg

[escrow.ReturnMsg](#escrow.ReturnMsg)

escrow\_update\_parties\_msg

[escrow.UpdatePartiesMsg](#escrow.UpdatePartiesMsg)

multisig\_create\_msg

[multisig.CreateMsg](#multisig.CreateMsg)

multisig\_update\_msg

[multisig.UpdateMsg](#multisig.UpdateMsg)

validators\_apply\_diff\_msg

[validators.ApplyDiffMsg](#validators.ApplyDiffMsg)

currency\_create\_msg

[currency.CreateMsg](#currency.CreateMsg)

username\_register\_token\_msg

[username.RegisterTokenMsg](#username.RegisterTokenMsg)

No recursive batches!

username\_transfer\_token\_msg

[username.TransferTokenMsg](#username.TransferTokenMsg)

username\_change\_token\_targets\_msg

[username.ChangeTokenTargetsMsg](#username.ChangeTokenTargetsMsg)

distribution\_create\_msg

[distribution.CreateMsg](#distribution.CreateMsg)

distribution\_msg

[distribution.DistributeMsg](#distribution.DistributeMsg)

distribution\_reset\_msg

[distribution.ResetMsg](#distribution.ResetMsg)

upgrade schema is important enough, it should be a solo action aswap and
gov don't make much sense as part of a batch (no vote buying)

### ExecuteProposalBatchMsg {#bnsd.ExecuteProposalBatchMsg}

Field

Type

Label

Description

messages

[ExecuteProposalBatchMsg.Union](#bnsd.ExecuteProposalBatchMsg.Union)

repeated

### ExecuteProposalBatchMsg.Union {#bnsd.ExecuteProposalBatchMsg.Union}

Field

Type

Label

Description

send\_msg

[cash.SendMsg](#cash.SendMsg)

escrow\_release\_msg

[escrow.ReleaseMsg](#escrow.ReleaseMsg)

update\_escrow\_parties\_msg

[escrow.UpdatePartiesMsg](#escrow.UpdatePartiesMsg)

multisig\_update\_msg

[multisig.UpdateMsg](#multisig.UpdateMsg)

validators\_apply\_diff\_msg

[validators.ApplyDiffMsg](#validators.ApplyDiffMsg)

username\_register\_token\_msg

[username.RegisterTokenMsg](#username.RegisterTokenMsg)

no recursive batches

username\_transfer\_token\_msg

[username.TransferTokenMsg](#username.TransferTokenMsg)

username\_change\_token\_targets\_msg

[username.ChangeTokenTargetsMsg](#username.ChangeTokenTargetsMsg)

distribution\_create\_msg

[distribution.CreateMsg](#distribution.CreateMsg)

distribution\_msg

[distribution.DistributeMsg](#distribution.DistributeMsg)

distribution\_reset\_msg

[distribution.ResetMsg](#distribution.ResetMsg)

gov\_update\_electorate\_msg

[gov.UpdateElectorateMsg](#gov.UpdateElectorateMsg)

don't allow UpgradeSchema as part of a batch, as effects are too
confusing

gov\_update\_election\_rule\_msg

[gov.UpdateElectionRuleMsg](#gov.UpdateElectionRuleMsg)

gov\_create\_text\_resolution\_msg

[gov.CreateTextResolutionMsg](#gov.CreateTextResolutionMsg)

### ProposalOptions {#bnsd.ProposalOptions}

ProposalOptions are possible items that can be enacted by a governance
vote

Trimmed down somewhat arbitrary to what is believed to be reasonable

Field

Type

Label

Description

cash\_send\_msg

[cash.SendMsg](#cash.SendMsg)

escrow\_release\_msg

[escrow.ReleaseMsg](#escrow.ReleaseMsg)

update\_escrow\_parties\_msg

[escrow.UpdatePartiesMsg](#escrow.UpdatePartiesMsg)

multisig\_update\_msg

[multisig.UpdateMsg](#multisig.UpdateMsg)

validators\_apply\_diff\_msg

[validators.ApplyDiffMsg](#validators.ApplyDiffMsg)

currency\_create\_msg

[currency.CreateMsg](#currency.CreateMsg)

execute\_proposal\_batch\_msg

[ExecuteProposalBatchMsg](#bnsd.ExecuteProposalBatchMsg)

username\_register\_token\_msg

[username.RegisterTokenMsg](#username.RegisterTokenMsg)

username\_transfer\_token\_msg

[username.TransferTokenMsg](#username.TransferTokenMsg)

username\_change\_token\_targets\_msg

[username.ChangeTokenTargetsMsg](#username.ChangeTokenTargetsMsg)

distribution\_create\_msg

[distribution.CreateMsg](#distribution.CreateMsg)

distribution\_msg

[distribution.DistributeMsg](#distribution.DistributeMsg)

distribution\_reset\_msg

[distribution.ResetMsg](#distribution.ResetMsg)

migration\_upgrade\_schema\_msg

[migration.UpgradeSchemaMsg](#migration.UpgradeSchemaMsg)

gov\_update\_electorate\_msg

[gov.UpdateElectorateMsg](#gov.UpdateElectorateMsg)

gov\_update\_election\_rule\_msg

[gov.UpdateElectionRuleMsg](#gov.UpdateElectionRuleMsg)

gov\_create\_text\_resolution\_msg

[gov.CreateTextResolutionMsg](#gov.CreateTextResolutionMsg)

### Tx {#bnsd.Tx}

Tx contains the message.

When extending Tx, follow the rules:

- range 1-50 is reserved for middlewares,

- range 51-inf is reserved for different message types,

- keep the same numbers for the same message types in both bnsd and
other

applications. For example, FeeInfo field is used by both and indexed at

first position. Skip unused fields (leave index unused or comment out
for

clarity).

When there is a gap in message sequence numbers - that most likely means
some

old fields got deprecated. This is done to maintain binary
compatibility.

Field

Type

Label

Description

fees

[cash.FeeInfo](#cash.FeeInfo)

signatures

[sigs.StdSignature](#sigs.StdSignature)

repeated

multisig

[bytes](#bytes)

repeated

ID of a multisig contract.

cash\_send\_msg

[cash.SendMsg](#cash.SendMsg)

escrow\_create\_msg

[escrow.CreateMsg](#escrow.CreateMsg)

escrow\_release\_msg

[escrow.ReleaseMsg](#escrow.ReleaseMsg)

escrow\_return\_msg

[escrow.ReturnMsg](#escrow.ReturnMsg)

escrow\_update\_parties\_msg

[escrow.UpdatePartiesMsg](#escrow.UpdatePartiesMsg)

multisig\_create\_msg

[multisig.CreateMsg](#multisig.CreateMsg)

multisig\_update\_msg

[multisig.UpdateMsg](#multisig.UpdateMsg)

validators\_apply\_diff\_msg

[validators.ApplyDiffMsg](#validators.ApplyDiffMsg)

currency\_create\_msg

[currency.CreateMsg](#currency.CreateMsg)

execute\_batch\_msg

[ExecuteBatchMsg](#bnsd.ExecuteBatchMsg)

username\_register\_token\_msg

[username.RegisterTokenMsg](#username.RegisterTokenMsg)

username\_transfer\_token\_msg

[username.TransferTokenMsg](#username.TransferTokenMsg)

username\_change\_token\_targets\_msg

[username.ChangeTokenTargetsMsg](#username.ChangeTokenTargetsMsg)

distribution\_create\_msg

[distribution.CreateMsg](#distribution.CreateMsg)

distribution\_msg

[distribution.DistributeMsg](#distribution.DistributeMsg)

distribution\_reset\_msg

[distribution.ResetMsg](#distribution.ResetMsg)

migration\_upgrade\_schema\_msg

[migration.UpgradeSchemaMsg](#migration.UpgradeSchemaMsg)

aswap\_create\_msg

[aswap.CreateMsg](#aswap.CreateMsg)

aswap\_release\_msg

[aswap.ReleaseMsg](#aswap.ReleaseMsg)

aswap\_return\_msg

[aswap.ReturnMsg](#aswap.ReturnMsg)

gov\_create\_proposal\_msg

[gov.CreateProposalMsg](#gov.CreateProposalMsg)

gov\_delete\_proposal\_msg

[gov.DeleteProposalMsg](#gov.DeleteProposalMsg)

gov\_vote\_msg

[gov.VoteMsg](#gov.VoteMsg)

gov\_update\_electorate\_msg

[gov.UpdateElectorateMsg](#gov.UpdateElectorateMsg)

Tally is executed via cron only. gov.TallyMsg gov\_tally\_msg = 76;

gov\_update\_election\_rule\_msg

[gov.UpdateElectionRuleMsg](#gov.UpdateElectionRuleMsg)

79 is reserved (see ProposalOptions: TextResolutionMsg)

cmd/bnsd/x/username/codec.proto {#cmd/bnsd/x/username/codec.proto}
-------------------------------

[Top](#title)

### BlockchainAddress {#username.BlockchainAddress}

BlockchainAddress represents a blochain address. This structure clubs
together

blokchain ID together with an address on that network. It is used to
point

to an address on any blockchain network.

Field

Type

Label

Description

blockchain\_id

[string](#string)

An arbitrary blockchain ID.

address

[string](#string)

An address on the specified blockchain network. Address is not a
weave.Address as we cannot know what is the format of an address on the
chain that this token instance links to. Because we do not know the
rules to validate an address for any blockchain ID, this is an arbitrary
bulk of data. It is more convinient to always use encoded representation
of each address and store it as a string. Using bytes while compact is
not as comfortable to use.

### ChangeTokenTargetsMsg {#username.ChangeTokenTargetsMsg}

ChangeTokenTargetsMsg is a request to change the address that this token

points to. Only the owner of a token can request this operation.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

username

[string](#string)

Username is the unique name of the token, for example alice\*iov

new\_targets

[BlockchainAddress](#username.BlockchainAddress)

repeated

New targets is a list of blockchain addresses that this token should
point to after the change. Old list is overwritten with what is
provided.

### RegisterTokenMsg {#username.RegisterTokenMsg}

RegisterTokenMsg is creating a new username token. The owner is always
set

to the main signer.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

username

[string](#string)

Username is the unique name of the token, for example alice\*iov

targets

[BlockchainAddress](#username.BlockchainAddress)

repeated

Targets is a blockchain address list that this token should point to.

### Token {#username.Token}

Token model represents a username mapping to an address together with
all

metadata.

Each Token model is stored using the username as the key. This guarantee

that the name is unique. Username is a combination of a name and a
domain.

The format is \*

Each token points to a blockchain and an address on that blockchain.
Both

blockchain ID and address are an arbitrary string as we do not want to
limit

ourselves to certain patterns.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

targets

[BlockchainAddress](#username.BlockchainAddress)

repeated

Targets specifies where this username token points to. This must be at
least one blockchain address elemenet.

owner

[bytes](#bytes)

Owner is a weave.Address that controls this token. Only the owner can
modify a username token.

### TransferTokenMsg {#username.TransferTokenMsg}

TransferTokenMsg is a request to transfer an ownership of a token. The

mesage must be signed by the current token owner. Acceptance of the new

owner is not required in order to succeed.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

username

[string](#string)

Username is the unique name of the token, for example alice\*iov

new\_owner

[bytes](#bytes)

Owner is a weave address that will owns this token after the change.

codec.proto
-----------

[Top](#title)

### Metadata {#weave.Metadata}

Metadata is expected to be the first argument of every message or model.
It

contains all essential attributes.

Each protobuf message should be declared with the first attribute being

weave.Metadata metadata = 1;

Field

Type

Label

Description

schema

[uint32](#uint32)

### PubKey {#weave.PubKey}

PubKey represents a validator public key.

Field

Type

Label

Description

type

[string](#string)

data

[bytes](#bytes)

### ValidatorUpdate {#weave.ValidatorUpdate}

ValidatorUpdate represents an update to validator set.

Field

Type

Label

Description

pub\_key

[PubKey](#weave.PubKey)

power

[int64](#int64)

### ValidatorUpdates {#weave.ValidatorUpdates}

ValidatorUpdates represents latest validator state, currently used to
validate SetValidatorMsg transactions.

Field

Type

Label

Description

validator\_updates

[ValidatorUpdate](#weave.ValidatorUpdate)

repeated

coin/codec.proto {#coin/codec.proto}
----------------

[Top](#title)

### Coin {#coin.Coin}

Coin can hold any amount between -1 billion and +1 billion

at steps of 10\^-9. It is a fixed-point decimal

representation and uses integers to avoid rounding

associated with floats.

Every code has a denomination, which is just a

If you want anything more complex, you should write your

own type, possibly borrowing from this code.

Field

Type

Label

Description

whole

[int64](#int64)

Whole coins, -10\^15 \< integer \< 10\^15

fractional

[int64](#int64)

Billionth of coins. 0 \<= abs(fractional) \< 10\^9 If fractional != 0,
must have same sign as integer

ticker

[string](#string)

Ticker is 3-4 upper-case letters and all Coins of the same currency can
be combined

crypto/models.proto {#crypto/models.proto}
-------------------

[Top](#title)

### PrivateKey {#crypto.PrivateKey}

Field

Type

Label

Description

ed25519

[bytes](#bytes)

### PublicKey {#crypto.PublicKey}

Field

Type

Label

Description

ed25519

[bytes](#bytes)

### Signature {#crypto.Signature}

Field

Type

Label

Description

ed25519

[bytes](#bytes)

migration/codec.proto {#migration/codec.proto}
---------------------

[Top](#title)

### Configuration {#migration.Configuration}

Field

Type

Label

Description

admin

[bytes](#bytes)

Admin holds the address of the administrator allowed to upgrade schema
versions. If you wish to permit more than one entity to be an admin, use
multisig.

### Schema {#migration.Schema}

Schema declares the maxiumum supported schema version for a package.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

pkg

[string](#string)

Pkg holds the name of the package that this migration is declared for.
For example, for extension \`x/myext\` package value is \`myext\`

version

[uint32](#uint32)

Version holds the highest supported schema version.

### UpgradeSchemaMsg {#migration.UpgradeSchemaMsg}

UpgradeSchemaMsg is a request to upgrade schema version of a given
package

by one version.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

pkg

[string](#string)

Name of the package that schema version upgrade is made for.

orm/codec.proto {#orm/codec.proto}
---------------

[Top](#title)

### Counter {#orm.Counter}

Counter could be used for sequence, but mainly just for test

Field

Type

Label

Description

count

[int64](#int64)

### MultiRef {#orm.MultiRef}

MultiRef contains a list of references to pks

Field

Type

Label

Description

refs

[bytes](#bytes)

repeated

### VersionedIDRef {#orm.VersionedIDRef}

VersionedID is the combination of document ID and version number.

Field

Type

Label

Description

id

[bytes](#bytes)

Unique identifier

version

[uint32](#uint32)

Document version, starting with 1.

x/aswap/codec.proto {#x/aswap/codec.proto}
-------------------

[Top](#title)

### CreateMsg {#aswap.CreateMsg}

CreateMsg creates a Swap with some coins.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

source

[bytes](#bytes)

preimage\_hash

[bytes](#bytes)

sha256 hash of preimage, 32 bytes long

destination

[bytes](#bytes)

amount

[coin.Coin](#coin.Coin)

repeated

amount may contain multiple token types

timeout

[int64](#int64)

Timeout represents wall clock time.

memo

[string](#string)

max length 128 character

### ReleaseMsg {#aswap.ReleaseMsg}

ReleaseMsg releases the tokens to the destination.

This operation is authorized by preimage, which is sent raw and then
hashed on the backend.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

swap\_id

[bytes](#bytes)

swap\_id to release

preimage

[bytes](#bytes)

raw preimage to unlock swap, also helpful to retrieve the swap by it's
hashed version must be exactly 32 bytes long

### ReturnMsg {#aswap.ReturnMsg}

ReturnMsg releases the tokens to the source.

This operation only works if the Swap is expired.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

swap\_id

[bytes](#bytes)

swap\_id to return

### Swap {#aswap.Swap}

Swap is designed to hold some coins for atomic swap, locked by
preimage\_hash

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

metadata is used for schema versioning support

preimage\_hash

[bytes](#bytes)

sha256 hash of preimage, 32 bytes long

source

[bytes](#bytes)

source is a sender address

destination

[bytes](#bytes)

destination is an address of destination

timeout

[int64](#int64)

If unreleased before timeout, swap will return coins to source. Timeout
represents wall clock time as read from the block header. Timeout is
represented using POSIX time format. Expiration time is inclusive
meaning that the swap expires as soon as the current time is equal or
greater than timeout value. nonexpired: [created, timeout) expired:
[timeout, infinity)

memo

[string](#string)

max length 128 characters

address

[bytes](#bytes)

Address of this entity. Set during creation and does not change.

x/batch/codec.proto {#x/batch/codec.proto}
-------------------

[Top](#title)

### ByteArrayList {#batch.ByteArrayList}

Field

Type

Label

Description

elements

[bytes](#bytes)

repeated

x/cash/codec.proto {#x/cash/codec.proto}
------------------

[Top](#title)

### Configuration {#cash.Configuration}

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

owner

[bytes](#bytes)

Owner is present to implement gconf.OwnedConfig interface This defines
the Address that is allowed to update the Configuration object and is
needed to make use of gconf.NewUpdateConfigurationHandler

collector\_address

[bytes](#bytes)

minimal\_fee

[coin.Coin](#coin.Coin)

### FeeInfo {#cash.FeeInfo}

FeeInfo records who pays what fees to have this

message processed

Field

Type

Label

Description

payer

[bytes](#bytes)

fees

[coin.Coin](#coin.Coin)

### SendMsg {#cash.SendMsg}

SendMsg is a request to move these coins from the given

source to the given destination address.

memo is an optional human-readable message

ref is optional binary data, that can refer to another

eg. tx hash

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

source

[bytes](#bytes)

destination

[bytes](#bytes)

amount

[coin.Coin](#coin.Coin)

memo

[string](#string)

max length 128 character

ref

[bytes](#bytes)

max length 64 bytes

### Set {#cash.Set}

Set may contain Coin of many different currencies.

It handles adding and subtracting sets of currencies.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

coins

[coin.Coin](#coin.Coin)

repeated

### UpdateConfigurationMsg {#cash.UpdateConfigurationMsg}

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

patch

[Configuration](#cash.Configuration)

x/cron/codec.proto {#x/cron/codec.proto}
------------------

[Top](#title)

### TaskResult {#cron.TaskResult}

TaskResult is a publicly available information about task execution
result.

It is only created for those tasks that were executed.

Due to a bug in tendermint we must store this information ourselves
instead

of relying on the usual search via tag.

https://github.com/tendermint/tendermint/issues/3665

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

successful

[bool](#bool)

Successful is set to true if the task was successfully executed.

info

[string](#string)

Info contains any additinal information that might be useful to lean
more about the task execution.

exec\_time

[int64](#int64)

Exec time hold the information of when the task was executed.

exec\_height

[int64](#int64)

Exec height holds the block height value at the time the task was
executed.

x/currency/codec.proto {#x/currency/codec.proto}
----------------------

[Top](#title)

### CreateMsg {#currency.CreateMsg}

CreateMsg will register a new currency. Ticker (currency symbol) can

be registered only once.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

ticker

[string](#string)

name

[string](#string)

### TokenInfo {#currency.TokenInfo}

TokenInfo contains information about a single currency. It is used as an

alternative solution to hardcoding supported currencies information.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

name

[string](#string)

x/distribution/codec.proto {#x/distribution/codec.proto}
--------------------------

[Top](#title)

### CreateMsg {#distribution.CreateMsg}

CreateMsg is issuing the creation of a new revenue stream instance.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

admin

[bytes](#bytes)

Admin key belongs to the governance entities. It can be used to transfer
stored amount to an another account. While not enforced it is best to
use a multisig contract here.

destinations

[Destination](#distribution.Destination)

repeated

Destinations holds any number of addresses that the collected revenue is
distributed to. Must be at least one.

### Destination {#distribution.Destination}

Field

Type

Label

Description

address

[bytes](#bytes)

An address that the funds should be transferred to. This should not be
the validator addresses, as the keys used to sign blocks should never be
in a wallet. This can be the wallets of the admins of the validators.

weight

[int32](#int32)

Weight defines what part of the total revenue goes to this destination.
Each destination receives part of the total revenue amount proportional
to the weight. For example, if there are two destinations with weights 1
and 2 accordingly, distribution will be 1/3 to the first address and 2/3
to the second one.

### DistributeMsg {#distribution.DistributeMsg}

DistributeMsg is a request to distribute all funds collected within a
single

revenue instance. Revenue is distributed between destinations. Request
must be

signed using admin key.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

revenue\_id

[bytes](#bytes)

Revenue ID reference an ID of a revenue instance that the collected fees
should be distributed between destinations.

### ResetMsg {#distribution.ResetMsg}

ResetMsg change the configuration of a revenue instance.

To assure destinations that they will receive money, every revenue
update is

forcing funds distribution. Before applying any change all funds stored
by

the revenue account are distributed using old configuration. Only when
the

collected revenue amount is equal to zero the change is applied.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

revenue\_id

[bytes](#bytes)

Revenue ID reference an ID of a revenue instance that is updated.

destinations

[Destination](#distribution.Destination)

repeated

Destinations holds any number of addresses that the collected revenue is
distributed to. Must be at least one.

### Revenue {#distribution.Revenue}

Revenue represents an account with funds collected from the fees. This
is a

temporary account used for storing fees that are later distributed
between

the owners.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

admin

[bytes](#bytes)

Admin key belongs to the governance entities. It can be used to transfer
stored amount to an another account. While not enforced it is best to
use a multisig contract here.

destinations

[Destination](#distribution.Destination)

repeated

Destinations holds any number of addresses that the collected revenue is
distributed to. Must be at least one.

address

[bytes](#bytes)

Address of this entity. Set during creation and does not change.

x/escrow/codec.proto {#x/escrow/codec.proto}
--------------------

[Top](#title)

### CreateMsg {#escrow.CreateMsg}

CreateMsg is a request to create an Escrow with some tokens.

If source is not defined, it defaults to the first signer

The rest must be defined

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

source

[bytes](#bytes)

arbiter

[bytes](#bytes)

destination

[bytes](#bytes)

amount

[coin.Coin](#coin.Coin)

repeated

amount may contain multiple token types

timeout

[int64](#int64)

Timeout represents wall clock time.

memo

[string](#string)

max length 128 character

### Escrow {#escrow.Escrow}

Escrow holds some coins.

The arbiter or source can release them to the destination.

The destination can return them to the source.

Upon timeout, they will be returned to the source.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

source

[bytes](#bytes)

arbiter

[bytes](#bytes)

destination

[bytes](#bytes)

timeout

[int64](#int64)

If unreleased before timeout, escrow will return to source. Timeout
represents wall clock time as read from the block header. Timeout is
represented using POSIX time format. Expiration time is inclusive
meaning that the escrow expires as soon as the current time is equal or
greater than timeout value. nonexpired: [created, timeout) expired:
[timeout, infinity)

memo

[string](#string)

max length 128 character

address

[bytes](#bytes)

Address of this entity. Set during creation and does not change.

### ReleaseMsg {#escrow.ReleaseMsg}

ReleaseMsg releases the content to the destination.

Must be authorized by source or arbiter.

If amount not provided, defaults to entire escrow,

May be a subset of the current balance.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

escrow\_id

[bytes](#bytes)

amount

[coin.Coin](#coin.Coin)

repeated

### ReturnMsg {#escrow.ReturnMsg}

ReturnMsg returns the content to the source.

Must be authorized by the source or an expired timeout

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

escrow\_id

[bytes](#bytes)

### UpdatePartiesMsg {#escrow.UpdatePartiesMsg}

UpdatePartiesMsg changes any of the parties of the escrow:

source, arbiter, destination. This must be authorized by the current

holder of that position (eg. only source can update source).

Represents delegating responsibility

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

escrow\_id

[bytes](#bytes)

source

[bytes](#bytes)

arbiter

[bytes](#bytes)

destination

[bytes](#bytes)

x/gov/codec.proto {#x/gov/codec.proto}
-----------------

[Top](#title)

### CreateProposalMsg {#gov.CreateProposalMsg}

CreateProposalMsg creates a new governance proposal.

Most fields control the whole election process.

raw\_option contains an transaction to be executed by the governance
vote in case of success

(what is being voted on)

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

title

[string](#string)

Human readable title. Must match \`\^[a-zA-Z0-9 \_.-]{4,128}\$\`

raw\_option

[bytes](#bytes)

Content of the proposal. Protobuf encoded, app-specific decoded must be
passed in handler constructor

description

[string](#string)

Human readable description with 3 to 5000 chars.

election\_rule\_id

[bytes](#bytes)

ElectionRuleID is a reference to the election rule

start\_time

[int64](#int64)

Unix timestamp when the proposal starts. Must be in the future.

author

[bytes](#bytes)

Author is an optional field to set the address of the author with a
proposal. The author must sign the message. When not set it will default
to the main signer.

### CreateTextResolutionMsg {#gov.CreateTextResolutionMsg}

TextResolutionMsg is only intended to be dispatched internally from
election

results. It adds a resolution to the list of "approved" resolutions,

with a reference to the electorate that approved it

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

resolution

[string](#string)

### DeleteProposalMsg {#gov.DeleteProposalMsg}

DeleteProposalMsg deletes a governance proposal.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

proposal\_id

[bytes](#bytes)

ProposalID is the unique identifier of the proposal to delete

### ElectionRule {#gov.ElectionRule}

Election Rule defines how an election is run. A proposal must be voted
upon via a pre-defined ruleset.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

version

[uint32](#uint32)

Document version.

admin

[bytes](#bytes)

Admin is the address that is allowed to modify an existing election
rule.

electorate\_id

[bytes](#bytes)

ElectorateID references the electorate using this rule (without version,
as changing electorate changes the rule).

title

[string](#string)

Human readable title.

voting\_period

[uint32](#uint32)

Duration in seconds of how long the voting period will take place.

threshold

[Fraction](#gov.Fraction)

Threshold is the fraction of either all eligible voters or in case of a
quorum setup the fraction of all non abstained votes. To accept a
proposal this value must be exceeded with Yes votes. The formula applied
is: (yes \* denominator) \> (base \* numerator) with base total
electorate weight or Yes/No votes in case of quorum set The valid range
for the threshold value is \`0.5\` to \`1\` (inclusive) which allows any
value between half and all of the eligible voters.

quorum

[Fraction](#gov.Fraction)

The quorum fraction of eligible voters is based on the total electorate
weight and defines a threshold of votes that must be exceeded before the
acceptance threshold is applied. This value requires any kind of votes
and not only YES. The valid range for the threshold value is \`0.5\` to
\`1\` (inclusive) which allows any value between half and all of the
eligible voters.

address

[bytes](#bytes)

Address of this entity. Set during creation and does not change.

### Elector {#gov.Elector}

Elector clubs together a address with a weight. The greater the weight

the greater the power of a participant.

Field

Type

Label

Description

address

[bytes](#bytes)

The address of the voter.

weight

[uint32](#uint32)

Weight defines the power of the participants vote. max value is 65535
(2\^16-1).

### Electorate {#gov.Electorate}

Electorate defines who may vote in an election. This same group can be
used in many elections

and is stored for re-use

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

version

[uint32](#uint32)

Document version

admin

[bytes](#bytes)

Admin is the address that is allowed ot modify an existing electorate.

title

[string](#string)

Human readable title.

electors

[Elector](#gov.Elector)

repeated

Elector defines a list of all signatures that are allowed to participate
in a vote

total\_electorate\_weight

[uint64](#uint64)

TotalElectorateWeight is the sum of all electors weights.

### Fraction {#gov.Fraction}

The Fraction type represents a numerator and denominator to enable
higher precision thresholds in

the election rules. For example:

numerator: 1, denominator: 2 =\> \> 50%

numerator: 2, denominator: 3 =\> \> 66.666..%

numerator: 6273, denominator: 10000 =\> \> 62.73%

Valid range of the fraction is 0.5 to 1.

Field

Type

Label

Description

numerator

[uint32](#uint32)

The top number in a fraction.

denominator

[uint32](#uint32)

The bottom number

### Proposal {#gov.Proposal}

A generic proposal for an on-chain governance process.

Most fields control the whole election process.

raw\_option contains an transaction to be executed by the governance
vote in case of success

(what is being voted on)

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

title

[string](#string)

Human readable title.

raw\_option

[bytes](#bytes)

Content of the proposal. Protobuf encoded, app-specific decoded must be
passed in constructor

description

[string](#string)

Description of the proposal in text form.

election\_rule\_ref

[orm.VersionedIDRef](#orm.VersionedIDRef)

ElectionRuleRef is a reference to the election rule

electorate\_ref

[orm.VersionedIDRef](#orm.VersionedIDRef)

Reference to the electorate to define the group of possible voters.

voting\_start\_time

[int64](#int64)

Unix timestamp of the block where the voting period starts. Header time
of the votes must be greater than or equal to this start time.

voting\_end\_time

[int64](#int64)

Unix timestamp of the block where the voting period ends. Header times
of the votes must be before this end time to be included in the
election.

submission\_time

[int64](#int64)

Unix timestamp of the block where the proposal was added to the chain.

author

[bytes](#bytes)

Address of the author who created the proposal. If not set explicit on
creation it will default to the main signer.

vote\_state

[TallyResult](#gov.TallyResult)

Result of the election. Contains intermediate tally results while voting
period is open.

status

[Proposal.Status](#gov.Proposal.Status)

Status represents the high level position in the life cycle of the
proposal. Initial value is Submitted.

result

[Proposal.Result](#gov.Proposal.Result)

Result is the final result based on the votes and election rule. Initial
value is Undefined.

executor\_result

[Proposal.ExecutorResult](#gov.Proposal.ExecutorResult)

Result is the final result based on the votes and election rule. Initial
value is NotRun.

tally\_task\_id

[bytes](#bytes)

Tally task ID holds the ID of the asynchronous task that is scheduled to
create the tally once the voting period is over.

### Resolution {#gov.Resolution}

Resolution contains TextResolution and an electorate reference.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

proposal\_id

[bytes](#bytes)

electorate\_ref

[orm.VersionedIDRef](#orm.VersionedIDRef)

resolution

[string](#string)

### TallyMsg {#gov.TallyMsg}

TallyMsg can be sent after the voting period has ended to do the final
tally and trigger any state changes.

A final tally can be execute only once. A second submission will fail
with an invalid state error.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

proposal\_id

[bytes](#bytes)

ProposalID is UUID of the proposal to close.

### TallyResult {#gov.TallyResult}

TallyResult contains sums of the votes and all data for the final
result.

Field

Type

Label

Description

total\_yes

[uint64](#uint64)

TotalYes is the sum of weights of all the voters that approved the
proposal

total\_no

[uint64](#uint64)

TotalNo is the sum of weights of all the voters that rejected the
proposal

total\_abstain

[uint64](#uint64)

TotalAbstain is the sum of weights of all the voters that voted abstain

total\_electorate\_weight

[uint64](#uint64)

TotalElectorateWeight is the sum of all weights in the electorate.

quorum

[Fraction](#gov.Fraction)

Quorum when set is the fraction of the total electorate weight that must
be exceeded by total votes weight.

threshold

[Fraction](#gov.Fraction)

Threshold is the fraction of Yes votes of a base value that needs to be
exceeded to accept the proposal. The base value is either the total
electorate weight or the sum of Yes/No weights when a quorum is defined.

### UpdateElectionRuleMsg {#gov.UpdateElectionRuleMsg}

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

election\_rule\_id

[bytes](#bytes)

ElectionRuleID is a reference to the election rule

voting\_period

[uint32](#uint32)

Duration in seconds of how long the voting period will take place.

threshold

[Fraction](#gov.Fraction)

Threshold is the fraction of all eligible voters, not only the ones who
voted. To accept a proposal this value must be exceeded. The formula is
\`(yes\*denominator) \> (numerator\*total\_electors\_weight)\`. The
valid range for the threshold value is \`0.5\` to \`1\` (inclusive)
which allows any value between half and all of the eligible voters.

quorum

[Fraction](#gov.Fraction)

The quorum fraction of eligible voters is based on the total electorate
weight and defines a threshold of votes that must be exceeded before the
acceptance threshold is applied. This value requires any kind of votes
and not only YES. The valid range for the threshold value is \`0.5\` to
\`1\` (inclusive) which allows any value between half and all of the
eligible voters.

### UpdateElectorateMsg {#gov.UpdateElectorateMsg}

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

electorate\_id

[bytes](#bytes)

ElectorateID is the reference to the electorate that defines the group
of possible voters.

diff\_electors

[Elector](#gov.Elector)

repeated

DiffElectors contains the changes that should be applied. Adding an
address should have a positive weight, removing with weight=0.

### Vote {#gov.Vote}

Vote combines the elector and their voted option to archive them.

The proposalID and address is stored within the key.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

elector

[Elector](#gov.Elector)

Elector is who voted

voted

[VoteOption](#gov.VoteOption)

VoteOption is what they voted

### VoteMsg {#gov.VoteMsg}

VoteMsg is the way to express a voice and participate in an election of
a proposal on chain.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

proposal\_id

[bytes](#bytes)

The unique id of the proposal.

voter

[bytes](#bytes)

voter address is an optional field. When not set the main signer will be
used as default. The voter address must be included in the electorate
for a valid vote.

selected

[VoteOption](#gov.VoteOption)

Option for the vote. Must be Yes, No or Abstain for a valid vote.

### Proposal.ExecutorResult {#gov.Proposal.ExecutorResult}

Name

Number

Description

PROPOSAL\_EXECUTOR\_RESULT\_INVALID

0

An empty value is not allowed

PROPOSAL\_EXECUTOR\_RESULT\_NOT\_RUN

1

We have not yet run the executor

PROPOSAL\_EXECUTOR\_RESULT\_SUCCESS

2

The executor was successful and proposed action updated state

PROPOSAL\_EXECUTOR\_RESULT\_FAILURE

3

The executor returned an error and proposed action didn't update state

### Proposal.Result {#gov.Proposal.Result}

Name

Number

Description

PROPOSAL\_RESULT\_INVALID

0

An empty value is invalid and not allowed

PROPOSAL\_RESULT\_UNDEFINED

1

Until a final tally has happened the status is undefined

PROPOSAL\_RESULT\_ACCEPTED

2

Final result of the tally

PROPOSAL\_RESULT\_REJECTED

3

Final result of the tally

### Proposal.Status {#gov.Proposal.Status}

Name

Number

Description

PROPOSAL\_STATUS\_INVALID

0

An empty value is invalid and not allowed

PROPOSAL\_STATUS\_SUBMITTED

1

Initial status of a proposal when persisted.

PROPOSAL\_STATUS\_CLOSED

2

Final status of a proposal when the tally was executed

PROPOSAL\_STATUS\_WITHDRAWN

3

A proposal can be deleted before the voting start time by the owner.
When this happens the final status is Withdrawn.

### VoteOption {#gov.VoteOption}

VoteOptions define possible values for a vote including the INVALID
default.

Name

Number

Description

VOTE\_OPTION\_INVALID

0

VOTE\_OPTION\_YES

1

VOTE\_OPTION\_NO

2

VOTE\_OPTION\_ABSTAIN

3

x/gov/sample\_test.proto {#x/gov/sample_test.proto}
------------------------

[Top](#title)

### ProposalOptions {#gov.ProposalOptions}

ProposalOptions is a sum type of all possible messages that

may be dispatched via a governance proposal.

For the test case, we only refer to package-internal messages

and handlers, but an application can reference messages from any
package.

Field

Type

Label

Description

text

[CreateTextResolutionMsg](#gov.CreateTextResolutionMsg)

electorate

[UpdateElectorateMsg](#gov.UpdateElectorateMsg)

rule

[UpdateElectionRuleMsg](#gov.UpdateElectionRuleMsg)

x/msgfee/codec.proto {#x/msgfee/codec.proto}
--------------------

[Top](#title)

### MsgFee {#msgfee.MsgFee}

MsgFee represents a fee for a single message that must be paid in order
for

the message to be processed.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

msg\_path

[string](#string)

fee

[coin.Coin](#coin.Coin)

x/multisig/codec.proto {#x/multisig/codec.proto}
----------------------

[Top](#title)

### Contract {#multisig.Contract}

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

participants

[Participant](#multisig.Participant)

repeated

Participants defines a list of all signatures that are allowed to sign
the contract.

activation\_threshold

[uint32](#uint32)

Activation threshold defines the minimal weight value that must be
provided from participants in order to activate the contract. Weight is
computed as the sum of weights of all participating signatures.

admin\_threshold

[uint32](#uint32)

Admin threshold defines the minimal weight value that must be provided
from participants in order to administrate the contract. Weight is
computed as the sum of weights of all participating signatures.

address

[bytes](#bytes)

Address of this entity. Set during creation and does not change.

### CreateMsg {#multisig.CreateMsg}

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

participants

[Participant](#multisig.Participant)

repeated

activation\_threshold

[uint32](#uint32)

admin\_threshold

[uint32](#uint32)

### Participant {#multisig.Participant}

Participant clubs together a signature with a weight. The greater the
weight

the greater the power of a signature.

Field

Type

Label

Description

signature

[bytes](#bytes)

weight

[uint32](#uint32)

### UpdateMsg {#multisig.UpdateMsg}

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

contract\_id

[bytes](#bytes)

participants

[Participant](#multisig.Participant)

repeated

activation\_threshold

[uint32](#uint32)

admin\_threshold

[uint32](#uint32)

x/paychan/codec.proto {#x/paychan/codec.proto}
---------------------

[Top](#title)

### CloseMsg {#paychan.CloseMsg}

CloseMsg close a payment channel and release remaining founds

by sending them back to the source account.

Destination account can close channel at any moment.

Source can close channel only if the timeout was reached.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

channel\_id

[bytes](#bytes)

memo

[string](#string)

Max length 128 character.

### CreateMsg {#paychan.CreateMsg}

CreateMsg creates a new payment channel that can be used to

transfer value between two parties.

Total amount will be taken from the sources account and allocated for
user

in the transactions done via created payment channel.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

source

[bytes](#bytes)

Source address (weave.Address).

source\_pubkey

[crypto.PublicKey](#crypto.PublicKey)

Source public key is for validating transfer message signature.

destination

[bytes](#bytes)

Destination address (weave.Address).

total

[coin.Coin](#coin.Coin)

Maximum amount that can be transferred via this channel.

timeout

[int64](#int64)

If reached, channel can be closed by anyone.

memo

[string](#string)

Max length 128 character.

### Payment {#paychan.Payment}

Payment is created by the source. Source should give the message to the

destination, so that it can be redeemed at any time.

Each Payment should be created with amount greater than the previous
one.

Field

Type

Label

Description

chain\_id

[string](#string)

channel\_id

[bytes](#bytes)

amount

[coin.Coin](#coin.Coin)

memo

[string](#string)

Max length 128 character.

### PaymentChannel {#paychan.PaymentChannel}

PaymentChannel holds the state of a payment channel during its lifetime.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

source

[bytes](#bytes)

Source is the source that the founds are allocated from.

source\_pubkey

[crypto.PublicKey](#crypto.PublicKey)

Source public key is a key that must be used to verify signature of
transfer message. Source creates signed transfer messages and gives them
to the destination. Signature prevents from altering transfer message.

destination

[bytes](#bytes)

Destination is the party that receives payments through this channel

total

[coin.Coin](#coin.Coin)

Total represents a maximum value that can be transferred via this
payment channel.

timeout

[int64](#int64)

Timeout represents wall clock time as read from the block header.
Timeout is represented using POSIX time format. Expiration time is
inclusive meaning that the paychan expires as soon as the current time
is equal or greater than timeout value. nonexpired: [created, timeout)
expired: [timeout, infinity)

memo

[string](#string)

Max length 128 character.

transferred

[coin.Coin](#coin.Coin)

Transferred represents total amount that was transferred using allocated
(total) value. Transferred must never exceed total value.

address

[bytes](#bytes)

Address of this entity. Set during creation and does not change.

### TransferMsg {#paychan.TransferMsg}

TransferMsg binds Payment with a signature created using

sources private key.

Signature is there to ensure that payment message was not altered.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

payment

[Payment](#paychan.Payment)

signature

[crypto.Signature](#crypto.Signature)

x/sigs/codec.proto {#x/sigs/codec.proto}
------------------

[Top](#title)

### BumpSequenceMsg {#sigs.BumpSequenceMsg}

BumpSequenceMsg increments a sequence counter by given amount for a user

that signed the transaction.

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

increment

[uint32](#uint32)

Increment represents the value by which a sequence value will be
increased. Minumum value is one and maxium value must not be greater
than 1000. Each transaction increments the sequence by one. This value
represents the total increment value, including the default increment.

### StdSignature {#sigs.StdSignature}

StdSignature represents the signature, the identity of the signer

(the Pubkey), and a sequence number to prevent replay attacks.

A given signer must submit transactions with the sequence number

increasing by 1 each time (starting at 0)

Field

Type

Label

Description

sequence

[int64](#int64)

pubkey

[crypto.PublicKey](#crypto.PublicKey)

signature

[crypto.Signature](#crypto.Signature)

Removed Address, Pubkey is more powerful

### UserData {#sigs.UserData}

UserData just stores the data and is used for serialization.

Key is the Address (PubKey.Permission().Address())

Note: This should not be created from outside the module,

User is the entry point you want

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

pubkey

[crypto.PublicKey](#crypto.PublicKey)

sequence

[int64](#int64)

x/validators/codec.proto {#x/validators/codec.proto}
------------------------

[Top](#title)

### Accounts {#validators.Accounts}

Accounts is a list of accounts allowed to update validators

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

addresses

[bytes](#bytes)

repeated

### ApplyDiffMsg {#validators.ApplyDiffMsg}

ApplyDiffMsg is designed to update validator power

Field

Type

Label

Description

metadata

[weave.Metadata](#weave.Metadata)

validator\_updates

[weave.ValidatorUpdate](#weave.ValidatorUpdate)

repeated

Scalar Value Types
------------------

.proto Type

Notes

C++ Type

Java Type

Python Type

double

double

double

float

float

float

float

float

int32

Uses variable-length encoding. Inefficient for encoding negative numbers
– if your field is likely to have negative values, use sint32 instead.

int32

int

int

int64

Uses variable-length encoding. Inefficient for encoding negative numbers
– if your field is likely to have negative values, use sint64 instead.

int64

long

int/long

uint32

Uses variable-length encoding.

uint32

int

int/long

uint64

Uses variable-length encoding.

uint64

long

int/long

sint32

Uses variable-length encoding. Signed int value. These more efficiently
encode negative numbers than regular int32s.

int32

int

int

sint64

Uses variable-length encoding. Signed int value. These more efficiently
encode negative numbers than regular int64s.

int64

long

int/long

fixed32

Always four bytes. More efficient than uint32 if values are often
greater than 2\^28.

uint32

int

int

fixed64

Always eight bytes. More efficient than uint64 if values are often
greater than 2\^56.

uint64

long

int/long

sfixed32

Always four bytes.

int32

int

int

sfixed64

Always eight bytes.

int64

long

int/long

bool

bool

boolean

boolean

string

A string must always contain UTF-8 encoded or 7-bit ASCII text.

string

String

str/unicode

bytes

May contain any arbitrary sequence of bytes.

string

ByteString

str
