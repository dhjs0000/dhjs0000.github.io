---
title: Forge 1.20.1开发文档-4 开发概念
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 6
---

> 本文档来源于Forge官方中文文档，侵删
# Minecraft Forge 开发文档

## 4. 核心概念

### 4.1 注册表

注册是获取模组的对象（如物品、方块、音效等）并使其为游戏所知的过程。注册东西很重要，因为如果没有注册，游戏将根本不知道这些对象，这将导致无法解释的行为和崩溃。

#### ResourceLocation

游戏中的大多数注册相关事项都由Forge注册表处理。注册表是一个与为键分配值的Map的行为类似的对象。Forge使用带有 `ResourceLocation` 键的注册表来注册对象。这允许 `ResourceLocation` 充当对象的"注册表名称"。

每种类型的可注册对象都有自己的注册表。要查看由Forge封装的所有注册表，请参阅 `ForgeRegistries` 类。注册表中的所有注册表名称必须是唯一的。但是，不同注册表中的名称不会发生冲突。例如，有一个 `Block` 注册表和一个 `Item` 注册表。一个方块和一个物品可以用相同的名称 `example:thing` 注册而不冲突；但是，如果两个不同的方块（或物品）以相同的名称被注册，则第二个对象将覆盖第一个对象。

#### 4.1.1 注册的方式

有两种正确的方式来注册对象：`DeferredRegister` 类和 `RegisterEvent` 生命周期事件。

**DeferredRegister**

`DeferredRegister` 是注册对象的推荐方式。它包容静态初始化的使用与便利，同时也避免与之相关的问题。它只需维护一系列的 `Supplier`，并在 `RegisterEvent` 期间注册这些Supplier所提供的对象。（Supplier是Java 8加入的新语法。——译者注）

以下是一个模组注册一个自定义方块的案例：

```java
private static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, MODID);
public static final RegistryObject<Block> ROCK_BLOCK = BLOCKS.register("rock", () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE)));

public ExampleMod() {
  BLOCKS.register(FMLJavaModLoadingContext.get().getModEventBus());
}
```

**RegisterEvent**

`RegisterEvent` 是注册对象的第二种方式。在模组构造函数之后和加载configs之前，该事件会为每个注册表激发。对象通过 `#register` 并传入注册表键、注册表对象的名称和对象本身而得以注册。还有一个 `#register` 重载，它接收一个已使用的助手来注册具有给定名称的对象。建议使用此方法以避免不必要的对象创建。

案例如下：（事件处理器已被注册到模组事件总线）

```java
@SubscribeEvent
public void register(RegisterEvent event) {
  event.register(ForgeRegistries.Keys.BLOCKS,
    helper -> {
      helper.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
      helper.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
      helper.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
      // ...
    }
  );
}
```

**未被Forge封装的注册表**

并非所有的注册表都由Forge封装。这些可以是静态注册表，如 `LootItemConditionType` 表，如 `ConfiguredFeature` 和其他一些世界生成注册表，它们通常以JSON表示。组开发者指定原版注册表所创建的 `DeferredRegister#create`，使用起来是安全的。

还有动态注册表有一个重载，允许模 `RegistryObject` 同。重要：动态注册表对象只能通过数据文件（如JSON）被注册。它们不能在代码中被注册。

```java
private static final DeferredRegister<LootItemConditionType> REGISTER = DeferredRegister.create(Registries.LOOT_CONDITION_TYPE, "examplemod");
public static final RegistryObject<LootItemConditionType> EXAMPLE_LOOT_ITEM_CONDITION_TYPE = REGISTER.register("example_loot_item_condition_type", () -> new LootItemConditionType(...));
```

**注意：*Type类**

`BlockEntityType`、`EntityType` 这些 `*Type` 类无法自行注册。相反，`*Type` 类被注册，并在前者的构造函数中被使用。例如，`BlockEntity` 具有 `BlockEntityType`，具有 `*Type$Builder`。这些 `*Type` 类是工厂，它们只是根据需要创建包含类型。

这些工厂是通过使用它们的 `*Type$Builder` 类创建的。例如：

```java
// 指的是DeferredRegister<BlockEntityType>
public static final RegistryObject<BlockEntityType<ExampleBlockEntity>> EXAMPLE_BLOCK_ENTITY = REGISTER.register(
  "example_block_entity", () -> BlockEntityType.Builder.of(ExampleBlockEntity::new, EXAMPLE_BLOCK.get()).build(null)
);
```

#### 4.1.2 引用已注册的对象

已注册的对象在创建和注册时不应存储在字段中。每当为相应的注册表触发 `RegisterEvent` 时，它们应总是新创建并注册的。这是为了允许在未来版本的Forge中动态加载和卸载模组。

已注册的对象必须始终通过 `RegistryObject` 或带有 `@ObjectHolder` 的字段引用。

**使用RegistryObjects**

一旦注册对象可用，就可以使用 `RegistryObjects` 来返回对已注册对象的引用。在为其注册表触发 `RegisterEvent` 后，它们的引用以及带有 `@ObjectHolder` 注释的字段都将被更新。

