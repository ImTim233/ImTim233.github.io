---
title: Nand to Tettris 01
date: 2026-05-06 10:40:49
tags:
categories: 学习
description: "Boolean Logic和Multiplexor"
---

<!-- more -->

## 布尔逻辑（Boolean Logic）

本章目标是用一个NAND门，通过逻辑组合，推导出其他所有的基本门，理解选择器（Mux/Demux）。

此单元要注意，我们使用的是专门为Nand2Tetris这门课程和项目定制的一种教学用硬件描述语言。只保留了最核心的声明接口 (IN/OUT) 和 连接零件 (PARTS)。

## 逻辑门

### NAND（与非门）

在开始之前，首先要知道前文提到的NAND门到底是做什么的。简单来说，NAND门是数字电路里的"全能选手"，他是逻辑门（gate）中的一种，当所有的输入（input）信号都为"高"（1）时，输入才为“低”（0）；在任何其他情况下，输出（output）都是“高”（1）。

为什么与非门这么重要？因为它被称为通用逻辑门（Universal Gate
）,只需要用NAND门就可以组合出任何其他的逻辑门。

在物理层面，制造一个NAND门通常比制造一个普通的AND门还简单、便宜。由于它既万能还好用，在现代CPU和存储器的底层逻辑设计中，NAND门的使用率极高。

手机里的内存、电脑的SSD、U盘，之所以叫”NAND Flash“，就是因为他们的存储单元结构在逻辑上类似于NAND门的排列方式。

如果把数字电路比做成乐高，NAND门就是最全能的一块零件，理论上来说，只要有足够多的NAND门，就可以搭出整台超级计算机。

### 非门（NOT）

非门是最简单的逻辑门，只有一个输入和一个输出，它的作用就是**反转信号**。
NOT门的输出结果永远是**输入结果反过来的**，如果你输入1，它就输出0，你输入0，它就输出1。

**表达式： $Y = \overline{A}$**

**编译过程：**
由于NAND门两个输入都相同，输出就相反。

```text
 * Not gate:
 * if (in) out = 0, else out = 1
 */
CHIP Not {
    IN in;
    OUT out;

    PARTS:
    Nand(a=in, b=in, out=out);
}
```

### 与门（AND）

与门有两个输出，要求**两个输入同时为“高”**（1），它的输出才为“高”（1）。但凡有一个输入为0，输出立马为0。

**表达式： $Y = A \cdot B$**

**编译过程：**
AND门通过对NAND门取反获得，因为当NAND门两个input都是1的时候，out就是0。

```text
 * And gate:
 * if (a and b) out = 1, else out = 0 
 */
CHIP And {
    IN a, b;
    OUT out;
    
    PARTS:
    Nand(a=a,b=b,out=nandOut);
    Not(in=nandOut, out=out);
}
```

### OR(或门)

或门只需要两个输入**其中一个**是1（或二者皆是），输出就是1。如果两个输入都为0，输出为0。

**表达式： $Y = A + B$**

**编译过程：**
使用两个非门把输入反转，然后将结果放入与非门，因为与非门只要有一个0结果就是1，所以只要反转之前的输入有一个1，最终的输出就是1。

```text
 * Or gate:
 * if (a or b) out = 1, else out = 0 
 */
CHIP Or {
    IN a, b;
    OUT out;

    PARTS:
    Not(in=a,out=notOuta);
    Not(in=b,out=notOutb);
    Nand(a=notOuta,b=notOutb,out=out);
}
```

### XOR（或与门）

输入不同（一个 0 一个 1）时，输出为 1；输入相同（都是 0 或都是 1）时，输出为 0。

**表达式： $Y = A \oplus B$**

**编译过程：**
将两个输入会得到高位输出的例子列出来，只要有任意一种情况就使输出为1。

```text
 * Exclusive-or gate:
 * if ((a and Not(b)) or (Not(a) and b)) out = 1, else out = 0
 */
CHIP Xor {
    IN a, b;
    OUT out;

    PARTS:
    Not(in=a,out=notA);
    Not(in=b,out=notB);
    And(a=a,b=notB,out=aAndnotB);
    And(a=b,b=notA,out=bAndnotA);
    Or(a=aAndnotB,b=bAndnotA,out=out);
}
```

## 多路复用器（Multiplexor）

