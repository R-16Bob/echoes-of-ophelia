// 角色初始数据。
// 注意：面板上的 CHR 8 = 基础 7 + 学生制服 +1；SAN 20 为初始理智，
// 发带使「理智上限」变为 25，但不会把当前理智补满。

export const ALICE = {
  id: 'alice',
  name: '爱丽丝',
  en: 'ALICE',
  title: '寻找朋友的小女孩',
  portrait: 'alice',

  baseMaxHp: 15,
  baseMaxSan: 20,
  hp: 15,
  san: 20,

  attrs: { str: 5, dex: 7, per: 7, knw: 6, chr: 7, luk: 6 },

  equipment: {
    weapon: 'keychain',
    outfit: 'uniform',
    trinkets: ['hairband'],
  },

  inventory: [
    { id: 'thermos', uses: 3 },
  ],

  talents: ['courage'],

  bio: '十二岁。私立圣艾格尼丝学园的转学生。奥菲莉亚是她在这里认识的第一个朋友，也是唯一一个。',
};
