// 装备与道具。
// mods 会被 stats.js 汇总成玩家的最终修正值：
//   maxHp / maxSan / dmgBonus / hitBonus / dmgTaken / checkBonus /
//   healBonus / timeBonus / xpMult / sanOnKill / sanPerRound / attr

// 伤害类型：武器与敌人弱点使用同一套 key。
export const DAMAGE_TYPES = {
  slash: { key: 'slash', name: '斩击', en: 'SLASH', desc: '切割、划开。对付会流血的、有形状的东西有效。' },
  blunt: { key: 'blunt', name: '打击', en: 'BLUNT', desc: '砸、抡、撞。对硬壳和骨头有效，也最容易发出声音。' },
  pierce: { key: 'pierce', name: '穿刺', en: 'PIERCE', desc: '刺入、钉住。适合对付皮薄或关节脆弱的目标。' },
  arcane: { key: 'arcane', name: '奥术', en: 'ARCANE', desc: '不属于这个学校的东西。只有少数带着旋律的器物能唤起它。' },
};

export const WEAPONS = {
  keychain: {
    id: 'keychain',
    type: 'weapon',
    name: '带链子的钥匙',
    en: 'CHAINED KEY',
    attr: 'dex',
    damage: 3,
    damageType: 'slash',
    acc: 0.75,
    speed: 50,
    basic: 'swing',
    skills: ['chain', 'cross'],
    desc: '奥菲莉亚送给她的生日礼物。钥匙打不开任何一扇门，但链子足够长，也足够重。',
    mods: {},
  },
  scissors: {
    id: 'scissors',
    type: 'weapon',
    name: '生锈的裁纸刀',
    en: 'RUSTED SHEARS',
    attr: 'dex',
    damage: 4,
    damageType: 'pierce',
    acc: 0.7,
    speed: 45,
    basic: 'jab',
    skills: ['rip'],
    desc: '美术教室里的旧剪刀，刃口卷了，握柄缠着发黑的胶布。',
    mods: {},
  },
  pipe: {
    id: 'pipe',
    type: 'weapon',
    name: '断裂的拖把杆',
    en: 'BROKEN MOP',
    attr: 'str',
    damage: 5,
    damageType: 'blunt',
    acc: 0.62,
    speed: 60,
    basic: 'bash',
    skills: ['crash'],
    desc: '从器材室顺手抽出来的。断面很尖，握起来像一根不合手的骨头。',
    mods: {},
  },
  baton: {
    id: 'baton',
    type: 'weapon',
    name: '合唱团的指挥棒',
    en: 'CHOIR BATON',
    attr: 'knw',
    damage: 3,
    damageType: 'arcane',
    acc: 0.8,
    speed: 40,
    basic: 'tap',
    skills: ['wave'],
    desc: '一截发白的木棒，握柄上缠着褪色的红绳。挥动时会带起一小段听不见的旋律。',
    mods: {},
  },
  fists: {
    id: 'fists',
    type: 'weapon',
    name: '空手',
    en: 'BARE HANDS',
    attr: 'str',
    damage: 1,
    damageType: 'blunt',
    acc: 0.7,
    speed: 40,
    basic: 'punch',
    skills: [],
    desc: '手上什么也没有的时候，至少还有拳头。',
    mods: {},
  },
};

export const OUTFITS = {
  uniform: {
    id: 'uniform',
    type: 'outfit',
    name: '学生制服',
    en: 'SCHOOL UNIFORM',
    desc: '深蓝色的水手服，袖口绣着爱丽丝的名字。奥菲莉亚的总是在走廊另一头晃。',
    mods: { attr: { chr: 1 } },
  },
  coat: {
    id: 'coat',
    type: 'outfit',
    name: '宽大的校服外套',
    en: 'OVERSIZED COAT',
    desc: '不知道是谁的，肩线宽得能盖住半张脸。袖子里有别人的体温。',
    mods: { maxHp: 2, attr: { chr: -1 } },
  },
  raincoat: {
    id: 'raincoat',
    type: 'outfit',
    name: '旧雨衣',
    en: 'OLD RAINCOAT',
    desc: '塑胶味很重，内侧写着一串看不清的名字。穿上它，声音会变闷。',
    mods: { dmgTaken: -1 },
  },
};

export const TRINKETS = {
  hairband: {
    id: 'hairband',
    type: 'trinket',
    name: '朋友的发带',
    en: 'FRIEND’S RIBBON',
    desc: '奥菲莉亚的发带。系在手腕上时，呼吸会稍微容易一点。',
    mods: { maxSan: 5 },
  },
  charm: {
    id: 'charm',
    type: 'trinket',
    name: '褪色的护身符',
    en: 'FADED CHARM',
    desc: '安全屋的校工卖的。布面上绣着「平安」，针脚很新。',
    mods: { maxSan: 3 },
  },
  bell: {
    id: 'bell',
    type: 'trinket',
    name: '小铜铃',
    en: 'SMALL BELL',
    desc: '摇起来没有声音。据说听不见铃声的人，也听不见别的东西。',
    mods: { hitBonus: 5 },
  },
  pin: {
    id: 'pin',
    type: 'trinket',
    name: '校徽别针',
    en: 'SCHOOL PIN',
    desc: '圣艾格尼丝的校徽，沾着干涸的血液，某个不幸的学生弄丢了它。别针的尖端是弯的。',
    mods: { checkBonus: 1 },
  },
  ring: {
    id: 'ring',
    type: 'trinket',
    name: '缠线的指环',
    en: 'THREADED RING',
    desc: '戒指上缠着红色的线，线的另一端消失在袖子里。',
    mods: { dmgBonus: 1 },
  },
};

