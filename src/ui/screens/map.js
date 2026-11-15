// 地图 / 区域探索。

import { h } from '../dom.js';
import { art, stage, chapter, hud, prose } from '../common.js';
import { AREA_ORDER, getArea, SAFE_STOPS, nextStop } from '../../data/areas.js';
import { ITEMS, getEquip } from '../../data/equipment.js';

export function mapScreen(game, app) {
  const selected = app.ui.selectedArea || firstOpenArea(game) || 'gate';
  const def = getArea(selected);
  const runtime = game.state.areas[selected];
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
        chapter('S T .   A G N E S   ·   0 3 : 1 7'),
        h(
          'div',
          { class: 'map' },
          h(
            'div',
            { class: 'panel' },
            h(
              'div',
              { class: 'panel__head' },
              h('span', {}, '校园地图'),
              h('span', { class: 'faint' }, '选择要探索的区域'),
            ),
            h(
              'div',
              { class: 'panel__body' },
              h(
                'div',
                { class: 'map__grid' },
                AREA_ORDER.map((id) => areaCard(game, id, selected, () => app.selectArea(id))),
              ),
            ),
          ),
          areaDetail(game, app, selected, def, runtime),
        ),
        h(
          'div',
          { class: 'hint-box' },
          h('b', {}, '提示：'),
          '每次探索都会推进探索度并抽取事件卡。探索度 50% 与 90% 各能遇到一次安全屋，100% 会触发该区域的固定剧情。',
        ),
      ),
    ),
  );
}

function firstOpenArea(game) {
  return AREA_ORDER.find((id) => game.areaStatus(id) === 'open') || null;
}

function areaCard(game, id, selected, onclick) {
  const def = getArea(id);
  const runtime = game.state.areas[id];
  const status = game.areaStatus(id);
  const locked = status === 'locked' || status === 'coming';
  return h(
    'button',
    {
      class: [
        'area-card',
        id === selected ? 'area-card--active' : '',
        locked ? 'area-card--locked' : '',
        status === 'cleared' ? 'area-card--cleared' : '',
      ]
        .filter(Boolean)
        .join(' '),
      onclick,
      disabled: false,
    },
    h('div', { class: 'area-card__art' }, art(def.art, { ratio: '16x9' })),
    locked
      ? h(
          'div',
          { class: 'area-card__lock' },
          h('b', {}, status === 'coming' ? '⌧' : '·'),
          status === 'coming' ? '尚未开放' : lockHint(def),
        )
      : null,
    h(
      'div',
      { class: 'area-card__body' },
      h(
        'div',
        { class: 'area-card__top' },
        h('span', { class: 'area-card__name' }, def.name),
        h('span', { class: 'area-card__pct' }, status === 'cleared' ? '已完成' : `${runtime.progress}%`),
      ),
      h('div', { class: 'area-card__desc' }, def.desc),
      status === 'cleared' ? null : progressBar(runtime.progress),
    ),
  );
}

function lockHint(def) {
  if (def.comingSoon) return '尚未开放';
  if (def.unlock && def.unlock.item) {
    const item = ITEMS[def.unlock.item];
    return `需要「${item ? item.name : def.unlock.item}」`;
  }
  if (def.unlock && def.unlock.area) return `先完成「${getArea(def.unlock.area).name}」`;
  return '锁住了';
}

export function progressBar(value, { muted = false } = {}) {
  return h(
    'div',
    { class: `progress ${muted ? 'progress--muted' : ''}`.trim() },
    h('div', { class: 'progress__fill', style: { width: `${value}%` } }),
    SAFE_STOPS.map((stop) =>
      h('div', {
        class: `progress__mark ${stop >= 100 ? 'progress__mark--end' : ''}`.trim(),
        style: { left: `${stop}%` },
      }),
    ),
    h('div', { class: 'progress__mark progress__mark--end', style: { left: '100%' } }),
  );
}

