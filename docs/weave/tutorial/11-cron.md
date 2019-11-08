---
id: cron-tasks
title: Scheduled Tasks
sidebar_label: Scheduled Tasks
---

In almost every real time software, the need to schedule jobs to be executed at a certain time in future is constant. In blockchain context, this could be sending tokens, distributing revenue, scheduling a proposal, basically anything that could be executed as a transaction(a change in state). One of the functionality missing in older blockchain protocols is assuring the execution time of a transaction precisely is impossible due to the [Probabilistic Finality](../basics/02-consensus.md#probabilistic-finality) nature of the consensus algorithms. One of the wonders of Tendermint Consensus engine is we can approximately predict the execution time of a block thanks to [Immediate Finality](../basics/02-consensus.md#immediate-finality).

A must read gem: [Finality in Blockchain Consensus.](https://medium.com/mechanism-labs/finality-in-blockchain-consensus-d1f83c120a9a)

In Weave, [CRON](https://en.wikipedia.org/wiki/CRON) is no different than a regular message except the fact that CRON tasks are initiated by a ticker and processed by a different handler that is not accesible from the route. This means you cannot access the CRON handler from outside but you can trigger a CRON task by a regular, routed handler.

### Scheduler

[Scheduler interface](https://github.com/iov-one/weave/blob/master/cron.go#L43-L55) defines an API to schedule a task for a time in future with the conditions that are eligible to execute the tasks.

```go
// Scheduler is an interface implemented to allow scheduling message execution.
type Scheduler interface {
    // Schedule queues given message in the database to be executed at
    // given time. Message will be executed with context containing
    // provided authentication addresses.
    // When successful, returns the scheduled task ID.
    Schedule(KVStore, time.Time, []Condition, Msg) ([]byte, error)

    // Delete removes a scheduled task from the queue. It returns
    // ErrNotFound if task with given ID is not present in the queue.
    Delete(KVStore, []byte) error
}
```

**Warning:** Due to the implementation details, transaction is guaranteed to be executed after given time, but not exactly at given time. If another transaction is already scheduled for the exact same time, execution of this transaction is delayed until the next free slot.

**Important Note:** An authentication address, Condition, is passed to the scheduler because: In the usual flow, before processing the message, signature is validated to authenticate and later authorize. In CRON this is not the case, because what a normal message creates a new message that says "CRON do X" and the signature of this message is not present in the context. It is impossible to sign a message for scheduler to without the private key.
Instead, the signature check step bypassed and conditions must be explicitly present in the context when processing given scheduled message.

This could be a security hole if developer implements the CRON feature poorly. Happily only code can schedule a CRON task and decide on conditions, so this should never be an issue.

### Ticker

[Ticker interface](https://github.com/iov-one/weave/blob/master/cron.go#L11-L27) defines the API of the executor of the scheduled jobs.

```go
// Ticker is an interface used to call background tasks scheduled for
// execution.
type Ticker interface {
    // Tick is a method called at the beginning of the block. It should be
    // used to execute any scheduled tasks.
    //
    // Because beginning of the block does not allow for an error response
    // this method does not return one as well. It is the implementation
    // responsibility to handle all error situations.
    // In case of an error that is an instance specific (ie database
    // issues) it might be neccessary for the method to terminate (ie
    // panic). An instance specific issue means that all other nodes most
    // likely succeeded processing the task and have different state than
    // this instance. This means that this node is out of sync with the
    // rest of the network and cannot continue operating as its state is
    // invalid.
    Tick(ctx Context, store CacheableKVStore) TickResult
}
```

Default Ticker implementation processes messages in order of execution time, starting with the oldest, in short words FIFO. But if you require a LIFO task queue you can implement it easily.

## Tutorial

### Message

In [CreateArticleMsg](https://github.com/iov-one/blog-tutorial/blob/master/x/blog/codec.proto#L92-L104) we defined a field named as `delete_at` that defines the deletion time of the article that will initated by CRON. During the creation of CreateArticleHandler scheduler is defined as a part of the struct:

### Scheduler Handler

```go
type CreateArticleHandler struct {
    auth      x.Authenticator
    ab        *ArticleBucket
    bb        *BlogBucket
    dtb       *DeleteArticleTaskBucket
    scheduler weave.Scheduler
}
```

_weave.Scheduler_ will be initiated and passed to the handler on the application layer.

[The code](https://github.com/iov-one/blog-tutorial/blob/master/x/blog/handler.go#L358-L363) that schedules a job to be processed in future is below:

```go
// schedule delete task
	if msg.DeleteAt != 0 {
		deleteArticleMsg := &DeleteArticleMsg{
			Metadata:  msg.Metadata,
			ArticleID: article.ID,
		}

		var taskID []byte
		taskID, err = h.scheduler.Schedule(store, article.DeleteAt.Time(), nil, deleteArticleMsg)
		if err != nil {
			return nil, errors.Wrap(err, "cannot schedule deletion task")
		}

		// save delete article task so it could be cancelled later
		deleteArticleTask := &DeleteArticleTask{
			Metadata:  deleteArticleMsg.Metadata,
			ID:        taskID,
			ArticleID: article.ID,
			TaskOwner: x.MainSigner(ctx, h.auth).Address(),
		}
		if err := h.dtb.Put(store, deleteArticleTask); err != nil {
			return nil, errors.Wrap(err, "cannot store delete article task")
		}
	}
```

If the create message contains a DeleteAt value, `deleteArticleMsg` initiated and scheduled with no condition - the scheduler will not be accesible to the outer world. We want everyone to be able to schedule a article for their own article.

Let's say we want a message that could be executed only when an **admin's** condition is present in the context. For this, the handler that will execute message must check the if the admin's condition is in the context and then execute accordingly. In order to pass this authentication information to the CRON handler you need to feed the condition to the scheduler:

`taskID, err = h.scheduler.Schedule(store, article.DeleteAt.Time(), adminCond, deleteArticleMsg)`

In the code example above we also defined a `taskID` that will be used to identify the task among other deletion tasks, with this information we can delete or modify the task after scheduling process is over.

As you can see `deleteArticleTask` is saved to the store with article ID and task owner address to authorize modification to the task.

Via the article ID field, scheduled tasks could be queried with articles.

## Executor Handler

Executor Handler in this context refers to the handler that will execute the task that is received from the application ticker. We implemented the deletion scheduling logic within `CreateArticleHandler`, now we have to implement the consumer logic, which is `CronDeleteArticleHandler`.

`Deliver` method of `CronDeleteArticleHandler`:

```go
// Deliver stages a scheduled deletion if all preconditions are met
func (h CronDeleteArticleHandler) Deliver(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.DeliverResult, error) {
	msg, err := h.validate(ctx, store, tx)
	if err != nil {
		return nil, err
	}

	if err := h.b.Delete(store, msg.ArticleID); err != nil {
		return nil, errors.Wrapf(err, "cannot delete article with ID %s", msg.ArticleID)
	}

	return &weave.DeliverResult{}, nil
}
```

As you can see there is no authentication checks, it is because we designed cron handlers to be inaccesible to the world via a query so we can implement our execution without any fears of exploitation.

This handler will receive the `DeleteArticleMsg`, delete the article from the store using the article ID data that is passed along with the message.

## Task Cancellation

If we need the ability to do execution in distant future, we also need the ability to cancel the same execution. As you remember we saved the scheduled task information to the store to be used in various post-submission activities. Deletion is the simplest example of this case. As you read many many times, and probably got very used to, every action in Weave goes through an handler. We will create a handler that is called `CancelDeleteArticleTaskHandler`.

`validate` method:

```go
// validate does all common pre-processing between Check and Deliver
func (h CancelDeleteArticleTaskHandler) validate(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*CancelDeleteArticleTaskMsg, error) {
	var msg CancelDeleteArticleTaskMsg

	if err := weave.LoadMsg(tx, &msg); err != nil {
		return nil, errors.Wrap(err, "load msg")
	}

	var task DeleteArticleTask
	if err := h.b.One(store, msg.TaskID, &task); err != nil {
		return nil, errors.Wrapf(err, "delete task with id %s not found", msg.TaskID)
	}

	signer := x.MainSigner(ctx, h.auth).Address()
	if !task.TaskOwner.Equals(signer) {
		return nil, errors.Wrapf(errors.ErrUnauthorized, "signer %s is unauthorized to cancel scheduled delete article task with id %s", signer, msg.TaskID)
	}

	return &msg, nil
}
```

Since cancellation of tasks requries to be initiated by a user signed message, we need to explicitly check if user signature is in the context, same as every other regular handler.

If the task desired to be cancelled exists and task owner is the signer of the address, execution proceeds to the `Deliver` method:

```go
// Deliver cancels delete task if conditions are met
func (h CancelDeleteArticleTaskHandler) Deliver(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.DeliverResult, error) {
	msg, err := h.validate(ctx, store, tx)
	if err != nil {
		return nil, err
	}

	if err := h.scheduler.Delete(store, msg.TaskID); err != nil {
		return nil, errors.Wrapf(err, "cannot delete scheduled task with id %s", msg.TaskID)
	}

	if err := h.b.Delete(store, msg.TaskID); err != nil {
		return nil, errors.Wrapf(err, "cannot cancel delete task with id %s", msg.TaskID)
	}

	return &weave.DeliverResult{Data: msg.TaskID}, nil
}
```

First, task gets **descheduled** using the task ID present in the message and then deleted from the task store.

## CRON Stack

As we mentioned before, CRON handlers are no different than regular handlers but they differ in one point: CRON operates in a totally different stack than the application.

We need to define a seperate routes for our CRON stack in the blog module:

```go
// RegisterCronRoutes registers routes that are not exposed to
// routers
func RegisterCronRoutes(
	r weave.Registry,
	auth x.Authenticator,
) {
	r.Handle(&DeleteArticleMsg{}, newCronDeleteArticleHandler(auth))
}
```

And then we need a weave.Handler builder that will wrap the CRON application:

```go
func CronStack() weave.Handler {
	rt := app.NewRouter()

	authFn := cron.Authenticator{}

	// Cron is using custom router as not the same handlers are registered.
	blog.RegisterCronRoutes(rt, authFn)

	decorators := app.ChainDecorators(
		utils.NewLogging(),
		utils.NewRecovery(),
		utils.NewKeyTagger(),
		utils.NewActionTagger(),
		// No fee decorators.
	)
	return decorators.WithHandler(rt)
}
```

And last we need a `Ticker` that will process the scheduled messages:

```go
ticker := cron.NewTicker(CronStack(), CronTaskMarshaler)
```

We feed the ticker to the base application:

```go
// Application constructs a basic ABCI application with
// the given arguments.
func Application(name string, h weave.Handler,
	tx weave.TxDecoder, dbPath string, debug bool) (app.BaseApp, error) {

	ctx := context.Background()
	kv, err := CommitKVStore(dbPath)
	if err != nil {
		return app.BaseApp{}, errors.Wrap(err, "cannot create database instance")
	}
	store := app.NewStoreApp(name, kv, QueryRouter(), ctx)
	base := app.NewBaseApp(store, tx, h, ticker, debug)
	return base, nil
}
```

## Conclusion