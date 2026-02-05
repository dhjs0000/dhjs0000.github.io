---
title: Forge 1.20.1开发文档-12 渲染
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 14
---

> 本文档来源于Forge官方中文文档，侵删

## 12. 渲染

### 12.1 模型扩展

#### 12.1.1 根变换

在模型 JSON 的顶层添加 `transform` 条目向加载器建议，在方块模型的情况下，应在方块状态文件中的旋转之前对所有几何体应用变换，在物品模型的情况中，应在显示变换之前对其应用变换。转换可通过 `IGeometryBakingContext#getRootTransform()` 获得。自定义模型加载器可能会完全忽略此字段。

根变换可以用两种格式指定：

**格式 1：矩阵对象**  
一个 JSON 对象，包含一个奇异的 `matrix` 条目，该条目包含一个嵌套 JSON 数组形式的原始转换矩阵，省略了最后一行（3×4 矩阵，行主序）。矩阵是按平移、左旋转、缩放、右旋转和变换原点的顺序组成的。

```json
"transform": {
    "matrix": [
        [ 0, 0, 0, 0 ],
        [ 0, 0, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ]
}
```

**格式 2：变换组件对象**  
一个 JSON 对象，包含以下可选项的任意组合：
- `origin`：用于旋转和缩放的原点
- `translation`：相对平移
- `rotation`：在缩放之前围绕要应用的平移原点旋转（即左旋转）
- `scale`：相对于平移原点的比例
- `left_rotation`：在缩放之前围绕要应用的平移原点旋转
- `right_rotation`：在缩放之后要应用的围绕平移原点的旋转
- `post_rotation`：在缩放之后要应用的围绕平移原点的旋转

这些条目将按照 `translation`、`left_rotation`、`scale`、`right_rotation` 的顺序应用。转换将移动到指定的原点，作为最后一步。

```json
"transform": {
    "origin": "center",
    "translation": [ 0, 0.5, 0 ],
    "rotation": { "y": 45 }
}
```

**原点定义**：  
原点可以指定为表示三维矢量的 3 个浮点数的数组：`[x, y, z]`  
也可以指定为三个默认值之一：
- `corner` → `(0, 0, 0)`
- `center` → `(0.5, 0.5, 0.5)`  
- `opposing-corner` → `(1, 1, 1)`

如果未指定原点，则其默认为 `(0, 0, 0)`。

**平移定义**：  
平移必须指定为表示三维矢量的 3 个浮点数的数组：`[x, y, z]`，如果不存在，则默认为 `(0, 0, 0)`。

**旋转定义**：  
左旋转和右旋转可以通过以下四种方式中的任何一种指定：
1. 具有单轴→旋转度映射的单个 JSON 对象：`{ "x": 90 }`
2. 具有上述格式的任意数量的 JSON 对象的数组（按指定顺序应用）：`[ { "x": 90 }, { "y": 45 }, { "x": -22.5 } ]`
3. 由 3 个浮点数组成的数组，指定围绕每个轴的旋转（以度为单位）：`[90, 180, 45]`
4. 直接指定四元数的 4 个浮点数的数组：`[0.38268346, 0, 0, 0.9238795]`

如果未指定相应的旋转，则默认为无旋转。

**缩放定义**：  
比例必须指定为表示三维矢量的 3 个浮点数的数组：`[x, y, z]`，如果不存在，则默认为 `(1, 1, 1)`。

---

#### 12.1.2 渲染类型

在 JSON 的顶层添加 `render_type` 条目会向加载器建议模型应该使用什么渲染类型。如果未指定，加载器将选择所使用 `ItemBlockRenderTypes#getRenderLayers()` 返回的渲染类型。自定义模型加载器可能会完全忽略此字段。

> **注意**  
> 自 1.19 以来，这比不推荐的通过 `ItemBlockRenderTypes#setRenderLayer()` 为方块设置适用渲染类型的方法更可取。

**具有玻璃纹理的透明方块模型示例**：
```json
{
  "render_type": "minecraft:cutout",
  "parent": "block/cube_all",
  "textures": {
    "all": "block/glass"
  }
}
```

**原版值**：  
Forge 提供了以下具有相应区块和实体渲染类型的选项：

