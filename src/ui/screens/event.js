// 事件卡 / 检定结果。

import { h } from '../dom.js';
import { art, stage, chapter, hud, prose, checkTag, requiresTag, combatTag, deltaChips } from '../common.js';
import { pad2 } from '../../core/util.js';
import { ATTR_NAME } from '../../game/stats.js';

export function eventScreen(game, app) {
  const { event } = game.event;
  const def = game.area;
  return h(
    'div',
    { class: 'screen' },
    hud(game),
    stage(
      game,
      app,
      h(
        'div',
        { class: 'stage__main' },
        chapter(`E V E N T   ·   ${def.en}`),
        h(
          'div',
          { class: 'scene-art' },
          art(event.art || def.art, { ratio: '16x9', cap: [event.en || def.en, def.name] }),
          h('div', { class: 'scene-art__label' }, event.fixed ? '固定事件' : '事件卡'),
        ),
        h(
          'div',
          { class: 'panel scene-panel' },
          h(
            'div',
            { class: 'scene-head' },
            h('div', { class: 'scene-title' }, h('small', {}, event.en || 'EVENT'), event.title),
            h('div', { class: 'tag' }, event.fixed ? '剧情' : '随机'),
          ),
          prose(event.text),
          h(
            'div',
            { class: 'choices' },
            event.choices.map((choice, index) => choiceRow(game, choice, index)),
          ),
          game.notice ? h('div', { class: 'hint-box', style: { marginTop: '14px' } }, game.notice) : null,
        ),
      ),
    ),
  );
}

function choiceRow(game, choice, index) {
  const availability = game.choiceAvailable(choice);
  const tags = [checkTag(game, choice.check), requiresTag(choice), choice.combat ? combatTag() : null].filter(Boolean);
  if (!availability.ok && availability.reason) {
    tags.push(h('span', { class: 'tag tag--ghost' }, availability.reason));
  }
  return h(
    'button',
    {
      class: `choice ${choice.combat ? 'choice--danger' : ''}`.trim(),
      disabled: !availability.ok,
      onclick: () => game.chooseChoice(index),
    },
    h('span', { class: 'choice__idx' }, pad2(index + 1)),
    h(
      'div',
      { class: 'choice__label' },
      choice.label,
      choice.hint ? h('small', {}, choice.hint) : null,
    ),
    h('div', { class: 'choice__tags' }, tags),
  );
}

export function outcomeScreen(game, app) {
  const event = game.event;
  const outcome = game.outcome;
  const { event: def } = event;
  const arena = game.area;
  const check = outcome.check;
  return h(
    'div',
    { class: 'screen' },
    hud(game),
    stage(
      game,
      app,
      h(
        'div',
        { class: 'stage__main' },
        chapter(`R E S U L T   ·   ${arena.en}`),
        h(
          'div',
          { class: 'scene-art' },
          art(def.art || arena.art, { ratio: '16x9', cap: [def.en || arena.en, arena.name] }),
          h('div', { class: 'scene-art__label' }, def.title),
        ),
        h(
          'div',
          { class: 'panel scene-panel' },
          h(
            'div',
            { class: 'scene-head' },
            h('div', { class: 'scene-title' }, h('small', {}, outcome.ok ? 'OUTCOME' : 'SETBACK'), outcome.title || '结果'),
            h('div', { class: 'tag' }, event.choice ? event.choice.label : ''),
          ),
          h(
            'div',
            { class: `outcome ${outcome.ok ? '' : 'outcome--fail'}`.trim() },
            check
              ? game.settings && game.settings.showRolls
                ? h(
                    'div',
                    { class: 'outcome__roll' },
                    h('span', {}, `${ATTR_NAME[check.attrKey]}检定`),
                    h('span', {}, `1d12 = `, h('b', {}, String(check.die))),
                    h('span', {}, `需要 ≤ `, h('b', {}, String(check.target))),
                    h('span', { class: check.success ? 'ok' : 'ng' }, check.success ? '通过' : '失败'),
                  )
                : h(
                    'div',
                    { class: 'outcome__roll' },
                    h('span', {}, `${ATTR_NAME[check.attrKey]}检定`),
                    h('span', { class: check.success ? 'ok' : 'ng' }, check.success ? '成功' : '失败'),
                  )
              : null,
            prose(outcome.text && outcome.text.length ? outcome.text : ['（没有更多可说的了。）']),
            outcome.lines && outcome.lines.length
              ? h('div', { class: 'list__desc', style: { marginTop: '12px' } }, outcome.lines.map((line) => h('p', {}, line)))
              : null,
            deltaChips(outcome.chips),
          ),
          game.notice ? h('div', { class: 'hint-box', style: { marginTop: '14px' } }, game.notice) : null,
          h(
            'div',
            { class: 'scene-foot' },
            h(
              'div',
              { class: 'hint' },
              outcome.endDemo
                ? '序章到此为止。'
                : event.combatPending
                  ? '有什么东西正从阴影里走出来。'
                  : '继续往里走。',
            ),
            h(
              'button',
              { class: 'btn btn--primary', onclick: () => game.continueOutcome() },
              outcome.endDemo ? '结束 DEMO' : event.combatPending ? '迎战' : '继续',
              h('span', { class: 'faint' }, 'ENTER'),
            ),
          ),
        ),
      ),
    ),
  );
}
