---
title: Forge 1.20.1开发文档-11 GUI
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 13
---

> 本文档来源于Forge官方中文文档，侵删
# 11. 图形用户界面

## 11.1 菜单（Menus）

菜单（Menus）是图形用户界面（GUI）的一种后端类型；它们处理与某些代表的数据持有者交互所涉及的逻辑。菜单本身不是数据持有者。它们是允许用户间接修改内部数据持有者状态的视图。因此，数据持有者不应直接耦合到任何菜单，而应传入数据引用以便调用和修改。

### 11.1.1 菜单类型

菜单是动态创建和删除的，因此不是注册表对象。因此，另一种工厂对象被注册，以方便创建和引用菜单的类型。对于菜单，其为 `MenuType`。

`MenuType` 必须被注册。`MenuType` 是通过将 `MenuSupplier` 和 `FeatureFlagSet` 传递给其构造函数来创建的。`MenuSupplier` 表示一个函数，该函数接收容器的 id 和查看菜单的玩家的物品栏，并返回一个新创建的 `AbstractContainerMenu`。

**注意**：容器 id 对于单个玩家是唯一的。这意味着，两个不同玩家上的相同容器 id 将代表两个不同的菜单，即使他们正在查看相同的数据持有者。

`MenuSupplier` 通常负责在客户端上创建一个菜单，其中包含用于存储来自服务端数据持有者的同步信息并与之交互的伪数据引用。

如果需要有关客户端的其他信息（例如数据持有者在世界中的位置），则可以使用 `IContainerFactory` 子类。除了容器 id 和玩家物品栏之外，这还提供了一个 `FriendlyByteBuf`，它可以存储从服务端发送的附加信息。`MenuType` 可以通过使用 `IForgeMenuType#create` 创建。

```java
// 对于某个类型为 DeferredRegister<MenuType<?>> 的 REGISTER
public static final RegistryObject<MenuType<MyMenu>> MY_MENU = REGISTER.register("my_menu", 
    () -> new MenuType(MyMenu::new, FeatureFlags.DEFAULT_FLAGS));

// 在 MyMenu，一个 AbstractContainerMenu 的子类中
public MyMenu(int containerId, Inventory playerInv) {
    super(MY_MENU.get(), containerId);
    // ...
}
```

```java
// 对于某个类型为 DeferredRegister<MenuType<?>> 的 REGISTER
public static final RegistryObject<MenuType<MyMenuExtra>> MY_MENU_EXTRA = REGISTER.register(
    "my_menu_extra", 
    () -> IForgeMenuType.create(MyMenu::new)
);

// 在 MyMenuExtra，一个 AbstractContainerMenu 的子类中
public MyMenuExtra(int containerId, Inventory playerInv, FriendlyByteBuf extraData) {
    super(MY_MENU_EXTRA.get(), containerId);
    // 从 buffer 中存储附加信息
    // ...
}
```

### 11.1.2 AbstractContainerMenu

所有菜单都是从 `AbstractContainerMenu` 继承而来的。菜单包含两个参数，即表示菜单本身类型的 `MenuType` 和表示当前访问者的菜单唯一标识符的容器 id。

**重要**：玩家一次只能打开 100 个唯一的菜单。

每个菜单应该包含两个构造函数：一个用于初始化服务端上的菜单，另一个用于启动客户端上的菜单。用于初始化客户端菜单的构造函数是提供给 `MenuSupplier` 的构造函数。服务端菜单构造函数包含的任何字段都应该具有客户端菜单构造函数的一些默认值。

每个菜单实现必须实现两个方法：`#stillValid` 和 `#quickMoveStack`。

#### #stillValid

`#stillValid` 确定菜单是否应该为给定的玩家保持打开状态。这通常指向静态的 `AbstractContainerMenu#stillValid`，它接受一个 `ContainerLevelAccess`、该玩家和该菜单所附的 `Block`。客户端菜单必须始终为该方法返回 `true`，而静态的 `#stillValid` 默认为该方法。该实现检查玩家是否在数据存储对象所在的八个方块内。

`ContainerLevelAccess` 提供封闭范围内方块的当前存档和位置。在服务端上构建菜单时，可以通过调用 `ContainerLevelAccess#create` 创建新的访问。客户端菜单构造函数可以传入 `ContainerLevelAccess#NULL`，这将不起任何作用。

