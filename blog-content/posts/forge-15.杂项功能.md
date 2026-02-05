---
title: Forge 1.20.1开发文档-15 杂项功能
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 17
---

> 本文档来源于Forge官方中文文档，侵删
## 15. 杂项功能

### 15.1 配置

配置定义了可以应用于模组实例的设置和Consumer偏好。Forge使用一个采用TOML文件的配置系统，并使用NightConfig进行读取。

#### 15.1.1 创建一个配置

可以使用 `ForgeConfigSpec$Builder` 生成。生成器可以通过 `ForgeConfigSpec$Builder#configure` 创建配置。

**构建配置的方法：**

```java
// 在某个配置类中
public class ExampleConfig {
    public ExampleConfig(ForgeConfigSpec.Builder builder) {
        // 在此处在final字段中定义值
    }
}

// 在该构造函数可被访问的某处
static {
    Pair<ExampleConfig, ForgeConfigSpec> pair = new ForgeConfigSpec.Builder()
        .configure(ExampleConfig::new);
    // 在某个常量字段中存储成对的值
}
```

**部分分隔：**
Forge通过 `Builder#push` 创建一个部分，通过 `Builder#pop` 离开一个部分，用于将配置值分隔为多个部分。

**配置值上下文：**
可以使用以下方法之一为每个配置值提供额外的上下文，以提供额外的行为。必须先定义上下文，然后才能完全生成配置值：

| 方法 | 描述 |
|------|------|
| `comment` | 为配置值提供作用说明，可以为多行注释提供多个字符串 |
| `translation` | 为配置值的名称提供翻译键 |
| `worldRestart` | 必须重新启动世界才能更改配置值 |

**配置值类型：**
所有配置值方法都至少接受两个组件：
- 表示变量名称的路径：一个被 `.` 分隔的字符串，表示配置值所在的部分
- 不存在有效配置时的默认值

特定于 `ForgeConfigSpec$Builder` 的方法包含两个附加组件：
- 用于确保反序列化对象有效的验证器
- 表示配置值的数据类型的类

**创建配置值：**
```java
// 对于某个ForgeConfigSpec$Builder生成器
ConfigValue<T> value = builder.comment("Comment")
    .define("config_value_name", defaultValue);
```

**附加的配置值类型：**

| 类型 | 描述 | 方法名称 | 附加组件 |
|------|------|----------|----------|
| 范围值 | 值必须在所定义的范围之间 | 配置值可能的最小值和最大值 |
| 白名单值 | 值必须在所提供的集合中 | 配置所允许的值的集合 |
| 列表值 | 值是一个条目列表 | 用于确保列表中反序列化元素有效的验证器 |
| 枚举值 | 在所提供的集合中的一个枚举值 | 一个将字符串或整数转换为枚举的getter；允许值的集合 |
| 布尔值 | A `boolean` value | - |

**注意：** `DoubleValue`、`IntValue`、`LongValue` 是将类型分别指定为 `Double`、`Integer` 和 `Long` 的范围值。

#### 15.1.2 注册一个配置

一旦构建了 `ForgeConfigSpec`，就必须通过 `ModLoadingContext#registerConfig` 在模组构造函数中注册，以允许Forge根据需要加载、跟踪和同步配置设置。

```java
// 在具有一个ForgeConfigSpec CONFIG的模组构造函数中
ModLoadingContext.get().registerConfig(Type.COMMON, CONFIG);
```

**可用的配置类型：**

| 类型 | 加载侧 | 同步到客户端 | 客户端位置 | 服务端位置 | 默认文件后缀 |
|------|--------|--------------|------------|------------|--------------|
| CLIENT | 仅在客户端 | 否 | `.minecraft/config` | N/A | `-client` |
| COMMON | 在两端 | 否 | `.minecraft/config` | `<server_folder>/config` | (无) |
| SERVER | 仅在服务端 | 是 | `.minecraft/saves/<level_name>/serverconfig` | `<server_folder>/world/serverconfig` | `-server` |

> **提示：** Forge在相应的代码库中用文档详述了配置类型。

#### 15.1.3 配置事件

每当加载或重新加载配置时发生的操作可以使用 `ModConfigEvent$Loading` 和 `ModConfigEvent$Reloading` 事件来完成。事件必须注册到模组事件总线。

