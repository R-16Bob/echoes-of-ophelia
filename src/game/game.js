// 游戏主状态机。
// UI 只负责渲染 this.screen 与各个字段，所有推进都通过这里的方法完成。

import { Rng, randomSeed } from '../core/rng.js';
import { clamp, deepClone } from '../core/util.js';
import { ALICE } from '../data/character.js';
import { AREAS, AREA_ORDER, SAFE_STOPS, getArea, nextStop, passedStop } from '../data/areas.js';
import { getEvent } from '../data/events.js';
import { TALENT_LIST, getTalent } from '../data/talents.js';
import { drawCard, getCard, CARDS_PER_THRESHOLD } from '../data/cards.js';

import { ITEMS, DAMAGE_TYPES, getEquip, getThing, isConsumable } from '../data/equipment.js';
import { rollStock, SHOP_GOODS } from '../data/shop.js';
import { rollCheck, checkTarget } from './checks.js';
import { applyEffects } from './effects.js';
import { Combat } from './combat.js';
import { collectMods, getMaxHp, getMaxSan, getAttr, getAllAttrs, getWeapon, ATTR_KEYS, ATTR_NAME } from './stats.js';

const SETTINGS_KEY = 'alice.settings.v1';
const DEFAULT_SETTINGS = { showRolls: true };

function loadSettings() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null;
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* 无法写入时只影响持久化，不影响本局。 */
  }
}

// 图鉴进度与存档无关，跨周目保留在本机浏览器里。
const CODEX_KEY = 'alice.codex.v1';
const CODEX_CATEGORY_IDS = ['enemies', 'weapons', 'outfits', 'trinkets', 'items', 'talents', 'madness', 'virtue'];

function emptyCodex() {
  const codex = {};
  for (const id of CODEX_CATEGORY_IDS) codex[id] = [];
  return codex;
}

function loadCodex() {
  const codex = emptyCodex();
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CODEX_KEY) : null;
    if (!raw) return codex;
    const saved = JSON.parse(raw);
    for (const id of CODEX_CATEGORY_IDS) {
      if (Array.isArray(saved[id])) codex[id] = [...new Set(saved[id])];
    }
  } catch {
    /* 坏数据就当作空图鉴。 */
  }
  return codex;
}

function saveCodex(codex) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(CODEX_KEY, JSON.stringify(codex));
  } catch {
    /* 写入失败不影响本局查看。 */
  }
}

export class Game {
  constructor() {
    this.listeners = new Set();
    this.screen = 'title';
    this.page = 0;
    this.rng = new Rng(randomSeed());
    this.state = null;
    this.notice = '';
    this.event = null;
    this.outcome = null;
    this.combat = null;
    this.modals = [];
    this.safe = null;
    this.ending = null;
    this.lastCombat = null;
    this.settings = loadSettings();
    this.codex = loadCodex();
  }

