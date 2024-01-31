---
title: "API Testing"
date: 2023-12-09T00:27:14Z
draft: true
authors: ["thuri"]
tags: ["API", "websec", "portswigger"]
toc:
    enable: true
    auto: true

code:
    maxShownLines: 100
---

## Exploiting an API endpoint using documentation

> To solve the lab, find the exposed API documentation and delete carlos. You can log in to your own account using the following credentials: wiener:peter.

The change email feature reveals the api endpoint of the user and method `PATCH`.

![Change Email Endpoint](/apiTest/chall1-api.png)

Send to repeater and probe for different accepted methods.

Running `OPTIONS ` we are able to determine the allowed methods in the response Header as shown below.

![Options](/apiTest/chall1-2api.png)

Sending the `DELETE`, we delete carlos in the API because there is no restriction or cookie session tied to the user

## Exploiting server-side parameter pollution in a query string

> To solve the lab, log in as the administrator and delete carlos.

## Finding and exploiting an unused API endpoint

> To solve the lab, exploit a hidden API endpoint to buy a Lightweight l33t Leather Jacket. You can log in to your own account using the following credentials: wiener:peter.

First step is to login as `wiener:peter` and add `Lightweight l33t Leather Jacket` to the Cart. Looking at the burp proxy we notice a GET endpoint `/api/products/1/price` which indicates it is our API route for the product.

![jacket price](/apiTest/chall2-api.png)

Send the repeater and see the methods allowed by chaning `GET` to `OPTIONS`. The response Header shows the `OPTIONS` is not allowed but the only `GET` and `PATCH` methods are allowed
Since we have price in our cart is 0. we can the price to be `0` and purchase our jacket.
Adjusting the header to allow the `Content-Type: application/json` and price to be zero we are able to manipulate the price

![Manipulated price](/apiTest/chall2-2api.png)

Sending the `GET` request we receive results as follows to confirm we have manipulated the price

```javascript
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 86

{
    "price":"$0.00",
    "message":"This item is in high demand - 3 purchased in the last 2h"
}
```

Placing a new order with price `0`, we are no able to buy the jacket.

## Exploiting a mass assignment vulnerability

> To solve the lab, find and exploit a mass assignment vulnerability to buy a Lightweight l33t Leather Jacket. You can log in to your own account using the following credentials: wiener:peter.

Doing a checkout in the cart, we are able to identify the API endpoint

![checkout API endpoint](/apiTest/chall3-api.png)

Doing an `OPTION` method we get only GET and POST methods are allowed.

Doing a `POST`request and doing a `100%` discount we are able to purchase the lighweight jacket

![checkout API endpoint](/apiTest/chall3-2api.png)
