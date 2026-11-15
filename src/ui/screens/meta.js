// 标题画面 / 序章 / 规则。

import { h } from '../dom.js';
import { art, prose, stage, chapter } from '../common.js';
import { PROLOGUE } from '../../data/story.js';
import { ALICE } from '../../data/character.js';
import { TALENTS } from '../../data/talents.js';

export function titleScreen(game, app) {
  return h(
    'div',
    { class: 'screen title' },
    h('div', { class: 'title__bg' }, h('img', { src: 'assets/images/title_bg.svg', alt: '' })),
    h(
      'div',
      { class: 'title__left' },
      h('div', { class: 'title__eyebrow' }, h('span', {}), h('div', { class: 'kicker' }, 'A TEXT HORROR ROGUELIKE')),
      h('h1', { class: 'title__name' }, '残响学园'),
      h('div', { class: 'title__sub' }, '爱丽丝与失踪的奥菲莉亚'),
      h(
        'div',
        { class: 'title__menu' },
        h(
          'button',
          { class: 'btn btn--primary btn--block', onclick: () => game.newGame() },
          h('span', {}, '推 开 铁 门'),
          h('span', { class: 'faint' }, 'NEW GAME'),
        ),
        h(
          'button',
          { class: 'btn btn--block', onclick: () => app.openPanel('rules') },
          h('span', {}, '游 戏 规 则'),
          h('span', { class: 'faint' }, 'HOW TO PLAY'),
        ),
        h(
          'button',
          { class: 'btn btn--block', onclick: () => app.openPanel('codex') },
          h('span', {}, '图 鉴'),
          h('span', { class: 'faint' }, 'CODEX'),
        ),
        h(
          'button',
          { class: 'btn btn--block', onclick: () => app.openPanel('settings') },
          h('span', {}, '设 置'),
          h('span', { class: 'faint' }, 'OPTIONS'),
        ),
        h(
          'button',
          { class: 'btn btn--block', onclick: () => app.openPanel('credits') },
          h('span', {}, '关 于 本 作'),
          h('span', { class: 'faint' }, 'ABOUT'),
        ),
      ),
      h(
        'div',
        { class: 'title__meta' },
        h('span', {}, 'DEMO 0.7'),
        h('span', {}, '单人文字冒险'),
        h('span', {}, '建议佩戴耳机'),
      ),
    ),
    h(
      'div',
      { class: 'title__right' },
      h(
        'div',
        { class: 'title__note' },
        h('b', {}, '留 言'),
        '「奥菲莉亚怕黑，怕一个人待着，怕所有会发出声音的旧东西。」',
        h('br'),
        '「可是她一个人，在那栋楼里待了三天。」',
      ),
    ),
  );
}

export function prologueScreen(game, app) {
  const page = PROLOGUE.pages[game.page] || PROLOGUE.pages[PROLOGUE.pages.length - 1];
  const last = game.page >= PROLOGUE.pages.length - 1;
  return h(
    'div',
    { class: 'screen curtain' },
    h('div', { class: 'curtain__art' }, h('img', { src: 'assets/images/title_bg.svg', alt: '' })),
    h(
      'div',
      { class: 'curtain__body fade-up' },
      h('div', { class: 'kicker' }, PROLOGUE.en),
      h('div', { class: 'curtain__title' }, PROLOGUE.title),
      h('div', { class: 'curtain__sub' }, `${game.page + 1} / ${PROLOGUE.pages.length}`),
      prose(page.lines),
      h(
        'div',
        { class: 'curtain__next' },
        h(
          'button',
          {
            class: 'btn btn--primary',
            onclick: () => (last ? game.startGame() : game.advancePrologue()),
          },
          last ? '推门进去' : '继续',
          h('span', { class: 'faint' }, last ? 'ENTER' : 'NEXT'),
        ),
        last
          ? null
          : h('button', { class: 'link', onclick: () => game.startGame() }, '跳过序章'),
      ),
    ),
  );
}

