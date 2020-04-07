---
id: protoc-generation-spec
title: Generate proto code from Weave specification
sidebar_label: Generate proto code
---

IOV Name Service uses protobuf for handling communications.

A good starting point would be to check out the _proto_ files and become familiar with what they are and how they look.

## Protocol buffers

Let's start with explaining what protobufs are and how to use them:

> Protocol Buffers (a.k.a., protobuf) are Google's language-neutral, platform-neutral, extensible mechanism for serializing structured data.

In a nutshell, protobuf is an effective and easy-to-use serialization format. To use it define protoc definitions(_.proto_) and then compile them to the desired language which protocol buffers [supports](https://developers.google.com/protocol-buffers/docs/tutorials). After these steps, high tech comms is ready to be used in your software.

To connect to Weave based applications, first you need to be able to generate proto code using [Weave spec](https://github.com/iov-one/weave/tree/v1.0.0/spec).

When you take a look at spec folder you will see multiple directories that serves different purposes

- [spec/gogo](https://github.com/iov-one/weave/tree/v1.0.0/spec/gogo) contains gogo proto annotations that are pretty useful when generating better shaped go code.
- [spec/proto](https://github.com/iov-one/weave/tree/v1.0.0/spec/gogo) contains bare proto definitions that could be used to generate code for various languages that has protoc generator or plugin.

If you are aiming to use go, we are happy with gogo plugin and we advise you use gogo spec folder for proto code generation. Here is an example for this case: [blog-tutorial](https://github.com/iov-one/blog-tutorial/).

## Steps

You can see the output of the steps below here: [blog-tutorial](https://github.com/iov-one/blog-tutorial/), [Cosmostation java integration](https://github.com/cosmostation/cosmostation-mobile/tree/master/Cosmos-Android/app/src/main/java/wannabit/io/cosmostaion/iov-one/bns), [Cosmostation swift integration](https://github.com/cosmostation/cosmostation-mobile/tree/master/Cosmos-IOS/Cosmostation/Cosmostation/IOV/bns)

### Install protoc/prototool

Instead of using bare protoc, We recommend using prototool if your language is supported by the project. [Check it out here](https://github.com/uber/prototool/blob/dev/etc/config/example/prototool.yaml#L129-L190). If your language is in the list you are very lucky and saved a lot of manual future work. You can use [prototool docker](https://github.com/iov-one/prototool-docker) for more convenient usage. Prototool contains protoc as dependency so no need to install protoc individually. If not, download prototool again but not the docker version. We will need it later.
You can install protoc compiler [here](https://github.com/protocolbuffers/protobuf#protocol-compiler-installation).

### Download the spec folder

Downloading for go code is fairly simple. You can take a look at [blog-tutorial/makefile](https://github.com/iov-one/blog-tutorial/blob/master/Makefile#L20). `import-spec` command gets the spec folder based on the Weave version is based on.

On the other hand for other languages than go, you have to download the spec manually or by an automated script. We provide spec folder in [releases](https://github.com/iov-one/weave/releases/tag/v1.0.0). You can download it down below in that page.

### Import prototool.yaml

Even if prototool does not support your language, it is still very useful. Normally with protoc you have to [feed protoc dependencies](https://developers.google.com/protocol-buffers/docs/javatutorial#compiling-your-protocol-buffers) with `-I` argument to protoc. This is pretty much the same in other language plugins. But it is very time consuming to do with hand. So instead of writing this script manually, you can get the protoc commands that are run by prototool in the background with `prototool generate --dry-run`. After that with some bash string manipulation you are ready to generate code.

### Generating code

With prototool, generation is simple: Go to the folder that contains `prototool.yaml` (folder you want to generate the code to) and the run `prototool generate`. You can tweak the prototool configuration (such as generated code directory) to suit your needs.
But without prototool, it is bit more work. After getting the `prototool generate --dry-run`, change the `--java_out` or `--go_out` to output argument that is used by protoc plugin you choose. Note: there could be more configuration or arguments to make it work. Read the plugin manual :)

Now as output you should have something like:

```bash
/Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/bin/protoc -I /spec_folder/IOV/bns/spec/proto -I /Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/include --haskell_out=/spec_folder/IOV/bns/gen/swift /spec_folder/IOV/bns/spec/proto/cmd/bnsd/x/account/codec.proto
/Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/bin/protoc -I /spec_folder/IOV/bns/spec/proto -I /Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/include --haskell_out=/spec_folder/IOV/bns/gen/swift /spec_folder/IOV/bns/spec/proto/x/sigs/codec.proto
/Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/bin/protoc -I /spec_folder/IOV/bns/spec/proto -I /Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/include --haskell_out=/spec_folder/IOV/bns/gen/swift /spec_folder/IOV/bns/spec/proto/x/gov/codec.proto /spec_folder/IOV/bns/spec/proto/x/gov/sample_test.proto
/Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/bin/protoc -I /spec_folder/IOV/bns/spec/proto -I /Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/include --haskell_out=/spec_folder/IOV/bns/gen/swift /spec_folder/IOV/bns/spec/proto/crypto/models.proto
/Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/bin/protoc -I /spec_folder/IOV/bns/spec/proto -I /Users/username/Library/Caches/prototool/Darwin/x86_64/protobuf/3.7.1/include --haskell_out=/spec_folder/IOV/bns/gen/swift /spec_folder/IOV/bns/spec/proto/x/txfee/codec.proto ....
...
```

After copy-pasting this command to terminal, generated Haskell(whatever the language is) code is ready. You can use the generated code to build transactions and use Weave models in your app to reduce the workload.

## Using go

To import the required tools to communicate and send transactions to _IOV Name Service_, follow these steps.

### 1 - Import _bnsd_ protobuf definitions

- Copy the entire [weave/spec/proto/](https://github.com/iov-one/weave/tree/master/spec/proto) into the repo, as the imports should refer to local files.

### 2 - Install your preferred language-specific protoc plugin

- Create _prototool.yaml_ under root path.
- reference: [weave-starter-kit](https://github.com/iov-one/weave-starter-kit/blob/master/prototool.yaml)
- Import preferred languages plugin under _plugins_ with _plugin options_ such as compilation output.
- reference: [weave-starter-kit](https://github.com/iov-one/weave-starter-kit/blob/master/prototool.yaml#L22...L25)

### 3 - Import _app/codec.proto_

- Insert _app/codec.proto_ files path under `includes` in prototool.yaml
- reference: [weave-starter-kit](https://github.com/iov-one/weave-starter-kit/blob/master/prototool.yaml#L20)

### 4 - Compile _.proto_ definitions

- If _IOV/prototool_ used, run `docker run --rm --user=$(shell id -u):$(shell id -g) -v $(shell pwd):/work iov1/prototool:v0.2.2 prototool generate`
- Or instead of messing around with long protoc build scripts, include and parameterize this script in a build tool or script such as [weave-starter-kit/Makefile](https://github.com/iov-one/weave-starter-kit/blob/master/Makefile)

### 5 - Import compiled files in your project

- After all these steps, now the _weave/bnsd_ compiled protobuf files are ready. Import and make your dreams come true.

## Helpful links

Golang code reference:

- [blog-tutorial](https://github.com/iov-one/blog-tutorial/). See `makefile`, `prototool.yaml` and `spec` folder.

We collaborated with cosmostation to automate this process. Here are the script for reference:

- Android(Java): [Cosmostation/Cosmos-Android](https://github.com/cosmostation/cosmostation-mobile/blob/master/Cosmos-Android/app/src/main/java/wannabit/io/cosmostaion/iov-one/bns/generate_proto.sh)
- Swift(IOS): [Cosmostation/Cosmos-IOS](https://github.com/cosmostation/cosmostation-mobile/blob/master/Cosmos-IOS/Cosmostation/Cosmostation/IOV/bns/generate_proto.sh)
