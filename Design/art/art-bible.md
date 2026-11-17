# 残响 · 美术圣经

> 状态：**已按"暗背景 + 亮角色"两层结构重写**。三语域（回忆/夜/冷）、暖点光源铁律、敌人调性、本地管线调参全部退役。
> 上游：`Design/残响-序章：梦境.md`、`Design/残响-角色与关系.md`、`Design/残响-氛围与文风.md`
> 本版只做两件事：**锚住风格**、**锁住角色**。

---

## §1 视觉总锚 · SPEC

> 下面这一段是锚。后面所有内容都是它的推论；和它冲突的条目一律以它为准。

**整体：极简剪影 + 雾气渐变 + 电影颗粒。冷调、压抑、留白多。不要照片写实，不要卡通。背景永远比角色暗，角色永远比背景暖。恐怖不在画面里有什么，在画面里缺了什么。**

**两层结构：背景层是"世界"，只有形状、雾和光；角色层是"人"，只有可爱、暖、和边缘光。两层不互相迁就——背景黑到 `#06070a`，角色亮到一眼就能被喜欢上。这个反差就是本作的美学，不许抹平。**

**色板（背景层）：底 `#06070a`／中景 `#0b0e13`／主体剪影 `#121820`／雾 `#1b2430`／冷白 `#cfdcd6`。** 配额：底与雾合计占 80% 以上，冷白 ≤ 5%。两个高饱和色不许当装饰用，只当代词用——**病态青绿 `#8fe0b6` = 可以了解、可以动的东西**（遗物、残响卡、可买物、送走选项），一屏最多两处，每处极小；**暗血红 `#a6343c` = 不可逆**，全作只出现一次，就在缎带湿掉的那一刻。这两个色一出现，玩家必须立刻知道它是什么意思。

**光：** 冷白 `#cfdcd6` 只做边缘光和焦点，不做填充。**一屏只有一个焦点。** 角色身上的边光必须是被背景那盏灯照到的，不是白描边。

**形：不靠颜色分辨房间，靠剪影的形状签名。** 走廊 = 一排等高的门；保健室 = 半拉窗帘的斜线；音乐教室 = 高窗的长方形；前庭 = 铁门的竖栅。**留白用雾填，不许用纯黑空着**——空的留白是空，有雾的留白是藏着东西。

**角色层：** 二次元、可爱、暖。整体**降饱和 10–15%、压暗 8%**，与背景同光。**角色身上禁止出现青绿和血红**——那两种颜色属于"世界"，不属于"人"。白缎带与白蝶用与背景边光同一个白 `#cfdcd6`。

**实现：纯静态 SVG，单文件 ≤ 30KB。** 颗粒用 256×256 的 `feTurbulence` + `feTile` 平铺（`baseFrequency` 0.6–0.9，`stitchTiles="stitch"`，`feColorMatrix` 拉成单色），混合用 `overlay` / `soft-light`，**不许直接叠加**——直接叠会整体提亮，黑就保不住。雾用 `radialGradient`，不许拿 blur 滤镜冒充。

---

## §2 颜色语法

色板不是配色方案，是**语法**。每个颜色有明确所指，不许挪作他用。

| 色 | 值 | 指什么 | 配额 |
| --- | --- | --- | --- |
| 底 | `#06070a` | 画外、看不见的地方 | ~60%，无信息 |
| 中景 | `#0b0e13` | 房间的体积 | ~20% |
| 主体剪影 | `#121820` | 玩家要读的东西（门、桌、窗） | ~15% |
| 雾 | `#1b2430` | 距离、纵深、未知 | 叠在上三者上，不限面积 |
| 冷白 | `#cfdcd6` | **还亮着的东西**：边光、白蝶、白缎带 | **≤ 5%** |
| 病态青绿 | `#8fe0b6` | **可以了解、可以动的东西** | 一屏 ≤ 2 处，每处极小 |
| 暗血红 | `#a6343c` | **不可逆** | 全作 **1 次** |

**三条必须遵守的推论：**

1. **三个黑不要指望分层。** `#06070a` / `#0b0e13` / `#121820` 明度差只有 1–3%，压一次就并成一块。它们是**按层分配**的（底/中景/主体各一个），不是按情绪分配的。真正的分层靠三样：冷白边缘光、雾的前后距离、颗粒密度。
2. **冷白一多，阴间感立刻散掉。** 它唯一的失效方式就是变得不稀缺。上限 5%，超了就删。
3. **白蝶和白缎带属于"光"，不属于高饱和语法。** 它们和背景边光用同一个白。所以当 SAN 见底、蝶变黑时，读到的不是"来了个黑色的蝴蝶"，而是**"那个白消失了"**——这是本作唯一需要的压力指示，不需要 UI。

