# 设计文档 · 残响学园 DEMO

这份文档记录 DEMO 的规则实现、数值公式、数据结构与扩写方式。
想改内容时先看这里，能少翻很多代码。

---

## 1. 一局的流程（状态机）

```
title ──newGame──> prologue ──startGame──> map
                                            │ enterArea(area)
                                            ▼
                                         explore ──explore()──> event
                                            ▲                    │ chooseChoice
                                            │                    ▼
                                            │                 outcome
                                            │                    │ continueOutcome
                                            │        ┌───────────┼────────────┐
                                            │        ▼           ▼            ▼
                                            │     combat      safe room    afterEvent
                                            │        │ finishCombat          │
                                            │        └───────────────────────┤
                                            └────────────────────────────────┘
                                                        │ progress = 100
                                                        ▼
                                                 固定剧情（fixed event）
                                                        │ 结算后
                                                        ▼
                                                  cleared → 回 map，解锁下一区
```

- HP ≤ 0 → `gameover`（力竭）；SAN ≤ 0 → `gameover`（走失）。
- 任意路线走完 `music_final` → `ending`（DEMO 结束）。
- 界面切换集中在 `src/game/game.js` 的 `setScreen()`；渲染由 `App.render()` 订阅 `game.emit()` 完成。

### 探索度的节奏

`src/data/areas.js` 里 `SAFE_STOPS = [50, 90]`；单次探索增量由 `Game.explorationGain()` 动态计算，落在 **5%–10%**。

```
基础值：检定成功 7 / 失败 5
+1  这次选项没有检定
+1  没有损失 HP
+1  没有损失 SAN
+0~1 随机浮动（rng.int(0,1)）
+1  结算里拿到了物品或线索
最后 clamp 到 [5, 10]
```

安全屋按「跨过阈值后的第一个事件」触发：事件结算后 `progress` 已经 ≥ 50 或 90、且该阈值的 `safeVisited` 里还没有记录，就进入安全屋；`progress >= 100` 则打开该区域的固定事件（BOSS 剧情）。判定用的是「已经跨过」，不是「正好等于」，所以 5%–10% 的随机步长不会跳过安全屋。每个区域大约 8–12 次探索。

`passedStop(progress, safeVisited)` 负责这个判定（`progress >= value && !safeVisited.includes(value)`）；`nextStop(progress, safeVisited)` 只负责地图上「下一个节点」的显示，用 `progress < value` 找最近的目标。安全屋是否已访问记录在 `areas[id].safeVisited` 数组里。
事件池抽空后会重新洗牌，不会卡住。

---

## 2. 属性与检定

### 面板值

```
面板属性 = 基础属性 + Σ(装备/专长/卡牌的 attr 修正)，最低 1
```

- 爱丽丝基础：STR 5 / DEX 7 / PER 7 / KNW 6 / CHR 7 / LUK 6。
- 学生制服 CHR +1，所以面板显示 CHR 8。
- 朋友的发带：SAN 上限 +5（上限 25）。新游戏创建角色时按上限回满，所以开局就是 25/25。
- 升级时 `state.attrs` 永久 +1（基础值），面板随之提高。

### 检定

```
目标值 = 面板属性 + checkBonus − 难度修正
掷 1d12（暗骰），出目 ≤ 目标值 即通过
```

| 难度 | 修正 | 说明 |
| --- | --- | --- |
| easy | −2 | 容易 |
| normal | 0 | 普通 |
| hard | +2 | 困难 |

- `checkBonus` 来自专长（野兽的直觉 +1）、饰品（校徽别针 +1）、一次性美德等；临时 +1 在掷骰后消耗。
- UI 只显示「PER 检定 · 困难 ≤ 3」，不显示骰面——保留暗骰的紧张感。
- 属性值高于 12 时必定成功；低于 2 时仍可能失败（出目 1 恒过）。
- **检定成功不扣 SAN**：`chooseChoice()` 会把成功分支里的负 `san` 归零再 `applyEffects`，免得结算写「SAN −1」而数值其实没变；失败分支照常扣。

### 免检定选项

事件选项可以声明：

```js
{ requires: { item: 'key_old', label: '旧校徽钥匙' } }   // 持有物品/装备
{ requires: { talent: 'courage', label: '为了朋友的勇气' } } // 拥有专长
```

满足条件时选项高亮且跳过检定；不满足时按钮禁用并显示原因（`choiceAvailable()`）。

---

## 3. 战斗

### 回合结构

1. 玩家回合：总时间 200t，点技能往队列里加 action，随时可点时间条上的片段撤回。
2. 点击「执行」→ 按队列顺序结算玩家所有行动。
3. 敌人行动：按 `pattern` 循环，对 HP 或 SAN 造成伤害。
4. 玩家 HP 或 SAN 归零 → 战斗失败 → 游戏结束。

