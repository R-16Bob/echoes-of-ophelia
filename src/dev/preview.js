// 开发预览：通过 ?dev=xxx 直接跳到某个界面，方便截图与调 UI。
// 正式游玩不带这个参数，不会触发。

export const PREVIEW_VIEWS = [
  'title',
  'prologue',
  'map',
  'explore',
  'event',
  'outcome',
  'combat',
  'safe',
  'gameover',
  'ending',
  'character',
  'inventory',
  'skills',
  'codex',
  'clues',
  'levelup',
  'card',
  'settings',
  'log',
];

export function applyPreview(app) {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const view = params.get('dev');
  if (!view || !PREVIEW_VIEWS.includes(view)) return false;

  const game = app.game;
  if (params.get('tips') === '1' && typeof document !== 'undefined') {
    document.body.classList.add('show-tips');
  }
  if (view === 'title') return true;

  game.newGame();

  if (view === 'prologue') {
    game.page = Number(params.get('page') || 0);
    return true;
  }

  game.startGame();
  if (params.get('rolls') === '0') {
    game.settings.showRolls = false;
  }

  switch (view) {
    case 'map':
      if (params.has('san')) game.changeSan(-Math.max(1, Number(params.get('san')) || 3));
      break;
    case 'explore':
      game.enterArea('gate');
      game.areaRuntime.progress = 50;
      game.areaRuntime.safeVisited = [50];
      break;
    case 'event':
      game.enterArea('gate');
      game.openEvent(params.get('id') || 'gate_scratch');
      break;
    case 'outcome':
      game.enterArea('gate');
      game.openEvent(params.get('id') || 'gate_scratch');
      game.chooseChoice(0);
      break;
    case 'combat': {
      game.startCombat(params.get('enemy') || 'crawler', {});
      const combat = game.combat;
      if (combat && !params.has('empty')) {
        combat.addAction(combat.actions[0].id);
        combat.addAction(combat.actions[1] ? combat.actions[1].id : combat.actions[0].id);
        combat.addAction(combat.actions[0].id);
      }
      break;
    }
    case 'safe':
      game.enterArea('gate');
      game.areaRuntime.progress = 50;
      if (params.has('therapy')) game.state.cards.push({ id: 'hallucination', kind: 'madness' });
      game.enterSafeRoom();
      if (params.has('therapy')) app.ui.therapy = true;
      break;
    case 'gameover':
      game.changeHp(-99);
      break;
    case 'ending':
      game.finishDemo();
      break;
    case 'character':
    case 'inventory':
    case 'skills':
    case 'codex':
    case 'clues':
      if (view === 'character') {
        game.state.cards.push({ id: 'hallucination', kind: 'madness' });
      }
      if (view === 'clues') {
        game.state.clues.push(
          { id: 'c_marks', title: '铁门上的刻痕', text: '七道身高刻痕，最后一道是今年春天。旁边刻着 O＋A。' },
          { id: 'c_locker_note', title: '储物柜里的便条', text: '「去音乐教室。别相信穿校服的人。」字迹是奥菲莉亚的，写得很急。' },
          { id: 'c_photo_back', title: '照片背面', text: '照片背面是奥菲莉亚的字：「等我们长大，就一起离开这里。」' },
        );
      }
      if (view === 'inventory') {
        ['bandage', 'sedative', 'pin', 'charm', 'key_old', 'scissors'].forEach((id) => game.addItem(id));
      }
      if (view === 'codex') {
        game.unlockCodex('enemies', 'crawler');
        game.unlockCodex('enemies', 'chorus');
        game.unlockCodex('weapons', 'scissors');
        game.unlockCodex('weapons', 'baton');
        game.unlockCodex('items', 'bandage');
        game.unlockCodex('talents', 'focused');
        game.unlockCodex('madness', 'hallucination');
        game.unlockCodex('virtue', 'warmth');
      }
      if (view === 'codex') app.ui.codexTab = params.get('tab') || 'enemies';
      app.openPanel(view);
      break;
    case 'settings':
      game.settings.showRolls = params.get('rolls') !== '0';
      app.openPanel('settings');
      break;
    case 'levelup':
      game.addXp(100);
      break;
    case 'card':
      game.changeSan(-8);
      break;
    case 'log': {
      const samples = [
        ['explore', '探索 校门·前庭 → 50%'],
        ['event', '事件「铁门上的划痕」'],
        ['choice', '选择「蹲下来，仔细辨认那些刻痕」'],
        ['check', '检定 感知 成功（1d12=3 / ≤7）'],
        ['xp', 'XP +3（3 / 100）'],
        ['damage', 'SAN -2（18 / 25）'],
        ['combat', '遭遇「匍匐的影子」（弱点 斩击）'],
        ['combat', '挥打 → 匍匐的影子 4 伤害，弱点加成 +1'],
        ['damage', '匍匐的影子 → HP -3'],
        ['item', '获得「干净绷带」'],
        ['coin', '硬币 +6（26）'],
        ['clue', '线索「铁门上的刻痕」'],
        ['safe', '进入安全屋（50% · 第 1 次补给）'],
        ['shop', '购买「补充保温杯」'],
        ['level', '等级提升至 LV 2'],
        ['card', '疯狂卡「幻听」'],
      ];
      samples.forEach(([kind, text]) => game.logEvent(kind, text));
      app.logOpen = true;
      break;
    }
    default:
      return false;
  }
  if (params.get('log') === '1') app.logOpen = true;
  game.emit();
  return true;
}