---

## §3 层次

从后往前只有四层，不许加第五层：

| 层 | 内容 | 手段 |
| --- | --- | --- |
| 1 底 | `#06070a` | 纯色，无信息 |
| 2 雾 | `#1b2430` 径向渐变 | 制造纵深，掩盖边缘 |
| 3 时空 | 建筑剪影 `#121820` + 一个形状签名 | 告诉玩家"你在哪" |
| 4 层 | 角色立绘 / UI / 特效 | 冷白边光，≤5%；青绿和血红只在这一层当"代词"用 |

**层 3 是唯一回答"我在哪"的层。** 它塌了，玩家就会迷路，再好的氛围也救不回来。

---

## §4 区域形状签名

每个区域**一个纯黑剪影，一个形状**，完全不靠颜色区分。玩家闭着眼都该能说出自己在哪。

| 区域 | 形状签名 |
| --- | --- |
| 校门·前庭 | 铁门的**竖栅**（等距重复） |
| 一层走廊 | 一排**等高的门**（重复节奏） |
| 保健室 | 半拉窗帘的**斜线** |
| 戏剧社后台 | 一面**衣架横杆** + 垂下的布料 |
| 音乐教室 | 高窗的**长方形** |
| 宿舍 | 上下铺的**横线堆叠** |

> 走廊和宿舍都是"重复"，但一个是竖的等距、一个是横的堆叠，剪影上分得开。
> 走廊正好吃掉文本里那句"两边的门一模一样"——**重复本身就是内容**。

---

## §5 角色规范

眼睛认人**先认姿态，后认颜色**。颜色在缩略图、模糊、低分辨率立绘里会糊，姿态不会。

| 签名 | 爱丽丝 | 奥菲莉亚 |
| --- | --- | --- |
| 头发 | 齐肩，**深藏青黑**，发尾外翘 | 长卷，**浅亚麻金**，披散 |
| 缎带 | 无（结尾继承后系右手腕） | **冷白蝴蝶结，绑在头发后面** |
| 瞳色 | **灰蓝**（冷） | **绿**（暖） |
| 手 | 永远拿着东西（保温杯） | 空着，或扶着人 |
| 体态轴线 | **垂直线**：对称、正、手臂贴身体、肩内扣 | **斜线**：重心偏一侧、手叉腰或扶人、头微歪 |
| 剪影 | 硬边短 → 一个方框 | 软边长 → 一个水滴 |

### 制服：同一所学校，同一套

**上一版"同校异年级、白裙配深蓝边"的做法作废。** 两人必须穿同一套，一眼看出属于同一所学校。

| 部位 | 规格（两人相同） |
| --- | --- |
| 上衣 | 白色短袖水手服，**深藏青方领** |
| 领 | **深藏青领结** |
| 袖口 | 两道细深藏青条纹 |
| 裙 | **深藏青百褶裙** |
| 袜 | 纯白小腿袜 |

**两人唯一的差别**：奥菲莉亚 = 棕乐福鞋 + 白发结；爱丽丝 = 黑玛丽珍 + 无发饰。

区分靠四样，够了：**发色深浅 / 发长 / 体态轴线 / 白蝴蝶结（只有奥菲莉亚有）**。裙色不再承担区分功能。

### 缎带

- 颜色：**冷白（雪白、硬挺）**，不是米白不是奶白。
- 为什么是冷的：奥菲莉亚的头发是**暖金**，白对金明度接近，只能靠**冷暖分离 + 蝴蝶结的形状**立住。
- **形状必须做成两环明显外扩 + 两条尾巴。** 缩略图尺度上它只剩轮廓，轮廓散了它就消失。
- 形态演变：**梦中系在奥菲莉亚头发后面** → 那一夜之后 → **爱丽丝继承，系在自己右手腕上**。
- 手腕形态：宽约 2cm，两段约 8cm 尾巴，**必须有体积**，否则实际分辨率下直接消失。
- 白色分级：缎带（亮）／领子（中）／袜子（哑）。三种白不能撞成一个。

---

## §6 角色出图清单

**规格统一**：2:3 或 3:4 竖图，长边 ≥ 1024，PNG 去底。每张用对应原型作参考图。