道具在战斗中不消耗时间、不占队列，随时可用。

### 命中率

```
命中率 = 武器面板命中% + 等级×1% − 敌人 POW + 装备/卡牌 hitBonus + 临时 buff
最终 clamp 到 5% ~ 95%
```

等级只提供每级 1% 的缓慢成长（1 级 = +1%），难度曲线交给敌人 POW 与 HP，而不是让等级白送命中。
`Combat.hitBreakdown` 会同时给出 `weaponAcc / level / pow / gear / total`，战斗界面与角色卡都直接读这份拆解。
「临时 buff」来自美德卡（如下一场战斗首次攻击 +5%），只对下一次 `rollHit()` 生效。

通用技能 `aim`（准备动作）：任何武器都能用，固定 40t，不造成伤害，把 `Combat.sureHit` 置为 true；下一次 `rollHit()` 直接返回命中（chance 100）并清掉标记。它是低命中武器的保底手段，也让「蓄力 + 大招」成为一种排招策略。

### 伤害

```
单段伤害 = 技能该段基础伤害 + floor((武器对应属性 − 6) / 2) + dmgBonus
弱点：武器 damageType 与敌人 weakness 相同时，每段再 +1
处决：目标 HP 比例 ≤ 阈值时，最后一段追加 bonus 伤害
```

爱丽丝用钥匙（DEX 武器）：DEX 7 → 属性修正 `floor((7−6)/2) = 0`。
DEX 升到 8 仍是 0，升到 9 才 +1——这是刻意的：属性成长要有台阶感。

### 伤害类型与弱点

四类：`slash` 斩击 / `blunt` 打击 / `pierce` 穿刺 / `arcane` 奥术（定义在 `src/data/equipment.js` 的 `DAMAGE_TYPES`）。
每把武器有 `damageType` 与 `attr`；每个敌人可选 `weakness`。命中弱点时**每一段**伤害 +1，多段技能因此更吃弱点（十字斩 +2）。

| 武器 | 属性 | 伤害类型 |
| --- | --- | --- |
| 带链子的钥匙 | DEX | 斩击 |
| 生锈的裁纸刀 | DEX | 穿刺 |
| 断裂的拖把杆 | STR | 打击 |
| 合唱团的指挥棒 | KNW | 奥术 |
| 爱丽丝的保温杯 | DEX | 打击 |
| 空手 | STR | 打击 |

| 敌人 | 弱点 |
| --- | --- |
| 匍匐的影子 | 斩击 |
| 哭泣的人偶 | 穿刺 |
| 无面的合唱团 | 奥术 |

### 时间消耗

```
实际耗时 = 技能基础耗时 × max(0.5, 1 − 0.1 × floor((属性 − 6) / 2))
结果向上取整到 5t 的倍数，最低 5t
```

例：十字斩 100t，DEX 11 时 `floor(5/2)=2` → ×0.8 → 80t。

### 武器

| 武器 | 属性 | 基础伤害 | 命中 | 技能组 |
| --- | --- | --- | --- | --- |
| 带链子的钥匙 | DEX | 3 | 75% | 挥打 50t / 甩链 10t（命中 +10% 可叠加）/ 十字斩 100t（2+3，<50% 追加 2） |
| 生锈的裁纸刀 | DEX | 4 | 70% | 刺击 45t / 回拉 80t（2+2+3） |
| 断裂的拖把杆 | STR | 5 | 62% | 横扫 60t / 断杆重砸 120t（8，<35% 追加 3） |
| 合唱团的指挥棒 | KNW | 3 | 80% | 敲击 40t / 无声的挥拍 90t（3+3，<40% 追加 2） |
| 爱丽丝的保温杯 | DEX | 1 + 剩余次数 | 68% | 挥杯 45t / 砸杯 100t（×2，<40% 追加 2） |
| 空手（卸下武器时） | STR | 1 | 70% | 挥拳 40t |

保温杯是唯一同时属于「消耗品」和「武器」的物品：`getWeapon()` 返回 `{...THERMOS_WEAPON, damage: 1 + uses}`；喝一次 `uses -1`，装备时背包条目保留，卸下不会复制。

换武器 = 换技能组；装备效果只在装备时生效，非战斗场合随时可换。

技能分两类：

- **武器技能组**：`weapon.basic` + `weapon.skills`，只有装备该武器时可用；`kind:'attack'` 会掷命中并结算伤害，`kind:'buff'`（如甩链）只施加状态，**不掷命中、不造成伤害、不会落空**。
- **通用技能组**：`UNIVERSAL_SKILLS`（目前只有「准备动作」），与武器无关，任何角色永远可用；`fixedCost` 的耗时不乘属性系数。

