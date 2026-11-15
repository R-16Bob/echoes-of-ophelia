// 疯狂卡 / 美德卡。
// 每当玩家累计失去「理智上限 / 5」的 SAN，就会抽取一张：80% 疯狂，20% 美德。
// 疯狂带来强力效果与代价，美德立刻少量回复并获得增益。

export const MADNESS_CARDS = {
  hallucination: {
    id: 'hallucination',
    kind: 'madness',
    name: '幻听',
    en: 'AUDITORY HALLUCINATION',
    art: 'card_madness',
    text: '走廊里有人在小声叫她的名字。爱丽丝分不清声音来自前面还是后面——但挥出去的手，比从前更准了。',
    mods: { hitBonus: 5, sanPerRound: 1 },
  },
  paranoia: {
    id: 'paranoia',
    kind: 'madness',
    name: '偏执',
    en: 'PARANOIA',
    art: 'card_madness',
    text: '每一扇门后面都有人。每一面镜子都在看她。既然到处是敌人，那就先下手。',
    mods: { dmgBonus: 2, dmgTaken: 2 },
  },
  tinnitus: {
    id: 'tinnitus',
    kind: 'madness',
    name: '耳鸣',
    en: 'TINNITUS',
    art: 'card_madness',
    text: '高频的嗡鸣盖过了所有声音。她开始听不见脚步，却莫名其妙地读懂了墙上那些字。',
    mods: { attr: { knw: 2, per: -2 } },
  },
  dissociation: {
    id: 'dissociation',
    kind: 'madness',
    name: '解离',
    en: 'DISSOCIATION',
    art: 'card_madness',
    text: '疼痛像隔着一层玻璃。爱丽丝看着自己的手，觉得那是别人的手。',
    mods: { dmgTaken: -2, healBonus: -1 },
  },
  flight: {
    id: 'flight',
    kind: 'madness',
    name: '狂奔',
    en: 'FLIGHT RESPONSE',
    art: 'card_madness',
    text: '身体先于意识做出了决定：跑。心脏撞着肋骨，时间被拉得很长。',
    mods: { timeBonus: 20, dmgTaken: 2 },
  },
  counting: {
    id: 'counting',
    kind: 'madness',
    name: '强迫计数',
    en: 'COMPULSIVE COUNTING',
    art: 'card_madness',
    text: '一、二、三、四。瓷砖、门把手、楼梯的台阶。数错的时候，世界会抖一下。',
    mods: { checkBonus: -1, coinBonus: 2 },
  },
};

// 美德卡是「一次性」的：生效一次后立刻消失，不会变成常驻加成。
// once 字段：hp / san 立即回复；check 下一次检定加值；hit 下一次战斗首击命中；
// dmg 下一次命中的伤害加值。
export const VIRTUE_CARDS = {
  warmth: {
    id: 'warmth',
    kind: 'virtue',
    name: '朋友的温度',
    en: 'A FRIEND’S WARMTH',
    art: 'card_virtue',
    text: '发带贴着皮肤的地方是暖的。爱丽丝想起奥菲莉亚替她系上它时，手指也是这个温度。',
    once: { hp: 2, san: 2, hit: 5 },
    onceText: '立刻回复 2 HP / 2 SAN；下一场战斗首次命中 +5%',
  },
  lucidity: {
    id: 'lucidity',
    kind: 'virtue',
    name: '清醒的瞬间',
    en: 'MOMENT OF CLARITY',
    art: 'card_virtue',
    text: '恐惧退潮了。走廊还是那条走廊，但每一扇门的位置都变得清清楚楚。',
    once: { san: 3, check: 1 },
    onceText: '回复 3 SAN；下一次检定 +1',
  },
  brave: {
    id: 'brave',
    kind: 'virtue',
    name: '勇气',
    en: 'COURAGE',
    art: 'card_virtue',
    text: '她握紧钥匙。链条在掌心勒出红痕，那点疼让她确定自己还活着。',
    once: { dmg: 2 },
    onceText: '下一次命中额外造成 2 点伤害',
  },
  illusion: {
    id: 'illusion',
    kind: 'virtue',
    name: '温柔的幻觉',
    en: 'GENTLE ILLUSION',
    art: 'card_virtue',
    text: '有人说「别怕」。声音很近，近得像从自己心里发出来的。',
    once: { hp: 3, san: 2 },
    onceText: '立刻回复 3 HP / 2 SAN',
  },
  sixth: {
    id: 'sixth',
    kind: 'virtue',
    name: '第六感',
    en: 'SIXTH SENSE',
    art: 'card_virtue',
    text: '在推开任何一扇门之前，她就已经知道门后有没有东西在呼吸。',
    once: { check: 2 },
    onceText: '下一次检定 +2',
  },
};

export const ALL_CARDS = { ...MADNESS_CARDS, ...VIRTUE_CARDS };

export function getCard(id) {
  return ALL_CARDS[id] || null;
}

/** 每失去「理智上限 / 5」抽一张 */
export const CARDS_PER_THRESHOLD = 5;

/**
 * 抽一张卡：80% 疯狂 / 20% 美德。会尽量避开已经拥有的卡。
 * @param {import('../core/rng.js').Rng} rng
 * @param {string[]} owned 已拥有的卡 id
 */
export function drawCard(rng, owned = []) {
  const wantVirtue = rng.chance(0.2);
  const pool = Object.values(wantVirtue ? VIRTUE_CARDS : MADNESS_CARDS);
  const fresh = pool.filter((card) => !owned.includes(card.id));
  const def = rng.pick(fresh.length ? fresh : pool);
  return { id: def.id, kind: def.kind, def };
}
