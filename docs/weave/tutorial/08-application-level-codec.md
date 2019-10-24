---
id: app-level-codec
title: Application Level Codec
sidebar_label: Application Level Codec
---

> code reference: https://github.com/iov-one/blog-tutorial/blob/master/cmd/blog/app/codec.proto

We created the modules that are necessary for application that did not exist as IOV-provided modules. However, the blog modules would not be enough by themselves to provide the necessary functionality such as sending tokens, multisig contracts, and migration logic. So we need to put together all these modules somehow. And on the other side we still have not done anything to define the transaction. In the next sections we will explain how put the modules together in a layered approach and then how to prepare the blockchain infrastructure. First, however, we define the skeleton of application specific transaction and which messages the blockchain will support.

As you remember, we created a `codec` in [Codec documentation](weave/tutorial/codec) and defined the messages that blog application will support. This wrapping and putting together of codec files takes place at `app/codec` file.

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

As you can see in the last field, `oneof sum`, messages are defined. `oneof sum` means `Tx` will contain one (and only one) of the following messages. Apart from that, **Tx** contains middleware messages, some examples of middlewares are _fee info_, _signatures_, and _multisig_.
When extending the **Tx** and adding custom modules, follow these rules:

- Range 1-50 is reserved for middlewares
- Range 51+ is reserved for different message types
- Keep the **same numbers** for the same message types in Weave-based applications to sustain compatibility between blockchains. For example, `FeeInfo` field is used by both and indexed at first position
- Skip unused fields (leave index unused or comment out for clarity)
- When there is a gap in message sequence numbers - that most likely means some old fields got deprecated. This is done to maintain binary compatibility

You must be thinking: **why do the number tags matter anyway?**

With this [link](https://developers.google.com/protocol-buffers/docs/proto3#assigning-field-numbers), I encourage you to find your own enlightment.
