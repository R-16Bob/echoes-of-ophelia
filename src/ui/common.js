// 通用 UI 组件：插画位、数值条、HUD、侧栏、标签、弹窗外壳。

import { h, paragraphs } from './dom.js';
import { artOf } from '../data/art.js';
import { ATTRS, getCheckValue } from '../game/stats.js';
import { DIFFICULTY } from '../game/checks.js';
import { getTalent } from '../data/talents.js';
import { getCard } from '../data/cards.js';
import { getEquip, ITEMS, modText } from '../data/equipment.js';

/** 插画位。图片缺失时显示占位框，方便后续替换。 */
export function art(key, { ratio = '16x9', cap = null, className = '' } = {}) {
  const frame = h('div', { class: `art art--${ratio} ${className}`.trim() });
  const src = artOf(key);
  if (src) {
    const img = h('img', { src, alt: key, loading: 'lazy' });
    img.addEventListener('error', () => {
      img.remove();
      frame.appendChild(h('div', { class: 'art__blank' }, `插画位 · ${key}`, h('br'), '等待绘制'));
    });
    frame.appendChild(img);
  } else {
    frame.appendChild(h('div', { class: 'art__blank' }, `插画位 · ${key}`));
  }
  if (cap) {
    frame.appendChild(
      h('div', { class: 'art__cap' }, h('span', {}, cap[0]), cap[1] ? h('span', {}, cap[1]) : null),
    );
  }
  return frame;
}

/** 通用悬浮说明：把可见内容包进 .tip-host，说明卡默认隐藏。 */
export function hoverTip(visible, tip) {
  return h('div', { class: 'tip-host' }, visible, h('div', { class: 'slot__tip tip-host__tip' }, tip));
}

export function bar(kind, value, max, { label = '', pips = null } = {}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return h(
    'div',
    { class: 'hud__bar' },
    h('div', { class: 'stat-line' }, h('span', {}, label), h('b', {}, `${value} / ${max}`)),
    h('div', { class: `bar bar--${kind}` }, h('div', { class: 'bar__fill', style: { width: `${pct}%` } })),
    pips
      ? h(
          'div',
          { class: 'pips', title: `疯狂计数 ${pips.value}/${pips.max}` },
          Array.from({ length: pips.max }, (_, i) =>
            h('span', { class: `pip ${i < pips.value ? 'pip--on' : ''}`.trim() }),
          ),
        )
      : null,
  );
}

export function hud(game) {
  const state = game.state;
  if (!state) return null;
  const areaName = game.area ? game.area.name : '校园';
  const mark = game.sanityMark();
  return h(
    'header',
    { class: 'hud' },
    h(
      'div',
      { class: 'hud__id' },
      h('div', { class: 'name' }, '爱丽丝'),
      h('div', { class: 'area' }, areaName),
    ),
    h(
      'div',
      { class: 'hud__bars' },
      bar('hp', state.hp, game.maxHp, { label: '体力 HP' }),
      bar('san', state.san, game.maxSan, {
        label: `理智 SAN · 侵蚀 ${mark.value}/${mark.max}`,
        pips: mark,
      }),
      bar('xp', state.xp, 100, { label: `经验 · LV.${state.level}` }),
    ),
    h(
      'div',
      { class: 'hud__right' },
      h('div', { class: 'hud__coins' }, String(state.coins)),
      h('div', { class: 'hud__lvl' }, `LV.${state.level}`),
    ),
  );
}

export function rail(game, app) {
  const state = game.state;
  const attrs = game.attrs;
  return h(
    'aside',
    { class: 'rail' },
    h(
      'div',
      { class: 'rail__portrait' },
      art('alice', { ratio: 'portrait' }),
      h('div', { class: 'rail__name' }, h('b', {}, '爱丽丝'), h('span', {}, `LV.${state.level}`)),
      h('div', { class: 'rail__sub' }, `硬币 ${state.coins} · 线索 ${state.clues.length} · 疯狂 ${state.cards.filter((c) => c.kind === 'madness').length}`),
    ),
    h(
      'div',
      { class: 'rail__attrs' },
      ATTRS.map((attr) =>
        h(
          'div',
          { class: `rail__attr ${attrs[attr.key] > state.attrs[attr.key] ? 'rail__attr--boost' : ''}` },
          h('span', {}, attr.abbr),
          h('b', {}, String(attrs[attr.key])),
        ),
      ),
    ),
    h(
      'div',
      { class: 'rail__chips' },
      h('button', { class: 'btn btn--quiet', onclick: () => app.openPanel('character') }, '角色卡'),
      h('button', { class: 'btn btn--quiet', onclick: () => app.openPanel('inventory') }, '背包'),
      h('button', { class: 'btn btn--quiet', onclick: () => app.openPanel('skills') }, '技能'),
      h('button', { class: 'btn btn--quiet', onclick: () => app.openPanel('codex') }, '图鉴'),
      h('button', { class: 'btn btn--quiet', onclick: () => app.openPanel('clues') }, '线索'),
      h('button', { class: 'btn btn--quiet', onclick: () => app.openPanel('settings') }, '设置'),
    ),
  );
}

