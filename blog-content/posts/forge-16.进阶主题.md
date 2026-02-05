---
title: Forge 1.20.1开发文档-16 进阶主题
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 18
---

> 本文档来源于Forge官方中文文档，侵删
## 16. 进阶主题

### 16.1 访问转换器

访问转换器（简称AT）允许扩大可见性并修改类、方法和字段的 `final` 标志。它们允许模组开发者访问和修改其控制之外的类中不可访问的成员。

#### 16.1.1 添加AT

在模组项目中添加访问转换器很简单：

```gradle
// 此代码块也是指定映射版本的位置
minecraft {
    accessTransformer = file('src/main/resources/META-INF/accesstransformer.cfg')
}
```

> **注意：** 添加或修改访问转换器后，必须刷新Gradle项目才能使转换生效。

#### 16.1.2 注释

`#` 之后直到行尾的所有文本都将被视为注释，不会被解析。

#### 16.1.3 访问修饰符

按可见性降序：
- `public` - 对其包内外的所有类可见
- `protected` - 仅对包内和子类中的类可见
- `default` - 仅对包内的类可见
- `private` - 仅对类内部可见

特殊修饰符 `+f` 和 `-f` 可以附加到前面提到的修饰符中，以分别添加或删除 `final` 修饰符。

> **警告：** 指令只修改它们直接引用的方法；任何重写方法都不会进行访问转换。建议确保转换后的方法没有限制可见性的未转换重写。

#### 16.1.4 目标和指令

**在Minecraft类上使用访问转换器时，字段和方法必须使用SRG名称。**

- **类：** `public net.minecraft.util.Crypt$ByteArrayToKeyFunction`
- **字段：** `protected-f net.minecraft.server.MinecraftServer f_129758_ #random`
- **方法：** `public net.minecraft.Util m_137477_(Ljava/lang/String;)Ljava/util/concurrent/ExecutorService; #makeExecutor`

**类型描述符：**
- `B` - `byte`，有符号字节
- `C` - `char`，UTF-16 Unicode字符
- `D` - `double`，双精度浮点值
- `F` - `float`，单精度浮点值
- `I` - `integer`，32位整数
- `J` - `long`，64位整数
- `S` - `short`，有符号short
- `Z` - `boolean`，`true` 或 `false`
- `[` - 代表数组的一个维度
- `L<class name>;` - 代表引用类型
- `(` - 代表方法描述符
- `V` - 指示方法不返回值

#### 16.1.5 示例

```cfg
# 将Crypt中的ByteArrayToKeyFunction接口转换为public
public net.minecraft.util.Crypt$ByteArrayToKeyFunction

# 将MinecraftServer中的'random'转换为protected并移除final修饰符
protected-f net.minecraft.server.MinecraftServer f_129758_ #random

# 将Util中的'makeExecutor'方法转换为public
public net.minecraft.Util m_137477_(Ljava/lang/String;)Ljava/util/concurrent/ExecutorService; #makeExecutor

# 将UUIDUtil中的'leastMostToIntArray'方法转换为public
public net.minecraft.core.UUIDUtil m_235872_(JJ)[I #leastMostToIntArray
```