function areaDetail(game, app, id, def, runtime) {
  const status = game.areaStatus(id);
  const locked = status !== 'open' && status !== 'cleared';
  const stop = nextStop(runtime.progress, runtime.safeVisited);
  const stepsToStop = Math.max(1, Math.ceil((stop.at - runtime.progress) / 7));
  const stopLabel = stop.kind === 'safe' ? '安全屋' : '固定剧情';
  return h(
    'div',
    { class: 'panel area-detail' },
    h('div', { class: 'area-detail__art' }, art(def.art, { ratio: '16x9', cap: [def.en, def.name] })),
    h(
      'div',
      { class: 'area-detail__body' },
      h('div', { class: 'area-detail__name' }, def.name),
      h('div', { class: 'area-detail__en' }, def.en),
      h('div', { class: 'area-detail__text' }, def.desc),
      h(
        'div',
        { class: 'area-detail__meta' },
        h(
          'div',
          { class: 'area-detail__row' },
          h('span', {}, '探索度'),
          h('b', {}, `${runtime.progress}%`),
        ),
        progressBar(runtime.progress),
        h(
          'div',
          { class: 'area-detail__row' },
          h('span', {}, '已探索'),
          h('b', {}, `${runtime.draws} 次`),
        ),
        h(
          'div',
          { class: 'area-detail__row' },
          h('span', {}, '下一个节点'),
          h('b', {}, `${stopLabel} · ${stop.at}%`),
        ),
      ),
      h('div', { class: 'hint-box' }, def.fixedHint || '这片区域还没有查清楚。'),
      h(
        'div',
        { class: 'area-detail__foot' },
        h(
          'button',
          {
            class: 'btn btn--primary btn--block',
            disabled: locked,
            onclick: () => game.enterArea(id),
          },
          locked ? lockHint(def) : runtime.progress > 0 ? '继续探索' : '进入区域',
          h('span', { class: 'faint' }, `约 ${stepsToStop} 次后${stop.kind === 'safe' ? '抵达安全屋' : '触发固定事件'}`),
        ),
      ),
    ),
  );
}

export function exploreScreen(game, app) {
  const def = game.area;
  const runtime = game.areaRuntime;
  const stop = nextStop(runtime.progress, runtime.safeVisited);
  const remaining = Math.max(1, Math.ceil((stop.at - runtime.progress) / 7));
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
        chapter(`${def.en} · ${String(runtime.progress).padStart(3, '0')}%`),
        h('div', { class: 'scene-art' }, art(def.art, { ratio: '16x9', cap: [def.en, def.name] }), h('div', { class: 'scene-art__label' }, def.name)),
        h(
          'div',
          { class: 'panel scene-panel' },
          h(
            'div',
            { class: 'scene-head' },
            h('div', { class: 'scene-title' }, h('small', {}, 'EXPLORE'), runtime.progress >= 100 ? '这里已经没有别的路了' : '还剩下些什么'),
            h('div', { class: 'tag' }, `探索度 ${runtime.progress}%`),
          ),
          h('div', { class: 'panel__body', style: { padding: 0 } }, progressBar(runtime.progress)),
          h('div', { style: { height: '16px' } }),
          prose(def.intro || []),
          h(
            'div',
            { class: 'choices' },
            runtime.progress >= 100
              ? h('button', { class: 'btn btn--primary btn--block', onclick: () => game.explore() }, '迎接这里的结局', h('span', { class: 'faint' }, 'FIXED EVENT'))
              : h(
                  'button',
                  { class: 'btn btn--primary btn--block', onclick: () => game.explore() },
                  '向前走',
                  h('span', { class: 'faint' }, '探索度 +5%~10% · 抽一张事件卡'),
                ),
            h('button', { class: 'btn btn--block btn--quiet', onclick: () => game.goMap() }, '退回地图'),
          ),
          h(
            'div',
            { class: 'scene-foot' },
            h(
              'div',
              { class: 'hint' },
              `再探索约 ${remaining} 次，${stop.kind === 'safe' ? '会找到安全屋' : '会迎来这个区域的固定事件'}。`,
            ),
            h('div', { class: 'hint' }, `已抽事件 ${runtime.draws}`),
          ),
        ),
        game.notice ? h('div', { class: 'hint-box' }, game.notice) : null,
      ),
    ),
  );
}
