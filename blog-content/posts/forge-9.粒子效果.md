---
title: Forge 1.20.1开发文档-9 粒子效果
date: 2026-01-30
category: 技术文档
author: Community
tags: ["Forge", "教程"]
excerpt: Forge 1.20.1开发文档
blog_number: 11
---

> 本文档来源于Forge官方中文文档，侵删
## 9.1 粒子效果

粒子是游戏中的一种效果，用于打磨游戏，以更好地提高沉浸感。由于它们的创建和引用方法，其有用性也需要非常谨慎地对待。

### 9.1.1 创建一个粒子

粒子被分解为仅用于显示粒子的仅客户端实现和用于引用来自服务端的粒子或同步数据的通用实现。

| 类 | 物理端 | 描述 |
|----|--------|------|
| ParticleType | BOTH | 粒子类型定义的注册表对象，用于引用任一端位的粒子 |
| ParticleOptions | BOTH | 用于将来自网络或命令的信息同步到相关客户端的数据保持器 |
| ParticleProvider | CLIENT | 由`ParticleType`注册的工厂，用于从关联的`ParticleOptions`构造`Particle` |
| Particle | CLIENT | 要在关联客户端上显示的可渲染逻辑 |

**ParticleType**

每个`ParticleType`是定义特定粒子类型的注册表对象，并提供对两端位特定粒子的可用引用。因此，每个`ParticleType`都必须注册。`ParticleType`都有两个参数：一个`ParticleOptions$Deserializer`，用于确定粒子是否在不考虑距离的情况下渲染，以及一个`overrideLimiter`。其表示如何对与该类型相关的`ParticleOptions`进行编码和解码。由于基类`ParticleType`是抽象类，因此需要实现一个`ParticleType#codec`方法。

**注意**：`ParticleType#codec`仅在用于原版实现的生物群系编解码器中使用。

**SimpleParticleType**

在大多数情况下，不需要将任何粒子数据发送到客户端。对于这些例子，更容易创建`SimpleParticleType`：`ParticleType`和`ParticleOptions`的新实例：一个对`ParticleType`的实现，除了类型之外，它不向客户端发送任何自定义数据。除了红石粉之外，对于着色和依赖方块/物品的粒子而言，大多数原版`ParticleType`实现还使用`SimpleParticleType`。

**重要**：如果`ParticleType`仅在客户端上引用，则生成粒子时`ParticleOptions`非必要。但是，有必要使用`ParticleEngine`中的任何预构建逻辑，或者从服务端生成粒子。

**ParticleOptions**

`ParticleOptions`表示每个粒子所接收的数据。它还用于发送通过服务端生成的粒子的数据。所有粒子生成方法都接受一个`ParticleOptions`，这样它就知道粒子的类型以及与生成方法关联的数据。

`ParticleOptions`方法被拆分为三种方法：

| 方法 | 描述 |
|------|------|
| getType | 获取粒子的类型定义，或`ParticleType` |
| writeToNetwork | 将粒子数据写入服务端上的缓冲区以发送到客户端 |
| writeToString | 将粒子数据写入字符串 |

这些对象要么是根据需要动态构建的，要么是作为`SimpleParticleType`的结果而产生的单体。

**ParticleOptions$Deserializer**

要在客户端上接收`ParticleOptions`，或引用命令中的数据，必须通过`ParticleOptions$Deserializer`对粒子数据进行反序列化。

`ParticleOptions$Deserializer`中的每个方法都对等`ParticleOptions`的编码方法：

| 方法 | 描述 |
|------|------|
| fromCommand | 从字符串（通常是从命令）中解码粒子数据 |
| fromNetwork | 解码客户端缓冲区中的粒子数据 |

当需要发送自定义粒子数据时，此对象会传递到`ParticleType`的构造函数中。

**Particle**

粒子提供将所述数据绘制到屏幕上所需的渲染逻辑。要创建任何`Particle`，必须实现两个方法：

| 方法 | 描述 |
|------|------|
| render | 将粒子渲染到屏幕上 |
| getRenderType | 获取粒子的渲染类型 |

用于渲染纹理的`Particle`的一个常见子类是`TextureSheetParticle`。虽然需要实现`Particle#getRenderType`，但无论设置了什么纹理sprite，都将在粒子的位置进行渲染。

**ParticleRenderType**

`ParticleRenderType`是`RenderType`的一个变体，它为该类型的每个粒子构造启动和拆卸阶段，然后通过`Tesselator`同时渲染所有粒子。粒子可以使用六种不同的渲染类型。

| 渲染类型 | 描述 |
|----------|------|
| TERRAIN_SHEET | 渲染纹理位于可用方块内的粒子 |
| PARTICLE_SHEET_OPAQUE | 渲染纹理不透明且位于可用粒子内的粒子 |
| PARTICLE_SHEET_TRANSLUCENT | 渲染纹理为半透明且位于可用粒子内的粒子 |
| PARTICLE_SHEET_LIT | 与PARTICLE_SHEET_OPAQUE相同，但不使用粒子着色器 |
| CUSTOM | 提供混合和深度遮罩的设置，但不提供将在Particle#render中实现的渲染功能 |
| NO_RENDER | 粒子将永远不会渲染 |

