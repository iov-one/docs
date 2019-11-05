---
id: messages
title: Messages
sidebar_label: Messages
---

> code reference (msg): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/msg.go

> code reference (test): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/msg_test.go

## Messages vs. Transactions

As we've seen before, a message is a request to make a change; it's the basic element of a blockchain. A transaction is that which contains a message along with metadata and authorization information, such as fees, signatures, nonces, and time-to-live.

A [Transaction](https://godoc.org/github.com/iov-one/weave#Tx) is fundamentally defined as anything persistent that holds a message:

```go
type Tx interface {
    Persistent
    // GetMsg returns the action we wish to communicate
    GetMsg() (Msg, error)
}
```

And every application can extend Tx with additional functionality, such as [Signatures](https://godoc.org/github.com/iov-one/weave/x/sigs#SignedTx), [Fees](https://godoc.org/github.com/iov-one/weave/x/cash#FeeTx), or anything else your application needs. The data placed in the Transaction is meant to be anything that applies to all modules, and is processed by a **Middleware**.

A [Message](https://godoc.org/github.com/iov-one/weave#Msg) is also persistent and can be pretty much anything that an extension defines. The only necessary feature of a Message is `Path() string` method which provides the required route to the Handler.

When we define a concrete transaction type for one application, we define it in protobuf with a set of possible messages that it can contain. Every application can add optional fields to the transaction and allow a different set of messages, and the Handlers and Decorators work orthogonally to this, regardless of the **concrete** Transaction type.

## Defining Messages

Messages are similar to the `POST`, `DELETE`, `PUT` endpoints in a typical REST API. They are the way to effect a change in the system. Ignoring the issue of authentication and rate limitation, which is handled by the Decorators / Middleware, when we design Messages, we focus on all possible state transitions and the information they need in order to proceed.

In the blog example, we can imagine these possible messages:

- Create user
- Create blog
- Create article
- Delete article

## Dive into Code

First create your `msg.go` file. This is where the magic will happen.
Then create an **init()** function and register to migration schema, we will explain `migration` concept in proceeding chapters:

```go
func init() {
    // Migration needs to be registered for every message introduced in the codec.
    migration.MustRegister(1, &CreateUserMsg{}, migration.NoModification)
    migration.MustRegister(1, &CreateBlogMsg{}, migration.NoModification)
    migration.MustRegister(1, &CreateArticleMsg{}, migration.NoModification)
    migration.MustRegister(1, &DeleteArticleMsg{}, migration.NoModification)
}
```

Define path that will be used for routing messages to Handler:

```go
// Path implements weave.Msg interface by returning the routing path for this message
func (CreateUserMsg) Path() string {
    return "blog/create_user"
}
```

After that ensure your message is a `weave.Msg`:

```go
var _ weave.Msg = (*CreateOrderBookMsg)(nil)
```

## Validation

While validation of data models is much more like SQL constraints, for example, “**max length 20**”, “**not null**”,  and “**constaint foo > 3**”, validation of messages is validating potentially malicious data coming in from external sources and should be validated more thoroughly. One may want to use regexp to avoid control characters or null bytes in a “string” input. Maybe restrict it to alphanumeric or ASCII characters, strip out HTML, or allow full UTF-8. Addresses must be checked to be the valid length. Amount being sent to be positive (else I send you -5 ETH and we have a **TakeMsg**, instead of **SendMsg**).

Validate method on a message must only provide a sanity check for the data it represents and must not rely on any external state. Message can only ensure the data format and hardcoded logic. It cannot validate business logic. Business logic is validated in a **handler**. Also time related validation must be done in **handler** because no current context information, which contains time information, is not present in the message validation context.

The validation of messages should be much more thorough and well tested than the validation on data models, which is as much documentation of acceptable values as it is runtime security.

`Validate` method of `CreateUserMsg`:

```go
// Validate ensures the CreateUserMsg is valid
func (m CreateUserMsg) Validate() error {
    var errs error

    errs = errors.AppendField(errs, "Metadata", m.Metadata.Validate())
    if !validUsername(m.Username) {
        errs = errors.AppendField(errs, "Username", errors.ErrModel)
    }

    if !validBio(m.Bio) {
        errs = errors.AppendField(errs, "Bio", errors.ErrModel)
    }

    return errs
}
```

`CreateUserMsg` does not contain any ID because ID will be assigned to the object during runtime. External ID validation is demonstrated on `CreateArticleMsg`:

```go
// Validate ensures the CreateArticleMsg is valid
func (m CreateArticleMsg) Validate() error {
    var errs error

    //errs = errors.AppendField(errs, "Metadata", m.Metadata.Validate())
    errs = errors.AppendField(errs, "BlogID", isGenID(m.BlogID, false))
    ...
```

Weave buckets use keys as 8 bytes so ID must be 8 bytes long:

```go
// isGenID ensures that the ID is 8 byte input.
// if allowEmpty is set, we also allow empty
// TODO change with validateSequence when weave 0.22.0 is released
func isGenID(id []byte, allowEmpty bool) error {
    if len(id) == 0 {
        if allowEmpty {
            return nil
        }
        return errors.Wrap(errors.ErrEmpty, "missing id")
    }
    if len(id) != 8 {
        return errors.Wrap(errors.ErrInput, "id must be 8 bytes")
    }
    return nil
}
```

## Testing Message Validation

Testing logic of message validation is not different than model validation testing. First layout success case then the expected failure cases with different field values:

```go
func TestValidateCreateUserMsg(t *testing.T) {
    cases := map[string]struct {
		msg      weave.Msg
		wantErrs map[string]*errors.Error
	}{
		"success": {
			msg: &CreateUserMsg{
				Metadata: &weave.Metadata{Schema: 1},
				Username: "Crpto0X",
				Bio:      "Best hacker in the universe",
			},
			wantErrs: map[string]*errors.Error{
				"Metadata": nil,
				"Username": nil,
				"Bio":      nil,
			},
		},
		// add missing metadata test
		"failure missing username": {
			msg: &CreateUserMsg{
				Metadata: &weave.Metadata{Schema: 1},
				Bio:      "Best hacker in the universe",
			},
			wantErrs: map[string]*errors.Error{
				"Metadata": nil,
				"Username": errors.ErrModel,
				"Bio":      nil,
			},
		},
	}
	for testName, tc := range cases {
		t.Run(testName, func(t *testing.T) {
			err := tc.msg.Validate()
			for field, wantErr := range tc.wantErrs {
				assert.FieldError(t, err, field, wantErr)
			}
		})
	}
}
```

Note that message validation is run in `Validate` step of handlers which we will explain in next [sections](weave/tutorial/07-handlers.md#validation).

**Remember:** the more validation, the more solid your application becomes. If you **constrain** possible inputs, you can write **less** validation in the business logic.
