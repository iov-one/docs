---
id: overview
title: Tutorial Overview
sidebar_label: Overview
---

First of all, to understand weave design philosophy and for the sake of programming well designed software, I advise you to read this fine-grained article:
[Things I Learnt The Hard Way (in 30 Years of Software Development)](https://blog.juliobiason.net/thoughts/things-i-learnt-the-hard-way/)

To make theory more tangible, we will build a sample application alongside this tutorial, to demonstrate dealing with real-world constraints. The application is located in the [tutorial](https://github.com/iov-one/tutorial/ "Tutorial Repository") repository, to show how to create a self-contained app.

In this tutorial, you will learn how to serialize and model you data structures, define messages and handlers, expose queries, and read initial configuration from the genesis file. You will be able to build a new extension and tie it together with other extensions into a complete blockchain application.

Tutorial content is richened with PR discussions. If you follow the PR reviews you can have a clear understanding of how to design your own module and implement a blockchain app using weave piece by piece. And you can see how the development flow works and what are the issues you should have on your mind while moving forward.

Whenever you have questions in your mind about the internals check out [Weave]("https://github.com/iov-one/weave) source code. It is very well documented. Please feel free to add [issues](https://github.com/iov-one/weave/issues) if you think there is something under documented or confusing.
