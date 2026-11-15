// 角色卡 / 背包 / 线索（以浮层形式打开）。

import { h } from '../dom.js';
import { art, bar, modalPanel, emptyRow } from '../common.js';
import { ATTRS, ATTR_NAME, getWeaponReport, modSources } from '../../game/stats.js';
import { SLOT_LABEL, DAMAGE_TYPES, modText, getEquip, ITEMS } from '../../data/equipment.js';
import { getSkill, UNIVERSAL_SKILLS } from '../../data/skills.js';
import { getTalent } from '../../data/talents.js';
import { getCard } from '../../data/cards.js';
import { CODEX_CATEGORIES, getCodexCategory } from '../../data/codex.js';

export function panelFor(game, app, id) {
  if (id === 'settings') return settingsPanel(game, app);
  if (id === 'codex') return codexPanel(game, app);
  if (!game.state) return null;
  if (id === 'character') return characterPanel(game, app);
  if (id === 'inventory') return inventoryPanel(game, app);
  if (id === 'skills') return skillsPanel(game, app);
  if (id === 'clues') return cluesPanel(game, app);
  return null;
}

function closeFoot(app) {
  return h('button', { class: 'btn btn--quiet', onclick: () => app.closePanel() }, '关闭');
}

function equipName(id) {
  if (!id) return '空';
  if (id === 'thermos') return '爱丽丝的保温杯';
  const def = getEquip(id) || ITEMS[id];
  return def ? def.name : id;
}

/** 悬浮说明：名称 / 描述 / 效果 / （武器）技能组 */
function equipTip(def, { weapon = false } = {}) {
  if (!def) return null;
  const mods = modText(def.mods || {});
  const skillIds = weapon ? [def.basic, ...(def.skills || [])].filter(Boolean) : [];
  const type = weapon ? DAMAGE_TYPES[def.damageType] : null;
  return h(
    'div',
    { class: 'slot__tip' },
    h('b', {}, def.name),
    def.desc ? h('p', {}, def.desc) : null,
    type
      ? h(
          'div',
          { class: 'slot__mods' },
          h('span', { class: 'tag tag--warn', title: type.desc }, `伤害类型 · ${type.name}`),
          h('span', { class: 'tag' }, `武器属性 · ${ATTR_NAME[def.attr] || def.attr}`),
        )
      : null,
    mods.length ? h('div', { class: 'slot__mods' }, mods.map((line) => h('span', { class: 'tag' }, line))) : null,
    weapon
      ? h(
          'div',
          { class: 'slot__skills' },
          h('div', { class: 'slot__skills-head' }, '技能组'),
          h('div', { class: 'slot__mods' },
            skillIds.map((id) => {
              const skill = getSkill(id);
              return h('span', { class: 'tag' }, `${skill.name} · ${skill.cost}t`);
            }),
          ),
        )
      : null,
  );
}

/** 专长 / 卡牌的修正标签 */
function effectTags(mods) {
  const lines = modText(mods || {});
  return lines.length ? h('div', { class: 'slot__mods' }, lines.map((line) => h('span', { class: 'tag' }, line))) : null;
}

/** 加成汇总：把装备、专长、疯狂卡全部加总后的最终数值。 */
function summaryRows(game, report) {
  const m = game.mods();
  const signed = (value, suffix = '') => `${value > 0 ? '+' : ''}${value}${suffix}`;
  const rows = [
    ['体力上限', `${game.maxHp}`, m.maxHp ? signed(m.maxHp) : ''],
    ['理智上限', `${game.maxSan}`, m.maxSan ? signed(m.maxSan) : ''],
    ['命中加成', signed(m.hitBonus, '%'), ''],
    ['伤害加成', signed(m.dmgBonus), ''],
    ['受到伤害', signed(-m.dmgTaken), m.dmgTaken ? '（正数为减伤）' : ''],
    ['检定加成', signed(m.checkBonus), ''],
    ['治疗加成', signed(m.healBonus), ''],
    ['时间加成', signed(m.timeBonus, '%'), ''],
    ['经验倍率', `${m.xpMult.toFixed(1)}×`, ''],
    ['击杀回 SAN', m.sanOnKill ? `+${m.sanOnKill}` : '—', ''],
    ['治疗回 SAN', m.sanOnHeal ? `+${m.sanOnHeal}` : '—', ''],
    ['硬币加成', signed(m.coinBonus), ''],
    ['当前命中', `${report.totalHit}%（不含敌人 POW）`, `${report.weaponAcc} 武器 + ${report.levelBonus} 等级 + ${report.gearHit} 装备`],
  ];
  return h(
    'div',
    { class: 'summary__grid' },
    rows.map(([label, value, note]) =>
      h(
        'div',
        { class: 'summary__row' },
        h('span', { class: 'summary__label' }, label),
        h('b', {}, value),
        note ? h('span', { class: 'summary__note' }, note) : null,
      ),
    ),
    h(
      'div',
      { class: 'summary__row summary__row--wide' },
      h('span', { class: 'summary__label' }, '武器伤害构成'),
      h(
        'span',
        {},
        `${report.weapon.damage} 武器 + ${report.attrBonus} 属性（${ATTR_NAME[report.weapon.attr]} ${report.attrValue}） + ${report.gearDmg} 装备 + 弱点加成`,
      ),
    ),
  );
}