```java
// 客户端菜单构造函数
public MyMenu(int containerId, Inventory playerInventory) {
    this(containerId, playerInventory);
}

// 服务端菜单构造函数
public MyMenu(int containerId, Inventory playerInventory) {
    this(containerId, playerInventory, ContainerLevelAccess.NULL);
    // ...
}

// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
    this(containerId, playerInventory, ContainerLevelAccess.NULL);
}

// 服务端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerLevelAccess access) {
    // ...
}

// 假设该菜单已绑定到 RegistryObject<Block> MY_BLOCK
@Override
public boolean stillValid(Player player) {
    return AbstractContainerMenu.stillValid(this.access, player, MY_BLOCK.get());
}
```

#### 数据的同步

一些数据需要同时出现在服务端和客户端上才能显示给玩家。为此，菜单实现了数据同步的基本层，以便在当前数据与上次同步到客户端的数据不匹配时进行同步。对于玩家来说，这是每个 tick 都会检查的。

Minecraft 默认支持两种形式的数据同步：通过 `Slot` 进行的 `ItemStack` 同步和通过 `DataSlot` 进行的整数同步。

`Slot` 和 `SlotItemHandler` 是保存对数据存储的引用的视图，假设操作有效，玩家可以在屏幕中修改这些数据存储。这些可以通过 `#addSlot` 在菜单的构造函数中添加。

**注意**：由于 `Slot` 使用的 `IItemHandler` 已被 Forge 弃用，取而代之的是使用 `SlotItemHandler` 功能，因此其余解释将围绕使用功能变体：`SlotItemHandler` 展开。

`SlotItemHandler` 包含四个参数：`IItemHandler` 表示物品栈所在的物品栏，该 Slot 具体表示的物品栈索引，以及该 Slot 左上角将在屏幕上呈现的相对于 `AbstractContainerScreen#leftPos` 和 `AbstractContainerScreen#topPos` 的 x 和 y 位置。客户端菜单构造函数应该始终提供相同大小的物品栏的空实例。

在大多数情况下，菜单中包含的任何 Slot 都会首先添加，然后是玩家的物品栏，最后以玩家的快捷栏结束。要从菜单中访问任何单独的 `Slot`，必须根据添加 Slot 的顺序计算索引。

`DataSlot` 是一个抽象类，它应该实现 getter 和 setter 来引用存储在数据存储对象中的数据。客户端菜单构造函数应始终通过 `DataSlot#standalone` 提供一个新实例。

每次初始化新菜单时，都应该重新创建上述内容以及 Slot。

**警告**：尽管 `DataSlot` 存储一个整数（int），但由于它在网络上发送数值的方式，它实际上被限制为 short 类型（-32768 到 32767）。该整数（int）的 16 个高比特位被忽略。

```java
// 假设我们有一个来自大小为5的数据对象的物品栏
// 假设我们在每次初始化服务端菜单时都构造了一个 DataSlot

// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
    this(containerId, playerInventory, new ItemStackHandler(5), DataSlot.standalone());
}

// 服务端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, IItemHandler dataInventory, DataSlot dataSingle) {
    // 检查数据物品栏大小是否为某个固定值
    // 然后，为数据物品栏添加 Slot
    this.addSlot(new SlotItemHandler(dataInventory, /*...*/));
    // 为玩家物品栏添加 Slot
    this.addSlot(new Slot(playerInventory, /*...*/));
    // 为被处理的整数添加 Slot
    this.addDataSlot(dataSingle);
    // ...
}
```

如果需要将多个整数同步到客户端，则可以使用一个 `ContainerData` 来引用这些整数。此接口用作索引查找，以便每个索引表示不同的整数。如果通过 `#addDataSlots` 将 `ContainerData` 添加到菜单中，则也可以在数据对象本身中构造。该方法为接口指定量的数据创建一个新的 `DataSlot`。客户端菜单构造函数应始终通过 `SimpleContainerData` 提供一个新实例。

**警告**：由于 `ContainerData` 委托 `DataSlot`，这些整数也被限制为 short（-32768 到 32767）。

```java
// 假设我们有一个大小为3的 ContainerData

// 客户端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory) {
    this(containerId, playerInventory, new SimpleContainerData(3));
}

// 服务端菜单构造函数
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerData dataMultiple) {
    // 检查 ContainerData 大小是否为某个固定值
    checkContainerDataCount(dataMultiple, 3);
    // 为被处理的整数添加 Slot
    this.addDataSlots(dataMultiple);
    // ...
}
```

#### #quickMoveStack