export const ITEMS = {
  thermos: {
    id: 'thermos',
    type: 'consumable',
    name: '爱丽丝的保温杯',
    en: 'THERMOS',
    maxUses: 3,
    heal: 2,
    refillable: true,
    desc: '妈妈塞进书包里的。水早就凉了，但喝下去还是暖的。回复 2 HP，可在安全屋补充次数。',
  },
  bandage: {
    id: 'bandage',
    type: 'consumable',
    name: '干净绷带',
    en: 'BANDAGE',
    heal: 3,
    desc: '从医务室抽屉里翻出来的，还带着消毒水的味道。回复 3 HP。',
  },
  sedative: {
    id: 'sedative',
    type: 'consumable',
    name: '镇定剂',
    en: 'SEDATIVE',
    san: 6,
    desc: '校医留下的最后一板。咽下去之后，走廊会短暂地变短。回复 6 SAN。',
  },
  candy: {
    id: 'candy',
    type: 'consumable',
    name: '水果糖',
    en: 'CANDY',
    heal: 1,
    san: 2,
    desc: '奥菲莉亚总在口袋里放着这种糖。回复 1 HP、2 SAN。',
  },
  key_old: {
    id: 'key_old',
    type: 'key',
    name: '旧校徽钥匙',
    en: 'OLD CREST KEY',
    desc: '一把黄铜钥匙，柄是半枚校徽。齿上刻着「天台」。',
  },
  ribbon: {
    id: 'ribbon',
    type: 'key',
    name: '断裂的发带',
    en: 'TORN RIBBON',
    desc: '和奥菲莉亚手腕上那条一模一样。断口很整齐，像是被剪断的。',
  },
  sheet_music: {
    id: 'sheet_music',
    type: 'key',
    name: '撕下的乐谱',
    en: 'TORN SHEET MUSIC',
    desc: '《合唱练习曲 第七号》。谱面空白处用铅笔写着：她还在唱。',
  },
};

export const ALL_EQUIPMENT = { ...WEAPONS, ...OUTFITS, ...TRINKETS };

/**
 * 保温杯既是消耗品，也可以当武器用：
 * 剩余次数越多，抡起来越沉；喝空之后只剩 1 点伤害。
 * 它不放在 WEAPONS 里，避免被商店 / 掉落当成普通武器刷出来。
 */
export const THERMOS_WEAPON = {
  id: 'thermos',
  type: 'weapon',
  name: '爱丽丝的保温杯',
  en: 'THERMOS',
  attr: 'str',
  damage: 1,
  damageType: 'blunt',
  acc: 0.68,
  speed: 45,
  basic: 'flask_swing',
  skills: ['flask_slam'],
  desc: '灌满水的时候像一小截铁管。喝空了，就只剩一层薄薄的不锈钢。',
  mods: {},
};

/** 只查装备（武器 / 服装 / 饰品） */
export function getEquip(id) {
  if (!id) return null;
  return WEAPONS[id] || OUTFITS[id] || TRINKETS[id] || null;
}

/** 只查道具（消耗品 / 关键物品） */
export function getItem(id) {
  return (id && ITEMS[id]) || null;
}

/** 装备或道具，先装备后道具 */
export function getThing(id) {
  return getEquip(id) || getItem(id);
}

export function isEquipment(id) {
  const item = getEquip(id);
  return Boolean(item);
}

export function isConsumable(id) {
  const item = ITEMS[id];
  return Boolean(item && item.type === 'consumable');
}

export const SLOT_LABEL = { weapon: '武器', outfit: '服装', trinket: '饰品' };

/** 把 mods 翻译成给玩家看的一行行文字 */
export function modText(mods, attrs = {}) {
  if (!mods) return [];
  const out = [];
  const labels = {
    str: '力量', dex: '敏捷', per: '感知', knw: '知识', chr: '魅力', luk: '幸运',
  };
  for (const [key, value] of Object.entries(mods.attr || {})) {
    if (!value) continue;
    out.push(`${labels[key] || key} ${value > 0 ? '+' : ''}${value}`);
  }
  if (mods.maxHp) out.push(`体力上限 ${mods.maxHp > 0 ? '+' : ''}${mods.maxHp}`);
  if (mods.maxSan) out.push(`理智上限 ${mods.maxSan > 0 ? '+' : ''}${mods.maxSan}`);
  if (mods.dmgBonus) out.push(`伤害 ${mods.dmgBonus > 0 ? '+' : ''}${mods.dmgBonus}`);
  if (mods.hitBonus) out.push(`命中 ${mods.hitBonus > 0 ? '+' : ''}${mods.hitBonus}%`);
  if (mods.dmgTaken) out.push(`受到伤害 ${mods.dmgTaken > 0 ? '+' : ''}${mods.dmgTaken}`);
  if (mods.checkBonus) out.push(`检定 ${mods.checkBonus > 0 ? '+' : ''}${mods.checkBonus}`);
  if (mods.healBonus) out.push(`治疗量 ${mods.healBonus > 0 ? '+' : ''}${mods.healBonus}`);
  if (mods.timeBonus) out.push(`每回合时间 +${mods.timeBonus}t`);
  if (mods.xpMult && mods.xpMult !== 1) out.push(`经验 ×${mods.xpMult}`);
  if (mods.sanOnKill) out.push(`击杀回复 ${mods.sanOnKill} SAN`);
  if (mods.sanPerRound) out.push(`每回合开始时 SAN ${mods.sanPerRound > 0 ? '-' : '+'}${Math.abs(mods.sanPerRound)}`);
  return out;
}
