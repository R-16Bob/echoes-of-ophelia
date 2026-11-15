// 入口。

import { App } from './ui/app.js';
import { PROLOGUE } from './data/story.js';
import { applyPreview } from './dev/preview.js';

const root = document.querySelector('#app');

if (root) {
  const app = new App(root);
  window.__ALICE__ = app;
  applyPreview(app);

  window.addEventListener('keydown', (event) => {
    const game = app.game;
    if (event.key === 'l' || event.key === 'L') {
      if (app.ui.panel || game.modals.length) return;
      app.toggleLog();
      event.preventDefault();
      return;
    }
    if (event.key === 'Escape' && app.logOpen) {
      app.toggleLog();
      event.preventDefault();
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (game.modals.length) return;
    if (app.ui.panel) return;
    const target = event.target;
    if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }
    if (game.screen === 'title') {
      game.newGame();
      event.preventDefault();
    } else if (game.screen === 'prologue') {
      if (game.page >= PROLOGUE.pages.length - 1) game.startGame();
      else game.advancePrologue();
      event.preventDefault();
    }
  });
}
