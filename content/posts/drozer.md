---
title: "Drozer Security Testing Framework"
date: 2024-03-30T11:37:15+03:00
draft: false
authors: [Thuri]
lightgallery: true
tags: ["drozer", "android", "appsec"]
toc:
    enable: true
    auto: true
code:
    maxShownLines: 100

summary: "Drozer is an Android security test framework developed by WithSecure Labs to test security vulnerabilities in Android applications and devices by assuming the role of the target application and interaction with Android Runtime, other applications IPC."
---

Drozer is an Android security framework developed by [WithSecure Labs](https://labs.withsecure.com/home) to test security vulnerabilities in applications and devices by assuming the role of an app and interaction with Android Runtime, other app's IPC endpoints, and the underlying Operating System.

The drozer helps reduce the time taken for security testing by automating tedious and repetitive tasks.

## Installation

To get the drozer framework working correctly, one needs to properly install both `drozer client` and `drozer agent`. drozer client is installed on the host machine used for interacting with the target device while the agent is the target Android application for testing.

To install the drozer client, follow the following steps:

1. Download the client from the following repository [drozer](https://github.com/WithSecureLabs/drozer/releases/). (The latest version is 3.0.0 as of April 2024)
2. Install the dependencies as highlighted in the GitHub repository page
3. Run `pip install drozer-<version>.whl` to install drozer
4. To check if installed successfully, run `drozer` on the command line.

{{< image src="/drozer/drozer1.png" caption="Drozer" >}}

For a successful installation, the output should be as shown above.

To install the drozer agent, run the following command.

```bash
adb install agent.apk
```

The drozer should be successfully installed on the device. To start a new session and connect to the device via `adb`, follow the steps below:

1. Open the Android application on the launcher device
2. Enable Embedded server

{{< image src="/drozer/drozer2.png" caption="Drozer Server" >}}

3. Run the following command for port forwarding

```bash
adb forward tcp:31415 tcp:31415
```

Now start a new session using the drozer console by running the following command.

```bash
drozer console connect
```

A successful run will output a console for interacting with the device as shown below.

{{< image src="/drozer/drozer3.png" caption="Drozer Console" >}}

Now we can use the drozer framework to carry out the security assessment of various Android components. The main four Android components are `activity`, `service`, `provider`, and `receiver`.

## Attack surface enumeration

For starting any security testing, there is a need to map out the attack surface available. This will help in prioritizing the critical areas to test for the vulnerabilities in the target applications.

Some of the commonly used modules for mapping out the attack surface and more information about the application are:

| Module                    | Description                                       |
| ------------------------- | ------------------------------------------------- |
| app.package.attacksurface | Get attack surface of package                     |
| app.package.backup        | Lists packages that use the backup API            |
| app.package.info          | Get information about installed packages          |
| app.package.native        | Find Native libraries embedded in the application |

Running the `run app.package.attacksurface` in the console we can identify the entry points for our further investigations

{{< image src="/drozer/drozer4.png" caption="Drozer AttackSurface Module" >}}

From the results above, we have 11 exported activities, 15 broadcast receivers, one (1) content provider, and seven (7) exported services. This means they can be triggered by an external application.

To get help with any command, one can run the following `help target-module` to get more information. For example, getting help on `app.service.info`

{{< image src="/drozer/drozer5.png" caption="Drozer Help" >}}

## Activities

An Activity represents a single screen with a user interface. It is an entry point for interacting with the user.

| Module                     | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| app.activity.info          | Gets information about exported activities                      |
| app.activity.start         | Start an Activity                                               |
| scanner.activity.browsable | Get a list of activities that can be reached from a web browser |

## Services

A `Service` is an application component that can perform long-running operations in the background without a user interface. The service can be started by other components (such as Activity). Additionally, components can be bound to services to interact with them and even perform inter-process communication(`IPC`).

Types of services implemented by Android are:

-   Started Services
-   Bound Services

| Module            | Description                                        |
| ----------------- | -------------------------------------------------- |
| app.services.info | Get information about exported services            |
| app.service.start | Start Service                                      |
| app.service.send  | Send a Message to a service, and display the reply |

## Broadcast Receivers

A broadcast receiver is a component that lets the system deliver events to the app outside of a regular user flow so the app can respond to system-wide broadcast announcements. Because broadcast receivers are another well-defined entry into the app, the system can deliver broadcasts even to apps that aren't currently running

| Module              | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| app.broadcast.info  | Get information about broadcast receivers                       |
| app.broadcast.send  | Send broadcast using an intent                                  |
| app.broadcast.sniff | Register a broadcast receiver that can sniff particular intents |

## Content Providers

A content provider manages a shared set of app data that you can store in the file system, in an SQLite database, on the web, or in any other persistent storage location that your app can access. Through the content provider, other apps can query or modify the data, if the content provider permits it. Used for sharing data across applications.

The methods implemented by the `ContentProvider` class are `query`, `insert`, `delete`, `update`, `getType`, and `onCreate`. Except for `onCreate`, which is called by the system in the main thread, other methods are actively called by the client program. Custom providers must be declared in the Manifest file.

| Module                     | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| app.provider.info          | Get information about exported content providers                     |
| scanner.provider.finduris  | Search for content providers that can be queried from our context.   |
| scanner.provider.injection | Test content providers for SQL injection vulnerabilities             |
| scanner.provider.sqltables | Find tables accessible through SQL injection vulnerabilities         |
| scanner.provider.traversal | Test content providers for basic directory traversal vulnerabilities |

## Conclusion

Drozer functionality can be expanded through modules. This allows one to investigate more Android platform-specific aspects and integrate a few exploits.

To install a new drozer module, run the following command in the console

```bash
module install module-name
```

This article is a simple introduction to drozer functionality for testing Android applications. The next blog will explain how to write new modules and port a few exploits into the framework.