> **警告：** 这些事件对于模组的所有配置都被调用；所提供的 `ModConfig` 对象应被用于表示正在加载或重新加载哪个配置。

### 15.2 键盘布局

键盘布局（键映射）定义了应与输入绑定的特定操作：鼠标单击、按键等。每当客户端可以进行输入时，都可以检查键盘布局定义的每个操作。此外，每个键盘布局都可以通过控制选项菜单分配给任何输入。

#### 15.2.1 注册一个 KeyMapping

`KeyMapping` 可以通过仅在物理客户端上监听模组事件总线上的 `RegisterKeyMappingsEvent` 并调用 `#register` 来注册。

```java
// 在某个仅物理客户端的类中
// 键盘布局是延迟初始化的，因此在注册之前它不存在
public static final Lazy<KeyMapping> EXAMPLE_MAPPING = Lazy.of(() -> /*...*/);

// 事件仅在物理客户端上的模组事件总线上
@SubscribeEvent
public void registerBindings(RegisterKeyMappingsEvent event) {
    event.register(EXAMPLE_MAPPING.get());
}
```

#### 15.2.2 创建一个 KeyMapping

`KeyMapping` 可以使用其构造函数创建，构造函数的参数包括：
- 控制选项菜单中的类别的翻译键
- 默认输入
- 提示

> **提示：** 通过提供原版未提供的类别翻译键，可以将 `KeyMapping` 添加到自定义类别中。自定义类别转换键应包含mod id（例如 `key.categories.examplemod.examplecategory`）。

**默认输入：**
每个键映射都有一个与其关联的默认输入，通过 `InputConstants$Key` 定义。每个输入由一个 `InputConstants$Type` 和一个整数组成，前者定义提供输入的设备，后者定义设备上输入的相关标识符。

原版提供三种类型的输入：
- `KEYSYM`：通过 `GLFW` 提供的键标记定义键盘
- `SCANCODE`：通过平台特定扫描码定义键盘
- `MOUSE`：定义鼠标

> **注意：** 强烈建议键盘使用 `KEYSYM` 而不是 `SCANCODE`，因为 `GLFW` 键令牌不与任何特定系统绑定。你可以在GLFW文档上阅读更多内容。

整数取决于提供的类型。所有输入代码都在 `GLFW` 中定义：`GLFW_KEY_*` 令牌以 `GLFW_KEY_` 为前缀，而 `GLFW_MOUSE_*` 代码以 `GLFW_MOUSE_` 作为前缀。

```java
new KeyMapping(
    "key.examplemod.example1", // 将使用该翻译键进行本地化
    InputConstants.Type.KEYSYM, // 在键盘上的默认映射
    GLFW.GLFW_KEY_P, // 默认键为P
    "key.categories.misc" // 映射将在杂项（misc）类别中
)
```

**IKeyConflictContext：**
并非所有映射都用于每个上下文。有些映射仅在GUI中使用，而另一些映射仅在游戏中使用。为了避免在不同上下文中使用的同一键的映射相互冲突，可以分配 `IKeyConflictContext`。

每个冲突上下文包含两种方法：
- `#isActive`：定义映射是否可以在当前游戏状态下使用
- `#conflicts`：定义在相同或不同的冲突上下文中映射是否与键冲突

Forge通过 `KeyConflictContext` 定义了三个基本上下文：
- `UNIVERSAL`：默认值，意味着密钥可以在每个上下文中使用
- `GUI`：意味着映射只能在 `Screen` 打开时使用
- `IN_GAME`：意味着映射只有在 `Screen` 未打开时才能使用

可以通过实现 `IKeyConflictContext` 来创建新的冲突上下文。

```java
new KeyMapping(
    "key.examplemod.example2",
    KeyConflictContext.GUI, // 映射只能在当一个屏幕打开时使用
    InputConstants.Type.MOUSE, // 在鼠标上的默认映射
    GLFW.GLFW_MOUSE_BUTTON_LEFT, // 在鼠标左键上的默认鼠标输入
    "key.categories.examplemod.examplecategory" // 映射将在新的示例类别中
)
```

**KeyModifier：**
如果修改键保持不变（例如 `G` 与 `CTRL + G`），则修改器可能不希望映射具有相同的行为。Forge在构造函数中添加了一个额外的参数来接受一个 `KeyModifier`。