要获取 `RegistryObject`，请使用可注册对象的 `ResourceLocation` 和一个 `IForgeRegistry` 调用 `#create`。亦可使用自定义注册表，方式是向其提供注册表名称。请在需要该已注册对象时调用 `#get`。

使用 `RegistryObject` 的一个案例：

```java
public static final RegistryObject<Item> BOW = RegistryObject.create(new ResourceLocation("minecraft:bow"), ForgeRegistries.ITEMS);

// 假设'neomagicae:mana_type'是一个合法的注册表，且'neomagicae:coffeinum'是该注册表中一个合法的对象
public static final RegistryObject<ManaType> COFFEINUM = RegistryObject.create(new ResourceLocation("neomagicae", "coffeinum"), new ResourceLocation("neomagicae", "mana_type"), "neomagicae");
```

**使用@ObjectHolder**

通过使用 `@ObjectHolder` 注释类或字段，并提供足够的信息来构造 `ResourceLocation` 以标识特定注册表中的特定对象，可以将注册表中的已注册对象注入 `public static` 字段。

使用 `@ObjectHolder` 的规则如下：

- 若类被使用 `@ObjectHolder` 注释，则如果未明确定义，其值将是该类中所有字段的默认命名空间
- 若类被使用 `@Mod` 注释，则如果未明确定义，modid将是其中所有已注释字段的默认命名空间
- 该类中的一个字段将会被考虑注入，如果：
  - 其至少包含 `public static` 修饰符；
  - 该字段被 `@ObjectHolder` 注释，并且：
    - name值已被显式指明；并且
    - registry name值已被显式指明
- 如果某个字段没有相应的注册表（registry name）或名称（name），则会引发编译时异常。
- 如果最终的 `ResourceLocation` 不完整或无效（路径中存在无效字符），则会引发异常。
- 如果没有发生其他错误或异常，则该字段将被注入。
- 如果以上所有规则都不适用，则不会采取任何操作（并且日志可能会输出一条信息）

被 `@ObjectHolder` 注释的字段会在 `RegisterEvent` 为其注册表激发之后注入其值，与 `RegistryObjects` 的引用的更新同时发生。

如果要注入对象时该对象不存在于注册表中，那么日志会记录一条调试信息，并且不会注入任何值。

由于这些规则相当复杂，案例如下：

```java
class Holder {
  @ObjectHolder(registryName = "minecraft:enchantment", value = "minecraft:flame")
  public static final Enchantment flame = null;     // 注释存在。[public static]是必需的。[final]是可选的。
                                                    // Registry name已被显式指明："minecraft:enchantment"
                                                    // Resource location已被显式指明："minecraft:flame"
                                                    // 将注入：[Enchantment]注册表中的"minecraft:flame"
  
  public static final Biome ice_flat = null;        // 该字段无注释。
                                                    // 因此，该字段被忽略。
  
  @ObjectHolder("minecraft:creeper")
  public static Entity creeper = null;              // 注释存在。[public static]是必需的。
                                                    // 该字段未指明注册表。
                                                    // 因此，其将引发编译时异常。
  
  @ObjectHolder(registryName = "potion")
  public static final Potion levitation = null;     // 注释存在。[public static]是必需的。[final]是可选的。
                                                    // Registry name已被显式指明："minecraft:potion"
                                                    // Resource location未在该字段中指明
                                                    // 因此，其将引发编译时异常。
}
```

#### 4.1.3 创建自定义的Forge注册表

自定义注册表通常只是一个简单的键值映射。这是一种常见的风格；然而，它强制对存在的注册表进行严格的依赖。它还要求任何需要在端位之间同步的数据都必须手动完成。自定义Forge注册表为创建软依赖项提供了一个简单的替代方案，同时提供了更好的管理手段和端位之间的自动同步（除非另有说明）。由于这些对象也使用Forge注册表，注册也以同样的方式标准化。

自定义Forge注册表是在 `NewRegistryEvent` 的帮助下通过 `RegistryBuilder` 或 `DeferredRegister` 创建的。`RegistryBuilder` 类接受多种参数（例如注册表的名称、id范围以及注册表上发生的不同事件的各种回调）。

`NewRegistryEvent` 将被注册到 `RegistryManager`。任何新创建的注册表都应该使用其关联的注册方法来注册关联的对象。

**使用NewRegistryEvent**

`RegistryBuilder#create` 使用时，调用 将返回一个用Supplier包装的注册表。在模组事件总线处理完毕后，这个Supplier注册表就可以访问了。在 `NewRegistryEvent` 被处理完毕之前试图从Supplier获取该自定义注册表将得到 `null` 值。

**新的数据包注册表**

可以使用模组事件总线上的 `DataPackRegistryEvent$NewRegistry` 事件添加新的数据包注册表。注册表是通过 `RegistryBuilder#dataPackRegistry` 创建的，方法是传入表示注册表名称的 `ResourceKey` 和用于对JSON中的数据进行编码和解码的 `Codec`。可以提供可选的 `Codec` 来将数据包注册表同步到客户端。

**重要：** 数据包注册表不能用 `DeferredRegister` 创建。它们只能通过这个事件创建。

