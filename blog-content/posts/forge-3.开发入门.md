---
title: Forge 1.20.1开发文档-3 开发入门
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 5
---

> 本文档来源于Forge官方中文文档，侵删

# Minecraft Forge 模组开发文档

## 3. 入门

### 3.1 Forge入门

如果你之前从未制作过一个Forge模组，本节将提供设置Forge开发环境所需的最少信息。其余的文档是关于从这里开始的内容。

#### 3.1.1 先决条件

- 安装Java 17开发包（JDK）和64位JVM。Forge推荐并官方支持Eclipse Temurin。

> **警告**  
> 确保你正在使用64位的JVM。一种检查方式是在终端中运行 `java -version`。使用32位的JVM会导致在使用ForgeGradle的过程中出现问题。

- 熟练使用一款集成开发环境（IDE）。建议使用一款集成了Gradle功能的IDE。

#### 3.1.2 从零开始模组开发

1. 从Forge文件站下载Mod开发包（MDK）。点击"Mdk"，等待一段时间之后点击右上角的"Skip"按钮。如果可能的话，推荐下载最新版本的Forge。

2. 解压所下载的MDK到一个空文件夹中。它会成为你的模组的目录，且现在应该已包含一些gradle文件和一个含有example模组的子目录。

> **注意**  
> 许多文件可以在不同的模组中重复使用。这些文件是：
> - `build.gradle`
> - `gradlew`
> - `gradlew.bat`
> - `settings.gradle`
> 
> `src`子目录不需要跨工作区进行复制；但是，如果稍后创建java（`src/main/java`）和resource（`src/main/resources`），则可能需要刷新Gradle项目。

3. 打开你选择的IDE：

Forge只明确支持在Eclipse和IntelliJ IDEA上进行开发，但还有其他针对Visual Studio Code的运行配置。无论如何，从Apache NetBeans到Vim/Emacs的任何开发环境都可被使用。

Eclipse和IntelliJ IDEA的Gradle集成，都是已默认安装和启用的，将在导入或打开时处理其余的初始工作区设置。这包括从Mojang、MinecraftForge等下载必要的软件包。如果你使用Visual Studio Code，则需要安装"Gradle for Java"插件。

Gradle将需要被调用来重新评估项目中对其相关文件的几乎所有更改（如`build.gradle`、`settings.gradle`等等）。有些IDE带有"刷新"按钮来完成此操作；然而，它也可以通过在终端上运行`gradlew`来完成。

4. 为你选择的IDE生成运行配置:

- **Eclipse**: 运行`genEclipseRuns`任务。
- **IntelliJ IDEA**: 运行`genIntellijRuns`任务。如果发生了"module not specified"错误，请将`ideaModule`属性设置为你的'main'模块（通常为`${project.name}.main`）。
- **Visual Studio Code**: 运行`genVSCodeRuns`任务。
- **Other IDEs**: 你可以通过`gradle run*`来直接运行这些配置（如`runClient`、`runServer`、`runData`、`runGameTestServer`）。这对于已提供支持的IDE同样有效。

#### 3.1.3 自定义你的模组信息

编辑`build.gradle`文件以自定义你的模组的构建方式（如文件名称、artifact版本等等）。

> **重要**  
> 除非你知道你在做什么，否则不要编辑`settings.gradle`。该文件指定ForgeGradle所上传的仓库。

**建议的自定义项目**

**Mod Id替换**

将包括mods.toml和主mod文件在内的所有出现的`examplemod`替换为你的模组的mod id。这还包括通过设置`base.archivesName`（通常设置为你的mod id）来更改你构建的文件的名称。

```gradle
// 在某个build.gradle文件中
base.archivesName = 'mymod'
```

**Group Id**

`group`属性应该设置为你的顶级程序包，其应为你拥有的域名或你的电子邮件地址：

| 类型 | 值 | 顶级程序包 |
|------|-----|------------|
| 域名 | example.com | `com.example` |
| 子域名 | example.github.io | `io.github.example` |
| 电子邮箱地址 | example@gmail.com | `com.gmail.example` |

```gradle
// 在某个build.gradle文件中
group = 'com.example'
```

java源文件（`src/main/java`）中的包现在也应该符合这种结构，更深层的包表示mod id：

```
com
└── example (在group属性中所指定的顶级程序包)
    └── mymod (mod id)
        └── MyMod.java (重命名后的ExampleMod.java)
```

**版本**

