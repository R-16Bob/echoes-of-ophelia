// 安全屋商店。
// kind: 'goods' 直接购买 → 进入背包；'service' 立即生效。
// 商店库存每次进入安全屋随机抽取 5 件；已拥有的装备 / 关键物品不会出现在货架上。

export const SHOP_GOODS = [
  { id: 'bandage', kind: 'goods', price: 3, weight: 3 },
  { id: 'sedative', kind: 'goods', price: 5, weight: 2 },
  { id: 'candy', kind: 'goods', price: 2, weight: 2 },
  { id: 'charm', kind: 'goods', price: 9, weight: 2 },
  { id: 'bell', kind: 'goods', price: 7, weight: 1 },
  { id: 'pin', kind: 'goods', price: 6, weight: 1 },
  { id: 'ring', kind: 'goods', price: 8, weight: 1 },
  { id: 'coat', kind: 'goods', price: 7, weight: 2 },
  { id: 'raincoat', kind: 'goods', price: 7, weight: 2 },
  { id: 'scissors', kind: 'goods', price: 9, weight: 2 },
  { id: 'pipe', kind: 'goods', price: 10, weight: 1 },
  { id: 'baton', kind: 'goods', price: 10, weight: 1 },
  {
    id: 'thermos_refill',
    kind: 'service',
    price: 2,
    weight: 3,
    label: '补充保温杯',
    desc: '把保温杯重新灌满。使用次数恢复至 3。',
  },
  {
    id: 'rest',
    kind: 'service',
    price: 6,
    weight: 2,
    label: '多睡一会儿',
    desc: '在角落的行军床上多躺十分钟。回复 6 HP 与 8 SAN。',
  },
  {
    id: 'therapy',
    kind: 'service',
    price: 6,
    weight: 2,
    label: '心理咨询',
    desc: '校工听你说完，然后从抽屉里拿走一张卡。移除一张疯狂卡。',
  },
];

/** 重复获得同一件物品时，折算成商品价格的四成硬币。 */
export function compensationFor(id) {
  const meta = SHOP_GOODS.find((g) => g.id === id);
  if (!meta) return 2;
  return Math.max(1, Math.round(meta.price * 0.4));
}

export const SHOP_GREETING =
  '「又见面了。」校工把提灯往桌上挪了挪。他戴着鸟嘴面具，声音闷在面具深处，听起来像旧收音机。' +
  '「货不多。这一带的东西都被搬得差不多了。」';

export const SAFE_ROOM_INTRO =
  '爱丽丝推开器材室的门，反手把链条缠在门把上。体操垫堆在墙角，提灯的光把货架照成一片暖黄色。' +
  '至少在这里，走廊的脚步声停在了门外。';

/**
 * @param {object} rng
 * @param {number} count
 * @param {(id:string)=>boolean} [exclude] 返回 true 的商品不会出现在货架上
 */
export function rollStock(rng, count = 5, exclude = null) {
  // 「多睡一会儿」「心理咨询」由安全屋的固定按钮提供，不再占货架位置。
  const fixedServices = ['rest', 'therapy'];
  const pool = SHOP_GOODS.filter(
    (entry) => !fixedServices.includes(entry.id) && !(exclude && exclude(entry.id)),
  );
  return rng
    .shuffle(pool)
    .slice(0, count)
    .map((entry) => ({
      ...entry,
      sold: false,
      stock: 1,
    }));
}