`KeyModifier` 可以将 control（`KeyModifier#CONTROL`）、shift（`KeyModifier#SHIFT`）或 alt（`KeyModifier#ALT`）映射到任何输入。`KeyModifier#NONE` 是默认值，不会应用任何修改器。

```java
new KeyMapping(
    "key.examplemod.example3",
    KeyConflictContext.UNIVERSAL,
    KeyModifier.SHIFT, // 默认映射要求shift被按下
    InputConstants.Type.KEYSYM, // 默认映射在键盘上
    GLFW.GLFW_KEY_G, // 默认键为G
    "key.categories.misc"
)
```

#### 15.2.3 检查一个 KeyMapping

可以检查 `KeyMapping` 以查看它是否已被单击。根据时间的不同，可以在条件中使用映射来应用关联的逻辑。

**在游戏内：**
应通过在Forge事件总线上监听 `ClientTickEvent` 并在while循环中检查 `#consumeClick`。

```java
// 事件仅在物理客户端上的Forge事件总线上
public void onClientTick(ClientTickEvent event) {
    if (event.phase == TickEvent.Phase.END) { // 仅调用代码一次，因为tick事件在每个tick调用两次
        while (EXAMPLE_MAPPING.get().consumeClick()) {
            // 在此处执行单击时的逻辑
        }
    }
}
```

> **警告：** 不要将 `InputEvent` 用作 `ClientTickEvent` 的替代项。只有键盘和鼠标输入有单独的事件，所以它们不会处理任何额外的输入。

**在GUI内：**
可以使用 `IForgeKeyMapping#isActiveAndMatches` 在其中一个 `GuiEventListener` 方法中检查映射。

- `#keyPressed`：接收 `GLFW` 键令牌、特定于平台的扫描代码和按下的修改器的位字段
- `#mouseClicked`：获取鼠标的x位置、y位置和单击的按钮

```java
// 在某个Screen子类中
@Override
public boolean keyPressed(int key, int scancode, int mods) {
    if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.getKey(key, scancode))) {
        // 在此处执行按键时的逻辑
        return true;
    }
    return super.keyPressed(key, scancode, mods);
}

@Override
public boolean mouseClicked(double x, double y, int button) {
    if (EXAMPLE_MAPPING.get().isActiveAndMatches(InputConstants.TYPE.MOUSE.getOrCreate(button))) {
        // 在此处执行鼠标单击时的逻辑
        return true;
    }
    return super.mouseClicked(x, y, button);
}
```

> **注意：** 如果你不拥有要检查键的屏幕，你可以在Forge事件总线上监听 `ScreenEvent$KeyPressed` 或 `ScreenEvent$MouseButtonPressed` 事件。

### 15.3 游戏测试

游戏测试是运行游戏内单元测试的一种方式。该系统被设计为可扩展的，并可并行高效地运行大量不同的测试。测试对象交互和行为只是该框架众多应用程序中的一小部分。

#### 15.3.1 创建一个游戏测试

一个标准的游戏测试遵循以下三个基本步骤：
1. 加载一个结构或模板，其中包含测试交互或行为的场景（scene）
2. 执行要在场景中执行的逻辑
3. 如果达到成功状态，则测试成功。否则，测试将失败，结果将存储在场景附近的讲台（lectern）内

因此，要创建游戏测试，必须有一个现有的模板来保存场景的初始开始状态和一个提供执行逻辑的方法。

**测试方法：**
游戏测试方法是一个 `Consumer<GameTestHelper>`，意味着它接受一个 `GameTestHelper`，但不返回任何内容。要识别游戏测试方法，它必须具有 `@GameTest` 注释：

```java
public class ExampleGameTests {
    @GameTest
    public static void exampleTest(GameTestHelper helper) {
        // 做一些事情
    }
}
```

`@GameTest` 注释还包含配置游戏测试运行方式的成员：

```java
// 在某个类中
@GameTest(
    setupTicks = 20L, // 该测试花费20个tick来设置执行
    required = false // 失败将记录到日志，但不会影响批处理的执行
)
public static void exampleConfiguredTest(GameTestHelper helper) {
    // 做一些事情
}
```

**相对定位：**
所有 `GameTestHelper` 方法都使用结构方块的当前位置将结构模板场景中的相对坐标转换为其绝对坐标。为了便于在相对定位和绝对定位之间进行转换，可以分别使用 `GameTestHelper#absolutePos` 和 `GameTestHelper#relativePos`。

