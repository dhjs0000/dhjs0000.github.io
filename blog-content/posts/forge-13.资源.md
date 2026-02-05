---
title: Forge 1.20.1开发文档-13 资源
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 15
---

> 本文档来源于Forge官方中文文档，侵删

## 13. 资源

### 13.1 客户端资源（Assets）

#### 13.1.1 资源包

资源包允许通过 `assets` 目录自定义客户端资源。这包括纹理、模型、声音、本地化和其他。你的模组（以及 Forge 本身）也可以有资源包。

资源包存储在项目的资源中。`assets` 目录包含该包的内容，而该包本身则由 `pack.mcmeta` 文件旁边的定义。

---

#### 13.1.2 模型

**模型文件**：  
模型和纹理通过 `ResourceLocation` 链接，但 `ModelResourceLocation` 用于方块状态。模型通过方块或物品的注册表名称在不同位置引用。

**纹理**：  
纹理和模型一样，包含在资源包中，并被称为 `ResourceLocation`。在 Minecraft 中，UV 坐标 (0,0) 表示左上角。UV 总是从 0 到 16。

> **注意**  
> 纹理应该是正方形的，纹理的边长应该是 2 的幂，否则会破坏 mipmapping。

**纹理色调**：  
模型支持在面上指定"色调索引"，这是可以由 `BlockColor`/`ItemColor` 处理的整数。

```java
@SubscribeEvent
public void registerBlockColors(RegisterColorHandlersEvent.Block event){
  event.register(myBlockColor, coloredBlock1, coloredBlock2, ...);
}

@SubscribeEvent
public void registerItemColors(RegisterColorHandlersEvent.Item event){
  event.register(myItemColor, coloredItem1, coloredItem2, ...);
}
```

**物品属性**：  
物品属性是将物品的"属性"公开给模型系统的一种方式。

```java
private void setup(final FMLClientSetupEvent event)
{
  event.enqueueWork(() -> {
    ItemProperties.register(ExampleItems.APPLE, 
      new ResourceLocation(ExampleMod.MODID, "pulling"), 
      (stack, level, living, id) -> {
        return living != null && living.isUsingItem() && living.getUseItem() == stack ? 1.0F : 0.0F;
      });
  });
}
```

---

### 13.2 服务端数据（Data）

#### 13.2.1 数据包

在 1.13 中，Mojang 在游戏基底中添加了数据包。它们允许通过 `data` 目录修改逻辑服务端的文件。这包括进度、战利品表、结构、配方、标签等。

---

#### 13.2.2 配方

**由数据驱动的配方**：  
原版中的大多数配方实现都是通过 JSON 进行数据驱动的。创建新配方不需要模组，只需要数据包。

**配方管理器**：  
配方是通过 `RecipeManager` 加载和存储的。

```java
// 在具有 IItemHandlerModifiable 处理器的某个方法中
recipeManger.getRecipeFor(RecipeType.CRAFTING, new RecipeWrapper(handler), level);
```

**配方的 ItemStack 结果**：  
除了 `minecraft:stonecutting` 配方外，所有原版配方序列化器都会将完整的 `ItemStack` 作为 `result` 标签传递，而不仅仅是物品名称和数量。

```json
"result": {
  "item": "examplemod:example_item",
  "count": 4,
  "nbt": {
    // 在此处添加标签数据
  }
}
```

**自定义配方**：  
每个配方定义都由三个组件组成：`Recipe` 实现、`RecipeType` 和 `RecipeSerializer`。

```java
public record ExampleRecipe(Ingredient input, int data, ItemStack output) implements Recipe<Container> {
  // 在此处实现方法
}
```

**配方序列化器**：
```java
@Override
public RecipeSerializer<?> getSerializer() {
  return EXAMPLE_SERIALIZER.get();
}
```

**非物品逻辑**：  
如果物品未用作配方输入或结果的一部分，则需要添加到自定义 `Recipe` 实例中。

---

#### 13.2.3 战利品表

战利品表是逻辑文件，它规定了当发生各种操作或场景时应该发生什么。

**使用战利品表**：  
战利品表由其 `ResourceLocation` 指向的引用。与引用相关联的 `LootTable` 可以使用 `LootDataResolver#getLootTable` 获得。

```java
// 对于某个战利品池
{
  "name": "example_pool", // 战利品池将被命名为 'example_pool'
  "rolls": {
    // ...
  },
  "entries": {
    // ...
  }
}
```

**抢夺修改器**：  
战利品表现在除了受到抢夺附魔的影响外，还受到 Forge 事件总线上的 `LootingLevelEvent` 的影响。

**熔炼时的多个物品**：  
当使用 `SmeltItemFunction` 时，熔炼配方现在将返回结果中的实际物品数。

**战利品表 Id 条件**：
```json
{
  "conditions": [
    {
      "condition": "forge:loot_table_id",
      "loot_table_id": "minecraft:blocks/dirt"
    }
  ]
}
```

