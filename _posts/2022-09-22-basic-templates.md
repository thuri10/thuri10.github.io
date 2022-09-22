---
layout: post
title: Reversing C++ Basic Templates
date: 2022-07-26 21:08 +0300
categories: [opensecurity]
tags: [c++, reverse]
---

> In this exercise you will need to reverse engineer a binary, research different functions, and understand if the functions are part of a template or not.

**NB: Decompilers are not permitted, please use only static reverse engineering during this lab.**

The lab can be downloaded at the following link [CalcNum lab](https://gitlab.com/opensecuritytraining/re3011_cpp_re_binaries/-/blob/main/CalcNum%C2%A0)

## What is a C++ template?

A Template is a c++ entity that accepts different data types but performs the same functionality. The data types are passed as template parameters to template function so that we don't need to write same code functionality for different data types.

## Lab Analysis

For solving the questions, I used an approach of first reading questions and then reverse engineering those functions only. This ensured I only reversed functions important to our analysis.

## Question 1

> Which of the the following functions are part of the same template?

For reverse engineering we will focus on the following functions, `0x1229`, `0x1620`, `0x1342`, `0x15fa`, and `0x1245` in order to answer the first and subsequent questions.

The first step to manually reverse functions and understand what each function is doing.
For analysis I will be using IDA Pro freeware.

### `0x1229` Function Analysis

![Subtraction](/assets/images/ost2/sub_func1.png)

Looking at the function as shown in image above, it accepts two parameters of type `int` and does Subtraction (assembly instruction`sub`) of local variables `x` and `y` ant then returns the result. The return value is of type `int`, therefore we can set type of our function as shown in the image above.

### `0x1620` Function Analysis

![Max value](/assets/images/ost2/max_func.png)

From the analysis of this function, it accepts two parameters of type `long` and finds the maximum value between the two. The two parameters are compared through use of `jge` assembly instruction as shown above.

### `0x1342` Function Analysis

![Max value](/assets/images/ost2/func3.png)

The function accepts two parameters of type `long` and checks if one parameter is equal to `zero`. If the value is not equal to `zero`, it does math and bit operations.

### `0x15fa` Function Analysis

![Max value](/assets/images/ost2/max_value2.png)

From the analysis of this function, function accepts two parameters of type `int` and finds the maximum value between the two. The two parameters are compared through use of `jge` assembly instruction. Therefore the maximum value is returned by the function.

### `0x1245` Function Analysis

![0x1245 analysis](/assets/images/ost2/func4.png)

This function takes four parameters of type `int` and does further bits operations as shown in the disassembly code.

From the above functions analysis, only two functions qualify as templates. `0x1620` and `0x15fa` are templates functions because they perform the same functionality( `Finding the Maximum value`) and number of parameters passed to each function are the same.

## Question 2

> Review the function at address `0x12C5` and other functions in the binary. Is this function a template function?

### `0x12C5` Function Analysis

![0x12c5 analysis](/assets/images/ost2/func5.png)

This function does the same functionality as the function `0x1245`, but the difference is the unequal number of parameters passed to each function.
Therefore, it does `not` qualify as a template function.

## Question 3

> Review the function at address `0x15cc` and the function at address `0x15fa`. Are these functions part of the same template function?

### `0x15cc` Function Analysis

This function is used for calculating minimum value of the two parameters passed to function.

![0x15cc analysis](/assets/images/ost2/min_value.png)

The two functions are `not` of the same template function. This is because one is used for calculating the maximum value and other one for minimum value. The difference between the two is `jge` and `jle` conditional assembly instructions as shown in IDA disassembly above.

## References

1. C++ Templates Basics - https://m.cplusplus.com/doc/oldtutorial/templates/