`#quickMoveStack` 是任何菜单都必须实现的第二个方法。每当物品栈被 Shift 单击或快速移出其当前 Slot，直到物品栈完全移出其上一个 Slot，或者物品栈没有其他位置可去时，就会调用此方法。该方法返回正在快速移动的 Slot 中物品栈的一个副本。

物品栈通常使用 `#moveItemStackTo` 在 Slot 之间移动，它将物品栈移动到第一个可用的 Slot 中。它接受要移动的物品栈、尝试将物品栈移动到的第一个 Slot 的索引（包括）、最后一个 Slot 的索引，以及是以从第一个到最后一个（当 `false` 时）还是从最后一个到第一个（当 `true` 时）的顺序检查 Slot。

在 Minecraft 的实现中，这种方法的逻辑相当一致：

```java
// 假设我们有一个大小为5的数据物品栏
// 该物品栏有4个输入（索引1 - 4）并输出到一个结果 Slot（索引0）
// 我们也有27个玩家物品栏 Slot 和9个快捷栏 Slot
// 这样，真正的 Slot 索引按如下编排：
// - 数据物品栏：结果（0），输入（1 - 4）
// - 玩家物品栏（5 - 31）
// - 玩家快捷栏（32 - 40）

@Override
public ItemStack quickMoveStack(Player player, int quickMovedSlotIndex) {
    // 快速移动的 Slot 的物品栈
    ItemStack quickMovedStack = ItemStack.EMPTY;
    // 快速移动的 Slot
    Slot quickMovedSlot = this.slots.get(quickMovedSlotIndex)
    
    // 如果该 Slot 在合理范围内且不为空
    if (quickMovedSlot != null && quickMovedSlot.hasItem()) {
        // 获取原始物品栈以用于移动
        ItemStack rawStack = quickMovedSlot.getItem();
        // 将 Slot 物品栈设置为该原始物品栈的副本
        quickMovedStack = rawStack.copy()
        
        /*
         * 以下快速移动逻辑可以简化为：如果在数据物品栏中，尝试移动到玩家物品栏/快捷栏，
         * 反之亦然，对于无法转换数据的容器（例如箱子）。
         */
        
        // 如果快速移动在数据物品栏的结果 Slot 上进行
        if (quickMovedSlotIndex == 0) {
            // 尝试将结果 Slot 移入玩家物品栏/快捷栏
            if (!this.moveItemStackTo(rawStack, 5, 41, true)) {
                // 如果无法移动，就不再进行快速移动
                return ItemStack.EMPTY
            }
            // 执行 Slot 的快速移动逻辑
            slot.onQuickCraft(rawStack, quickMovedStack)
        }
        // 否则如果快速移动在玩家物品栏或快捷栏 Slot 上进行
        else if (quickMovedSlotIndex >= 5 && quickMovedSlotIndex < 41) {
            // 尝试将物品栏/快捷栏 Slot 移入数据物品栏输入 Slot
            if (!this.moveItemStackTo(rawStack, 1, 5, false)) {
                // 如果无法移动且在玩家物品栏 Slot 内，尝试移入快捷栏
                if (quickMovedSlotIndex < 32) {
                    if (!this.moveItemStackTo(rawStack, 32, 41, false)) {
                        // 如果无法移动，就不再进行快速移动
                        return ItemStack.EMPTY
                    }
                }
                // 否则就尝试将快捷栏移入玩家物品栏 Slot
                else if (!this.moveItemStackTo(rawStack, 5, 32, false)) {
                    // 如果无法移动，就不再进行快速移动
                    return ItemStack.EMPTY
                }
            }
        }
        // 否则如果快速移动在数据物品栏的输入 Slot 上进行，尝试将其移入玩家物品栏/快捷栏
        else if (!this.moveItemStackTo(rawStack, 5, 41, false)) {
            // 如果无法移动，就不再进行快速移动
            return ItemStack.EMPTY
        }
        
        if (rawStack.isEmpty()) {
            // 如果原始物品栈已完全移出当前 Slot，将该 Slot 置空
            quickMovedSlot.set(ItemStack.EMPTY)
        } else {
            // 否则，通知该 Slot 物品栈数量已改变
            quickMovedSlot.setChanged()
        }
        
        /*
         * 如果菜单不表示可以转换物品栈的容器（例如箱子），则可以删除以下 if 语句和
         * Slot#onTake 调用。
         */
        if (rawStack.getCount() == quickMovedStack.getCount()) {
            // 如果原始物品栈不能被移动到另一个 Slot，就不再进行快速移动
            return ItemStack.EMPTY
        }
        
        // 执行剩余物品栈的移动后逻辑
        quickMovedSlot.onTake(player, rawStack)
    }
    
    return quickMovedStack // 返回该 Slot 物品栈
}
```

