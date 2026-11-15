// 学校区域。
// 每次探索 +10% 探索度，并且抽一张事件卡；
// 探索度到达 50% / 90% 时会进入安全屋（两次），100% 触发该区域固定剧情。

export const AREA_STEP = 10;

/** 每个区域内的两次安全屋节点（百分比） */
export const SAFE_STOPS = [50, 90];

/**
 * 当前探索度之后的下一个节点（给地图/探索页显示用）。
 * @returns {{ at:number, kind:'safe'|'fixed' }}
 */
export function nextStop(progress, safeVisited = []) {
  const stop = SAFE_STOPS.find((value) => progress <= value && !safeVisited.includes(value));
  if (stop !== undefined) return { at: stop, kind: 'safe' };
  return { at: 100, kind: 'fixed' };
}

/**
 * 这次探索是否跨过了一个尚未访问的安全屋。
 * 与 nextStop 不同：它看的是「已经越过的线」，所以 47% → 55% 也会触发 50% 的安全屋。
 * @returns {{ at:number, kind:'safe'|'fixed' } | null}
 */
export function passedStop(progress, safeVisited = []) {
  if (progress >= 100) return { at: 100, kind: 'fixed' };
  const stop = SAFE_STOPS.find((value) => progress >= value && !safeVisited.includes(value));
  return stop === undefined ? null : { at: stop, kind: 'safe' };
}

export const AREAS = {
  gate: {
    id: 'gate',
    order: 1,
    name: '校门·前庭',
    en: 'THE GATE',
    art: 'gate',
    desc: '锈死的铁门，碎掉的传达室窗户，一条被雾吞掉的甬道。奥菲莉亚最后的消息就是从这里发出来的。',
    intro: '夜风穿过铁栅栏，声音像有人在很远的地方吹口哨。',
    unlock: null,
    events: [
      'gate_scratch',
      'gate_swing',
      'gate_booth',
      'gate_crow',
      'gate_puddle',
      'gate_bell',
      'gate_bus',
      'gate_photo',
    ],
    fixedEvent: 'gate_final',
    fixedHint: '传达室的灯亮着',
  },
  hall: {
    id: 'hall',
    order: 2,
    name: '教学楼·一层走廊',
    en: 'FIRST FLOOR',
    art: 'hall',
    desc: '长得不合常理的走廊。两侧的教室门都关着，只有尽头那一扇开着一条缝。',
    intro: '日光灯管每隔三秒闪一次。每次亮起，走廊看起来都更窄一点。',
    unlock: { area: 'gate', hint: '完成「校门·前庭」的剧情事件' },
    events: [
      'hall_phone',
      'hall_mirror',
      'hall_classroom',
      'hall_steps',
      'hall_locker',
      'hall_locker13',
      'hall_mirror_slow',
      'hall_stairs',
    ],
    fixedEvent: 'hall_final',
    fixedHint: '教务处的门虚掩着',
  },
  music: {
    id: 'music',
    order: 3,
    name: '音乐教室',
    en: 'MUSIC ROOM',
    art: 'music',
    desc: '琴房和排练厅挤在一起。空气里有松香、灰尘，还有一点点铁锈味。',
    intro: '有钢琴声。断断续续，像是有人在一个键一个键地试着按。',
    unlock: { area: 'hall', hint: '取得「旧校徽钥匙」' },
    events: [
      'music_piano',
      'music_chairs',
      'music_photo',
      'music_curtain',
      'music_broadcast',
      'music_metronome',
      'music_costume',
    ],
    fixedEvent: 'music_final',
    fixedHint: '舞台的幕布后面',
  },
  roof: {
    id: 'roof',
    order: 4,
    name: '天台',
    en: 'ROOFTOP',
    art: 'hall',
    desc: '通往天台的楼梯被铁栅栏封住了。锁孔里积着雨水，栅栏上挂着一枚生锈的校徽。',
    intro: '风从楼梯间灌下来，带着雨的味道。上面有什么东西在滴水。',
    unlock: { item: 'key_old', hint: '需要「旧校徽钥匙」' },
    comingSoon: true,
    events: [],
    fixedEvent: null,
  },
};

export const AREA_ORDER = ['gate', 'hall', 'music', 'roof'];

export function getArea(id) {
  const area = AREAS[id];
  if (!area) throw new Error(`未知区域：${id}`);
  return area;
}
