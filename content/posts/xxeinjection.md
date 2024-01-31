---
title: "Xml injection vulnerabilites"
date: 2023-08-28T14:27:14Z
draft: true
authors: ["Thuri"]
tags: ["webse", "xxe"]
toc:
    enable: true
    auto: false

code:
    maxShownLines: 100
---

## Lab: Exploiting XXE using external entities to retrieve files

> This lab has a "Check stock" feature that parses XML input and returns any unexpected values in the response.
> To solve the lab, inject an XML external entity to retrieve the contents of the /etc/passwd file.

## Lab: Exploiting XXE to perform SSRF attacks

> This lab has a "Check stock" feature that parses XML input and returns any unexpected values in the response.
> The lab server is running a (simulated) EC2 metadata endpoint at the default URL, which is http://169.254.169.254/. This endpoint can be used to retrieve data about the instance, some of which might be sensitive.
> To solve the lab, exploit the XXE vulnerability to perform an SSRF attack that obtains the server's IAM secret access key from the EC2 metadata endpoint.

## Lab: Blind XXE with out-of-band interaction

> This lab has a "Check stock" feature that parses XML input but does not display the result.
> You can detect the blind XXE vulnerability by triggering out-of-band interactions with an external domain.
> To solve the lab, use an external entity to make the XML parser issue a DNS lookup and HTTP request to Burp Collaborator.

## Lab: Blind XXE with out-of-band interaction via XML parameter entities

> This lab has a "Check stock" feature that parses XML input, but does not display any unexpected values, and blocks requests containing regular external entities.
> To solve the lab, use a parameter entity to make the XML parser issue a DNS lookup and HTTP request to Burp Collaborator.

## Lab: Exploiting blind XXE to exfiltrate data using a malicious external DTD

> This lab has a "Check stock" feature that parses XML input but does not display the result.
> To solve the lab, exfiltrate the contents of the /etc/hostname file.

## Lab: Exploiting blind XXE to retrieve data via error messages

> This lab has a "Check stock" feature that parses XML input but does not display the result.
> To solve the lab, use an external DTD to trigger an error message that displays the contents of the /etc/passwd file.
> The lab contains a link to an exploit server on a different domain where you can host your malicious DTD.

## Lab: Exploiting XInclude to retrieve files

> This lab has a "Check stock" feature that embeds the user input inside a server-side XML document that is subsequently parsed.
> Because you don't control the entire XML document you can't define a DTD to launch a classic XXE attack.
> To solve the lab, inject an XInclude statement to retrieve the contents of the /etc/passwd file.

## Lab: Exploiting XXE via image file upload

> This lab lets users attach avatars to comments and uses the Apache Batik library to process avatar image files.
> To solve the lab, upload an image that displays the contents of the /etc/hostname file after processing. Then use the "Submit solution" button to submit the value of the server hostname.

## Lab: Exploiting XXE to retrieve data by repurposing a local DTD

> This lab has a "Check stock" feature that parses XML input but does not display the result.
> To solve the lab, trigger an error message containing the contents of the /etc/passwd file.
> You'll need to reference an existing DTD file on the server and redefine an entity from it.
