---
title: Forge 1.20.1开发文档-10 Capability系统
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 12
---

> 本文档来源于Forge官方中文文档，侵删

## 10.1 Capability系统

Capability允许以动态和灵活的方式公开Capability，而不必直接实现许多接口。

一般来说，每个Capability都以接口的形式提供了一个Capability。Forge为`BlockEntity`、`Entity`、`ItemStack`、`Level`和`LevelChunk`添加了Capability支持，这些Capability可以通过事件附加它们，也可以通过重写你自己的对象实现中的Capability方法来公开。这将在接下来的章节中进行更详细的解释。

### 10.1.1 Forge提供的Capability

Forge提供三种Capability：`IItemHandler`、`IFluidHandler`和`IEnergyStorage`。

- `IItemHandler`公开了一个用于处理物品栏Slot的接口。它可以应用于`BlockEntity`（箱子、机器等）、`Entity`（额外的玩家Slot、生物/生物物品栏/袋子）或`ItemStack`（便携式背包等）。它用一个自动化友好的系统取代了旧的`WorldlyContainer`和`Container`。
- `IFluidHandler`公开了一个用于处理流体物品栏的接口。它也可以应用于`BlockEntitiy`、`Entity`或`ItemStack`。
- `IEnergyStorage`公开了一个用于处理能源容器的接口。它可以应用于`BlockEntity`、`Entity`或`ItemStack`。它基于TeamCoFH的RedstoneFlux API。

### 10.1.2 使用现存的Capability

如前所述，`BlockEntity`、`Entity`和`ItemStack`通过`ICapabilityProvider`接口实现了Capability提供者Capability。此接口添加了方法`#getCapability`，该方法可用于查询相关提供者对象中存在的Capability。

为了获得一个Capability，你需要通过它的唯一实例来引用它。在`IItemHandler`的情况下，此Capability主要存储在`ForgeCapabilities#ITEM_HANDLER`中，但也可以使用`CapabilityManager#get`获取其他实例引用。

```java
public static final Capability<IItemHandler> ITEM_HANDLER = CapabilityManager.get(new CapabilityToken<>(){});
```

当被调用时，`CapabilityManager#get`为你的相关类型提供一个非null的Capability。匿名的`CapabilityToken`允许Forge保持软依赖系统，同时仍然拥有获得正确Capability所需的泛型信息。

**重要**：即使你在任何时候都可以使用非null的Capability，但这并不意味着该Capability本身是可用的或已注册的。这可以通过`Capability#isRegistered`进行检查。

`#getCapability`方法有另一个参数，类型为`Direction`，可用于请求那一面的特定实例。如果传递`null`，则可以假设请求来自方块内，或者来自某个侧面没有意义的地方，例如不同的维度。在这种情况下，将请求一个不关侧面的一个通用的Capability实例。

`#getCapability`的返回类型将对应于传递给方法的Capability中声明的类型的`LazyOptional<IItemHandler>`。对于物品处理器Capability，其为`LazyOptional<IItemHandler>`。如果该Capability不适用于特定的提供者，它将返回一个空的`LazyOptional`。

### 10.1.3 公开一个Capability

为了公开一个Capability，你首先需要一个底层Capability类型的实例。请注意，你应该为每个保有该Capability的对象分配一个单独的实例，因为该Capability很可能与所包含的对象绑定。

在`IItemHandler`的情况下，默认实现使用`ItemStackHandler`类来指定多个Slot，该类在构造函数中有一个可选参数。然而，应避免依赖这些默认实现的存在，因为Capability系统的目的是防止在不存在Capability的情况下出现加载错误，因此如果Capability已注册，则应在检查测试之后对实例化进行保护（请参阅上一节中关于`CapabilityManager#get`的备注）。

一旦你拥有了自己的Capability接口实例，你将希望通知Capability系统的用户你公开了此Capability，并提供接口引用的`LazyOptional`。这是通过重写`#getCapability`方法来完成的，并将Capability实例与你要公开的Capability进行比较。如果side你的机器根据被查询的一侧有不同的Slot，你可以使用`side`参数进行测试。对于实体和物品栈，此参数可以忽略，但仍然可以将侧面作为上下文，例如玩家上的不同护甲Slot（`Direction#UP`暴露玩家的头盔Slot），或物品栏中的周围方块（`Direction#WEST`暴露熔炉的输入Slot）。不要忘记回到`super`，否则现有的附加Capability将停止工作。

