---
title: "Cache Poisoning"
date: 2025-07-15T16:59:32+03:00
draft: true
authors: [Thuri]
lightgallery: true
tags: ["appsec", "websec", "portswigger", "java"]
summary: "Deserialization."
toc:
    enable: true
    auto: false

description: "Cache Poisoning"
---

## Introduction

## Labs

### Web cache poisoning with an unkeyed header

> [!NOTE]
> This lab is vulnerable to web cache poisoning because it handles input from an unkeyed header in an unsafe way. An unsuspecting user regularly visits the site's home page. To solve this lab, poison the cache with a response that executes alert(document.cookie) in the visitor's browser.

To solve this let repeat the request several times

{{< image src="/cachepoison/lab1-cache.png" caption="" >}}

from the request, the server is caching the request as shown by the `hit` header.

By using param miner, we identify one of the unkeyed headers, `X-Forwarded-Host` as shown in the image below

![X-Forwarded-Host](/cachepoison/lab1-xhost.png)

Now being able to control the server hosting the javascript file, we can load the malicious payload

```javascript
<script
    type="text/javascript"
    src="//localhost/resources/js/tracking.js"
></script>
```

Looking at the `tracking.js`, we set the payload `<script>alert(document.cookie)</script>`. By controlling the server location and sending the request several times, we are to poison the cache.

### Web cache poisoning with an unkeyed cookie

> [!NOTE]
> This lab is vulnerable to web cache poisoning because cookies aren't included in the cache key. An unsuspecting user regularly visits the site's home page. To solve this lab, poison the cache with a response that executes alert(1) in the visitor's browser.

Looking at the response, we are able to get unkeyed cookie

```html
<script>
    data = {
        host: "0a2d00d1034668fb80b553bb000c00fe.web-security-academy.net",
        path: "/",
        frontend: "prod-cache-01",
    };
</script>
```

By setting the cookie header `Cookie: fehost=cachebuster;` we are able to alter the response data

```html
<script>
    data = {
        host: "0a2d00d1034668fb80b553bb000c00fe.web-security-academy.net",
        path: "/",
        frontend: "cachebuster",
    };
</script>
```

Now we can poison the cache using `cachebuster-alert(1)-cachebuster` payload and execute in the visitor's browser.

### Web cache poisoning with multiple headers

> [!NOTE]
> This lab contains a web cache poisoning vulnerability that is only exploitable when you use multiple headers to craft a malicious request. A user visits the home page roughly once a minute. To solve this lab, poison the cache with a response that executes alert(document.cookie) in the visitor's browser.

### Targeted web cache poisoning using an unknown header

> [!NOTE]
> This lab is vulnerable to web cache poisoning. A victim user will view any comments that you post. To solve this lab, you need to poison the cache with a response that executes alert(document.cookie) in the visitor's browser. However, you also need to make sure that the response is served to the specific subset of users to which the intended victim belongs.

### Web cache poisoning via an unkeyed query string

### Web cache poisoning via an unkeyed query parameter

### Parameter cloaking

### Web cache poisoning via a fat GET request

### URL normalization

### Web cache poisoning to exploit a DOM vulnerability via a cache with strict cacheability criteria

### Combining web cache poisoning vulnerabilities

### Cache key injection

### Internal cache poisoning
