// 回合制战斗。
//
// 规则回顾：
//  · 玩家先手，一回合共 200t，武器技能各自消耗时间；排好队列后点击执行。
//  · 执行前可以随意撤回队列里的行动。
//  · 使用道具不消耗时间，不占队列。
//  · 命中率 = 武器面板 + 等级*1% - 敌人 POW（+ 装备/技能加成）
//  · 伤害 = 技能基础伤害 + 属性修正 + 伤害加成；属性修正 = (属性值 - 6) / 2 向下取整
//  · 速度：属性每高 2 点，技能耗时 -10%（最低 50%）

import { getEquip } from '../data/equipment.js';
import { getEnemy } from '../data/enemies.js';
import { getSkill } from '../data/skills.js';
import { getAttr, getWeapon, attrDamageBonus, attrTimeFactor } from './stats.js';

export { attrDamageBonus, attrTimeFactor };

export const TURN_TIME = 200;

export class Combat {
  constructor(game, enemyId) {
    this.game = game;
    this.enemy = getEnemy(enemyId);
    this.enemyHp = this.enemy.maxHp;
    this.round = 1;
    this.queue = [];
    this.log = [];
    this.buffs = { hitBonus: 0 };
    this.sureHit = false; // 「准备动作」：下一次攻击必定命中
    this.finished = false;
    this.result = null; // 'win' | 'lose'
    this.enemyTurnIndex = 0;
    this.push('enemy', this.enemy.intro || `${this.enemy.name}挡住了去路。`);
  }

  get state() {
    return this.game.state;
  }

  get weapon() {
    return getWeapon(this.state);
  }

  get attrValue() {
    return getAttr(this.state, this.weapon.attr);
  }

  get hitChance() {
    return this.hitBreakdown.total;
  }

  /** 命中率拆解：武器 + 等级（每级 +1%）- POW + 装备/卡牌。 */
  get hitBreakdown() {
    const weaponAcc = Math.round(this.weapon.acc * 100);
    const level = this.state.level * 1;
    const pow = this.enemy.pow;
    const gear = this.game.mods().hitBonus;
    const total = Math.max(5, Math.min(95, weaponAcc + level - pow + gear));
    return { weaponAcc, level, pow, gear, total };
  }

  /** 敌人下一回合要做什么，直接摊在界面上。 */
  get nextAttack() {
    const pattern = this.enemy.pattern && this.enemy.pattern.length ? this.enemy.pattern : [{ type: 'hp', dmg: 2 }];
    return pattern[this.enemyTurnIndex % pattern.length];
  }

  get patternList() {
    const pattern = this.enemy.pattern && this.enemy.pattern.length ? this.enemy.pattern : [{ type: 'hp', dmg: 2 }];
    return pattern.map((attack, index) => ({
      ...attack,
      index,
      next: index === this.enemyTurnIndex % pattern.length,
    }));
  }

  get timeFactor() {
    return attrTimeFactor(this.attrValue) * (1 - this.game.mods().timeBonus / 100);
  }

  get timeLeft() {
    return TURN_TIME - this.queue.reduce((total, action) => total + action.cost, 0);
  }

  costOf(skillId) {
    const skill = getSkill(skillId);
    const base = skill.cost || skill.time || this.weapon.speed || 50;
    const factor = skill.fixedCost ? 1 : this.timeFactor;
    return Math.max(5, Math.round((base * factor) / 5) * 5);
  }

  damageOf(skill) {
    let base;
    if (skill.fromWeapon) {
      base = (this.weapon.damage || 1) * (skill.multiplier || 1);
    } else if (skill.hits) {
      base = skill.hits.reduce((a, b) => a + b, 0);
    } else {
      base = skill.damage || 0;
    }
    const hits = skill.hits ? skill.hits.length : 1;
    const weak = this.weaknessBonus ? hits : 0;
    return Math.max(1, Math.round(base) + attrDamageBonus(this.attrValue) + this.game.mods().dmgBonus + weak);
  }

  /** 当前武器是否命中敌人弱点 */
  get weaknessBonus() {
    return Boolean(this.enemy.weakness && this.weapon.damageType === this.enemy.weakness);
  }