在提供者生命周期结束时，必须通过`LazyOptional#invalidate`使Capability失效。对于拥有`LazyOptional`的BlockEntitiy和Entity，可以在`#invalidateCaps`内失效。对于非拥有者提供者，提供失效过程的Runnable应传递到`AttachCapabilitiesEvent#addListener`中。

```java
// 在你BlockEntity子类中的某处
LazyOptional<IItemHandler> inventoryHandlerLazyOptional;
// 被提供的对象（例如：() -> inventoryHandler）
// 确保惰性，因为初始化只应在需要时发生
inventoryHandlerLazyOptional = LazyOptional.of(inventoryHandlerSupplier);

@Override
public <T> LazyOptional<T> getCapability(Capability<T> cap, Direction side) {
  if (cap == ForgeCapabilities.ITEM_HANDLER) {
    return inventoryHandlerLazyOptional.cast();
  }
  return super.getCapability(cap, side);
}

@Override
public void invalidateCaps() {
  super.invalidateCaps();
  inventoryHandlerLazyOptional.invalidate();
}
```

**提示**：如果给定对象上只公开了一个Capability，则可以使用`Capability#orEmpty`作为if/else语句的替代语句。

```java
@Override
public <T> LazyOptional<T> getCapability(Capability<T> cap, Direction side) {
  return ForgeCapabilities.ITEM_HANDLER.orEmpty(cap, inventoryHandlerLazyOptional);
}
```

`Item`是一种特殊情况，因为它们的Capability提供者存储在`ItemStack`上。相反的是，应该通过`Item#initCapabilities`附加提供者。其应该在物品栈的生命周期中保持你的Capability。

强烈建议在代码中使用直接检查来测试Capability，而不是试图依赖Map或其他数据结构，因为每个游戏刻都可以由许多对象进行Capability测试，并且它们需要尽可能快，以避免减慢游戏速度。

### 10.1.4 Capability的附加

如前所述，可以使用`AttachCapabilitiesEvent`将Capability附加到现有`Level`、`Entity`和`ItemStack`提供者。

`AttachCapabilitiesEvent`有5个有效的泛型类型，提供以下事件：

- `AttachCapabilitiesEvent<Entity>`: 仅为实体触发。
- `AttachCapabilitiesEvent<BlockEntity>`: 仅为方块实体触发。
- `AttachCapabilitiesEvent<ItemStack>`: 仅为物品栈触发。
- `AttachCapabilitiesEvent<Level>`: 仅为存档触发。
- `AttachCapabilitiesEvent<LevelChunk>`: 仅为存档区块触发。

泛型类型不能比上述类型更具体。例如：如果要将Capability附加到`Player`，则必须订阅`AttachCapabilitiesEvent<Entity>`，然后在附加Capability之前确定所提供的对象是`Player`。

在所有情况下，该事件都有一个方法`#addCapability`，可用于将Capability附加到目标对象。不是将Capability本身添加到列表中，而是添加Capability提供者`ICapabilityProvider`，这些提供者有机会仅从某些面返回Capability。虽然提供者只需要实现`ICapabilityProvider`，但如果该Capability需要持久存储数据，则可以实现`ICapabilitySerializable<T extends Tag>`，该`Capability`除了返回Capability外，还将提供标签保存/加载Capability。

有关如何实现`ICapabilityProvider`的信息，请参阅公开一个Capability部分。

### 10.1.5 创建你自己的Capability

Capability可通过以下两种方式之一被注册：`RegisterCapabilitiesEvent`或`@AutoRegisterCapability`。

`RegisterCapabilitiesEvent`：通过向方法`RegisterCapabilitiesEvent#register`提供Capability类型的类，可以使用`RegisterCapabilitiesEvent`注册Capability。该事件在模组事件总线上被处理。

```java
@SubscribeEvent
public void registerCaps(RegisterCapabilitiesEvent event) {
  event.register(IExampleCapability.class);
}
```