### A1 · 爱丽丝 · 立绘（对话默认）
参考图：`dsh-image-gen/image-12d904f2.png`
```
1girl, full body, standing, short dark navy hair with flipped ends, grey blue eyes,
white sailor uniform with navy collar, navy pleated skirt, white kneehigh socks,
black mary jane shoes, holding a small thermos with both hands against her chest,
shoulders slightly inward, calm reserved expression, looking slightly away,
cold white rim light, low saturation, plain dark background,
soft cel shading, anime illustration, best quality
```

### A2 · 爱丽丝 · 低 SAN
参考图：`dsh-image-gen/image-12d904f2.png`
```
1girl, full body, same outfit and same pose as before, slightly pale skin,
tired empty eyes, faint shadow under the eyes, cold white rim light only,
low saturation, darker, plain dark background, soft cel shading, best quality
```
> 判据：不换衣服、不换姿势、不换镜头，**只换眼神和一点灰**。换多了就变成另一个人。

### A3 · 爱丽丝 · 手与缎带（结尾）
参考图：`dsh-image-gen/image-12d904f2.png`
```
close up of a girls hands holding a white ribbon, a white ribbon tied around her right
wrist with two loose tails about eight centimeters long, the ribbon looks wet,
short dark navy hair at the edge of the frame, cold white rim light,
dark background, low saturation, anime illustration, best quality
```

### O1 · 奥菲莉亚 · 立绘（梦中版）
参考图：`dsh-image-gen/image-076e667a.png`
```
1girl, full body, long wavy ash blonde hair, white ribbon bow at the back of her hair,
green eyes, white sailor uniform with navy collar, navy pleated skirt,
white kneehigh socks, brown loafers, one hand on hip, upright posture,
warm light falling on her from one side, she is the only warm thing in the frame,
low saturation around her, plain dark background, soft cel shading, best quality
```
> 这张同时完成制服统一：**裙子必须是藏青。**

### O2 · 奥菲莉亚 · 幻影
参考图：O1 的出图
```
1girl standing still in a long dark corridor, long wavy ash blonde hair,
white ribbon bow at the back of her hair, green eyes, white sailor uniform,
navy pleated skirt, the same face and the same idle pose as before,
cold moonlight instead of warm light, desaturated by half, thin mist near the floor,
beautiful and lonely, not frightening, soft cel shading, best quality
```
> 判据只有一条：**她的脸一张不改，只有光和颜色变了。**

### O3 · 缎带特写
参考图：O1 的出图
```
close up of a white ribbon bow tied at the back of long wavy ash blonde hair,
the bow is large with two clear loops and two tails, cold white, crisp and stiff,
cool rim light on the edges of the ribbon, dark background,
soft cel shading, best quality
```

### W1 · 白蝶（小资产，可反复叠加）
```
a single white butterfly, side view, wings open, soft glow, dark background,
minimal, anime illustration, best quality
```
> **全 DEMO 只允许一只。** 数量一多，它就从"思念的可见形态"降级成氛围装饰。

---

## §7 管线边界（本地模型）

本地部署的模型**只用来确认角色基础形象**，不产出正式美术资产。正式资产走线上模型。

| 结论 | 证据 |
| --- | --- |
| **单人肖像**是它唯一强项 | 爱丽丝、奥菲莉亚定妆都可用 |
| **双人同框必塌** | 出现过角色互换、道具互换、兔耳发带乱入 |
| **多人群体塌成一个人** | "一排无脸女生"变成一个女生 |
| **敌人图不可用** | 风格完全跑偏，已放弃 |
| **ref 不换景、也不换衣服** | 写三遍 `navy pleated skirt`，输出几乎逐像素相同 |
| **尺寸甜区 600×900** | 1024 方图又大又不合它的口味 |

参考图工作流的两个已知参数：

- `ReferenceOnlySimple` 的 `strength` 现为 **0.25**（0.5 时仍不换景）。构图的锁不在 `strength` 上——`latent_image` 直接接了参考图的 latent，所以**别指望 ref 换场景**。
- `ImageScale` 的 `crop` 必须是 **`disabled`**。`center` 会"从源图中间切一块当画布"，竖图配横框就切头。

---

## §8 TODO

- [ ] §4 形状签名在实现阶段的对比度验证（`#121820` 压在 `#06070a` 上到底看不看得见）
- [ ] 六边形/全套 UI 规范（有了颜色语法后，UI 可能不需要独立设计）
- [ ] 角色层与背景层合成后的整体饱和度校准（降 10–15% 是估值，要实测）
- [ ] 资产命名约定、尺寸档位、图集策略
- [ ] `assets/images/*.svg` 按 §1–§4 重制
- [ ] 爱丽丝 `src/data/character.js` 里 `bio` 写的"十二岁"与角色文档的 16 岁冲突，未处理
