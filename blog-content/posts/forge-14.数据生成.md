---
title: Forge 1.20.1开发文档-14 数据生成
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 16
---

> 本文档来源于Forge官方中文文档，侵删
## 14. 数据生成

### 14.1 数据生成

数据生成器是以编程方式生成模组的资源（asset）和数据（data）的一种方式。

**现存的文件**：  
`ExistingFileHelper` 是负责验证这些数据文件是否存在的类。可以通过 `--existing <folderpath>` 参数允许在验证文件是否存在时使用指定的文件夹。

**生成器模式**：  
数据生成器可以配置为运行 4 个不同的数据生成，通过命令行参数配置：
- `--client` - 在 `assets` 中生成仅客户端文件
- `--server` - 在 `data` 中生成仅服务端文件
- `--dev` - 运行一些开发工具
- `--reports` - 转储所有已注册的方块、物品、命令等
- `--all` - 包含所有的生成器

**数据提供者**：  
所有数据提供者都实现 `DataProvider`。Minecraft 对大多数 asset 和 data 都有抽象实现。

```java
@SubscribeEvent
public void gatherData(GatherDataEvent event) {
    DataGenerator gen = event.getGenerator();
    ExistingFileHelper efh = event.getExistingFileHelper();
    
    gen.addProvider(event.includeClient(), output -> 
        new MyLanguageProvider(output, MOD_ID, "en_us"));
}
```



### 14.2 客户端资源（Assets）

#### 14.2.1 模型生成

默认情况下，可以为模型或方块状态生成模型。每种都提供了一种生成必要 JSON 的方法。

**模型文件**：  
`ModelFile` 充当提供者引用或生成的所有模型的基础。

```java
// 在某个 BlockStateProvider#registerStatesAndModels 中
this.getVariantBuilder(REDSTONE)
  .part()
    .modelFile(redstoneDot)
    .addModel()
    .useOr()
    .nestedGroup()
      .condition(WEST_REDSTONE, NONE)
      .condition(EAST_REDSTONE, NONE)
    .endNestedGroup()
    .end()
  .part()
    .modelFile(redstoneSide0)
    .addModel()
    .condition(NORTH_REDSTONE, SIDE, UP)
    .end();
```

**模型生成器**：  
`ModelBuilder` 包含关于模型的所有数据：它的父级、面、纹理、变换、照明和加载器。

**IntrinsicHolderTagsProvider**：  
一种特殊的 `TagProvider` 是 `IntrinsicHolderTagsProvider`。当通过 `#tag` 使用此提供者创建标签时，可以使用对象本身通过 `#add` 将自己添加到标签中。

#### 14.2.2 语言生成

可以通过子类化 `LanguageProvider` 为模组生成语言文件。

```java
// 在 LanguageProvider#addTranslations 中
this.addBlock(EXAMPLE_BLOCK, "Example Block");
this.add("object.examplemod.example_object", "Example Object");
```

---

#### 14.2.3 音效定义生成

通过子类化 `SoundDefinitionsProvider` 并为模组生成 `sounds.json` 文件。

```java
this.add(EXAMPLE_SOUND_EVENT, definition()
  .subtitle("sound.examplemod.example_sound")
  .with(
    sound(new ResourceLocation(MODID, "example_sound_1"))
      .weight(4)
      .volume(0.5)
  )
);
```

---

### 14.3 服务端数据（Data）

#### 14.3.1 配方生成

通过子类化 `RecipeProvider` 并为模组生成配方。

```java
ShapedRecipeBuilder builder = ShapedRecipeBuilder.shaped(RecipeCategory.MISC, result)
  .pattern("a a")
  .define('a', item)
  .unlockedBy("criteria", criteria)
  .save(writer);

ShapelessRecipeBuilder builder = ShapelessRecipeBuilder.shapeless(RecipeCategory.MISC, result)
  .requires(item)
  .unlockedBy("criteria", criteria)
  .save(writer);
```

**条件性配方**：  
条件性配方也可以通过 `ConditionalRecipe$Builder` 生成的数据。

```java
ConditionalRecipe.builder()
  .addCondition(...)
  .addRecipe(...)
  .generateAdvancement()
  .build(writer, name);
```

---

#### 14.3.2 战利品表生成

通过构造新的 `LootTableProvider` 并为模组生成战利品表。

```java
new LootTableProvider.SubProviderEntry(
  ExampleSubProvider::new,
  LootContextParamSets.EMPTY
)
```

**战利品表生成器**：  
战利品表是基本对象，可以使用 `LootTable#lootTable` 构建。

---

#### 14.3.3 标签生成

通过子类化 `TagsProvider` 并为模组生成标签。

```java
this.tag(EXAMPLE_TAG)
  .add(EXAMPLE_OBJECT)
  .addOptional(new ResourceLocation("othermod", "other_object"))
  .addTag(EXAMPLE_TAG)
  .remove(EXAMPLE_OBJECT);
```

---

#### 14.3.4 进度生成

通过构建新的 `AdvancementProvider` 并为模组生成进度。

```java
ForgeAdvancementProvider example = ForgeAdvancementProvider.advancement()
  .addCriterion("example_criterion", triggerInstance)
  .save(writer, name, existingFileHelper);
```

---

#### 14.3.5 全局战利品修改器生成

通过子类化 `GlobalLootModifierProvider` 并为模组生成全局战利品修改器（GLM）。

```java
this.add("example_modifier", new ExampleModifier(
  new LootItemCondition[] {
    WeatherCheck.weather().setRaining(true).build()
  },
  "val1", 10, Items.DIRT
));
```

---

#### 14.3.6 数据包注册表对象生成

通过构造新的 `DatapackBuiltinEntriesProvider` 并为模组生成数据包注册表对象。

```java
new RegistrySetBuilder()
  .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
    bootstrap.register(EXAMPLE_CONFIGURED_FEATURE, new ConfiguredFeature(...));
  })
  .add(Registries.PLACED_FEATURE, bootstrap -> {
    HolderGetter<ConfiguredFeature<?, ?>> configured = bootstrap.lookup(...);
    bootstrap.register(EXAMPLE_PLACED_FEATURE, new PlacedFeature(...));
  });
```