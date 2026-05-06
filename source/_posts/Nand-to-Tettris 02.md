---
title: Nand to Tettris 02
date: 2026-05-06 15:46:44
tags:
categories: 学习
description: "Boolean Arithmetic"
---

<!-- more -->

## 布尔运算（Boolean Arithmetic）

如果说第一章是让我们制造了一些零件，那么第二章就是带我们进入真正的“计算”领域。这一章的终极目标是实现**ALU（算术逻辑单元）**。它是CPU的心脏，负责所有的加法和逻辑运算。

### 从半加器到全加器

计算机其实是一个很死板的机器，只会做加法。但是在计算机的世界里，只要你会做加法，你就学会了一切（减法，乘法，除法）。

#### 半加器（HalfAdder）

在二进制中，1+1=10。这意味着我们需要两个输出：一个是当前位的**和（sum）**，另一个是向高位的**进位（Carry）**。

半加器是最基础的单元，只负责两个bit的相加。

Sum: 当 $a$ 和 $b$ 不同时为 1（即 $0+1$ 或 $1+0$），Sum 为 1。这完美对应**Xor (异或)** 逻辑。

Carry: 只有当 $a$ 和 $b$ 全为 1 时，才会产生进位。这对应 **And (与)** 逻辑。

**编译过程：**
如上所述，使用Xor与And编写sum与carry。

```text
 * Computes the sum of two bits.
 */
CHIP HalfAdder {
    IN a, b;    // 1-bit inputs
    OUT sum,    // Right bit of a + b 
        carry;  // Left bit of a + b

    PARTS:
    Xor(a=a,b=b,out=sum);
    And(a=a,b=b,out=carry);
}
```

### 全加器（FullAdder）

这个与半加器的区别在于，除了当前的 $a$ 和 $b$，还得接收来自低位的进位 $c$。

**编译过程：**
可以用两个半加器和一个或门（Or）拼出来。第一个半加器算$a+b$。第二个半加器把“第一个的结果”和“进位 $c$”相加。只要两次加法中有任何一次产生了进位，总进位就是1。

```text
 * Computes the sum of three bits.
 */
CHIP FullAdder {
    IN a, b, c;  // 1-bit inputs
    OUT sum,     // Right bit of a + b + c
        carry;   // Left bit of a + b + c

    PARTS:
    HalfAdder(a=a,b=b,sum=sumAB,carry=carry1);
    HalfAdder(a=sumAB,b=c,sum=sum,carry=carry2);
    Or(a=carry1,b=carry2,out=carry);
}
```

## 16 位加法器 (Add16)

这是“串行进位加法器”（Ripple Carry Adder）的体现。我们将 16 个全加器串联，把每一层的 Carry 喂给下一层。

**编译过程：**

```text
 * 16-bit adder: Adds two 16-bit two's complement values.
 * The most significant carry bit is ignored.
 */
CHIP Add16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    HalfAdder(a=a[0],b=b[0],sum=out[0],carry=c0);
    FullAdder(a=a[1], b=b[1], c=c0, sum=out[1], carry=c1);
    FullAdder(a=a[2], b=b[2], c=c1, sum=out[2], carry=c2);
    FullAdder(a=a[3], b=b[3], c=c2, sum=out[3], carry=c3);
    FullAdder(a=a[4], b=b[4], c=c3, sum=out[4], carry=c4);
    FullAdder(a=a[5], b=b[5], c=c4, sum=out[5], carry=c5);
    FullAdder(a=a[6], b=b[6], c=c5, sum=out[6], carry=c6);
    FullAdder(a=a[7], b=b[7], c=c6, sum=out[7], carry=c7);
    FullAdder(a=a[8], b=b[8], c=c7, sum=out[8], carry=c8);
    FullAdder(a=a[9], b=b[9], c=c8, sum=out[9], carry=c9);
    FullAdder(a=a[10], b=b[10], c=c9, sum=out[10], carry=c10);
    FullAdder(a=a[11], b=b[11], c=c10, sum=out[11],carry=c11);
    FullAdder(a=a[12], b=b[12], c=c11, sum=out[12],carry=c12);
    FullAdder(a=a[13], b=b[13], c=c12, sum=out[13],carry=c13);
    FullAdder(a=a[14], b=b[14], c=c13, sum=out[14],carry=c14);
    FullAdder(a=a[15], b=b[15], c=c14, sum=out[15],carry=c15);
}
```

