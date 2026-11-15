// 结算一个 effects 对象：修改角色状态、返回给玩家的反馈。
// 所有数值变化都经过这里，方便统一处理死亡、疯狂卡、升级等中断。

import { getThing } from '../data/equipment.js';
import { getArea } from '../data/areas.js';
import { compensationFor } from '../data/shop.js';

/**
 * @returns {{lines: string[], chips: {kind:string,label:string}[], endDemo?: boolean, dead?: string|null}}
 */
export function applyEffects(game, effects = {}) {
  const lines = [];
  const chips = [];
  const state = game.state;

  if (typeof effects.hp === 'number' && effects.hp !== 0) {
    const real = effects.hp > 0 ? Math.round(effects.hp + game.mods().healBonus) : effects.hp;
    game.changeHp(real);
    chips.push({ kind: real > 0 ? 'hp-up' : 'hp-down', label: `HP ${real > 0 ? '+' : ''}${real}` });
    if (real > 0) lines.push(`体力恢复了 ${real} 点。`);
  }

  if (typeof effects.san === 'number' && effects.san !== 0) {
    const real = effects.san > 0 ? Math.round(effects.san + game.mods().sanOnHeal) : effects.san;
    game.changeSan(real);
    chips.push({ kind: real > 0 ? 'san-up' : 'san-down', label: `SAN ${real > 0 ? '+' : ''}${real}` });
    if (real > 0) lines.push(`理智恢复了 ${real} 点。`);
  }

  if (typeof effects.xp === 'number' && effects.xp > 0) {
    const real = Math.round(effects.xp * game.mods().xpMult);
    game.addXp(real);
    chips.push({ kind: 'xp', label: `XP +${real}` });
  }

  if (typeof effects.coins === 'number' && effects.coins > 0) {
    const real = effects.coins + game.mods().coinBonus;
    game.addCoins(real);
    chips.push({ kind: 'coin', label: `硬币 +${real}` });
  }

  if (effects.item) {
    const def = getThing(effects.item);
    const added = game.addItem(effects.item);
    if (def && added) {
      chips.push({ kind: 'item', label: `获得「${def.name}」` });
      lines.push(`获得${def.type === 'key' ? '关键物品' : def.type === 'consumable' ? '道具' : '装备'}：${def.name}。`);
    } else if (def && !added) {
      // 重复获得：按商店价格折算成硬币，避免奖励完全浪费。
      const refund = compensationFor(effects.item) + game.mods().coinBonus;
      game.addCoins(refund);
      chips.push({ kind: 'item', label: `「${def.name}」已经有了` });
      chips.push({ kind: 'coin', label: `硬币 +${refund}` });
      lines.push(`又是${def.name}。校工把它收下，抵了 ${refund} 枚硬币。`);
    }
  }

  if (effects.consume) {
    game.consumeItem(effects.consume);
  }

  if (effects.clue) {
    const added = game.addClue(effects.clue);
    if (added) {
      chips.push({ kind: 'clue', label: `线索「${effects.clue.title}」` });
      lines.push(`线索已记录：${effects.clue.title}。`);
    }
  }

  if (effects.unlock) {
    const area = getArea(effects.unlock);
    game.unlockArea(effects.unlock);
    chips.push({ kind: 'unlock', label: `新区域：${area.name}` });
  }

  if (effects.flag) {
    state.flags[effects.flag] = true;
  }

  if (effects.endDemo) {
    game.pendingEnding = true;
    chips.push({ kind: 'end', label: 'DEMO 完成' });
  }

  return { lines, chips, endDemo: Boolean(effects.endDemo), dead: game.dead };
}
