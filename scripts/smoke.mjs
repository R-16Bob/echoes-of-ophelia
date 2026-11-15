// 冒烟测试：在 Node 里用垫片 DOM 跑完整流程，顺便当作自动试玩。
// 用法：node scripts/smoke.mjs [轮数]

import { installDom } from './dom-shim.mjs';

installDom();

const { App } = await import('../src/ui/app.js');

const ROUNDS = Number(process.argv[2] || 12);
const MAX_STEPS = 6000;

const report = {
  ending: 0,
  gameover: 0,
  error: 0,
  stuck: 0,
  steps: [],
  screens: new Set(),
  modals: new Set(),
  ui: new Set(),
};

function exerciseUi(app) {
  const game = app.game;
  game.addClue({ id: 'test_clue', title: '测试线索', text: '走廊尽头有一扇不该存在的门。' });
  for (const id of ['character', 'inventory', 'skills', 'codex', 'clues', 'settings']) {
    app.openPanel(id);
    report.ui.add(`panel:${id}`);
    if (id === 'codex') {
      for (const tab of ['enemies', 'weapons', 'items', 'talents', 'madness', 'virtue']) app.setCodexTab(tab);
    }
    app.closePanel();
  }
  app.toggleLog();
  report.ui.add('log');
  app.toggleLog();
  game.addXp(100);
  if (game.modals.length) {
    report.modals.add(game.modals[0].type);
    resolveModals(game);
  }
  game.changeSan(-8);
  if (game.modals.length) {
    report.modals.add(game.modals[0].type);
    resolveModals(game);
  }
}

function resolveModals(game) {
  let guard = 0;
  while (game.modals.length && guard++ < 30) {
    const modal = game.modals[0];
    if (modal.type === 'levelup') {
      if (modal.step === 'talent') game.pickTalent(modal.options[0].id);
      else game.pickAttr('per');
    } else {
      game.dismissModal();
    }
  }
}

function pickChoice(game) {
  const choices = game.event.event.choices;
  const available = choices
    .map((choice, index) => ({ choice, index }))
    .filter(({ choice }) => game.choiceAvailable(choice).ok);
  if (!available.length) return 0;
  return available[Math.floor(game.rng.next() * available.length)].index;
}

function solveCombat(game) {
  let turns = 0;
  while (game.combat && !game.combat.finished && turns++ < 60) {
    const combat = game.combat;
    if (game.state.hp < 8) game.combatUseItem('thermos');
    if (game.state.san < 8) {
      const calm = game.usableItems().find((entry) => entry.def.san);
      if (calm) game.combatUseItem(calm.entry.id);
    }
    let guard = 0;
    while (guard++ < 12) {
      const affordable = combat.actions.filter((action) => action.cost <= combat.timeLeft);
      if (!affordable.length) break;
      const pick = affordable
        .filter((action) => action.kind !== 'buff')
        .sort((a, b) => b.damage - a.damage)[0] || affordable[0];
      game.combatAdd(pick.id);
    }
    if (!game.combat.queue.length) break;
    game.combatExecute();
  }
  if (game.combat && game.combat.finished) game.finishCombat();
}

function playOnce(index) {
  const root = document.createElement('div');
  const app = new App(root);
  const game = app.game;

  game.newGame();
  let steps = 0;
  let uiDone = false;
  const seen = new Set();
  while (steps++ < MAX_STEPS) {
    seen.add(game.screen);
    report.screens.add(game.screen);
    resolveModals(game);
    if (game.screen !== 'combat' && game.state.san <= 9) {
      const calm = game.usableItems().find((entry) => entry.def.san);
      if (calm) game.useItem(calm.entry.id);
    }
    if (game.screen !== 'combat' && game.state.hp <= 7) {
      const heal = game.usableItems().find((entry) => entry.def.heal);
      if (heal) game.useItem(heal.entry.id);
    }
    if (game.screen === 'map' && !uiDone) {
      uiDone = true;
      exerciseUi(app);
    }

    if (game.screen === 'ending') {
      report.ending += 1;
      return { result: 'ending', steps, seen };
    }
    if (game.screen === 'gameover') {
      report.gameover += 1;
      return {
        result: 'gameover',
        steps,
        seen,
        detail: `dead=${game.dead} area=${game.state.currentArea} hp=${game.state.hp} san=${game.state.san} lv=${game.state.level} coins=${game.state.coins}`,
      };
    }

    switch (game.screen) {
      case 'title':
        game.newGame();
        break;
      case 'prologue':
        if (game.page >= 3) game.startGame();
        else game.advancePrologue();
        break;
      case 'map': {
        const next = ['gate', 'hall', 'music', 'roof'].find(
          (id) => game.areaStatus(id) === 'open' && !game.state.areas[id].cleared,
        );
        if (!next) {
          report.stuck += 1;
          return { result: 'stuck', steps, seen, detail: `map no-open area=${['gate', 'hall', 'music', 'roof'].map((id) => `${id}:${game.areaStatus(id)}`).join(' ')}` };
        }
        game.enterArea(next);
        break;
      }
      case 'explore':
        game.explore();
        break;
      case 'event':
        game.chooseChoice(pickChoice(game));
        break;
      case 'outcome':
        game.continueOutcome();
        break;
      case 'combat':
        solveCombat(game);
        break;
      case 'safe': {
        const stock = game.safe ? game.safe.stock : [];
        const affordable = stock.filter((goods) => !goods.sold && game.state.coins >= goods.price);
        if (affordable.length && game.rng.chance(0.7)) {
          game.buy(affordable[Math.floor(game.rng.next() * affordable.length)].id);
        }
        if (game.state.hp < game.maxHp - 3) game.buy('rest');
        for (const item of game.usableItems()) {
          if (game.state.hp < game.maxHp) game.useItem(item.entry.id);
        }
        for (const equip of game.equipableItems()) {
          game.equipItem(equip.entry.id);
        }
        game.leaveSafeRoom();
        break;
      }
      default:
        throw new Error(`未知界面 ${game.screen}`);
    }
  }
  report.stuck += 1;
  return { result: 'stuck', steps, seen, detail: `${game.screen} combat=${game.combat ? `${game.combat.finished}/${game.combat.victory}/${game.combat.timeLeft}/${game.combat.queue.length}` : 'null'}` };
}

for (let i = 0; i < ROUNDS; i += 1) {
  try {
    const out = playOnce(i);
    report.steps.push(out.steps);
    console.log(
      `#${String(i + 1).padStart(2, '0')} ${out.result.padEnd(8)} steps=${String(out.steps).padStart(4)} ` +
        `screens=${[...out.seen].join(',')}${out.detail ? `  [${out.detail}]` : ''}`,
    );
  } catch (error) {
    report.error += 1;
    console.error(`#${String(i + 1).padStart(2, '0')} ERROR`, error);
  }
}

console.log('\n=== 汇总 ===');
console.log(`到达结局 ${report.ending} · 中途失败 ${report.gameover} · 卡住 ${report.stuck} · 异常 ${report.error}`);
console.log(`覆盖界面：${[...report.screens].sort().join(', ')}`);
console.log(`覆盖浮层：${[...report.ui, ...report.modals].sort().join(', ')}`);
if (report.steps.length) {
  const avg = Math.round(report.steps.reduce((a, b) => a + b, 0) / report.steps.length);
  console.log(`平均步数 ${avg}`);
}

if (report.error > 0 || report.stuck > 0) process.exitCode = 1;
