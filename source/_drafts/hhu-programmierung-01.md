---
title: HHU Programmierung 从零开始（一）
date: 2026-09-07 11:52:48
tags:
  - HHU
  - Programmierung
  - Java
categories:
  - 学习
description: 另一个起点
---

## 前言

这篇博客记录我从零开始学习 HHU Programmierung 的过程。

这个系列会从零开始学习 Java，并保留课程中常见的德语术语。
除了记录语法，我也会整理 Übungsblatt 中容易出错的地方和考试需要掌握的内容。

<!-- more -->

## Java 是什么？

Java 是一种面向对象的编程语言，也就是德语课件中常见的：

> objektorientierte Programmiersprache

Java 源代码通常保存在以 `.java` 结尾的文件中。

例如：

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```
运行结果：

```text
Hello World!
```
### 理解第一个 Java 程序
```java
public class HelloWorld
```

这里定义了一个名为`HelloWorld`的类（Klasse）（class）。

文件名必须是：
```text
HelloWorld.java
```

`public static void main(String[] args)`
`main` 是程序开始执行的位置，也叫程序的入口点。
`System.out.println(...)`

它会在控制台输出一行文字：
```java
System.out.println("Hello World!");
```
字符串需要放在英文双引号中，每条 Java 语句通常以分号 ; 结尾。

## 学习 Java 时需要注意什么？

刚开始学习 Java 时，很多报错并不是因为程序逻辑太难，而是由大小写、符号或者文件名引起的。

### 1. Java 区分大小写

Java 是区分大小写的（case-sensitive）。

下面三个名字会被 Java 当成不同的变量：

```java
int age = 20;
int Age = 21;
int AGE = 22;
```

同样，下面的写法是错误的：

```java
system.out.println("Hello");
```

正确写法是：

```java
System.out.println("Hello");
```

因为 `System` 的首字母必须大写。

### 2. 文件名必须与 public 类名一致

如果代码中定义了：

```java
public class HelloWorld {
}
```

那么文件名必须是：

```text
HelloWorld.java
```

不能写成：

```text
helloWorld.java
Hello.java
```

这条规则在课程作业和考试中很常见。

### 3. 不要漏掉分号

Java 中大多数语句以分号 `;` 结尾：

```java
int age = 20;
System.out.println(age);
```

漏掉分号会产生编译错误（Compilerfehler）：

```java
int age = 20
```

但类、方法和条件语句的大括号后面通常不需要分号：

```java
if (age >= 18) {
    System.out.println("volljährig");
}
```

### 4. 注意大括号和小括号

Java 中不同括号的作用不同：

* `()`：方法参数和条件
* `{}`：代码块
* `[]`：数组

例如：

```java
if (age >= 18) {
    System.out.println("成人");
}
```

括号必须成对出现。少写一个括号，后面的代码也可能全部报错。

### 5. `=` 和 `==` 不一样

单个等号 `=` 表示赋值（Zuweisung）：

```java
int age = 20;
```

两个等号 `==` 表示比较（Vergleich）：

```java
if (age == 20) {
    System.out.println("age 等于 20");
}
```

可以简单记成：

```text
=   把右边的值交给左边
==  判断左右两边是否相等
```

### 6. 整数除法会舍弃小数部分

下面的结果不是 `2.5`，而是 `2`：

```java
int result = 5 / 2;
System.out.println(result);
```

因为 `5` 和 `2` 都是整数（Integer）。

如果想得到小数，至少有一个数必须是浮点数：

```java
double result = 5.0 / 2;
System.out.println(result);
```

运行结果：

```text
2.5
```

### 7. `char` 和 `String` 不一样

`char` 表示一个字符，使用单引号：

```java
char grade = 'A';
```

`String` 表示字符串，使用双引号：

```java
String name = "Tim";
```

下面两种写法都是错误的：

```java
char grade = "A";
String name = 'Tim';
```

可以记成：

```text
'A'     一个字符 char
"Java"  一串字符 String
```

### 8. 变量有类型

Java 是静态类型语言（statisch typisierte Sprache）。定义变量时，需要说明变量的数据类型：

```java
int age = 20;
double price = 3.99;
boolean passed = true;
String name = "Tim";
```

定义之后，不能随意放入其他类型的数据：

```java
int age = "zwanzig";
```

这段代码无法通过编译，因为 `"zwanzig"` 是 `String`，不是 `int`。

### 9. 局部变量使用前必须赋值

下面的代码会报错：

```java
int number;
System.out.println(number);
```

因为局部变量 `number` 还没有值。

应该先赋值：

```java
int number = 10;
System.out.println(number);
```

这叫初始化（Initialisierung）。

### 10. 数组下标从 0 开始

假设有一个数组：

```java
int[] numbers = {10, 20, 30};
```

三个元素的位置分别是：

```text
numbers[0] → 10
numbers[1] → 20
numbers[2] → 30
```

下面的代码会在运行时出错：

```java
System.out.println(numbers[3]);
```

因为长度为 3 的数组，最后一个合法下标是 `2`。

数组下标越界产生的错误叫：

```text
ArrayIndexOutOfBoundsException
```

### 11. 编译错误和运行错误不同

编译错误（Compilerfehler）会导致程序无法运行，例如：

```java
int age = "20";
```

运行时错误（Laufzeitfehler）是程序成功启动后才发生的，例如：

```java
int[] numbers = {1, 2, 3};
System.out.println(numbers[10]);
```

还有一种情况是逻辑错误（Logikfehler）：程序可以运行，但结果不正确。

```java
int price = 10;
int amount = 3;
int total = price + amount;
```

程序不会报错，但如果原本想计算总价，正确逻辑应该是：

```java
int total = price * amount;
```

### 12. 报错时先看第一条错误信息

Java 有时会一次显示很多条错误，但后面的错误可能都是由第一处错误引起的。

因此排查错误时应该：

1. 从第一条错误信息开始看。
2. 检查对应的行号。
3. 检查上一行是否漏了分号或括号。
4. 修复后重新运行。
5. 不要看到几十条错误就一次修改所有代码。

## 初学阶段的命名习惯

变量和方法通常使用小驼峰命名法（lower camel case）：

```java
int studentAge;
double totalPrice;
void printResult() {
}
```

类名通常使用大驼峰命名法（Upper Camel Case）：

```java
class StudentAccount {
}
```

常量通常全部大写：

```java
final double PI = 3.14159;
final int MAX_SIZE = 100;
```

好的命名应该表达变量的用途：

```java
int studentAge = 20;
```

尽量避免没有意义的名字：

```java
int x = 20;
```

## 本节总结

学习 Java 时最需要注意的是：

1. Java 区分大小写。
2. 文件名必须与 `public class` 的名字一致。
3. 大多数语句后面需要分号。
4. `=` 表示赋值，`==` 表示比较。
5. `char` 使用单引号，`String` 使用双引号。
6. 整数相除会舍弃小数部分。
7. 数组下标从 `0` 开始。
8. 局部变量使用前必须初始化。
9. 编译错误、运行时错误和逻辑错误并不相同。
10. 报错时优先处理第一条错误信息。