> **提示：** 结构模板的相对位置可以在游戏中通过test命令加载结构，将玩家放置在所需位置，最后运行 `/test pos` 命令来获得。这将获取玩家相对于玩家200个方块内最近结构的坐标。该命令将相对位置导出为聊天中的可复制文本组件，用作最终的局部变量。

> **提示：** `/test pos` 生成的局部变量可以通过将其附加到命令末尾来指定其引用名称：`/test pos <var> # 导出'final BlockPos <var> = new BlockPos(...);'`

**成功完成：**
游戏测试方法负责一件事：在有效完成时标记测试是否成功。如果在超时之前没有达到成功状态（如 `@GameTest#timeoutTicks` 所定义），则测试自动失败。

`GameTestHelper` 中有许多抽象方法，可用于定义成功状态；然而，有四个是非常重要的：

| 方法 | 描述 |
|------|------|
| `#succeed` | 测试被标记为成功 |
| `#succeedIf` | 如果没有抛出 `GameTestAssertException`，则会立即测试所提供的 `Runnable` 并成功。如果在该瞬时tick上没有成功，则将其标记为失败 |
| `#succeedWhen` | 所提供的 `Runnable` 在超时之前每tick都会进行测试，如果对其中一个tick的检查没有引发 `GameTestAssertException`，则会成功 |
| `#succeedOnTickWhen` | 提供的 `Runnable` 在指定的tick上进行测试，如果没有抛出 `GameTestAssertException`，则会成功。如果在任何其他tick上成功，则将其标记为失败 |

> **重要：** 游戏测试每tick都会执行，直到测试被标记为成功。因此，在给定的tick上安排成功的方法必须小心，不要总是在之前的tick上失败。

**计划操作：**
并非所有操作都会在测试开始时发生。操作可以安排在特定的时间或间隔进行：

| 方法 | 描述 |
|------|------|
| `#runAtTickTime` | 操作将在指定的tick上运行 |
| `#runAfterDelay` | 操作将在当前tick后 x tick时运行 |
| `#onEachTick` | 操作在每个tick都会运行 |

**断言：**
在游戏测试期间的任何时候，都可以进行断言以检查给定条件是否为真。`GameTestHelper` 中有许多断言方法，它们在不满足适当状态时会抛出 `GameTestAssertException`。

#### 15.3.2 注册一个游戏测试

游戏测试必须注册后才能在游戏中运行。有两种方法：通过注释或 `RegisterGameTestsEvent`。

`@GameTestHolder` 注释注册类型（类、接口、枚举或记录）中的任何测试方法。

```java
@GameTestHolder(MODID)
public class ExampleGameTests {
    // ...
}
```

> **注意：** `@GameTestHolder` 包含一个 `#value` 方法。在该实例中，提供的必须是模组的mod id；否则，测试将不会在默认配置下运行。

`RegisterGameTestsEvent` 也可以使用 `#register` 注册类或方法。以这种方式注册的测试方法必须在每个用 `@GameTest` 注释的方法上提供其mod id。

```java
// 在某个类中
public void registerTests(RegisterGameTestsEvent event) {
    event.register(ExampleGameTests.class);
}

// 在ExampleGameTests中
@GameTest(templateNamespace = MODID)
public static void exampleTest3(GameTestHelper helper) {
    // 进行设置（setup）
}
```

> **注意：** 仍然需要用 `@GameTest`、`@GameTestGenerator`、`@BeforeBatch` 或 `@AfterBatch` 对测试方法进行注释。

**生成的测试方法：**
如果需要动态生成游戏测试方法，则可以创建测试方法生成器。这些方法不接受任何参数，并返回一个 `TestFunction` 的集合。要识别测试方法生成器，它必须具有 `@GameTestGenerator` 注释：

```java
public class ExampleGameTests {
    @GameTestGenerator
    public static Collection<TestFunction> exampleTests() {
        // 返回一个TestFunction的集合
    }
}
```

`TestFunction` 是 `@GameTest` 注释和运行测试的方法所包含的包装信息。任何使用 `@GameTest` 注释的方法都会使用 `GameTestRegistry#turnMethodIntoTestFunction` 转换为 `TestFunction`。该方法可以用 `@GameTest` 的引用创建 `TestFunction`，而无需使用注释。

