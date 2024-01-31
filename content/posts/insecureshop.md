+++
title = 'Android Hacking basics using insecureShop'
date = 2024-01-18T17:29:23+03:00
draft = true
summary="Insecureshop vulnerable android application writeup"
+++

InsecureShop is an intentionally vulnerable application for teaching developers about android vulnerabilities

## Hardcoded credentials

> Credentials are hardcoded somewhere that can be used to login to the application

Looking at the `LoginActivity` code we get the hardcoded credentials which can be used to login

```java
    Log.d("userName", username);
    Log.d("password", password);
    boolean auth = Util.INSTANCE.verifyUserNamePassword(username, password);
```

look at the `verifyUserNamePassword` function

```java
private final HashMap<String, String> getUserCreds() {
    HashMap userCreds = new HashMap();
    userCreds.put("shopuser", "!ns3csh0p");
    return userCreds;
}

public final boolean verifyUserNamePassword(String username, String password) {
    Intrinsics.checkParameterIsNotNull(username, "username");
    Intrinsics.checkParameterIsNotNull(password, "password");
    if (getUserCreds().containsKey(username)) {
        String passwordValue = getUserCreds().get(username);
        return StringsKt.equals$default(passwordValue, password, false, 2, null);
    }
    return false;
}
```

## Insufficient URL validation

> Possible to load any arbitrary URL in webview via Deeplink.

```java
android.net.Uri uri = intent.getData();
        if (uri != null) {
            android.net.Uri uri2 = uri;
            java.lang.String str = null;
            java.lang.String data = null;
            if (kotlin.text.StringsKt.equals$default(uri.getPath(), "/web", false, 2, (java.lang.Object) null)) {
                android.content.Intent intent2 = getIntent();
                kotlin.jvm.internal.Intrinsics.checkExpressionValueIsNotNull(intent2, "intent");
                android.net.Uri data2 = intent2.getData();
                if (data2 != null) {
                    str = data2.getQueryParameter("url");
                }
                data = str;

```

## Weak Host Validation

> Possible to bypass host validation check to load any arbitrary URL in webview.

```java
} else if (kotlin.text.StringsKt.equals$default(uri.getPath(), "/webview", false, 2, (java.lang.Object) null)) {
                android.content.Intent intent3 = getIntent();
                kotlin.jvm.internal.Intrinsics.checkExpressionValueIsNotNull(intent3, "intent");
                android.net.Uri data3 = intent3.getData();
                if (data3 == null) {
                    kotlin.jvm.internal.Intrinsics.throwNpe();
                }
                java.lang.String queryParameter = data3.getQueryParameter("url");
                if (queryParameter == null) {
                    kotlin.jvm.internal.Intrinsics.throwNpe();
                }
                kotlin.jvm.internal.Intrinsics.checkExpressionValueIsNotNull(queryParameter, "intent.data!!.getQueryParameter(\"url\")!!");
                if (kotlin.text.StringsKt.endsWith$default(queryParameter, "insecureshopapp.com", false, 2, (java.lang.Object) null)) {
                    android.content.Intent intent4 = getIntent();
                    kotlin.jvm.internal.Intrinsics.checkExpressionValueIsNotNull(intent4, "intent");
                    android.net.Uri data4 = intent4.getData();
                    if (data4 != null) {
                        str = data4.getQueryParameter("url");
                    }
                    data = str;
                }
            }
```

## Arbitary Code Execution

> Arbitrary Code Execution via third-party package contexts.