**使用DeferredRegister**

`DeferredRegister` 方法又是上述事件的另一个包装。一旦使用 `DeferredRegistry#makeRegistry` 重载在常量字段中创建了 `DeferredRegister`（该重载接受注册表名称和mod id），就可以通过 `DeferredRegister#makeRegistry` 构建注册表。该方法接受了由Supplier提供的包含任何其他配置的 `RegistryBuilder`。默认情况下，该方法已调用 `#setName`。由于此方法可以在任何时候返回，因此会返回由Supplier提供的 `IForgeRegistry` 版本。在激发NewRegistryEvent之前试图从Supplier获取自定义注册表将得到 `null` 值。

**重要：** 在通过将 `DeferredRegister#register` 添加到模组事件总线之前，必须调用 `#makeRegistry`。也可以使用 `#makeRegistry` 方法在 `NewRegistryEvent` 期间创建注册表。

#### 4.1.4 处理缺失的注册表条目

在某些情况下，每当更新模组或删除模组（更可能的情况）时，某些注册表对象将不复存在。可以通过第三个注册表事件指定操作来处理丢失的映射： `MissingMappingsEvent` 。

在该事件中，既可以通过给定注册表项和mod id的 `#getMappings` 获取丢失映射的列表，也可以通过给定注册项的 `#getAllMappings` 获取所有映射。

**重要：** `MissingMappingsEvent` 在Forge事件总线上触发。

对于每个映射（`Mapping`），可以选择四种映射类型之一来处理丢失的条目：

| 操作 | 描述 |
|------|------|
| IGNORE | 忽略丢失的条目并丢弃映射。 |
| WARN | 在日志中生成警告。 |
| FAIL | 阻止世界加载。 |
| REMAP | 将条目重新映射到已注册的非null对象。 |

如果未指定任何操作，则默认操作为通过通知用户丢失的条目以及用户是否仍要加载世界。除了重新映射之外的所有操作都将防止任何其他注册表对象取代现有id，以防止相关条目被添加回游戏中。

### 4.2 Minecraft中的端位

为Minecraft开发模组时需要理解的一个非常重要的概念是两个端位：客户端和服务端。关于端位有很多常见的误解和错误，这可能会导致bug，而这些bug虽然可能不会破坏游戏，但是一定能够产生意想不到的、往往不可预测的影响。

#### 4.2.1 不同种类的端位

当我们说"客户端"或"服务端"时，我们通常会对所谈论的游戏的哪个部分有相当直观的理解。毕竟，客户端是用户交互的对象，服务端是用户连接多人游戏的地方。很简单，对吧？

而事实是，即使有两个这样的术语，也可能存在一些歧义。在这里，我们消除了"客户端"和"服务端"的四个可能含义的歧义：

- **物理客户端** - 无论何时从启动器启动Minecraft，物理客户端都是运行的整个程序。在游戏的图形化、可交互的生命周期中运行的所有线程、进程和服务都是物理客户端的一部分。
- **物理服务端** - 通常被称为dedicated服务端，物理服务端是在你启动任何类型的 `minecraft_server.jar` 时运行的整个程序，该程序不会显示可用于游玩的GUI。
- **逻辑服务端** - 逻辑服务端运行游戏逻辑：生物的生成，天气，物品栏、生命值、AI的更新以及其他所有游戏机制。逻辑服务端存在于物理服务端中，但它也可以与逻辑客户端一起在物理客户端中运行，作为一个单机世界。逻辑服务端始终在名为 `Server Thread` 的线程中运行。
- **逻辑客户端** - 逻辑客户端接受玩家的输入并将其转发到逻辑服务端。此外，它还从逻辑服务端接收信息，并以图形方式呈现给玩家。逻辑客户端在 `Render Thread` 中运行，但通常会派生出几个其他线程来处理音频和方块渲染批处理等事务。

在MinecraftForge代码库中，物理端由一个名为 `Dist` 的枚举表示，而逻辑端则由一个名为 `LogicalSide` 的枚举表示。

#### 4.2.2 进行特定端位的操作

**Level#isClientSide** 这种boolean检查将是你最常用的检查端位的方法。在 `Level` 对象上查询此字段将建立该Level所属的逻辑端。也就是说，如果此字段为 `true`，则该Level当前正在逻辑客户端上运行。如果该字段为 `false`，则表示该Level正在逻辑服务端上运行。因此，物理服务端在该字段中总是包含 `false`，但我们不能假设 `false` 意味着物理服务端，因为该字段对于物理客户端（换句话说，单机世界）内的逻辑服务端也可能是 `false`。

当你需要确定是否应该运行游戏逻辑和其他机制时，请使用这种检查方式。例如，如果你想在玩家每次点击你的方块时伤害他们，或者让你的机器将泥土处理成钻石，你只有在确保 `#isClientSide` 为 `false` 后才能这样做。在最好的情况下，将游戏逻辑应用于逻辑客户端可能会导致去同步（幽灵实体、去同步状态等），在最坏的情况下会导致崩溃。

