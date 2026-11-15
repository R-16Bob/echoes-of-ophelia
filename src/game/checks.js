// 属性检定：1d12 暗骰。属性值（含检定加值）>= 出目 + 难度修正 即通过。
// 界面上只显示"需要掷出 ≤ N"，不显示具体骰面，保留暗骰的紧张感。

import { getCheckValue } from './stats.js';

export const DIFFICULTY = {
  easy: { key: 'easy', name: '容易', mod: -2, label: '容易' },
  normal: { key: 'normal', name: '普通', mod: 0, label: '普通' },
  hard: { key: 'hard', name: '困难', mod: 2, label: '困难' },
};

export const DIE_FACES = 12;

/** 这次检定需要掷出的最大点数（含难度修正） */
export function checkTarget(state, attrKey, diff = 'normal') {
  const difficulty = DIFFICULTY[diff] || DIFFICULTY.normal;
  return getCheckValue(state, attrKey) - difficulty.mod;
}

export function checkOdds(state, attrKey, diff = 'normal') {
  const target = checkTarget(state, attrKey, diff);
  const clamped = Math.max(0, Math.min(DIE_FACES, target));
  return clamped / DIE_FACES;
}

/**
 * 掷骰。返回 { die, target, success, attrKey, diff }
 * @param {import('../core/rng.js').Rng} rng
 */
export function rollCheck(rng, state, attrKey, diff = 'normal', bonus = 0) {
  const target = checkTarget(state, attrKey, diff) + bonus;
  const die = rng.d(DIE_FACES);
  return {
    die,
    target,
    success: die <= target,
    attrKey,
    diff,
    bonus,
    difficulty: DIFFICULTY[diff] || DIFFICULTY.normal,
  };
}

export function describeCheck(attrName, diff) {
  const difficulty = DIFFICULTY[diff] || DIFFICULTY.normal;
  return `${attrName}检定 · ${difficulty.name}`;
}
