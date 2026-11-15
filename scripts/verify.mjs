// 一次性回归检查：装备分栏、消耗品、开局数值、商店节点。
import { installDom } from './dom-shim.mjs';
installDom();
process.env.ALICE_TEST = '1';

const { Game } = await import('../src/game/game.js');
const { nextStop, passedStop } = await import('../src/data/areas.js');

const results = [];
function ok(name, cond, detail = '') {
  results.push({ name, pass: Boolean(cond), detail });
}

const game = new Game();
game.newGame();
game.startGame();
const s = game.state;

// 6) 开局满血满理智（含发带 +5）
ok('开局 SAN = 上限 25', s.san === game.maxSan && game.maxSan === 25, `${s.san}/${game.maxSan}`);
ok('开局 HP = 上限', s.hp === game.maxHp, `${s.hp}/${game.maxHp}`);

// 4) 别针能进背包
ok('获得校徽别针', game.addItem('pin') === true && s.inventory.some((e) => e.id === 'pin'));
game.equipItem('pin');
ok('别针可装备到饰品栏', s.equipment.trinkets.includes('pin'));

// 1) 武器不会被装进饰品栏
game.addItem('scissors');
game.equipItem('scissors');
ok('装备剪刀（武器）', s.equipment.weapon === 'scissors');
ok('武器栏替换而非塞饰品', s.equipment.trinkets.includes('scissors') === false);
game.unequip('weapon');
ok('卸下武器回到背包', s.inventory.some((e) => e.id === 'scissors'));
ok('卸空武器后空手作战', game.weapon().id === 'fists');
game.equipItem('scissors');
ok('重新装备武器', s.equipment.weapon === 'scissors');

// 服装
game.addItem('coat');
game.equipItem('coat');
ok('装备服装', s.equipment.outfit === 'coat');
ok('服装不进饰品栏', !s.equipment.trinkets.includes('coat'));

// 2) 消耗品不能当装备
game.addItem('bandage');
ok('绷带不能装备', game.equipItem('bandage') === false || !Object.values(s.equipment).flat().includes('bandage'));

// 保温杯：3 次、可用、可当武器、伤害随水量
const beforeUses = s.inventory.find((e) => e.id === 'thermos').uses;
s.hp = 5;
game.useItem('thermos');
const afterUses = s.inventory.find((e) => e.id === 'thermos').uses;
ok('保温杯用一次只减一次', beforeUses === 3 && afterUses === 2, `${beforeUses}->${afterUses}`);
ok('保温杯回 2 HP', s.hp === 7, `hp=${s.hp}`);

game.equipItem('thermos');
ok('保温杯可装备为武器', s.equipment.weapon === 'thermos');
ok('保温杯装备后仍在背包', s.inventory.some((e) => e.id === 'thermos'));
ok('保温杯武器伤害 = 1 + 剩余次数', game.weapon().damage === 3, `damage=${game.weapon().damage}`);
game.unequip('weapon');
ok('卸下保温杯后空手', game.weapon().id === 'fists');
ok('卸下不产生重复保温杯', s.inventory.filter((e) => e.id === 'thermos').length === 1);

// 7) 探索节点：50 / 90 两次安全屋
ok('0% 下一个节点 50 安全屋', nextStop(0, []).at === 50 && nextStop(0, []).kind === 'safe');
ok('50% 已访问 → 90', nextStop(50, [50]).at === 90);
ok('90% 已访问 → 100 固定剧情', nextStop(90, [50, 90]).kind === 'fixed');

// 5) 设置开关
ok('默认显示检定值', game.settings.showRolls === true);
game.toggleSetting('showRolls');
ok('关闭后 false', game.settings.showRolls === false);