`@AutoRegisterCapability`：Capability也可通过使用`@AutoRegisterCapability`注释以被注册。

```java
@AutoRegisterCapability
public interface IExampleCapability {
  // ...
}
```

### 10.1.6 LevelChunk和BlockEntity的Capability的持久化

与`Level`、`Entity`和`ItemStack`不同，`LevelChunk`和`BlockEntity`只有在标记为脏时才会写入磁盘。因此，LevelChunk或BlockEntity具有持久状态的Capability实现应确保无论何时其状态发生变化，其所有者都被标记为脏。

`ItemStackHandler`通常用于BlockEntity中的物品栏，它有一个可重写的方法`void onContentsChanged(int slot)`，用于将`BlockEntity`标记为脏。

```java
public class MyBlockEntity extends BlockEntity {
  private final IItemHandler inventory = new ItemStackHandler(...) {
    @Override
    protected void onContentsChanged(int slot) {
      super.onContentsChanged(slot);
      setChanged();
    }
  }
  // ...
}
```

### 10.1.7 向客户端同步数据

默认情况下，Capability数据不会发送到客户端。为了改变这一点，模组必须使用数据包管理自己的同步代码。

在三种不同的情况下，你可能希望发送同步数据包，所有这些情况都是可选的：

1. 当实体在存档中生成或放置方块时，你可能希望与客户端共享初始化指定的值。
2. 当存储的数据发生更改时，你可能需要通知部分或全部正在监视的客户端。
3. 当新客户端开始查看实体或方块时，你可能希望将现有数据通知它。

有关实现网络数据包的更多信息，请参阅网络页面。

### 10.1.8 在玩家死亡时的持久化

默认情况下，Capability数据不会在死亡时持续存在。为了改变这一点，在重生过程中克隆玩家实体时，必须手动复制数据。

这可以通过`PlayerEvent$Clone`完成，方法是从原始实体读取数据并将其分配给新实体。在这种情况下，`#isWasDeath`方法可以用于区分死后重生和从末地返回。这一点很重要，因为从末地返回时数据已经存在，因此在这种情况下必须注意不要重复值。

## 10.2 Saved Data

Saved Data（SD）系统是存档Capability功能的替代方案，可以按存档附加数据。

### 10.2.1 声明

每个SD实现都必须继承`SavedData`类。有两种重要方法需要注意：

- `save`：允许实现将NBT数据写入该存档。
- `setDirty`：在更改数据后必须调用的方法，以通知游戏有需要写入的更改。如果未调用，将不会调用`#save`，并且现有数据将持久存在。

### 10.2.2 附加到存档

任何`SavedData`都是动态加载和/或附加到一个存档的。因此，如果一个`SavedData`从来没有在一个存档上创建过，那么它就不存在了。

`SavedData`是从`DimensionDataStorage`创建和加载的，借助`ServerChunkCache#getDataStorage`或`ServerLevel#getDataStorage`都可以访问该存储。从那里，您可以通过调用`DimensionDataStorage#computeIfAbsent`来获取或创建SD的实例。这将尝试获取SD的当前实例（如果存在），或者创建一个新实例并加载所有可用数据。

`DimensionDataStorage#computeIfAbsent`接受三个参数：一个将NBT数据加载到SD并返回它的函数，一个构造SD新实例的Supplier，以及存储在所实现的存档的`data`文件夹中的`.dat`文件的名称。

例如，如果一个SD在下界中被命名为"example"，那么一个文件将在`./<level_folder>/DIM-1/data/example.dat`创建并且将这样实现：

```java
// 在某个类中
public ExampleSavedData create() {
  return new ExampleSavedData();
}

public ExampleSavedData load(CompoundTag tag) {
  ExampleSavedData data = this.create();
  // 加载saved data
  return data;
}

// 在该类的某个方法中
netherDataStorage.computeIfAbsent(this::load, this::create, "example");
```

要在多个存档之间保持SD，应将SD连接到主世界，其可以从`MinecraftServer#overworld`获得。主世界是唯一一个从未完全卸载的维度，因此非常适合在其上存储多存档数据。

## 10.3 编解码器（Codecs）

编解码器（Codecs）是源于Mojang的DataFixerUpper的一个序列化工具，用于描述对象如何在不同格式之间转换，例如JSON的`JsonElement`和NBT的`Tag`。