| 渲染类型名称 | 区块渲染类型 | 实体渲染类型 | 说明 |
|--------------|--------------|--------------|------|
| `minecraft:solid` | `RenderType#solid()` | `ForgeRenderTypes#ITEM_LAYERED_SOLID` | 用于完全固体方块（即石头） |
| `minecraft:cutout` | `RenderType#cutout()` | `ForgeRenderTypes#ITEM_LAYERED_CUTOUT` | 用于任何给定像素完全透明或完全不透明的方块（即玻璃方块） |
| `minecraft:cutout_mipped` | `RenderType#cutoutMipped()` | `ForgeRenderTypes#ITEM_LAYERED_CUTOUT` | 用于任何给定像素是完全透明或完全不透明的方块，并且纹理应在较大距离上缩小（mipmapping）以避免视觉伪影（即树叶） |
| `minecraft:cutout_mipped_all` | `RenderType#cutoutMipped()` | `ForgeRenderTypes#ITEM_LAYERED_CUTOUT_MIPPED` | 方块和实体渲染类型不同，因为 `cutout_mipped` 作为实体渲染类型不可行 |
| `minecraft:translucent` | `RenderType#translucent()` | `ForgeRenderTypes#ITEM_LAYERED_TRANSLUCENT` | 用于任何给定像素可能部分透明的方块（即彩色玻璃） |
| `minecraft:tripwire` | `RenderType#tripwire()` | `ForgeRenderTypes#ITEM_LAYERED_TRANSLUCENT` | 用于具有渲染到天气渲染目标（即绊线）的特殊要求的块 |

**自定义值**：  
要在模型中指定的自定义命名渲染类型可以在 `RegisterNamedRenderTypesEvent` 中注册。此事件在模组事件总线上激发。

自定义命名渲染类型由两个或三个组件组成：
- 区块渲染类型-可以使用 `RenderType.chunkBufferLayers()` 返回的列表中的任何类型
- 具有顶点格式的渲染类型（"实体渲染类型"）
- 具有顶点格式的渲染类型，用于当 Fabulous! 图形模式被选择时（可选）

```java
public static void onRegisterNamedRenderTypes(RegisterNamedRenderTypesEvent event)
{
  event.register("special_cutout", RenderType.cutout(), Sheets.cutoutBlockSheet());
  event.register("special_translucent", RenderType.translucent(), Sheets.translucentCullBlockSheet(), Sheets.translucentItemSheet());
}
```

然后，这些可以在 JSON 中寻址为 `<your_mod_id>:special_cutout` 和 `<your_mod_id>:special_translucent`。

---

#### 12.1.3 部分可见度

在模型 JSON 的顶层添加 `visibility` 条目可以控制模型不同部分的可见性，以决定是否应将它们烘焙到最终的 `BakedModel` 中。"零件"的定义取决于加载此模型的模型加载器，自定义模型加载器可以完全忽略此条目。

在 Forge 提供的模型加载器中，只有复合模型加载器和 OBJ 模型加载器使用了此功能。可见性条目被指定为 `"part name": boolean` 条目。

**具有两个部分的复合模型的示例**：
```json
// mycompositemodel.json
{
  "loader": "forge:composite",
  "children": {
    "part_one": {
      "parent": "mymod:mypartmodel_one"
    },
    "part_two": {
      "parent": "mymod:mypartmodel_two"
    }
  },
  "visibility": {
    "part_two": false
  }
}

// mycompositechild_one.json
{
  "parent": "mymod:mycompositemodel",
  "visibility": {
    "part_one": false,
    "part_two": true
  }
}

// mycompositechild_two.json
{
  "parent": "mymod:mycompositemodel",
  "visibility": {
    "part_two": true
  }
}
```

给定部分的可见性是通过检查模型是否指定了该部分的可见性来确定的，如果不存在，则递归地检查模型的父级，直到找到条目或没有其他父级要检查，在这种情况下，它默认为 true。

这允许进行以下设置，其中多个模型使用单个复合模型的不同部分：
1.  复合模型指定多个组件
2.  多个模型将此复合模型指定为其父模型
3.  这些子模型分别指定部分的不同可见性

---

#### 12.1.4 面数据

在原版的"元素"模型中，可以在元素级别或面级别指定有关元素面的附加数据。未指定自己的面数据的面将返回到元素的面数据，或者如果在元素级别未指定面数据，则返回到默认值。

要将此扩展用于生成的物品模型，必须通过 `forge:item_layers` 扩展为读取此附加数据。

**面数据的全部值都是可选的**。

**元素模型**：  
模型加载程序加载该模型，因为原版物品模型生成器没有。在原版的"元素"模型中，面数据应用于指定它的面，或者指定它的元素中没有自己的面数据的所有面。

> **注意**  
> 如果在面上指定了 `forge_data`，它将不会继承元素级 `forge_data`