这种检查应该成为习惯。你很少需要除 `Level#isClientSide` 以外的其他方式来确定端位和调整行为。

**DistExecutor**

考虑到客户端和服务端的模组都使用同一个"通用"的jar，以及将物理端分离为两个jar，我们想到了一个重要的问题：我们该如何使用只存在于某一个物理端的代码？

`net.minecraft.client` 下的所有代码仅存在于物理客户端上。如果你编写的任何类以任何方式引用了上述包下的类型名称，那么当在不存在这些类型名称的环境中加载相应的类时，它们将导致游戏崩溃。初学者的一个非常常见的错误是在他们的方块或方块实体类中调用 `Minecraft.getInstance().<doStuff>()`，一旦加载这些类，就会导致任何物理服务端崩溃。

我们如何解决这个问题？幸运的是，FML有一个 `DistExecutor` ，它提供了各种方法来在不同的物理端运行不同的方法，或者只在某一物理端运行单个方法。

**注意：** `Dist.CLIENT` 对FML基于物理端进行检查的理解尤为重要。单机世界（包含逻辑服务端+物理客户端的逻辑客户端）将始终使用 `Dist.CLIENT` ！

`DistExecutor` 的工作原理是接收所提供的执行方法的Supplier，通过利用JVM指令 `invokedynamic` 有效地防止类加载。被执行的方法应该是静态的并且在不同的类中。此外，如果这个静态方法没有参数，则应使用该方法的引用，而不是一个执行方法的Supplier。

`DistExecutor` 中有两个主要方法：`#runWhenOn` 和 `#callWhenOn` 。`#safe*` 方法接受的参数为将被执行的方法和该方法应该运行的物理端，该方法（将被执行的方法）既可有返回值，也可无返回值。

这两种方法被进一步细分为 `#safe*` 和 `#unsafe*` 变体。安全（safe）和不安全（unsafe）这两种命名方式其实差强人意。主要区别在于，在开发环境中，`#safe*` 方法将验证所提供的执行方法是否是返回的对另一个类的方法引用的lambda，否则将抛出错误。在产品环境中，`#safe*` 和 `#unsafe*` 在功能上是相同的。

```java
// 在一个客户端类中：ExampleClass
public static void unsafeRunMethodExample(Object param1, Object param2) {
  // ...
}
public static Object safeCallMethodExample() {
  // ...
}
// 在一个通用类中
DistExecutor.unsafeRunWhenOn(Dist.CLIENT, () -> ExampleClass.unsafeRunMethodMethodExample(var1, var2));
DistExecutor.safeCallWhenOn(Dist.CLIENT, () -> ExampleClass::safeCallMethodExample);
```

**警告：** 由于在Java 9+中的 `invokedynamic` 工作方式发生了变化，方法的所有 `#safe*` 变体都会在开发环境中抛出封装在 `BootstrapMethodError` 中的原始异常。应该使用 `#unsafe*` 变体或对 `FMLEnvironment#dist` 的检查作为替代。

**线程组**

如果 `Thread.currentThread().getThreadGroup() == SidedThreadGroups.SERVER` 为true，则很可能当前线程位于逻辑服务端上。否则，它很可能在逻辑客户端上。当你无法访问 `Level` 对象以检查 `isClientSide` 时，这对于检索逻辑端非常有用。它通过查看当前运行的线程组来猜测你处于哪个逻辑端。因为这是一种猜测，所以只有在用尽其他选项时才应该使用这种方法。在几乎所有情况下，你应该优先检查 `Level#isClientSide`。

**FMLEnvironment#dist**

`FMLEnvironment#dist` 表示当前你的代码正在运行的物理端。由于它是在启动时确定的，所以它不依赖于猜测来返回结果。然而，在这方面的用例并不是很多。

使用 `@OnlyIn(Dist)` 注释对方法或字段进行注释会向加载器表明，应该将相应的成员在非指定的物理端中从定义里完全剥离。通常，这些只有在浏览反编译的Minecraft代码时才能看到，暗示着Mojang混淆器删除了的方法。没有理由直接使用此注释。请改用 `DistExecutor` 或检查 `FMLEnvironment#dist`。

#### 4.2.3 常见错误

**跨逻辑端访问**

每当你想将信息从一个逻辑端发送到另一个逻辑端时，必须始终使用网络数据包。即便在单机场景中，将数据从逻辑服务端直接传输到逻辑客户端是非常诱人的。

实际上，这通常是通过静态字段无意中完成的。由于在单机场景中，逻辑客户端和逻辑服务端共享相同的JVM，因此向静态字段写入和从静态字段读取的线程都会导致各种竞争条件以及与线程相关的经典问题。

通过从逻辑服务端上运行或可以运行的公共代码访问仅物理客户端的类（如 `Minecraft`），也可能会明确地犯下这个错误。对于在物理客户端中调试的初学者来说，这个错误很容易被忽略。代码会在那里工作，但它会立即在物理服务端上崩溃。

#### 4.2.4 编写单端模组

