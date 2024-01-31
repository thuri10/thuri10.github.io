---
title: "Access control vulnerabilities"
date: 2022-11-02T14:27:14Z
draft: true
authors: [Thuri]
tags: ["appsec", "websec", "portswigger"]
summary: "Access control vulnerabilities are web vulnerabilities that allow a user to access or modify what they are not allowed to access or modify. This allows a user to perform actions they are not allowed to access."
toc:
    enable: true
    auto: false

description: "Hello world"
---

Access control vulnerabilities are web vulnerabilities that allow a user to access or modify what they are not allowed to access or modify. This allows a user to perform actions they are not allowed to access.

Access control vulnerability may lead to a user doing a vertical or horizontal privilege escalation. Vertical escalation is where a user gets more access than the current role assigned while horizontal escalation is where a user can access another user's data or modify it.

To understand broken access control vulnerabilities impact by solving the **portswigger** academy labs.

## Lab1 - Unprotected admin functionality

> This lab has an unprotected admin panel.
> Solve the lab by deleting the user carlos.

In order to solve the lab we need to access the admin panel and delete a user from the system. To get the URL path to the admin panel, we check the `Robots.txt` file.

![Admin panel path](/websec/accesscontrol/lab1-adminpanel.png)
{{< image src="/images/lighthouse.webp" caption="Lighthouse (`image`)" src_s="/images/lighthouse-small.webp" src_l="/images/lighthouse-large.webp" >}}

By visiting the above path we are able to delete the user Carlos

![Delete Carlos](/websec/accesscontrol/lab1-delete.png)

## Lab2 - Unprotected admin functionality with unpredictable URL

> This lab has an unprotected admin panel. It's located at an unpredictable location, but the location is disclosed somewhere in the application.
> Solve the lab by accessing the admin panel, and using it to delete the user carlos.

To solve the challenge we look at the source code of the challenge.

```javascript
var isAdmin = false;
if (isAdmin) {
    var topLinksTag = document.getElementsByClassName("top-links")[0];
    var adminPanelTag = document.createElement("a");
    adminPanelTag.setAttribute("href", "/admin-b95shg");
    adminPanelTag.innerText = "Admin panel";
    topLinksTag.append(adminPanelTag);
    var pTag = document.createElement("p");
    pTag.innerText = "|";
    topLinksTag.appendChild(pTag);
}
```

The path of the admin panel is **/admin-b95shg**. By visiting the above URL we get the admin panel and we are able to delete the `carlos`

![Lab2 Admin Panel](/websec/accesscontrol/lab2-adminpanel.png)

## Lab3 - User role controlled by request parameter

> This lab has an admin panel at /admin, which identifies administrators using a forgeable cookie.
> Solve the lab by accessing the admin panel and using it to delete the user carlos.
> You can log in to your own account using the following credentials: wiener:peter

For this challenge, we can forge user admin because we control access control parameters on the client side. First log in as **wiener**:peter\*\*

![Lab3 Access Denied](/websec/accesscontrol/lab3-accessdenied.png)

For accessing the admin panel with correct permissions, we can modify the admin value to **true** and reload the page.

![Admin page modified](/websec/accesscontrol/lab3-solution.png)
By modifying the admin default permissions, we are now able to delete the user **carlos**.

## Lab4 - User role can be modified in user profile

> This lab has an admin panel at /admin. It's only accessible to logged-in users with a roleid of 2.
> Solve the lab by accessing the admin panel and using it to delete the user carlos.

You can log in to your account using the following credentials: wiener:peter

## Lab 5: User ID controlled by request parameter

> This lab has a horizontal privilege escalation vulnerability on the user account page.
> To solve the lab, obtain the API key for the user carlos and submit it as the solution.

## Lab 6: User ID controlled by request parameter, with unpredictable user IDs

> This lab has a horizontal privilege escalation vulnerability on the user account page, but identifies users with GUIDs.
> To solve the lab, find the GUID for carlos, then submit his API key as the solution.

## Lab 7: User ID controlled by request parameter with data leakage in redirect

> This lab contains an access control vulnerability where sensitive information is leaked in the body of a redirect response.
> To solve the lab, obtain the API key for the user carlos and submit it as the solution.

## Lab 8: User ID controlled by request parameter with password disclosure

> This lab has user account page that contains the current user's existing password, prefilled in a masked input.
> To solve the lab, retrieve the administrator's password, then use it to delete the user carlos.

## Lab 9: Insecure direct object references

> This lab stores user chat logs directly on the server's file system, and retrieves them using static URLs.

## Lab 10: URL-based access control can be circumvented

> This website has an unauthenticated admin panel at /admin, but a front-end system has been configured to block external access to that path. However, the back-end application is built on a framework that supports the X-Original-URL header.

## Lab 11: Method-based access control can be circumvented

> This lab implements access controls based partly on the HTTP method of requests. You can familiarize yourself with the admin panel by logging in using the credentials administrator:admin.

## Lab 12: Multi-step process with no access control on one step

> This lab has an admin panel with a flawed multi-step process for changing a user's role. You can familiarize yourself with the admin panel by logging in using the credentials administrator:admin.

## Lab 13: Referer-based access control

> This lab controls access to certain admin functionality based on the Referer header. You can familiarize yourself with the admin panel by logging in using the credentials administrator:admin.