// 8) 理智侵蚀计数：每 5 点 SAN 损失抽一张，恢复会倒扣
const gainSamples = [
  game.explorationGain({ ok: true, check: { success: true }, hpBefore: s.hp, sanBefore: s.san, chips: [] }),
  game.explorationGain({ ok: false, check: { success: false }, hpBefore: s.hp + 3, sanBefore: s.san + 3, chips: [] }),
];
ok('探索度增量在 5%–10%', gainSamples.every((gain) => gain >= 5 && gain <= 10), gainSamples.join(','));
ok('越过 50% 会触发安全屋', passedStop(55, []) && passedStop(55, []).at === 50, JSON.stringify(passedStop(55, [])));
ok('已访问的安全屋不会重复触发', passedStop(95, [50]) && passedStop(95, [50]).at === 90, JSON.stringify(passedStop(95, [50])));
ok('跨过 90% 后下一个节点是固定剧情', nextStop(95, [50, 90]).kind === 'fixed', JSON.stringify(nextStop(95, [50, 90])));
ok('初始硬币 20', s.coins === 20, `coins=${s.coins}`);
s.sanMark = 0;
s.san = game.maxSan;
game.changeSan(-3);
ok('损失 3 SAN → 侵蚀 3/5', game.sanityMark().value === 3, `${game.sanityMark().value}/5`);
game.changeSan(2);
ok('回复 2 SAN → 侵蚀退回 1', game.sanityMark().value === 1);
const cardsBefore = s.cards.length;
const origChance = game.rng.chance.bind(game.rng);
game.rng.chance = () => false; // 固定抽疯狂卡，便于断言
game.changeSan(-4);
game.rng.chance = origChance;
ok('侵蚀满 5 → 抽一张卡', s.cards.length === cardsBefore + 1, `cards=${s.cards.length}`);
ok('抽卡后侵蚀清零', s.sanMark === 0);

// 9) 商店：过滤已拥有装备、买完下架、消耗品可补、心理咨询
s.currentArea = 'gate';
s.cards = []; // 清掉刚才抽到的卡，避免卡牌修正影响回复量
game.enterSafeRoom(50);
const ids = game.safe.stock.map((g) => g.id);
ok('商店不出现已拥有的装备', !ids.includes('scissors') && !ids.includes('pin') && !ids.includes('coat'));
ok('商店仍可出现消耗品', ids.some((id) => ['bandage', 'sedative', 'candy'].includes(id)));
ok('进入安全屋少量回复 2 HP / 2 SAN', game.safe.healed.hp === 2 && game.safe.healed.san === 2);

const target = game.safe.stock[0];
const coinsBefore = s.coins;
game.buy(target.id);
ok('买下后商品下架', !game.safe.stock.some((g) => g.id === target.id));
ok('买下后扣除硬币', s.coins === coinsBefore - target.price, `coins=${s.coins}`);

s.cards.push({ id: 'hallucination', kind: 'madness' });
const coinsBeforeTherapy = s.coins;
game.therapy('hallucination');
ok('心理咨询移除玩家指定的疯狂', !s.cards.some((c) => c.kind === 'madness'));
ok('心理咨询扣 6 硬币', s.coins === coinsBeforeTherapy - 6, `coins=${s.coins}`);
const coinsAfterTherapy = s.coins;
game.therapy('hallucination');
ok('每次安全屋只能咨询一次', s.coins === coinsAfterTherapy && game.safe.therapyUsed);

s.hp = 5;
s.san = 5;
s.coins = 20;
game.buy('rest');
ok('休息回复 5 HP / 6 SAN', s.hp === 10 && s.san === 11, `${s.hp} HP / ${s.san} SAN`);

// 10) 重复获得物品折算硬币
const { applyEffects } = await import('../src/game/effects.js');
game.addItem('charm');
s.coins = 0;
const res = applyEffects(game, { item: 'charm' });
ok('重复装备折算硬币', s.coins === 4, `coins=${s.coins}`);
ok('重复时提示已拥有', res.chips.some((c) => c.label.includes('已经有了')));

// 11) 伤害类型 / 敌人弱点 / 事件日志
const { DAMAGE_TYPES, WEAPONS } = await import('../src/data/equipment.js');
const { ENEMIES } = await import('../src/data/enemies.js');
const { Combat } = await import('../src/game/combat.js');
ok('四类伤害类型齐备', ['slash', 'blunt', 'pierce', 'arcane'].every((k) => DAMAGE_TYPES[k]));
ok(
  '所有武器都有合法伤害类型',
  Object.values(WEAPONS).every((w) => DAMAGE_TYPES[w.damageType]),
);
ok(
  '敌人弱点均为合法伤害类型',
  Object.values(ENEMIES).every((e) => !e.weakness || DAMAGE_TYPES[e.weakness]),
);
ok('匍匐的影子弱斩击', ENEMIES.crawler.weakness === 'slash');
ok('指挥棒是奥术武器', WEAPONS.baton.damageType === 'arcane' && WEAPONS.baton.type === 'weapon');

