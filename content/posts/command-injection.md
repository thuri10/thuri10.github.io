---
title: "Command injection"
date: 2022-02-28T14:27:14Z
draft: true
authors: []
tags: ["injection", "websec", "portswigger"]
toc:
    enable: true
    auto: true

code:
    maxShownLines: 100
---

## Lab: OS command injection, simple case

> This lab contains an OS command injection vulnerability in the product stock checker.
> To solve the lab, execute the whoami command to determine the name of the current user.

## Lab: Blind OS command injection with time delays

> This lab contains a blind OS command injection vulnerability in the feedback function.
> To solve the lab, exploit the blind OS command injection vulnerability to cause a 10 second delay.

## Lab: Blind OS command injection with output redirection

> This lab contains a blind OS command injection vulnerability in the feedback function.
> To solve the lab, execute the `whoami` command and retrieve the output.

## Lab: Blind OS command injection with out-of-band interaction

> This lab contains a blind OS command injection vulnerability in the feedback function.
> To solve the lab, exploit the blind OS command injection vulnerability to issue a DNS lookup to Burp Collaborator.

## Lab: Blind OS command injection with out-of-band data exfiltration

> This lab contains a blind OS command injection vulnerability in the feedback function.
> To solve the lab, execute the whoami command and exfiltrate the output via a DNS query to Burp Collaborator. You will need to enter the name of the current user to complete the lab.
