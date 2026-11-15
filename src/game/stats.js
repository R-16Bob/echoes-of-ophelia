// 数值汇总：把装备、专长、疯狂/美德卡的修正合并成一份 mods。
// 所有读取派生数值的地方都应该走这里，避免各处重复计算。

import { getEquip, ITEMS, THERMOS_WEAPON } from '../data/equipment.js';
import { getTalent } from '../data/talents.js';
import { getCard } from '../data/cards.js';

export const ATTRS = [
  { key: 'str', name: '力量', abbr: 'STR', desc: '推开、抬起、硬碰硬' },
  { key: 'dex', name: '敏捷', abbr: 'DEX', desc: '闪避、潜入、逃' },
  { key: 'per', name: '感知', abbr: 'PER', desc: '看见不该看见的' },
  { key: 'knw', name: '知识', abbr: 'KNW', desc: '读懂、推理、记住' },
  { key: 'chr', name: '魅力', abbr: 'CHR', desc: '说服、安抚、被听见' },
  { key: 'luk', name: '幸运', abbr: 'LUK', desc: '刚好、碰巧、还活着' },
];

export const ATTR_KEYS = ATTRS.map((a) => a.key);
export const ATTR_NAME = Object.fromEntries(ATTRS.map((a) => [a.key, a.name]));

const MOD_KEYS = [
  'maxHp', 'maxSan', 'dmgBonus', 'hitBonus', 'dmgTaken', 'checkBonus',
  'healBonus', 'timeBonus', 'xpMult', 'sanOnKill', 'sanOnHeal',
  'sanPerRound', 'coinBonus',
];

export function emptyMods() {
  const mods = Object.fromEntries(MOD_KEYS.map((k) => [k, 0]));
  mods.attr = Object.fromEntries(ATTR_KEYS.map((k) => [k, 0]));
  mods.xpMult = 1;
  return mods;
}

export function addMods(target, source) {
  if (!source) return target;
  for (const key of MOD_KEYS) {
    if (typeof source[key] === 'number') target[key] += source[key];
  }
  if (source.attr) {
    for (const key of ATTR_KEYS) {
      if (typeof source.attr[key] === 'number') target.attr[key] += source.attr[key];
    }
  }
  return target;
}

/** 汇总一名角色身上的全部修正 */
export function collectMods(state) {
  const mods = emptyMods();
  const eq = state.equipment;

  if (eq.weapon) {
    const def = getEquip(eq.weapon);
    if (def) addMods(mods, def.mods);
  }
  if (eq.outfit) {
    const def = getEquip(eq.outfit);
    if (def) addMods(mods, def.mods);
  }
  for (const id of eq.trinkets) {
    if (!id) continue;
    const def = getEquip(id);
    if (def) addMods(mods, def.mods);
  }
  for (const id of state.talents) addMods(mods, getTalent(id).mods);
  for (const entry of state.cards) addMods(mods, getCard(entry.id).mods);

  return mods;
}

export function getMaxHp(state) {
  return Math.max(1, state.baseMaxHp + collectMods(state).maxHp);
}

export function getMaxSan(state) {
  return Math.max(1, state.baseMaxSan + collectMods(state).maxSan);
}

/** 面板属性：基础值 + 装备/专长/卡牌修正（不含临时检定加成） */
export function getAttr(state, key) {
  return Math.max(1, state.attrs[key] + collectMods(state).attr[key]);
}

export function getAllAttrs(state) {
  return Object.fromEntries(ATTR_KEYS.map((k) => [k, getAttr(state, k)]));
}

export function getWeapon(state) {
  const id = state.equipment.weapon;
  if (!id) return getEquip('fists');
  if (id === 'thermos') {
    const entry = getInventoryEntry(state, 'thermos');
    const uses = entry ? entry.uses : 0;
    return { ...THERMOS_WEAPON, damage: 1 + uses, uses };
  }
  return getEquip(id);
}

/** 检定时使用的属性总值（含 checkBonus） */
export function getCheckValue(state, key) {
  return getAttr(state, key) + collectMods(state).checkBonus;
}

export function getInventoryEntry(state, itemId) {
  return state.inventory.find((entry) => entry.id === itemId) || null;
}

/** 属性对伤害的修正：(属性 - 6) / 2 向下取整 */
export function attrDamageBonus(attrValue) {
  return Math.floor((attrValue - 6) / 2);
}

/** 属性对耗时的修正：每 2 点 -10%，最低 50% */
export function attrTimeFactor(attrValue) {
  return Math.max(0.5, 1 - 0.1 * Math.floor((attrValue - 6) / 2));
}

/**
 * 武器在战斗中的实际面板：命中拆成「武器 + 等级 − POW + 装备」，
 * 伤害拆成「武器 + 属性 + 装备」。角色卡与战斗界面共用。
 */
export function getWeaponReport(state, { enemyPow = 0 } = {}) {
  const weapon = getWeapon(state);
  const mods = collectMods(state);
  const attrValue = getAttr(state, weapon.attr);
  const weaponAcc = Math.round(weapon.acc * 100);
  const levelBonus = state.level * 1;
  const gearHit = mods.hitBonus;
  const totalHit = Math.max(5, Math.min(95, weaponAcc + levelBonus - enemyPow + gearHit));
  const attrBonus = attrDamageBonus(attrValue);
  return {
    weapon,
    attrValue,
    weaponAcc,
    levelBonus,
    enemyPow,
    gearHit,
    totalHit,
    timeFactor: attrTimeFactor(attrValue) * (1 - mods.timeBonus / 100),
    attrBonus,
    gearDmg: mods.dmgBonus,
  };
}

/** 列出所有加成来源，供角色卡「加成汇总」使用。 */
export function modSources(state) {
  const list = [];
  const eq = state.equipment || {};
  for (const [slot, id] of [['weapon', eq.weapon], ['outfit', eq.outfit]]) {
    if (!id) continue;
    const def = getEquip(id);
    if (def && def.mods) list.push({ label: def.name, kind: slotLabel(slot), mods: def.mods });
  }
  for (const id of eq.trinkets || []) {
    if (!id) continue;
    const def = getEquip(id);
    if (def && def.mods) list.push({ label: def.name, kind: '饰品', mods: def.mods });
  }
  for (const id of state.talents || []) {
    const def = getTalent(id);
    if (def && def.mods) list.push({ label: def.name, kind: '专长', mods: def.mods });
  }
  for (const entry of state.cards || []) {
    const def = getCard(entry.id);
    if (def && def.mods) list.push({ label: def.name, kind: '疯狂', mods: def.mods });
  }
  return list;
}

function slotLabel(slot) {
  return slot === 'weapon' ? '武器' : slot === 'outfit' ? '服装' : '饰品';
}

export function countItem(state, itemId) {
  const entry = getInventoryEntry(state, itemId);
  if (!entry) return 0;
  return entry.uses ?? 1;
}

export function hasItem(state, itemId) {
  return Boolean(getInventoryEntry(state, itemId));
}

/** 关键物品（钥匙、乐谱一类）不占消耗品次数 */
export function itemDef(itemId) {
  const def = ITEMS[itemId];
  if (!def) throw new Error(`未知道具：${itemId}`);
  return def;
}
