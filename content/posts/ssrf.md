---
title: "Server side request forgery"
date: 2023-09-28T14:27:14Z
draft: true
authors: ["Thuri"]
tags: ["rop", "RopEmporium"]
toc:
    enable: true
    auto: false

code:
    maxShownLines: 100
---

Server side vulnerabilities are those ones that allow an attacker to manipulate requests and responses on the server.

## Lab: Basic SSRF against the local server

> This lab has a stock check feature which fetches data from an internal system.
> To solve the lab, change the stock check URL to access the admin interface at `http://localhost/admin `and delete the user carlos.