### 11.1.3 打开菜单

一旦注册了菜单类型，菜单本身已经完成，并且一个屏幕（Screen）已被附加，玩家就可以打开菜单。可以通过在逻辑服务端上调用 `NetworkHooks#openScreen` 来打开菜单。该方法让玩家打开菜单，接受服务端端菜单的 `MenuProvider`，如果需要将额外数据同步到客户端，还可以选择 `FriendlyByteBuf`。

**注意**：只有在使用 `IContainerFactory` 创建菜单类型时，才应使用带有 `FriendlyByteBuf` 参数的 `NetworkHooks#openScreen`。

`MenuProvider` 是一个包含两个方法的接口：`#createMenu` 和 `#getDisplayName`，前者创建菜单的服务端实例，后者返回一个包含要传递到屏幕（Screen）的菜单标题的组件。`#createMenu` 方法包含三个参数：菜单的容器 id、打开菜单的玩家的物品栏以及打开菜单的玩家。

使用 `SimpleMenuProvider` 可以很容易地创建 `MenuProvider`，它采用方法引用来创建服务端菜单和菜单标题。

#### 常见实现

菜单通常在某种玩家交互时打开（例如，当右键单击方块或实体时）。

**方块的实现**

方块通常通过重写 `BlockBehaviour#getMenuProvider` 来实现菜单。如果在逻辑客户端上，则交互返回 `InteractionResult#SUCCESS`。否则，它将打开菜单并返回 `InteractionResult#CONSUME`。

`InteractionResult#sidedSuccess` 应通过重写 `BlockBehaviour#use` 来实现。原版方法使用这个来显示旁观者模式下的菜单。

```java
// 在某个 Block 的子类中
@Override
public MenuProvider getMenuProvider(BlockState state, Level level, BlockPos pos) {
    return new SimpleMenuProvider(/* ... */);
}

@Override
public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand, BlockHitResult result) {
    if (!level.isClientSide && player instanceof ServerPlayer serverPlayer) {
        NetworkHooks.openScreen(serverPlayer, state.getMenuProvider(level, pos));
    }
    return InteractionResult.sidedSuccess(level.isClientSide);
}
```

**注意**：这是实现逻辑的最简单的方法，而不是唯一的方法。如果你希望方块仅在特定条件下打开菜单，则需要提前将一些数据同步到客户端，以便在不满足条件的情况下返回 `InteractionResult#PASS` 或 `InteractionResult#FAIL`。

**生物的实现**

Mob 通常通过重写 `Mob#mobInteract` 来实现菜单。这与方块实现类似，唯一的区别是 Mob 本身应该实现 `MenuProvider` 以支持旁观者模式下的显示。

```java
public class MyMob extends Mob implements MenuProvider {
    // ...
    @Override
    public InteractionResult mobInteract(Player player, InteractionHand hand) {
        if (!this.level.isClientSide && player instanceof ServerPlayer serverPlayer) {
            NetworkHooks.openScreen(serverPlayer, this);
        }
        return InteractionResult.sidedSuccess(this.level.isClientSide);
    }
}
```

**注意**：再次说明，这是实现逻辑的最简单的方法，而不是唯一的方法。

---

## 11.2 屏幕（Screens）

屏幕通常是 Minecraft 中所有图形用户界面（GUI）的基础：接收用户输入，在服务端上验证，并将生成的操作同步回客户端。它们可以与菜单（Menus）相结合，为类似物品栏的视图创建通信网络，也可以是独立的，模组开发者可以通过自己的网络实现来处理。

屏幕由许多部分组成，因此很难完全理解 Minecraft 中的"屏幕"到底是什么。因此，在讨论屏幕本身之前，本文档将介绍屏幕的每个组件及其应用方式。

### 11.2.1 相对坐标

每当渲染任何东西时，都需要有一些标识符来指定它将出现的位置。通过大量的抽象，Minecraft 的大多数渲染调用都在坐标平面中采用 x、y 和 z 值。x 值从左到右递增，y 从上到下递增，z 从远到近递增。但是，坐标并不是固定在指定的范围内。它们可以根据屏幕的大小和选项中指定的比例进行更改。因此，在渲染时必须格外小心，以确保坐标值正确缩放到可更改的屏幕大小。