const RULES = [
  {
    title: '探索',
    lines: [
      '校园被分成数个区域。每次探索，探索度上升 25%，并抽取一张事件卡。',
      '探索度 50% 时，你会找到一间安全屋：恢复少量体力与理智，并遇到商人。',
      '探索度 100% 时，会遭遇该区域的固定剧情事件，结束后才能前往下一个区域。',
    ],
  },
  {
    title: '检定',
    lines: [
      '遇到不确定的事，爱丽丝要掷一颗 1d12 的暗骰。检定属性值 ≥ 出目 + 难度修正，即通过。',
      '持有特定物品、装备或专长时，常常可以跳过检定。',
    ],
  },
  {
    title: '战斗',
    lines: [
      '回合制。你的回合有 200t，越快的武器单次消耗越少。排好行动后点击执行，敌人随后行动。',
      '命中率 = 武器面板 + 等级 × 10% − 敌人 POW。武器适合的属性越高，伤害越高、动作越快。',
      '使用道具不消耗时间。武器决定你的技能组。',
    ],
  },
  {
    title: '理智',
    lines: [
      '每失去「理智上限 / 5」的 SAN，抽一张卡：80% 是疯狂，20% 是美德。',
      '疯狂带来强力但危险的效果；美德立刻恢复少量体力与理智。',
    ],
  },
  {
    title: '成长',
    lines: ['完成事件与战斗获得 XP。每 100 XP 升一级：从三张专长中选一张，再提升一点属性。'],
  },
];

export function rulesScreen(game, app) {
  return h(
    'div',
    { class: 'screen' },
    h('div', { class: 'stage' }, h(
      'div',
      { class: 'stage__main' },
      chapter('H O W   T O   P L A Y'),
      h(
        'div',
        { class: 'panel' },
        h('div', { class: 'panel__head' }, h('span', {}, '游戏规则'), h('button', { class: 'link', onclick: () => app.closePanel() }, '返回')),
        h(
          'div',
          { class: 'panel__body' },
          h(
            'div',
            { class: 'list' },
            RULES.map((rule) =>
              h(
                'div',
                { class: 'list__row', style: { display: 'block' } },
                h('div', { class: 'list__title' }, rule.title),
                h('div', { class: 'list__desc' }, rule.lines.map((line) => h('p', {}, line))),
              ),
            ),
          ),
          h('hr', { class: 'rule' }),
          h('div', { class: 'kicker' }, '初始角色'),
          h(
            'div',
            { class: 'list__desc', style: { marginTop: '8px' } },
            `HP ${ALICE.baseMaxHp} · SAN ${ALICE.baseMaxSan} · 起始专长「${TALENTS.courage.name}」`,
          ),
        ),
      ),
    )),
  );
}

export function creditsScreen(game, app) {
  return h(
    'div',
    { class: 'screen' },
    h('div', { class: 'stage' }, h(
      'div',
      { class: 'stage__main' },
      chapter('A B O U T'),
      h(
        'div',
        { class: 'panel' },
        h('div', { class: 'panel__head' }, h('span', {}, '关于本作'), h('button', { class: 'link', onclick: () => app.closePanel() }, '返回')),
        h(
          'div',
          { class: 'panel__body' },
          prose([
            '《残响学园》是一款以文字为主的跑团式生存恐怖游戏。',
            '小女孩爱丽丝来到三年前废弃的圣艾格尼丝女子学校，寻找失踪的好友奥菲莉亚。她要在这栋楼里活到天亮，然后带她一起离开。',
            '本 DEMO 包含序章、三个可探索区域、两场首领战，以及跨周目保留的图鉴。天台、更多敌人、装备与结局仍在制作中。',
          ]),
          h('hr', { class: 'rule' }),
          h('div', { class: 'kicker' }, '插画位'),
          h('div', { class: 'list__desc', style: { marginTop: '8px' } }, '当前画面中的插画均为占位图。所有图片位都已在代码中预留，可直接替换 assets/images/ 下的同名文件。'),
        ),
      ),
    )),
  );
}