### 10.3.1 编解码器的使用

编解码器主要用于将Java对象编码或序列化为某种数据格式类型，并将格式化的数据对象解码或反序列化为其关联的Java类型。这通常分别使用`Codec#encodeStart`和`Codec#parse`来完成。

为了确定要编码和解码的中间文件格式，`#encodeStart`和`#parse`都需要一个`DynamicOps`实例来定义该格式中的数据。DataFixerUpper库包含`JsonOps`，用于对存储在`Gson`的`JsonElement`的实例中的JSON数据进行编码。`JsonOps`支持两个版本的`JsonElement`序列化：定义标准JSON文件的`JsonOps#INSTANCE`和允许将数据压缩为单个字符串的`JsonOps#COMPRESSED`。

```java
// 让exampleCodec代表一个Codec<ExampleJavaObject>
// 让exampleObject是一个ExampleJavaObject
// 让exampleJson是一个JsonElement

// 将Java对象编码为常规的JsonElement
exampleCodec.encodeStart(JsonOps.INSTANCE, exampleObject);

// 将Java对象编码为压缩的JsonElement
exampleCodec.encodeStart(JsonOps.COMPRESSED, exampleObject);

// 将JsonElement解码为Java对象
// 假设JsonElement被普通地转换
exampleCodec.parse(JsonOps.INSTANCE, exampleJson);
```

Minecraft还提供了`NbtOps`来对存储在`Tag`实例中的NBT数据进行编解码。其可以使用`NbtOps#INSTANCE`。

```java
// 让exampleCodec代表一个Codec<ExampleJavaObject>
// 让exampleObject是一个ExampleJavaObject
// 让exampleNbt是一个Tag

// 将Java对象编码为Tag
exampleCodec.encodeStart(JsonOps.INSTANCE, exampleObject);

// 将Tag解码为Java对象
exampleCodec.parse(JsonOps.INSTANCE, exampleNbt);
```

**格式的转换**

`DynamicOps`还可以单独用于在两种不同的编码格式之间进行转换。这可以使用`#convertTo`并提供`DynamicOps`格式和要转换的编解码对象来完成。

```java
// 将Tag转换为JsonElement
// 让exampleTag是一个Tag
JsonElement convertedJson = NbtOps.INSTANCE.convertTo(JsonOps.INSTANCE, exampleTag);
```

### 10.3.2 现存的编解码器

使用编解码器编码或解码的数据返回一个`DataResult`，它保存转换后的实例或一些错误数据，具体取决于转换是否成功。转换成功后，提供的`#result`将包含成功转换的对象。如果转换失败，`#error`提供的`Optional`将包含`PartialResult`，其中包含错误消息和部分转换的对象，具体取决于编解码器。

此外，`DataResult`上有许多方法可用于将结果或错误转换为所需格式。例如，`#resultOrPartial`将返回一个`Optional`，其中包含成功时的结果，以及失败时部分转换的对象。该方法接收字符串Consumer，以确定如何报告错误消息（如果存在）。

```java
// 让exampleCodec代表一个Codec<ExampleJavaObject>
// 让exampleJson是一个JsonElement

// 将JsonElement解码为Java对象
DataResult<ExampleJavaObject> result = exampleCodec.parse(JsonOps.INSTANCE, exampleJson);

result
  // 获取结果或部分结果（当错误时），并报告错误消息
  .resultOrPartial(errorMessage -> /* 处理错误消息 */)
  // 如果结果或部分结果存在，做一些事情
  .ifPresent(decodedObject -> /* 处理解码后的对象 */);
```

**原始类型**

`Codec`类包含某些已定义的原始类型的编解码器的静态实例。

| Codec | Java类型 |
|-------|----------|
| BOOL | Boolean |
| BYTE | Byte |
| SHORT | Short |
| INT | Integer |
| LONG | Long |
| FLOAT | Float |
| DOUBLE | Double |
| STRING | String |
| BYTE_BUFFER | ByteBuffer |
| INT_STREAM | IntStream |
| LONG_STREAM | LongStream |
| PASSTHROUGH | Dynamic<?> |
| EMPTY | Unit |

