---
id: cron-tasks
title: Scheduled Tasks
sidebar_label: Scheduled Tasks
---

In almost every real-time software, the need to schedule jobs to be executed at a certain time in the
future is constant. In the blockchain context, this could be sending tokens, distributing revenue,
scheduling a proposal, basically anything that could be executed as a transaction (a change of
state). The early generation of blockchain protocols had a hard time assuring the execution time
of a transaction precisely, and this is due to the indeterministic nature of the consensus algorithms.
One of the wonders of Tendermint Consensus engine is the ability to roughly approximate the execution time of a
future block thanks to the **BFT Time feature**.
[Tendermint BFT Time](https://github.com/tendermint/tendermint/blob/v0.32.7/docs/spec/consensus/bft-time.md)
document is a very technical and specification, but long story short, the execution time of a proposed block is
get by calculating the median of the latest block's commit voting times.

We achieved scheduled tasks functionalities by developing the module called
[x/cron](https://github.com/iov-one/weave/tree/master/x/cron). [CRON](https://en.wikipedia.org/wiki/CRON)
is designed to be no different than a regular message except the fact that CRON tasks are initiated by
a ticker and processed by a different handler that is not accessible from the route. This means CRON
execution happens in a separate stack than the [application stack](./09-app.md). Actually
CRON is a minimal application stack with limited functionality and capabilities. Although this does
not mean CRON routes are not accessible or interactable from the application stack. A task could be triggered,
canceled, modified, and created by a message routed to a request handler.

Differences between application and CRON stack:

- Executing CRON messages is almost the same as executing a message in
the usual flow
- CRON can use the same or a different router to handle
messages and therefore support the same or different set of messages
- Using different handler allows configuring which messages can be processed by the same
handler and which message can be used both by the request handler and CRON handler
- CRON use a different authentication policy

### Scheduler

[Scheduler interface](https://github.com/iov-one/weave/blob/master/cron.go#L43-L55) defines an
API to schedule a task for a time in the future with the conditions that are eligible to execute the
tasks.

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

**Warning:** Due to the implementation details, the transaction is guaranteed to be executed after a
given time, but not exactly at a given time. If another transaction is already scheduled for the same time, the execution of this transaction is delayed until the next free slot.

**Important Note:** An authentication address, Condition, is passed to the scheduler because, in
the usual flow, before processing the message, signature is validated to authenticate and later
authorize. In CRON this is not the case, because what a normal message creates is a new message that
says "CRON do X" and the signature of this message is not present in the context. It is
impossible to sign a message for scheduler without the private key.
Instead, the signature check step is bypassed and desired conditions are set in the context when
processing given scheduled message.

The absence of a signature could be a security hole if a developer implements the CRON feature poorly.
Happily, only code can schedule a CRON task and decide on conditions, so this should never be an
issue.

### Ticker

[Ticker interface](https://github.com/iov-one/weave/blob/master/cron.go#L11-L27) defines the API
of the executor of the scheduled jobs.

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

## Tutorial

### Message

In [CreateArticleMsg](https://github.com/iov-one/blog-tutorial/blob/master/x/blog/codec.proto#L92-L104)
we defined a field named as `delete_at` that defines the deletion time of the article that will be executed by CRON. And the `task_id` variable
defines the ID of task generated by scheduler. Keeping the task ID accessible enables various modifications on the scheduled task such as deletion
after creation.

### Scheduler Handler

```go
type CreateArticleHandler struct {
	auth      x.Authenticator
	ab        *ArticleBucket
	bb        *BlogBucket
	scheduler weave.Scheduler
}
```

_weave.Scheduler_ will be initiated and passed to the handler on the stack layer.

[The code](https://github.com/iov-one/blog-tutorial/blob/master/x/blog/handler.go#L358-L363) that
schedules a job to be processed in future is below:

```go
// schedule delete task
	if msg.DeleteAt != 0 {
		deleteArticleMsg := &DeleteArticleMsg{
			Metadata:   &weave.Metadata{Schema: 1},
			ArticleKey: article.PrimaryKey,
		}

		taskID, err := h.scheduler.Schedule(store, article.DeleteAt.Time(), nil, deleteArticleMsg)
		if err != nil {
			return nil, errors.Wrap(err, "cannot schedule deletion task")
		}

		article.DeleteTaskID = taskID
	}
```

If the create message contains a DeleteAt value, `deleteArticleMsg` will be initiated and
scheduled with no condition. Don't get scared by **with no condition** words, the CRON handler
is not routed to the outer world anyway. Yet you can enable this access with registering the CRON handler to a `QueryHandler`. It is a design and requirement choice.

Let's say we want a message that could be executed only when an **admin's** condition is present
in the context. For this, the handler that will execute message must check if the admin's
condition is in the context and then execute accordingly. To pass this authentication
information to the CRON handler you need to feed the condition to the scheduler:

`taskID, err = h.scheduler.Schedule(store, article.DeleteAt.Time(), adminCond, deleteArticleMsg)`

In the code example above we also defined a `taskID` that will be used to identify the task among
other deletion tasks; with this information we can delete or modify the task after scheduling
process is over.

## Executor Handler

Executor Handler in this context refers to the handler that will execute the task that is received from
the application ticker. We implemented the deletion scheduling logic within `CreateArticleHandler`,
now we have to implement the consumer logic, which is `CronDeleteArticleHandler`.

`Deliver` method of `CronDeleteArticleHandler`:

```go
// Deliver stages a scheduled deletion if all preconditions are met
func (h CronDeleteArticleHandler) Deliver(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.DeliverResult, error) {
	msg, err := h.validate(ctx, store, tx)
	if err != nil {
		return nil, err
	}

	if err := h.b.Delete(store, msg.ArticleKey); err != nil {
		return nil, errors.Wrapf(err, "cannot delete article with ID %s", msg.ArticleKey)
	}

	return &weave.DeliverResult{}, nil
}
```

This handler will receive the `DeleteArticleMsg`, delete the article from the store using the
article ID data that is passed along with the message.

## Task Cancellation

If we need the ability to do execution in the distant future, we also need the ability to cancel the
same execution. As you remember we saved the scheduled task information to the store to be used
in various post-submission activities. Deletion is the simplest example of this case. As you have read
many many times, and probably got very used to, every action in Weave goes through a handler. We
will create a handler called `CancelDeleteArticleTaskHandler`.

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

Since cancellation of tasks must be initiated by a user-signed message, we need to
check explicitly if the user signature is in the context, same as every other regular handler.

If the task you want to cancel exists and the task owner is the signer of the address, execution
proceeds to the `Deliver` method:

```go
// Deliver cancels delete task if conditions are met
func (h CancelDeleteArticleTaskHandler) Deliver(ctx weave.Context, store weave.KVStore, tx weave.Tx) (*weave.DeliverResult, error) {
	_, article, err := h.validate(ctx, store, tx)
	if err != nil {
		return nil, err
	}

	if err := h.scheduler.Delete(store, article.DeleteTaskID); err != nil {
		return nil, errors.Wrapf(err, "cannot deschedule with task id %s", article.DeleteTaskID)
	}

	article.DeleteTaskID = nil
	if err := h.b.Save(store, article); err != nil {
		return nil, errors.Wrapf(err, "cannot update article %s ", article.PrimaryKey)
	}

	return &weave.DeliverResult{}, nil
}
```

First, the task gets **descheduled** using the task ID present in the article and then set as nil in article model

## CRON Stack

As we mentioned before, CRON handlers are no different than regular handlers but they differ in
one point: CRON operates in a totally different stack than the application.

We need to define a separate route for our CRON stack in the blog module:

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

And then we need to decorate cron route handlers with utilizations.

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

Feed the ticker to the base application:

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

When the application is run, CRON stack will be initialized by the `Application` method and will be consuming tasks.