```java
for (android.content.pm.PackageInfo info : getPackageManager().getInstalledPackages(0)) {
            java.lang.String packageName = info.packageName;
            kotlin.jvm.internal.Intrinsics.checkExpressionValueIsNotNull(packageName, "packageName");
            if (kotlin.text.StringsKt.startsWith$default(packageName, "com.insecureshopapp", false, 2, (java.lang.Object) null)) {
                try {
                    android.content.Context packageContext = createPackageContext(packageName, 3);
                    kotlin.jvm.internal.Intrinsics.checkExpressionValueIsNotNull(packageContext, "packageContext");
                    java.lang.Object value = packageContext.getClassLoader().loadClass("com.insecureshopapp.MainInterface").getMethod("getInstance", new java.lang.Class[]{android.content.Context.class}).invoke((java.lang.Object) null, new java.lang.Object[]{this});
                    kotlin.jvm.internal.Intrinsics.checkExpressionValueIsNotNull(value, "packageContext.classLoad…€¦      .invoke(null, this)");
                    android.util.Log.d("object_value", value.toString());
                } catch (java.lang.Exception e) {
                    throw new java.lang.RuntimeException(e);
                }
            }
        }

```

## Intent Redirection ( Access to Protected Components)

> The app takes an embedded Intent and passes it to method like startActivity. This allows any third party app to launch any protected component.

```java
if (auth) {
    Prefs prefs = Prefs.INSTANCE;
    Context applicationContext = getApplicationContext();
    Intrinsics.checkExpressionValueIsNotNull(applicationContext, "applicationContext");
    prefs.getInstance(applicationContext).setUsername(username);
    Prefs prefs2 = Prefs.INSTANCE;
    Context applicationContext2 = getApplicationContext();
    Intrinsics.checkExpressionValueIsNotNull(applicationContext2, "applicationContext");
    prefs2.getInstance(applicationContext2).setPassword(password);
    Util.saveProductList$default(Util.INSTANCE, this, null, 2, null);
    Intent intent = new Intent(this, ProductListActivity.class);
    startActivity(intent);
    return;
}
```

## Unprotected Data Urls

> The untrusted URI's passed via loadUrl method allows attackers to pass arbitrary URL in webview.

```java
if (!(dataString == null || StringsKt.isBlank(dataString))) {
    Intent intent2 = getIntent();
    Intrinsics.checkExpressionValueIsNotNull(intent2, "intent");
    webview.loadUrl(intent2.getDataString());
    return;
}
```

NB: Analyze the intent-filter used by this activity carefully. Can you convert this attack into a remote exploitation by utilizing intent scheme URIs?

## Theft of Arbitrary files from LocalStorage

> Possible to steal files from app's local storage via ChooserActivity.

## Using Components with Known vulnerabilities

> Identify the vulnerable components or libraries used in the app that can allow you to exfiltrate local files to remote domain.

## Insecure Broadcast Receiver

> An exported activity registers a broadcast during onCreate method execution. An attacker can trigger this broadcast and provide arbitrary URL in 'web_url' parameter.

## AWS Cognto Misconfiguration

> The misconfigured AWS cognito instance can be used to accesss AWS S3 bucket.

## Insecure use of FilePaths in FileProvider

> The use of wide file sharing declaration can be used to access root directory via content Provider.

## Use of Implicit intent to send a broadcasr with sensitive data

> The use of Implicit intent can allow third-party apps to steal credentials.

## Intercepting Implicit Intent to load Arbitary URL

> The use of Implicit intent can allow third-party apps to load any arbitrary URL in webview.

## Insecure Implementation of SetResult in exported Activity

> The insecure implementation used in ResultActivity can be used to access arbitrary content providers.

## Insecure Content Provider

> The content provider can be accessed by any third-party app to steal user credentials.

## Lack of SSL Validation

> The unsafe implementation of OnReceived SSL Error can be used to eavesdrop all the traffic loaded in webview.

## Insecure Webview Properties Enabled

> Insecure Webview properties are enabled that can allow third-party apps to exfiltrate local data to remote domain.

## Insecure Data Storage

> The app stores user credentials locally without encrypting them.

## Insecure Logging

> User credentials are leaked in logcat. Only attackers with physical access to the device can access this information.

On the `LoginActivity`the application logs the password and username entered by the user during the Login

```java
    Log.d("userName", username);
    Log.d("password", password);
```