```json
{
  "elements": [
    {
      "forge_data": {
        "color": "0xFFFF0000",
        "block_light": 15,
        "sky_light": 15,
        "ambient_occlusion": false
      },
      "faces": {
        "north": {
          "forge_data": {
            "color": "0xFFFF0000",
            "block_light": 15,
            "sky_light": 15,
            "ambient_occlusion": false
          }
        }
      }
    }
  ]
}
```

**生成的物品模型**：  
在使用 `forge:item_layers` 加载程序生成的物品模型中，为每个纹理层指定面数据，并应用于所有几何体（前/后向四边形和边四边形）。

`forge_data` 字段必须位于模型 JSON 的顶层，每个键值对将人脸数据对象与层索引相关联。在以下示例中，层1将着色为红色并以全亮度发光：

```json
{
  "textures": {
    "layer0": "minecraft:item/stick",
    "layer1": "minecraft:item/glowstone_dust"
  },
  "forge_data": {
    "1": {
      "color": "0xFFFF0000",
      "block_light": 15,
      "sky_light": 15,
      "ambient_occlusion": false
    }
  }
}
```

**参数说明**：

| 参数 | 说明 |
|------|------|
| `color` | 使用 `color` 条目指定颜色值将该颜色作为色调应用于四边形。默认值为 `0xFFFFFFFF`（白色，完全不透明）。颜色必须是压缩为 32 位整数的 ARGB 格式，并且可以指定为十六进制字符串（`"0xAARRGGBB"`）或十进制整数文字（JSON 不支持十六进制整数文字）。四种颜色分量与纹理的像素相乘。省略 alpha 分量相当于将其设为 0，这将使几何体完全透明。如果颜色值为常量，则可以用 `BlockColor` 和 `ItemColor` 替换着色。 |
| `block_light` / `sky_light` | 分别使用 `block_light` 和 `sky_light` 条目指定方块和/或天空的亮度值将覆盖四边形的相应亮度值。两个值都默认为 0。这些值必须在 0-15（包括 0-15）的范围内，并且在渲染面时被视为相应光照类型的最小值，这意味着相应光照类型在世界中的较高值将覆盖指定值。指定的亮度值纯粹是客户端的，既不影响服务器的亮度级别，也不影响周围方块的亮度。 |
| `ambient_occlusion` | 指定 `ambient_occlusion` 标志将为四边形配置环境光遮挡（AO）。默认为 `true`。该标志的行为相当于原版格式的顶级 `ambientocclusion` 标志。 |

> **重要**  
> 如果顶级 AO 标志设置为 `false`，则在元素或面上将该标志指定为 `true` 将无法覆盖顶级标志。

```json
{
  "ambientocclusion": false,
  "elements": [
    {
      "forge_data": {
        "ambient_occlusion": true // 无效
      }
    }
  ]
}
```

---

### 12.2 模型加载器

#### 12.2.1 自定义模型加载器

"模型"只是一种形状。它可以是一个简单的立方体，可以是几个立方体，也可以是截角二十面体，或者介于两者之间的任何东西。你将看到的大多数模型都是普通的 JSON 格式。其他格式的模型在运行时由 `IGeometryLoader<IUnbakedGeometry>` 加载到 `IUnbakedGeometry` 中。

Forge 为 WaveFront OBJ 文件、bucket、复合模型、不同渲染层中的模型提供了默认实现，并重新实现了原版的 `builtin/generated` 代码中的表示。

> **警告**  
> 通过模型 JSON 中的顶级 `loader` 条目指定自定义模型加载程序将导致 `BlockModel` 被忽略，除非它被自定义加载程序使用。所有其他普通条目仍将被加载并在未烘焙的表示中可用，并且可能在自定义加载程序之外使用。

**WaveFront OBJ 模型**  
Forge 为 `.obj` 文件格式添加了一个加载程序。要使用这些模型，JSON 必须引用 `forge:obj` 加载程序。此加载程序接受位于已注册命名空间中且路径以 `.obj` 结尾的任何模型位置。

```json
{
  "loader": "forge:obj",
  "flip_v": true,
  "model": "examplemod:models/block/model.obj",
  "textures": {
    "texture0": "minecraft:block/dirt",
    "particle": "minecraft:block/dirt"
  }
}
```

`.mtl` 文件应放置在与要自动使用的 `.obj` 具有相同名称的相同位置。`.mtl` 文件可能需要手动编辑才能更改指向 JSON 中定义的纹理的路径。

---

#### 12.2.2 烘焙模型（BakedModel）