  /** 技能伤害拆解，给战斗界面显示。 */
  breakdownOf(skill) {
    let weaponBase;
    if (skill.fromWeapon) weaponBase = (this.weapon.damage || 1) * (skill.multiplier || 1);
    else if (skill.hits) weaponBase = skill.hits.reduce((a, b) => a + b, 0);
    else weaponBase = skill.damage || 0;
    const attr = attrDamageBonus(this.attrValue);
    const gear = this.game.mods().dmgBonus;
    const weak = this.weaknessBonus ? (skill.hits ? skill.hits.length : 1) : 0;
    return {
      weaponBase,
      attr,
      gear,
      weak,
      total: Math.max(1, Math.round(weaponBase) + attr + gear + weak),
    };
  }

  /** 当前武器可用的技能（含普通攻击与通用的「准备动作」） */
  get actions() {
    const weapon = this.weapon;
    const ids = [weapon.basic, ...(weapon.skills || []), 'aim'];
    return [...new Set(ids)].map((id) => {
      const skill = getSkill(id);
      const breakdown = this.breakdownOf(skill);
      return {
        ...skill,
        cost: this.costOf(id),
        damage: breakdown.total,
        breakdown,
        affordable: this.costOf(id) <= this.timeLeft,
      };
    });
  }

  get inventoryActions() {
    return this.game.usableItems();
  }

  push(kind, text) {
    this.log.push({ kind, text });
  }

  addAction(skillId) {
    const skill = getSkill(skillId);
    const cost = this.costOf(skillId);
    if (cost > this.timeLeft) return false;
    this.queue.push({ skillId, cost, name: skill.name });
    return true;
  }

  removeAction(index) {
    if (index < 0 || index >= this.queue.length) return;
    this.queue.splice(index, 1);
  }

  clearQueue() {
    this.queue = [];
  }

  rollHit() {
    if (this.sureHit) {
      this.sureHit = false;
      return { hit: true, chance: 100, consumed: 0 };
    }
    const bonus = this.buffs.hitBonus + this.game.consumeBuff('hit');
    const chance = Math.max(5, Math.min(95, this.hitChance + bonus));
    const hit = this.game.rng.chance(chance / 100);
    return { hit, chance, consumed: bonus };
  }

  /** 执行排好的行动，然后敌人行动 */
  execute() {
    if (this.finished || this.queue.length === 0) return;
    const actions = this.queue.slice();
    this.queue = [];

    for (const action of actions) {
      if (this.finished) break;
      const skill = getSkill(action.skillId);
      this.playerAct(skill, action.cost);
    }

    if (!this.finished) this.enemyAct();
  }

  playerAct(skill, cost) {
    if (skill.sureHit) {
      this.sureHit = true;
      this.push('player', `爱丽丝深吸一口气，摆好架势——下一次攻击必定命中。`);
      if (skill.sanCost) this.game.changeSan(-skill.sanCost);
      return;
    }

    if (skill.kind === 'buff' || skill.effect === 'hitBonus') {
      this.buffs.hitBonus += skill.hitBonus || 0;
      this.push(
        'player',
        `爱丽丝${skill.flavor || '转动钥匙，让链条在手腕上绕了一圈'}。下一击命中 +${skill.hitBonus || 0}%（累计 +${this.buffs.hitBonus}%）。`,
      );
      if (skill.sanCost) this.game.changeSan(-skill.sanCost);
      return;
    }

    const { hit, chance, consumed } = this.rollHit();
    const name = skill.name;

    if (!hit) {
      if (consumed) this.buffs.hitBonus = 0;
      this.push('miss', `${name}落空了（命中 ${chance}%）。`);
      return;
    }
    if (consumed) this.buffs.hitBonus = 0;

    const baseHit = skill.fromWeapon ? (this.weapon.damage || 1) * (skill.multiplier || 1) : skill.damage || 0;
    const hits = skill.hits || [baseHit];
    const weak = this.weaknessBonus;
    const bonusDmg = this.game.consumeBuff('dmg');
    let total = 0;
    let weakTotal = 0;
    hits.forEach((_, index) => {
      let dmg = Math.max(1, hits[index] + attrDamageBonus(this.attrValue) + this.game.mods().dmgBonus);
      if (index === 0 && bonusDmg) dmg += bonusDmg;
      if (weak) {
        dmg += 1;
        weakTotal += 1;
      }
      const execute = skill.execute;
      if (execute && this.enemyHp / this.enemy.maxHp <= execute.threshold && index === hits.length - 1) {
        dmg += execute.bonus;
        this.push('crit', `处决判定成立——额外 ${execute.bonus} 点伤害。`);
      }
      this.enemyHp = Math.max(0, this.enemyHp - dmg);
      total += dmg;
    });

    const weakText = weakTotal ? `，弱点加成 +${weakTotal}` : '';
    this.push('player', `${name}命中（${chance}%），造成 ${total} 点伤害${hits.length > 1 ? `（${hits.length} 段）` : ''}${weakText}。`);
    if (this.game.log) this.game.logEvent('combat', `${name} → ${this.enemy.name} ${total} 伤害${weakText}`);
    if (this.enemyHp <= 0) this.win();
  }