侧栏「技能」浮层把两组分开列出；战斗里同一组技能会额外显示实时伤害拆解与命中拆解。

### 敌人

| 敌人 | HP | POW | 弱点 | XP | 硬币 | 行为 |
| --- | --- | --- | --- | --- | --- | --- |
| 匍匐的影子 | 26 | 2 | 斩击 | 22 | 6 | HP 3 → SAN 1 循环 |
| 哭泣的人偶 | 24 | 1 | 穿刺 | 16 | 9 | SAN 2 → HP 2 循环 |
| 门房留下的东西（BOSS） | 32 | 3 | 打击 | 34 | 12 | HP 4 → SAN 2 → HP 3 → SAN 2 循环 |
| 舍监的影子（BOSS） | 36 | 4 | 穿刺 | 40 | 15 | SAN 2 → HP 4 → SAN 2 → HP 3 循环 |
| 无面的合唱团（BOSS） | 64 | 3 | 奥术 | 48 | 20 | HP 3 → SAN 2 → HP 4 → SAN 2 循环 |

`pattern` 每项写成 `{ type: 'hp' | 'san', dmg, text }`；`enemyAct()` 按 `type + dmg` 结算，再套用玩家的 `dmgTaken` 修正。

---

## 4. 理智与疯狂

```
阈值 = ceil(SAN 上限 / 5)          // 发带 +5 后为 25/5 = 5
state.sanMark += 失去的 SAN          // 侵蚀计数，HUD 显示 sanMark / 阈值
sanMark >= 阈值 → 抽一张卡，sanMark -= 阈值
回复 SAN → sanMark = max(0, sanMark - 回复量)
```

- 比例 **80% 疯狂 / 20% 美德**，优先抽未拥有的卡。
- 单次结算最多弹 3 张（防连锁刷屏），超出部分留到下次。
- 抽卡时弹整屏红色提示（`card-alert`），说明「侵蚀满 5 点」。
- 疯狂：常驻的强力 buff + 代价（如偏执：伤害 +2 / 受到伤害 +2）。
- 美德：一次性效果。回复类立即结算，增益类写进 `state.buffs`（如 `check +1`、`hit +5`、`dmg +2`），触发一次后由 `consumeBuff(kind)` 移除；角色卡「临时效果」区会列出当前持有的 buff。
- 卡牌修正统一走 `mods`，与装备、专长一起在 `collectMods()` 汇总；一次性 buff 不参与 `collectMods()`。

| 字段 | 含义 |
| --- | --- |
| `maxHp` / `maxSan` | 上限增减 |
| `dmgBonus` | 造成伤害加成 |
| `dmgTaken` | 受到伤害增减（负数 = 减伤） |
| `hitBonus` | 命中率百分点 |
| `checkBonus` | 检定目标值 |
| `healBonus` / `sanOnHeal` | 治疗量 / 治疗时额外 SAN |
| `timeBonus` | 行动耗时减少（%） |
| `xpMult` / `coinBonus` | XP 倍率 / 硬币加成 |
| `sanOnKill` | 击杀回 SAN |
| `sanPerRound` | 每回合掉 SAN |
| `attr` | 六属性修正 |

---

## 5. 成长与商店

- XP 满 100 升一级：从随机 3 张**未拥有**专长中选 1，再选一项属性 +1。
- 一次获得大量 XP 可以连升，浮层会一张张弹。
- 安全屋：进入时恢复 2 HP / 2 SAN；「睡一会儿」6 硬币再回 5 HP / 6 SAN；「心理咨询」6 硬币，由玩家自己选一张疯狂卡移除，每次安全屋只能做一次。每区在 50% 与 90% 各一次。
- 商店每次随机 5 件（休息 / 心理咨询不占货架），价格 2–10 硬币；已拥有的装备与关键物品不再上架，买下即下架，消耗品可重复购买以补充次数。
- 重复获得同一件装备 → 折算成商品价格 40% 的硬币（`compensationFor()`）。
- 硬币来源：初始 20、战斗掉落、事件奖励、重复物品折算。
- 线索：只记录与奥菲莉亚有关的回忆或痕迹；首次获得时回 1 SAN（`addClue` 内结算）。
- 事件日志：`state.log` 存 `{ n, kind, text }`，最多 300 条；UI 只渲染最近 100 条（`src/ui/log.js`）。数值变化在 `changeHp / changeSan / addXp / addCoins / addItem` 里自动记账，叙事与战斗由调用方 `logEvent(kind, text)` 补充。

---

## 6. 数据结构

### 图鉴（`src/data/codex.js`）

分类表只描述「怎么列、去哪儿找条目」，条目本身仍由原来的数据表提供：

