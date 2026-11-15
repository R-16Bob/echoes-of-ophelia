// 结局与失败画面。

import { h } from '../dom.js';
import { art, chapter, hud, prose } from '../common.js';
import { ENDING, GAME_OVER } from '../../data/story.js';
import { getArea } from '../../data/areas.js';

export function gameOverScreen(game, app) {
  const kind = game.dead || 'hp';
  const data = GAME_OVER[kind];
  return h(
    'div',
    { class: 'screen death' },
    h('div', { class: 'death__art' }, art('title_bg', { ratio: '16x9' })),
    h(
      'div',
      { class: 'death__body' },
      chapter(data.en),
      h('div', { class: 'death__name' }, data.title),
      prose(data.lines),
      h(
        'div',
        { class: 'legal' },
        h('span', {}, `探索到：${game.state && game.state.currentArea ? getArea(game.state.currentArea).name : '—'}`),
        h('span', {}, `等级 ${game.state ? game.state.level : 1} · 完成事件 ${game.state ? game.state.steps : 0}`),
      ),
      h(
        'div',
        { class: 'rest-row' },
        h('button', { class: 'btn btn--primary', onclick: () => game.newGame() }, '再来一次'),
        h('button', { class: 'btn btn--quiet', onclick: () => game.backToTitle() }, '回到标题'),
      ),
    ),
  );
}

export function endingScreen(game, app) {
  return h(
    'div',
    { class: 'screen' },
    hud(game),
    h(
      'div',
      { class: 'stage stage--full' },
      h(
        'div',
        { class: 'stage__main' },
        chapter(ENDING.en),
        h('div', { class: 'scene-art' }, art('title_bg', { ratio: '21x9' }), h('div', { class: 'scene-art__label' }, 'END OF DEMO')),
        h(
          'div',
          { class: 'panel scene-panel' },
          h('div', { class: 'scene-head' }, h('div', { class: 'scene-title' }, h('small', {}, 'TO BE CONTINUED'), ENDING.title)),
          prose(ENDING.pages),
          h(
            'div',
            { class: 'delta-list', style: { marginTop: '18px' } },
            h('span', { class: 'delta' }, `LV ${game.state.level}`),
            h('span', { class: 'delta' }, `XP ${game.state.xp % 100} / 100`),
            h('span', { class: 'delta' }, `体力 ${game.state.hp} / ${game.maxHp}`),
            h('span', { class: 'delta' }, `理智 ${game.state.san} / ${game.maxSan}`),
            h('span', { class: 'delta delta--up' }, `专长 ${game.state.talents.length}`),
            h('span', { class: 'delta' }, `线索 ${game.state.clues.length}`),
          ),
          h('div', { class: 'hint-box', style: { marginTop: '16px' } }, ENDING.hint),
          h(
            'div',
            { class: 'rest-row' },
            h('button', { class: 'btn btn--primary', onclick: () => game.newGame() }, '重新开始'),
            h('button', { class: 'btn btn--quiet', onclick: () => game.backToTitle() }, '回到标题'),
          ),
        ),
      ),
    ),
  );
}