**原版和Forge**

Minecraft和Forge为经常编码和解码的对象定义了许多编解码器。一些示例包括`ResourceLocation#CODEC`、`CompoundTag#CODEC`、`DateTimeFormatter#ISO_INSTANT`格式的`Instant`的`ExtraCodecs#INSTANT_ISO8601`，以及`CompoundTag`的`NbtOps`。

**警告**：`CompoundTag`无法使用`JsonOps`解码JSON中的数字列表。转换时，`NbtOps`将数字设置为其最窄的类型。`CompoundTag`强制为其数据指定一个特定类型，因此具有不同类型的数字（例如，64将是`byte`，384为`short`）将在转换时引发错误。

**ForgeRegistries**

原版和Forge注册表也具有注册表所包含对象类型的编解码器（例如`Registry#BLOCK`或`Registry#byNameCodec`）。`IForgeRegistry#getCodec`和`Registry#byNameCodec`将把注册表对象编码为其注册表名称，或者如果被压缩，则编码为整数标识符。原版注册表还有一个`Registry#holderByNameCodec`，它编码为注册表名称，并解码为`Holder`中包装的注册表对象。

### 10.3.3 创建编解码器

可以创建用于对任何对象进行编码和解码的编解码器。为了便于理解，将展示等效的编码JSON。

**记录**

编解码器可以通过使用记录来定义对象。每个记录编解码器都定义了具有显式命名字段的任何对象。创建记录编解码器的方法有很多，但最简单的是通过`RecordCodecBuilder#create`。

`RecordCodecBuilder#create`接受一个定义`Instance`的函数，并返回对象的应用（`App`）。一个为创建类实例和用于将该类应用于所构造对象的构造函数的关联可被绘制。

字段：`Instance#group`方法定义一个可以使用`Codec`定义多达16个字段。每个字段都必须是一个`App`应用，定义为其创建对象的实例和对象的类型。

满足这一要求的最简单方法是使用`#fieldOf`，设置要解码的字段的名称，并设置用于编码字段的getter。如果字段是必需的，则可以使用`#fieldOf`从`Codec`创建字段；如果字段被包装在`Optional`中或具有默认值，则使用`#optionalFieldOf`创建字段。任一方法都需要一个字符串，该字符串包含编码对象中字段的名称。然后，可以使用`#forGetter`设置用于对字段进行编码的getter，接受一个给定对象并返回字段数据的函数。

从那里，可以通过`#apply`应用生成的产品，以定义实例应如何构造应用的对象。为了方便起见，分组字段应该按照它们在构造函数中出现的顺序列出，这样函数就可以简单地作为构造函数方法引用。

```java
// 要为其创建编解码器的某个对象
public class SomeObject {
  public SomeObject(String s, int i, boolean b) { /* ... */ }
  public String s() { /* ... */ }
  public int i() { /* ... */ }
  public boolean b() { /* ... */ }
}

public static final Codec<SomeObject> RECORD_CODEC = RecordCodecBuilder.create(instance -> // 给定一个实例
  instance.group( // 定义该实例内的字段
    Codec.STRING.fieldOf("s").forGetter(SomeObject::s), // 字符串
    Codec.INT.optionalFieldOf("i", 0).forGetter(SomeObject::i), // 整数，当字段不存在时默认为0
    Codec.BOOL.fieldOf("b").forGetter(SomeObject::b) // 布尔值
  ).apply(instance, SomeObject::new) // 定义如何创建该对象
);

// 已编码的SomeObject
{
  "s": "value",
  "i": 5,
  "b": false
}

// 另一个已编码的SomeObject
{
  "s": "value2",
  // i被忽略，默认为0
  "b": true
}
```

**转换器**

编解码器可以通过映射方法转换为等效或部分等效的表示。每个映射方法都有两个函数：一个将当前类型转换为新类型，另一个将新类型转换回当前类型。这是通过`#xmap`函数完成的。

```java
// A类
public class ClassA {
  public ClassB toB() { /* ... */ }
}

// 另一个等效的类
public class ClassB {
  public ClassA toA() { /* ... */ }
}

// 假设有一个编解码器A_CODEC
public static final Codec<ClassB> B_CODEC = A_CODEC.xmap(ClassA::toB, ClassB::toA);
```