关于如何将坐标相对化的信息将在屏幕部分中呈现。

**重要**：如果选择使用固定坐标或不正确地缩放屏幕，则渲染的对象可能看起来很奇怪或错位。检查坐标是否正确相对化的一个简单方法是单击视频设置中的"Gui 比例"按钮。在确定 GUI 渲染的比例时，此值用作显示器宽度和高度的除数。

### 11.2.2 Gui 图形

Minecraft 渲染的任何 GUI 通常都是使用 `GuiGraphics` 完成的。`GuiGraphics` 是几乎所有渲染方法的第一个参数；它包含渲染常用对象的基本方法。它们分为五类：彩色矩形、字符串、纹理、物品和提示信息。还有一种用于呈现组件片段的附加方法（`#enableScissor` / `#disableScissor`）。`GuiGraphics` 还公开了 `PoseStack`，它应用了正确渲染组件所需的转换。此外，颜色采用 ARGB 格式。

#### 彩色矩形

彩色矩形是通过位置颜色着色器绘制的。有三种类型的彩色矩形可以绘制。

首先，有一条彩色的水平和垂直一像素宽的线，分别为 `#hLine` 和 `#vLine`。`#hLine` 接受两个 x 坐标，定义左侧和右侧（包括）、顶部 y 坐标和颜色。`#vLine` 接受左侧的 x 坐标、定义顶部和底部（包括）的两个 y 坐标以及颜色。

其次，还有 `#fill` 方法，它在屏幕上绘制一个矩形。Line 方法在内部调用此方法。其接受左 x 坐标、上 y 坐标、右 x 坐标、下 y 坐标和颜色。

最后，还有 `#fillGradient` 方法，它绘制一个具有垂直梯度的矩形。这包括右 x 坐标、下 y 坐标、左 x 坐标、上 y 坐标、z 坐标以及底部和顶部的颜色。

#### 字符串

字符串是通过其 `Font` 绘制的，通常由它们自己的普通、透视和偏移模式的着色器组成。可以渲染两种对齐的字符串，每种都有一个后阴影：左对齐字符串（`#drawString`）和居中对齐字符串（`#drawCenteredString`）。这两者都采用了字符串将被渲染的字体、要绘制的字符串、分别表示字符串左侧或中心的 x 坐标、顶部的 y 坐标和颜色。

**注意**：字符串通常应作为 `Component` 传入，因为它们处理各种用例，包括方法的另外两个重载。

#### 纹理

纹理是通过 blitting 的方式绘制的，因此方法名为 `#blit`，为此，它复制图像的比特并将其直接绘制到屏幕上。这些是通过位置纹理着色器绘制的。虽然有许多不同的重载，但我们只讨论两个静态的 `#blit`。

第一个静态 `#blit` 取六个整数，并假设渲染的纹理位于 256 x 256 PNG 文件上。它接受左侧 x 和顶部 y 屏幕坐标、PNG 中的左侧 x 和底部 y 坐标，以及要渲染的图像的宽度和高度。

**注意**：必须指定 PNG 文件的大小，以便可以规范化坐标以获得关联的 UV 值。

第一个 `#blit` 所调用的另一个静态 `#blit` 将参数扩展为九个整数，仅假设图像位于 PNG 文件上。它获取左侧 x 和顶部 y 屏幕坐标、z 坐标（称为 blit 偏移）、PNG 中的左侧 x 和上部 y 坐标、要渲染的图像的宽度和高度以及 PNG 文件的宽度和高。

##### Blit 偏移

渲染纹理时的 z 坐标通常设置为 blit 偏移。偏移量负责在查看屏幕时对渲染进行适当分层。z 坐标较小的渲染在背景中渲染，反之亦然，z 坐标较大的渲染在前景中渲染。z 偏移量可以通过 `#translate` 直接设置在 `PoseStack` 本身上。一些基本的偏移逻辑在 `GuiGraphics` 的某些方法（例如物品渲染）中内部应用。

**重要**：设置 blit 偏移时，必须在渲染对象后重置它。否则，屏幕内的其他对象可能会在不正确的层中渲染，从而导致图形问题。建议在平移前推动当前姿势，然后在偏移处完成所有渲染后弹出。

### 11.2.3 Renderable

