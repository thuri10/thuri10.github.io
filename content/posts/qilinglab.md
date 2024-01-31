---
title: "Qiling Lab challenge"
date: 2023-10-17T14:27:14Z
draft: true
authors: [thuri]
tags: ["qilinglab"]
toc:
    enable: true
    auto: false

code:
    maxShownLines: 100
summary: "QilingLab is a challenge developed by [THEZERO](https://twitter.com/Th3Zer0) with aim of learning main Qiling features through a practical approach."
---

QilingLab is a challenge developed by [THEZERO](https://twitter.com/Th3Zer0) with aim of learning main Qiling features through a practical approach.

## Challenge 1: Store 1337 at pointer 0x1337.

The goal of the first challenge is to understand how Qiling abstracts memory.

![challenge 1](/qiling/challenge1.png)

Before doing any memory operation, Memory needs to be mapped before it can be accessed. we map memory through `map` method provided by qiling framework as shown below. The starting address for our mapping is `0x1000` and the size of memory to be mapped is `4096` which is the least multiple for alignment in a Linux system.

Next is to write our target value `0x539` to the mapped memory using `ql.mem.write`method in the memory location `0x1337`.

```python
def challenge1(ql):
    # Align memory
    ql.mem.map(0x1000//0x1000*0x1000, 0x1000, info="[Challenge1]")
    # write 1337 to memory addr 0x1337
    ql.mem.write(0x1337, ql.pack16(1337))
```

## Challenge 2: Make the uname syscall return the correct values.

The goal is to hook the implementation of the `uname` syscall and call our own `uname` implementation when `uname` is called.

The image below shows the decompilation of the second challenge.

![challenge two](/qiling/challenge2.png)

For hooking the syscall, we need to understand the structure of the `uname` ash higlighted in code implementation below. uname is responsible for returning information in te structure pointed to buf.

```c
//filename #include/linux/utsname.h
struct new_utsname {
	char sysname[65];
	char nodename[65];
	char release[65];
	char version[65];
	char machine[65];
	char domainname[65];
};

```

### solution

```python
def my_syscall_uname(ql, write_buf, fd:int, count:int) -> int:
    data = b'QilingOS\x00'  # sysname
    ql.mem.write(write_buf, data)

    # important!! If not set will `FATAL: kernel too old`
    buf = b'10000'.ljust(65, b'\x00')
    ql.mem.write(write_buf+65*2, buf)
    buf = b'ChallengeStart'
    ql.mem.write(write_buf+65*3, buf)
    return 0
```

## Challenge 3: Make /dev/urandom and getrandom “collide”.

```python
# challenge 3
# Hijacking VFS objects - dev, procfs, sysfs
class Fake_urandom(QlFsMappedObject):
    def read(self, size):
        if(size > 1):
            return b"\x04" * size
        else:
            return b"\x02"

    def close(self):
        return 0

#hook getrandom syscall
def my_syscall_getrandom(ql, write_buf, write_buf_size, flag, *args, **kw):
    buf = b"\x04" * write_buf_size
    ql.mem.write(write_buf, buf)
    return 0


def challenge3(ql):
    ql.add_fs_mapper('/dev/urandom', Fake_urandom())
    ql.os.set_syscall("getrandom", my_syscall_getrandom)

```

## Challenge 4: Enter inside the “forbidden” loop.

![challenge four](/qiling/challenge4.png)

```python
# Hook register value
def hook_cmp(ql):
    ql.arch.regs.w0 = 1
    return

# get base addr and  address offset to hook
def challenge4(ql):
    base_addr = ql.mem.get_lib_base(ql.path)
    ql.hook_address(hook_cmp,  base_addr + 0xfe0)
```

## Challenge 5: Guess every call to rand().

![challenge five](/qiling/challenge5.png)

```python
# challenge 5
# Hook random call
def hook_rand(ql, *args, **kw):
    ql.arch.regs.w0 = 0
    return

def challenge5(ql):
    ql.os.set_api("rand", hook_rand, QL_INTERCEPT.CALL)
```

## Challenge 6: Avoid the infinite loop.

![challenge 6](/qiling/challenge6.png)

```python
# Hook register
def hook_cmp1(ql):
    ql.arch.regs.w0 = 0
    return
def challenge6(ql):
    base_addr = ql.mem.get_lib_base(ql.path)
    ql.hook_address(hook_cmp1, base_addr + 0x001118)

```

## Challenge 7: Don’t waste time waiting for sleep.

![challenge 7](/qiling/challenge7.png)

```python
# Hook register value
def hook_sleeptime(ql):
    ql.arch.regs.w0 = 0
    return
def challenge7(ql):
    base_addr = ql.mem.get_lib_base(ql.path)
    ql.hook_address(hook_sleeptime, base_addr + 0x1154)
```

## Challenge 8: Unpack the struct and write at the target address.

```c
struct_v2 *__fastcall challenge8(__int64 a1)
{
  struct_v2 *result; // rax
  struct_v2 *v2; // [rsp+18h] [rbp-8h]

  v2 = malloc(24uLL);
  v2->pchar0 = malloc(30uLL);
  *v2->gap8 = 1337;
  *&v2->gap8[4] = 0x3DFCD6EA;
  strcpy(v2->pchar0, "Random data");
  result = v2;
  v2->qword10 = a1;
  return result;
}
```

```python

def find_and_patch(ql, *args, **kw):
    MAGIC = 0x3DFCD6EA00000539
    magic_addrs = ql.mem.search(ql.pack64(MAGIC))

    # check_all_magic
    for magic_addr in magic_addrs:
        # Dump and unpack the candidate structure
        malloc1_addr = magic_addr - 8
        malloc1_data = ql.mem.read(malloc1_addr, 24)
        # unpack three unsigned long
        string_addr, _, check_addr = struct.unpack('QQQ', malloc1_data)

        # check string data
        if ql.mem.string(string_addr) == "Random data":
            ql.mem.write(check_addr, b"\x01")
            break
    return

def challenge8(ql):
    base_addr = ql.mem.get_lib_base(ql.path)
    ql.hook_address(find_and_patch, base_addr + 0x011dc)
```

## Challenge 9: Fix some string operation to make the iMpOsSiBlE come true.

![challenge 9](/qiling/challenge9.png)

```python
def hook_tolower(ql):
    return

def challenge9(ql):
    ql.os.set_api("tolower", hook_tolower)
```

## Challenge 10: Fake the cmdline line file to return the right content.

![challenge 10](/qiling/challenge10.png)

```python
class Fake_cmdline(QlFsMappedObject):
    def read(self, size):
            return b"qilinglab\x00"

    def fstat(self) -> int:
        return -1

    def close(self):
        return 0


def challenge10(ql):
    ql.add_fs_mapper(r"/proc/self/cmdline", Fake_cmdline())
```

An alternative solution is to patch check at the `cmp` instruction address

```python
def challenge10A(ql):
    base_addr = ql.mem.get_lib_base(ql.path)
    ql.hook_address(hook_cmp1, base_addr + 0x1398)
```

## Challenge 11: Bypass CPUID/MIDR_EL1 checks.

![challenge 11](/qiling/challenge11.png)

```python
# challenge 11
def hook_midr(ql, *args, **kw):
    ql.arch.regs.x0 = ql.arch.regs.x1

def challenge11(ql):
    base_addr = ql.mem.get_lib_base(ql.path)
    ql.hook_address(hook_midr, base_addr + 0x1400)
```

After solving all the 11 challenges, running the solution script will show and image as below.

![solution](/qiling/solution.png)

The `solution` can be downloaded from the following url.
