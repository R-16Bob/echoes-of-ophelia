// 图鉴：按类别列出全部可收集条目。
// 解锁状态由 Game 维护（localStorage 持久化），这里只负责「有哪些东西」。

import { ENEMIES } from './enemies.js';
import { WEAPONS, OUTFITS, TRINKETS, ITEMS } from './equipment.js';
import { TALENT_LIST } from './talents.js';
import { MADNESS_CARDS, VIRTUE_CARDS } from './cards.js';

const CONSUMABLES = Object.values(ITEMS).filter((item) => item.type === 'consumable');

export const CODEX_CATEGORIES = [
  {
    id: 'enemies',
    name: '敌人',
    en: 'ENEMIES',
    hint: '遭遇后记录',
    entries: () => Object.values(ENEMIES),
  },
  {
    id: 'weapons',
    name: '武器',
    en: 'WEAPONS',
    hint: '获得或装备后记录',
    // 空手不算收集品；保温杯归入消耗品，避免两处重复计数。
    entries: () => Object.values(WEAPONS).filter((weapon) => weapon.id !== 'fists' && weapon.id !== 'thermos'),
  },
  {
    id: 'outfits',
    name: '服装',
    en: 'OUTFITS',
    hint: '获得或装备后记录',
    entries: () => Object.values(OUTFITS),
  },
  {
    id: 'trinkets',
    name: '饰品',
    en: 'TRINKETS',
    hint: '获得或装备后记录',
    entries: () => Object.values(TRINKETS),
  },
  {
    id: 'items',
    name: '消耗品',
    en: 'CONSUMABLES',
    hint: '获得后记录',
    entries: () => CONSUMABLES,
  },
  {
    id: 'talents',
    name: '专长',
    en: 'TALENTS',
    hint: '取得后记录',
    entries: () => TALENT_LIST,
  },
  {
    id: 'madness',
    name: '疯狂',
    en: 'MADNESS',
    hint: '抽到后记录',
    entries: () => Object.values(MADNESS_CARDS),
  },
  {
    id: 'virtue',
    name: '美德',
    en: 'VIRTUES',
    hint: '抽到后记录',
    entries: () => Object.values(VIRTUE_CARDS),
  },
];

export function getCodexCategory(id) {
  return CODEX_CATEGORIES.find((category) => category.id === id) || CODEX_CATEGORIES[0];
}

export function codexTotals() {
  const totals = {};
  for (const category of CODEX_CATEGORIES) {
    totals[category.id] = category.entries().length;
  }
  return totals;
}
