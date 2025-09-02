---
title: "Cache Poisoning"
date: 2025-08-21T16:59:32+03:00
draft: true
authors: [Thuri]
lightgallery: true
tags: ["appsec", "websec", "portswigger", "java"]
summary: "Cache Poisoning."
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

{{< image src="/cachepoison/lab1-cache.png" caption="Cache Unkeyed Header" >}}

from the request, the server is caching the request as shown by the `hit` header.

By using param miner, we identify one of the unkeyed headers, `X-Forwarded-Host` as shown in the image below

{{< image src="/cachepoison/lab1-xhost.png" caption="X-Forwarded-Host" >}}

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

> [info]
> This lab is vulnerable to web cache poisoning because the query string is unkeyed. A user regularly visits this site's home page using Chrome
> To solve the lab, poison the home page with a response that executes alert(1) in the victim's browser.

### Web cache poisoning via an unkeyed query parameter

> [info]
> To solve the lab, poison the home page with a response that executes alert(1) in the victim's browser.
> To solve the lab, poison the cache with a response that executes alert(1) in the victim's browser.

### Parameter cloaking

> [info]
> This lab is vulnerable to web cache poisoning because it excludes a certain parameter from the cache key. There is also inconsistent parameter parsing between the cache and the back-end. A user regularly visits this site's home page using Chrome.
> To solve the lab, use the parameter cloaking technique to poison the cache with a response that executes alert(1) in the victim's browser.

### Web cache poisoning via a fat GET request

> [info]
> This lab is vulnerable to web cache poisoning. It accepts GET requests that have a body, but does not include the body in the cache key. A user regularly visits this site's home page using Chrome.

### URL normalization

> [info]
> This lab contains an XSS vulnerability that is not directly exploitable due to browser URL-encoding.
> To solve the lab, take advantage of the cache's normalization process to exploit this vulnerability. Find the XSS vulnerability and inject a payload that will execute alert(1) in the victim's browser. Then, deliver the malicious URL to the victim.

### Web cache poisoning to exploit a DOM vulnerability via a cache with strict cacheability criteria

> [info]
> This lab contains a DOM-based vulnerability that can be exploited as part of a web cache poisoning attack. A user visits the home page roughly once a minute. Note that the cache used by this lab has stricter criteria for deciding which responses are cacheable, so you will need to study the cache behavior closely.

### Combining web cache poisoning vulnerabilities

> [info]
> This lab is susceptible to web cache poisoning, but only if you construct a complex exploit chain.
> A user visits the home page roughly once a minute and their language is set to English. To solve this lab, poison the cache with a response that executes alert(document.cookie) in the visitor's browser.

### Cache key injection

> [info]
> This lab contains multiple independent vulnerabilities, including cache key injection. A user regularly visits this site's home page using Chrome.
> To solve the lab, combine the vulnerabilities to execute alert(1) in the victim's browser. Note that you will need to make use of the Pragma: x-get-cache-key header in order to solve this lab.

### Internal cache poisoning

> [info]
> This lab is vulnerable to web cache poisoning. It uses multiple layers of caching. A user regularly visits this site's home page using Chrome.
> To solve the lab, poison the internal cache so that the home page executes alert(document.cookie) in the victim's browser.
