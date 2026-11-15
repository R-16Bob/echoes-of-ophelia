// 临时平衡探针：跑若干局，统计死因与进度。
import './dom-shim.mjs';
import { installDom } from './dom-shim.mjs';
installDom();

const { App } = await import('../src/ui/app.js');

const rounds = Number(process.argv[2] || 20);
const rows = [];

for (let i = 0; i < rounds; i += 1) {
  const root = globalThis.document.createElement('div');
  const app = new App(root);
  const game = app.game;
  game.newGame();
  game.startGame();
  let steps = 0;
  while (steps < 4000 && game.screen !== 'ending' && game.screen !== 'gameover') {
    steps += 1;
    const screen = game.screen;
    if (screen === 'map') {
      const open = ['gate', 'hall', 'music'].find((id) => game.areaStatus(id) === 'open');
      if (!open) break;
      game.enterArea(open);
    } else if (screen === 'explore') {
      game.explore();
    } else if (screen === 'event') {
      const choices = game.event.event.choices;
      const idx = choices.findIndex((c, j) => game.choiceAvailable(c).ok);
      game.chooseChoice(idx < 0 ? 0 : idx);
    } else if (screen === 'outcome') {
      game.continueOutcome();
    } else if (screen === 'combat') {
      const c = game.combat;
      if (c.finished) {
        game.finishCombat();
      } else {
        if (!c.queue.length) game.combatAdd(game.weapon().basic);
        game.combatExecute();
      }
    } else if (screen === 'safe') {
      game.leaveSafeRoom();
    } else break;
  }
  rows.push({
    result: game.screen === 'ending' ? 'ending' : game.screen === 'gameover' ? `dead:${game.dead}` : 'stuck',
    steps,
    level: game.state.level,
    area: game.state.currentArea,
    progress: game.state.currentArea ? game.state.areas[game.state.currentArea].progress : 0,
    cards: game.state.cards.length,
    xp: game.state.xp,
  });
}

const tally = {};
for (const row of rows) tally[row.result] = (tally[row.result] || 0) + 1;
console.log(tally);
console.log(rows.map((r) => `${r.result} L${r.level} ${r.area}@${r.progress}% steps=${r.steps} cards=${r.cards}`).join('\n'));
