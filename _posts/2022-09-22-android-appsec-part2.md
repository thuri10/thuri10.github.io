---
layout: post
title: Android application security part2
date: 2021-11-25 21:07 +0300
categories: [appsec]
tags: [android, appsec]
---

Second part series of the android application security. This part focuses on the security of sqlite databases, firebase and AWS security.

## Flag7 - Sqlite

**What is sqlite?**

Sqlite is a structure query base database that enables applications to do local storage in the application directory. The goal of the challenge is to understand how local storage of databases may lead to leakage of information.

First step is decompilation of `FlagSevenSqliteActivity` using `Jadx`.

Analysis of an new activity of android application, it is best to start at the onCreate method defined in the Activity.**oncreate** is the first method to be called by an application when an activity is started.

The decompiled `oncreate` method code is as shown below.

```java
public void onCreate(Bundle bundle) {
    super.onCreate(bundle);
    setContentView(R.layout.activity_flag_seven_sqlite);
    C((Toolbar) findViewById(R.id.toolbar));
    j.g.a(this);
    H();
    ((FloatingActionButton) findViewById(R.id.fab)).setOnClickListener(new a());
    SQLiteDatabase writableDatabase = this.u.getWritableDatabase();
    ContentValues contentValues = new ContentValues();
    contentValues.put("title", Base64.decode("VGhlIGZsYWcgaGFzaCE=", 0));
    contentValues.put("subtitle", Base64.decode("MmFiOTYzOTBjN2RiZTM0MzlkZTc0ZDBjOWIwYjE3Njc=", 0));
    writableDatabase.insert("Thisisatest", null, contentValues);
    contentValues.put("title", Base64.decode("VGhlIGZsYWcgaXMgYWxzbyBhIHBhc3N3b3JkIQ==", 0));
    contentValues.put("subtitle", h.c());
    writableDatabase.insert("Thisisatest", null, contentValues);
}
```

The method passes base64 encoded strings and stores them into string variables.From the "hint" of application name, we are creating a writable database through `SQLiteDatabase` functions. The activity writes some strings to the database. The database being referenced is called **Thisisatest**.

Next logical step is decoding the Base64 encoded strings to get the corresponding human readable form of data.

```bash
VGhlIGZsYWcgaGFzaCE    - The flag hash!
MmFiOTYzOTBjN2RiZTM0MzlkZTc0ZDBjOWIwYjE3Njc - 2ab96390c7dbe3439de74d0c9b0b1767
VGhlIGZsYWcgaXMgYWxzbyBhIHBhc3N3b3JkIQ  - The flag is also a password!
```

The decoded strings as shown above give sus hints on solving the challenge.The author provides us with the hash of the flag.

For further analysis we decode even strings defined in the Activity as shown below.

```java
private final String w = "ZjFhZy1wYTU1";   #f1ag-pa55
private byte[] x = Base64.decode("c3FsaXRl", 0);  #sqlite
private byte[] y = Base64.decode(this.w, 0);
private final String z;
```

Analyze `FlagSevensqliteActivity` in order to understand strings usage in our activity. Important strings are **f1ag-pa55** and **sqlite** guiding us in solving the problem.

```java
    public FlagSevenSqliteActivity() {
        byte[] bArr = this.x;      //sqlite
        d.m.b.d.b(bArr, "decodedDirectoryOne");
        Charset charset = StandardCharsets.UTF_8;
        d.m.b.d.b(charset, "StandardCharsets.UTF_8");
        this.z = new String(bArr, charset);
        byte[] bArr2 = this.y;        //f1ag-pa55
        d.m.b.d.b(bArr2, "decodedDirectoryTwo");
        Charset charset2 = StandardCharsets.UTF_8;
        d.m.b.d.b(charset2, "StandardCharsets.UTF_8");
        this.A = new String(bArr2, charset2);
        f b2 = f.b();
        d.m.b.d.b(b2, "FirebaseDatabase.getInstance()");
        d d2 = b2.d();
        d.m.b.d.b(d2, "FirebaseDatabase.getInstance().reference");
        this.B = d2;
        d h = d2.h(this.z);
        d.m.b.d.b(h, "database.child(refDirectory)");
        this.C = h;
        d h2 = this.B.h(this.A);
        d.m.b.d.b(h2, "database.child(refDirectoryTwo)");
        this.D = h2;
    }

```