实现自定义渲染类型将留给读者练习。

**ParticleProvider**

最后，粒子通常是通过`ParticleProvider`创建的。工厂有一个单一的方法，用于在给定粒子数据、客户端存档、位置和移动增量的情况下创建粒子。由于`ParticleProvider`不受任何特定的`ParticleType`约束，因此可以根据需要在不同的工厂中重复使用。

**ParticleDescription、SpriteSet、以及SpriteParticleRegistration**

必须通过订阅模组事件总线上的`RegisterParticleProvidersEvent`以注册`ParticleProvider`。在事件中，可以通过向`#registerSpecial`方法提供工厂实例，通过注册工厂。

**重要**：`RegisterParticleProvidersEvent`应仅在客户端上调用，因此在某些客户端类中被单端化独立，并被`@EventBusSubscriber`或`DistExecutor`引用。

有三种粒子渲染类型不能使用上述注册方法：`PARTICLE_SHEET_OPAQUE`、`PARTICLE_SHEET_TRANSLUCENT`和`PARTICLE_SHEET_LIT`。这是因为这三种粒子渲染类型都使用由`ParticleEngine`直接加载的sprite集。因此，所提供的纹理必须通过不同的方法获得和注册。这将假设你的粒子是`TextureSheetParticle`的子类型，因为这是该逻辑的唯一原版实现。

要将纹理添加到粒子，必须将一个新的JSON文件添加到`assets/<modid>/particles`。这被称为`ParticleDescription`。该文件的名称将代表工厂所附加的`ParticleType`的注册表名称。每个粒子JSON都是一个对象。该对象存储单个关键的`textures`，该键包含`ResourceLocation`的一个数组。此处表示的任何纹理都将指向`assets/<modid>/textures/particle/<path>.png`处的纹理。

```json
{
  "textures": [
    // 将指向位于以下位置的纹理
    // assets/mymod/textures/particle/particle_texture.png
    "mymod:particle_texture",
    // 纹理应按绘制顺序排列
    // 例如，particle_texture将首先渲染，然后在一些时间后渲染particle_texture2
    "mymod:particle_texture2"
  ]
}
```

`TextureSheetParticle`包含一个纹理列表，这些纹理引用了我们的`ParticleDescription`定义的sprite。

`SpriteSet`有两个方法，这两个方法都以不同方法获取`TextureAtlasSprite`。第一种方法接受两个整数。其背后的实现允许sprite在老化时进行纹理更改。第二种方法接受一个`Random`实例，从sprite集中获取随机纹理。

`SpriteSet`可以使用`TextureSheetParticle`中的一个辅助方法在`ParticleProvider`上设置sprite：

- `#setSpriteFromAge`：使用两个整数的百分比方法拾取纹理。
- `#pickSprite`：使用拾取纹理的随机方法。

要注册这些粒子纹理，需要向`RegisterParticleProvidersEvent#registerSpriteSet`方法提供一个`SpriteParticleRegistration`。此方法接收一个`IClientItemExtensions`，其中包含粒子的相关sprite集，并创建一个接受`ParticleProvider$Sprite`并让构造函数接受`SpriteSet`来创建粒子。最简单的实现方法可以通过`ParticleProvider`来完成。然后，`SpriteSet`可以正常地传递给粒子。

**注意**：如果你注册的是仅包含一个纹理的`TextureSheetParticle`子类型，则可以转而向`#registerSprite`提供`ParticleProvider`，其与`ParticleProvider`具有基本相同的功能接口方法。

### 9.1.2 生成一个粒子

粒子可以在任一存档实例中生成。但是，每一端都有一种特定的方式来生成粒子。

如果在`ClientLevel`上，可以调用`#addParticle`来生成粒子，或者可以调用`#addAlwaysVisibleParticle`以生成从任何距离可见的粒子。

如果在`ServerLevel`上，则可以调用`#sendParticles`向客户端发送数据包以生成粒子。在服务端上调用两个`ClientLevel`方法将会一无所获。

## 9.2 音效

### 9.2.1 术语

| 术语 | 描述 |
|------|------|
| 音效事件 | 触发音效效果的东西。例子包括`minecraft:block.anvil.hit`或`botania:spreader_fire` |
| 音效类别 | 音效的类别，例如`master`、`player`或`block`。音效设置GUI中的滑块展示这些类别。|
| 音效文件 | 字面意义上的磁盘上播放的文件：一个.ogg文件。|

### 9.2.2 sounds.json

此JSON定义音效事件，并定义它们播放的音效文件、字幕等。音效事件用`ResourceLocation`标识。应该位于资源命名空间的根目录（`assets/<namespace>/sounds.json`），且在该命名空间中定义音效事件（`assets/<namespace>/soundes.json`）。

原版wiki上提供了完整的规范，但这个例子强调了重要的部分：

