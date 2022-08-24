---
title: RedLineStealer - Information stealer analysis
date: 2022-02-7 23:20:48
tags:
  - Malware
  - reverse
---

Redline malware is an Information Stealer written in c#, targeting windows victims. It is used for gathering victims information ranging from the Browser cookies, saved credentials, Discord tokens, OS information, <!-- more --> Languages, VPN profiles, Installed Programs and Network configurations.

The malware is capable of downloading additional malware from its C2 servers.

## Stage1 - Loader Analysis

The first stage of sample malware is used for assembling and executing an additional payload. The sample used throughout this post is `RedlineStealer` malware which can be downloaded from [MalwareBaazar](https://bazaar.abuse.ch).

The sha256 hash of the sample is `72b7f772e019def30abcf817ae7a3004a84215daef67588eaa1fde3839df2fa2`. First step is loading sample in `Detect it Easy` tool to check whether is packed or not.

![](/images/redline/redliner.png)

From the initial Analysis, the sample is not packed and is a `.NET` Family malware. Vast amount of `.NET` family programming languages functionality has given malware authors power to write simple yet powerful tools therefore leading to an increase in malware distributed.

## Payload Extraction

For Analysis of compiled binaries, `IDA` and `ghidra` are main first tools of choice to an analyst. For analysis of .NET binaries is different, use `dnSpy` which helps debug the functionality of the sample.

For extraction of our payload, we will do both manual and dynamic extraction of the second stage binary. Both methods have their own advantages and disadvantages as highlighted below.

### Method1 - Manual Extraction

This method is we extract payload from the encrypted string arrays `s` as shown in the image below. Malware uses anti-analysis techniques to prevent it from being analyzed.

![](/images/redline/stringarray.png)

From image above, we de-obfuscate malware by replacing the strings with the target strings as shown in the program. After replacing all the strings,we write a small python program to convert the base64 encoded string to PE binary.

The python script to decode the base64 encoded string to binary.

```python
import base64

#s string array is our binary
string_encoded = " "
decoded = base64.b64decode(string_encoded)
open('stage2.exe', 'wb').write(decoded)
```

Our dumped files are valid binaries, but do not contain all features because the malware is using Reflection method to load additional assembly code. Reflection is a method used to load other assemblies at runtime of the program. This enables the malware to add extra features and validation of the program.

### Method2 - Dynamic Extraction

The second method `Dynamic` is more powerful compared to the manual method.This enables us to inspect the program behavior at runtime. For extraction of the second stage payload we put a breakpoint on the line `22` as shown in image below.

![](/images/redline/breakpoint.png)

On `dnspy` debugger put a breakpoint on line 22, Run the program until the execution hits the breakpoint.

![](/images/redline/righclick_array.png)

By examining the values in image above,we can examine the array we passing to the object method. Looking at the bytes data of the above array, the first two bytes are magic number of PE file `4D5A` or ascii `MZ`. From the first two bytes we can make an assumption the buffer is our second stage binary. Right click the buffer memory to save the sample.

## Stage2 - Payload Analysis

This is the second stage analysis of our extracted malware file, The extracted binary is `.NET` binary. Opening the binary in debugger, entrypoint of the binary looks as shown in the image below. The main function executes the `WriteLine` function.

![](/images/redline/dumpedfile.png)

FMalware does environment check before communication to configured C2 servers.

### Language Culture check

The malware checks the language, Timezone, CultureInfo and region country of the Victims Machine. The cultureInfo class provides information about a specific culture, known as `locale`. The information includes the formatting of the dates, writing system, numbers and calendar used.
![](/images/redline/languagecheck.png)

The malware check if victims region country is within the array of the strings shown above and if the does not contain `EnglishName`.

### Network Communication Analysis

The second part of our analysis is determining IP address in which the malware is communicating to.The Ip address of the malware seems to be encrypted as shown in the image below. `StringDecrypt` function takes two arguments, the IP address and Key and decrypts the `address`
![](/images/redline/connection.png)

The arguments variables of the malware are shown in the image below. The arguments includes the IP address and Key used for encryption of the data.

![](/images/redline/args_key.png)

With the encrypted `IP` and `key` we can decrypt the address used for providing the connection.

### IP address Decryption

The `StringDecrypt` is a multistage decryption method which employs both `base64` encoding and bitwise `xor` logic for decryption of the data.

![Decrypt Strings](/images/redline/decrypt_method.png)

From the logic above, reimplement the logic in `python` and recover the encrypted data.

The python code used for decrypting the code is,

```python
# -*- coding: utf-8 -*-
import base64
import pwn
ip_addr =b"AiE1CyQDBVA/JR4OPwIKGSoZGkU6NyVa"
key =b"Outshines"

ip_addr_decode = base64.b64decode(ip_addr)
result_encoded =pwn.xor(ip_addr_decode, key)
result = base64.b64decode(result_encoded)
print(result)
```
Running above code we get C2 server address

```bash
 $ python3 base.py
b'101.99.93.70:54437'
```

### Strings Conciliation methods

The malware employs strings concilation methods to slow down analysis. It adds some junk strings to the target strings which is replaced during the runtime of the malware with an empty string.

![](/images/redline/stringreplace.png)

Example of string concilation tactic is above function. The junk string added to the string array is `MANGO` which is replaced with an empty string.
The string from the char array is `coMANGOokies.sqMANGOlite` , replacing the `MANGO` string with an empty string, we get `cookies.sqlite` which is a file used for storing cookies by Firefox browser.

## Information Harvesting

The Malware harvest a lot of Victims data and sends back to the configured c2 server. The malware is simple but effective in collecting a lot of user information. The information collected by malware includes cookies, user tokens, system configurations, graphic cards, processor count, Network information, application installed, credit wallet information and many more.

Below is explanation of the capabilities of the malware.

### Browser

The malware is capable of stealing the user`s credentials and cookies of from browser session.

![](/images/redline/browsers.png)

The malware is also capable of enumerating chrome and Opera Mini if installed on the Victim`s machine. It also gets the version of the installed browser as shown in the image below.
![](/images/redline/chrome_scan.png)

### FileZilla

Filezilla is a professional software that makes transfer of files from one computer to another easier via FTP, SFTP, FTPs protocols and other cloud services such as Amazon S3.
![](/images/redline/filezillacredentials.png)
The malware scans for the saved credentials used by Victim in transferring files to other machines. The malware collects `host, Port, User, Pass` of the machines

### Programs Enumeration

Malware is also capable of collecting all installed applications on the machine using `ListofPrograms` function as shown in the below. After enumerating all the installed applications, the malware sends data back to the C2 server.

![](/images/redline/program_exfil.png)

The malware enumerates installed application through use of registry. Querying of registry is an effective way of finding out all installed applications in Windows. The malware gets the program name and version as shown by `text` and `text2` strings.

![](/images/redline/programenumeration_registry.png)

### VPN information Gathering

The malware scans for Victim`s configuration files and profiles of various VPNs installed on the device. The malware scans File configs NordVPN, OpenVpn configs and ProtonVPN profiles.

![](/images/redline/vpns.png)

### Exfilitration

For the exfiltration of the data, the malware creates a folder in `APPdata` folder called `Yandex\YAddon`. The data collected is uploaded in chunks to c2 server.

![](/images/redline/exfil_folder.png)

## References

1. https://www.natlawreview.com/article/privacy-tip-315-redline-malware-used-to-steal-saved-credentials
2. https://www.zdnet.com/article/fortinet-warns-of-cybercriminals-using-omicron-variant-news-to-distribute-redline-stealer
3. https://www.proofpoint.com/us/blog/threat-insight/new-redline-stealer-distributed-using-coronavirus-themed-email-campaign