如果一个类型是部分等效的，这意味着在转换过程中存在一些限制，则存在返回`DataResult`的映射函数，每当达到异常或无效状态时，该函数可用于返回错误状态。

| A是否完全等效于B | B是否完全等效于A | 转换方法 |
|------------------|------------------|----------|
| 是 | 是 | `#xmap` |
| 否 | 是 | `#flatComapMap` |
| 是 | 否 | `#comapFlatMap` |
| 否 | 否 | `#flatXMap` |

```java
// 给定一个字符串编码器用于转换为一个整数
// 并非所有字符串都能成为整数（A不完全等效于B）
// 所有整数都能成为字符串（B完全等效于A）
public static final Codec<Integer> INT_CODEC = Codec.STRING.comapFlatMap(
  s -> { // 返回含有错误或失败的数据结果
    try {
      return DataResult.success(Integer.valueOf(s));
    } catch (NumberFormatException e) {
      return DataResult.error(s + " is not an integer.");
    }
  },
  Integer::toString // 常规函数
);

// 将会返回5
"5"

// 将会产生错误，不是一个整数
"value"
```

**范围编解码器**

范围编解码器是返回错误`DataResult`的实现，如果值不包含在设置的最小值和最大值之间。如果超出界限，该值仍将作为部分结果提供。分别通过`#intRange`、`#floatRange`和`#doubleRange`实现了整数（int）、浮点数（float）和双精度小数（double）。

```java
public static final Codec<Integer> RANGE_CODEC = Codec.intRange(0, 4); 

// 将会合法，在[0, 4]范围内
4

// 将会产生错误，在[0, 4]范围外
5
```

**默认值**

如果编码或解码的结果失败，则可以通过`Codec#orElse`或`Codec#orElseGet`提供默认值。

```java
public static final Codec<Integer> DEFAULT_CODEC = Codec.INT.orElse(0); // 也可以是通过#orElseGet提供的值

// 不是一个整数，默认为0
"value"
```

**Unit**

提供代码内的值并编码为空的编解码器可以使用`Codec#unit`来表示。如果编解码器在数据对象中使用了不可编码的条目，这将非常有用。

```java
public static final Codec<IForgeRegistry<Block>> UNIT_CODEC = Codec.unit(
  () -> ForgeRegistries.BLOCKS // 也可以是一个原始值
);

// 此处无内容，将会返回方块注册表编解码器
```

**List**

对象列表的编解码器可以通过`Codec#listOf`从对象编解码器生成。

```java
// BlockPos#CODEC是一个Codec<BlockPos>
public static final Codec<List<BlockPos>> LIST_CODEC = BlockPos.CODEC.listOf();

// 已编码的List<BlockPos>
[
  [1, 2, 3], // BlockPos(1, 2, 3)
  [4, 5, 6], // BlockPos(4, 5, 6)
  [7, 8, 9]  // BlockPos(7, 8, 9)
]
```

使用列表编解码器解码的列表对象存储在不可变列表中。如果需要可变列表，则应将转换器应用于列表编解码器。

**Map**

键和值对象映射（Map）的编解码器可以通过`Codec#unboundedMap`从两个编解码器生成。无边界映射可以指定任何基于字符串或经过字符串转换的值作为键。

```java
// BlockPos#CODEC是一个Codec<BlockPos>
public static final Codec<Map<String, BlockPos>> MAP_CODEC = Codec.unboundedMap(Codec.STRING, BlockPos.CODEC);

// 已编码的Map<String, BlockPos>
{
  "key1": [1, 2, 3], // key1 -> BlockPos(1, 2, 3)
  "key2": [4, 5, 6], // key2 -> BlockPos(4, 5, 6)
  "key3": [7, 8, 9]  // key3 -> BlockPos(7, 8, 9)
}
```

使用无界映射编解码器解码的映射对象存储在不可变映射中。如果需要一个可变映射，则应该将转换器应用于映射编解码器。

**警告**：无界映射仅支持对字符串进行编码/解码的键。键值对列表编解码器可以用来绕过这个限制。

**Pair**

对象对的编解码器可以通过`Codec#pair`从两个编解码器生成。

