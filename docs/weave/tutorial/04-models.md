---
id: models
title: Models
sidebar_label: Models
---

> code reference (model): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/model.go

> code reference (test): https://github.com/iov-one/blog-tutorial/blob/master/x/blog/model_test.go

We defined our state in [codec section](weave/tutorial/03-codec.md). Models are wrapped codec with functionalities to integrate codec with Weave.
First ensure our `User` fulfills morm.Model:

```go
var _ morm.Model = (*User)(nil)
```

This is just a helper that enforces User model to fulfill morm.Model interface so that if you forget to implement a method, the compiler will complain. Guaranteeing it _I am trying to implement this interface_.

Now let's explain our model's identity:

## Auto incremented identities

`morm.Model` covers auto-incremented IDs for you. All you have to do is define `GetID` and `SetID` methods. If you defined `bytes id = 2 [(gogoproto.customname) = "ID"];` on `codec.proto` you do not even need to write `GetID` method by yourself. Thanks to prototool it will be generated automatically. You will only need to define `SetID` method.

## Custom identity

To use your custom identity, do not define `bytes id = 2 [(gogoproto.customname) = "ID"];` on `codec.proto`. You can use any other field as an index with logic on top. Just write `SetID` and `GetID` logic that uses your index.

Now you see how indexing works in Weave. Let's see the other wonders of the framework.

## Validation

We will want to fill in these Validate methods to enforce any invariants we demand of the data to keep our database clean. Anyone who has spent much time dealing with production applications knows how “invalid data” can start creeping in without a strict database schema, this is what we do in code.

We can do some basic checks and return an error if any of them does not pass:

```go
func (m *User) Validate() error {
    var errs error

    errs = errors.AppendField(errs, "Metadata", m.Metadata.Validate())
    errs = errors.AppendField(errs, "ID", isGenID(m.ID, false))

    if !validUsername(m.Username) {
        errs = errors.AppendField(errs, "Username", errors.ErrModel)
    }

    if !validBio(m.Bio) {
        errs = errors.AppendField(errs, "Bio", errors.ErrModel)
    }

    if err := m.RegisteredAt.Validate(); err != nil {
        errs = errors.AppendField(errs, "RegisteredAt", m.RegisteredAt.Validate())
    } else if m.RegisteredAt == 0 {
        errs = errors.AppendField(errs, "RegisteredAt", errors.ErrEmpty)
    }

    return errs
}
```

Here is a sample username validation function:

```go
var validUsername = regexp.MustCompile(`^[a-zA-Z0-9_.-]{4,16}$`).MatchString
```

