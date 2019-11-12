---
id: application
title: Wrapping up the Application
sidebar_label: Application
---

> code reference (init): https://github.com/iov-one/blog-tutorial/blob/master/cmd/blog/app/init.go

> code reference (app): https://github.com/iov-one/blog-tutorial/blob/master/cmd/blog/app/app.go

Weave layered approach could be represented as a pyramid. On layer 2, which is the bottom layer, modules(`x/`) are connected to layer 1 which messages are routed. Layer 1 abstracts: Key-Value Database config, authentication mechanism, time-based operation scheduler, and a genesis file that will be fed into the database.

Previous sections are about building a module(`layer 2`), now we will proceed to wrapping the module with blockchain application(`layer 1`). In order to run blockchain application, you need to wrap the module with components, such as decorators, and bind the module's handlers to the underlying blockchain application.

`cmd` folder is where layer 2 lives:

```sh
./cmd
├── blog
│   ├── Dockerfile
│   ├── Makefile
│   ├── app
│   │   ├── app.go
│   │   ├── codec.pb.go
│   │   ├── codec.proto
│   │   ├── crontask.go
│   │   ├── doc.go
│   │   ├── examples.go
│   │   ├── init.go
│   │   ├── msg.go
│   │   └── tx.go
│   ├── client
│   │   ├── client.go
│   │   ├── client_test.go
│   │   ├── conn.go
│   │   ├── errors.go
│   │   ├── helpers.go
│   │   ├── keys.go
│   │   ├── keys_test.go
│   │   ├── main_test.go
│   │   ├── testdata
│   │   ├── tx.go
│   │   ├── tx_test.go
│   │   ├── wallet.go
│   │   └── wallet_test.go
│   └── main.go
```

## Infrastucture folder

- **main.go**: main entry point for `cmd/blog` app. Contains command line tooling.
- **Makefile**`: contains build scripting and tooling commands.
- **app**: contains blockchain application components, such as `tx`, `crontask`, and `codec.proto`, of the main application.

This section explains where Weave gets its charm, and thus the *extensibility* feature that we have been mentioning over and over in this tutorial. A blockchain application generally depends on authentication mechanisms, networking, database, and application logic. Generally in blockchain application codebases, the only thing you can do is write an application with the already existing spaghetti projects and see if the solution works out for you. I wish you good luck in modifying a broadly used and older blockchain project to fit the requirements **¯\\\_(ツ)_/¯**

### Authenticator

`Authentication()`  chains authentication methods together.

```go
// Authenticator returns authentication with multisigs
// and public key signatues
func Authenticator() x.Authenticator {
    return x.ChainAuth(sigs.Authenticate{}, multisig.Authenticate{})
}