export function characterPanel(game, app) {
  const s = game.state;
  const report = getWeaponReport(s);
  const weapon = report.weapon;
  const body = h(
    'div',
    { class: 'sheet' },
    h(
      'div',
      { class: 'sheet__left' },
      h('div', { class: 'sheet__portrait' }, art('alice', { ratio: 'portrait', cap: ['ALICE', '爱丽丝'] })),
      bar('hp', s.hp, game.maxHp, { label: 'HP' }),
      bar('san', s.san, game.maxSan, { label: 'SAN', pips: game.sanityMark() }),
      bar('xp', s.xp % 100, 100, { label: `XP · LV ${s.level}` }),
      h(
        'div',
        { class: 'attr-table' },
        ATTRS.map((attr) => {
          const base = s.attrs[attr.key];
          const value = game.attr(attr.key);
          return h(
            'div',
            { class: 'attr-cell' },
            h('span', {}, `${attr.abbr} ${attr.name}`),
            h('b', {}, String(value)),
            value !== base ? h('small', {}, `${base} → ${value}`) : null,
          );
        }),
      ),
    ),
    h(
      'div',
      { class: 'sheet__right' },
      h(
        'div',
        { class: 'sheet__section' },
        h('h4', {}, '专长'),
        h(
          'div',
          { class: 'talent-grid' },
          s.talents.map((id) => {
            const talent = getTalent(id);
            return talent
              ? h(
                  'div',
                  { class: 'talent talent--static tip-host' },
                  h('b', {}, talent.name),
                  h('span', { class: 'faint' }, talent.tag || '专长'),
                  h('div', { class: 'talent__flavor' }, talent.flavor || ''),
                  h(
                    'div',
                    { class: 'reveal reveal--effect' },
                    h('div', { class: 'reveal__head' }, '效果'),
                    h('p', {}, talent.effectText || ''),
                  ),
                )
              : null;
          }),
        ),
      ),
      h(
        'div',
        { class: 'sheet__section' },
        h('h4', {}, '精神状态'),
        s.cards.length
          ? h(
              'div',
              { class: 'clues' },
              s.cards.map((entry) => {
                const def = getCard(entry.id);
                if (!def) return null;
                return h(
                  'div',
                  { class: 'clue clue--hover tip-host' },
                  h(
                    'div',
                    { class: 'clue__title' },
                    def.name,
                    h('span', { class: `tag ${entry.kind === 'madness' ? 'tag--warn' : 'tag--talent'}` }, entry.kind === 'madness' ? '疯狂' : '美德'),
                  ),
                  h('div', { class: 'clue__text' }, def.text),
                  h(
                    'div',
                    { class: 'reveal reveal--effect' },
                    h('div', { class: 'reveal__head' }, '效果'),
                    effectTags(def.mods) || h('p', {}, '没有常驻修正。'),
                  ),
                );
              }),
            )
          : emptyRow('还很清醒。'),
        game.buffList.length
          ? h(
              'div',
              { class: 'buff-list' },
              h('div', { class: 'buff-list__head' }, '临时效果'),
              game.buffList.map((buff) =>
                h(
                  'div',
                  { class: 'buff-list__row' },
                  h('span', { class: 'tag tag--talent' }, buff.name),
                  h(
                    'span',
                    {},
                    [
                      buff.check ? `下次检定 +${buff.check}` : '',
                      buff.hit ? `下次战斗首击命中 +${buff.hit}%` : '',
                      buff.dmg ? `下次命中 +${buff.dmg} 伤害` : '',
                    ]
                      .filter(Boolean)
                      .join(' · '),
                  ),
                ),
              ),
            )
          : null,
      ),
      h(
        'div',
        { class: 'sheet__section' },
        h('h4', {}, '当前武器 · 技能组'),
        weapon
          ? h(
              'div',
              { class: 'legal tip-host' },
              h('b', {}, `${weapon.name} · ${SLOT_LABEL.weapon}`),
              h(
                'span',
                {},
                `命中 ${report.totalHit}%（${report.weaponAcc} 武器 + ${report.levelBonus} 等级·每级 +1% + ${report.gearHit} 装备；战斗时再减敌人 POW）`,
              ),
              h(
                'span',
                {},
                `伤害 ${Math.max(1, weapon.damage + report.attrBonus + report.gearDmg)}（${weapon.damage} 武器 + ${report.attrBonus} 属性 + ${report.gearDmg} 装备）· 耗时系数 ${Math.round(report.timeFactor * 100)}%`,
              ),
              h(
                'div',
                { class: 'tag-row' },
                h('span', { class: 'tag tag--warn' }, `伤害类型 · ${DAMAGE_TYPES[weapon.damageType]?.name || '—'}`),
                h('span', { class: 'tag' }, `武器属性 · ${ATTR_NAME[weapon.attr] || weapon.attr}`),
                [weapon.basic, ...(weapon.skills || [])].map((id) => {
                  const skill = getSkill(id);
                  return skill ? h('span', { class: 'tag' }, `${skill.name} · ${skill.cost}t`) : null;
                }),
              ),
              equipTip(weapon, { weapon: true }),
            )
          : emptyRow('空手。'),
      ),
      h(
        'div',
        { class: 'sheet__section' },
        h('h4', {}, '装备'),
        h(
          'div',
          { class: 'legal' },
          h('span', {}, `武器：${equipName(s.equipment.weapon)}`),
          h('span', {}, `服装：${equipName(s.equipment.outfit)}`),
          h('span', {}, `饰品：${s.equipment.trinkets.filter(Boolean).map(equipName).join(' / ') || '—'}`),
        ),
      ),
      h(
        'div',
        { class: 'sheet__section' },
        h('h4', {}, '加成汇总'),
        h('div', { class: 'summary' }, summaryRows(game, report)),
        h(
          'div',
          { class: 'summary__sources' },
          modSources(s).map((source) =>
            h(
              'div',
              { class: 'summary__source' },
              h('span', { class: 'tag' }, source.kind),
              h('b', {}, source.label),
              h('span', { class: 'faint' }, modText(source.mods).join(' · ') || '无修正'),
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'sheet__section' },
        h('h4', {}, '属性说明'),
        h(
          'div',
          { class: 'legal' },
          ATTRS.map((attr) =>
            h('span', {}, h('b', {}, `${attr.abbr} ${attr.name}`), `　${attr.desc}`),
          ),
        ),
      ),
    ),
  );
  return modalPanel('角色卡', body, closeFoot(app));
}

export function inventoryPanel(game, app) {
  const s = game.state;
  const items = game.usableItems();
  const equipables = game.equipableItems();
  const keys = game.keyItems();
  const body = h(
    'div',
    { class: 'bag' },
    h(
      'div',
      { class: 'bag__slots' },
      h('h4', {}, '已装备'),
      slotRow('weapon', s.equipment.weapon, game),
      slotRow('outfit', s.equipment.outfit, game),
      h('h4', {}, '饰品 · 最多 5 件'),
      h(
        'div',
        { class: 'slot-grid' },
        Array.from({ length: 5 }).map((_, index) => {
          const id = s.equipment.trinkets[index];
          return h(
            'div',
            { class: `slot ${id ? '' : 'slot--empty'}`.trim() },
            h('div', { class: 'slot__label' }, `饰品 ${index + 1}`),
            h('div', { class: 'slot__name' }, equipName(id)),
            id
              ? h(
                  'button',
                  { class: 'btn btn--small btn--quiet', onclick: () => game.unequip('trinket', index) },
                  '卸下',
                )
              : null,
            id ? equipTip(getEquip(id)) : null,
          );
        }),
      ),
    ),
    h(
      'div',
      { class: 'bag__list list' },
      h('h4', {}, '消耗品'),
      items.length
        ? items.map(({ entry, def }) => {
            const isThermos = entry.id === 'thermos';
            const equipped = isThermos && s.equipment.weapon === 'thermos';
            return h(
              'div',
              { class: 'list__row' },
              h(
                'div',
                {},
                h('div', { class: 'list__title' }, def.name),
                h('div', { class: 'list__desc' }, def.desc),
                h(
                  'div',
                  { class: 'list__desc' },
                  isThermos ? `剩余 ${entry.uses} / ${def.maxUses} 次 · 当武器时伤害 ${1 + entry.uses}` : `剩余 ${entry.uses} 次`,
                ),
              ),
              h(
                'div',
                { class: 'list__actions' },
                h(
                  'button',
                  { class: 'btn btn--small', onclick: () => game.useItem(entry.id) },
                  isThermos ? '喝一口' : '使用',
                ),
                isThermos
                  ? h(
                      'button',
                      {
                        class: `btn btn--small ${equipped ? 'btn--quiet' : 'btn--primary'}`,
                        disabled: equipped,
                        onclick: () => game.equipItem('thermos'),
                      },
                      equipped ? '已拿在手上' : '装备为武器',
                    )
                  : null,
              ),
            );
          })
        : emptyRow('没有可以用的东西。'),
      h('h4', {}, '背包中的装备'),
      equipables.length
        ? equipables.map(({ entry, def }) =>
            h(
              'div',
              { class: 'list__row' },
              h(
                'div',
                {},
                h('div', { class: 'list__title' }, def.name),
                h('div', { class: 'list__desc' }, def.desc),
                modText(def.mods || {}).length
                  ? h('div', { class: 'slot__mods' }, modText(def.mods || {}).map((line) => h('span', { class: 'tag' }, line)))
                  : null,
              ),
              h(
                'div',
                { class: 'list__actions' },
                h('button', { class: 'btn btn--small', onclick: () => game.equipItem(entry.id) }, '装备'),
              ),
            ),
          )
        : emptyRow('没有备用的装备。'),
      h('h4', {}, '关键物品'),
      keys.length
        ? keys.map(({ def }) =>
            h(
              'div',
              { class: 'list__row' },
              h(
                'div',
                {},
                h('div', { class: 'list__title' }, def.name, h('span', { class: 'tag tag--item' }, 'KEY')),
                h('div', { class: 'list__desc' }, def.desc),
              ),
              h('div', { class: 'list__actions' }, ''),
            ),
          )
        : emptyRow('还没有找到关键物品。'),
    ),
  );
  return modalPanel('背包', body, closeFoot(app));
}

function slotRow(slot, id, game) {
  // 武器要用「当前实际武器」：保温杯的伤害会随剩余水量变化。
  const def = slot === 'weapon' ? game.weapon() : getEquip(id);
  return h(
    'div',
    { class: `slot ${id ? '' : 'slot--empty'}`.trim() },
    h('div', { class: 'slot__label' }, SLOT_LABEL[slot] || slot),
    h('div', { class: 'slot__name' }, id ? equipName(id) : slot === 'weapon' ? '空手' : '空'),
    def && slot === 'weapon'
      ? h(
          'div',
          { class: 'slot__sub' },
          `伤害 ${def.damage} · ${DAMAGE_TYPES[def.damageType]?.name || '—'} · 命中 ${Math.round(def.acc * 100)}% · ${def.speed}t`,
        )
      : null,
    id
      ? h('button', { class: 'btn btn--small btn--quiet', onclick: () => game.unequip(slot, 0) }, '卸下')
      : null,
    id ? equipTip(def, { weapon: slot === 'weapon' }) : null,
  );
}

function codexEntryCard(game, categoryId, def) {
  const unlocked = game.codexHas(categoryId, def.id);
  if (!unlocked) {
    return h(
      'div',
      { class: 'codex-entry codex-entry--locked' },
      h('div', { class: 'codex-entry__name' }, '？？？'),
      h('div', { class: 'codex-entry__hint' }, getCodexCategory(categoryId).hint),
    );
  }

  const tags = [];
  let desc = def.desc || def.text || def.flavor || '';
  if (categoryId === 'enemies') {
    tags.push(`HP ${def.maxHp}`, `POW ${def.pow}`, `弱点 ${DAMAGE_TYPES[def.weakness] ? DAMAGE_TYPES[def.weakness].name : def.weakness}`);
    tags.push(`XP ${def.xp}`, `硬币 ${def.coins}`);
    if (def.pattern) tags.push(def.pattern.map((attack) => `${attack.type === 'hp' ? 'HP' : 'SAN'} ${attack.dmg}`).join(' → '));
    desc = def.intro || desc;
  } else if (categoryId === 'weapons') {
    tags.push(`武器属性 ${ATTR_NAME[def.attr] || def.attr}`);
    tags.push(`伤害 ${def.damage}`, `命中 ${Math.round(def.acc * 100)}%`, `${def.speed}t`);
    tags.push(`伤害类型 ${DAMAGE_TYPES[def.damageType] ? DAMAGE_TYPES[def.damageType].name : def.damageType}`);
    const skillNames = [def.basic, ...(def.skills || [])].filter(Boolean).map((id) => {
      const skill = getSkill(id);
      return `${skill.name} ${skill.cost}t`;
    });
    if (skillNames.length) tags.push(`技能：${skillNames.join(' / ')}`);
  } else if (categoryId === 'outfits' || categoryId === 'trinkets') {
    tags.push(...modText(def.mods));
  } else if (categoryId === 'items') {
    if (def.heal) tags.push(`回复 ${def.heal} HP`);
    if (def.san) tags.push(`回复 ${def.san} SAN`);
    tags.push(def.maxUses ? `${def.maxUses} 次` : '一次性');
    if (def.refillable) tags.push('可在安全屋补充');
  } else if (categoryId === 'talents') {
    tags.push('专长', def.tag || '');
    desc = def.flavor || def.effectText || '';
    if (def.effectText) tags.push(def.effectText);
  } else if (categoryId === 'madness') {
    tags.push('常驻', ...modText(def.mods));
  } else if (categoryId === 'virtue') {
    tags.push('一次性', def.onceText || '');
  }

  return h(
    'div',
    { class: 'codex-entry' },
    h(
      'div',
      { class: 'codex-entry__head' },
      h('div', { class: 'codex-entry__name' }, def.name),
      h('div', { class: 'codex-entry__en' }, def.en || ''),
    ),
    tags.filter(Boolean).length ? h('div', { class: 'tag-row' }, tags.filter(Boolean).map((tag) => h('span', { class: 'tag' }, tag))) : null,
    desc ? h('div', { class: 'codex-entry__desc' }, desc) : null,
  );
}

export function codexPanel(game, app) {
  const activeId = app.ui.codexTab || 'enemies';
  const active = getCodexCategory(activeId);
  const entries = active.entries();
  const unlocked = entries.filter((entry) => game.codexHas(active.id, entry.id)).length;
  let allUnlocked = 0;
  let allTotal = 0;
  for (const category of CODEX_CATEGORIES) {
    const list = category.entries();
    allTotal += list.length;
    allUnlocked += list.filter((entry) => game.codexHas(category.id, entry.id)).length;
  }
  const percent = Math.round((allUnlocked / Math.max(1, allTotal)) * 100);
  const body = h(
    'div',
    { class: 'codex' },
    h(
      'div',
      { class: 'codex__head' },
      h('div', {}, h('div', { class: 'codex__title' }, '图鉴'), h('div', { class: 'codex__sub' }, '遇到、获得或抽到的东西会记录在这里，跨周目保留。')),
      h('div', { class: 'codex__score' }, h('b', {}, `${allUnlocked} / ${allTotal}`), h('span', {}, `收集率 ${percent}%`)),
    ),
    h(
      'div',
      { class: 'codex__tabs' },
      CODEX_CATEGORIES.map((category) => {
        const list = category.entries();
        const got = list.filter((entry) => game.codexHas(category.id, entry.id)).length;
        return h(
          'button',
          {
            class: `codex__tab ${category.id === active.id ? 'codex__tab--on' : ''}`.trim(),
            onclick: () => app.setCodexTab(category.id),
          },
          h('span', {}, category.name),
          h('b', {}, `${got} / ${list.length}`),
        );
      }),
    ),
    h(
      'div',
      { class: 'codex__meta' },
      h('span', {}, `${active.name} · 已记录 ${unlocked} / ${entries.length}`),
      h('span', { class: 'faint' }, active.hint),
    ),
    h('div', { class: 'codex__grid' }, entries.map((entry) => codexEntryCard(game, active.id, entry))),
  );
  return modalPanel('图鉴', body, closeFoot(app));
}

export function settingsPanel(game, app) {
  const body = h(
    'div',
    { class: 'settings' },
    h(
      'div',
      { class: 'settings__row' },
      h(
        'div',
        { class: 'settings__text' },
        h('b', {}, '显示检定数值'),
        h('p', { class: 'list__desc' }, '开启时，检定会显示 1d12 的骰面与需要掷出的目标值；关闭后只告诉你成功还是失败。战斗中的命中率不受影响。'),
      ),
      h(
        'button',
        {
          class: `toggle ${game.settings.showRolls ? 'toggle--on' : ''}`.trim(),
          role: 'switch',
          'aria-checked': String(Boolean(game.settings.showRolls)),
          onclick: () => game.toggleSetting('showRolls'),
        },
        h('span', { class: 'toggle__dot' }),
        h('span', { class: 'toggle__label' }, game.settings.showRolls ? '开' : '关'),
      ),
    ),
    h('p', { class: 'faint', style: { marginTop: '14px', fontSize: '11.5px' } }, '设置会保存在本机浏览器里，下次打开仍然有效。'),
  );
  return modalPanel('设置', body, closeFoot(app));
}

function skillCard(skill, weapon, { universal = false } = {}) {
  const cost = `${skill.cost}t`;
  let damage = null;
  if (skill.hits) damage = skill.hits.reduce((sum, n) => sum + n, 0);
  else if (skill.fromWeapon) damage = (weapon.damage || 1) * (skill.multiplier || 1);
  else if (skill.damage) damage = skill.damage;
  return h(
    'div',
    { class: `skillbook-card ${skill.kind === 'buff' ? 'skillbook-card--buff' : ''}`.trim() },
    h(
      'div',
      { class: 'skillbook-card__head' },
      h('div', {}, h('div', { class: 'skillbook-card__name' }, skill.name), h('div', { class: 'skillbook-card__en' }, skill.en || '')),
      h('div', { class: 'skillbook-card__cost' }, cost),
    ),
    h(
      'div',
      { class: 'tag-row' },
      h('span', { class: 'tag' }, skill.kind === 'buff' ? '辅助' : '攻击'),
      damage ? h('span', { class: 'tag tag--warn' }, `伤害 ${damage}`) : null,
      skill.hitBonus ? h('span', { class: 'tag' }, `命中 +${skill.hitBonus}%`) : null,
      skill.sureHit ? h('span', { class: 'tag' }, '必定命中') : null,
      skill.execute ? h('span', { class: 'tag' }, `处决 <${Math.round(skill.execute.threshold * 100)}% +${skill.execute.bonus}`) : null,
    ),
    h('div', { class: 'skillbook-card__desc' }, skill.desc),
    universal ? h('div', { class: 'skillbook-card__note' }, '通用技能 · 与装备无关') : null,
  );
}

export function skillsPanel(game, app) {
  const weapon = game.weapon();
  const weaponSkills = [weapon.basic, ...(weapon.skills || [])].filter(Boolean).map((id) => getSkill(id));
  const universalSkills = UNIVERSAL_SKILLS.map((id) => getSkill(id));
  const body = h(
    'div',
    { class: 'skillbook' },
    h(
      'div',
      { class: 'skillbook__head' },
      h('div', {}, h('div', { class: 'skillbook__title' }, `当前武器 · ${weapon.name}`), h('div', { class: 'skillbook__sub' }, '切换武器会整组替换武器技能；通用技能始终保留。')),
    ),
    h('div', { class: 'skillbook__label' }, '武器技能组'),
    h('div', { class: 'skillbook__grid' }, weaponSkills.map((skill) => skillCard(skill, weapon))),
    h('div', { class: 'skillbook__label' }, '通用技能组'),
    h('div', { class: 'skillbook__grid' }, universalSkills.map((skill) => skillCard(skill, weapon, { universal: true }))),
    h('p', { class: 'faint skillbook__hint' }, '战斗中每个技能都会显示实际伤害与命中拆解；辅助技能不造成伤害，也不会落空。'),
  );
  return modalPanel('技能', body, closeFoot(app));
}

export function cluesPanel(game, app) {
  const clues = game.state.clues;
  const body = h(
    'div',
    { class: 'clues' },
    clues.length
      ? clues.map((clue) =>
          h(
            'div',
            { class: 'clue' },
            h('div', { class: 'clue__title' }, clue.title || '线索'),
            h('div', { class: 'clue__text' }, clue.text || ''),
          ),
        )
      : emptyRow('还没有找到任何线索。'),
  );
  return modalPanel('线索', body, closeFoot(app));
}