**批量处理：**
游戏测试可以批量执行，而不是按注册顺序执行。可以通过提供相同的 `@GameTest#batch` 字符串将测试添加到批次中。

批处理可用于在测试运行的当前存档上执行设置和拆卸（teardown）状态。这是通过用 `@BeforeBatch` 和 `@AfterBatch` 注释方法来完成的，方法必须与提供给游戏测试的 `#batch` 方法名字符串匹配。

批处理方法是 `Consumer<ServerLevel>`，意味着它们接受 `ServerLevel` 而不返回任何内容：

```java
public class ExampleGameTests {
    @BeforeBatch(batch = "firstBatch")
    public static void beforeTest(ServerLevel level) {
        // 进行设置（setup）
    }
    
    @GameTest(batch = "firstBatch")
    public static void exampleTest2(GameTestHelper helper) {
        // 做一些事情
    }
}
```

#### 15.3.3 结构模板

游戏测试是在由结构或模板加载的场景中执行的。所有模板都定义了场景的尺寸以及将要加载的初始数据（方块和实体）。模板必须存储为 `data/<namespace>/structures` 中的 `.nbt` 文件。

可以使用结构方块创建和保存结构模板。

模板的位置由以下几个因素指定：
1. 模板的命名空间是否被指定
2. 类名是否应被加到模板的名称之前
3. 模板的名称是否被指定

模板的命名空间由 `GameTest#templateNamespace` 确定，如果未指定则由 `GameTestHolder#value` 确定，如果两者都未指定则由 `minecraft` 确定。

如果将 `@PrefixGameTestTemplate` 应用于具有测试注释的类或方法并设置为 `false`，则简单类名不会前置于模板的名称。否则，简单类名将变为小写并加上前缀，然后在模板名之前加上一个点。

模板的名称由 `GameTest#template` 决定。如果未指定，则使用方法的小写名称。

```java
// 所有结构的modid将为MODID
@GameTestHolder(MODID)
public class ExampleGameTests {
    // 类名已前置，模板名称未指定
    // 模板位置位于'modid:examplegametests.exampletest'
    @GameTest
    public static void exampleTest(GameTestHelper helper) { /*...*/ }
    
    // 类名未前置，模板名称未指定
    // 模板位置位于'modid:exampletest2'
    @PrefixGameTestTemplate(false)
    @GameTest
    public static void exampleTest2(GameTestHelper helper) { /*...*/ }
    
    // 类名已前置，模板名称已指定
    // 模板位置位于'modid:examplegametests.test_template'
    @GameTest(template = "test_template")
    public static void exampleTest3(GameTestHelper helper) { /*...*/ }
    
    // 类名未前置，模板名称已指定
    // 模板位置位于'modid:test_template2'
    @PrefixGameTestTemplate(false)
    @GameTest(template = "test_template2")
    public static void exampleTest4(GameTestHelper helper) { /*...*/ }
}
```

#### 15.3.4 运行游戏测试

可以使用 `/test` 命令运行游戏测试。`/test` 命令具有高度可配置性：

| 子命令 | 描述 |
|--------|------|
| `run <test_name>` | 运行指定的测试 |
| `runall` | 运行所有可用的测试 |
| `runthis` | 运行离玩家15个方块内最近的测试 |
| `runthese` | 运行离玩家200个方块内的测试 |
| `runfailed` | 运行上一次运行中失败的所有测试 |

> **注意：** 子命令跟在test命令后面：`/test <subcommand>`

#### 15.3.5 构建脚本（buildscript）配置

**启用其他命名空间：**
如果构建脚本是按照推荐的方式进行设置的，那么只会启用当前mod id下的游戏测试。要使其他命名空间能够从中加载游戏测试，运行配置必须将属性 `forge.enabledGameTestNamespaces` 设置为一个字符串，指定用逗号分隔的每个命名空间。

```gradle
// 在某个运行配置里面
property 'forge.enabledGameTestNamespaces', 'modid1,modid2,modid3'
```

> **警告：** 命名空间之间不能有空格；否则，将无法正确加载命名空间。

**游戏测试服务端运行配置：**
游戏测试服务端是一种运行构建服务端的特殊配置。构建服务端返回所需的失败游戏测试数的退出代码。所有失败的测试都被记录到日志，无论是必需的还是可选的。此服务端可以使用 `gradlew runGameTestServer` 运行。