Note that model validation is run just before [saving](https://github.com/iov-one/weave/blob/v0.21.0/orm/model_bucket.go#L207-L209) the model instance to data store.

If you need more complex validation rules for models you can implement custom validation function which uses `github.com/iov-one/weave/errors` as error handling.

We recommend using `errors.AppendField` as it enables multi-error validation so no information about the error's cause gets lost.

## Errors

Here are some Weave errors taken from [weave/errors](https://github.com/iov-one/weave/blob/master/errors/errors.go 'Weave errors'):

```go
// ErrUnauthorized is used whenever a request without sufficient
// authorization is handled.
ErrUnauthorized = Register(2, "unauthorized")

// ErrNotFound is used when a requested operation cannot be completed
// due to missing data.
ErrNotFound = Register(3, "not found")

// ErrMsg is returned whenever an event is invalid and cannot be
// handled.
ErrMsg = Register(4, "invalid message")
```

What is with these `ErrXYZ()` calls, you may think? Well, we could return a “normal” error like `errors.New("fail")`, but we wanted two more features. First of all, it helps debugging enormously to have a stack trace of where the error occurred. For this, we use [pkg/errors](https://github.com/pkg/errors 'go/pkg') that attach a stack trace to the error that can optionally be printed later with a `Printf("%+v", err)`. We also want to return a unique abci error code, which may be interpreted by client applications, either programmatically or to provide translations of the error message client side.

For these reasons, Weave provides some utility methods and common error types in the errors [package](https://godoc.org/github.com/iov-one/weave/errors). The ABCI Code attached to the error is then returned in the [DeliverTx Result](https://github.com/iov-one/weave/blob/v0.20.0/abci.go#L114-L126).

Every package ideally can define its own custom error types and error codes, generally in a file called [errors.go](https://github.com/iov-one/weave/blob/master/x/sigs/errors.go). The key elements are:

```go
// ABCI Response Codes
// tutorial reserves 400 ~ 420.
const (
    CodeInvalidText    uint32 = 400
)

var (
    errTitleTooLong       = fmt.Errorf("Title is too long")
    errInvalidAuthorCount = fmt.Errorf("Invalid number of blog authors")
)

// Error code with no arguments, check on code not particular type
func ErrTitleTooLong() error {
    return errors.WithCode(errTitleTooLong, CodeInvalidText)
}
func IsInvalidTextError(err error) bool {
    return errors.HasErrorCode(err, CodeInvalidText)
}

// You can also prepend a variable message using WithLog
func ErrInvalidAuthorCount(count int) error {
    msg := fmt.Sprintf("authors=%d", count)
    return errors.WithLog(msg, errInvalidAuthorCount, CodeInvalidAuthor)
```

## Testing Model Validation

Most of the testing logic in Weave is repetetive and similar. What you do is defining successful and failure cases for the validation with different field values. Here is a straight forward example that will make you understand quickly:

```go
func TestValidateUser(t *testing.T) {
	now := weave.AsUnixTime(time.Now())

	cases := map[string]struct {
		model    orm.Model
		wantErrs map[string]*errors.Error
	}{
		"success": {
			model: &User{
				Metadata:     &weave.Metadata{Schema: 1},
				ID:           weavetest.SequenceID(1),
				Username:     "Crypt0xxx",
				Bio:          "Best hacker in the universe",
				RegisteredAt: now,
			},
			wantErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           nil,
				"Username":     nil,
				"Bio":          nil,
				"RegisteredAt": nil,
			},
		},
		// TODO add missing metadata test
		"success no bio": {
			model: &User{
				Metadata:     &weave.Metadata{Schema: 1},
				ID:           weavetest.SequenceID(1),
				Username:     "Crypt0xxx",
				RegisteredAt: now,
			},
			wantErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           nil,
				"Username":     nil,
				"Bio":          nil,
				"RegisteredAt": nil,
			},
		},
		"failure missing ID": {
			model: &User{
				Metadata:     &weave.Metadata{Schema: 1},
				Username:     "Crypt0xxx",
				Bio:          "Best hacker in the universe",
				RegisteredAt: now,
			},
			wantErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           errors.ErrEmpty,
				"Username":     nil,
				"Bio":          nil,
				"RegisteredAt": nil,
			},
		},
		"failure missing username": {
			model: &User{
				Metadata:     &weave.Metadata{Schema: 1},
				ID:           weavetest.SequenceID(1),
				Bio:          "Best hacker in the universe",
				RegisteredAt: now,
			},
			wantErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           nil,
				"Username":     errors.ErrModel,
				"Bio":          nil,
				"RegisteredAt": nil,
			},
		},
		"failure missing registered at": {
			model: &User{
				Metadata: &weave.Metadata{Schema: 1},
				ID:       weavetest.SequenceID(1),
				Username: "Crypt0xxx",
				Bio:      "Best hacker in the universe",
			},
			wantErrs: map[string]*errors.Error{
				"Metadata":     nil,
				"ID":           nil,
				"Username":     nil,
				"Bio":          nil,
				"RegisteredAt": errors.ErrEmpty,
			},
		},
	}
	for testName, tc := range cases {
		t.Run(testName, func(t *testing.T) {
			err := tc.model.Validate()
			for field, wantErr := range tc.wantErrs {
				assert.FieldError(t, err, field, wantErr)
			}
		})
	}
}
```

_"I want to point out again and make it persistent in your mind: Extensive Validation is crucial."_
