// 插画位登记表。
// 先由占位图填充；替换真实图片时只改这里，或直接把同名文件覆盖到 assets/images/。
export const ART = {
  title_bg: 'assets/images/title_bg.svg',
  alice: 'assets/images/alice.svg',
  gate: 'assets/images/gate.svg',
  hall: 'assets/images/hall.svg',
  music: 'assets/images/music.svg',
  saferoom: 'assets/images/saferoom.svg',
  event_default: 'assets/images/event_default.svg',
  enemy_crawler: 'assets/images/enemy_crawler.svg',
  enemy_doll: 'assets/images/enemy_doll.svg',
  enemy_chorus: 'assets/images/enemy_chorus.svg',
  card_madness: 'assets/images/card_madness.svg',
  card_virtue: 'assets/images/card_virtue.svg',
};

export function artOf(key) {
  return ART[key] || ART.event_default;
}