如果把 CPU 内部的数据流动比作交通，Mux 就是那个交通调度员。它决定了在特定时刻，哪一路数据信号能够通过并进入下一个环节。

在硬件层面，我们经常遇到这种情况：你需要计算一个值，但这个值的来源不确定，这个时候就要用到多路复用器了。

比如：在计算 a + b 时，b 可能是一个寄存器里的值，也可能是一个立即数，处理器会通过 sel信号告诉 Mux：“如果当前指令是加立即数，选 B 路径；如果是加寄存器，选 A 路径”。

### Mux(Multiplexor，多路复用器)

什么是Mux?它就像是一个二选一的开关，它有三个输出，分别是**两个输出信号a和b**，以及**一个选择信号sel（selector）**。
如果sel == 0，结果就跟着a走；如果sel == 1，结果就跟着b走。

**编译过程：**
通过和编译或非门一样的方式列出两种可能性，然后使用或门选择正确的输入完成输出。

```text
 * Multiplexor:
 * if (sel = 0) out = a, else out = b
 */
CHIP Mux {
    IN a, b, sel;
    OUT out;

    PARTS:
    Not(in=sel,out=notSel);
    And(a=a,b=notSel,out=outA);
    And(a=b,b=sel,out=outB);
    Or(a=outA,b=outB,out=out);
}
```

### DMux（Demultiplexor，多路分配器）

DMux是Mux的逆向操作，如果说 Mux 是“二选一汇聚”，那么 DMux 就是“一选二分发”。
逻辑定义如下：
如果 sel == 0，则 a = in, b = 0；
如果 sel == 1，则 a = 0, b = in；

**表达式：**
只有当 **in 是 1 且 sel 是 0** 时，**a 才为 1**。
**输出a时：$a = in \cdot (\text{NOT } sel)$**

只有当 **in 是 1 且 sel 是 1** 时，**b 才为 1**。
**输出b时：$b = in \cdot sel$**

**编译过程：**
使用非门把sel分成0和1，再将对应的输入匹配正确的选择信号输出。

```text
 * Demultiplexor:
 * [a, b] = [in, 0] if sel = 0
 *          [0, in] if sel = 1
 */
CHIP DMux {
    IN in, sel;
    OUT a, b;

    PARTS:
    Not(in=sel,out=notSel);
    And(a=in,b=notSel,out=a);
    And(a=in,b=sel,out=b);
}
```

## 16位逻辑门

16位逻辑门（Multi-Bit Gates） 的逻辑非常直观：它们实际上就是将之前写的单位逻辑门并排摆放 16 个，分别处理 16 位总线中的每一位。

这种处理方式被称为 **“按位运算（Bitwise）”**。

在 HDL 中，a[16] 表示一个包含 16 条线路的总线。
**a[0] 是最低位（LSB）。**
**a[15] 是最高位（MSB）。**

### Not16

对 16 位输入中的每一位分别取反。

**编译过程：**
非常简单的逻辑，就是把非门重复16遍。

```text
/**
 * 16-bit Not:
 * for i = 0..15: out[i] = not in[i]
 */
CHIP Not16 {
    IN in[16];
    OUT out[16];

    PARTS:
    Not(in=in[0], out=out[0]);
    Not(in=in[1], out=out[1]);
    Not(in=in[2], out=out[2]);
    Not(in=in[3], out=out[3]);
    Not(in=in[4], out=out[4]);
    Not(in=in[5], out=out[5]);
    Not(in=in[6], out=out[6]);
    Not(in=in[7], out=out[7]);
    Not(in=in[8], out=out[8]);
    Not(in=in[9], out=out[9]);
    Not(in=in[10], out=out[10]);
    Not(in=in[11], out=out[11]);
    Not(in=in[12], out=out[12]);
    Not(in=in[13], out=out[13]);
    Not(in=in[14], out=out[14]);
    Not(in=in[15], out=out[15]);
}
```

### AND16

只有当 a 和 b 对应的位都为 1 时，输出位才为 1。

**编译过程：**
逻辑如上。