s.equipment.weapon = 'keychain';
s.hp = 15;
s.san = 20;
s.cards = [];
s.talents = [];
const weakCombat = new Combat(game, 'crawler');
const weakDamage = weakCombat.damageOf({ id: 'swing', hits: [3] });
const toughCombat = new Combat(game, 'doll');
const normalDamage = toughCombat.damageOf({ id: 'swing', hits: [3] });
ok('弱点武器 +1 伤害', weakDamage === normalDamage + 1, `${weakDamage} vs ${normalDamage}`);

const buffCombat = new Combat(game, 'crawler');
const chainAction = buffCombat.actions.find((action) => action.id === 'chain');
const hpBeforeChain = buffCombat.enemyHp;
const logBeforeChain = buffCombat.log.length;
buffCombat.playerAct(chainAction, chainAction.cost);
ok('甩链不造成伤害', buffCombat.enemyHp === hpBeforeChain, `HP=${buffCombat.enemyHp}`);
ok('甩链提供 +10% 命中', buffCombat.buffs.hitBonus === 10, `hitBonus=${buffCombat.buffs.hitBonus}`);
const chainLog = buffCombat.log.slice(logBeforeChain).map((entry) => entry.text).join(' ');
ok('甩链不写命中/落空结算', !/落空|造成 .*伤害/.test(chainLog), chainLog);

s.hp = 15;
const enemyCombat = new Combat(game, 'crawler');
enemyCombat.enemyAct();
ok('敌人攻击会扣 HP', s.hp < 15, `HP=${s.hp}`);

ok('事件日志有记录', s.log.length > 0, `${s.log.length} 条`);
ok('日志保留最近 100 条可读', s.log.slice(-100).length <= 100);
ok('日志记录 HP 变化', s.log.some((entry) => entry.kind === 'damage' && entry.text.includes('HP')));

// 11) 命中成长与通用技能
s.level = 1;
const levelCombat = new Combat(game, 'crawler');
ok('等级每级只加 1% 命中', levelCombat.hitBreakdown.level === 1, `level=${levelCombat.hitBreakdown.level}`);
const aimSkill = levelCombat.actions.find((action) => action.id === 'aim');
ok('通用技能「准备动作」40t', Boolean(aimSkill) && aimSkill.cost === 40 && aimSkill.sureHit === true);
levelCombat.playerAct(aimSkill, 40);
const sure = levelCombat.rollHit();
ok('准备动作后下一击必中', sure.hit === true && sure.chance === 100 && levelCombat.sureHit === false);

// 12) 图鉴解锁
ok('新游戏已解锁初始武器', game.codexHas('weapons', 'keychain'));
ok('新游戏已解锁初始饰品', game.codexHas('trinkets', 'hairband'));
ok('新游戏已解锁初始专长', game.codexHas('talents', 'courage'));
ok('图鉴默认未记录未见过的敌人', game.codexHas('enemies', 'matron') === false);
game.startCombat('doll');
ok('遭遇敌人后进入图鉴', game.codexHas('enemies', 'doll'));
game.combat = null;
const codexWeaponCount = game.codexCount('weapons');
game.unlockCodex('weapons', 'baton');
ok('解锁装备后图鉴计数增加', game.codexCount('weapons') === codexWeaponCount + 1, `${codexWeaponCount} -> ${game.codexCount('weapons')}`);
game.newGame();
ok('图鉴跨周目保留', game.codexHas('weapons', 'baton') && game.codexHas('enemies', 'doll'));
const reopened = new Game();
ok('图鉴写入本地存储并在新实例读取', reopened.codexHas('weapons', 'baton') && reopened.codexHas('enemies', 'doll'));
const { App } = await import('../src/ui/app.js');
const appRoot = document.createElement('div');
const app = new App(appRoot);
app.openPanel('codex');
ok('标题界面也能打开图鉴', app.ui.panel === 'codex');
app.setCodexTab('weapons');
ok('图鉴分类可切换', app.ui.codexTab === 'weapons' && app.ui.panel === 'codex');
app.closePanel();

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