在最近的版本中，Minecraft Forge从mods.toml中删除了一个"sidedness"属性。这意味着无论你的模组是加载在物理客户端还是物理服务端上，它们都可以工作。因此，对于单端模组，你通常会在 `DistExecutor#safeRunWhenOn` 或 `DistExecutor#unsafeRunWhen` 中注册事件处理程序，而不是直接调用模组构造函数中的相关注册方法。基本上，如果你的模组加载在错误的一端，它应该什么都不做，不监听任何事件，等等。单端模组本质上不应该注册方块、物品……因为它们也需要在另一端可用。

此外，如果你的模组是单端的，它通常不会禁止用户加入缺乏该模组的服务端。因此，你应该将mods.toml中的 `displayTest` 属性设置为任何必要的值。

```toml
[[mods]]
  # ...
  # MATCH_VERSION表示如果客户端和服务端上的版本不同，你的模组将导致红X。这是默认行为，如果你的模组有服务端和客户端元素，这就是你应该使用的。
  # IGNORE_SERVER_VERSION表示如果你的模组出现在服务端上但不在客户端上，它不会导致红X。如果你的模组是一个仅限服务端的模组，这就是你应该使用的。
  # IGNORE_ALL_VERSION表示如果你的模组出现在客户端或服务端上，它不会导致红X。这是一个特殊情况，只有当你的模组没有服务端成分时才应该使用。
  # NONE表示没有在你的模组上设置显示检测。你需要自己完成此操作，有关详细信息，请参阅IExtensionPoint.DisplayTest。你可以使用此值定义任何你想要的方案。
  # 重要提示：这不是关于你的模组加载在哪个环境（客户端或dedicated服务端）上的说明。你的模组必然会加载（也许什么都不做！）。
  displayTest="IGNORE_ALL_VERSION" # 如果未指定任何内容，则MATCH_VERSION为默认值 (#可选)
```

如果要使用自定义显示检测，则 `displayTest` 选项应设置为 `NONE`，并且应注册 `IExtensionPoint$displayTest` 扩展：

```java
//确保另一个网络端上缺失的模组不会导致客户端将服务端显示为不兼容
ModLoadingContext.get().registerExtensionPoint(IExtensionPoint.DisplayTest.class, () -> new IExtensionPoint.DisplayTest(() -> NetworkConstants.IGNORESERVERONLY, (a, b) -> true));
```

这告诉客户端它应该忽略服务端版本不存在，服务端不应该告诉客户端这个模组应该存在。因此，这个代码片段适用于仅客户端和服务端的模组。

### 4.3 事件

Forge使用事件总线以允许模组拦截来自各种原版和模组行为的事件。例如：右键单击原版的木棍时，一个事件可被触发以用于执行操作。

用于大多数事件的主事件总线位于 `MinecraftForge#EVENT_BUS`。在 `FMLJavaModLoadingContext#getModEventBus` 中还有另一个用于特定于模组事件的事件总线，你应该只在特定情况下使用它。关于该事件总线的更多信息可以在下面找到。

每个事件都在其中一条总线上触发：大多数事件在主要的Forge事件总线上触发，但也有一些在特定于模组的事件总线上触发。

事件处理器是某个已注册到事件总线的方法。

#### 4.3.1 创建一个事件处理器

事件处理器方法只有一个参数，不返回结果。该方法可以是静态的，也可以是实例化的，具体取决于实现。

事件处理器可以使用 `IEventBus#addListener` 直接注册，或对于泛型事件（`GenericEvent<T>` 的子类）使用 `IEventBus#addGenericListener` 直接注册。任一监听器注册方法接收表示方法引用的Consumer。泛型事件处理器还需要指定泛型的具体类型。事件处理器必须在模组主类的构造函数中注册。

```java
// 在模组主类ExampleMod中
// 该事件位于模组事件总线上
private void modEventHandler(RegisterEvent event) {
    // Do things here
}

// 该事件位于Forge事件总线上
private static void forgeEventHandler(AttachCapabilitiesEvent<Entity> event) {
    // ...
}

// 在模组构造函数内
modEventBus.addListener(this::modEventHandler);
forgeEventBus.addGenericListener(Entity.class, ExampleMod::forgeEventHandler);
```

**实例化的已注释的事件处理器**

该事件处理器监听 `EntityItemPickupEvent`，正如名称所述，每当 `Entity` 拾取一件物品时，该事件就会被发布到事件总线。

```java
public class MyForgeEventHandler {
    @SubscribeEvent
    public void pickupItem(EntityItemPickupEvent event) {
        System.out.println("Item picked up!");
    }
}
```

要注册这个事件处理器，请使用 `MinecraftForge.EVENT_BUS.register(...)` 并向其传递事件处理器所在类的一个实例。如果要将此处理器注册到特定于模组的事件总线，则应使用 `FMLJavaModLoadingContext.get().getModEventBus().register(...)`

**静态的已注释的事件处理器**

事件处理器也可以是静态的。处理事件的方法仍然使用 `@SubscribeEvent` 进行注释。与实例化的事件处理器的唯一区别是它也被标记为 `static`。要注册静态的事件处理器，传入类的实例是不行的。必须传入类本身。例如：