```json
{
  "open_chest": {
    "subtitle": "mymod.subtitle.open_chest",
    "sounds": [ "mymod:open_chest_sound_file" ]
  },
  "epic_music": {
    "sounds": [
      {
        "name": "mymod:music/epic_music",
        "stream": true
      }
    ]
  }
}
```

在顶级对象的下面，每个键都对应一个音效事件。请注意，没有给出命名空间，因为它取自JSON本身的命名空间。每个事件指定启用字幕时要显示的本地化翻译键。最后，指定要播放的实际音效文件。请注意，该值是一个数组；如果指定了多个音效文件，则每当触发音效事件时，游戏将随机选择一个播放。

这两个示例代表了指定音效文件的两种不同方式。wiki有精确的细节，但一般来说，长音效文件（如背景音乐或音乐光盘）应该使用第二种形式，因为"stream"参数告诉Minecraft不要将整个音效文件加载到内存中，而是从磁盘流形式传输。第二种形式还可以指定音效文件的音量、音高和重量。

在所有情况下，命名空间和路径的音效文件路径都是`<namespace>:<path>`。因此，`mymod:open_chest_sound_file`指向`assets/mymod/sounds/open_chest_sound_file.ogg`，而`mymod:music/epic_music`指向`assets/mymod/sounds/music/epic_music.ogg`。

`sounds.json`可以是数据生成的。

### 9.2.3 创建音效事件

为了引用服务端上的音效，必须创建一个在`sounds.json`中包含相应条目的`SoundEvent`。然后`SoundEvent`必须对进行注册。通常，用于创建音效事件的位置应设置为其注册表名称。

`SoundEvent`作为对音效的一个引用，并被传递以播放它们。如果一个模组有API，应该在API中公开它的`SoundEvent`。

**注意**：只要音效在`sounds.json`中被注册，它就仍然可以在逻辑客户端上被引用，而不管是否存在引用其`SoundEvent`的。

### 9.2.4 播放音效

原版有很多播放音效的方法，有时很难清楚该用哪种。

请注意，每个方法都要接受一个`SoundEvent`，即上面注册的事件。此外，术语 "服务端行为" 和 "客户端行为" 指其分别的[逻辑端][side]。

**Level**

1. `playSound(Player, BlockPos, SoundEvent, SoundSource, volume, pitch)`
   - 简单地转发到重载 (2)，在给定的`BlockPos`的每个坐标上加0.5。
   
2. `playSound(Player, double x, double y, double z, SoundEvent, SoundSource, volume, pitch)`
   - **客户端行为**: 如果传入的玩家是客户端玩家，则向客户端玩家播放该音效事件。
   - **服务端行为**: 向附近的所有人播放音效事件，除了传入的玩家以外。玩家可以为`null`。
   - **用法**: 行为之间的对应关系意味着这两个方法将从一些玩家启动的代码中调用，这些代码将同时在两逻辑端运行：逻辑客户端处理向用户播放，逻辑服务端处理其他所有听到它的人，而不向原始用户重新播放。它们还可以用于在服务端端的任何位置播放任何音效，方法是在逻辑服务端上调用它并传入玩家，从而让每个人都能听到。

3. `playLocalSound(double x, double y, double z, SoundEvent, SoundSource, volume, pitch, distanceDelay)`
   - **客户端行为**: 只是在客户端存档播放音效事件。如果`distanceDelay`为`true`，则根据音效与玩家的距离来延迟音效。
   - **服务端行为**: 不做任何事情。
   - **用法**: 此方法仅适用于客户端，因此对于在自定义数据包中发送的音效或其他仅客户端效果类型的音效非常有用。打雷就用了该方法。

**Entity**

1. `playSound(SoundEvent, volume, pitch)`
   - 简单地转发到`Level`的overload (3)，在给定的`BlockPos`的每个坐标上加0.5。
   
2. `playSound(SoundEvent, volume, pitch)` (overriding the one in `Entity`)
   - 简单地转发到`Level`的overload (2)，将玩家传递为`null`。
   - **客户端行为**: 不做任何事情。
   - **服务端行为**: 向该实体所在位置的所有人播放音效事件。
   - **用法**: 在服务端从任何非玩家实体发出任何音效。

**Player**

1. `playSound(SoundEvent, volume, pitch)` (overriding the one in `Level`)
   - 简单地转发到`Level`的overload (2)，将玩家传递为`null`。
   - **客户端行为**: 不做任何事情，参见`LocalPlayer`中的重载。
   - **服务端行为**: 向附近除了该玩家以外的所有人播放该音效。
   - **用法**: 参见`Entity`。

**LocalPlayer**

1. `playSound(SoundEvent, volume, pitch)` (overriding the one in `Level`)
   - 简单地转发到`Level`的overload (2)，将玩家传递为`this`。
   - **客户端行为**: 仅仅播放该音效事件。
   - **服务端行为**: 该方法仅客户端适用。
   - **用法**: 就像`Entity`中的方法一样，玩家类中的这两个重写似乎是针对在两端同时运行的代码。客户端处理向用户播放音效，而服务端处理其他所有听到音效的人，而不向原始用户重新播放。