```text
/**
 * 16-bit bitwise And:
 * for i = 0..15: out[i] = (a[i] and b[i])
 */
CHIP And16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    And(a=a[0], b=b[0], out=out[0]);
    And(a=a[1], b=b[1], out=out[1]);
    And(a=a[2], b=b[2], out=out[2]);
    And(a=a[3], b=b[3], out=out[3]);
    And(a=a[4], b=b[4], out=out[4]);
    And(a=a[5], b=b[5], out=out[5]);
    And(a=a[6], b=b[6], out=out[6]);
    And(a=a[7], b=b[7], out=out[7]);
    And(a=a[8], b=b[8], out=out[8]);
    And(a=a[9], b=b[9], out=out[9]);
    And(a=a[10], b=b[10], out=out[10]);
    And(a=a[11], b=b[11], out=out[11]);
    And(a=a[12], b=b[12], out=out[12]);
    And(a=a[13], b=b[13], out=out[13]);
    And(a=a[14], b=b[14], out=out[14]);
    And(a=a[15], b=b[15], out=out[15]);
}
```

### OR16

只要 a 或 b 对应的位有一个为 1，输出位就为 1。

**编译过程：**
逻辑如上。

```text
/**
 * 16-bit bitwise Or:
 * for i = 0..15: out[i] = (a[i] or b[i])
 */
CHIP Or16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    Or(a=a[0], b=b[0], out=out[0]);
    Or(a=a[1], b=b[1], out=out[1]);
    Or(a=a[2], b=b[2], out=out[2]);
    // ... (以此类推到15)
    Or(a=a[15], b=b[15], out=out[15]);
}
```

### OR8way

它的逻辑功能是：只要这 8 位输入中任何一位是 1，输出就是 1。 只有当 8 位全部为 0 时，输出才是 0。

在计算机中，这通常用于检测“非零”状态。例如，CPU 想知道某个运算结果是否为 0，就会把结果丢进这种结构的逻辑门里。

**编译过程：**
要实现这个功能，我们需要把 8 个位“串”起来比较。可以把它想象成一个层层筛选的树状结构。我们通过不断地将前两个位的比较结果与下一个位进行比较来实现：

```text
/**
 * 8-way Or: 
 * out = (in[0] or in[1] or ... or in[7])
 */
CHIP Or8Way {
    IN in[8];
    OUT out;

    PARTS:
    // 第一对比较
    Or(a=in[0], b=in[1], out=o1);
    // 将上一步的结果与第三位比较
    Or(a=o1,    b=in[2], out=o2);
    // 依此类推
    Or(a=o2,    b=in[3], out=o3);
    Or(a=o3,    b=in[4], out=o4);
    Or(a=o4,    b=in[5], out=o5);
    Or(a=o5,    b=in[6], out=o6);
    Or(a=o6,    b=in[7], out=out);
}
```

## 多路选择器

### Mux16

Mux16的逻辑和之前写的那个Mux完全一样，只不过它现在要同时处理16根导线。sel信号就像是一个总闸，同时控制16个开关的切换。

**编译过程：**
逻辑如上。

```text
/**
 * 16-bit multiplexor: 
 * for i = 0..15 out[i] = a[i] if sel == 0 
 *                        b[i] if sel == 1
 */
CHIP Mux16 {
    IN a[16], b[16], sel;
    OUT out[16];

    PARTS:
    // 将同一个 sel 信号传递给 16 个独立的 Mux 单元
    Mux(a=a[0],  b=b[0],  sel=sel, out=out[0]);
    Mux(a=a[1],  b=b[1],  sel=sel, out=out[1]);
    Mux(a=a[2],  b=b[2],  sel=sel, out=out[2]);
    Mux(a=a[3],  b=b[3],  sel=sel, out=out[3]);
    Mux(a=a[4],  b=b[4],  sel=sel, out=out[4]);
    Mux(a=a[5],  b=b[5],  sel=sel, out=out[5]);
    Mux(a=a[6],  b=b[6],  sel=sel, out=out[6]);
    Mux(a=a[7],  b=b[7],  sel=sel, out=out[7]);
    Mux(a=a[8],  b=b[8],  sel=sel, out=out[8]);
    Mux(a=a[9],  b=b[9],  sel=sel, out=out[9]);
    Mux(a=a[10], b=b[10], sel=sel, out=out[10]);
    Mux(a=a[11], b=b[11], sel=sel, out=out[11]);
    Mux(a=a[12], b=b[12], sel=sel, out=out[12]);
    Mux(a=a[13], b=b[13], sel=sel, out=out[13]);
    Mux(a=a[14], b=b[14], sel=sel, out=out[14]);
    Mux(a=a[15], b=b[15], sel=sel, out=out[15]);
}
```