```java
public class MyStaticForgeEventHandler {
    @SubscribeEvent
    public static void arrowNocked(ArrowNockEvent event) {
        System.out.println("Arrow nocked!");
    }
}
```

其必须像这样注册：`MinecraftForge.EVENT_BUS.register(MyStaticForgeEventHandler.class)`

**自动注册静态的事件处理器**

`@Mod` 类可以使用 `@Mod$EventBusSubscriber` 进行注释。当 `@Mod` 类本身被构造时，这样的类会自动注册到 `MinecraftForge#EVENT_BUS`。这实质上相当于在 `@Mod` 类的构造函数的末尾添加 `MinecraftForge.EVENT_BUS.register(AnnotatedClass.class);`

你可以向 `@Mod$EventBusSubscriber` 注释指明所要监听的总线。建议你也指定mod id，因为注释在处理的过程中可能无法确定它，以及你所注册的总线，因为它作为一个保障可以确保你所注册的是正确的总线。你还可以指定要加载此事件处理器的 `Dist` 或物理端。这可用于保证不在dedicated服务器上加载客户端特定的事件处理器。

下面是静态事件处理器监听 `RenderLevelStageEvent` 的示例，该处理器将仅在客户端上调用：

```java
@Mod.EventBusSubscriber(modid = "mymod", bus = Bus.FORGE, value = Dist.CLIENT)
public class MyStaticClientOnlyEventHandler {
    @SubscribeEvent
    public static void drawLast(RenderLevelStageEvent event) {
        System.out.println("Drawing!");
    }
}
```

**注意：** 这不会注册类的实例；它注册类本身（即事件处理方法必须是静态的）。

#### 4.3.2 事件的取消

如果一个事件可以被取消，它将带有 `@Cancelable` 注释，并且 `Event#isCancelable()` 方法将返回 `true`。可取消事件的取消状态可以通过调用 `Event#setCanceled(boolean canceled)` 来修改，其中传递布尔值 `true` 意为取消事件，传递布尔值 `false` 被解释为"不取消"事件。但是，如果无法取消事件（如 `Event#isCancelable()` 所定义），则无论传递的布尔值如何，都将抛出 `UnsupportedOperationException`，因为不可取消事件事件的取消状态被认为是不可变的。

**重要：** 并非所有事件都可以取消！试图取消不可取消的事件将导致抛出未经检查的 `UnsupportedOperationException` 可能将导致游戏崩溃！在尝试取消某个事件之前，请始终使用 `Event#isCancelable()` 检查该事件是否可以取消！

#### 4.3.3 事件的结果

某些事件具有 `Event$Result`。结果可以是以下三种情况之一：`DENY`（停止事件）、`DEFAULT`（使用默认行为）和 `ALLOW`（强制执行操作，而不管最初是否执行）。事件的结果可以通过调用 `#setResult` 并用一个 `Event$Result` 来设置。并非所有事件都有结果；带有结果的事件将用 `@HasResult` 进行注释。

**重要：** 不同的事件可能以不同的方式处理结果，在使用事件的结果之前请参阅事件的JavaDoc。

#### 4.3.4 事件处理优先级

事件处理方法（用 `@SubscribeEvent` 标记）具有优先级。你可以通过设置注释的 `priority` 值来安排事件处理方法的优先级。优先级可以是 `EventPriority` 枚举的任何值（`HIGHEST`、`HIGH`、`NORMAL`、`LOW` 和 `LOWEST`）。优先级为 `HIGHEST` 的事件处理器首先执行，然后按降序执行，直到最后执行的 `LOWEST` 为止。

#### 4.3.5 子事件

许多事件本身都有不同的变体。这些变体事件可以不尽相同，但都基于一个共同的因素（例如 `PlayerEvent`），也可以是具有多个阶段的事件（例如 `PotionBrewEvent`）。请注意，如果你监听父类事件，你的事件处理方法也将收到其所有子类事件。

#### 4.3.6 模组事件总线

模组事件总线主要用于监听模组应该初始化的生命周期事件。模组总线上的每个事件类型都需要实现 `IModBusEvent`。其中许多事件也是并行运行的（多线程——译者注），因此多个模组可以同时被初始化。这意味着你不能在这些事件中直接执行来自其他模组的代码。为此，请使用 `InterModComms` 系统。

以下是在模组事件总线上的模组初始化期间调用的四个最常用的生命周期事件：

- `FMLCommonSetupEvent`
- `FMLClientSetupEvent` 和 `FMLDedicatedServerSetupEvent`
- `InterModEnqueueEvent`
- `InterModProcessEvent`

**注意：** `FMLClientSetupEvent` 和 `FMLDedicatedServerSetupEvent` 仅在各自的分发版本（物理端——译者注）上调用。

这四个生命周期事件都是并行运行的，因为它们都是 `ParallelDispatchEvent` 的子类。如果你想在任何 `ParallelDispatchEvent` 期间在主线程上运行运行代码，可以使用 `#enqueueWork` 来执行此操作。

除了生命周期事件之外，还有一些在模组事件总线上触发的杂项事件，你可以在其中注册、设置或初始化各种事情。与生命周期事件相比，这些事件中的大多数不是并行运行的。举几个例子：