成对编解码器通过首先解码成对中的左对象，然后取编码对象的剩余部分并从中解码右对象来解码对象。因此，编解码器必须在解码后表达关于编码对象的某些内容（例如记录），或者必须将它们扩充为`MapCodec`，并通过`#codec`转换为常规编解码器。这通常可以通过使编解码器成为某个对象的字段来实现。

```java
public static final Codec<Pair<Integer, String>> PAIR_CODEC = Codec.pair(
  Codec.INT.fieldOf("left").codec(),
  Codec.STRING.fieldOf("right").codec()
);

// 已编码的Pair<Integer, String>
{
  "left": 5,       // fieldOf查询'left'键以获取左对象
  "right": "value" // fieldOf查询'right'键以获取右对象
}
```

**提示**：可以使用转换器应用的键值对列表对具有非字符串键的映射编解码器进行编码/解码。

**Either**

用于编码/解码某些对象数据的两种不同方法的编解码器可以通过`Codec#either`从两个编解码器生成。Either编解码器尝试使用第一编解码器对对象进行解码。如果失败，它将尝试使用第二个编解码器进行解码。如果也失败了，那么`DataResult`将只包含第二个编解码器失败的错误。

```java
public static final Codec<Either<Integer, String>> EITHER_CODEC = Codec.either(
  Codec.INT,
  Codec.STRING
);

// 已编码的Either$Left<Integer, String>
5

// 已编码的Either$Right<Integer, String>
"value"
```

**提示**：这可以与转换器结合使用，从两种不同的编码方法中获取特定对象。

**Dispatch**

编解码器可以具有子解码器，子解码器可以通过`Codec#dispatch`基于某个指定类型对特定对象进行解码。这通常用于包含编解码器的注册表中，例如规则测试或方块放置器。

Dispatch编解码器首先尝试从某个字符串关键字（通常为`type`）中获取编码类型。从那里，类型被解码，为用于解码实际对象的特定编解码器调用getter。如果用于解码对象的`DynamicOps`压缩了其映射，或者对象编解码器本身没有扩充为`MapCodec`（例如记录或已部署的基本类型），则需要将对象存储在`value`键中。否则，对象将在与其余数据相同的级别上进行解码。

```java
// 定义我们的对象
public abstract class ExampleObject {
  // 定义用于指定要编码的对象类型的方法
  public abstract Codec<? extends ExampleObject> type();
}

// 创建存储字符串的简单对象
public class StringObject extends ExampleObject {
  public StringObject(String s) { /* ... */ }
  public String s() { /* ... */ }
  public Codec<? extends ExampleObject> type() {
    // 一个已注册的注册表对象
    // "string":
    //   Codec.STRING.xmap(StringObject::new, StringObject::s)
    return STRING_OBJECT_CODEC.get();
  }
}

// 创建存储字符串和整数的复杂对象
public class ComplexObject extends ExampleObject {
  public ComplexObject(String s, int i) { /* ... */ }
  public String s() { /* ... */ }
  public int i() { /* ... */ }
  public Codec<? extends ExampleObject> type() {
    // 一个已注册的注册表对象
    // "complex":
    //   RecordCodecBuilder.create(instance ->
    //     instance.group(
    //       Codec.STRING.fieldOf("s").forGetter(ComplexObject::s),
    //       Codec.INT.fieldOf("i").forGetter(ComplexObject::i)
    //     ).apply(instance, ComplexObject::new)
    //   )
    return COMPLEX_OBJECT_CODEC.get();
  }
}

// 假设有一个IForgeRegistry<Codec<? extends ExampleObject>> DISPATCH
public static final Codec<ExampleObject> = DISPATCH.getCodec() // 获取Codec<Codec<? extends ExampleObject>>
  .dispatch(
    ExampleObject::type, // 从特定对象获取编解码器
    Function.identity() // 从注册表获取编解码器
  );

// 简单对象
{
  "type": "string", // 对于StringObject
  "value": "value" // MapCodec不需要编解码器类型参数，需要字段
}

// 复杂对象
{
  "type": "complex", // 对于ComplexObject
  // MapCodec不需要编解码器类型参数，可被内联
  "s": "value",
  "i": 0
}
```