### Mux@way16(4路选择器)

现在我们不再是简单的“二选一”，而是要在 4 路输入（每路 16 位）中精准选出其中的一路。

它的输入信号sel不再是一位，而是 两位 (sel[2])。

根据两位二进制选择信号，决定输出哪一组 16 位总线数据：

```text
    sel[1]  sel[0]  输出 (out)
    0       0       a
    0       1       b
    1       0       c
    1       1       d
```

我们可以把这个过程看作一场两轮淘汰赛：
**第一轮：**
在 a 和 b 之间选一个（由 sel[0] 控制）。
在 c 和 d 之间选一个（也由 sel[0] 控制）。
**第二轮：**
从第一轮产生的两个“获胜者”中再选一个（由 sel[1] 控制）。

**编译过程：**
如上逻辑所说，sel[0] 负责区分是“偶数路”(a, c) 还是“奇数路”(b, d)。sel[1] 负责区分是“前两路”(a, b) 还是“后两路”(c, d)。最后得出的输出就是同时满足sel[0]和sel[1]的结果。

```text
 * 4-way 16-bit multiplexor:
 * out = a if sel = 00
 *       b if sel = 01
 *       c if sel = 10
 *       d if sel = 11
 */
CHIP Mux4Way16 {
    IN a[16], b[16], c[16], d[16], sel[2];
    OUT out[16];
    
    PARTS:
    Mux16(a=a,b=b,sel=sel[0],out=muxAB);
    Mux16(a=c,b=d,sel=sel[0],out=muxCD);
    Mux16(a=muxAB,b=muxCD,sel=sel[1],out=out);
}
```

### Mux8Way16

Mux8Way16 是Project 1中规模最大的选择器。它要在8组不同的16位输入中，根据一个3位的选择信号(sel[3])选出一组输出。

根据 sel 的二进制值（000 到 111），输出对应的通道：

```text
    sel[2]  sel[1]  sel[0]  输出 (out)
    0       0       0       a
    0       0       1       b
    0       1       0       c
    0       1       1       d
    1       0       0       e
    1       0       1       f
    1       1       0       g
    1       1       1       h
```

**编译过程：**
与Mux4way16的逻辑相同，我们可以把8组输入分成两组“半决赛”：
**第一组：** 用一个 Mux4Way16 处理 a, b, c, d。
**第二组：** 用另一个 Mux4Way16 处理 e, f, g, h。
**决赛：** 用一个普通的 Mux16 在这两组的结果中做最终决定。

**选择信号的分配：**
sel[0] 和 sel[1] 用来在4个选项中挑一个。
sel[2]（最高位）用来决定是选前4个（a-d）还是后4个（e-h）。

```text
/**
 * 8-way 16-bit multiplexor:
 * out = a if sel == 000
 *       b if sel == 001
 *       ...
 *       h if sel == 111
 */
CHIP Mux8Way16 {
    IN a[16], b[16], c[16], d[16],
       e[16], f[16], g[16], h[16],
       sel[3];
    OUT out[16];

    PARTS:
    // 第一步：从前四个中选一个 (当 sel[2]=0 时有效)
    // 注意这里只取 sel 的低两位：sel[0..1]
    Mux4Way16(a=a, b=b, c=c, d=d, sel=sel[0..1], out=outABCD);

    // 第二步：从后四个中选一个 (当 sel[2]=1 时有效)
    Mux4Way16(a=e, b=f, c=g, h=h, sel=sel[0..1], out=outEFGH);

    // 第三步：根据最高位 sel[2] 做最终二选一
    Mux16(a=outABCD, b=outEFGH, sel=sel[2], out=out);
}
```

### DMux4Way

它的任务是将一个输入信号in，根据两个选择位sel[2]，分发到a,b,c,d这四个输出通道中的某一个，而其他三个通道则保持为0。

根据 sel 的二进制值，决定 in 流向哪个出口：

```text
    sel[1]  sel[0]  输出状态
    0       0       a=in,b=0,c=0,d=0
    0       1       a=0,b=in,c=0,d=0
    1       0       a=0,b=0,c=in,d=0
    1       1       a=0,b=0,b=0,d=in
```

