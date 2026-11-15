// 浮层：升级三选一、疯狂 / 美德卡。

import { h } from './dom.js';
import { modalPanel, talentCard } from './common.js';
import { ATTRS } from '../game/stats.js';
import { modText } from '../data/equipment.js';
import { artOf } from '../data/art.js';

export function modalsOverlay(game) {
  const modal = game.modals[0];
  if (!modal) return null;
  if (modal.type === 'card') return cardOverlay(game, modal);
  if (modal.type === 'levelup') return levelUpModal(game, modal);
  return null;
}

function cardOverlay(game, modal) {
  const def = modal.card && modal.card.def;
  if (!def) return null;
  const madness = modal.card.kind === 'madness';
  const lines = modText(def.mods || {});
  const threshold = game.sanityMark().max;
  return h(
    'div',
    { class: 'card-overlay' },
    h(
      'div',
      { class: 'card-wrap' },
      h(
        'div',
        { class: `card-alert ${madness ? 'card-alert--madness' : 'card-alert--virtue'}` },
        h('b', {}, madness ? '理智侵蚀达到极限' : '一瞬间的清醒'),
        h(
          'span',
          {},
          madness
            ? `侵蚀 ${threshold} / ${threshold} —— 爱丽丝失去了 ${threshold} 点 SAN，疯狂卡被抽了出来。`
            : '在最坏的时候，她忽然想起了一件好事。',
        ),
      ),
      h(
        'div',
        { class: `card ${madness ? 'card--madness' : 'card--virtue'}` },
        h('div', { class: 'card__art' }, h('img', { src: artOf(madness ? 'card_madness' : 'card_virtue'), alt: '' })),
        h(
          'div',
          { class: 'card__body' },
          h('div', { class: 'card__kind' }, madness ? '疯狂卡 · MADNESS' : '美德卡 · VIRTUE'),
          h('div', { class: 'card__name' }, def.name),
          h('div', { class: 'card__text' }, def.text),
          lines.length
            ? h(
                'div',
                { class: 'card__mods' },
                lines.map((line) => h('span', { class: 'tag' }, line)),
              )
            : null,
        ),
      ),
      h(
        'button',
        { class: 'btn btn--primary', onclick: () => game.dismissModal() },
        madness ? '接受它' : '收下这份清醒',
      ),
      h('div', { class: 'card-caption' }, madness ? '代价会留在身上。' : '只是暂时的。'),
    ),
  );
}

function levelUpModal(game, modal) {
  const level = game.state.level;
  if (modal.step === 'talent') {
    return modalPanel(
      `等级提升 · LV ${level}`,
      h(
        'div',
        { class: 'levelup' },
        h('p', { class: 'modal__lead' }, '在走廊尽头喘息的间隙，爱丽丝想明白了一些事。选择一项专长：'),
        h('div', { class: 'talent-grid' }, modal.options.map((talent) => talentCard(talent, () => game.pickTalent(talent.id)))),
      ),
    );
  }
  return modalPanel(
    '成长 · 属性提升',
    h(
      'div',
      { class: 'levelup' },
      h('p', { class: 'modal__lead' }, '身体的某一部分变得更敏锐了。选择一项属性 +1：'),
      h(
        'div',
        { class: 'attr-pick' },
        ATTRS.map((attr) =>
          h(
            'button',
            { onclick: () => game.pickAttr(attr.key) },
            h('span', {}, attr.abbr),
            h('b', {}, String(game.attr(attr.key))),
            h('small', {}, '+1'),
          ),
        ),
      ),
    ),
  );
}