  enemyAct() {
    const pattern = this.enemy.pattern && this.enemy.pattern.length ? this.enemy.pattern : [{ type: 'hp', dmg: 2 }];
    const attack = pattern[this.enemyTurnIndex % pattern.length];
    this.enemyTurnIndex += 1;

    const kind = attack.type || (attack.hp ? 'hp' : 'san');
    const value = attack.dmg != null ? attack.dmg : attack.hp || attack.san || 0;

    if (kind === 'hp') {
      const dmg = Math.max(0, value - this.game.mods().dmgTaken);
      this.game.changeHp(-dmg);
      this.push('enemy', `${this.enemy.name}扑了上来——HP -${dmg}。`);
      if (this.game.log) this.game.logEvent('damage', `${this.enemy.name} → HP -${dmg}`);
      if (this.game.dead) return this.lose();
    } else {
      const dmg = Math.max(0, value - this.game.mods().dmgTaken);
      this.game.changeSan(-dmg);
      this.push('enemy', `${this.enemy.name}发出一种不属于人的声音——SAN -${dmg}。`);
      if (this.game.log) this.game.logEvent('damage', `${this.enemy.name} → SAN -${dmg}`);
      if (this.game.dead) return this.lose();
    }
    if (attack.text) this.push('enemy', attack.text);

    const drain = this.game.mods().sanPerRound;
    if (drain) {
      this.game.changeSan(-drain);
      this.push('enemy', `脑子里的声音没有停——SAN -${drain}。`);
      if (this.game.dead) return this.lose();
    }

    this.round += 1;
    if (this.round > 12) {
      this.push('system', '空气变得黏稠。再来一次，就不知道会从里面带出什么了。');
    }
  }

  win() {
    this.finished = true;
    this.result = 'win';
    this.push('system', `${this.enemy.name}倒下了。`);
  }

  lose() {
    this.finished = true;
    this.result = 'lose';
    this.push('system', '爱丽丝的视野暗了下去。');
  }

  get victory() {
    return this.result === 'win';
  }

  /** 战斗结束后结算奖励 */
  settle() {
    const game = this.game;
    const enemy = this.enemy;
    const xp = Math.round(enemy.xp * game.mods().xpMult);
    game.addXp(xp);
    const coins = enemy.coins + game.mods().coinBonus;
    game.addCoins(coins);

    const drops = [];
    if (enemy.drop && game.rng.chance(enemy.drop.chance)) {
      if (game.addItem(enemy.drop.item)) drops.push(enemy.drop.item);
    }

    if (game.mods().sanOnKill) {
      game.changeSan(game.mods().sanOnKill);
    }

    return { xp, coins, drops };
  }
}

export function weaponSummary(state) {
  const weapon = getWeapon(state);
  return {
    name: weapon.name,
    acc: weapon.acc,
    damage: weapon.damage,
    speed: weapon.speed,
    attr: weapon.attr,
  };
}