- `RegisterColorHandlersEvent`
- `ModelEvent$BakingCompleted`
- `TextureStitchEvent`
- `RegisterEvent`

一个很好的经验法则是：当事件应该在模组初始化期间处理时，就在模组事件总线上触发事件。

### 4.4 模组生命周期

在模组加载过程中，各种生命周期事件在模组特定的事件总线上触发。在这些事件期间许多操作被执行，例如注册对象、准备数据生成或与其他模组通信。

事件监听器应使用 `@EventBusSubscriber(bus = Bus.MOD)` 或在模组构造函数中被注册：

```java
@Mod.EventBusSubscriber(modid = "mymod", bus = Mod.EventBusSubscriber.Bus.MOD)
public class MyModEventSubscriber {
  @SubscribeEvent
  static void onCommonSetup(FMLCommonSetupEvent event) { ... }
}

@Mod("mymod")
public class MyMod {
  public MyMod() {
    FMLModLoadingContext.get().getModEventBus().addListener(this::onCommonSetup);
  } 
  
  private void onCommonSetup(FMLCommonSetupEvent event) { ... }
}
```

**警告：** 大多数生命周期事件都是并行触发的（多线程——译者注）：所有模组都将同时接收相同的事件。模组必须注意线程安全，就像调用其他模组的API或访问原版系统一样。延迟代码，以便稍后通过 `ParallelDispatchEvent#enqueueWork` 执行。

#### 4.4.1 注册表事件

注册表事件是在模组实例构造之后激发的。注册表事件有三种：`RegisterEvent`、`NewRegistryEvent` 和 `DataPackRegistryEvent$NewRegistry`。这些事件在模组加载期间同步触发。

`NewRegistryEvent` 允许模组开发者使用 `RegistryBuilder` 类注册自己的自定义注册表。`DataPackRegistryEvent$NewRegistry` 允许模组开发者通过提供 `Codec` 对JSON中的对象进行编码和解码来注册自定义数据包注册表。

`RegisterEvent` 用于将对象注册到注册表中。每个注册表都会触发该事件。

#### 4.4.2 数据生成

如果游戏被设置为运行数据生成器，那么 `GatherDataEvent` 将是最后一个触发的事件。此事件用于将模组的数据提供者注册到其关联的数据生成器。此事件也是同步触发的。

#### 4.4.3 通用初始化

`FMLCommonSetupEvent` 用于物理客户端和物理服务端通用的操作，例如注册Capability。

#### 4.4.4 单端初始化

单端初始化事件在其各自的物理端触发：物理客户端上触发 `FMLClientSetupEvent`，dedicated服务端上触发 `FMLDedicatedServerSetupEvent`。这就是应该进行各物理端特定的初始化的地方，例如注册客户端键盘绑定。

#### 4.4.5 InterModComms

这是模组间可以相互通信以实现跨模组兼容性的地方。有两个相关的事件：`InterModEnqueueEvent` 和 `InterModProcessEvent`。

`InterModComms` 是负责为模组间交换消息的类。其方法在生命周期事件期间可以安全调用，因为它有 `ConcurrentMap` 支持。

在 `InterModEnqueueEvent` 期间，使用 `InterModComms#sendTo` 以向不同的模组发送消息。这些方法接收所发消息的目的模组的mod id、与消息数据相关的键以及持有消息数据的Supplier。此外，还可以指定消息的发送者，但默认情况下，它将是调用者的mod id。

之后在 `InterModProcessEvent` 期间，使用 `InterModComms#getMessages` 获取所有接收到的消息的Stream。提供的mod id几乎总是先前调用发送消息方法的模组的mod id。此外，可以指定一个Predicate来对消息键进行过滤。这将返回一个带有 `IMCMessages` 的Stream，其中包含数据的发送方、数据的接收方、数据键以及所提供的数据本身。

**注意：** 还有另外两个生命周期事件：`FMLConstructModEvent`，在模组实例构造之后但在 `RegisterEvent` 事件之前直接触发；`FMLLoadCompleteEvent`，在 `InterModComms` 之后触发，用于模组加载过程完成时。

### 4.5 资源

资源是游戏使用的额外数据，存储在数据文件中，而不是代码中。Minecraft有两个主要的资源系统：一个在逻辑客户端上，用于模型、纹理和本地化等视觉效果，称为 **assets**（资源），另一个在用于游戏的逻辑服务端上，如配方和战利品表，称为 **data**（数据）。资源包（Resource pack）控制前者，而数据包（Datapack）控制后者。

在默认的模组开发工具包中，assets和data目录位于项目的 `src/main/resources` 目录下。

如果启用了多个资源包或数据包，它们会被合并。通常，堆栈顶部包中的文件会覆盖下面的文件；但是，对于某些文件，例如本地化文件和标签，数据实际上是按内容合并的。模组在其 `resources` 目录中定义资源和数据包，但它们被视为"模组资源"包的子集。不能禁用模组资源包，但它们可以被其他资源包覆盖。可以使用原版的 `/datapack` 命令禁用模组数据包。

