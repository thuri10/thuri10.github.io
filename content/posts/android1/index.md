---
title: "Android appsec series part 1"
date: 2022-10-16T11:16:22+03:00
draft: false
image: android.jpg
tags:
  - android
  - appsec
---

This is a four part beginner series of Android application security using Vulnerable android application. The application used in the first three part series is a `InjuredAndroid` by [@B3nac](https://twitter.com/B3nac).

The application covers different security concepts such as hardcoded secrets, weak cryptographic algorithms implementations, misconfiguration, webview vulnerabilities etc. The application can be downloaded from either provided links [playstore](https://play.google.com/store/apps/details?id=b3nac.injuredandroid) or [github](https://github.com/B3nac/InjuredAndroid).

For solving the challenges you need to have an android phone or an emulator.

## Environment setup

For application installation to the emulator, use Android debug bridge(adb). `adb` is a set of command line tools which are installed as part of android studio that enables communication between emulator/real android phone with the connected computer.

For Installation, run the command below in a terminal.

```shell
adb install InjuredAndroid-1.0.12-release.apk
```

After a successful installation of the application, the main Activity/page looks like the image below.

![Injured Android](android_injured.png)

For static analysis of the application, List of the following tools is used throughout the series.

1. [JADX](https://github.com/skylot/jadx)
2. Text Editor (visual studio)
3. Android Studio

`JADX` is a bundle of command line and GUI tools that enables one to produce java source code from android Dex and APK files. It aids in decompiling the android application to java code which is more human readable /friendly.

> NB: For reverse engineering/ code auditing of every application, you need to have a clear set of goal or objective of what you want to achieve. This helps narrow down the analysis and avoid many rabbit holes.

## FLAG ONE - LOGIN

**Goal : Input the right flag.**

Objective of the first level is to get the correct flag. **flag** is a piece of reward if you do correct task you are asked to do. Looking at decompiled code in the editor as shown below, there is an interesting function called **submitFlag**. submit flag function is responsible for validation of user input.

```java
public final void submitFlag(View view) {
        EditText editText = (EditText) findViewById(R.id.editText2);
        C2724g.m882d(editText, "editText2");
        if (C2724g.m885a(editText.getText().toString(), "F1ag_0n3")) {
            Intent intent = new Intent(this, FlagOneSuccess.class);
            new FlagsOverview().m4085J(true);
            new ApplicationC1492j().m4065b(this, "flagOneButtonColor", true);
            startActivity(intent);
        }
    }
```

From code above, the **FlagoneActivity** class implements functionality where the user input is compared with hardcoded flag.

The user flag string is compared with hardcoded flag which is "**F1ag_0n3**". The method **m10785a** compares the two objects (user input flag and hardcoded flag) and return a boolean depending on the result of the comparison of two objects. Result can either be true or false.

```java
public static boolean m10785a(Object obj, Object obj2) {
        return obj == null ? obj2 == null : obj.equals(obj2);
    }
```

If the condition is True, new Intent is started which is **FlagOneSuccess**. Entering hardcoded flag as our input, we get a success message and color of **Flag1** in flagsOverview Activity changes to green, meaning challenge has been successfully been solved.

![Flag one solved](solved.png)

Level1 flag is "**F1ag_0n3**".  
For other levels if solved successfully, the color of the flag corresponding level will change to green.

## FLAG TWO - EXPORTED ACTIVITY

Goal : **There is a way to bypass the main activity and invoke other activities that are exported.**

**What is an activity?**

An activity is a single focused thing that the user can do. It is an application component that provide a user interface for users to interact with.

Looking at the **flagtwoactivity**, the source code below.

```java
public class FlagTwoActivity extends ActivityC0453c {
    /* renamed from: w */
    int f4461w = 0;
    /* renamed from: F */
    public /* synthetic */ void m4090F(View view) {
        int i = this.f4461w;
        if (i == 0) {
            Snackbar X = Snackbar.m2647X(view, "Key words Activity and exported.", 0);
            X.m2646Y("Action", null);
            X.mo2650N();
            this.f4461w++;
        } else if (i == 1) {
            Snackbar X2 = Snackbar.m2647X(view, "Exported Activities can be accessed with adb or Drozer.", 0);
            X2.m2646Y("Action", null);
            X2.mo2650N();
            this.f4461w = 0;
        }
    }
    /* access modifiers changed from: protected */
    @Override // androidx.appcompat.app.ActivityC0453c, androidx.fragment.app.ActivityC0797d, androidx.activity.ComponentActivity, androidx.core.app.ActivityC0714e, android.app.Activity
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView(R.layout.activity_flag_two);
        m8078C((Toolbar) findViewById(R.id.toolbar));
        ((FloatingActionButton) findViewById(R.id.fab)).setOnClickListener(new View.OnClickListener() { // from class: b3nac.injuredandroid.d
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                FlagTwoActivity.this.m4090F(view);
            }
        });
    }
}
```

The **oncreate** method is used for initializing the activity. The goal of the challenge is to invoke the `flagtwoactivity` from an external application. This activity is an **exported activity**, meaning it can be started outside the context of the application.

Activities in android are defined in _AndroidManifest.xml_ .

```xml
<activity android:name="b3nac.injuredandroid.b25lActivity" android:exported="true"/>
```

As you see above, activity **b3nac.injuredandroid.b25lActivity** can be invoked by an external application because **android:exported** attribute is set to true.

For exploitation of the above issue we will use adb. First, we use adb to list installed packages and grep the application of our interest using grep utility.

```bash
vx@archie:~$ adb shell pm list packages | grep injuredandroid
package:b3nac.injuredandroid
```

**What happens when invoke b25lActivity class activity?**

When b25lActivity activity is invoked by an external application, it sets flag2 color to green in the FlagsOverview activity as illustrated in the code below.

```java
/* loaded from: classes.dex */
public final class b25lActivity extends ActivityC0453c {
    /* access modifiers changed from: protected */
    @Override // androidx.appcompat.app.ActivityC0453c, androidx.fragment.app.ActivityC0797d, androidx.activity.ComponentActivity, androidx.core.app.ActivityC0714e, android.app.Activity
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView(R.layout.activity_b25l);
        ApplicationC1492j.f4506j.m4062a(this);
        new FlagsOverview().m4082M(true);
        new ApplicationC1492j().m4065b(this, "flagTwoButtonColor", true);
    }
}
```

Invoke the activity b25lActivity using adb. Alternative method of invoking exported activities is by creating an android application thats starts the target`s activity.

```bash
vx@archie:~$ adb shell am start  -n b3nac.injuredandroid/.b25lActivity
Starting: Intent { cmp=b3nac.injuredandroid/.b25lActivity }
```

When activity two is started successfully through an external application, we are rewarded with a flag.

![Flag two](flag2.png)

## FLAG THREE - RESOURCES

**Goal: Understanding how an application references Resources.**

**what are resources?**

Resources are used for defining colors, images, layouts, menus and string values. Everything defined in resources are referenced in application`s code.

The decompiled code for FlagThreeActivity is shown below.

```java
    public final void submitFlag(View view) {
        EditText editText = (EditText) findViewById(R.id.editText2);
        C2724g.m882d(editText, "editText2");
        if (C2724g.m885a(editText.getText().toString(), getString(R.string.cmVzb3VyY2VzX3lv))) {
            Intent intent = new Intent(this, FlagOneSuccess.class);
            new FlagsOverview().m4083L(true);
            new ApplicationC1492j().m4065b(this, "flagThreeButtonColor", true);
            startActivity(intent);
        }
    }
```

Looking at **submitFlag** function defined in **_FlagThreeActivity.java_**, the function is comparing user input with value referenced at Resource **_cmVzb3VyY2VzX3lv_** . R stands for resource.

Looking at strings we get flag as referenced by the string above.

```shell
<string name="cmVzb3VyY2VzX3lv">F1ag_thr33</string>
```

The flag is **F1ag_thr33**

## FLAG FOUR - LOGIN2

**Goal: Get the right flag**

For flag four we analyze **FlagFourActivity.java.** activity. First is to figure out the logic implemented in the `submitflag` class.

```java
    public final void submitFlag(View view) {
        EditText editText = (EditText) findViewById(R.id.editText2);
        C2724g.m882d(editText, "editText2");
        String obj = editText.getText().toString();
        byte[] a = new C1489g().m4070a();
        C2724g.m882d(a, "decoder.getData()");
        if (C2724g.m885a(obj, new String(a, C2759c.f6854a))) {
            Intent intent = new Intent(this, FlagOneSuccess.class);
            new FlagsOverview().m4086I(true);
            new ApplicationC1492j().m4065b(this, "flagFourButtonColor", true);
            startActivity(intent);
        }
    }
```

The above decompiled code,we get user input and compare with bytes in variable `a`. To understand the logic we analyze the method **_c1489g_** and member class **_m4070a_**.

```java
public class C1489g {
    /* renamed from: a */
    private byte[] f4499a = Base64.decode("NF9vdmVyZG9uZV9vbWVsZXRz", 0);

    /* renamed from: a */
    public byte[] m4070a() {
        return this.f4499a;
    }
```

Public class **c1489g**, implements base64 decoding of the byte string and returns decoded string to **submitFlag** class.

For decoded string, use base64 linux utility.

```bash
$ echo "NF9vdmVyZG9uZV9vbWVsZXRz" | base64 -d
4_overdone_omelets
```

Level 4 flag is **4_overdone_omelets**

## FLAG FIVE - EXPORTED BROADCAST RECEIVERS

**Goal:** **Understand how Broadcast receivers work**

An application receives broadcasts in two ways:

1. Through manifest-declared receivers.
2. Context-registered receivers.

Manifest-declared receivers - This causes the system to launch an application when broadcast is received. Searching in `AndroidManifest.xml` file we get where our broadcast is declared.

```xml
<receiver android:name="b3nac.injuredandroid.FlagFiveReceiver" android:exported="true"/>
<activity android:theme="@style/AppTheme.NoActionBar" android:label="@string/title_activity_flag_five" android:name="b3nac.injuredandroid.FlagFiveActivity"/>
```

In order to understand the Broadcast receivers, analyze **oncreate()** method in **FlagFiveActivity.java** file.

```java
public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView(R.layout.activity_flag_five);
        m8078C((Toolbar) findViewById(R.id.toolbar));
        ((FloatingActionButton) findViewById(R.id.fab)).setOnClickListener(new View.OnClickListener() { // from class: b3nac.injuredandroid.c
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                FlagFiveActivity.this.m4118G(view);
            }
        });
        new ComponentName(this, FlagFiveReceiver.class);
        getPackageManager();
        C0310a.m8404b(this).m8403c(this.f4409x, new IntentFilter("com.b3nac.injuredandroid.intent.action.CUSTOM_INTENT"));
        ((Button) findViewById(R.id.button9)).setOnClickListener(new View.OnClickListener() { // from class: b3nac.injuredandroid.b
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                FlagFiveActivity.this.m4117H(view);   // invokes the intent
            }
        });
    }
```

From the above code, clicking flag2 button, we invoke intent which is defined in **_m4117H_** class.

An intent is used to perform an action on the screen. Therefore clicking the button element in our application we are invoking an new intent. Intents are used for sending a broadcast receiver.

```java
 /* renamed from: H */
    public /* synthetic */ void m4117H(View view) {
        m4119F();
    }

public void m4119F() {
        sendBroadcast(new Intent("com.b3nac.injuredandroid.intent.action.CUSTOM_INTENT"));
    }
```

Analyzing component name **FlagFiveReceiver** class, when an intent is invoked twice, we get flag. The class implements a conditional if else loop condition for checking the number of intents. When the correct flag is displayed, the intents counter is set to zero( **i2 = 0**), where **i2** variable is intent counter as shown in java code below.

```java
public final class FlagFiveReceiver extends BroadcastReceiver {

    /* renamed from: a */
    private static int f4410a;

    @Override // android.content.BroadcastReceiver
    public void onReceive(Context context, Intent intent) {
        String str;
        int i;
        C2724g.m881e(context, "context");
        C2724g.m881e(intent, "intent");
        ApplicationC1492j.f4506j.m4062a(context);
        int i2 = f4410a;
        if (i2 == 0) {
            StringBuilder sb = new StringBuilder();
            sb.append(C2765h.m809e("\n    Action: " + intent.getAction() + "\n\n    "));
            sb.append(C2765h.m809e("\n    URI: " + intent.toUri(1) + "\n\n    "));
            str = sb.toString();
            C2724g.m882d(str, "sb.toString()");
            Log.d("DUDE!:", str);
        } else {
            str = "Keep trying!";
            if (i2 != 1) {
                if (i2 == 2) { //Number of times to invoke out intents
                    new FlagsOverview().m4087H(true);
                    new ApplicationC1492j().m4065b(context, "flagFiveButtonColor", true);
                    Toast.makeText(context, "You are a winner " + C1494k.m4061a("Zkdlt0WwtLQ="), 1).show();
                    i = 0;
                    f4410a = i;
                }
                Toast.makeText(context, str, 1).show();
                return;
            }
        }
        Toast.makeText(context, str, 1).show();
        i = f4410a + 1;
        f4410a = i;
    }
}
```

**onReceive** method is responsible for receiving intents sent. Invoking our Activity two times we get a flag.

![Flag Five](flag5.png)

The flag for challenge five is **F1v3!**
