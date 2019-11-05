---
id: buckets
title: Buckets
sidebar_label: Buckets
---

> code reference (bucket): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/bucket.go

> code reference (test): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/bucket_test.go

In Weave framework, Buckets are the standard way to access and manipulate data, which is stored in _Key-Value Database_. Weave buckets could be found similar to [BoltDB](https://github.com/boltdb/bolt#using-buckets 'Bolt Repo') or [LevelDB](https://github.com/google/leveldb 'LevelDB Repo') design. Any extension can use one or multiple Buckets to store and access data. Buckets offer the following advantages:

- Isolation between extensions (each Bucket has a unique prefix that is transparently prepended to the keys)
- Type safety (enforce all data stored in a Bucket to be the same type, to avoid parse errors later on)
- Indexes (Buckets are well integrated with the secondary indexes and keep them in sync every time data is modified)
- Querying (Buckets can easily register query handlers including prefix queries and secondary index queries)

All extensions from Weave use Buckets, so for compatibility as well as the features, **please use Buckets in your app**, unless you have a very good reason not to (and know what you are doing).

To use buckets, models must be wrapped in `SimpleObj`.

```go
type SimpleObj struct {
    key   []byte
    value CloneableData
}
```

Easiest way to achieve this is to use `ModelBucket`.

```go
b := orm.NewModelBucket("user", &User{})
```

`orm.NewModelBucket` wraps `User` in SimpleObj internally:

```go
// NewModelBucket returns a ModelBucket instance. This implementation relies on
// a bucket instance. Final implementation should operate directly on the
// KVStore instead.
func NewModelBucket(name string, m Model, opts ...ModelBucketOption) ModelBucket {
    b := NewBucket(name, NewSimpleObj(nil, m))
```

<!---
TODO refactor here when blog is upgraded to v0.22.0
-->

And be sure protobuf objects implemented `CloneableData`:

```go
    Clone() Object
}

// CloneableData is an intelligent Value that can be embedded
// in a simple object to handle much of the details.
```

Bucket name must comply with `^[a-z_]{3,10}$` regex rule, meaning names must be between 3 to 10 characters and all lower case.

This basically consists of adding _Copy()_ and _Validate()_ to the objects in `codec.pb.go`. On [Models](weave/tutorial/04-models.md) section, we implemented _Copy()_ and _Validate()_ as you remember. Now it makes sense, right?

## Dive into Code

Let's define `UserBucket` that will hold `User` information and write a function that creates an user. This is a basic `morm/model_bucket` without any secondary index.

```go
type UserBucket struct {
    morm.ModelBucket
}

// NewUserBucket returns a new user bucket
func NewUserBucket() *UserBucket {
    return &UserBucket{
        morm.NewModelBucket("user", &User{}),
    }
}
```

We will demonstrate secondary index usage with `ArticleBucket`. Secondary indexes enable you to insert and query models with ease. Think of this as a SQL index.

```go
type ArticleBucket struct {
    morm.ModelBucket
}

// NewArticleBucket returns a new article bucket
func NewArticleBucket() *ArticleBucket {
    return &ArticleBucket{
        morm.NewModelBucket("article", &Article{},
            morm.WithIndex("blog", articleBlogIDIndexer, false),
            morm.WithIndex("timedBlog", blogTimedIndexer, false)),
    }
}
```

Let's explain what the heck is `morm.WithIndex("blog", articleBlogIDIndexer, false)`?

## Secondary Indexes

Sometimes we need another index for the data. Generally, we will look up an article from the blog it belongs to and its index in the article. But what if we want to list all articles of a blog in all article instances? For this, we need to add a secondary index on the articles to query by blog. This is a typical case and Weave provides nice support for this functionality.

We add an indexing method to take any object, enforce the type to be a proper Article, then extract the index we want. This can be a field or any deterministic transformation of one (or multiple) fields. The output of the index becomes key in another query. Bucket provides a simple method to query by index.

**articleBlogIDIndexer** is a secondary index with only **BlogID**. This is a simple index form to implement. It binds Article to a BlogID(_bytes_).

Weave uses uniformed _bytes_ as indexes. This improves performance.

```go
// articleBlogIDIndexer enables querying articles by blog ids
func articleBlogIDIndexer(obj orm.Object) ([]byte, error) {
    if obj == nil || obj.Value() == nil {
        return nil, nil
    }
    article, ok := obj.Value().(*Article)
    if !ok {
        return nil, errors.Wrapf(errors.ErrState, "expected article, got %T", obj.Value())
    }
    return article.BlogID, nil
}
```

You must have ideas flying around in your mind like **how are we going to make a compound index? Really!? Is it all Weave has?**

Don't worry. Weave is like a Swiss Army knife with a lot of blockchain features.

Here is how we create compound index for morm buckets:

```go
// BuildBlogTimedIndex produces 8 bytes BlogID || big-endian createdAt
// This allows lexographical searches over the time ranges (or earliest or latest)
// of all articles within one blog
func BuildBlogTimedIndex(article *Article) ([]byte, error) {
	res := make([]byte, 16)
	copy(res, article.BlogID)
	// this would violate lexographical ordering as negatives would be highest
	if article.CreatedAt < 0 {
		return nil, errors.Wrap(errors.ErrState, "cannot index negative creation times")
	}
	binary.BigEndian.PutUint64(res[8:], uint64(article.CreatedAt))
	return res, nil
}
```

We can query all articles that are posted in a blog over the time ranges(earliest or latest)

## Querying buckets

On [Weave API spec](weave/weave-api-spec/weave-query-spec) documentation querying `bns` buckets has been explained. If we were to give an example of querying on comment bucket it would have been via RPC endpoints:

```sh
curl -X POST -d '{ "json-rpc": 2.0, "id": "foobar321",
"method": "abci_query", "params": { "path": "/comment/articleuser", "data": "0000000100000001" } }' \
https://rpc.blog.testnet.iov.one/
```

## Custom Buckets

Data consistency must be enforced on buckets. All data is validated before saving, but we also need to make sure that all the data corresponds to the correct object type before saving. Unfortunately, this is quite difficult to compile-time without generic, so a typical approach is to embed the orm.Bucket in another struct and just force validation of the object type runtime before save. Wrap an orm.ModelBucket with the functionalities you desire - there you have a custom bucket to serve your needs.
Truth time: `morm.ModelBucket` is a refinement of `weave/orm.ModelBucket`. We used morm modules instead of orm to show you even buckets are customizable to your needs. You can compare [morm](https://github.com/iov-one/tutorial/blob/master/morm/model_bucket.go#L40) and [weave/orm](https://github.com/iov-one/weave/tree/master/orm) and see how to implement your custom bucket.