```js
{
  id: 'weapons',
  name: '武器',
  hint: '获得或装备后记录',
  entries: () => Object.values(WEAPONS).filter((w) => w.id !== 'fists'),
}
```

- `Game.codex = { enemies: [], weapons: [], ... }`，每条只存 id。
- `unlockCodex(category, id)` 去重后写入 `localStorage` 的 `alice.codex.v1`；`loadCodex()` 在构造时读取。
- 敌人记录**遭遇**而非击败；专长 / 卡牌记录**获得**；装备与消耗品记录**获得或装备**。
- 空手 `fists` 不计入图鉴；初始武器 / 服装 / 饰品 / 专长在 `newGame()` 时自动写入。

### 事件卡（`src/data/events.js`）

```js
{
  id: 'gate_scratch',
  title: '铁门上的划痕',
  en: 'MARKS ON THE GATE',
  art: 'gate',                 // 对应 art.js 的 key
  text: ['第一段', '第二段'],   // 场景描述
  fixed: false,                // true = 区域 100% 的固定剧情
  choices: [
    {
      id: 'look',
      label: '蹲下来，仔细辨认',
      hint: '也许能看出是谁留下的',       // 小字提示
      check: { attr: 'per', diff: 'normal' },
      requires: { item: 'key_old' },     // 可选：免检定条件
      success: {
        text: '你认出了那两个字母。',
        effects: { xp: 10, clue: { id: 'c_marks', title: '刻痕', text: '……' } },
        combat: 'crawler',               // 可选：成功后进入战斗
      },
      fail: { text: '你什么也没看出来。', effects: { san: -1 } },
      // 无 check 的选项直接走 effects
      effects: { hp: 2, coins: 5, item: 'bandage', unlock: 'hall' },
    },
  ],
}
```

- `effects` 可用键：`hp` `san` `xp` `coins` `item` `consume` `clue` `unlock` `flag` `endDemo`。
- 固定事件的所有分支都应 `unlock` 下一区域，避免玩家卡死。
- 战斗分支用 `combat: 'enemyId'` + `win: { text, effects }`；失败即游戏结束。

### 区域（`src/data/areas.js`）

```js
{
  id: 'hall',
  name: '教学楼 · 一层走廊',
  en: 'THE HALLWAY',
  art: 'hall',
  desc: '一句话简介（地图卡片）',
  intro: '进入区域时的旁白',
  unlock: { area: 'gate' },        // 或 { item: 'key_old' }
  events: ['hall_phone', 'hall_mirror', ...],
  fixedEvent: 'hall_final',
  fixedHint: '走廊尽头那扇门后面有光。',
  comingSoon: true,                // 只在地图上显示、不可进入
}
```

### 存档形状

`game.state` 是纯 JSON 可序列化对象：等级、经验、硬币、HP/SAN、六属性、装备、背包、专长、卡牌、线索、各区域进度与事件池、旗帜。要接存档，存 `game.state` + `game.rng.save()` 即可。

---

## 7. 如何扩写

### 加一张事件卡

1. 在 `src/data/events.js` 里加一条，`id` 唯一；
2. 把 id 塞进对应区域的 `events` 数组；
3. 有专属插画就在 `art.js` 加 key，没有就用 `event_default`。

### 加一个区域

1. `areas.js` 加区域 + `unlock` 条件 + 事件池 + 固定事件；
2. `AREA_ORDER` 里排好顺序（地图按此渲染）；
3. 固定事件记得 `unlock` 下一个区域；
4. 需要新插画时在 `art.js` 注册。

### 加武器 / 敌人 / 专长 / 卡牌

都是纯数据表，照抄现有条目的字段即可：
`equipment.js`（武器需带 `basic` + `skills`，技能在 `skills.js`）、`enemies.js`、`talents.js`、`cards.js`。

### 调难度

- 敌人 HP / POW / pattern 在 `enemies.js`；
- 技能耗时与伤害在 `skills.js`；
- 事件成功率看 `events.js` 的 `diff` 和 `checks.js` 的难度修正；
- 改完跑 `npm test`，自动试玩会给出到达结局 / 中途失败的比例。

---

## 8. 已知取舍

- **没有音频**：DEMO 阶段先留空，避免占位音效破坏气氛。
- **没有存档**：一周目 30–45 分钟，先不做；状态已按可序列化设计。玩家的显示偏好（`showRolls`）单独存在 localStorage 的 `alice.settings.v1`。
- **天台未开放**：数据与解锁条件已就位（旧校徽钥匙），事件待写。
- **战斗没有敌方技能组**：目前是固定的 HP/SAN 循环 pattern，够用且好调。
- **插图是占位 SVG**：统一冷色剪影，方便之后整批替换。
