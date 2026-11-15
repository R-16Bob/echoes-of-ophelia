// 安全屋 · 商店。

import { h } from '../dom.js';
import { art, stage, chapter, hud, hoverTip } from '../common.js';
import { ITEMS, getEquip, modText } from '../../data/equipment.js';
import { SHOP_GREETING, SAFE_ROOM_INTRO, SHOP_GOODS } from '../../data/shop.js';

export function safeScreen(game, app) {
  const safe = game.safe;
  if (!safe) return h('div', {});
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
        chapter('S A F E   R O O M   ·   教 材 室'),
        h(
          'div',
          { class: 'scene-art' },
          art('saferoom', { ratio: '16x9', cap: ['SAFE ROOM', '器材室'] }),
          h('div', { class: 'scene-art__label' }, '安全屋'),
        ),
        h(
          'div',
          { class: 'panel scene-panel' },
          h(
            'div',
            { class: 'scene-head' },
            h('div', { class: 'scene-title' }, h('small', {}, 'SHELTER'), '暂时安全'),
            h('div', { class: 'tag' }, `${safe.at}% · 第 ${game.areaRuntime.safeVisited.length} 次补给`),
          ),
          h('div', { class: 'prose' }, h('p', {}, SAFE_ROOM_INTRO)),
          h(
            'div',
            { class: 'delta-list' },
            h('span', { class: 'delta delta--up' }, `休息回复 ${safe.healed.hp} HP`),
            h('span', { class: 'delta delta--up' }, `休息回复 ${safe.healed.san} SAN`),
          ),
          h(
            'div',
            { class: 'prose', style: { marginTop: '12px' } }, h('p', {}, SHOP_GREETING)),
          h(
            'p',
            { class: 'faint', style: { margin: '10px 0 0', fontSize: '11.5px', lineHeight: '1.8' } },
            '可以买东西、睡一会儿、补充保温杯、做一次心理咨询。离开不会重置探索度。',
          ),
          h(
            'div',
            { class: 'rest-row' },
            h('button', { class: 'btn btn--primary', onclick: () => game.leaveSafeRoom() }, '离开安全屋'),
            h(
              'button',
              { class: 'btn btn--quiet', onclick: () => game.buy('rest') },
              '睡一会儿',
              h('span', { class: 'faint' }, `${safe.restCost} 硬币 · +${safe.restGain.hp} HP / +${safe.restGain.san} SAN`),
            ),
            h(
              'button',
              {
                class: 'btn btn--quiet',
                disabled:
                  safe.therapyUsed || madnessCount(game) === 0 || game.state.coins < safe.therapyCost,
                onclick: () => {
                  app.ui.therapy = !app.ui.therapy;
                  game.emit();
                },
              },
              safe.therapyUsed ? '心理咨询 · 本次已做' : '心理咨询',
              h('span', { class: 'faint' }, `${safe.therapyCost} 硬币 · 自己选择移除哪张疯狂`),
            ),
          ),
          app.ui && app.ui.therapy && !safe.therapyUsed
            ? h(
                'div',
                { class: 'therapy' },
                h('div', { class: 'therapy__head' }, '想放下哪一张？'),
                game.madnessCards.map(({ id, def }) =>
                  h(
                    'div',
                    { class: 'therapy__row' },
                    h('div', {}, h('b', {}, def.name), effectTags(def.mods)),
                    h(
                      'button',
                      {
                        class: 'btn btn--small btn--quiet',
                        onclick: () => {
                          game.therapy(id);
                          app.ui.therapy = false;
                          game.emit();
                        },
                      },
                      '移除',
                    ),
                  ),
                ),
              )
            : null,
          h(
            'p',
            { class: 'faint', style: { margin: '10px 0 0', fontSize: '11.5px', lineHeight: '1.8' } },
            `你现在有 ${madnessCount(game)} 张疯狂卡。理智侵蚀 ${game.sanityMark().value}/${game.sanityMark().max}，满一格就会抽一张卡；恢复 SAN 会让侵蚀退回去。`,
          ),
          game.notice ? h('div', { class: 'hint-box', style: { marginTop: '14px' } }, game.notice) : null,
        ),
        h(
          'div',
          { class: 'panel' },
          h(
            'div',
            { class: 'panel__head' },
            h('span', {}, '校工的货摊'),
            h('span', { class: 'faint' }, '随机库存 · 每次进入刷新'),
          ),
          h(
            'div',
            { class: 'shop' },
            safe.stock.map((goods) => shopRow(game, goods)),
          ),
        ),
      ),
    ),
  );
}

function madnessCount(game) {
  return game.state.cards.filter((card) => card.kind === 'madness').length;
}

function effectTags(mods) {
  const lines = modText(mods || {});
  return lines.length ? h('div', { class: 'slot__mods' }, lines.map((line) => h('span', { class: 'tag' }, line))) : null;
}

function shopRow(game, goods) {
  const equip = getEquip(goods.id);
  const item = ITEMS[goods.id];
  const meta = SHOP_GOODS.find((g) => g.id === goods.id);
  const name = meta && meta.label ? meta.label : equip ? equip.name : item ? item.name : goods.id;
  const desc = meta && meta.desc ? meta.desc : equip ? equip.desc : item ? item.desc : '';
  const isService = meta && meta.kind === 'service';
  const thermos = game.state.inventory.find((e) => e.id === 'thermos');
  const refillFull =
    goods.id === 'thermos_refill' && (!thermos || (item && thermos.uses >= item.maxUses));
  const owned = !isService && game.ownsThing(goods.id);
  const disabled = goods.sold || refillFull || game.state.coins < goods.price;

  // 悬停只给「效果」，不重复风味文本。
  const effects = [];
  if (equip) {
    if (equip.type === 'weapon') {
      effects.push(`伤害 ${equip.damage} · 命中 ${Math.round(equip.acc * 100)}% · ${equip.speed}t`);
    }
    effects.push(...modText(equip.mods || {}));
  }
  if (item) {
    if (item.heal) effects.push(`回复 ${item.heal} HP`);
    if (item.san) effects.push(`回复 ${item.san} SAN`);
    if (item.maxUses) effects.push(`最多使用 ${item.maxUses} 次`);
  }
  if (goods.id === 'thermos_refill') effects.push('把保温杯补满到 3 次');
  if (goods.id === 'rest') effects.push(`回复 ${game.safe.restGain.hp} HP / ${game.safe.restGain.san} SAN`);
  if (goods.id === 'therapy') effects.push('移除一张由你选择的疯狂卡');

  const tip = [
    h('div', { class: 'reveal__head' }, '效果'),
    effects.length
      ? h('div', { class: 'slot__mods' }, effects.map((line) => h('span', { class: 'tag' }, line)))
      : h('p', {}, '没有额外效果。'),
    owned ? h('div', { class: 'slot__mods' }, h('span', { class: 'tag tag--warn' }, '已持有 · 购买可补充次数')) : null,
  ];

  return h(
    'div',
    { class: `shop__item ${goods.sold ? 'shop__item--sold' : ''}`.trim() },
    hoverTip(
      h(
        'div',
        { class: 'shop__body' },
        h('div', { class: 'shop__name' }, name),
        h('div', { class: 'shop__desc faint' }, desc),
      ),
      tip,
    ),
    h(
      'div',
      { class: 'shop__price' },
      h('b', {}, goods.sold ? 'SOLD' : `${goods.price} ◈`),
      h(
        'button',
        {
          class: 'btn btn--small',
          disabled,
          onclick: () => game.buy(goods.id),
        },
        isService ? '购买' : '买下',
      ),
    ),
  );
}