将`version`属性设置为你的模组的当前版本。我们推荐采用Maven版本号命名格式。

```gradle
// 在某个build.gradle文件中
version = '1.19.4-1.0.0.0'
```

**额外配置**

额外配置可在ForgeGradle文档中找到。

#### 3.1.4 构建并测试你的模组

1. 要构建你的模组，请运行`gradlew build`。这将在`build/libs`输出一个默认名为`[archivesBaseName]-[version].jar`的文件。这个文件可以被放在已安装了Forge的Minecraft的`mods`文件夹中，也可以被分发。

2. 要在测试环境中运行你的模组，你既可以使用已生成的运行配置，也可以运行功能类似的Gradle任务（例如`gradlew runClient`）。这将使用任何所指定的源码集从run文件夹中启动Minecraft。默认的MDK包括`main`源码集，因此任何在`src/main/java`编写的源代码都会被应用。

3. 如果你想要运行dedicated服务端，无论是通过运行配置，还是通过`gradlew runServer`，服务端都会立刻宕机。你需要通过编辑run文件夹中的`eula.txt`文件同意Minecraft EULA。一旦同意后，服务器就会加载，之后就可以通过直连`localhost`进行访问。

> **注意**  
> 在服务端环境测试你的模组是必要的。这包括只针对客户端的模组，因为在加载到服务端后它们不应该做任何事。

### 3.2 模组文件

模组文件负责确定哪些文件会被打包到你模组的JAR文件中，在"Mods"菜单中显示哪些信息，以及你的模组如何被加载到游戏中。

#### 3.2.1 mods.toml

`mods.toml`定义你的一个或多个模组的元数据。它也包含一些附加信息，这些信息将在Mods菜单中被展示，并决定你的模组如何被加载进游戏。

该文件采用Tom's Obvious Minimal Language（简称TOML）格式。这个文件必须保存在你所使用的源码集的resource目录中的`META-INF`文件夹下（例如对于`main`源码集，其路径为`src/main/resources/META-INF/mods.toml`）。

`mods.toml`文件看起来长这样：

```toml
modLoader="javafml"
loaderVersion="[46,)"
license="All Rights Reserved"
issueTrackerURL="https://github.com/MinecraftForge/MinecraftForge/issues"
showAsResourcePack=false

[[mods]]
modId="examplemod"
version="1.0.0.0"
displayName="Example Mod"
updateJSONURL="https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json"
displayURL="https://minecraftforge.net"
logoFile="logo.png"
credits="I'd like to thank my mother and father."
authors="Author"
description='''
Lets you craft dirt into diamonds. This is a traditional mod that has existed for eons. It is ancient. The holy Notch created it. Jeb rainbowfied it.
'''
displayTest="MATCH_VERSION"

[[dependencies.examplemod]]
modId="forge"
mandatory=true
versionRange="[46,)"
ordering="NONE"
side="BOTH"

[[dependencies.examplemod]]
modId="minecraft"
mandatory=true
versionRange="[1.20]"
ordering="NONE"
side="BOTH"
```

`mods.toml`被分为三个部分：非模组特定属性，与模组文件相关联；模组特定属性，对每个模组都有单独的小节；以及依赖配置，对每个模组依赖都有单独的小节。下面将解释与文件相关的各个属性，其中**required**表示必须指定一个值，否则将引发异常。

**非模组特定属性**

非模组特定属性是与JAR文件本身相关的属性，指明如何加载模组和任何附加的全局元数据。

| 属性 | 类型 | 缺省值 | 描述 |
|------|------|--------|------|
| modLoader | string | **必需** | 模组所使用的语言加载器。可用于支持额外的语言结构，如为主文件定义的Kotlin对象，或确定入口点的不同方法，如接口或方法。Forge提供Java加载器（`"javafml"`）和低/无代码加载器（`"lowcodefml"`）。 |
| loaderVersion | string | **必需** | 可接受的语言加载器版本范围，以Maven版本范围表示。对于`javafml`和`lowcodefml`，其版本是Forge版本的主版本号。 |
| license | string | **必需** | 该JAR文件中的模组所遵循的许可证。建议将其设置为你正在使用的SPDX标识符和/或许可证的链接。你可以访问https://choosealicense.com/以帮助选取你想使用的许可证。 |
| showAsResourcePack | boolean | `false` | 当为`true`时，模组的资源会以一个单独的资源包的形式在"资源包"菜单中展示，而不是与"模组资源"包融为一体。 |
| services | array | `[]` | 表示你的模组所使用的一系列服务的数组。这是从Forge的Java平台模块系统实现中为模组创建的模块的一部分。 |
| properties | table | `{}` | 替换属性表。使用它`StringSubstitutor`将`${file.<key>}`替换为相应的值。该功能目前仅用于替换模组特定属性中的`version`。 |
| issueTrackerURL | string | 无 | 指向报告与追踪模组问题的地点的URL。 |