  // ── 订阅 ──────────────────────────────────────────────

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    for (const fn of this.listeners) fn(this);
  }

  setScreen(screen) {
    this.screen = screen;
    this.emit();
  }

  /** 切换偏好设置（与存档无关，写在 localStorage） */
  toggleSetting(key) {
    if (!(key in this.settings)) return;
    this.settings[key] = !this.settings[key];
    saveSettings(this.settings);
    this.emit();
  }

  // ── 图鉴 ──────────────────────────────────────────────

  codexHas(category, id) {
    const list = this.codex && this.codex[category];
    return Boolean(list && list.includes(id));
  }

  /** 解锁一条图鉴；返回是否是第一次记录。 */
  unlockCodex(category, id) {
    if (!this.codex || !CODEX_CATEGORY_IDS.includes(category) || !id) return false;
    if (this.codex[category].includes(id)) return false;
    this.codex[category].push(id);
    saveCodex(this.codex);
    return true;
  }

  codexCount(category) {
    const list = this.codex && this.codex[category];
    return list ? list.length : 0;
  }

  // ── 状态初始化 ─────────────────────────────────────────

  createState(seed = randomSeed()) {
    this.rng = new Rng(seed);
    const areas = {};
    for (const id of AREA_ORDER) {
      const def = getArea(id);
      areas[id] = {
        progress: 0,
        draws: 0,
        pool: [...(def.events || [])],
        cleared: false,
        safeVisited: [],
        unlocked: !def.unlock,
      };
    }
    const state = {
      seed,
      level: 1,
      xp: 0,
      coins: 20,
      hp: ALICE.hp,
      san: ALICE.san,
      baseMaxHp: ALICE.baseMaxHp,
      baseMaxSan: ALICE.baseMaxSan,
      attrs: { ...ALICE.attrs },
      equipment: deepClone(ALICE.equipment),
      inventory: deepClone(ALICE.inventory),
      talents: [...ALICE.talents],
      cards: [],
      buffs: [],
      clues: [],
      areas,
      currentArea: null,
      flags: {},
      // 理智侵蚀计数：累计失去的 SAN。达到阈值抽卡并清零，回复 SAN 会倒扣。
      sanMark: 0,
      steps: 0,
      log: [],
      logSeq: 0,
    };
    state.hp = getMaxHp(state);
    state.san = getMaxSan(state);
    return state;
  }

  newGame() {
    this.state = this.createState();
    this.page = 0;
    this.event = null;
    this.outcome = null;
    this.combat = null;
    this.modals = [];
    this.safe = null;
    this.ending = null;
    // 初始装备与专长也算「已获得」，从第一局开始就进图鉴。
    this.unlockCodex('weapons', this.state.equipment.weapon);
    this.unlockCodex('outfits', this.state.equipment.outfit);
    for (const trinket of this.state.equipment.trinkets) this.unlockCodex('trinkets', trinket);
    for (const entry of this.state.inventory) this.unlockCodex('items', entry.id);
    for (const talent of this.state.talents) this.unlockCodex('talents', talent);
    this.setScreen('prologue');
  }

  backToTitle() {
    this.state = null;
    this.combat = null;
    this.modals = [];
    this.setScreen('title');
  }

  advancePrologue() {
    this.page += 1;
    this.emit();
  }

  startGame() {
    if (!this.state) {
      this.newGame();
      return;
    }
    if (this.screen === 'prologue') this.logEvent('event', '爱丽丝推开铁门，走进圣艾格尼丝的校门。');
    this.setScreen('map');
  }

  // ── 派生数值 ───────────────────────────────────────────

  mods() {
    return collectMods(this.state);
  }

  get maxHp() {
    return getMaxHp(this.state);
  }

  get maxSan() {
    return getMaxSan(this.state);
  }

  get attrs() {
    return getAllAttrs(this.state);
  }

  get dead() {
    if (!this.state) return null;
    if (this.state.hp <= 0) return 'hp';
    if (this.state.san <= 0) return 'san';
    return null;
  }

  attr(key) {
    return getAttr(this.state, key);
  }

  weapon() {
    return getWeapon(this.state);
  }

  clearNotice() {
    this.notice = '';
  }

  notify(text) {
    this.notice = text;
    this.emit();
  }

  // ── 资源变动 ───────────────────────────────────────────

  /** 事件日志：数值变化、选择、战斗结算都会记一条。 */
  logEvent(kind, text) {
    const s = this.state;
    if (!s || !s.log) return;
    s.logSeq += 1;
    s.log.push({ n: s.logSeq, kind, text });
    if (s.log.length > 300) s.log.splice(0, s.log.length - 300);
  }

  changeHp(delta) {
    const s = this.state;
    const before = s.hp;
    s.hp = clamp(s.hp + delta, 0, this.maxHp);
    const diff = s.hp - before;
    if (diff !== 0) this.logEvent(diff < 0 ? 'damage' : 'heal', `HP ${diff > 0 ? '+' : ''}${diff}（${s.hp} / ${this.maxHp}）`);
    if (s.hp <= 0) this.onDeath();
  }

  changeSan(delta) {
    const s = this.state;
    const before = s.san;
    if (delta < 0) s.sanMark += -delta;
    else if (delta > 0) s.sanMark = Math.max(0, s.sanMark - delta);
    s.san = clamp(s.san + delta, 0, this.maxSan);
    const diff = s.san - before;
    if (diff !== 0) this.logEvent(diff < 0 ? 'damage' : 'heal', `SAN ${diff > 0 ? '+' : ''}${diff}（${s.san} / ${this.maxSan}）`);
    if (s.san <= 0) {
      this.onDeath();
      return;
    }
    if (delta < 0) this.checkSanityCards();
  }

  /** 抽一张疯狂 / 美德卡所需的 SAN 侵蚀量（上限的 1/5） */
  sanityThreshold() {
    return Math.ceil(this.maxSan / CARDS_PER_THRESHOLD);
  }

  /** 给 HUD 用的侵蚀计数 */
  sanityMark() {
    return { value: Math.min(this.state.sanMark, this.sanityThreshold()), max: this.sanityThreshold(), raw: this.state.sanMark };
  }

  /** 取走并消耗某一类临时加成（美德卡）。 */
  consumeBuff(kind) {
    const s = this.state;
    if (!s || !s.buffs || !s.buffs.length) return 0;
    let total = 0;
    s.buffs = s.buffs.filter((buff) => {
      if (!buff[kind]) return true;
      total += buff[kind];
      return false;
    });
    if (total) this.logEvent('card', `临时加成生效（${kind} +${total}）`);
    return total;
  }

  /** 角色卡上用：当前还在身上的临时效果。 */
  get buffList() {
    return this.state ? this.state.buffs || [] : [];
  }

  checkSanityCards() {
    const s = this.state;
    const threshold = this.sanityThreshold();
    let guard = 0;
    while (s.sanMark >= threshold && guard < 3 && s.san > 0) {
      s.sanMark -= threshold;
      guard += 1;
      const card = drawCard(this.rng, [
        ...s.cards.map((c) => c.id),
        ...s.buffs.map((b) => b.id),
      ]);
      const def = card.def;
      this.logEvent('card', `${def.kind === 'madness' ? '疯狂' : '美德'}卡「${def.name}」`);
      this.unlockCodex(card.kind === 'madness' ? 'madness' : 'virtue', card.id);
      if (card.kind === 'madness') {
        s.cards.push({ id: card.id, kind: card.kind });
      } else {
        // 美德是一次性的：立刻结算回复，其余效果存成待消耗的临时加成。
        const once = def.once || {};
        if (once.hp) this.changeHp(once.hp);
        if (once.san) this.changeSan(once.san);
        const buff = {
          id: card.id,
          name: def.name,
          check: once.check || 0,
          hit: once.hit || 0,
          dmg: once.dmg || 0,
        };
        if (buff.check || buff.hit || buff.dmg) s.buffs.push(buff);
      }
      this.modals.push({ type: 'card', card });
    }
    if (guard) this.emit();
  }

  addXp(amount) {
    const s = this.state;
    s.xp += amount;
    if (amount) this.logEvent('xp', `XP +${amount}（${s.xp % 100} / 100）`);
    while (s.xp >= 100) {
      s.xp -= 100;
      s.level += 1;
      this.logEvent('level', `等级提升至 LV ${s.level}`);
      this.queueLevelUp();
    }
  }

  addCoins(amount) {
    this.state.coins += amount;
    if (amount) this.logEvent('coin', `硬币 ${amount > 0 ? '+' : ''}${amount}（${this.state.coins}）`);
  }

  /** 是否已经持有某件装备 / 关键物品（消耗品不算，允许多次补充）。 */
  ownsThing(itemId) {
    const s = this.state;
    if (!s) return false;
    if (s.inventory.some((entry) => entry.id === itemId)) return true;
    if (s.equipment.weapon === itemId || s.equipment.outfit === itemId) return true;
    return s.equipment.trinkets.includes(itemId);
  }

  addItem(itemId) {
    const s = this.state;
    const def = getThing(itemId);
    if (!def) return false;
    const existing = s.inventory.find((entry) => entry.id === itemId);
    const equipped =
      s.equipment.weapon === itemId ||
      s.equipment.outfit === itemId ||
      s.equipment.trinkets.includes(itemId);

    // 装备与关键物品不叠次数，且不能重复持有。
    if (def.type === 'weapon' || def.type === 'outfit' || def.type === 'trinket' || def.type === 'key') {
      if (existing || equipped) return false;
      s.inventory.push({ id: itemId, uses: 1 });
      this.logEvent('item', `获得「${def.name}」`);
      if (def.type === 'weapon') this.unlockCodex('weapons', itemId);
      if (def.type === 'outfit') this.unlockCodex('outfits', itemId);
      if (def.type === 'trinket') this.unlockCodex('trinkets', itemId);
      return true;
    }

    if (existing) {
      const cap = def.maxUses || 9;
      if (existing.uses >= cap) return false;
      existing.uses = Math.min(cap, existing.uses + 1);
      this.logEvent('item', `「${def.name}」+1（${existing.uses} / ${cap}）`);
      this.unlockCodex('items', itemId);
      return true;
    }
    s.inventory.push({ id: itemId, uses: def.maxUses || 1 });
    this.logEvent('item', `获得「${def.name}」`);
    this.unlockCodex('items', itemId);
    return true;
  }

  consumeItem(itemId) {
    const s = this.state;
    const index = s.inventory.findIndex((entry) => entry.id === itemId);
    if (index < 0) return;
    const entry = s.inventory[index];
    entry.uses -= 1;
    if (entry.uses <= 0) s.inventory.splice(index, 1);
  }

  addClue(clue) {
    if (!clue || !clue.id) return false;
    if (this.state.clues.some((c) => c.id === clue.id)) return false;
    this.state.clues.push({ ...clue });
    this.logEvent('clue', `线索「${clue.title}」`);
    // 看清了一件事，恐惧就退后一点。
    this.changeSan(1);
    return true;
  }

  unlockArea(areaId) {
    if (this.state.areas[areaId]) this.state.areas[areaId].unlocked = true;
  }

  onDeath() {
    if (this.screen === 'gameover') return;
    this.setScreen('gameover');
  }

  // ── 升级 ──────────────────────────────────────────────

  queueLevelUp() {
    const owned = new Set(this.state.talents);
    const pool = TALENT_LIST.filter((t) => !owned.has(t.id));
    const options = this.rng.sample(pool.length >= 3 ? pool : TALENT_LIST, 3);
    this.modals.push({ type: 'levelup', step: 'talent', options });
  }

  pickTalent(talentId) {
    const modal = this.modals[0];
    if (!modal || modal.type !== 'levelup' || modal.step !== 'talent') return;
    if (!this.state.talents.includes(talentId)) this.state.talents.push(talentId);
    this.unlockCodex('talents', talentId);
    this.logEvent('level', `获得专长「${getTalent(talentId).name}」`);
    modal.step = 'attr';
    this.emit();
  }

  pickAttr(key) {
    const modal = this.modals[0];
    if (!modal || modal.type !== 'levelup' || modal.step !== 'attr') return;
    this.state.attrs[key] += 1;
    this.logEvent('level', `属性提升：${key.toUpperCase()} +1`);
    this.modals.shift();
    this.emit();
  }

  dismissModal() {
    const modal = this.modals[0];
    if (!modal) return;
    if (modal.type === 'card') {
      this.modals.shift();
      this.emit();
    }
  }

  // ── 地图 ──────────────────────────────────────────────

  goMap() {
    this.clearNotice();
    this.state.currentArea = null;
    // 兜底：结局事件已结算但没标记 endDemo（例如历史存档），不要让玩家困在地图上。
    if (this.state.areas.music && this.state.areas.music.cleared) {
      this.finishDemo();
      return;
    }
    this.setScreen('map');
  }

  areaStatus(areaId) {
    const def = getArea(areaId);
    const runtime = this.state.areas[areaId];
    if (def.comingSoon) return 'coming';
    if (!runtime.unlocked) return 'locked';
    if (runtime.cleared) return 'cleared';
    return 'open';
  }

  canEnter(areaId) {
    return this.areaStatus(areaId) === 'open';
  }

  enterArea(areaId) {
    this.clearNotice();
    const status = this.areaStatus(areaId);
    if (status === 'coming') {
      this.notify('天台的路被铁栅栏锁住了。看来得先找到钥匙。');
      return;
    }
    if (status === 'locked') {
      this.notify('这里还进不去。先把手边的事做完。');
      return;
    }
    if (status === 'cleared') {
      this.notify('这个区域已经查过了。');
      return;
    }
    this.state.currentArea = areaId;
    this.event = null;
    this.outcome = null;
    this.setScreen('explore');
  }

  get area() {
    return this.state && this.state.currentArea ? getArea(this.state.currentArea) : null;
  }

  get areaRuntime() {
    return this.state && this.state.currentArea ? this.state.areas[this.state.currentArea] : null;
  }

  // ── 探索 ──────────────────────────────────────────────

  explore() {
    this.clearNotice();
    const runtime = this.areaRuntime;
    if (!runtime) return;

    // 探索度不再固定 +10%，而是由事件结算的顺利程度决定（5%–10%）。
    if (runtime.progress >= 100) {
      this.openEvent(this.area.fixedEvent);
      return;
    }

    this.state.steps += 1;
    if (runtime.pool.length === 0) runtime.pool = this.rng.shuffle([...(this.area.events || [])]);
    const eventId = runtime.pool.pop();
    runtime.draws += 1;
    this.openEvent(eventId);
  }

  /**
   * 按事件结算质量计算探索度增量：下限 5%，上限 10%。
   * 检定通过 / 主动行动 +2，无伤 +1，无 SAN 损失 +1，拿到物品或线索 +1，再掷 0–1 的随机。
   */
  explorationGain({ ok, check, hpBefore, sanBefore, chips }) {
    const s = this.state;
    let gain = ok ? 7 : 5;
    if (!check) gain += 1;
    gain += this.rng.int(0, 1);
    if (s.hp >= hpBefore) gain += 1;
    if (s.san >= sanBefore) gain += 1;
    if ((chips || []).some((chip) => chip.kind === 'item' || chip.kind === 'clue')) gain += 1;
    return clamp(gain, 5, 10);
  }

  openEvent(eventId) {
    const event = getEvent(eventId);
    this.event = {
      id: eventId,
      event,
      check: null,
      choice: null,
      outcome: null,
      combatPending: false,
      winOutcome: null,
      isFixed: Boolean(event.fixed),
    };
    this.outcome = null;
    this.logEvent('event', `事件「${event.title}」`);
    this.setScreen('event');
  }

  /** 事件选项是否可用（物品/专长/武器需求） */
  choiceAvailable(choice) {
    const req = choice.requires;
    if (!req) return { ok: true };
    if (req.item) {
      const entry = this.state.inventory.find((e) => e.id === req.item);
      if (!entry) return { ok: false, reason: `需要「${getThing(req.item)?.name || req.item}」` };
      return { ok: true };
    }
    if (req.talent) {
      if (!this.state.talents.includes(req.talent)) {
        return { ok: false, reason: `需要专长「${getTalent(req.talent).name}」` };
      }
      return { ok: true };
    }
    if (req.weapon) {
      if (this.state.equipment.weapon !== req.weapon) {
        return { ok: false, reason: `需要装备「${getEquip(req.weapon).name}」` };
      }
      return { ok: true };
    }
    return { ok: true };
  }

  chooseChoice(index) {
    if (!this.event || this.outcome) return;
    this.clearNotice();
    const choice = this.event.event.choices[index];
    if (!choice) return;
    const availability = this.choiceAvailable(choice);
    if (!availability.ok) {
      this.notify(availability.reason);
      return;
    }

    const event = this.event;
    event.choice = choice;
    this.logEvent('choice', `选择「${choice.label}」`);

    let branch;
    let check = null;
    if (choice.check) {
      const bonus = this.consumeBuff('check');
      check = rollCheck(this.rng, this.state, choice.check.attr, choice.check.diff, bonus);
      event.check = check;
      this.logEvent(
        check.success ? 'check' : 'fail',
        `检定 ${ATTR_NAME[choice.check.attr]} ${check.success ? '成功' : '失败'}（1d12=${check.die} / ≤${check.target}${bonus ? `，临时 +${bonus}` : ''}）`,
      );
      branch = check.success ? choice.success : choice.fail;
      if (!branch) branch = check.success ? choice.success || { text: [] } : choice.fail;
    } else {
      branch = choice.success || { text: [], effects: choice.effects || {} };
      if (choice.effects && !choice.success) branch = { text: [], effects: choice.effects };
    }

    if (!branch) branch = { text: [] };

    const hpBefore = this.state.hp;
    const sanBefore = this.state.san;
    // 检定成功不扣 SAN：避免「SAN -1」的结算和实际数值互相矛盾。
    let effects = branch.effects || {};
    if (check && check.success && effects.san < 0) effects = { ...effects, san: 0 };
    const result = applyEffects(this, effects);

    // 结算「这次探索有多顺利」，探索度按结果增加。
    if (!event.isFixed && this.areaRuntime) {
      const gain = this.explorationGain({
        ok: !check || check.success,
        check,
        hpBefore,
        sanBefore,
        chips: result.chips,
      });
      event.gain = gain;
      this.areaRuntime.progress = Math.min(100, this.areaRuntime.progress + gain);
      result.chips.push({ kind: 'progress', label: `探索度 +${gain}%` });
      this.logEvent('explore', `探索度 +${gain}%（${this.areaRuntime.progress}%）`);
    }

    event.outcome = {
      ok: !check || check.success,
      check,
      title: choice.check ? (check.success ? '检定通过' : '检定失败') : null,
      text: branch.text || [],
      lines: result.lines,
      chips: result.chips,
      endDemo: Boolean(result.endDemo),
      dead: result.dead,
    };
    event.combatPending = Boolean(choice.combat || branch.combat);
    event.enemyId = choice.combat || branch.combat || null;
    const winBranch = choice.win || branch.win || null;
    event.winOutcome = winBranch;

    this.outcome = event.outcome;
    if (this.dead) {
      this.setScreen('gameover');
      return;
    }
    this.setScreen('outcome');
  }

  /** 结算界面的"继续" */
  continueOutcome() {
    if (!this.event) return;
    const event = this.event;

    if (event.combatPending) {
      this.startCombat(event.enemyId, { fromEvent: true });
      return;
    }
    if (event.outcome && event.outcome.endDemo) {
      this.finishDemo();
      return;
    }
    if (this.dead) {
      this.setScreen('gameover');
      return;
    }
    this.afterEvent();
  }

  afterEvent() {
    const runtime = this.areaRuntime;
    const event = this.event;
    this.event = null;
    this.outcome = null;

    if (!runtime || !event) {
      this.setScreen('map');
      return;
    }

    if (event.isFixed) {
      runtime.cleared = true;
      this.setScreen('map');
      return;
    }

    // 探索度满 100% 时，下一次探索会强制进入区域的固定剧情。
    if (runtime.progress >= 100) {
      this.openEvent(this.area.fixedEvent);
      return;
    }

    // 跨过 50% / 90% 后的第一个事件结束时进入安全屋（不是「正好等于」）。
    const crossed = passedStop(runtime.progress, runtime.safeVisited);
    if (crossed && crossed.kind === 'safe') {
      this.enterSafeRoom(crossed.at);
      return;
    }

    this.setScreen('explore');
  }

  finishDemo() {
    this.ending = 'demo';
    this.setScreen('ending');
  }

  // ── 安全屋 ────────────────────────────────────────────

  enterSafeRoom(stopAt = null) {
    const runtime = this.areaRuntime;
    const at = stopAt === null ? (runtime ? runtime.progress : 0) : stopAt;
    if (runtime && !runtime.safeVisited.includes(at)) runtime.safeVisited.push(at);
    const healHp = 2 + this.mods().healBonus;
    const healSan = 2 + this.mods().sanOnHeal;
    this.changeHp(healHp);
    this.changeSan(healSan);
    const rest = SHOP_GOODS.find((s) => s.id === 'rest');
    const therapy = SHOP_GOODS.find((s) => s.id === 'therapy');
    this.safe = {
      at,
      stock: rollStock(this.rng, 5, (id) => {
        const def = getThing(id);
        if (!def) return true;
        if (def.type === 'consumable') return false;
        return this.ownsThing(id);
      }),
      healed: { hp: healHp, san: healSan },
      restCost: rest.price,
      restGain: { hp: 5, san: 6 },
      therapyCost: therapy.price,
      therapyUsed: false,
    };
    this.logEvent('safe', `进入安全屋（${at}% · 第 ${runtime ? runtime.safeVisited.length : 1} 次补给）`);
    this.setScreen('safe');
  }

  leaveSafeRoom() {
    this.safe = null;
    this.setScreen('explore');
  }

  /** 安全屋里可选的疯狂卡 */
  get madnessCards() {
    if (!this.state) return [];
    return this.state.cards
      .filter((card) => card.kind === 'madness')
      .map((card) => ({ ...card, def: getCard(card.id) }))
      .filter((card) => card.def);
  }

  /** 心理咨询：由玩家指定移除哪一张疯狂卡，每次安全屋只做一次。 */
  therapy(cardId) {
    this.clearNotice();
    const safe = this.safe;
    if (!safe || safe.therapyUsed) {
      this.notify('这次心理咨询已经做过了。');
      return;
    }
    const index = this.state.cards.findIndex((card) => card.id === cardId && card.kind === 'madness');
    if (index < 0) return;
    if (this.state.coins < safe.therapyCost) {
      this.notify('硬币不够。校工把抽屉又推回去了。');
      return;
    }
    const [removed] = this.state.cards.splice(index, 1);
    const def = getCard(removed.id);
    this.state.coins -= safe.therapyCost;
    safe.therapyUsed = true;
    this.logEvent('coin', `硬币 -${safe.therapyCost}（${this.state.coins}）`);
    this.logEvent('card', `心理咨询：移除「${def ? def.name : '疯狂卡'}」`);
    this.notify(`心理咨询结束。「${def ? def.name : '那张卡'}」被留在了抽屉里。`);
    this.emit();
  }

  buy(goodsId) {
    this.clearNotice();
    const meta = SHOP_GOODS.find((g) => g.id === goodsId);
    if (!meta) return;
    // 服务（睡觉 / 续杯）不占货架，随时可以购买。
    const onShelf = this.safe && this.safe.stock.find((g) => g.id === goodsId);
    const goods = onShelf || (meta.kind === 'service' ? { ...meta, sold: false } : null);
    if (!goods || goods.sold) return;
    if (this.state.coins < goods.price) {
      this.notify('硬币不够。商人摊开手掌，又合上了。');
      return;
    }
    if (meta.kind === 'service') {
      if (goods.id === 'rest') {
        const gain = this.safe.restGain || { hp: 5, san: 6 };
        this.changeHp(gain.hp);
        this.changeSan(gain.san);
        this.safe.healed.hp += gain.hp;
        this.safe.healed.san += gain.san;
      }
      if (goods.id === 'thermos_refill') {
        const entry = this.state.inventory.find((e) => e.id === 'thermos');
        if (!entry) {
          this.notify('你没有保温杯。');
          return;
        }
        entry.uses = ITEMS.thermos.maxUses;
      }
      if (goods.id === 'therapy') {
        this.notify('心理咨询要单独进行：在安全屋里选择你想放下的那张卡。');
        return;
      }
      this.state.coins -= goods.price;
      this.logEvent('coin', `硬币 -${goods.price}（${this.state.coins}）`);
      this.logEvent('shop', `购买「${goods.label}」`);
      this.emit();
      return;
    }

    const def = getEquip(goodsId) || ITEMS[goodsId];
    if (!def) return;
    const name = def.name || goodsId;
    if (def.slot) {
      const owned =
        this.state.inventory.some((e) => e.id === goodsId) ||
        this.state.equipment[def.slot] === goodsId ||
        (def.slot === 'trinket' && this.state.equipment.trinkets.includes(goodsId));
      if (owned) {
        this.notify('这件你已经有了。');
        return;
      }
    }
    if (!this.addItem(goodsId)) {
      this.notify('拿不下了。');
      return;
    }
    this.state.coins -= goods.price;
    this.logEvent('coin', `硬币 -${goods.price}（${this.state.coins}）`);
    this.logEvent('shop', `购买「${name}」`);
    // 已购买的商品直接下架。
    if (this.safe) this.safe.stock = this.safe.stock.filter((g) => g.id !== goodsId);
    this.notify(`买下了「${name}」。`);
    this.emit();
  }

  // ── 装备 / 道具 ────────────────────────────────────────

  useItem(itemId) {
    this.clearNotice();
    if (!isConsumable(itemId)) return;
    const def = ITEMS[itemId];
    if (!def) return;
    const entry = this.state.inventory.find((e) => e.id === itemId);
    if (!entry || entry.uses <= 0) return;

    // 道具数据直接写 heal / san 字段，这里统一结算（含专长加成）。
    let used = false;
    if (def.heal) {
      const heal = Math.max(0, Math.round(def.heal + this.mods().healBonus));
      this.changeHp(heal);
      used = true;
    }
    if (def.san) {
      const san = Math.max(0, Math.round(def.san + this.mods().sanOnHeal));
      this.changeSan(san);
      used = true;
    }
    this.consumeItem(itemId);
    if (used) {
      this.logEvent('item', `使用「${def.name}」`);
      this.notify(`用了「${def.name}」。`);
    }
    this.emit();
  }

  equipItem(itemId) {
    this.clearNotice();
    const s = this.state;

    // 保温杯：既是消耗品也能当武器，装备时保留在背包里（还要拿来喝）。
    if (itemId === 'thermos') {
      if (s.equipment.weapon === 'thermos') {
        this.notify('保温杯已经拿在手上了。');
        return;
      }
      const current = s.equipment.weapon;
      if (current) s.inventory.push({ id: current, uses: 1 });
      s.equipment.weapon = 'thermos';
      this.clampVitals();
      this.logEvent('item', '装备「爱丽丝的保温杯」');
      this.notify('把保温杯握在了手里。喝掉的水会让它变轻。');
      this.emit();
      return;
    }

    const def = getEquip(itemId);
    if (!def) {
      this.notify('这个东西不能装备。');
      return;
    }
    const index = s.inventory.findIndex((e) => e.id === itemId);
    if (index < 0) return;

    if (def.type === 'trinket' && s.equipment.trinkets.filter(Boolean).length >= 5) {
      this.notify('饰品槽已经满了。先卸下一件。');
      return;
    }

    s.inventory.splice(index, 1);
    if (def.type === 'weapon' || def.type === 'outfit') {
      const current = s.equipment[def.type];
      s.equipment[def.type] = itemId;
      if (current) s.inventory.push({ id: current, uses: 1 });
    } else {
      s.equipment.trinkets.push(itemId);
    }
    this.logEvent('item', `装备「${def.name}」`);
    if (def.type === 'weapon') this.unlockCodex('weapons', itemId);
    if (def.type === 'outfit') this.unlockCodex('outfits', itemId);
    if (def.type === 'trinket') this.unlockCodex('trinkets', itemId);
    this.clampVitals();
    this.emit();
  }

  unequip(slot, index = 0) {
    this.clearNotice();
    const s = this.state;
    let removedId = null;
    if (slot === 'weapon' || slot === 'outfit') {
      const current = s.equipment[slot];
      if (!current) return;
      removedId = current;
      s.equipment[slot] = null;
      // 保温杯本来就在背包里，不要复制一份。
      if (current !== 'thermos') s.inventory.push({ id: current, uses: 1 });
    } else if (slot === 'trinket') {
      const current = s.equipment.trinkets[index];
      if (!current) return;
      removedId = current;
      s.equipment.trinkets.splice(index, 1);
      s.inventory.push({ id: current, uses: 1 });
    }
    if (removedId) this.logEvent('item', `卸下「${getThing(removedId)?.name || removedId}」`);
    this.clampVitals();
    this.emit();
  }

  clampVitals() {
    const s = this.state;
    s.hp = clamp(s.hp, 0, this.maxHp);
    s.san = clamp(s.san, 0, this.maxSan);
  }

  usableItems() {
    return this.state.inventory
      .filter((entry) => isConsumable(entry.id))
      .map((entry) => ({ entry, def: ITEMS[entry.id] }));
  }

  equipableItems() {
    return this.state.inventory
      .filter((entry) => {
        try {
          return Boolean(getEquip(entry.id));
        } catch {
          return false;
        }
      })
      .map((entry) => ({ entry, def: getEquip(entry.id) }));
  }

  keyItems() {
    return this.state.inventory
      .filter((entry) => ITEMS[entry.id] && ITEMS[entry.id].type === 'key')
      .map((entry) => ({ entry, def: ITEMS[entry.id] }));
  }

  // ── 战斗 ──────────────────────────────────────────────

  startCombat(enemyId, context = {}) {
    this.clearNotice();
    this.combat = new Combat(this, enemyId);
    this.combatContext = context;
    this.unlockCodex('enemies', enemyId);
    this.logEvent('combat', `遭遇「${this.combat.enemy.name}」${this.combat.enemy.weakness ? `（弱点 ${DAMAGE_TYPES[this.combat.enemy.weakness].name}）` : ''}`);
    this.setScreen('combat');
  }

  combatAction(index) {
    if (!this.combat || this.combat.finished) return;
    this.combat.removeAction(index);
    this.emit();
  }

  combatAdd(actionId) {
    if (!this.combat || this.combat.finished) return;
    this.combat.addAction(actionId);
    this.emit();
  }

  combatClear() {
    if (!this.combat || this.combat.finished) return;
    this.combat.clearQueue();
    this.emit();
  }

  combatUseItem(itemId) {
    if (!this.combat || this.combat.finished) return;
    this.useItem(itemId);
  }

  combatExecute() {
    if (!this.combat || this.combat.finished || this.combat.queue.length === 0) return;
    this.combat.execute();
    this.emit();
  }

  /** 战斗胜利/失败后继续 */
  finishCombat() {
    const combat = this.combat;
    if (!combat || !combat.finished) return;

    if (!combat.victory) {
      this.combat = null;
      this.setScreen('gameover');
      return;
    }

    const rewards = combat.settle();
    this.lastCombat = { rewards, enemy: combat.enemy };
    const context = this.combatContext || {};
    this.combat = null;
    this.combatContext = null;

    if (this.dead) {
      this.setScreen('gameover');
      return;
    }

    if (context.fromEvent && this.event) {
      const win = this.event.winOutcome;
      const result = applyEffects(this, win?.effects || {});
      const outcome = {
        ok: true,
        check: null,
        title: '战斗胜利',
        text: win?.text || [],
        lines: result.lines,
        chips: [...result.chips],
        endDemo: Boolean(result.endDemo),
        dead: result.dead,
        rewards,
      };
      this.event.combatPending = false;
      this.event.outcome = outcome;
      this.outcome = outcome;
      this.setScreen('outcome');
      return;
    }

    this.setScreen('map');
  }
}
