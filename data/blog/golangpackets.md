---
title: Analyzing Malware packets using gopackets Library
date: '2022-04-20'
tags: ['golang','packets','networking']
draft: false
summary: Gopacket is a library developed by google that provides capabilities for decoding packets in Go language. It enables one to manually decode malware traffic packets easily.
images: []
layout: PostLayout
canonicalUrl:
---

# Introduction
This is an article of my adventures with golang **gopacket** library. As I was working on a personal project, I came across [gopacket](github.com/google/gopacket) library which provides capabilities for decoding packets in Go. The capabilities provided by the library motivated me to try malware traffic analysis with the library instead of using Wireshark. This article focuses on analyzing the QKBOT malware traffic .

## What is gopacket
Gopacket is a library developed by google that provides capabilities for decoding packets in Go language, it enables one to decode the Layers structures of the packets, Network flows, create packets, e.t.c . Library can be used for various purposes ranging from:

- Networking tools by Network Administrators
- Offensive tooling by RED teams i.e Packet Sniffers
- Defensive analysis capabilities by Blue Teams i.e IP monitoring

The ability to manually craft packets can enable one to test systems network connectivity( up or down),vulnerabilities on systems by replaying packets over network.

Below are scenarios where **gopacket** can be used by different users.

## Defensive capabilities
To understand how gopacket can be used by defenders, we will analyze a packet of malware traffic from [malware-traffic-analysis website](https://www.malware-traffic-analysis.net/2022/04/14/index.html).

For this case I will use [QBOT Pcap](https://www.malware-traffic-analysis.net/2022/04/14/index.html) provided in April 2022.

>Before starting analysis of malware of any software one needs to have a clear objective of what HE/She wants to achieve. Our goal can be analyzing malware for various key words, IP addresses or any other IOCs.

### 1. keywords Filtering
First we can write a simple program to analyze our packets using keywords which can be contained in the Application layer of the TCP Model of our packets.

>The keywords can range from HTTP Methods, File extensions and Known domain names. The keywords can be **"GET"** http method, **".zip"** or **".exe"** to check the file names extensions.

Example code of searching our packet using keyword values is shown below.

```go
package main

import (
 "fmt"
 "strings"

 "github.com/google/gopacket"
 "github.com/google/gopacket/pcap"
)

//declare variable to hold our pcap file
var pcapFile string ="cobalt-strike.pcap"

func main() {
  //read the packet file
 handle, err := pcap.OpenOffline(pcapFile)
 var filter string  = "tcp"
 err = handle.SetBPFFilter(filter)
 if err != nil {
  panic(err)
 }
 packetSource  := gopacket.NewPacketSource(handle, handle.LinkType())
 for packet :=range packetSource.Packets() {
  app := packet.ApplicationLayer()
  if app != nil {
   if strings.Contains(string(app.Payload()), "zip"){
    fmt.Println(string(app.Payload()))
   }
  }
 } 
}
```
For the above code we are doing Berkeley Filter of only TCP traffic.
It is possible to filter both **Stream type** and **PORT** using BPF.

The results from the code above are.

![Filter GET HTTP Method](/static/images/packets/packet_name-filter.png)

From running the above code we are able to get file attachment name "**iseerroaemtefspidnle.zip**" which is part of the artifacts of the malware provided.

The attachments files name are matched by the IOC provided
```md
TRAFFIC TO DOWNLOAD THE INITIAL ZIP ARCHIVE:

- 208.91.198.131 port 443 - https://geobram.com/ist/iseerroaemtefspidnle
- 208.91.198.131 port 443 - https://geobram.com/ist/NO_2950435796.zip
```

The "*GET*"  method is used for getting an available resource, therefore meaning the zip file is downloaded to the victim's machine.

### 2. Packet Network Flows
**gopacket** enables one to follow the network flow in certain port or even stream. This enables one to track network activity of a given IP address. This is very useful when there is a spike of network activity in  a given port or range of ports but source is not known.

Example code used for Filtering the C2 traffic flow for a given port is as shown in the code snippet below.

```go
package main

import (
 "fmt"

 "github.com/google/gopacket"
 "github.com/google/gopacket/layers"
 "github.com/google/gopacket/pcap"
)

//declare variable to hold our pcap file
var pcapFile string ="cobalt-strike.pcap"

func main() {
  //read the packet file
 handle, err := pcap.OpenOffline(pcapFile)
 var filter string  = "tcp and port 65400"
 err = handle.SetBPFFilter(filter)
 if err != nil {
  panic(err)
 }
 packetSource  := gopacket.NewPacketSource(handle, handle.LinkType())
 for packet :=range packetSource.Packets() {
  tcp := packet.TransportLayer().(*layers.TCP)
  if tcp != nil {
   fmt.Println(packet.NetworkLayer().NetworkFlow())
  }
    
 }
 return
}
```

Below is the results of filtering the captured pcap file at port 65400. For Filtering section can be any PORT or even can be left blank.

![Network communication flow](/static/images/packets/networkcomm.png)

From the above we can confirm the IP address of the above packet matches the one in the **QABOT C2 traffic IOCs**.

Only one IP address is shown because it the only communicating in that PORT. It is also possible to filter the packet metadata and timestamp for each packet send across.

```md
QAKBOT C2 TRAFFIC:

- 47.158.25.67 port 443 - attempted TCP connections
- 45.46.53.140 port 2222 - HTTPS traffic
- port 443 - www.openssl.org - connectivity check (not inherently malicious)
- 23.111.114.52 port 65400 - TCP traffic
- 75.99.168.194 port 443 - HTTPS traffic
```

From above analysis, it is possible to write your own packet analysis tools and bundle them into third-party tools as plugins.

## Offensive capabilities

Golang has a lot of potential in developing offensive cyber capabilities ranging from developing  vulnerabilities scanners, shellcodes and encoders, proxies and fuzzing tools.

For this section i will focus on use of gopacket to sniff for PORT or stream.
This is the **OpenLive** function which is a wrapper to the **pcapOpenLive**. The function takes an argument of device, which is our interface. the interface can **"eth0"** for ethernet.
Takes a maximum size to read which is defined by snaplen.
if the device set by the user is not found, the functions sets its to default in which is the index 0.

```go
func OpenLive(device string, snaplen int32, promisc bool, timeout time.Duration) (handle *Handle, _ error) {
 var pro int
 if promisc {
  pro = 1
 }

 p, err := pcapOpenLive(device, int(snaplen), pro, timeoutMillis(timeout))
 if err != nil {
  return nil, err
 }
 p.timeout = timeout
 p.device = device

 ifc, err := net.InterfaceByName(device)
 if err != nil {
  // The device wasn't found in the OS, but could be "any"
  // Set index to 0
  p.deviceIndex = 0
 } else {
  p.deviceIndex = ifc.Index
 }

 //---------continue source code-------------
```

This is a simple implementation of to show on how to capture live packets in a given port and machine.
```go
package main

import (
 "fmt"

 "github.com/google/gopacket"
 "github.com/google/gopacket/pcap"
)


var (
 interface_point string ="wlp4s0"
 snaplen_time int32 = 1600
 promiscuous bool = true
)

func main() {
 // Open an Interface to capture packets, with time in milliseconds
 handle, err := pcap.OpenLive(interface_point, snaplen_time, promiscuous, pcap.BlockForever)
 if err != nil {
  panic(err)
 }
 var filter string  = "tcp and port 3000"
 err = handle.SetBPFFilter(filter)
 if err != nil {
  panic(err)
 }
 packetSource := gopacket.NewPacketSource(handle, handle.LinkType())
 for packet := range packetSource.Packets() {
  //Print captured packets
  fmt.Println(packet)
 }

}
```

## Networking
Golang has a lot of network packages which can be used from building tools from proxies, load  balancers and scanners. This provides it an opportunity to build  small utilities to help solve network issues.

The **FindAllDevs** function enumerates all the interfaces on the current machine.

Implementation of FindAllDevs in the pcap package
```go
func FindAllDevs() (ifs []Interface, err error) {
 alldevsp, err := pcapFindAllDevs()
 if err != nil {
  return nil, err
 }
 defer alldevsp.free()

 for alldevsp.next() {
  var iface Interface
  iface.Name = alldevsp.name()
  iface.Description = alldevsp.description()
  iface.Addresses = findalladdresses(alldevsp.addresses())
  iface.Flags = alldevsp.flags()
  ifs = append(ifs, iface)
 }
 return
}
```
From the implementation of the interface, we can parse Name, description, Addresses from the interface information of the Interface found.

Below is a simple program which can be used as an replacement for **ipconfig** in ubuntu.

```go
package main

import (
 "fmt"
 "log"

 "github.com/google/gopacket/pcap"
)

func main() {
 // Find all devices 
 devices, err := pcap.FindAllDevs()
 if err != nil {
  log.Fatal(err)
 }

 // Print device information
 fmt.Println("Devices found:")
 for _, device := range devices {
  fmt.Println("\nName: ", device.Name)
  fmt.Println("Description: ", device.Description)
  for _, address := range device.Addresses {
   fmt.Println("- IP address: ", address.IP)
   fmt.Println("- Subnet mask: ", address.Netmask)
  }
}
}
```

To compile the above code,  run the following bash command
```bash
go build devices.go   //choose a suitable for you program
```

After a Successful Build, you can add the program to your environment path. Running the program  outputs the following output.

![Conculsion](/static/images/packets/network.png)

## Conclusion
Golang net packages and gopacket library provides one ability to write network application ranging from small utilities to scanners.

>Bundle the interface scanner with a network scanner to get all the interfaces exposed in a given network range.





## References

1. https://twitter.com/malware_traffic/status/1513556366346137605
2. Black Hat GO book (Go Programming for Hackers and pentesters) by Tom Steele, Chris Patten, and Dan Kottmann.