> **重要**  
> `services`属性在功能上等效于在模块中指定`uses`指令，该指令允许加载给定类型的服务。

**模组特定属性**

模组特定属性通过`[[mods]]`头与指定的模组绑定。其本质是一个表格数组（Array of Tables）；直到下一个`[[mods]]`头之前的所有键/值对都会被关联到那个模组。

| 属性 | 类型 | 缺省值 | 描述 |
|------|------|--------|------|
| modId | string | **必需** | 代表这个模组的唯一标识符。该标识符必须匹配`^[a-z][a-z0-9_]{1,63}$`（一个长度在[2,64]闭区间内的字符串；以小写字母开头；由小写字母、数字或下划线组成）。 |
| namespace | string | `modId`的值 | 该模组的一个重载命名空间。该命名空间必须匹配`^[a-z][a-z0-9_.-]{1,63}$`（一个长度在[2,64]闭区间内的字符串；以小写字母开头；由小写字母、数字、下划线、点或短横线组成）。目前无作用。 |
| version | string | `"1"` | 该模组的版本，最好符合Maven版本号命名格式。当设置为`${file.jarVersion}`时，它将被替换为JAR清单文件中`Implementation-Version`属性的值（在开发环境下默认显示为`0.0NONE`）。 |
| displayName | string | `modId`的值 | 该模组的更具可读性的名字。用于将模组展示到屏幕上时（如模组列表、模组不匹配）。 |
| description | string | `"MISSING DESCRIPTION"` | 在模组列表中展示的该模组的描述。建议使用一个多行文字字符串。 |
| logoFile | string | 无 | 在模组列表中展示的该模组的logo图像文件的名称和扩展名。该logo必须位于JAR文件的根目录或直接位于源码集的根目录。 |
| logoBlur | boolean | `true` | 决定使用`GL_LINEAR*`（true）或`GL_NEAREST*`（false）渲染`logoFile`。 |
| updateJSONURL | string | 无 | 被更新检查器用来检查你所使用的模组是否为最新版本的指向一个JSON文件的URL。 |
| modproperties | table | `{}` | 与本模组相关联的一个键/值对表。目前尚未被Forge使用，但主要被模组使用。 |
| modUrl | string | 无 | 指向本模组下载界面的URL。目前无作用。 |
| credits | string | 无 | 在模组列表中展示的致谢声明。 |
| authors | string | 无 | 在模组列表中展示的本模组的作者。 |
| displayURL | string | 无 | 在模组列表中展示的本模组的展示页面（项目主页）。 |
| displayTest | string | `"MATCH_VERSION"` | 参见'sides'。 |
| features | table | `{}` | 功能系统允许模组在加载系统时要求某些设置、软件或硬件可用。当某个功能不满足时，模组加载将失败，并将要求通知给用户。目前，Forge提供以下功能：`java_version`（可支持的Java版本范围，以Maven版本范围表示。该范围须能够支持Minecraft所使用的Java版本）。 |

**依赖配置**

模组可以指定它们的依赖项，这些依赖项在加载模组之前由Forge检查。这些配置是使用表格数组（Array of Tables）创建的，其中`[[dependencies.<modid>]]`是所依赖的模组的标识符。

| 属性 | 类型 | 缺省值 | 描述 |
|------|------|--------|------|
| modId | string | **必需** | 被添加为依赖的模组的标识符。 |
| mandatory | boolean | **必需** | 当依赖未满足时游戏是否崩溃。 |
| versionRange | string | `""` | 可接受的语言加载器版本范围，以Maven版本范围表示。空字符串表示匹配所有版本。 |
| ordering | string | `"NONE"` | 定义本模组是否必须在所依赖的模组之前（`"BEFORE"`）或之后（`"AFTER"`）加载。`"NONE"`表示不规定顺序。 |
| side | string | `"BOTH"` | 所依赖模组必须位于的端位：`"CLIENT"`、`"SERVER"`或`"BOTH"`。 |
| referralUrl | string | 无 | 指向依赖下载界面的URL。目前无作用。 |