```

If you develop your own custom authentication mechanism, you need to define it here in `x.ChainAuth` options.

### Router

`Router(authFn x.Authenticator, issuer weave.Address)` registers all the modules routers to the application high-level router.

```go
// Router returns a default router
func Router(authFn x.Authenticator, issuer weave.Address) *app.Router {
    r := app.NewRouter()
    scheduler := cron.NewScheduler(CronTaskMarshaler)

    cash.RegisterRoutes(r, authFn, CashControl())
    sigs.RegisterRoutes(r, authFn)
    multisig.RegisterRoutes(r, authFn)
    migration.RegisterRoutes(r, authFn)
    validators.RegisterRoutes(r, authFn)
    blog.RegisterRoutes(r, authFn, scheduler)
    return r
}
```

### Query Router

`QueryRouter()` registers all the modules query routers to the application level router. Modules that will be queried from outside the blockchain itself must be registered in this method.

```go
// QueryRouter returns a default query router,
// allowing access to "/blog", "/auth", "/contracts", "/wallets", "/validators" and "/"
func QueryRouter() weave.QueryRouter {
    r := weave.NewQueryRouter()
    r.RegisterAll(
        cash.RegisterQuery,
        sigs.RegisterQuery,
        multisig.RegisterQuery,
        migration.RegisterQuery,
        orm.RegisterQuery,
        validators.RegisterQuery,
        blog.RegisterQuery,
    )
    return r
}
```

### Chain

`Chain(authFn x.Authenticator, minFee coin.Coin)` method chains the decorators in an absolute *execution order*. This defines the production line of blockhain application starting from transactions entry to the blockchains endpoints and transaction saving.

```go
// Chain returns a chain of decorators, to handle authentication,
// fees, logging, and recovery
func Chain(authFn x.Authenticator, minFee coin.Coin) app.Decorators {
    return app.ChainDecorators(
        utils.NewLogging(),
        utils.NewRecovery(),
        utils.NewKeyTagger(),
        // on CheckTx, bad tx don't affect state
        utils.NewSavepoint().OnCheck(),
        sigs.NewDecorator(),
        multisig.NewDecorator(authFn),
        cash.NewFeeDecorator(authFn, CashControl()),
        batch.NewDecorator(),
        utils.NewSavepoint().OnDeliver(),
    )
}
```

- `utils.NewKeyLogging` enables logging in application
- `utils.NewRecovery`: Recovery is a decorator to recover from panics in transactions, so we can log them as errors
- `utils.NewKeyTagger`:
  - **KeyTagger** is a decorator that records all _Set/Delete_ operations performed by its children and adds all those keys as DeliverTx tags
  - Tags is the hex-encoded key, value is **s** (for set) or *d* (for delete)
  - Desired behavior, impossible as tendermint will collapse multiple tags with same key: Tags are added as `Key=<bucket name>, Value=<hex of remainder>,` like `Key=cash, Value=00CAFE00`
- `utils.NewSavepoint`: explained in [](link)
- `sigs.NewDecorator`: returns a default authentication decorator, which appends the chainID before checking the signature, and requires at least one signature to be present
- `multisig.NewDecorator`: returns a default multisig decorator that manages multi-signature wallets
- `cash.NewFeeDecorator`: returns a static fee decorator with the given minimum fee, and all collected fees going to a default address
- `batch.NewDecorator`: returns a batch transanction decorator

### CRON stack

We will dive into CRON stack and its use in the next chapters, but there is no harm in giving it a peek.

Cron stack is a minimal router that runs differently from the main decorators that runs scheduled jobs in the background.

```go
// CronStack wires up a standard router with a cron specific decorator chain.
// This can be passed into BaseApp.
// Cron stack configuration is a subset of the main stack. It is using the same
// components but not all functionalities are needed or expected (ie no message
// fee).
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

As you can see, decorator of the cron stack does not contain any fee.

### Stack

Stack wires up a standard router with a standard decorator chain. This can be passed into BaseApp.

```go
// chain. This can be passed into BaseApp.
func Stack(issuer weave.Address, minFee coin.Coin) weave.Handler {
    authFn := Authenticator()
    return Chain(authFn, minFee).WithHandler(Router(authFn, issuer))
}
```

### Key Value Store

The application's database is provided by `CommitKvStore` method. `CommitKVStore` returns an initialized KVStore that persists the data to the named path.

```go
// CommitKVStore returns an initialized KVStore that persists
// the data to the named path.
func CommitKVStore(dbPath string) (weave.CommitKVStore, error) {
    // memory backed case, just for testing
    if dbPath == "" {
        return iavl.MockCommitStore(), nil
    }

    // Expand the path fully
    path, err := filepath.Abs(dbPath)
    if err != nil {
        return nil, errors.Wrapf(errors.ErrDatabase, "invalid database name: %s", path)
    }

    // Some external calls accidentally add a ".db", which is now removed
    path = strings.TrimSuffix(path, filepath.Ext(path))

    // Split the database name into it's components (dir, name)
    dir := filepath.Dir(path)
    name := filepath.Base(path)
    return iavl.NewCommitStore(dir, name), nil
}
```

## Application

`Application` method initializes the component with given application parameters.

```go
// Application constructs a basic ABCI application with
// the given arguments.
func Application(name string, h weave.Handler, tx weave.TxDecoder, dbPath string, debug bool) (app.BaseApp, error) {

    ctx := context.Background()
    kv, err := CommitKVStore(dbPath)
    if err != nil {
        return app.BaseApp{}, errors.Wrap(err, "cannot create database instance")
    }
    store := app.NewStoreApp(name, kv, QueryRouter(), ctx)
    // create a cron ticker for scheduled jobs
    ticker := cron.NewTicker(CronStack(), CronTaskMarshaler)
    base := app.NewBaseApp(store, tx, h, ticker, debug)
    return base, nil
}
```

## Controller

`Controllers` are helpers that capsulates complex application logic to an API that is used around application. If your module requires complex logic, I recommend you implement one. You can find examples of a controller at [x/cash](https://github.com/iov-one/weave/blob/master/x/cash/controller.go).

In `app.go` implement a method to create controllers. Here is the example from [app.go](https://github.com/iov-one/blog-tutorial/blob/master/cmd/blog/app/app.go#L32-L35)

```go
// CashControl returns a controller for cash functions
func CashControl() cash.Controller {
    return cash.NewController(cash.NewBucket())
}
```