**"工具能否执行操作"条件**：
```json
{
  "conditions": [
    {
      "condition": "forge:can_tool_perform_action",
      "action": "axe_strip"
    }
  ]
}
```

---

#### 13.2.4 全局战利品修改器

全局战利品修改器是一种数据驱动的方法，可以处理收割掉落的修改。

**注册一个全局战利品修改器**：  
需要 4 件事物：
1. `global_loot_modifiers.json`
2. 代表修改器的序列化 JSON
3. 继承自 `IGlobalLootModifier` 的类
4. 使用编解码器对操作类进行编码和解码

**global_loot_modifiers.json**：  
表示要加载到游戏中的所有战利品修改器。此文件必须放在 `data/forge/loot_modifiers/global_loot_modifiers.json`。

```json
{
  "replace": false,
  "entries": [
    "examplemod:example_glm",
    "examplemod:example_glm2"
  ]
}
```

**IGlobalLootModifier**：  
必须指定一个实现。`#apply` 获取将与上下文信息一起生成的当前战利品，返回要生成的掉落物列表。

```java
public class ExampleModifier extends LootModifier {
  public ExampleModifier(LootItemCondition[] conditionsIn, String prop1, int prop2, Item prop3) {
    super(conditionsIn);
    // 存储其余参数
  }

  @NotNull
  @Override
  protected ObjectArrayList<ItemStack> doApply(ObjectArrayList<ItemStack> generatedLoot, LootContext context) {
    // 修改战利品并返回新的掉落物
  }

  @Override
  public Codec<? extends IGlobalLootModifier> codec() {
    // 返回用于编码和解码此修改器的编解码器
  }
}
```

---

#### 13.2.5 标签

标签是游戏中用于将相关事物分组在一起并提供快速成员身份检查的通用对象集。

**声明你自己的组别**：  
标签在你的模组的数据包中声明。例如，给定标识符为 `modid:foo/tagname` 的将引用位于 `/data/<modid>/tags/blocks/foo/tagname.json` 的标签。

```json
{
  "replace": false,
  "values": [
    "minecraft:gold_ingot",
    "mymod:my_ingot",
    {
      "id": "othermod:ingot_other",
      "required": false
    }
  ]
}
```

**在代码中使用标签**：
```java
public static final TagKey<Item> myItemTag = ItemTags.create(new ResourceLocation("mymod", "myitemgroup"));

// 在某个方法中：
ItemStack stack = /*...*/;
boolean isInItemGroup = stack.is(myItemTag);
```

**惯例**：
- 如果有适合你的方块或物品的原版标签，请将其添加到该标签中
- 如果有一个 Forge 标签适合你的方块或物品，请将其添加到该标签中
- 如果有一组你认为应该由社区共享的东西，请使用 `forge` 命名空间

---

#### 13.2.6 进度

原版中的所有进度实现都是通过 JSON 进行数据驱动的。

**进度标准**：  
若要解锁一个进度，必须满足指定的标准。通过执行某个动作时执行的触发器来跟踪标准。

```json
{
  "criteria": {
    "example_criterion1": { /*...*/ },
    "example_criterion2": { /*...*/ }
  },
  "requirements": [
    [
      "example_criterion1",
      "example_criterion2"
    ]
  ]
}
```

**自定义标准触发器**：  
可以通过为已创建的 `AbstractCriterionTriggerInstance` 子类实现 `SimpleCriterionTrigger` 来创建自定义条件触发器。

```java
public static final ExampleTriggerInstance createInstance(JsonObject json, ContextAwarePredicate player, DeserializationContext context) {
  // 从 JSON 中读取条件
  return new ExampleTriggerInstance(player, item);
}
```

**ForgeAdvancementProvider**：  
Forge 提供了一个名为 `ForgeAdvancementProvider` 的扩展，它可以更好地集成以生成进度。

```java
@Override
public void generate(HolderLookup.Provider registries, Consumer<Advancement> writer, ExistingFileHelper existingFileHelper) {
  Advancement example = Advancement.Builder.advancement()
    .addCriterion("example_criterion", triggerInstance)
    .save(writer, name, existingFileHelper);
}
```
#### 13.2.7 条件性加载数据

有时，模组开发者可能希望包括一些使用来自另一个模组的信息的数据驱动的对象，而不必明确地使该模组成为依赖项。

**实现**：  
目前，条件加载已针对配方和进度实现。

```json
{
  "type": "forge:conditional",
  "recipes": [
    {
      "conditions": [
        {
          "type": "forge:mod_loaded",
          "modid": "examplemod"
        }
      ],
      "recipe": {
        // 如果所有条件都成功，则使用的配方
      }
    }
  ]
}
```

**条件类型**：
- `forge:true` / `forge:false` - 布尔条件
- `forge:not` / `forge:and` / `forge:or` - 布尔运算符
- `forge:mod_loaded` - 检查模组是否加载
- `forge:item_exists` - 检查物品是否存在
- `forge:tag_empty` - 检查标签是否为空