> **警告**  
> 两个模组的`ordering`可能会因循环依赖而造成崩溃：例如模组A必须在模组B之前（`"BEFORE"`）加载，而模组B也必须在模组A之前（`"BEFORE"`）加载。

#### 3.2.2 模组入口点

现在我们已经填写了`mods.toml`，我们需要提供一个对模组进行编程的入口点。入口点本质上是执行模组的起点。入口点本身由`mods.toml`中使用的语言加载器决定。

`javafml`和`lowcodefml`是Forge为Java编程语言提供的语言加载器。入口点是通过使用带有`@Mod`注释的公共类来定义的。`@Mod`的值必须包含`mods.toml`中指定的一个Mod id。从那里，所有初始化逻辑（例如注册事件、添加`DeferredRegister`）都可以在类的构造函数中写明。模组总线可以从`FMLJavaModLoadingContext`获得。

```java
@Mod("examplemod") // 必须匹配mods.toml
public class Example {
    public Example() {
        // 此处初始化逻辑
        var modBus = FMLJavaModLoadingContext.get().getModEventBus();
        // ...
    }
}
```

`lowcodefml`是一种语言加载器，用于将数据包和资源包作为模组形式分发，而无需代码形式的入口点。它被指定为`lowcodefml`而不是`nocodefml`，用于将来可能需要的最少量代码的小添加。

### 3.3 规划你的模组结构

结构分明的模组有利于维护和做出贡献，并提供对底层代码库的更清晰理解。下面列举了由Java、Minecraft和Forge提出的一些建议。

> **注意**  
> 你不必遵循以下建议；你可以以任何你认为合适的方式规划你的模组。然而，我们仍强烈建议这样做。

#### 3.3.1 程序包

在规划你的模组时，选择一个独特的、顶级的程序包结构。许多程序员会对不同的类、接口等使用相同的名称。Java允许类具有相同的名称，只要它们位于不同的包中。因此，如果两个类具有相同的名称和相同的包，则只有一个会被加载，这很可能导致游戏崩溃。

当涉及到加载模块时，这一点更为重要。如果在不同的模块中有两个同名包下的类文件，这将导致模组加载器在启动时崩溃，因为模组模块会被导出到游戏和其他模组中。

正因如此，你的顶级程序包应该是你自己的东西：域名、电子邮件地址、网站的子域等。它甚至可以是你的名字或用户名，只要你能保证它在预期目标中是唯一可识别的。

| 类型 | 值 | 顶级程序包 |
|------|-----|------------|
| 域名 | example.com | `com.example` |
| 子域名 | example.github.io | `io.github.example` |
| 电子邮箱地址 | example@gmail.com | `com.gmail.example` |

下一个级别的包应该是你的mod id（例如，`com.example.examplemod`其中`examplemod`是mod id）。这将保证，除非你有两个id相同的模组（这种情况永远不会发生），否则你的包在加载时不会出现任何问题。

你可以在Oracle的教程页面上找到一些其他命名约定。

**子包的组织**

除了顶级包以外，强烈建议将你的模组的类拆分为不同的子包。关于如何做到这一点，主要有两种方法：

1. **按功能分组**: 将具有共同目的的类归入同一个子包。例如，方块相关的类可被置于`block`或`blocks`子包下，实体相关的类可被置于`entity`或`entities`子包下等等。Mojang就在使用这种结构，单词用的是单数形式（`block`、`entity`）。

2. **按逻辑分组**: 将具有共同逻辑的类归入同一个子包。例如，如果你正在创建一种新配方，你可以将它的方块、菜单、物品等等都放在`feature.crafting_table`子包下。

**客户端、服务端和数据相关的子包**

通常，仅用于给定端位或运行时的代码都应该在单独的子包中与其他类隔离。例如，与数据生成相关的代码应该放在`data`子包中，而仅与dedicated服务器相关的代码应该在`server`子包中。

然而，**强烈建议在`client`子包中隔离仅限客户端的代码**。这是因为dedicated服务器不应有任何权限访问Minecraft中仅限客户端的包。因此，拥有一个专用的包将提供一个不错的健全性检查，以保证你的模组中的代码没有越过端位的行为。

#### 3.3.2 类的命名规则

一个普适的类命名方案可以让你更容易地读懂类的目的或查找某个特定的类。

类的名称通常以其类型作为后缀，例如：