**在其他运行配置中启用游戏测试：**
默认情况下，只有 `client`、`server` 和 `gameTestServer` 运行配置启用了游戏测试。如果另一个运行配置应该运行游戏测试，则 `forge.enableGameTest` 属性必须设置为 `true`。

```gradle
// 在一个运行配置里面
property 'forge.enableGameTest', 'true'
```

### 15.4 Forge更新检查器

Forge提供了一个轻量级的可选择性加入的更新检查框架。如果任何模组有可用的更新，它将在主菜单和模组列表的'Mods'按钮上显示一个闪烁的图标，以及相应的更改日志。

#### 15.4.1 入门

要做的第一件事是在 `mods.toml` 文件中指定 `updateJSONURL` 参数。此参数的值应该是指向更新JSON文件的有效URL。

#### 15.4.2 更新JSON格式

JSON格式如下：

```json
{
    "homepage": "<homepage/download page for your mod>",
    "<mcversion>": {
        "<modversion>": "<changelog for this version>",
        "promos": {
            "<mcversion>-latest": "<modversion>",
            "<mcversion>-recommended": "<modversion>"
        }
    }
}
```

**注意事项：**
- `homepage` 下的链接是当模组过时时将向用户显示的链接
- Forge使用内部算法确定版本字符串是否比另一个"新"
- 可以使用 `\n` 将变更日志字符串分隔成多行
- 可以将 `build.gradle` 配置为在构建版本时自动更新此文件

#### 15.4.3 检索更新检查结果

可以使用 `VersionChecker#getResult(IModInfo)` 检索Forge更新检查器的结果。可以通过 `ModLoadingContext.get().getActiveContainer()`、`ModList.get().getModContainerById(<你的modId>)` 或 `ModList.get().getModContainerByObject(<你的模组实例>)` 获取 `IModInfo`。

返回的对象有一个 `#status` 方法，表示版本检查的状态：

| 状态 | 描述 |
|------|------|
| `FAILED` | 版本检查器无法连接到提供的URL |
| `UP_TO_DATE` | 当前版本等于推荐版本 |
| `AHEAD` | 当前版本比推荐版本更新 |
| `OUTDATED` | 有一个新的推荐版本或最新版本 |
| `BETA_OUTDATED` | 有一个新的最新版本 |
| `BETA` | 当前版本等于或高于最新版本 |
| `PENDING` | 请求的结果尚未完成 |

返回的对象还将具有 `update.json` 中指定的目标版本和任何变更日志行。

### 15.5 调试分析器

Minecraft提供了一个调试分析器，提供系统数据、当前游戏设置、JVM数据、存档数据和tick信息，以查找耗时的代码。

#### 15.5.1 使用调试分析器

调试分析器使用非常简单。它需要调试绑定键 `F3 + L` 来启动分析器。10秒后，它将自动停止；可以通过再次按绑定键提前停止。

> **注意：** 你只能分析实际到达的代码路径。要分析的实体和方块实体必须存在于存档中才能显示在结果中。

停止调试器后，它将在运行目录中的 `debug/profiling` 子目录中创建一个新的zip。文件名的格式为日期和时间：`yyyy-mm-dd_hh_mi_ss-WorldName-VersionNumber.zip`

#### 15.5.2 阅读一个分析结果

在每个端位的文件夹（`client` 和 `server`）中，你会发现一个包含结果数据的 `profiling.txt` 文件。

示例输出：
```
[00] levels - 96.70%/96.70%
[01] |   Level Name - 99.76%/96.47%
[02] |   |   tick - 99.31%/95.81%
[03] |   |   |   entities - 47.72%/45.72%
[04] |   |   |   |   regular - 98.32%/44.95%
```

解释：
- 第一个百分比：该部分所花费的时间相对于其父项的百分比
- 第二个百分比：整个tick所花的时间

#### 15.5.3 分析你自己的代码

调试分析器具有对 `Entity` 和 `BlockEntity` 的基本支持。要分析其他内容，需要手动创建部分：

```java
ProfilerFiller profiler = /* 获取profiler */;
profiler.push(yourSectionName : String);
// 你想分析的代码
profiler.pop();
```

可以从 `Level`、`MinecraftServer` 或 `Minecraft` 实例获取 `ProfilerFiller` 实例。