`Renderable` 本质上是被渲染的对象。其中包括屏幕、按钮、聊天框、列表等。`Renderable` 只有一个方法：`#render`。这需要用于将对象渲染到屏幕上的 `GuiGraphics`，以正确渲染、缩放到相对屏幕大小的鼠标的 x 和 y 位置，以及游戏刻增量（自上一帧以来经过了多少游戏刻）。

一些常见的可渲染文件是屏幕和"小部件"：通常在屏幕上渲染的可交互元素，如 `Button`、其子类型 `ImageButton` 和用于在屏幕上输入文本的 `EditBox`。

### 11.2.4 GuiEventListener

在 Minecraft 中呈现的任何屏幕都实现了 `GuiEventListener`。`GuiEventListener` 负责处理用户与屏幕的交互。其中包括来自鼠标（移动、单击、释放、拖动、滚动、鼠标悬停）和键盘（按下、释放、键入）的输入。每个方法都返回关联的操作是否成功影响了屏幕。按钮、聊天框、列表等小工具也实现了这个界面。

#### ContainerEventHandler

与 `GuiEventListener` 几乎同义的是它们的子类型：`ContainerEventHandler`。它们负责处理包含小部件的屏幕上的用户交互，管理当前聚焦的内容以及相关交互的应用方式。`ContainerEventHandler` 添加了三个附加功能：可交互的子项、拖动和聚焦。

事件处理器包含用于确定元素交互顺序的子级。在鼠标事件处理器（不包括拖动）期间，鼠标悬停的列表中的第一个子级将执行其逻辑。

用鼠标拖动元素，通过 `#mouseClicked` 和 `#mouseReleased` 实现，可以提供更精确的执行逻辑。

聚焦允许在事件执行期间，例如在键盘事件或拖动鼠标期间，首先检查并处理特定的子项。焦点通常通过 `#setFocused` 设置。此外，可以使用 `#nextFocusPath` 循环可交互的子级，根据传入的 `FocusNavigationEvent` 选择子级。

**注意**：屏幕通过 `AbstractContainerEventHandler` 实现了 `ContainerEventHandler` 和 `GuiComponent`，添加了 setter 和 getter 逻辑用于拖动和聚焦子级。

### 11.2.5 NarratableEntry

`NarratableEntry` 是可以通过 Minecraft 的无障碍讲述功能进行讲述的元素。每个元素可以根据悬停或选择的内容提供不同的叙述，通常按焦点、悬停以及所有其他情况进行优先级排序。

`NarratableEntry` 有三种方法：一种是确定元素的优先级（`#narrationPriority`），一种是决定是否说出讲述（`#isActive`），最后一种是将讲述提供给相关的输出（说出或读取）（`#updateNarration`）。

**注意**：Minecraft 中的所有小部件都是 `NarratableEntry`，因此如果使用可用的子类型，通常不需要手动实现。

### 11.2.6 屏幕子类型

利用以上所有知识，可以构建一个简单的屏幕。为了更容易理解，屏幕的组件将按通常遇到的顺序提及。

首先，所有屏幕都包含一个 `Component`，其表示屏幕的标题。此组件通常由其子类型之一绘制到屏幕上。它仅用于讲述消息的基本屏幕。

#### 初始化

一旦屏幕被初始化，就会调用 `#init` 方法。`#init` 方法将屏幕内的初始设置从 `ItemRenderer` 和 `Minecraft` 实例设置为游戏缩放的相对宽度和高度。任何设置，如添加小部件或预计算相对坐标，都应该用这种方法完成。如果调整游戏窗口的大小，屏幕将通过调用 `#init` 方法重新初始化。

有三种方法可以将小部件添加到屏幕中，每种方法都有各自的用途：

| 方法 | 描述 |
|------|------|
| `#addWidget` | 添加一个可交互和讲述但不被渲染的小部件。 |
| `#addRenderableOnly` | 添加一个只会被渲染的小部件；它既不可互动，也不可被讲述。 |
| `#addRenderableWidget` | 添加一个可交互、讲述和被渲染的小部件。 |

通常，`#addRenderableWidget` 将是最常用的。

```java
// 在某个 Screen 子类中
@Override
protected void init() {
    super.init();
    // 添加小部件和已预计算的值
    this.addRenderableWidget(new EditBox(/* ... */));
}
```

#### 计时屏幕

屏幕也会使用 `#tick` 方法计时来执行某种级别的客户端逻辑以进行渲染。最常见的例子是 `EditBox` 的光标闪烁。