- 一个叫作`PowerRing`的`Item` -> `PowerRingItem`。
- 一个叫作`NotDirt`的`Block` -> `NotDirtBlock`。
- 为`Oven`设计的一个菜单 -> `OvenMenu`。

> **注意**  
> Mojang通常对除实体以外的所有类命名时都遵循类似的结构。而实体只用它们的名字来表示（例如`Pig`、`Zombie`等）。

#### 3.3.3 选择仅用一个方法而非多个

执行特定任务的方法有很多：注册对象、监听事件等。通常建议使用单一方法来完成给定的任务以保持一致。这在改善了代码格式的同时，也避免了可能发生的任何奇怪的交互或冗余（例如，你的事件监听器执行了两次）。

### 3.4 版本号

在一般项目中，语义式的版本号（格式为`MAJOR.MINOR.PATCH`）被经常使用。然而，在长期性地修改的情况下，使用格式`MCVERSION-MAJORMOD.MAJORAPI.MINOR.PATCH`可能更有利于将模组的创世性的修改与API变更性的修改区分开来。

> **重要**  
> Forge使用Maven版本范围来比较版本字符串，这与Semantic Versioning 2.0.0规范不完全兼容，例如"prerelease"标签。

#### 3.4.1 样例

以下是在不同情形下能递增各种变量的示例列表。

- `MCVERSION` 始终与该模组所适用的Minecraft版本相匹配。
- `MAJORMOD` 移除物品、方块、方块实体等。改变或移除之前存在的机制。升级到新的Minecraft版本。
- `MAJORAPI` 更改枚举的顺序或变量。更改方法的返回类型。一并移除公共方法。
- `MINOR` 添加物品、方块、方块实体等。添加新机制。废弃公共方法。（这不是一次`MAJORAPI`递增，因为它并未改变API。）
- `PATCH` Bug修复。

当递增任何变量时，所有更小级别的变量都应重置为`0`。例如，如果递增`MINOR`，`PATCH`将变为`0`。如果递增`MAJORMOD`，则所有其他变量将变为`0`。

**项目初始阶段**

如果你正处于模组的初始开发阶段（在任何正式发布之前），`MAJORMOD`和`MAJORAPI`应始终为`0`。只有`MINOR`和`PATCH`应该在每次构建你的模组时更新。一旦你构建了一个官方版本（大多数情况下应使用稳定的API），你应该将`MAJORMOD`增加到版本`1.0.0.0`。有关任何进一步的开发阶段，请参阅本文档的预发布和候选发布部分。

**多个Minecraft版本**

如果模组升级到新版本的Minecraft，而旧版本将只会得到bug修复，则`PATCH`变量应根据升级前的版本进行更新。如果模组针对旧版本和新版本的Minecraft都仍在积极开发中，建议将该版本附加到所有两个Minecraft版本号之后。例如，如果模组由于Minecraft版本的更改而升级到版本`3.0.0.0`，那么旧版本的模组也应该更新到`3.0.0.0`。又例如，旧版本将变成版本`1.7.10-3.0.0.0`，而新版本将变成版本`1.8-3.0.0.0`。如果在为新的Minecraft版本构建时模组本身并没有任何更改，那么除了Minecraft版本之外的所有变量都应该保持不变。

**最终发布**

当放弃对某个Minecraft版本的支持时，针对该版本的最后一个模组构建版本应该有`-final`后缀。这意味着模组对于所表示的`MCVERSION`将不再支持，玩家应该升级到模组所支持的新版本的Minecraft，以继续接收更新和bug修复。

**预发布**

（本指南不使用`-pre`，因为在撰写本文时，它不是`-beta`的有效别名。）请注意，已经发布的版本和首次发布之前的版本不能进入预发布；变量（主要是`MINOR`，但`MAJORAPI`和`MAJORMOD`也可以预发布）应该在添加后缀之前进行相应的更新。首次发布之前的版本只是在建版本。

**候选发布**

候选发布在实际版本更替之前充当预发布。这些版本应该附加`-rcX`，其中`X`是候选版本的数量，理论上，只有在修复bug时才应该增加。已经发布的版本无法接收候选版本；在添加后缀之前，应该相应地更新变量（主要是`MINOR`，但`MAJORAPI`和`MAJORMOD`也可以预发布）。当作为稳定构建版本发布候选版本时，它既可以与上一个候选版本完全相同，也可以有更多的bug修复。