这里可以发现硬件的局限性：**高位的计算必须等待低位的进位信号传过来**。这就是为什么现代高性能 CPU 会使用“超前进位加法器”来加速。

## inc16（16位增量器 Incrementer）

它的功能很简单：输入一个 16 位的数字 $in$，输出 $in + 1$。

为什么需要 Inc16？虽然我们已经有了Add16这个很强大的加法器，但是“加1”这个操作在计算机出现的频率实在是太多了，例如：PointCounter、各种i++循环、取反加一这些都是需要增量逻辑的。

专门的增量器可以比全功能的加法器做得**更小、更快**。因为它不需要处理两个任意数的加法，只需要处理进位链。

**编译过程:**
直接调用Add16，让其中一个输入为$in$，另一个输入固定为常量1。

```text
 * 16-bit incrementer:
 * out = in + 1
 */
CHIP Inc16 {
    IN in[16];
    OUT out[16];

    PARTS:
    // 将 16 位输入与常量 1 相加
    // 在 Hack HDL 中，常量可以用 true/false 或直接指定
    Add16(a=in,b[0]=true,b[1..15]=false,out=out);
}
```

## 补码（Two's Complement）

为什么计算机处理减法不需要专门的“减法器”？因为有补码。以前的前辈们尝试过原码和反码，但是这两个方法都存在±0，浪费储存空间的问题。

这就导致了现在全世界的计算机都用补码，因为它解决了如何**用最简单的电路同时处理加法和减法。**

在一个$n$位的系统中，$-x$被定义为$2^n-x$。

例子： 在4位系统中，$1111$代表$-1$。因为 $1111+0001=10000$，在4位系统中溢出的$1$被丢弃，结果变成了$0000$。

如何快速的理解补码呢？其实很简单：**补码就像是时钟**，假设现在是6点，我想把表拨到4点，我有两种方法：减法：逆时钟拨2小时($6-2=4$)。加法：顺时钟拨10小时($6+10=16$，但在12小时制里，$16$就是$4$)。在12小时制这个系统中，$-2$和$+10$是等价的。我们称之为$-2$对12的补数是10。

如果不用补码，计算机的CPU可能会比现在大一倍，逻辑也会复杂很多。如果不用补码，硬件就需要设计一套“加法电路”和一套“减法电路”。而且做减法时，还得先比较两个数的大小，决定谁减谁，最后再给结果挂上符号。这需要大量的逻辑门。

补码将$A - B$ 被转化成了 $A + (-B)$，计算 $-B$ 只需要**取反加一**，这在电路里是极快的，而且只需要一个非门就可以做到，这种硬件复用可以极大程度**降低芯片面积和损耗**。

而且如上文所说，补码完美的解决了原码和反码的问题，不存在±0的问题，这种设计意味着：CPU在做加法时，不需要管这个数是正是负。它只管把每一位（包括符号位）对齐相加，溢出的丢掉，剩下的结果在数学上永远是正确的。

## ALU（Arithmetic Logic Unit，算术逻辑单元）

ALU是整个计算机的硬件心脏，简单来说，ALU的设计目标是：只用**一套加法和位运算电路**，通过**6个控制位**，组合出**18种运算功能**。

### 6 个控制位 (The 6 Control Bits)

这6个控制位（zx, nx, zy, ny, f, no）就是6个开关，决定了数据流在经过加法器之前和之后会被如何修改。

```text
    控制位  含义         硬件操作
    zx      zero x      如果为 1，强行把x变成 0
    nx      negate x    如果为 1，把x按位取反
    zy      zero y      如果为 1，强行把y变成 0
    ny      negate y    如果为 1，把y按位取反
    f       function    1代表加法(x+y),0代表逻辑与(x\&y)
    no      negate out  如果为 1，把最终结果取反
```

通常我们觉得实现减法需要减法器，但 Hack ALU**不需要**。
例子：如何计算 $x - y$？
虽然我们的硬件里只有 Add16，但通过设置控制位为 010011，我们可以完成这个任务：
**nx=1**： 把 $x$ 取反（变成 $!x$）。
**f=1**： 做加法，得到 $!x + y$。
**no=1**： 把结果再取反，得到 $!( !x + y )$。
根据**补码特性**， $!x = -x - 1$。
所以结果是： $-(-x - 1 + y) - 1 = x + 1 - y - 1 = \mathbf{x - y}$。

### 状态标志：zr 和 ng (Flags)

ALU 除了输出运算结果，还要吐出两个**“哨兵”**，这两个哨兵是下一章实现 if/else 的关键：

