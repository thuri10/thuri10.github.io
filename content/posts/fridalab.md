---
title: "Fridalab - Frida Basics"
date: 2024-01-17T14:27:14Z
draft: true
authors: []
tags: ["appsec", "frida"]
toc:
    enable: true
    auto: false
code:
    maxShownLines: 100
summary: "Frida is a dynamic instrumentation python library that allows modification of applications's behavior and data in real time. This power enables researcher and reverse engineers to circumvent security measures and alter developers intended behavior."
---

Frida is a dynamic instrumentation python library that allows modification of applications's behavior and data in real time. This power enables researcher and reverse engineers to circumvent security measures and alter developers intended behavior. This can be decrypting of crypotgraphic keys, bypassing root detection mechanisms and bypassing developers assumptions.

For honing frida basics, this blog used `FridaLab` android application by Ross Marks. The application contains eight challenges for learning various dynamic instrumentation techniques.

![fridab](../assets/fridalab/fridalab.png)

the android application identifier is `uk.rossmarks.fridalab`

## Change class challenge_01`s variable chall01 to 1

The first challenge is to hook the alter the `chall01` variable and return one. The Java decompiled code for the challenge is shown below.ls

```java
package uk.rossmarks.fridalab;

public class challenge_01 {
    static int chall01;

    public static int getChall01Int() {
        return chall01;
    }
}
```

The solution is the following

```javascript
Java.perform(function () {
    const challenge01 = Java.use("uk.rossmarks.fridalab.challenge_01");
    challenge01.chall01.value = 1;
});
```

## Run chall02()

```java
   private void chall02() {
        this.completeArr[1] = 1;
    }
```

## Make chall03() return true

```java
   public boolean chall03() {
        return false;
    }
```

## Send `frida` to chall04()

```java

    public void chall04(String str) {
        if (str.equals("frida")) {
            this.completeArr[3] = 1;
        }
    }
```

## Always send `frida` to chall05()

```java
    public void chall05(String str) {
        if (str.equals("frida")) {
            this.completeArr[4] = 1;
        } else {
            this.completeArr[4] = 0;
        }
    }
```

## Run chall06() after 10 seconds with correct value

```java
package uk.rossmarks.fridalab;

public class challenge_06 {
    static int chall06;
    static long timeStart;

    public static void startTime() {
        timeStart = System.currentTimeMillis();
    }

    public static boolean confirmChall06(int i) {
        return i == chall06 && System.currentTimeMillis() > timeStart + 10000;
    }

    public static void addChall06(int i) {
        chall06 += i;
        if (chall06 > 9000) {
            chall06 = i;
        }
    }
}
```

## Bruteforce check07Pin() then confirm with chall07()

```java
package uk.rossmarks.fridalab;

/* loaded from: classes.dex */
public class challenge_07 {
    static String chall07;

    public static void setChall07() {
        chall07 = BuildConfig.FLAVOR + (((int) (Math.random() * 9000.0d)) + 1000);
    }

    public static boolean check07Pin(String str) {
        return str.equals(chall07);
    }
}
```

## Change 'check' button's text value to 'Confirm'

```java
   public boolean chall08() {
        return ((String) ((Button) findViewById(C0256R.id.check)).getText()).equals("Confirm");
    }
```
