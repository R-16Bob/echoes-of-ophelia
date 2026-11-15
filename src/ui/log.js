// 事件日志：常驻右下角的抽屉，记录最近 100 条数值变化、选择与战斗结算。

import { h } from './dom.js';

const LOG_SCREENS = new Set(['map', 'explore', 'event', 'outcome', 'combat', 'safe', 'gameover', 'ending']);
const MAX_VISIBLE = 100;

const KIND_LABEL = {
  damage: '损失',
  heal: '回复',
  xp: '经验',
  coin: '硬币',
  item: '物品',
  level: '成长',
  card: '理智',
  clue: '线索',
  check: '检定',
  fail: '检定',
  combat: '战斗',
  event: '事件',
  choice: '选择',
  explore: '探索',
  safe: '安全屋',
  shop: '商店',
};

export function showLog(game) {
  const screen = game && game.screen;
  return Boolean(game && game.state && LOG_SCREENS.has(screen));
}

export function logToggle(game, app) {
  const count = game.state ? game.state.log.length : 0;
  return h(
    'button',
    {
      class: `log-toggle ${app.logOpen ? 'is-open' : ''}`.trim(),
      title: '事件日志（快捷键 L）',
      onclick: () => app.toggleLog(),
    },
    h('span', {}, app.logOpen ? '隐藏日志' : '事件日志'),
    h('b', {}, String(count)),
  );
}

export function logDrawer(game, app) {
  const entries = game.state ? game.state.log.slice(-MAX_VISIBLE).reverse() : [];
  return h(
    'aside',
    { class: 'log-drawer' },
    h(
      'div',
      { class: 'log-drawer__head' },
      h(
        'div',
        {},
        h('div', { class: 'log-drawer__title' }, '事件日志'),
        h('div', { class: 'log-drawer__sub' }, `最近 ${MAX_VISIBLE} 条 · 共 ${game.state ? game.state.log.length : 0} 条`),
      ),
      h('button', { class: 'btn btn--small btn--quiet', onclick: () => app.toggleLog() }, '收起'),
    ),
    h(
      'div',
      { class: 'log-drawer__body' },
      entries.length
        ? entries.map((entry) =>
            h(
              'div',
              { class: `log-entry log-entry--${entry.kind}` },
              h('span', { class: 'log-entry__n' }, `#${entry.n}`),
              h('span', { class: 'log-entry__kind' }, KIND_LABEL[entry.kind] || '记录'),
              h('span', { class: 'log-entry__text' }, entry.text),
            ),
          )
        : h('div', { class: 'log-drawer__empty' }, '还没有发生什么。'),
    ),
    h('div', { class: 'log-drawer__foot' }, '按 L 或点击右下角按钮可以收起。'),
  );
}
