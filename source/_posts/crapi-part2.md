---
title: API security - Broken User Authentication
date: 2022-12-16 20:30:53
summary: Broken user Authentication vulnerabilities allows an attacker to assume other user`s identities. This may be through stolen session cookies or credentials.
tags:
  - apisec
  - websec
  - crAPI
---

Broken user Authentication vulnerabilities allows an attacker to assume other user`s identities. This may be through stolen session cookies or credentials. API does not implement tight security controls for resetting password logic making it possible to reset other user's password. This may lead to full ownership or takeover of user accounts or system compromise if admin account has been compromised.

## Challenge 3 - Reset the password of a different user

> Find an email address of another user on crAPI
> Brute forcing might be the answer. If you face any protection mechanisms, remember to leverage the predictable nature of REST APIs to find more similar API endpoints.

For information disclosure about another user email, refer to BOLA vulnerabilities section which users emails are disclosed in the community post. The API is vulnerable to bruteforce because the API does not enforce rate limiting on OTP in resetting password logic. This enables an attacker to reset passwords of other users and lock them out of their accounts.

![Intruder API](../images/crApi/challenge3-intruder.png)

To bruteforce the API, we can use Intruder to bruteforce the OTP value using payload of a length 4 and type **integer** as shown in figure above. A successful attack will enable an attacker to Login as the target user.
