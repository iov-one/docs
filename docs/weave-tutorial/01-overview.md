---
id: overview
title: Tutorial Overview
sidebar_label: Overview
---

First of all, to understand the design philosophy behind Weave and in the interest of good software design, a recommended read is:
[Things I Learnt The Hard Way (in 30 Years of Software Development)](https://blog.juliobiason.net/thoughts/things-i-learnt-the-hard-way/)

To make the theory more tangible, alongside this tutorial we will build a sample application, to demonstrate dealing with real-world constraints. The application, which is located in the [tutorial](https://github.com/iov-one/tutorial/ "Tutorial Repository") repository, shows how to create a self-contained app.

In this tutorial, you will learn how to serialize and model your data structures, define messages and handlers, expose queries, and read initial configuration from the genesis file. In the end, you will be able to build a new extension and tie it together with other extensions into a complete blockchain application.

Tutorial content is enriched by Pull Request (PR) discussions. If you follow the PR reviews you will develop a clear understanding of how to design your module and implement a blockchain app using Weave, piece by piece. And you can see how the development flow works and what are the issues you should have on your mind while moving forward.

If you have questions about the internal workings of Weave, you should check out the [source code]("https://github.com/iov-one/weave), which is very well documented. Please feel free to add to the list of [issues](https://github.com/iov-one/weave/issues) if you think there is something insufficiently documented or that is confusing.
