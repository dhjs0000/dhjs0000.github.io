---
title: Forge 1.20.1开发文档-8 方块实体
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 10
---

> 本文档来源于Forge官方中文文档，侵删

## 8.1 方块实体

`BlockEntities`类似于绑定到某一方块的简化的`Entities`。它们能用于存储动态数据、执行基于游戏刻的任务和动态渲染。

原版Minecraft中的一些例子是处理箱子的物品栏、熔炉的熔炼逻辑或信标的区域效果。模组中存在更高级的示例，例如采石场（如BC）、分拣机（如IC2）、管道（如BC）和显示器（如OC）。（括号内容为译者注。）

**注意**：`BlockEntities`并不是万能的解决方案，如果使用错误，它们可能会导致游戏卡顿。如果可能的话，尽量避免使用。

### 8.1.1 注册

方块实体是动态创建和删除的，因此它们本身不是注册表对象。为了创建`BlockEntity`，你需要继承`BlockEntity`类。这样，另一个对象被替代性地注册以方便创建和引用动态对象的类型。对于`BlockEntity`，这些对象被称为`BlockEntityType`。

`BlockEntityType`可以像任何其他注册表对象一样进行注册。若要构造`BlockEntityType`，可以通过`BlockEntityType$Builder#of`用其Builder形式。这需要两个参数：`BlockEntityType$BlockEntitySupplier`，它接受`BlockPos`和`BlockState`来创建关联`BlockEntity`的新实例，以及该`BlockEntity`可以附加到的`Block`的可变参数。

构建该`BlockEntityType`是通过调用`BlockEntityType$Builder#build`来完成的。其接受一个`Type`，表示用于引用某个`DataFixer`中的此注册表对象的类型安全引用。由于`DataFixer`是用于模组的可选系统，因此其也可用`null`代替。

```java
// 对于某个类型为DeferredRegister<BlockEntityType<?>>的REGISTER
public static final RegistryObject<BlockEntityType<MyBE>> MY_BE = REGISTER.register("mybe", () -> BlockEntityType.Builder.of(MyBE::new, validBlocks).build(null));

// 在MyBE（一个BlockEntity的子类）中
public MyBE(BlockPos pos, BlockState state) {
  super(MY_BE.get(), pos, state);
}
```

### 8.1.2 创建一个BlockEntity

要创建`BlockEntity`并将其附加到`Block`，`EntityBlock`接口必须在你的`Block`子类上实现。方法`EntityBlock#newBlockEntity(BlockPos, BlockState)`必须实现并返回一个你的`BlockEntity`的新实例。

### 8.1.3 将数据存储到你的BlockEntity

为了保存数据，请重写以下两个方法：

- `BlockEntity#saveAdditional(CompoundTag tag)`
- `BlockEntity#load(CompoundTag tag)`

每当包含的`LevelChunk`从标签加载/保存到标签时，都会调用这些方法。使用它们以读取和写入你的方块实体类的字段。

**注意**：每当你的数据发生改变时，你需要调用`BlockEntity#setChanged()`。

**重要**：调用`super`方法非常重要！否则，保存存档时可能会跳过包含你的`BlockEntity`的`LevelChunk`。

`CompoundTag`标签名称`id`、`x`、`y`、`z`、`ForgeData`和`ForgeCaps`均由`super`方法保留。

### 8.1.4 计时的BlockEntity

如果你需要一个计时的`BlockEntity`，例如为了跟踪冶炼过程中的进度，则必须在`EntityBlock#getTicker(Level, BlockState, BlockEntityType)`中实现并重写另一个方法。这可以根据用户所处的逻辑端实现不同的计时器，或者只实现一个通用计时器。无论哪种情况，都必须返回`BlockEntityTicker`。由于这是一个功能性的接口，因此它可以转而采用一个表示计时器的方法：

```java
// 在某个Block子类内
@Nullable
@Override
public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
  return type == MyBlockEntityTypes.MYBE.get() ? MyBlockEntity::tick : null;
}

// 在MyBlockEntity内
public static void tick(Level level, BlockPos pos, BlockState state, MyBlockEntity blockEntity) {
  // 处理一些事情
}
```

**注意**：这个方法在每个游戏刻都会调用；因此，你应该避免在这里进行复杂的计算。如果可能的话，你应该每X个游戏刻进行更复杂的计算。（一秒钟内的游戏刻数量可能低于20（二十），但不会更高）

### 8.1.5 向客户端同步数据

