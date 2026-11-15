// 战斗界面。

import { h } from '../dom.js';
import { art, hud, chapter, bar, hoverTip } from '../common.js';
import { TURN_TIME } from '../../game/combat.js';
import { modText, DAMAGE_TYPES } from '../../data/equipment.js';

export function combatScreen(game, app) {
  const combat = game.combat;
  if (!combat) return h('div', {});
  const enemy = combat.enemy;
  const finished = combat.finished;
  const basic = combat.actions[0] || null;
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
        chapter(`C O M B A T   ·   R O U N D   ${combat.round}`),
        h(
          'div',
          { class: 'combat' },
          h(
            'div',
            { class: 'combat__main' },
            h(
              'div',
              { class: 'enemy' },
              h('div', { class: 'enemy__art' }, art(enemy.art, { ratio: '4x3' })),
              h(
                'div',
                { class: 'enemy__info' },
                h('div', { class: 'enemy__tag' }, enemy.en || 'ENEMY'),
                h('div', { class: 'enemy__name' }, enemy.name),
                h('div', { class: 'enemy__desc' }, enemy.desc),
                h(
                  'div',
                  { class: 'enemy__stats' },
                  h('span', {}, 'POW ', h('b', {}, String(enemy.pow))),
                  h('span', {}, 'HP ', h('b', {}, `${combat.enemyHp} / ${enemy.maxHp}`)),
                  enemy.weakness
                    ? h(
                        'span',
                        {
                          class: 'tag tag--warn',
                          title: `使用「${DAMAGE_TYPES[enemy.weakness].name}」属性的武器攻击，每次命中 +1 伤害。`,
                        },
                        `弱点 · ${DAMAGE_TYPES[enemy.weakness].name}`,
                      )
                    : null,
                ),
                h(
                  'div',
                  { class: 'enemy__intent' },
                  h(
                    'div',
                    { class: 'enemy__intent-now' },
                    '下一击：',
                    h('b', { class: `intent intent--${combat.nextAttack.type}` },
                      combat.nextAttack.type === 'hp'
                        ? `HP -${Math.max(0, combat.nextAttack.dmg - game.mods().dmgTaken)}`
                        : `SAN -${Math.max(0, combat.nextAttack.dmg - game.mods().dmgTaken)}`),
                    h('span', { class: 'faint' }, `（第 ${combat.round} 回合）`),
                  ),
                  h(
                    'div',
                    { class: 'enemy__intent-cycle' },
                    combat.patternList.map((attack) =>
                      h(
                        'span',
                        { class: `intent-chip ${attack.next ? 'intent-chip--next' : ''}`.trim() },
                        `${attack.type === 'hp' ? 'HP' : 'SAN'} -${attack.dmg}`,
                      ),
                    ),
                  ),
                ),
                h(
                  'div',
                  { class: 'bar bar--hp' },
                  h('div', { class: 'bar__fill', style: { width: `${(combat.enemyHp / enemy.maxHp) * 100}%` } }),
                ),
              ),
            ),
            h(
              'div',
              { class: 'arena' },
              h(
                'div',
                { class: 'arena__head' },
                h('div', { class: 'arena__title' }, finished ? '战斗结束' : '爱丽丝的回合'),
                h('div', { class: 'arena__round' }, finished ? '—' : `剩余 ${combat.timeLeft}t / ${TURN_TIME}t`),
                finished
                  ? null
                  : h(
                      'div',
                      { class: 'arena__hit' },
                      `命中 ${combat.hitChance}%（${combat.hitBreakdown.weaponAcc} 武器 + ${combat.hitBreakdown.level} 等级 − ${combat.hitBreakdown.pow} POW + ${combat.hitBreakdown.gear} 装备）`,
                    ),
              ),
              h(
                'div',
                { class: 'arena__body' },
                finished ? finishBody(game, combat) : actionBody(game, combat),
              ),
            ),
          ),
          h(
            'div',
            { class: 'combat__side' },
            h(
              'div',
              { class: 'panel' },
              h('div', { class: 'panel__head' }, h('span', {}, '状态')),
              h(
                'div',
                { class: 'battle-bars' },
                bar('hp', game.state.hp, game.maxHp, { label: '爱丽丝 · HP' }),
                bar('san', game.state.san, game.maxSan, { label: '爱丽丝 · SAN' }),
                h('div', { class: 'stat-line' }, h('span', {}, '武器'), h('b', {}, `${combat.weapon.name} · ${DAMAGE_TYPES[combat.weapon.damageType]?.name || '—'}`)),
                h('div', { class: 'stat-line' }, h('span', {}, '伤害加成'), h('b', {}, `+${game.mods().dmgBonus}`)),
                h(
                  'div',
                  { class: 'stat-line' },
                  h('span', {}, '命中率'),
                  h('b', {}, `${combat.hitChance}%（${combat.hitBreakdown.weaponAcc}+${combat.hitBreakdown.level}−${combat.hitBreakdown.pow}+${combat.hitBreakdown.gear}）`),
                ),
                h(
                  'div',
                  { class: 'stat-line' },
                  h('span', {}, '普攻伤害'),
                  h('b', {}, basic ? `${basic.damage}（${basic.breakdown.weaponBase}+${basic.breakdown.attr}+${basic.breakdown.gear}${basic.breakdown.weak ? `+${basic.breakdown.weak}` : ''}）` : '—'),
                ),
                combat.weaknessBonus
                  ? h('div', { class: 'stat-line' }, h('span', {}, '弱点命中'), h('b', { class: 'mint' }, '每次命中 +1'))
                  : null,
                combat.buffs.hitBonus
                  ? h('div', { class: 'stat-line' }, h('span', {}, '甩链蓄力'), h('b', { class: 'mint' }, `命中 +${combat.buffs.hitBonus}%`))
                  : null,
                combat.sureHit
                  ? h('div', { class: 'stat-line' }, h('span', {}, '准备动作'), h('b', { class: 'mint' }, '下一击必中'))
                  : null,
              ),
            ),
            h(
              'div',
              { class: 'panel' },
              h('div', { class: 'panel__head' }, h('span', {}, '战斗记录')),
              h(
                'div',
                { class: 'log' },
                combat.log.map((line) => h('div', { class: `log__line log__line--${logKind(line.kind)}` }, line.text)),
              ),
            ),
            h(
              'div',
              { class: 'hint-box' },
              '一回合共 200t。排好行动再执行；执行前随时可以点时间条上的片段撤回。',
            ),
          ),
        ),
      ),
    ),
  );
}