```java
// 在某个 Screen 子类中
@Override
public void tick() {
    super.tick();
    // 在 editBox 中为 EditBox 添加计时逻辑
    this.editBox.tick();
}
```

#### 输入处理

由于屏幕是 `GuiEventListener` 的子类型，输入处理器也可以被覆盖，例如用于处理特定按键上的逻辑。

#### 屏幕的渲染

最后，屏幕是通过作为 `Renderable` 子类型提供的 `#render` 方法进行渲染的。如前所述，`#render` 方法绘制屏幕必须渲染每一帧的所有内容，如背景、小部件、提示文本等。默认情况下，`#render` 方法仅将小部件渲染到屏幕上。

在通常不由子类型处理的屏幕中渲染的两件最常见的事情是背景和提示文本。

背景可以使用 `#renderBackground` 进行渲染，其中一种方法在无法渲染屏幕后面的级别时，每当渲染屏幕时，都会将 v 偏移值作为选项背景。

提示文本通过 `GuiGraphics#renderTooltip` 或 `GuiGraphics#renderComponentTooltip` 进行渲染，它们可以接受正在渲染的文本组件、可选的自定义提示文本组件以及提示文本应在屏幕上渲染的 x/y 相对坐标。

```java
// 在某个 Screen 子类中
// mouseX和mouseY指示鼠标光标在屏幕上的缩放坐标
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    // 通常首先渲染背景
    this.renderBackground(graphics);
    // 在此处渲染在小部件之前渲染的内容（背景纹理）
    // 然后是窗口小部件，如果这是 Screen 的直接子项
    super.render(graphics, mouseX, mouseY, partialTick);
    // 在小部件之后渲染的内容（工具提示）
}
```

#### 屏幕的关闭

当屏幕关闭时，有两种方法处理屏幕的关闭：`#onClose` 和 `#removed`。

每当用户做出关闭当前屏幕的输入时，就会调用 `#onClose`。此方法通常用作回调，以销毁和保存屏幕本身中的任何内部进程。这包括向服务端发送数据包。

`#removed` 在屏幕更改并被释放到垃圾收集器之前被调用。这将处理任何尚未重置回屏幕打开前初始状态的内容。

```java
// 在某个 Screen 子类中
@Override
public void onClose() {
    // 在此处停止任何处理器
    // 最后调用，以防干扰重写后的方法体
    super.onClose();
}

@Override
public void removed() {
    // 在此处重置初始状态
    // 最后调用，以防干扰重写后的方法体
    super.removed();
}
```

### 11.2.7 AbstractContainerScreen

如果一个屏幕直接连接到菜单（Menu），那么其应改为继承 `AbstractContainerScreen`。`AbstractContainerScreen` 充当菜单的渲染器和输入处理程序，包含用于与 Slot 同步和交互的逻辑。因此，通常只需要重写或实现两个方法就可以拥有一个可工作的容器屏幕。同样，为了更容易理解，容器屏幕的组件将按通常遇到的顺序提及。

`AbstractContainerScreen` 通常需要三个参数：打开的容器菜单（用泛型 `T` 表示）、玩家物品栏（仅用于显示名称）和屏幕本身的标题。在这里，可以设置多个定位字段：

| 字段 | 描述 |
|------|------|
| imageWidth | 用于背景的纹理的宽度。这通常位于 256 x 256 的 PNG 中，默认值为 176。 |
| imageHeight | 用于背景的纹理的高度。这通常位于 256 x 256 的 PNG 中，默认值为 166。 |
| titleLabelX | 将渲染屏幕标题的位置的相对 x 坐标。 |
| titleLabelY | 将渲染屏幕标题的位置的相对 y 坐标。 |
| inventoryLabelX | 将渲染玩家物品栏名称的位置的相对 x 坐标。 |
| inventoryLabelY | 将渲染玩家物品栏名称的位置的相对 y 坐标。 |

**重要**：在上一节中提到应该在 `#init` 方法中设置预先计算的相对坐标。这仍然保持正确，因为这里提到的值不是预先计算的坐标，而是静态值和相对坐标。

图像值是静态的且不变，因为它们表示背景纹理大小。为了在渲染时更容易，在 `#init` 方法中预先计算了两个附加值（`leftPos` 和 `topPos`），该方法标记了将渲染背景的左上角。标签坐标相对于这些值。`leftPos` 和 `topPos` 也被用作渲染背景的方便方式，因为它们已经表示要传递到 `#blit` 方法中的位置。

