---
id: batch-txs
title: Batch Transactions
sidebar_label: Batch Transactions
---

I don't think you will have the patience to wait for thousands of transactions to post one by one, right?

Via wrapping vanilla `Messages` into a `repeated` **Union** object that includes variety of messages, we can achieve the ease-of-use of batch transactions; this will prevent the blockhain from being flooded by thousands of messages.

```protobuf
// ExecuteBatchMsg encapsulates multiple messages to support batch transaction
message ExecuteBatchMsg {
  message Union {
    // No recursive batches!
    oneof sum {
      cash.SendMsg cash_send_msg = 51;
      multisig.CreateMsg multisig_create_msg = 56;
      multisig.UpdateMsg multisig_update_msg = 57;

      blog.CreateUserMsg blog_create_user_msg = 100;
    }
  }
  repeated Union messages = 1 [(gogoproto.nullable) = false];
}
```

Batch transaction's skeleton is defined with `ExecuteBatchMsg`. If you need to have the benefits of batch messages insert modules here.

**Rule**: never write recursive batch messages.

Here is an example from [blog](https://github.com/iov-one/blog-tutorial/blob/master/cmd/blog/app/msg.go) that bridges `ExecuteBatchMsg` protobuf type into something usable by the batch extension:

```go
// Boiler-plate needed to bridge the ExecuteBatchMsg protobuf type into something usable by the batch extension
var _ batch.Msg = (*ExecuteBatchMsg)(nil)

// Path returns path of execute message
func (*ExecuteBatchMsg) Path() string {
  return batch.PathExecuteBatchMsg
}

// Validate validates execute message
func (msg *ExecuteBatchMsg) Validate() error {
  return batch.Validate(msg)
}

// MsgList decode msg.Messages to weave.Msg array
func (msg *ExecuteBatchMsg) MsgList() ([]weave.Msg, error) {
  var err error
  messages := make([]weave.Msg, len(msg.Messages))
  for i, m := range msg.Messages {
    messages[i], err = weave.ExtractMsgFromSum(m.GetSum())
    if err != nil {
      return nil, err
    }
  }
  return messages, nil
}
```