export function stage(game, app, main, { withRail = true } = {}) {
  return h('div', { class: 'stage' }, withRail ? rail(game, app) : null, main);
}

export function chapter(text) {
  return h('div', { class: 'chapter' }, text);
}

export function screenHead(kicker, title, sub) {
  return h(
    'div',
    { class: 'scene-head' },
    h(
      'div',
      {},
      h('div', { class: 'scene-title' }, sub ? h('small', {}, kicker) : null, title),
      sub || null,
    ),
  );
}

export function checkTag(game, check) {
  if (!check) return null;
  const attr = ATTRS.find((a) => a.key === check.attr);
  const diff = DIFFICULTY[check.diff] || DIFFICULTY.normal;
  const target = getCheckValue(game.state, check.attr) - diff.mod;
  const show = !game.settings || game.settings.showRolls;
  return h(
    'span',
    { class: 'tag tag--check' },
    `${attr ? attr.abbr : check.attr} 检定 · ${diff.name}`,
    show ? h('span', { class: 'faint' }, `≤${target}`) : null,
  );
}

export function requiresTag(choice) {
  const req = choice.requires;
  if (!req) return null;
  if (req.talent) {
    const talent = getTalent(req.talent);
    return h('span', { class: 'tag tag--talent' }, `专长 · ${talent ? talent.name : req.talent}`);
  }
  if (req.item) {
    const def = ITEMS[req.item];
    return h('span', { class: 'tag tag--item' }, `持有 · ${req.label || (def ? def.name : req.item)}`);
  }
  if (req.weapon) {
    const def = getEquip(req.weapon);
    return h('span', { class: 'tag tag--item' }, `武器 · ${def ? def.name : req.weapon}`);
  }
  return null;
}

export function combatTag() {
  return h('span', { class: 'tag tag--warn' }, '战斗');
}

export function deltaChips(chips = []) {
  if (!chips.length) return null;
  return h(
    'div',
    { class: 'delta-list' },
    chips.map((chip) => {
      const cls =
        chip.kind === 'hp-up' || chip.kind === 'san-up' || chip.kind === 'coin' || chip.kind === 'clue'
          ? 'delta--up'
          : chip.kind === 'xp'
            ? 'delta--xp'
            : chip.kind === 'hp-down' || chip.kind === 'san-down'
              ? 'delta--down'
              : '';
      return h('span', { class: `delta ${cls}`.trim() }, chip.label);
    }),
  );
}

export function modalPanel(title, body, foot) {
  return h(
    'div',
    { class: 'modal' },
    h(
      'div',
      { class: 'modal__panel' },
      h('div', { class: 'modal__head' }, h('div', { class: 'modal__title' }, title)),
      h('div', { class: 'modal__body' }, body),
      foot ? h('div', { class: 'modal__foot' }, foot) : null,
    ),
  );
}

export function talentCard(talent, onclick) {
  return h(
    'button',
    { class: 'talent', onclick },
    h('span', { class: 'talent__tag' }, '专长'),
    h('b', {}, talent.name),
    h('p', {}, talent.desc),
    talent.mods && Object.keys(talent.mods).length
      ? h('span', { class: 'slot__mods' }, modText(talent.mods))
      : null,
  );
}

export function cardBadge(entry) {
  const def = getCard(entry.id);
  if (!def) return null;
  return h('span', { class: `tag ${entry.kind === 'madness' ? 'tag--warn' : 'tag--talent'}` }, def.name);
}

export function emptyRow(text) {
  return h('div', { class: 'list__empty' }, text);
}

export function prose(lines, cls = '') {
  return h('div', { class: `prose ${cls}`.trim() }, paragraphs(lines));
}
