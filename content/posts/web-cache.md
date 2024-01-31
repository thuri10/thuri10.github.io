---
title: "Web cache poisoning vulnerabilities"
date: 2023-09-28T14:27:14Z
draft: true
authors: ["Thuri"]
tags: ["websec", "cachePoisoning", "portswigger"]
toc:
    enable: true
    auto: false
code:
    maxShownLines: 100
---

## Lab 1: Web cache poisoning with an unkeyed header

> This lab is vulnerable to web cache poisoning because it handles input from an unkeyed header in an unsafe way. An unsuspecting user regularly visits the site's home page. To solve this lab, poison the cache with a response that executes alert(document.cookie) in the visitor's browser

## Lab 2: Web cache poisoning with an unkeyed cookie

> This lab is vulnerable to web cache poisoning because cookies aren't included in the cache key. An unsuspecting user regularly visits the site's home page. To solve this lab, poison the cache with a response that executes alert(1) in the visitor's browser.

## Lab 3: Web cache poisoning with multiple headers

> This lab contains a web cache poisoning vulnerability that is only exploitable when you use multiple headers to craft a malicious request. A user visits the home page roughly once a minute

## Lab 4: Targeted web cache poisoning using an unknown header

> This lab is vulnerable to web cache poisoning. A victim user will view any comments that you post. To solve this lab, you need to poison the cache with a response that executes alert(document.cookie) in the visitor's browser.

## Lab 5: Web cache poisoning via an unkeyed query string

> This lab is vulnerable to web cache poisoning because the query string is unkeyed. A user regularly visits this site's home page using Chrome.

## Lab 6: Web cache poisoning via an unkeyed query parameter

> This lab is vulnerable to web cache poisoning because it excludes a certain parameter from the cache key. A user regularly visits this site's home page using Chrome.

## Lab 7: Parameter cloaking

> This lab is vulnerable to web cache poisoning because it excludes a certain parameter from the cache key. There is also inconsistent parameter parsing between the cache and the back-end. A user regularly visits this site's home page using Chrome.

## Lab 8: Web cache poisoning via a fat GET request

> This lab is vulnerable to web cache poisoning. It accepts GET requests that have a body, but does not include the body in the cache key. A user regularly visits this site's home page using Chrome.

## Lab 9: URL normalization

> This lab contains an XSS vulnerability that is not directly exploitable due to browser URL-encoding.To solve the lab, take advantage of the cache's normalization process to exploit this vulnerability. Find the XSS vulnerability and inject a payload that will execute alert(1) in the victim's browser
