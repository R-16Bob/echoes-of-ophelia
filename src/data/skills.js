// 战斗技能。
// cost 为时间消耗（t），一回合共有 200t。
// hits: 每一段攻击的基础伤害。execute 表示处决加成。
// kind: attack | buff

export const SKILLS = {
  // —— 空手 ——
  punch: {
    id: 'punch',
    name: '挥拳',
    en: 'PUNCH',
    cost: 40,
    kind: 'attack',
    fromWeapon: true,
    multiplier: 1,
    desc: '没有武器的时候，至少还有拳头。',
  },

  // —— 带链子的钥匙 ——
  swing: {
    id: 'swing',
    name: '挥打',
    en: 'SWING',
    cost: 50,
    kind: 'attack',
    hits: [3],
    desc: '用钥匙串狠狠砸下去，最朴素也最可靠的一击。',
  },
  chain: {
    id: 'chain',
    name: '甩链',
    en: 'CHAIN WHIP',
    cost: 10,
    kind: 'buff',
    hitBonus: 10,
    flavor: '转动钥匙，让链条在手腕上绕了一圈，链条贴着皮肤发出细小的响声',
    desc: '旋转钥匙，让链条缠上手腕。下一击命中率 +10%，可叠加。不造成伤害，必定成功。',
  },
  cross: {
    id: 'cross',
    name: '十字斩',
    en: 'CROSS CUT',
    cost: 100,
    kind: 'attack',
    hits: [2, 3],
    execute: { threshold: 0.5, bonus: 2 },
    desc: '两段连续攻击，共 5 点伤害；目标生命低于 50% 时追加 2 点。',
  },

  // —— 生锈的裁纸刀 ——
  jab: {
    id: 'jab',
    name: '刺击',
    en: 'JAB',
    cost: 45,
    kind: 'attack',
    hits: [4],
    desc: '又快又浅的一刀。',
  },
  rip: {
    id: 'rip',
    name: '回拉',
    en: 'RIP',
    cost: 80,
    kind: 'attack',
    hits: [2, 2, 3],
    desc: '顺着伤口一路划开，三段伤害。',
  },

  // —— 断裂的拖把杆 ——
  bash: {
    id: 'bash',
    name: '横扫',
    en: 'BASH',
    cost: 60,
    kind: 'attack',
    hits: [5],
    desc: '抡圆了砸。慢，但很重。',
  },
  crash: {
    id: 'crash',
    name: '断杆重砸',
    en: 'SMASH',
    cost: 120,
    kind: 'attack',
    hits: [8],
    execute: { threshold: 0.35, bonus: 3 },
    desc: '把整根拖把杆当锤子用。目标生命低于 35% 时追加 3 点。',
  },

  // —— 合唱团的指挥棒 ——
  tap: {
    id: 'tap',
    name: '敲击',
    en: 'TAP',
    cost: 40,
    kind: 'attack',
    hits: [3],
    desc: '像打拍子一样敲下去。木棒落下的地方会响起一声不属于它的音。',
  },
  wave: {
    id: 'wave',
    name: '无声的挥拍',
    en: 'SILENT BATON',
    cost: 90,
    kind: 'attack',
    hits: [3, 3],
    execute: { threshold: 0.4, bonus: 2 },
    desc: '挥出一个四拍的弧线，空气里裂开两道看不见的口子。目标残血时追加 2 点。',
  },

  // —— 保温杯（伤害随剩余次数变化） ——
  flask_swing: {
    id: 'flask_swing',
    name: '抡杯',
    en: 'FLASK SWING',
    cost: 45,
    kind: 'attack',
    fromWeapon: true,
    desc: '抡起保温杯砸下去。里面越满，砸得越重；空了就只有 1 点。',
  },
  flask_slam: {
    id: 'flask_slam',
    name: '旋盖重击',
    en: 'CAP SLAM',
    cost: 100,
    kind: 'attack',
    fromWeapon: true,
    multiplier: 2,
    execute: { threshold: 0.4, bonus: 2 },
    desc: '拧开盖子，用杯口那圈硬边砸下去。伤害翻倍，目标残血时追加 2 点。',
  },

  // —— 通用 ——
  aim: {
    id: 'aim',
    name: '准备动作',
    en: 'TAKE AIM',
    cost: 40,
    fixedCost: true,
    kind: 'buff',
    sureHit: true,
    desc: '停下脚步，调整呼吸与姿势。下一次攻击必定命中——给低命中武器留的保底手段。',
  },
};

export function getSkill(id) {
  const skill = SKILLS[id];
  if (!skill) throw new Error(`未知技能：${id}`);
  return skill;
}

/** 与武器无关、任何角色都永远可用的技能。 */
export const UNIVERSAL_SKILLS = ['aim'];