**flagSevensqliteActivity** shows how application is parsing data from the Firebase instance. In order to understand the data being fetched, we need to know nodes we are fetching data from. From decompiled code, we are accessing the string x as shown in the constructor method in line 1 through `bArr` byte array. Our string is then passed to variable `z` constructor method as referenced **this.z** constructor.

This means **f1ag-pa55** and **sqlite** are our firebase nodes.

To get the firebase link, look for link in **strings.xml** in the resources directory of the application.The link of firebase url is shown in the image below. Manually test firebase endpoints manually to see if they are vulnerable as shown in the code below. Adding `.json` at the end of the firebase endpoint enables one to read data.

First, test endpoint using **sqlite** node.

```bash
vx@archie:output$ curl https://injuredandroid.firebaseio.com/sqlite.json
"S3V3N_11"
```

From the above results, we get our flag. Accessing endpoint using **f1ag-pa55** using `.json` firebase trick, password.

```bash
vx@archie:output$ curl https://injuredandroid.firebaseio.com/f1ag-pa55.json
"hunter2"
```

**hunter2** is our correct password for the challenge.

## FLag8 - AWS Storage and Security.

Goal: Understanding misconfiguration of AWS storage and security implementation in the android applications.

Decompiled `flagEightclass` activity code looks like the one shown below.

```java
public FlagEightLoginActivity() {
    f b2 = f.b();
    d.m.b.d.b(b2, "FirebaseDatabase.getInstance()");
    d d2 = b2.d();
    d.m.b.d.b(d2, "FirebaseDatabase.getInstance().reference");
    this.u = d2;
    d h = d2.h("/aws");
    d.m.b.d.b(h, "database.child(\"/aws\")");
    this.v = h;
}
```

The activity initializes firebase instance and fetches some information from the AWS child node in the firebase storage model. First check if the model is vulnerable to `.json` trick of firebase read write vulnerability.

```bash
vx@archie:ret2csu$ curl https://injuredandroid.firebaseio.com/aws.json
"C10ud_S3cur1ty_lol"
```

Next is analyzing `onClick` method of the activity. This method responds to events of an application clicked and are defined in the Activity.

```java
public final void onClick(View view) {
    if (FlagEightLoginActivity.this.H() == 0) {
        if (view != null) {
            Snackbar X = Snackbar.X(view, "AWS CLI.", 0);
            X.Y("Action", null);
            X.N();
            FlagEightLoginActivity flagEightLoginActivity = FlagEightLoginActivity.this;
            flagEightLoginActivity.I(flagEightLoginActivity.H() + 1);
            return;
        }
        d.m.b.d.k();
        throw null;
    } else if (FlagEightLoginActivity.this.H() != 1) {
    } else {
        if (view != null) {
            Snackbar X2 = Snackbar.X(view, "AWS profiles and credentials.", 0);
            X2.Y("Action", null);
            X2.N();
            FlagEightLoginActivity.this.I(0);
            return;
        }
        d.m.b.d.k();
        throw null;
    }
}

```

From **HINTS** provided in the Activity, we need to understand the "AWS profiles and credentials" usage in order to subvert the intended behavior.

**what are the AWS profile stored?**

Most of the strings are stored in **strings.xml** in the resources directory which are referenced throughout the application. In `strings.xml` file we have two interesting strings.

```xml
<string name="AWS_ID">AKIAZ36DGKTUIOLDOBN6</string>
<string name="AWS_SECRET">KKT4xQAQ5cKzJOsoSImlNFFTRxjYkoc71vuRP48S</string>

```