想象一个大型物流中心，包裹（信号 in）进入后：
**第一级分拣：**
根据 sel[1]（最高位），决定包裹是去“上半区”（A和B的候选区）还是“下半区”（C和D的候选区）。
**第二级分拣：**
在“上半区”，根据 sel[0] 决定包裹最终给 a 还是 b。
在“下半区”，根据 sel[0] 决定包裹最终给 c 还是 d。

结合上方真值表更容易理解。

**编译过程：**

```text
/**
 * 4-way demultiplexor:
 * {a, b, c, d} = {in, 0, 0, 0} if sel == 00
 *                {0, in, 0, 0} if sel == 01
 *                {0, 0, in, 0} if sel == 10
 *                {0, 0, 0, in} if sel == 11
 */
CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
    // 第一级：根据 sel[1] 将 in 分发到两条中间路径
    // 如果 sel[1]=0，in 流向 outAorB；如果 sel[1]=1，in 流向 outCorD
    DMux(in=in, sel=sel[1], a=outAorB, b=outCorD);

    // 第二级（上半区）：处理 a 和 b
    // 注意这里使用的是 sel[0]
    DMux(in=outAorB, sel=sel[0], a=a, b=b);

    // 第二级（下半区）：处理 c 和 d
    DMux(in=outCorD, sel=sel[0], a=c, b=d);
}
```

### DMux8Way

如果能理解DMux4Way，DMux8Way自然而然也可以理解。它的任务是将一个输入信号in，根据3位选择信号 (sel[3])，精准地分发到a,b,c,d,e,f,g,h这八个输出通道中的一个。

**逻辑定义：**
根据 sel 的二进制值（000 到 111），决定 in 的去向：

```text
sel[2]  sel[1]  sel[0]      输出状态
0       0       0           a = in,其余为 0
0       0       1           b = in,其余为 0
...     ...     ...         ...
1       1       1           h = in,其余为 0
```

**编译过程：**
实现DMux8Way最好的方式是利用**层级管理**的例子：
**第一层：**
使用一个基础的 DMux，根据最高位 sel[2] 决定信号是发往“前四个（a-d）”还是“后四个（e-h）”。

**第二层：**
接收到信号的前四个通道组，使用一个 DMux4Way，根据 sel[0..1] 决定具体的出口。
接收到信号的后四个通道组，使用另一个 DMux4Way，同样根据 sel[0..1] 决定具体的出口。

```text
/**
 * 8-way demultiplexor:
 * {a, b, c, d, e, f, g, h} = {in, 0, 0, 0, 0, 0, 0, 0} if sel == 000
 *                            {0, in, 0, 0, 0, 0, 0, 0} if sel == 001
 *                            ...
 *                            {0, 0, 0, 0, 0, 0, 0, in} if sel == 111
 */
CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;

    PARTS:
    // 第一级：根据最高位 sel[2] 决定是去前四路还是后四路
    // 如果 sel[2]=0，in 传给 outABCD；如果 sel[2]=1，in 传给 outEFGH
    DMux(in=in, sel=sel[2], a=outABCD, b=outEFGH);

    // 第二级（前四路）：根据低两位 sel[0..1] 分发到 a, b, c, d
    DMux4Way(in=outABCD, sel=sel[0..1], a=a, b=b, c=c, d=d);

    // 第二级（后四路）：根据低两位 sel[0..1] 分发到 e, f, g, h
    DMux4Way(in=outEFGH, sel=sel[0..1], a=e, b=f, c=g, d=h);
}
```

## 尾声

第一单元的内容就这么多了,这些基础非常的重要，对后续的内容帮助非常大。对于新手也比较友好，能静下心看一遍，自己尝试去写一个gate就能快能理解这些内容。更重要的是选择器一定要多使用，后面的单元题目会非常依赖选择器，尤其在做ALU的时候。我自己第一周学完这个的时候还是有点没把握，但是往后学了以后就会发现，后面的内容很依赖前面单元的内容，在尝试解题的时候也会慢慢对前面的内容熟悉，用起来也会更得心应手。写到这里来也是为了能让自己真正理解并解释出来，希望接下来的单元能够再接再厉。