所有资源都应该有遵循蛇形命名法（Snake Case）的路径和文件名（小写，使用"_"表示单词边界），这在1.11及更高版本中得到了强制执行。

#### 4.5.1 ResourceLocation

Minecraft使用 `ResourceLocation` 识别资源。`ResourceLocation` 包含两部分：命名空间和路径。它通常指向 `assets/<namespace>/<ctx>/<path>` 处的资源，其中 `ctx` 是特定于上下文的路径片段，取决于 `ResourceLocation` 的使用方式。当从字符串中写入/读取 `ResourceLocation` 时，它被视为 `<namespace>:<path>` 。如果省略了 `<namespace>`:，那么当字符串被读取为 `ResourceLocation` 时，命名空间将始终默认为 `minecraft` 。

模组应该将其资源放入与其mod id同名的命名空间中（例如，id为 `examplemod` 的模组应该分别将其资源放置在 `assets/examplemod` 和 `data/examplemod` 中，指向这些文件的 `ResourceLocation` 看起来像 `examplemod:<path>` 。）。这不是要求，并且在某些情况下，可能希望使用不同的（或者甚至不止一个）命名空间。

`ResourceLocation` 也在资源系统之外使用，因为它们恰好是唯一标识对象（例如[注册表][]）的好方法。

### 4.6 国际化与本地化

国际化（Internationalization），简称I18n，是一种设计代码的方式，以便不需要进行任何更改即可适应各种语言。本地化（Localization）是使显示的文本适应用户语言的过程。

I18n是使用 **翻译键** 来实现的。翻译键是一个字符串，用于指定一段不使用特定语言的可显示文本。例如，`block.minecraft.dirt` 是引用泥土方块名称的翻译键。这样，可显示文本可被引用，而不必考虑特定的语言。这些代码不需要任何更改即可适应新的语言。

本地化将在游戏的语言设置中进行。在Minecraft客户端中，语言环境由语言设置指定。在dedicated服务端上，唯一支持的语言设置是 `en_us` 。可用语言地区的列表可以在Minecraft Wiki上找到。

#### 4.6.1 语言文件

语言文件由 `assets/[namespace]/lang/[locale].json` 定位（例如，`examplemod` 提供的所有美国英语翻译都在 `assets/examplemod/lang/en_us.json` 中）。文件格式只是从翻译键到值的json映射。文件必须使用UTF-8编码。可以使用转换器将旧的.lang文件转换为json。

```json
{
  "item.examplemod.example_item": "Example Item Name",
  "block.examplemod.example_block": "Example Block Name",
  "commands.examplemod.examplecommand.error": "Example Command Errored!"
}
```

#### 4.6.2 对方块和物品的用法

Block、Item和其他一些Minecraft类都内置了用于显示其名称的翻译键。这些转换键是通过重写 `#getDescriptionId` 的。Item还具有 `#getDescriptionId(ItemStack)` ，重写该方法后可以根据所给ItemStack NBT提供不同的翻译键。

默认情况下，`BlockItem` 将返回以 `block.` 或 `item.` 为前缀的方块或物品的注册表名称，冒号由句点代替。默认情况下，`BlockItem` 覆盖此方法以获取其对应的 `Block` 的翻译密钥。例如，ID为 `examplemod:example_item` 的物品实际上需要语言文件中的以下行：

```json
{
  "item.examplemod.example_item": "Example Item Name"
}
```

**注意：** 翻译键的唯一目的是国际化。不要把它们用于代码的逻辑处理部分。请改用注册表名称。

#### 4.6.3 本地化相关方法

**net.minecraft.client.resources.language.I18n**（仅客户端）

这个I18n类仅在Minecraft客户端上有效！它旨在由仅在客户端上运行的代码使用。尝试在服务端上使用它会引发异常并崩溃。

- `get(String, Object...)` 使用格式采取客户端的语言设置进行本地化。第一个参数是翻译键，其余的是 `String.format(String, Object...)` 的格式化参数。

**TranslatableContents**

`TranslatableContents` 是一个经过惰性的本地化和格式化的 `ComponentContents` 。它在向玩家发送消息时非常有用，因为它将在玩家自己的语言设置中自动本地化。

`TranslatableContents(String, Object...)` 构造函数的第一个参数是翻译键，其余参数用于格式化。唯一支持的格式说明符是 `%s` 和 `%1$s`、`%2$s`、`%3$s` 等。格式化参数可能是 `Component` 将插入到格式化结果文本中并保留其所有属性的。

通过传入 `TranslatableContents` 的参数，可以使用 `MutableComponent#create` 创建 `MutableComponent` 。它也可以使用 `Component#translatable` 通过传入 `ComponentContents` 本身来创建。

**TextComponentHelper**

- `createComponentTranslation(CommandSource, String, Object...)` 根据接收者创建本地化并格式化的 `MutableComponent` 。如果接收者是一个原版客户端，那么本地化和格式化就很容易完成。如果没有，本地化和格式化将使用包含 `TranslatableContents` 的 `MutableComponent` 惰性地进行。只有当服务端允许原版客户端连接时，这才有用。