`BakedModel` 是对普通模型加载器调用 `UnbakedModel#bake` 或对自定义模型加载器调用 `IUnbakedGeometry#bake` 的结果。与 `UnbakedModel` 或 `IUnbakedGeometry` 不同，`BakedModel` 纯粹代表一种没有任何物品或方块概念的形状，而不是抽象的。它表示已经优化并简化为可以（几乎）直接送入 GPU 的几何体。

在大多数情况下，实际上没有必要手动实现此接口。可以使用现有的实现之一。

**主要方法**：

| 方法 | 描述 |
|------|------|
| `getOverrides` | 返回要用于此模型的 `ItemOverrides`。仅当此模型被渲染为物品时才使用此选项。 |
| `useAmbientOcclusion` | 如果模型在存档中渲染为方块，则有问题的方块不会发出任何光，并且环境光遮挡处于启用状态。这将导致使用环境光遮挡来渲染模型。 |
| `isGui3d` | 如果模型被渲染为物品栏中的物品，在地面上被渲染为实体，在物品框架上，等等，这会使模型看起来"扁平"。在 GUI 中，这也会禁用照明。 |
| `isCustomRenderer` | 除非你知道自己在做什么，否则只需 `return false` 然后继续其他事项。返回 `true` 将导致模型不被渲染，转而回到 `BlockEntityWithoutLevelRenderer#renderByItem` 中。 |
| `getParticleIcon` | 粒子应使用的任何纹理。对于方块，它将在实体掉落在其上或其被破坏时显示。对于物品，它将在报废或被吃掉时显示。 |
| `getTransforms` | 此方法已废弃，推荐实现 `applyTransform`。参见"变换"章节。 |
| `getQuads` | 这是 `BakedModel` 的主要方法。它返回一个 `BakedQuad` 的列表，包含将用于渲染模型的低级顶点数据的对象。 |

> **注意**  
> `BakedQuad` 中顶点的原点是底部的西北角。小于 0 或大于 1 的顶点坐标值会将顶点定位在该方块之外。为了避免照明问题，请按逆时针顺序提供顶点。

---

#### 12.2.3 变换

当被渲染为物品时，可以根据在哪个上下文中渲染它来应用特殊处理。"变换"是指在什么上下文中渲染模型。可能的转换在代码中由 `ItemDisplayContext` 枚举表示。

| 变换类型 | 说明 |
|----------|------|
| `NONE` | 默认情况下，当未设置上下文时，用于显示实体 |
| `THIRD_PERSON_LEFT_HAND` / `THIRD_PERSON_RIGHT_HAND` | 第三人称值表示当另一个玩家拿着物品，而客户端用第三人称看着它们时 |
| `FIRST_PERSON_LEFT_HAND` / `FIRST_PERSON_RIGHT_HAND` | 第一人称值表示玩家何时将物品握在自己手中 |
| `HEAD` | 表示当任何玩家在头盔槽中佩戴该物品时（例如南瓜） |
| `GUI` | 表示当该物品被在一个 `Screen` 中渲染时 |
| `GROUND` | 表示该物品在存档中作为一个 `ItemEntity` 被渲染时 |
| `FIXED` | 用于物品展示框 |

**原版的方式**：  
原版处理转换的方式是通过 `BakedModel#getTransforms`。此方法返回一个 `ItemTransforms`，这是一个简单的对象，包含各种 `ItemTransform` 作为 `public final` 的字段。

**Forge 的方式**：  
Forge 处理转换的方法是 `BakedModel#applyTransform`，给定一个 `ItemDisplayContext`、`PoseStack` 和一个布尔值来确定是否对左手应用变换，此方法将生成一个要渲染的 `BakedModel`。

---

#### 12.2.4 物品重载（ItemOverrides）

`ItemOverrides` 为 `BakedModel` 提供了一种处理 `ItemStack` 状态并返回新 `BakedModel` 的方法；此后，返回的模型将替换旧模型。

`ItemOverrides` 给定 `ItemOverride` 的列表，该构造函数将复制并烘焙该列表。

可以通过 `ItemProperties#register` 向某个物品添加属性。这需要在 `FMLClientSetupEvent` 中完成，并且必须使用 `FMLClientSetupEvent#enqueueWork` 执行这些任务。

```java
private void setup(final FMLClientSetupEvent event)
{
  event.enqueueWork(() ->
  {
    ItemProperties.register(ExampleItems.APPLE, 
      new ResourceLocation(ExampleMod.MODID, "pulling"), (stack, level, living, id) -> {
        return living != null && living.isUsingItem() && living.getUseItem() == stack ? 1.0F : 0.0F;
      });
  });
}
```