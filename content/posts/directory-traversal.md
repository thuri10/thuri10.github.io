---
title: "Path traversal vulnerabilities"
date: 2022-10-24T14:27:14Z
draft: false
authors: ["Thuri"]
tags: ["websec", "traversal", "portswigger"]
summary: "Directory traversal is a web vulnerability that allows an attacker to access unauthorized resources outside the root server directory due to the way server handles files."
toc:
  enable: true
  auto: false

code:
    maxShownLines: 100
summary: "Directory traversal is a web vulnerability that allows an attacker to access unauthorized resources outside the root server directory due to the way server handles files."
---

Directory traversal is a web vulnerability that allows an attacker to access unauthorized resources outside the root server directory due to the way server handles files.

The files which an attacker can read includes Intellectual property, customer data, code and sensitive file system files such as configuration keys, tokens.

To understand the vulnerability class, we solve `portswigger.net` academy directory traversal labs. PortSwigger Academy helps in providing a playground for testing and learning new web security research techniques.

## Lab1 - Simple case file path traversal

> This lab contains a file path traversal in the display of product images.
> To solve the lab retrieve the contents of the /etc/passwd file.

For solving the challenge, right click one of the images and open it in a new tab.This will enable us to capture image url path in BurpSuite through proxy. Image below shows an example image path rendered in BurpSuite application.

![Lab 1 Image path](/websec/dirtraversal/lab1_imagepath.png)

To solve the challenge, we need to change the filename location from **29.jpg** to **/etc/passwd**. Assumption is our full path of the image is `/var/www/images/29.jpg`. In order to read target file, we need to traverse back directory structure in unix using **dot-dot-slash** attack as shown in image below.
![Read Password](/websec/dirtraversal/lab1_passwd.png)

## Lab2 - Absolute path traversal bypass

> This lab contains a file path traversal vulnerability in the display of product images.
> The application blocks traversal sequences but treats the supplied filename as being relative to a default working directory.
> To solve the lab, retrieve the contents of the /etc/passwd file.

This challenge allows absolute path resolution on the server. Filepath of an image **65.jpg** is as shown in image below.

![Lab image](/websec/dirtraversal/lab2_image.png)

For solving the lab, we change the filename parameter path to **/etc/passwd** and sent back our request to the server through repeater. **Repeater** is an handy tool that enables one to replay and manipulate http requests.

![Read file path](/websec/dirtraversal/lab2_passwd.png)

## Lab3 - Stripped non-recursive path traversal

> This lab contains a file path traversal vulnerability in the display of product images.
> The application strips path traversal sequences from the user-supplied filename before using it.
> To solve the lab, retrieve the contents of the /etc/passwd file.

This lab implements a simple defense mechanism of filtrating **dot-dot-slash** paths. This prevents us solving the lab as the first lab.

To bypass the restriction, we use nested traversal sequences such as `....//` , which will revert to `../` when the inner dot-dot-dot-slash is stripped. Image below shows how the attack is still possible by replacing image name with the following payload **....//....//....//etc/passwd**.

![Lab 3 solution](/websec/dirtraversal/lab3_solution.png)

## Lab4 - Superfluous URL-decode traversal stripped sequences path traversal

> This lab contains a file path traversal vulnerability in the display of product images.
> The application blocks input containing path traversal sequences. It then performs a URL-decode of the input before using it.
> To solve the lab, retrieve the contents of the /etc/passwd file.

For solving the challenge, we need to encode URL to bypass for bypassing the kind of sanitization. The dot-dot-slash **../** can be encoded to **%2e%2e%2f**.
For encoding, single encoding results to file not found. Therefore, we double encode our payload.

![Payload Encoding](/websec/dirtraversal/lab4-decoder.png)

Now with our payload as shown in decoder tab above, we replace the parameter of filename with our payload.

![Payload Encoding](/websec/dirtraversal/lab4-encoder.png)

Boom!!, we are able to read the **/etc/passwd** file using double encoding to bypass filters.

## Lab5 - Start of path file validation path traversal

> This lab contains a file path traversal vulnerability in the display of product images.
> The application transmits the full file path via a request parameter, and validates that the supplied path starts with the expected folder.
> To solve the lab, retrieve the contents of the /etc/passwd file.

Lab five does validation of initial file path if lies in the server directory **/var/www/images**. If filename contains the base directory folder we get a successful response as shown by the request below.

![Lab5 image](/websec/dirtraversal/lab5_image.png)

For solving the lab, retrieve **passwd** file, we reuse the Lab1 attack payload but we preserve original file path as we traverse base directory structure. Successful attack will look like one below. The payload path is **`/var/www/images/../../../etc/passwd`**
![lab5 solution](/websec/dirtraversal/lab5_passwd.png)

## Lab6 - Bypass validation of path file extension

> This lab contains a file path traversal vulnerability in the display of product images.
> The application validates that the supplied filename ends with the expected file extension.
> To solve the lab, retrieve the contents of the /etc/passwd file.

Lab6 implements a defense mechanism of file extension validation. The application checks if file supplied at **filename** parameter ends with .png extension. We can bypass defense mechanism by appending a null byte in our path as shown below.

When the program is reading the file at **filename** and encounters a null byte, it terminates the file path before extension.

![lab 6 passwd](/websec/dirtraversal/lab6_passwd.png)

File extension validation is never an enough defense mechanism.

## Tips - Directory travesal vulnerability tips

These are some of the tips learn when solving some of the challenges from portswigger Academy.

1. use nested traversal sequences, such as `....//` to revert to simple traversal sequences when the inner sequence is stripped.
2. Use of Encoding formats
3. Add an extension to file type to bypass file extension checks i.e `%0.png`