有三种方法可以将数据同步到客户端：在区块加载时同步、在方块更新时同步以及使用自定义网络消息同步。

**在LevelChunk加载时同步**

为此你需要重写`BlockEntity#getUpdateTag()`和`IForgeBlockEntity#handleUpdateTag(CompoundTag tag)`。

同样，这非常简单，第一个方法收集应该发送到客户端的数据，而第二个方法处理这些数据。如果你的`BlockEntity`不包含太多数据，你可以使用`BlockEntity#saveAdditional`将数据存储到你的`BlockEntity`小节之外的方法。

**重要**：为方块实体同步过多/无用的数据可能会导致网络拥塞。你应该通过在客户端需要时仅发送客户端需要的信息来优化网络使用。例如，在更新标签中发送方块实体的物品栏通常是没有必要的，因为这可以通过其`AbstractContainerMenu`同步。

**在方块更新时同步**

这个方法有点复杂，但同样，你只需要重写两个或三个方法。下面是它的一个简易的实现示例：

```java
@Override
public CompoundTag getUpdateTag() {
  CompoundTag tag = new CompoundTag();
  //将你的数据写入标签
  return tag;
}

@Override
public Packet<ClientGamePacketListener> getUpdatePacket() {
  // 将从#getUpdateTag得到标签
  return ClientboundBlockEntityDataPacket.create(this);
}

// 可以重写IForgeBlockEntity#onDataPacket。默认地，其将遵从#load。
```

`ClientboundBlockEntityDataPacket`的静态构造器接受：

- 该`BlockEntity`
- 从该`BlockEntity`中获取`CompoundTag`的可选函数。默认情况下，其使用`BlockEntity#getUpdateTag`。

现在，要发送数据包，必须在服务端上发出更新通知。`pos`应为你的`BlockEntity`的位置。使用`Level#sendBlockUpdated(BlockPos pos, BlockState oldState, BlockState newState, int flags)`进行`Block#UPDATE_CLIENTS`。对于`oldState`和`newState`，你可以传递那个位置的`BlockState`。`flags`是一个应含有`Block`的位掩码（bitmask），其将向客户端同步数据。有关更多信息以及flags的其余信息，参见`Block`。flag `2`与`Block#UPDATE_CLIENTS`相同。

**使用自定义网络消息同步**

这种同步方式可能是最复杂的，但通常是最优化的，因为你可以确保只有需要同步的数据才是真正同步的。在尝试之前，你应该先查看网络部分，尤其是`SimpleImpl`和`SimpleChannel#send(PacketDistributor$PacketTarget, MSG)`。一旦你创建了自定义网络消息，你就可以使用`PacketDistributor#send`将其发送给所有加载了该`BlockEntity`的用户。

进行安全检查很重要，当消息到达玩家时，`BlockEntity`可能已经被销毁/替换！你还应该检查区块是否已加载（`Level#hasChunkAt(BlockPos)`）。

## 8.2 BlockEntityRenderer

`BlockEntityRenderer`（简称BER）用于以静态烘焙模型（JSON、OBJ、B3D等）无法表示的方式渲染方块。方块实体渲染器要求方块具有`BlockEntity`。

### 8.2.1 创建一个BER

要创建BER，请创建一个继承自`BlockEntityRenderer<T extends BlockEntity>`的类。它采用一个泛型参数来指定方块的`BlockEntity`类。该泛型参数用于BER的方法。

**render**

对于任意一个给定的`BlockEntityType`，仅存在一个BER。因此，特定于存档中单个实例的值应该存储在传递给渲染器的方块实体中，而不是存储在BER本身中。例如，如果将逐帧递增的整数存储在BER中，则对于该存档中该类型的每个方块实体也会逐帧递增。

为了渲染方块实体，每帧都调用此方法。

**参数**

- `blockEntity`: 这是正在渲染的方块实体的实例。
- `partialTick`: 在帧的摩擦过程中，从上一次完整刻度开始经过的时间量。
- `poseStack`: 一个栈，包含偏移到方块实体当前位置的四维矩阵条目。
- `bufferSource`: 能够访问顶点Consumer的渲染缓冲区。
- `combinedLight`: 方块实体上当前亮度值的整数。
- `combinedOverlay`: 设置为方块实体的当前overlay的整数，通常为`OverlayTexture#NO_OVERLAY`或655,360。

### 8.2.2 注册一个BER

要注册BER，你必须订阅模组事件总线上的`EntityRenderersEvent$RegisterRenderers`事件，并调用`#registerBlockEntityRenderer`。

