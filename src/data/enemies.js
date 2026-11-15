// 敌人。
// pattern 按回合循环，type = hp（打体力）| san（打理智）。
// pow 会直接削减玩家的命中率。
// weakness 会与武器 damageType 比对，命中弱点时每段伤害 +1。

export const ENEMIES = {
  crawler: {
    id: 'crawler',
    name: '匍匐的影子',
    en: 'CRAWLING SHADE',
    art: 'enemy_crawler',
    maxHp: 26,
    pow: 2,
    weakness: 'slash',
    xp: 24,
    coins: 6,
    intro: '有什么东西从走廊尽头爬过来。它的四肢像被折断了又重新接上，膝盖朝着错误的方向。',
    defeat: '它散成一摊影子，被地板缝吸了回去。远处传来椅子挪动的声音。',
    pattern: [
      { type: 'hp', dmg: 3, text: '它猛地弹起，指甲抓过爱丽丝的小腿。' },
      { type: 'san', dmg: 1, text: '它抬起头。那张脸上什么都没有，可它分明在笑。' },
    ],
    drop: { id: 'bandage', chance: 0.55 },
  },
  doll: {
    id: 'doll',
    name: '哭泣的人偶',
    en: 'WEEPING DOLL',
    art: 'enemy_doll',
    maxHp: 24,
    pow: 1,
    weakness: 'pierce',
    xp: 20,
    coins: 9,
    intro: '人偶坐在翻倒的合唱椅上。它的纽扣眼睛转向爱丽丝，然后开始哭。',
    defeat: '人偶的头滚到墙角，哭声却还在继续。也许是从别的什么地方传来的。',
    pattern: [
      { type: 'san', dmg: 2, text: '它哭得更响了，声音从爱丽丝自己的喉咙里传出来。' },
      { type: 'hp', dmg: 2, text: '它的手指突然变长，勾住了爱丽丝的衣角。' },
    ],
    drop: { id: 'candy', chance: 0.7 },
  },
  gatekeeper: {
    id: 'gatekeeper',
    name: '门房留下的东西',
    en: 'THE GATEKEEPER',
    art: 'enemy_crawler',
    maxHp: 32,
    pow: 3,
    weakness: 'blunt',
    xp: 34,
    coins: 12,
    boss: true,
    intro: '传达室的门从里面被撞开了。一团穿着制服的东西挤出来，帽檐下面没有脸，只有一排很整齐的牙。',
    defeat: '制服塌在地上，像被抽走了身体。帽子里滚出一枚生锈的校徽。',
    pattern: [
      { type: 'hp', dmg: 4, text: '它用整个身体的重量撞过来，爱丽丝的后背撞上了铁门。' },
      { type: 'san', dmg: 2, text: '帽檐下传来一串名字，念到「爱丽丝」的时候停了停。' },
      { type: 'hp', dmg: 3, text: '它的手伸进传达室的窗子，抽出一根铁条。' },
      { type: 'san', dmg: 2, text: '它把那枚校徽按在玻璃上，玻璃内侧开始渗水。' },
    ],
    drop: { id: 'bandage', chance: 1 },
  },
  matron: {
    id: 'matron',
    name: '舍监的影子',
    en: 'THE MATRON',
    art: 'enemy_doll',
    maxHp: 36,
    pow: 4,
    weakness: 'pierce',
    xp: 40,
    coins: 15,
    boss: true,
    intro: '帘子后面站着一个很高的女人。她的脸被一层旧纱布缠住，手里握着一串钥匙，钥匙上还挂着名字牌。',
    defeat: '她的身体像被抽掉骨架一样垮下去，钥匙串落在地板上，响了一声很长很长的回音。',
    pattern: [
      { type: 'san', dmg: 2, text: '她摇铃。铃声从爱丽丝的耳道一直钻进后脑。' },
      { type: 'hp', dmg: 4, text: '她抓住爱丽丝的头发，把她的额头按在办公桌的边角上。' },
      { type: 'san', dmg: 2, text: '她开始念名单上的名字，每念一个，灯就暗一点。' },
      { type: 'hp', dmg: 3, text: '她手里的钥匙串抽在爱丽丝的手臂上，像一条金属的鞭子。' },
    ],
    drop: { id: 'sedative', chance: 1 },
  },
  chorus: {
    id: 'chorus',
    name: '无面的合唱团',
    en: 'FACELESS CHOIR',
    art: 'enemy_chorus',
    maxHp: 64,
    pow: 3,
    weakness: 'arcane',
    xp: 56,
    coins: 22,
    boss: true,
    intro: '舞台上的幕布自己拉开了。几个穿校服的影子并排站着，嘴的位置裂成一道竖直的黑。它们开始唱一首爱丽丝从未听过的校歌。',
    defeat: '合唱停了。最后一个影子弯下腰，像在鞠躬，也像在指路。',
    pattern: [
      { type: 'hp', dmg: 3, text: '声浪压过来，爱丽丝的耳朵里流下温热的液体。' },
      { type: 'san', dmg: 2, text: '它们唱到爱丽丝的名字那一小节。' },
      { type: 'hp', dmg: 4, text: '一只手从舞台边缘伸出来，抓住了她的脚踝。' },
      { type: 'san', dmg: 2, text: '其中一个影子转过头，用奥菲莉亚的声音说了句「你迟到了」。' },
    ],
    drop: { id: 'sedative', chance: 1 },
  },
};

export function getEnemy(id) {
  const enemy = ENEMIES[id];
  if (!enemy) throw new Error(`未知敌人：${id}`);
  return enemy;
}