function logKind(kind) {
  if (kind === 'player') return 'hit';
  if (kind === 'miss') return 'miss';
  if (kind === 'enemy') return 'hurt';
  if (kind === 'crit') return 'sys';
  return 'sys';
}

function actionBody(game, combat) {
  const actions = combat.actions;
  const items = combat.inventoryActions;
  return [
    h(
      'div',
      { class: 'timeline' },
      h(
        'div',
        { class: 'timeline__head' },
        h('span', {}, '时间条 · 点击片段可撤回'),
        h('b', {}, `已用 ${TURN_TIME - combat.timeLeft} / ${TURN_TIME}t`),
      ),
      h(
        'div',
        { class: 'timeline__track' },
        combat.queue.length
          ? [
              ...combat.queue.map((action, index) =>
                h(
                  'div',
                  {
                    class: `timeline__seg ${action.skillId === combat.weapon.basic ? 'timeline__seg--basic' : 'timeline__seg--skill'} timeline__seg--queued`,
                    style: { width: `${(action.cost / TURN_TIME) * 100}%` },
                    title: `${action.name} · ${action.cost}t（点击撤回）`,
                    onclick: () => game.combatAction(index),
                  },
                  h('span', {}, action.name),
                ),
              ),
              h('div', { class: 'timeline__rest', style: { width: `${(combat.timeLeft / TURN_TIME) * 100}%` } }, `剩余 ${combat.timeLeft}t`),
            ]
          : h('div', { class: 'timeline__empty' }, '还没有安排行动'),
      ),
      h(
        'div',
        { class: 'timeline__ticks' },
        h('span', {}, '0t'),
        h('span', {}, '50t'),
        h('span', {}, '100t'),
        h('span', {}, '150t'),
        h('span', {}, '200t'),
      ),
    ),
    h(
      'div',
      { class: 'skills' },
      actions.map((action) =>
        h(
          'button',
          {
            class: 'skill',
            disabled: !action.affordable,
            onclick: () => game.combatAdd(action.id),
          },
          h(
            'div',
            { class: 'skill__top' },
            h('span', { class: 'skill__name' }, action.name),
            h('span', { class: 'skill__cost' }, `${action.cost}t`),
          ),
          h('div', { class: 'skill__desc' }, action.desc),
          h(
            'div',
            {
              class: 'skill__meta',
              title: `武器 ${action.breakdown.weaponBase} + 属性 ${action.breakdown.attr} + 装备 ${action.breakdown.gear} + 弱点 ${action.breakdown.weak}`,
            },
            action.sureHit
              ? '下一次攻击必定命中'
              : action.kind === 'buff'
                ? `命中 +${action.hitBonus || 0}% · 可叠加`
                : `伤害 ${action.damage}`,
            action.kind === 'buff' ? '' : `（${action.breakdown.weaponBase}+${action.breakdown.attr}+${action.breakdown.gear}${action.breakdown.weak ? `+${action.breakdown.weak}` : ''}）`,
            action.execute ? ` · 处决 <${Math.round(action.execute.threshold * 100)}%` : '',
          ),
        ),
      ),
    ),
    h(
      'div',
      {},
      h('div', { class: 'timeline__head', style: { marginBottom: '6px' } }, h('span', {}, '道具（不消耗时间）')),
      h(
        'div',
        { class: 'queue' },
        items.length
          ? items.map(({ entry, def }) =>
              hoverTip(
                h(
                  'button',
                  { class: 'queue__chip', onclick: () => game.combatUseItem(entry.id) },
                  def.name,
                  h('b', {}, `×${entry.uses}`),
                ),
                h(
                  'div',
                  { class: 'tip-body' },
                  h('div', { class: 'tip-title' }, def.name),
                  h(
                    'div',
                    { class: 'tag-row' },
                    def.heal ? h('span', { class: 'tag' }, `回复 ${def.heal} HP`) : null,
                    def.san ? h('span', { class: 'tag' }, `回复 ${def.san} SAN`) : null,
                    h('span', { class: 'tag' }, `剩余 ${entry.uses} 次`),
                  ),
                  h('div', { class: 'tip-note' }, '使用道具不消耗时间。'),
                ),
              ),
            )
          : h('span', { class: 'queue__hint' }, '没有可用的消耗品。'),
      ),
    ),
    h(
      'div',
      { class: 'queue' },
      h('span', { class: 'queue__hint' }, '已安排：'),
      combat.queue.length
        ? combat.queue.map((action, index) =>
            h(
              'button',
              { class: 'queue__chip', onclick: () => game.combatAction(index) },
              action.name,
              h('b', {}, `${action.cost}t`),
              '✕',
            ),
          )
        : h('span', { class: 'queue__hint' }, '无'),
    ),
    h(
      'div',
      { class: 'rest-row' },
      h(
        'button',
        { class: 'btn btn--primary', disabled: combat.queue.length === 0, onclick: () => game.combatExecute() },
        '执行',
        h('span', { class: 'faint' }, 'EXECUTE'),
      ),
      h(
        'button',
        { class: 'btn btn--quiet', disabled: combat.queue.length === 0, onclick: () => game.combatClear() },
        '清空',
      ),
    ),
  ];
}

function finishBody(game, combat) {
  const win = combat.victory;
  return [
    h(
      'div',
      { class: `outcome ${win ? '' : 'outcome--fail'}`.trim() },
      h('div', { class: 'outcome__roll' }, h('b', {}, win ? '战斗胜利' : '战斗失败')),
      h('div', { class: 'prose' }, h('p', {}, win ? combat.enemy.defeat || '它不再动了。' : '爱丽丝再也没能站起来。')),
    ),
    h(
      'div',
      { class: 'rest-row' },
      h(
        'button',
        { class: 'btn btn--primary', onclick: () => game.finishCombat() },
        win ? '收起武器' : '……',
      ),
    ),
  ];
}
