// 可存档的伪随机数发生器（mulberry32）
// 存档时只需保存 `s`，读档后随机序列可以原样继续。

export function randomSeed() {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

export class Rng {
  constructor(seed) {
    this.s = (Number(seed) >>> 0) || 1;
  }

  /** [0, 1) */
  next() {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** 闭区间整数 [min, max] */
  int(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(this.next() * (hi - lo + 1)) + lo;
  }

  /** 掷一个 n 面骰 */
  d(n) {
    return this.int(1, n);
  }

  chance(p) {
    return this.next() < p;
  }

  pick(list) {
    if (!list || list.length === 0) return undefined;
    return list[this.int(0, list.length - 1)];
  }

  /** 按 weight 字段加权抽取 */
  weighted(list) {
    const total = list.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    if (total <= 0) return list[0];
    let roll = this.next() * total;
    for (const item of list) {
      roll -= item.weight ?? 1;
      if (roll < 0) return item;
    }
    return list[list.length - 1];
  }

  /** 返回打乱后的新数组 */
  shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  sample(list, n) {
    return this.shuffle(list).slice(0, n);
  }

  save() {
    return this.s;
  }
}