**AWS CLI** is a unified tool to manage your AWS services, it enables one to configure AWS services through command line and automate them through scripts.
To install **aws-cli** on your linux machine type the following in your terminal.

```bash
python -m pip install --user awscli
```

For adding the aws profile, use the following command in terminal as shown below.

```bash
vx@archie:~$ aws configure
AWS Access Key ID [None]: AKIAZ36DGKTUIOLDOBN6
AWS Secret Access Key [None]: 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
```

## Flag9- FireBase

### What is firebase?

Google firebase is a mobile and web application development platform that provides a real-time database that continuously syncs data between cloud and user’s mobile devices. Firebase databases are accessible via an API and that if developers have not correctly secured their firebase database, a simple request can retrieve it`s entire content.

We need to analyze the `FlagNineFirebaseActivity` in order to understand how read and write rules are implemented in the application.

```java
 public final void goToFlagNineFirebaseActivity(View view) {
        startActivity(new Intent(this, FlagNineFirebaseActivity.class));
    }

```

```java
public FlagNineFirebaseActivity() {
    byte[] decode = Base64.decode("ZmxhZ3Mv", 0);     //  flags/
    this.v = decode;
    d.m.b.d.b(decode, "decodedDirectory");
    Charset charset = StandardCharsets.UTF_8;
    d.m.b.d.b(charset, "StandardCharsets.UTF_8");
    this.w = new String(decode, charset);
    f b2 = f.b();
    d.m.b.d.b(b2, "FirebaseDatabase.getInstance()");
    d d2 = b2.d();
    d.m.b.d.b(d2, "FirebaseDatabase.getInstance().reference");
    this.x = d2;
    d h = d2.h(this.w);
    d.m.b.d.b(h, "database.child(refDirectory)");
    this.y = h;
}
```

Decode BASE64 encoded strings in order to understand strings stored in the `decode` variable.

```bash
vx@archie:~$ echo "ZmxhZ3Mv" | base64 -d
            flags/
```

From the above decoded string,we are getting data from firebase storage, in the **flags** node.

Looking at the decompiled below, it gives us an hint of solving the problem **"Use the .json trick database url"** .

```java
public final void onClick(View view) {
        String str;
        if (FlagNineFirebaseActivity.this.H() == 0) {
            if (view != null) {
                str = "Use the .json trick with database url";
            } else {
                d.m.b.d.k();
                throw null;
            }
        } else if (FlagNineFirebaseActivity.this.H() == 1) {
            if (view != null) {
                str = "Filenames.";
            } else {
                d.m.b.d.k();
                throw null;
            }

```

### Firebase Realtime Rules

`Realtime database` stores data as one large JSON tree and synchronized every time a new device is connected.The data received or stored in the database is determined by the security rules of `read` and `write`.

Firebase allows read and write rules to the database to be set to true or false. When **.read** is set to true means describes if and data is allowed to be read by users and **.write** describes if and when data is allowed to be written.
Example of a firebase rule where read and write are allowed.

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

When read and write rules are enabled means that everyone with access to the application can read and write unauthorized data to the database.

The firebase database url is defined in **strings.xml** file in the resource section.

```xml
    <string name="firebase_database_url">https://injuredandroid.firebaseio.com</string>
```

The firebase node defined in our instance is **flags** node, to check if the endpoint node is vulnerable we append a **.json** at the end of the url node as shown in the image below.

```bash
vx@archie:injured$ curl https://injuredandroid.firebaseio.com/flags/.json
"[nine!_flag]"
```

If the url returns data, means our endpoint is vulnerable. From the above output we were able to successfully solve the challenge.

### Securing Firebase

One can secure Firebase database by only allowing users of application to have only read permissions to a certain tree node instead of allowing read to the root node in the application. This means the applications can not read data from the neighboring nodes.

```json
{
  "rules": {
    "flag": {
      ".read": true,
      ".write": false
    }
  }
}
```
