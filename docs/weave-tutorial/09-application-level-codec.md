---
id: app-level-codec
title: Application Level Codec
sidebar_label: Application Level Codec
---

We created a `codec` in [Codec documentation](weave-tutorial/codec), only thing left for the codec is wrapping it up with a generalizable transaction format. With this we will define a standart way of communications in Weave based chains. Application level codec is placed at `cmd/blog` where the application wraps up.

```protobuf
message Tx {
  // Enables coin.GetFees()
  cash.FeeInfo fees = 1;
  //StdSignature represents the signature, the identity of the signer
  // (the Pubkey), and a sequence number to prevent replay attacks.
  repeated sigs.StdSignature signatures = 2;
  // ID of a multisig contract.
  repeated bytes multisig = 4;
  // sum defines over all allowed messages on this chain.
  oneof sum {
    cash.SendMsg cash_send_msg = 51;
    multisig.CreateMsg multisig_create_msg = 56;
    multisig.UpdateMsg multisig_update_msg = 57;
    validators.ApplyDiffMsg validators_apply_diff_msg = 58;
    ExecuteBatchMsg execute_batch_msg = 60;
    migration.UpgradeSchemaMsg migration_upgrade_schema_msg = 69;

    blog.CreateUserMsg blog_create_user_msg = 100;
    blog.CreateBlogMsg blog_create_blog_msg = 101;
    blog.ChangeBlogOwnerMsg blog_change_blog_owner_msg = 102;
    blog.CreateArticleMsg blog_create_article_msg = 103;
    blog.DeleteArticleMsg blog_delete_article_msg = 104;
    blog.CancelDeleteArticleTaskMsg blog_cancel_delete_article_task_msg = 105;
    blog.CreateCommentMsg blog_create_comment_msg = 106;
    blog.CreateLikeMsg blog_create_like_msg = 107;
  }
}
```

**Tx** contains the message the general application message. It cointains fee info, signatures, multisig, and one of the module messages. When extending the **Tx**, follow the rules:

- Range 1-50 is reserved for middlewares
- Range 51+ is reserved for different message types
- Keep the **same numbers** for the same message types in Weave based applications to sustain compatibility between blockchains. For example, `FeeInfo` field is used by both and indexed at first position.
- Skip unused fields (leave index unused or comment out for clarity)
- When there is a gap in message sequence numbers - that most likely means some old fields got deprecated. This is done to maintain binary compatibility.

You must be thinking: **why the number tags matter anyway?**

Hereby with this [link](https://developers.google.com/protocol-buffers/docs/proto3#assigning-field-numbers), I encourage you to find your own enlightment.

## Batch transactions

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
