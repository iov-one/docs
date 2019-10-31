---
id: domain
title: Defining the Domain
sidebar_label: Domain
---

The first thing we consider is the data we want to store, which is known as the state. After that, we can focus on the messages, which trigger state transitions. All blockchain state must be stored in our Merkle-ized store, which provides validity hashes and proofs. This is exposed to the application as a basic key-value store, which also allows in-order iteration over the keys. On top of this we have built some tools, such as secondary indexes and sequences, similar to how [Storm adds an ORM](https://github.com/asdine/storm#simple-crud-system) on top of [BoltDB’s key-value store](https://github.com/boltdb/bolt#using-buckets). We have avoided struct tags and tried to type as strictly as we can (without using generics).

## State

State as in [Turing machine](https://en.wikipedia.org/wiki/Turing_machine), is how the system's data is presented and preserved. We are building an Blog application to solidify the state concept. Blog applications are quite famous for their simplicity and informativeness as software tutorials. Let's follow this style.

- **User** defines the user of the application. Users can post blogs, articles, set a deletion time for **their own** articles, comment on articles, and like articles. _User state_ contains:

  - **ID**: unique identifier of the user
  - **Username**: alias that is picked by the user
  - **Bio**: biography of the user. It could be empty

- **Blog** is where a user posts his article and give information on the overall blog. _Blog state_ contains:

  - **ID**: unique identifier of the blog
  - **Owner**: owner of the blog
  - **Title**: title of the blog
  - **Description**: description of the blog
  - **CreatedAt**: creation time of the blog

- **Article** is simple as it seems: article that a user wants to post to the blog. Only owner of the article has the permissions to delete or set deletion time for the article. _Article state_ contains:

  - **ID**: unique identifier of the article
  - **BlogID**: blog identifier at which that article is posted
  - **Title**: title of the article
  - **Content**: content of the article
  - **CreatedAt**: creation time of the article
  - **DeleteAt**: deletion time of the article. Could be nil or set to a future date. If in future, cron task will do its work and delete the article

You can find more information about this topic on [blog tutorial repo](https://github.com/iov-one/blog-tutorial/blob/master/x/blog/README.md 'README.md'). It is recommended to define domain as _README_ in the module.

## Primary Keys

Some of this data belongs in the primary key, the rest in the value. Weave introduces the concept of an _Object_ which contains a `Key([]byte)` and `Value(Persistent struct)`. An object can be cloned and validated. When we run a query we will receive this object, so we can place some critical information in the Key and expect it always to be present.

The primary key must be a unique identifier and it should be the main way we want to access the data. We will be using the [morm](weave/tutorial/06-buckets#CustomBucket) package for externally indexing models. External index means `ID` proto fields in this context. On the other side, plain `orm` makes indexing via any field. For example, if we were to model a Blog we could index it using its title.
