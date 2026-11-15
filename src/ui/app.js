// 应用外壳：把 Game 的状态映射成界面。

import { clear } from './dom.js';
import { Game } from '../game/game.js';
import { titleScreen, prologueScreen, rulesScreen, creditsScreen } from './screens/meta.js';
import { mapScreen, exploreScreen } from './screens/map.js';
import { eventScreen, outcomeScreen } from './screens/event.js';
import { combatScreen } from './screens/combat.js';
import { safeScreen } from './screens/safe.js';
import { gameOverScreen, endingScreen } from './screens/end.js';
import { panelFor } from './screens/panel.js';
import { modalsOverlay } from './modals.js';
import { logDrawer, logToggle, showLog } from './log.js';

const PANELS = new Set(['character', 'inventory', 'skills', 'codex', 'clues', 'settings']);

export class App {
  constructor(root) {
    this.root = root;
    this.game = new Game();
    this.ui = { panel: null, selectedArea: null, therapy: false, codexTab: 'enemies' };
    this.logOpen = false;
    this.game.subscribe(() => this.render());
    this.render();
  }

  toggleLog() {
    this.logOpen = !this.logOpen;
    this.render();
  }

  selectArea(areaId) {
    this.ui.selectedArea = areaId;
    this.render();
  }

  openPanel(panelId) {
    this.ui.panel = panelId;
    this.render();
  }

  closePanel() {
    this.ui.panel = null;
    this.render();
  }

  setCodexTab(tabId) {
    this.ui.codexTab = tabId;
    this.ui.panel = 'codex';
    this.render();
  }

  baseScreen() {
    const game = this.game;
    switch (game.screen) {
      case 'title':
        return titleScreen(game, this);
      case 'prologue':
        return prologueScreen(game, this);
      case 'map':
        return mapScreen(game, this);
      case 'explore':
        return exploreScreen(game, this);
      case 'event':
        return eventScreen(game, this);
      case 'outcome':
        return outcomeScreen(game, this);
      case 'combat':
        return combatScreen(game, this);
      case 'safe':
        return safeScreen(game, this);
      case 'gameover':
        return gameOverScreen(game, this);
      case 'ending':
        return endingScreen(game, this);
      default:
        return titleScreen(game, this);
    }
  }

  render() {
    const game = this.game;
    if (game.screen !== 'safe') this.ui.therapy = false;
    clear(this.root);

    if (this.ui.panel === 'rules') {
      this.root.append(rulesScreen(game, this));
      return;
    }
    if (this.ui.panel === 'credits') {
      this.root.append(creditsScreen(game, this));
      return;
    }

    this.root.append(this.baseScreen());

    if (showLog(game)) {
      this.root.append(logToggle(game, this));
      if (this.logOpen) this.root.append(logDrawer(game, this));
    }

    if (PANELS.has(this.ui.panel)) {
      const overlay = panelFor(game, this, this.ui.panel);
      if (overlay) {
        overlay.classList.add('overlay');
        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) this.closePanel();
        });
        this.root.append(overlay);
      }
    }

    const modals = modalsOverlay(game);
    if (modals) this.root.append(modals);
  }
}
