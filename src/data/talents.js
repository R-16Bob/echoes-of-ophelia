// 专长：升级时三选一，通常还附带一点属性成长。
// mods 的字段与 equipment.js 中一致；effectText 是悬停时显示的「纯效果」，
// flavor 是卡片上常驻的风味描述。

export const TALENTS = {
  courage: {
    id: 'courage',
    name: '为了朋友的勇气',
    tag: '起始专长',
    flavor: '想到奥菲莉亚还在等，就没那么害怕了。',
    effectText: '击败敌人时，回复 1 SAN',
    mods: { sanOnKill: 1 },
  },
  steady: {
    id: 'steady',
    name: '稳住的呼吸',
    tag: '战斗',
    flavor: '数到三再动手。',
    effectText: '命中 +5%',
    mods: { hitBonus: 5 },
  },
  instinct: {
    id: 'instinct',
    name: '野兽的直觉',
    tag: '探索',
    flavor: '在黑暗里待久了，会开始听得见地板的方向。',
    effectText: '所有属性检定 +1',
    mods: { checkBonus: 1 },
  },
  stubborn: {
    id: 'stubborn',
    name: '倔强',
    tag: '生存',
    flavor: '她还没打算在这里躺下。',
    effectText: '体力上限 +2',
    mods: { maxHp: 2 },
  },
  clearheaded: {
    id: 'clearheaded',
    name: '清醒的间隙',
    tag: '生存',
    flavor: '在两次恐惧之间，她学会喘一口气。',
    effectText: '理智上限 +2',
    mods: { maxSan: 2 },
  },
  focused: {
    id: 'focused',
    name: '专注',
    tag: '战斗',
    flavor: '把全部的注意力放在一个点上，其余的东西就会退后。',
    effectText: '伤害 +1',
    mods: { dmgBonus: 1 },
  },
  scavenger: {
    id: 'scavenger',
    name: '拾荒者',
    tag: '成长',
    flavor: '废弃的校园里，什么都能派上用场。',
    effectText: '获得的经验 +20%',
    mods: { xpMult: 1.2 },
  },
  kindhands: {
    id: 'kindhands',
    name: '温柔的手',
    tag: '生存',
    flavor: '她替自己包扎的时候，动作轻得像在哄别人。',
    effectText: '治疗量 +1，治疗时额外回复 1 SAN',
    mods: { healBonus: 1 },
  },
  luckycoin: {
    id: 'luckycoin',
    name: '幸运硬币',
    tag: '成长',
    flavor: '口袋里那枚硬币，总在需要的时候出现。',
    effectText: '事件与战斗获得的硬币 +1',
    mods: { coinBonus: 1 },
  },
};

export const TALENT_LIST = Object.values(TALENTS);

export function getTalent(id) {
  return TALENTS[id] || null;
}
