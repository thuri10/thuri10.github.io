---
title: "API security"
date: 2022-02-28T14:27:14Z
draft: true
authors: [Thuri]
tags: ["api", "websec"]
summary: "crAPI is a vulnerable API used to illustrate and educate OWASP API Top 10 vulnerabilities"
toc:
    enable: true
    auto: false
code:
    maxShownLines: 100
---

crAPI is a vulnerable API used to illustrate and educate OWASP API Top 10 vulnerabilities. The goal is to find as many vulnerabilities as possible and understand the root cause by exploiting the bug. The vulnerable API can be downloaded from the following github repository <a href="https://github.com/OWASP/crAPI">crAPI</a>.

BOLA vulnerabilities are vulnerabilities that allow the disclosure of sensitive information about other users. The first step in finding BOLA vulnerabilities is to look for the UUID of other accounts/users. The challenges in this API security show how various security implications are manifested and how they can be exploited.

## Challenge 1 - Access details of another user's vehicle

> To solve the challenge, you need to leak sensitive information of another user’s vehicle.
>
> -   Since vehicle IDs are not sequential numbers, but GUIDs, you need to find a way to expose the vehicle ID of another user.
> -   Find an API endpoint that receives a vehicle ID and returns information about it.

To solve first challenge is to identify the UUID of another user's vehicle and try to access their resources. The figure belows shows the vehicle ID of the logged in user.

![challenge API endpoint](/crApi/challenge1-endpoint.png)

The API endpoint URL showing the vehicle details is **/identity/api/v2/vehicle/986545c7-afa8-4711-bdab-329011db46fe/location**. To access the information of another vehicle details, we need to replace the UUID with the one of the target vehicle. Because of an high entropy of the UUID, they cannot be easily guessed, therefore to get UUID of vehicles, one should for clues either in comments, profile, images e.t.c. This is possible due to excessive data exposure in the community post section.

![vehicle GUID leak](/crApi/challenge1-guid_leak.png)

Looking at the community posts as shown in the image above, we are able to leak vehicleID of other users, i.e `pogba` whose vehicleID is **c562d2d3-2faf-4410-909a-ac8862d7509f**.Replacing logged-in user car UUI with **pogba**, we are able to leak location details. For replaying HTTP requests use `repeater` which is part of the BurpSuite toolkit.

![API data leak results](/crApi/challenge1-repeater.png)

## Challenge 2 - Access mechanic reports of other users

> crAPI allows vehicle owners to contact their mechanics by submitting a "contact mechanic" form. This challenge is about accessing mechanic reports that were submitted by other users.
>
> -   Analyze the report submission process
> -   Find an hidden API endpoint that exposes details of a mechanic report
> -   Change the report ID to access other reports

For Solving the challenge, the First is to intercept the http requests sent to the backend server in order to identify the URL endpoint using Burp proxy. The endpoint for viewing the mechanic report is `/workshop/api/mechanic/receive_report`.

![Hidden API](/crApi/challenge2-hiddenapi.png)

To access report of another user, we can change the report id with another in the API endpoint `/workshop/api/mechanic/mechanic_report?report_id=1` and replay requests. Changing report_id value, results to us disclosing report by james.

![Read other Reports](/crApi/challenge2-report.png)

For Bruteforcing the **report_id** value, one can use Intruder to check various payloads in the id position and check for successful response status. If the response status is `200` means the id contains a report.

Broken user Authentication vulnerabilities allows an attacker to assume other user`s identities. This may be through stolen session cookies or credentials. API does not implement tight security controls for resetting password logic making it possible to reset other user's password. This may lead to full ownership or takeover of user accounts or system compromise if admin account has been compromised.

## Challenge 3 - Reset the password of a different user

> Find an email address of another user on crAPI
> Brute forcing might be the answer. If you face any protection mechanisms, remember to leverage the predictable nature of REST APIs to find more similar API endpoints.

For information disclosure about another user email, refer to BOLA vulnerabilities section which users emails are disclosed in the community post. The API is vulnerable to bruteforce because the API does not enforce rate limiting on OTP in resetting password logic. This enables an attacker to reset passwords of other users and lock them out of their accounts.

![Intruder API](/crApi/challenge3-intruder.png)

To bruteforce the API, we can use Intruder to bruteforce the OTP value using payload of a length 4 and type **integer** as shown in figure above. A successful attack will enable an attacker to Login as the target user.

Excessive Data Exposure is a vulnerability that occurs due to additional information which is returned by the API, which expected to be filtered or ignored by client. The extra information returned by the API endpoint may contain sensitive data about users, financial data etc, which may lead to a breach of data or breach data protection laws.

## Challenge 4 - Find an API endpoint that leaks sensitive information to other users

The goal of this challenge is to identify the endpoint that leaks sensitive information about its users.The endpoint is `/community/api/v2/community/posts/recent` which leaks for information about the owner email and vehicle details.

![Endpoint Information leak](/crApi/challenge4-leak.png)

The information from the sensitive information may be used to escalate the privileges of the system, information disclosure through vehicleID `IDOR`, resetting other people password and locking them out.

BFLA is a vulnerability that allows one user to do CRUD (Create, Read, Update, Delete) operations as another user of the vulnerable application. This vulnerability may lead to data loss and breach or DOS if the user is locked out of his/her own account.

## challenge 7 - Delete a video of another user

To delete a video of another user, One needs to create another account in the Platform so as to replicate the scenario of the other user. Create a new user in the application and upload a new video under the new user. Example, upload video as `george` and note ID of the video uploaded. This will help in performing an BFLA attack as another user

![Admin Privileges](/crApi/challenge7_videoburp.png)

The uploaded video ID is `35` as shown in figure above. By deleting the video, a normal user can't delete a video unless he/she is an admin, `DELETE` is only possible to users with admin privileges. One can bypass Authorization implementation in the API by forging a new JWT token.

![Delete video](/crApi/challenge7_admin.png)

Because the API does not validate JWT Tokens, One can manipulate the user Role privileges stored in the token body payload and therefore delete george video. After forging the tokens, replace the Authorization with the new one and send a request.

## Challenge 8 - Get item for free

> crAPI allows users to return items they have ordered. You simply click the "return order" button, receive a QR code and show it in a USPS store. To solve this challenge, you need to find a way to get refunded for an item that you haven’t actually returned.

## Challenge 9 - Increase your balance by $1,000 or more

> After solving the "Get an item for free" challenge, be creative and find a way to get refunded for an item you never returned, but this time try to get a bigger refund.

## Challenge 10 - Update internal video properties

> After solving the "Find an API endpoint that leaks an internal property of videos" challenge, try to find an endpoint that would allow you to change the internal property of the video. Changing the value can help you to exploit another vulnerability.

## Challenge 11 - Make crAPI send an HTTP call to "www.google.com" and return the HTTP response.

## Challenge 12 - Find a way to get free coupons without knowing the coupon code.

## Challenge 13 - Find a way to redeem a coupon that you have already claimed by modifying the database

## Challenge 14 - Find an endpoint that does not perform authentication checks for a user.

## Challenge 15 - Find a way to forge valid JWT Tokens

## 2 secret challenges

> There are two more secret challenges in crAPI, that are pretty complex, and for now we don’t share details about them, except the fact they are really cool.