ng (negative)： 结果是否为负。
观察输出的最高位（第 15 位）是否为 1。

zr (zero)： 结果是否为 0。
检查输出的 16 位是否全为 0。

在 HDL 里，你需要把 16 位输出分成两组 8 位（out[0..7] 和 out[8..15]），分别通过 Or8Way 门，只要任何一位是 1，zr 就是 0。

这两个重要的“传感器”信号，这是后续实现程序跳转（Jump）的关键。

### ALU编译过程

阅读了文献以后我发现，在Hack架构中，ALU是一个纯组合逻辑电路——这意味着它没有记忆，给它输入，它瞬时产生输出。

```text
 * ALU (Arithmetic Logic Unit):
 * Computes out = one of the following functions:
 *                0, 1, -1,
 *                x, y, !x, !y, -x, -y,
 *                x + 1, y + 1, x - 1, y - 1,
 *                x + y, x - y, y - x,
 *                x & y, x | y
 * on the 16-bit inputs x, y,
 * according to the input bits zx, nx, zy, ny, f, no.
 * In addition, computes the two output bits:
 * if (out == 0) zr = 1, else zr = 0
 * if (out < 0)  ng = 1, else ng = 0
 */
// Implementation: Manipulates the x and y inputs
// and operates on the resulting values, as follows:
// if (zx == 1) sets x = 0        // 16-bit constant
// if (nx == 1) sets x = !x       // bitwise not
// if (zy == 1) sets y = 0        // 16-bit constant
// if (ny == 1) sets y = !y       // bitwise not
// if (f == 1)  sets out = x + y  // integer 2's complement addition
// if (f == 0)  sets out = x & y  // bitwise and
// if (no == 1) sets out = !out   // bitwise not

CHIP ALU {
    IN  
        x[16], y[16],  // 16-bit inputs        
        zx, // zero the x input?
        nx, // negate the x input?
        zy, // zero the y input?
        ny, // negate the y input?
        f,  // compute (out = x + y) or (out = x & y)?
        no; // negate the out output?
    OUT 
        out[16], // 16-bit output
        zr,      // if (out == 0) equals 1, else 0
        ng;      // if (out < 0)  equals 1, else 0

    PARTS:
    Mux16(a=x,b=false,sel=zx,out=x1);       //zx

    Not16(in=x1,out=notX1);     //nx
    Mux16(a=x1,b=notX1,sel=nx,out=x2);

    Mux16(a=y,b=false,sel=zy,out=y1);       //zy

    Not16(in=y1,out=notY1);     //ny
    Mux16(a=y1,b=notY1,sel=ny,out=y2);

    Add16(a=x2,b=y2,out=addXY);     //f
    And16(a=x2,b=y2,out=andXY);
    Mux16(a=andXY,b=addXY,sel=f,out=fOut);

    Not16(in=fOut,out=notFOut);     //no
    Mux16(a=fOut, b=notFOut, sel=no, out=out, out[15]=ng, out[0..7]=outLow, out[8..15]=outHigh);        //ng

    Or8Way(in=outLow,out=orLow);        //zr
    Or8Way(in=outHigh,out=orHigh);
    Or(a=orLow,b=orHigh,out=or16Out);
    Not(in=or16Out,out=zr);
}
```

这段代码我用了ai的帮助，学了好半天，我终于搞懂了硬件的‘顺序’：在软件里，顺序是时间上的先后；在硬件里，顺序是空间上的前后。

ALU 的 6 个指令之所以能稳定工作，是因为我在PARTS部分用电线规定了一套单向通行的‘交通规则’。数据就像被送进了工厂的流水线，虽然传送带跑得极快，但产品必须先经过‘清零机’，才能进入‘取反机’。不能因为传送带快，就认为产品是同时经过两台机器的。

这门课里的Hack ALU是 Nand2Tetris 作者为了教学而精心设计的Hack ALU。真实的ALU往往集成了乘法器、除法器，甚至是处理浮点数（小数）的专门单元（FPU）。我实现的加法器是串行进位的，而真实 ALU 会使用“超前进位加法器”来让电流跑得更快。

## 尾声

这一章的工作量并不大，主要是要理解ALU的用法和原理，对于没有太多硬件基础的人有一点慢。这个算术逻辑单元算是硬件的核心，后面也会经常用到。我们做的机器目前还没有记忆，只要断开 $x$ 和 $y$ 的输入，结果立刻就会消失。下一章将要引入“时钟信号”和“触发器”。