```java
// 在某个 AbstractContainerScreen 子类中
public MyContainerScreen(MyMenu menu, Inventory playerInventory, Component title) {
    super(menu, playerInventory, title);
    this.titleLabelX = 10;
    this.inventoryLabelX = 10;
    /*
     * 如果 'imageHeight' 已更改，则还必须更改 'inventoryLabelY'，因为该值取决于 'imageHeight' 值。
     */
}
```

#### 屏幕的访问

当菜单被传递给屏幕时，菜单中的任何值（通过 Slot、数据 Slot 或自定义系统）都可以通过 `menu` 字段访问。

#### 容器的计时

当玩家活着并通过 `menu` 查看屏幕时，容器屏幕在 `#containerTick` 方法中计时。这基本上取代了容器屏幕中的 `#tick`，其最常见的用法是在配方书中计时。

```java
// 在某个 AbstractContainerScreen 子类中
@Override
protected void containerTick() {
    super.containerTick();
    // 在此处对某些事计时
}
```

#### 容器屏幕的渲染

容器屏幕通过三种方法进行渲染：`#renderBg`，用于渲染背景纹理；`#renderLabels`，用于在背景顶部渲染任何文本；以及 `#render`，除了提供灰色背景和提示文本外，还包含前两种方法。

从 `#render` 开始，最常见的重写（通常是唯一的情况）是添加背景，调用 super 来渲染容器屏幕，以及最后在其顶部渲染提示文本。

在 super 中，`#renderBg` 被调用以渲染屏幕的背景。最标准的代表是使用三个方法调用：两个用于设置，一个用于绘制背景纹理。

最后，调用 `#renderLabels` 来渲染背景上方但提示文本下方的任何文本。这个简单的调用使用字体来绘制相关的组件。

**注意**：渲染标签时，不需要指定 `leftPos` 和 `topPos` 偏移量。这些已经在 `PoseStack` 中进行了转换，因此该方法中的所有内容都是相对于这些坐标绘制的。

```java
// 在某个 AbstractContainerScreen 子类中
@Override
public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
    this.renderBackground(graphics);
    super.render(graphics, mouseX, mouseY, partialTick);
    /*
     * 该方法由容器屏幕添加，用于渲染悬停在其上的任何 Slot 的提示文本。
     */
    this.renderTooltip(graphics, mouseX, mouseY);
}
```

```java
// 背景纹理的位置（assets/<namespace>/<path>）
private static final ResourceLocation BACKGROUND_LOCATION = new ResourceLocation(MOD_ID, "textures/gui/container/my_container_screen.png");

@Override
protected void renderBg(GuiGraphics graphics, float partialTick, int mouseX, int mouseY) {
    /*
     * 将背景纹理渲染到屏幕上。'leftPos' 和 'topPos' 应该已经表示纹理应该渲染
     * 的左上角，因为它是根据 'imageWidth' 和 'imageHeight' 预计算的。两个零
     * 表示 256 x 256 PNG 文件中的整数 u/v 坐标。
     */
    graphics.blit(BACKGROUND_LOCATION, this.leftPos, this.topPos, 0, 0, this.imageWidth, this.imageHeight);
}
```

```java
@Override
protected void renderLabels(GuiGraphics graphics, int mouseX, int mouseY) {
    super.renderLabels(graphics, mouseX, mouseY);
    // 假设我们有个组件 'label'
    // 'label' 在 'labelX' 和 'labelY' 处被绘制
    graphics.drawString(this.font, this.label, this.labelX, this.labelY, 0x404040);
}
```

### 11.2.8 注册一个 AbstractContainerScreen

要将 `AbstractContainerScreen` 与菜单一起使用，需要对其进行注册。这可以通过调用模组事件总线上的 `FMLClientSetupEvent` 中的 `MenuScreens#register` 来完成。

**警告**：`MenuScreens#register` 不是线程安全的，因此它需要在并行调度事件提供的 `#enqueueWork` 内部调用。

```java
// 该事件已在模组事件总线上被监听
private void clientSetup(FMLClientSetupEvent event) {
    event.enqueueWork(
        // 假设：RegistryObject<MenuType<MyMenu>> MY_MENU
        // 假设 MyContainerScreen<MyMenu>，其接受三个参数
        () -> MenuScreens.register(MY_MENU.get(), MyContainerScreen::new)
    );
}
```