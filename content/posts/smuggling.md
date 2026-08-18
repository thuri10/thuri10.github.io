---
title: "HTTP Request Smuggling Basics"
date: 2025-08-29T11:41:42+03:00
draft: true
lightgallery: true
authors: [Thuri]
tags: ["appsec", "websec", "portswigger", "Smuggling", "HTTP"]
summary: "HTTP Request Smuggling Basics"
toc:
    enable: true
    auto: false
code:
    maxShownLines: 150
description: "HTTP Request Smuggling"
---

## Introduction

HTTP request smuggling is a technique that interfers with the way the website procceses sequences of HTTP requests that are received from one or more users. Request smuggling vulnerabilities allows an attacker to bypass security controls, gain unathorized access to sensitive data and compromise other users of the website.

## Research

Some of the previous researches done on the HTTP Request smuggling are:

1. HTTP desync attacks: Request smuggling reborn
2. HTTP/2: The sequel is always worse
3. Browser-powered desnyc attacks: A new frontier in HTTP request smuggling

## Exploitation

### HTTP request smuggling, confirming a CL.TE vulnerability via differential responses

> This lab involves a front-end and back-end server, and the front-end server doesn't support chunked encoding.To solve the lab, smuggle a request to the back-end server, so that a subsequent request for / (the web root) triggers a 404 Not Found response.

### HTTP request smuggling, confirming a TE.CL vulnerability via differential responses

> This lab involves a front-end and back-end server, and the back-end server doesn't support chunked encoding. To solve the lab, smuggle a request to the back-end server, so that a subsequent request for / (the web root) triggers a 404 Not Found response.

### Exploiting HTTP request smuggling to bypass front-end security controls, CL.TE vulnerability

> This lab involves a front-end and back-end server, and the front-end server doesn't support chunked encoding. There's an admin panel at /admin, but the front-end server blocks access to it. To solve the lab, smuggle a request to the back-end server that accesses the admin panel and deletes the user carlos.

### Exploiting HTTP request smuggling to bypass front-end security controls, TE.CL vulnerability

> This lab involves a front-end and back-end server, and the back-end server doesn't support chunked encoding. There's an admin panel at /admin, but the front-end server blocks access to it. To solve the lab, smuggle a request to the back-end server that accesses the admin panel and deletes the user carlos.

### Exploiting HTTP request smuggling to reveal front-end request rewriting

> This lab involves a front-end and back-end server, and the front-end server doesn't support chunked encoding. There's an admin panel at /admin, but it's only accessible to people with the IP address 127.0.0.1. The front-end server adds an HTTP header to incoming requests containing their IP address. It's similar to the X-Forwarded-For header but has a different name. To solve the lab, smuggle a request to the back-end server that reveals the header that is added by the front-end server. Then smuggle a request to the back-end server that includes the added header, accesses the admin panel, and deletes the user carlos.

### Exploiting HTTP request smuggling to capture other users' requests

> This lab involves a front-end and back-end server, and the front-end server doesn't support chunked encoding. To solve the lab, smuggle a request to the back-end server that causes the next user's request to be stored in the application. Then retrieve the next user's request and use the victim user's cookies to access their account.

### Exploiting HTTP request smuggling to deliver reflected XSS

> This lab involves a front-end and back-end server, and the front-end server doesn't support chunked encoding. The application is also vulnerable to reflected XSS via the User-Agent header. To solve the lab, smuggle a request to the back-end server that causes the next user's request to receive a response containing an XSS exploit that executes alert(1).

### Response queue poisoning via H2.TE request smuggling

> This lab is vulnerable to request smuggling because the front-end server downgrades HTTP/2 requests even if they have an ambiguous length.To solve the lab, delete the user carlos by using response queue poisoning to break into the admin panel at /admin. An admin user will log in approximately every 15 seconds. The connection to the back-end is reset every 10 requests, so don't worry if you get it into a bad state - just send a few normal requests to get a fresh connection.

### H2.CL request smuggling

> This lab is vulnerable to request smuggling because the front-end server downgrades HTTP/2 requests even if they have an ambiguous length. To solve the lab, perform a request smuggling attack that causes the victim's browser to load and execute a malicious JavaScript file from the exploit server, calling alert(document.cookie). The victim user accesses the home page every 10 seconds.

### HTTP/2 request smuggling via CRLF injection

> This lab is vulnerable to request smuggling because the front-end server downgrades HTTP/2 requests and fails to adequately sanitize incoming headers. To solve the lab, use an HTTP/2-exclusive request smuggling vector to gain access to another user's account. The victim accesses the home page every 15 seconds.

### HTTP/2 request splitting via CRLF injection

> This lab is vulnerable to request smuggling because the front-end server downgrades HTTP/2 requests and fails to adequately sanitize incoming headers. To solve the lab, delete the user carlos by using response queue poisoning to break into the admin panel at /admin. An admin user will log in approximately every 10 seconds.

### 0.CL request smuggling

> This lab is vulnerable to 0.CL request smuggling. Carlos visits the homepage every five seconds. To solve the lab, exploit the vulnerability to execute alert() in his browser.

### CL.0 request smuggling

> This lab is vulnerable to CL.0 request smuggling attacks. The back-end server ignores the Content-Length header on requests to some endpoints. To solve the lab, identify a vulnerable endpoint, smuggle a request to the back-end to access to the admin panel at /admin, then delete the user carlos.

### HTTP request smuggling, basic CL.TE vulnerability

> This lab involves a front-end and back-end server, and the front-end server doesn't support chunked encoding. The front-end server rejects requests that aren't using the GET or POST method. To solve the lab, smuggle a request to the back-end server, so that the next request processed by the back-end server appears to use the method GPOST.

### HTTP request smuggling, basic TE.CL vulnerability

> This lab involves a front-end and back-end server, and the back-end server doesn't support chunked encoding. The front-end server rejects requests that aren't using the GET or POST method. To solve the lab, smuggle a request to the back-end server, so that the next request processed by the back-end server appears to use the method GPOST.

## References

1. [HTTP desync attacks: Request smuggling reborn](https://portswigger.net/research/http-desync-attacks-request-smuggling-reborn)
2. [HTTP/2: The sequel is always worse](https://portswigger.net/research/http2-the-sequel-is-always-worse)
3. [Browser-powered desync attacks: A new frontier in HTTP request smuggling](https://portswigger.net/research/browser-powered-desync-attacks)
