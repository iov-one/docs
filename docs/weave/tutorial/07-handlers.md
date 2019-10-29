---
id: handlers
title: Handlers
sidebar_label: Handlers
---

> code reference (handler): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/handler.go

> code reference (test): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/handler_test.go

A message is a statement of intent, and wrapped in a transaction, which provides authorization to this intention. Once this message ends up in the ABCI application and is to be processed, we send it to a [Handler](https://godoc.org/github.com/iov-one/weave#Handler) which we have registered for this application.

## Check vs Deliver

If you look at the definition of a _Handler_, you will see it is responsible for _Check_ and _Deliver_. These are similar logic, but there is an important distinction. _Check_ is performed when a client proposes the transaction to the mempool, before it is added to a block. It is meant as a quick filter to weed out garbage transactions before writing them to the blockchain. The state it provides is a scratch buffer around the last committed state and will be discarded next block, so any writes here are never written to disk.

_Deliver_ is performed after the transaction was written to the block. Upon consensus, every node will process the block by calling _BeginBlock_, _Deliver_ for every transaction in the block, and finally _EndBlock_ and _Commit_. _Deliver_ will be called in the same order on every node and must make the **exact same changes** on every node, both now and in the future when the blocks are replayed. Even the slightest deviation will cause the merkle root of the store at the end of the block to differ with other nodes, and thus kick the deviating nodes out of consensus. Note that _Check_ may actually vary between nodes without breaking consensus rules, although we generally keep this deterministic as well.

**This is a very powerful concept and means that when modifying a given state, users need not worry about any concurrent access or writing collision since by definition, any write access is guaranteed to occur sequentially and in the same order on each node**

## Writing a Handler

We usually can write a separate handler for each message type, although you can register multiple messages with the same handler if you reuse most of the code. Let's focus on the simplest cases, and the handlers for creating a Blog and adding a Post to an existing blog.

Note that we can generally assume that _Handlers_ are wrapped by a `Savepoint Decorator`, and that if _Deliver_ returns an error after updating some objects, those update will be discarded. This means you can treat _Handlers_ as atomic actions, all or none, and not worry too much about cleaning up partially finished state changes if a later portion fails.

## Validation

Remember that we have to fulfill both _Check_ and _Deliver_ methods, and they share most of the same validation logic. A typical approach is to define a _validate_ method that parses the proper message out of the transaction, verify all authorization preconditions are fulfilled by the transaction, and possibly check the current state of the blockchain to see if the action is allowed. If the _validate_ method doesn't return an error, then _Check_ will return the expected cost of the transaction, while _Deliver_ will actually perform the action and update the blockchain state accordingly.

## Examples

```go
// CreateBlogHandler will handle CreateBlogMsg
type CreateBlogHandler struct {
    auth x.Authenticator
    b    *BlogBucket
}

var _ weave.Handler = CreateBlogHandler{}

// NewCreateBlogHandler creates a blog message handler
func NewCreateBlogHandler(auth x.Authenticator) weave.Handler {
    return CreateBlogHandler{
        auth: auth,
        b:    NewBlogBucket(),
    }
}
```

First we define what the `CreateBlogHandler` components will contain:

1. `x.Authenticator` will handle the authentication
2. `BlogBucket` will be the gateway to the blog data

`CreateBlogHandler` is a struct to wrap the components that are required to make handler logic work, such as **authentication** and **data access**. Authentication is handled by `x.Authenticator` and blog data access is by `BlogBucket` that we defined in previous chapter. `var _ weave.Handler = CreateBlogHandler{}` is a helper to ensure `CreateBlogHandler` is a `weave.Handler`. `NewCreateBlogHandler` wraps the components and returns the struct.

First of all, we implement the `validate` function that validates the message with static checks:

```go
// validate does all common pre-processing between Check and Deliver
func (h CreateBlogHandler) validate(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*CreateBlogMsg, *Blog, error) {
    var msg CreateBlogMsg

    if err := weave.LoadMsg(tx, &msg); err != nil {
        return nil, nil, errors.Wrap(err, "load msg")
    }

    blockTime, err := weave.BlockTime(ctx)
    if err != nil {
        return nil, nil, errors.Wrap(err, "no block time in header")
    }
    now := weave.AsUnixTime(blockTime)

    blog := &Blog{
        Metadata:    msg.Metadata,
        Owner:       x.MainSigner(ctx, h.auth).Address(),
        Title:       msg.Title,
        Description: msg.Description,
        CreatedAt:   now,
    }

    return &msg, blog, nil
}
```

Let's go over the `validate` method piece by piece:

1. Message is validated with static checks, such as missing title check
2. Execution time of the transaction, which will be used as creation time of the blog, is extracted from `BlockTime` info that lives in the `Context` of the handler
3. `Blog` instance is created with the values taken from `msg`

I did not mention the error checks between these steps but they are obvious and intuitive, yet very important. Go does a good job with forcing developer to pay attention to errors.

Then implement `Check` method that checks constraints scuah asif **fee** is sufficent to execute the transaction and if transactions is eligible to enter the mempool using validation:

```go
// Check verifies it is properly formed and returns
// the cost of executing it.
func (h CreateBlogHandler) Check(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.CheckResult, error) {
    _, err := h.validate(ctx, store, tx)
    if err != nil {
        return nil, err
    }

    return &weave.CheckResult{GasAllocated: newBlogCost}, nil
}
```

`newBlogCost` is defined as 10 tokens.

```go
// Deliver creates an custom state and saves if all preconditions are met
func (h CreateBlogHandler) Deliver(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.DeliverResult, error) {
    _, blog, err := h.validate(ctx, store, tx)
    if err != nil {
        return nil, err
    }

    err = h.b.Put(store, blog)
    if err != nil {
        return nil, errors.Wrap(err, "cannot store blog")
    }

    // Returns generated blog ID as response
    return &weave.DeliverResult{Data: blog.ID}, nil
}
```

Noticed `validate` method is also used in the beginning of `Deliver` execution? Purpose of this is to prevent any message manipulation between `Check` and `Deliver` methods. We would not want to any malformed state changes to be applied in the blockchain.

First given message is validated using `validate` method and then if valid, blog instance that is created by validate method is saved to the `BlogBucket`. If everything gone well, primary key of the blog will be returned as result.

We have written a basic handler that just runs validations and saves to the database. Here is a more complicated and functional example:

```go
// validate does all common pre-processing between Check and Deliver
func (h CreateCommentHandler) validate(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*CreateCommentMsg, *Comment, error) {
    var msg CreateCommentMsg

    if err := weave.LoadMsg(tx, &msg); err != nil {
        return nil, nil, errors.Wrap(err, "load msg")
    }

    // Check if article exists
    if err := h.ab.Has(store, msg.ArticleID); err != nil {
        return nil, nil, errors.Wrapf(err, "article with id %s does not exist", msg.ArticleID)
    }

    signer := x.MainSigner(ctx, h.auth).Address()

    blockTime, err := weave.BlockTime(ctx)
    if err != nil {
        return nil, nil, errors.Wrap(err, "no block time in header")
    }
    now := weave.AsUnixTime(blockTime)

    comment := &Comment{
        Metadata:  msg.Metadata,
        ArticleID: msg.ArticleID,
        Owner:     signer,
        Content:   msg.Content,
        CreatedAt: now,
    }

    return &msg, comment, nil
}
```

`CreateCommentHandler` saves the a comment that is posted to an article if all conditions are met. `validation` method step by step:

1. Message is validated with static checks such as missing title check.
2. `ArticleBucket` is queried if the article that is desired to be commented exists.
3. `Comment` instance is created with tx signers address and creation time. If you want to check if signer is eligible to executed a transaction, you can compare it with the owner data that is kept in bucket and if there is no match then tx will be aborted and the fee will be deduced from transaction sender as anti spam fee.

```go
// Deliver creates a comment and saves if all preconditions are met
func (h CreateCommentHandler) Deliver(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.DeliverResult, error) {
    _, comment, err := h.validate(ctx, store, tx)
    if err != nil {
        return nil, err
    }

    err = h.cb.Put(store, comment)
    if err != nil {
        return nil, errors.Wrap(err, "cannot store comment")
    }

    // Returns generated user ID as response
    return &weave.DeliverResult{Data: comment.ID}, nil
}
```

As you noticed most of the hard work done in `validate` method and `Deliver` methods are used to handle database related work.

Once `validate` is implemented, `Check` must ensure it is valid and then return a rough cost of the message, which may be based on the storage cost of the text of the post. This return value is similar to the concept of _gas_ in ethereum, although it doesn't count to the fees yet, but rather is used by tendermint to prioritize the transactions to fit in a block.

Here is an example of more dynamic fee deduction:

```go
// Check just verifies it is properly formed and returns
// the cost of executing it.
func (h CreateArticleHandler) Check(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.CheckResult, error) {
    msg, _, err := h.validate(ctx, store, tx)
    if err != nil {
        return nil, err
    }

    // Calculate gas cost
    gasCost := int64(len(msg.Content)) * newArticleCost / articleCostUnit

    return &weave.CheckResult{GasAllocated: gasCost}, nil
}
```

In the case of an Article creation, we decided to charge the author 1 gas per mile characters with the first 1000 characters offered: `gasCost := int64(len(msg.Content)) * newArticleCost / articleCostUnit`

## Testing Handlers

In order to test a handler, we need four things :

- A storage
- A weave context
- An Authenticator associated with our context
- A Tx object to process (eg. to check or to deliver)

There is a ready-to-use in memory storage available in the [store package](https://github.com/iov-one/weave/blob/master/store/btree.go#L31-L36). There are also util functions available that we can use to create a weave context with a list of signers (eg. authorized addresses) via an [Authenticator](weave/design/permissions)

The function below shows how to use them:

```go
func TestCreateArticle(t *testing.T) {
	// Blog owner address
	blogOwner := weavetest.NewCondition()
	// Signer address for negative testing
    signer := weavetest.NewCondition()

    now := weave.AsUnixTime(time.Now())
    past := now.Add(-1 * 5 * time.Hour)
    future := now.Add(time.Hour)

    ownedBlog := &Blog{
        Metadata:    &weave.Metadata{Schema: 1},
        ID:          weavetest.SequenceID(1),
        Owner:       signer.Address(),
        Title:       "Best hacker's blog",
        Description: "Best description ever",
        CreatedAt:   past,
    }
    notOwnedBlog := &Blog{
        Metadata:    &weave.Metadata{Schema: 1},
        ID:          weavetest.SequenceID(2),
        Owner:       blogOwner.Address(),
        Title:       "Worst hacker's blog",
        Description: "Worst description ever",
        CreatedAt:   past,
    }

    cases := map[string]struct {
        msg             weave.Msg
        signer          weave.Condition
        expected        *Article
        wantCheckErrs   map[string]*errors.Error
        wantDeliverErrs map[string]*errors.Error
    }{
        "success": {
            msg: &CreateArticleMsg{
                Metadata: &weave.Metadata{Schema: 1},
                BlogID:   ownedBlog.ID,
                Title:    "insanely good title",
                Content:  "best content in the existence",
                DeleteAt: future,
            },
            signer: signer,
            expected: &Article{
                Metadata:     &weave.Metadata{Schema: 1},
                ID:           weavetest.SequenceID(1),
                BlogID:       ownedBlog.ID,
                Owner:        signer.Address(),
                Title:        "insanely good title",
                Content:      "best content in the existence",
                CommentCount: 0,
                LikeCount:    0,
                CreatedAt:    now,
                DeleteAt:     future,
            },
            wantCheckErrs: map[string]*errors.Error{
                "Metadata":     nil,
                "ID":           nil,
                "BlogID":       nil,
                "Owner":        nil,
                "Title":        nil,
                "Content":      nil,
                "CommentCount": nil,
                "LikeCount":    nil,
                "CreatedAt":    nil,
                "DeleteAt":     nil,
            },
            wantDeliverErrs: map[string]*errors.Error{
                "Metadata":     nil,
                "ID":           nil,
                "BlogID":       nil,
                "Owner":        nil,
                "Title":        nil,
                "Content":      nil,
                "CommentCount": nil,
                "LikeCount":    nil,
                "CreatedAt":    nil,
                "DeleteAt":     nil,
            },
        },
        "success no delete at": {
            msg: &CreateArticleMsg{
                Metadata: &weave.Metadata{Schema: 1},
                BlogID:   ownedBlog.ID,
                Title:    "insanely good title",
                Content:  "best content in the existence",
            },
            signer: signer,
            expected: &Article{
                Metadata:     &weave.Metadata{Schema: 1},
                ID:           weavetest.SequenceID(1),
                BlogID:       ownedBlog.ID,
                Owner:        signer.Address(),
                Title:        "insanely good title",
                Content:      "best content in the existence",
                CommentCount: 0,
                LikeCount:    0,
                CreatedAt:    now,
            },
            wantCheckErrs: map[string]*errors.Error{
                "Metadata":     nil,
                "ID":           nil,
                "BlogID":       nil,
                "Owner":        nil,
                "Title":        nil,
                "Content":      nil,
                "CommentCount": nil,
                "LikeCount":    nil,
                "CreatedAt":    nil,
                "DeleteAt":     nil,
			},
			wantDeliverErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           nil,
				"BlogID":       nil,
				"Owner":        nil,
				"Title":        nil,
				"Content":      nil,
				"CommentCount": nil,
				"LikeCount":    nil,
				"CreatedAt":    nil,
				"DeleteAt":     nil,
			},
		},
		"failure signer not authorized": {
			msg: &CreateArticleMsg{
				Metadata: &weave.Metadata{Schema: 1},
				BlogID:   ownedBlog.ID,
				Title:    "insanely good title",
				Content:  "best content in the existence",
				DeleteAt: future,
			},
			signer:   weavetest.NewCondition(),
			expected: nil,
			wantCheckErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           nil,
				"BlogID":       nil,
				"Owner":        nil,
				"Title":        nil,
				"Content":      nil,
				"CommentCount": nil,
				"LikeCount":    nil,
				"CreatedAt":    nil,
				"DeleteAt":     nil,
			},
			wantDeliverErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           nil,
				"BlogID":       nil,
				"Owner":        nil,
				"Title":        nil,
				"Content":      nil,
				"CommentCount": nil,
				"LikeCount":    nil,
				"CreatedAt":    nil,
				"DeleteAt":     nil,
			},
		},
		/* --------- *** -----------

		   CHECK OUT THE REPO FOR MORE TEST EXAMPLES

		   --------- *** -----------  */
	}
	for testName, tc := range cases {
		t.Run(testName, func(t *testing.T) {
			auth := &weavetest.Auth{
				Signer: tc.signer,
			}

			// initalize environment
			rt := app.NewRouter()
			RegisterRoutes(rt, auth)
			kv := store.MemStore()

			// initalize blog bucket and save blogs
			blogBucket := NewBlogBucket()
			err := blogBucket.Put(kv, ownedBlog)
			assert.Nil(t, err)

			err = blogBucket.Put(kv, notOwnedBlog)
			assert.Nil(t, err)

			// initialize article bucket
			articleBucket := NewArticleBucket()

			tx := &weavetest.Tx{Msg: tc.msg}

			// Get current block time from context
			ctx := weave.WithBlockTime(context.Background(), time.Now().Round(time.Second))

			if _, err := rt.Check(ctx, kv, tx); err != nil {
				for field, wantErr := range tc.wantCheckErrs {
					assert.FieldError(t, err, field, wantErr)
				}
			}

			res, err := rt.Deliver(ctx, kv, tx)
			if err != nil {
				for field, wantErr := range tc.wantDeliverErrs {
					assert.FieldError(t, err, field, wantErr)
				}
			}

			if tc.expected != nil {
				var stored Article
				err := articleBucket.One(kv, res.Data, &stored)
				assert.Nil(t, err)

				// ensure createdAt is after test execution starting time
				createdAt := stored.CreatedAt
				weave.InTheFuture(ctx, createdAt.Time())

				// avoid registered at missing error
				tc.expected.CreatedAt = createdAt

				assert.Equal(t, tc.expected, &stored)
			}
		})
	}
}
```

Test case above has quite an amount of necessary boiler plate. Every test case including cases that test missing message fields which depends on message validation.

The usual test work flow is:

1. Define variables and constants that would be used in state
2. Create states
3. Define case contents
4. Write test for successful and failure cases
5. Write expected errors for fields
6. Write a repetitive method for running all tests
   1. Configure blockchain context
   2. Configure authentication  
   3. Configure router
   4. Wrap transaction
   5. Save the instances that test is dependent on to database
   6. Run `Check` method and check for errors
   7. Run `Deliver` method and check for errors
   8. Check if the response values are equal to expected values
