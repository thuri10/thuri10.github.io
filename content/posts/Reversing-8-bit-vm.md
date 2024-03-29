---
title: "Reversing 8-bit Virtual VM"
date: 2021-12-07T14:27:14Z
draft: false
authors: ["Thuri"]
tags: ["malware", "reverse", "ctf"]
summary: "vm1.exe implements a simple 8-bit virtual machine (VM) to try and stop reverse engineers from retrieving the flag"
toc:
    enable: true
    auto: false

code:
    maxShownLines: 100
---

`vm1.exe` implements a simple 8-bit virtual machine (VM) to try and stop reverse engineers from retrieving the flag. The VM`s RAM contains the encrypted flag and some bytecode to decrypt it. Can you figure out how the VM works and write your own to decrypt the flag?<!-- more --> A copy of the VM’s RAM has been provided in ram.bin (this data is identical to the ram content of the malware’s VM before execution and contains both the custom assembly code and encrypted flag).

Main function analysis

![Main Function](/mal/vmq.png)

From the main function, **HeapAlloc** allocates a memory block of size **0x1FB** bytes. The pointer of the allocated memory block is called `allocated_memblock` as shown in the image.

The program does a **memcpy** of the content stored in the `rambin` offset to newly allocated memory block.

```c
void *memcpy(void *dest,const void *src, size_t count);
```

`memcpy` function copies data from the source address to destination address of size 0x1fb. The destination address of this program is allocate_memblock. The content of the `rambin` file and content at the rambin offset are the same as examined below.

![Rambin](mal/rambin.png)
![IDA HEX](/mal/ida_hex.png)

Next step is analyzing **sub_4022E0** function. The disassembled function graph looks like the one below.

![sub_4022E0 control flow loop](/mal/vmflow.png)

From the disassembly above, the binary does some byte operations. The first graph block is doing a bitwise `AND` operation, which is responsible for setting both `SF` and `ZF` to zero.First it sets the value of eax register to 1, and then do a test operation. Because the conditional **"jump if zero"** is not true, we continue our execution to the next control block.

For decompilation of our binary we use ghidra.

```c
int FUN_004022e0(void)
{
  byte bVar1;
  uint uVar2;
  byte bVar3;
  byte counter;

  counter = 0;
  do {
    /* 0 */
    uVar2 = (uint)counter;
      /* 2 */
    bVar1 = counter + 1;
    bVar3 = counter + 2;
    counter = counter + 3;
    uVar2 = FUN_00402270((uint)*(byte *)(allocated_memblock + 0xff + uVar2),
                         (uint)*(byte *)(allocated_memblock + 0xff + (uint)bVar1),
                         (uint)*(byte *)(allocated_memblock + 0xff + (uint)bVar3));
  } while ((uVar2 & 0xff) != 0);
  return uVar2;
}
```

The above c-code like is more easier to understand.The assembly equivalent of this operation is as the one shown in the first memory block of the function.

```asm
loc_4022EA:
mov     eax, 1
test    eax, eax
jz      short loc_402367
```

Function **FUN_00402270** is called and three arguments are passed as parameters.The control graph below shows various operation executed by the binary depending on the argument passed to the function.

![control flow loop](/mal/vmflow2.png)

From the above graph, the function does a compare on the arguments passed with either 1, 2 or 3. If the condition is fulfilled, that operation branch is executed as shown in the image above.

Example: **_if the argument value passed is 1, control flow branch to loc_4022E address as shown in the graph_**

For better understanding of the control flow, we decompile the function using ghidra, because **idafree** does not support x86 decompilation.The "C-like style" of the code looks like the one below.

```c

int FUN_00402270(int value1,int value2,int param_3)

{
  if (value1 == 1) {
    *(undefined *)(allocated_memblock + value2) = (undefined)param_3;
  }
  else {
    if (value1 == 2) {
      value1 = allocated_memblock + value2;
      DAT_00404240 = *(byte *)value1;
    }
    else {
      if (value1 != 3) {
        return value1 & 0xffffff00;
      }
      value1 = allocated_memblock + value2;
      *(byte *)(allocated_memblock + value2) = *(byte *)value1 ^ DAT_00404240;
    }
  }
  return CONCAT31((int3)((uint)value1 >> 8),1);
}
```

Decompilation of ghidra is not optimal, therefore decompiled code contains some cast which can be fixed by setting correct data types in the functional signatures. Being an easy VM, we implement the logic in python for decryption of contents **_ram.bin_** file.

Fully implemented solution code is below.

```python
#implement decryption routine function in python
#solution.py
def fun_00402270(value1, value2, value3):
    global dat_420
    if value1 == 1:
        membytes[value2] = value3
    elif value1 == 2:
        dat_420 = membytes[value2]
    else:
        if value1 == 3:
            membytes[value2] = membytes[value2] ^ dat_420
        else:
            return False

    return True


if __name__ =="__main__":
    global membytes
    membytes = []

    #open the encypted file and read bytes
    with open('ram.bin','rb') as rambin:
        membytes= list(rambin.read())

    counter  =0
    uvar2 = 0
    bvar1 = 1
    bvar3 = 2
    uvar2_response = True

    while uvar2_response:
        counter +=3
        uvar2_response = fun_00402270(membytes[counter+ 0xff + uvar2], membytes[counter+0xff + bvar1], membytes[counter+ 0xff + bvar3])
    print([chr(x) for x in membytes[:26]])

```

Running the above script in the terminal gets us our flag

```bash
vx@archie:vm$ python3 x.py
['F', 'L', 'A', 'G', '{', 'V', 'M', 'S', '-', 'A', 'R', 'E', '-', 'F', 'O', 'R', '-', 'M', 'A', 'L', 'W', 'A', 'R', 'E', '}', '\x00']
```

After a successful decryption of the rambin contents, the `sub_4022E0` function return the pointer to the flag to main function as shown in the image below.

![Return value of sub_4022E0](/mal/retflag.png)

Therefore main function calculates MD5 hash of the flag and outputs to message dialogbox using **MessageBoxA** function.

The correct flag for the vm challenge is `FLAG{VMS-ARE-FOR-MALWARE}`
