// 事件卡。
//
// 一张事件卡 = 标题 + 若干段叙述 + 2~3 个选项。
// 选项可以：
//   check    —— 属性检定（1d12 暗骰，属性值 >= 出目 + 难度修正 即通过）
//   requires —— 持有特定物品 / 专长 / 武器时免检定
//   combat   —— 进入战斗，胜利后结算 win
// 效果字段：hp / san / xp / coins / item / consume / clue / unlock / endDemo

export const EVENTS = {
  // ══════════════════════════ 校门·前庭 ══════════════════════════

  gate_scratch: {
    id: 'gate_scratch',
    title: '铁门上的划痕',
    en: 'MARKS ON THE GATE',
    art: 'gate',
    text: [
      '铁门内侧有一排很浅的划痕，从下往上，一共七道。最上面那道旁边，用更细的东西刻了两个字母：O ＋ A。',
      '奥菲莉亚的缩写，和爱丽丝的。铁锈硌着指尖，那两个字母却干净得像是今天才刻上去的。',
    ],
    choices: [
      {
        id: 'look',
        label: '蹲下来，仔细辨认那些刻痕',
        hint: '也许能看出是谁、什么时候留下的',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: ['这是量身高的刻痕，一年一道。最后那道是今年春天刻的——她长高了三厘米，还为此得意了一整天。'],
          effects: {
            xp: 10,
            clue: { id: 'c_marks', title: '铁门上的刻痕', text: '七道身高刻痕，最后一道是今年春天。旁边刻着 O＋A。' },
          },
        },
        fail: {
          text: ['雾把手电的光吃得只剩一团毛边。她凑得再近，也只看得见自己的呼吸。'],
          effects: { san: -2, xp: 3 },
        },
      },
      {
        id: 'push',
        label: '用肩膀去顶那扇铁门',
        hint: '把缝隙推得更大一点',
        check: { attr: 'str', diff: 'hard' },
        success: {
          text: ['门轴发出一声很长的叹息，缝隙大到能侧身通过。门后没有东西，只有更深的雾。'],
          effects: { xp: 8, san: -1 },
        },
        fail: {
          text: ['铁门纹丝不动。虎口被锈刺划开一道口子，血珠渗出来，很快被冷风吹干。'],
          effects: { hp: -2, xp: 3 },
        },
      },
      {
        id: 'listen',
        label: '把耳朵贴在冰冷的铁门上',
        hint: '学校里好像有声音',
        check: { attr: 'per', diff: 'easy' },
        success: {
          text: ['门的另一侧传来很轻的歌声，只有两三个音，反复地唱。爱丽丝听不出旋律，但记得这个节奏——奥菲莉亚哼歌时总是这样，把一句唱三遍。'],
          effects: { xp: 8, san: -1, clue: { id: 'c_hum', title: '铁门后的歌声', text: '门后有人在反复哼三个音，节奏和奥菲莉亚一样。' } },
        },
        fail: {
          text: ['她听见的只有自己的心跳，一下一下，撞在铁上。'],
          effects: { san: -2, xp: 2 },
        },
      },
    ],
  },

  gate_swing: {
    id: 'gate_swing',
    title: '自己晃动的秋千',
    en: 'THE SWING',
    art: 'gate',
    text: [
      '秋千在自己晃。风早就停了，铁链却发出规律的、吱呀——吱呀——的声音，像有人在数拍子。',
      '左边那个秋千的座位上，放着一颗没拆开的水果糖。',
    ],
    choices: [
      {
        id: 'take',
        label: '走过去，把那颗糖拿起来',
        check: { attr: 'per', diff: 'easy' },
        success: {
          text: ['糖纸被体温焐得有点软。秋千在她伸手的瞬间停住了，铁链绷得笔直，像是刚被人按住。'],
          effects: { item: 'candy', san: -1, xp: 6 },
        },
        fail: {
          text: ['她刚弯下腰，秋千就毫无预兆地荡了回来。铁链擦着她的耳朵呼啸而过，糖还在原地，包装纸却被人捏碎了。'],
          effects: { san: -4, xp: 3 },
        },
      },
      {
        id: 'hold',
        label: '一把抓住晃动的铁链',
        check: { attr: 'str', diff: 'normal' },
        success: {
          text: ['铁链在她手里停住。链节之间缠着一根很长的头发，颜色和奥菲莉亚的一模一样。'],
          effects: {
            xp: 8,
            clue: { id: 'c_hair', title: '链节上的头发', text: '秋千链条上缠着一根长头发，颜色和奥菲莉亚一样。' },
          },
        },
        fail: {
          text: ['链节猛地合拢，夹住了她的手掌。等她把手指抽出来，掌心已经多了一道紫红色的印子。'],
          effects: { hp: -2, xp: 3 },
        },
      },
      {
        id: 'call',
        label: '朝空荡的操场喊奥菲莉亚的名字',
        hint: '也许她会回应',
        check: { attr: 'chr', diff: 'normal' },
        success: {
          text: ['秋千停了。过了很久，操场另一头的雾里传来一声很轻的「嗯」，像是有人正含着糖，懒得张嘴。'],
          effects: { san: 2, xp: 10 },
        },
        fail: {
          text: ['只有回声。而且回声比她的喊声，多响了一次。'],
          effects: { san: -3, xp: 3 },
        },
      },
    ],
  },

  gate_booth: {
    id: 'gate_booth',
    title: '传达室',
    en: 'THE BOOTH',
    art: 'gate',
    text: [
      '传达室的窗玻璃碎了一半。里面堆满被雨泡烂的报纸，桌上的值班记录本翻开着，最后一页的字迹被水洇成一团蓝。',
      '抽屉半开着，有什么东西在里面反光。',
    ],
    choices: [
      {
        id: 'log',
        label: '翻开值班记录本',
        check: { attr: 'knw', diff: 'normal' },
        success: {
          text: ['最后一页写着今天的日期。签到栏里有一个名字：奥菲莉亚·格蕾。笔迹很新，墨水甚至还没有完全干透。'],
          effects: {
            xp: 12,
            san: -1,
            clue: { id: 'c_log', title: '今晚的签到', text: '传达室的值班记录上，今晚的签到栏写着奥菲莉亚的名字，墨迹未干。' },
          },
        },
        fail: {
          text: ['那些字在纸上缓慢地游动，像一群被惊扰的蝌蚪。爱丽丝盯久了，开始觉得纸面在呼吸。'],
          effects: { san: -2, xp: 3 },
        },
      },
      {
        id: 'drawer',
        label: '把手伸进窗口，去够那只抽屉',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['她摸到一卷干燥的绷带，还有几枚硬币。抽屉最里面有个东西碰了一下她的指尖，凉的，像牙齿。她没有再往里摸。'],
          effects: { item: 'bandage', coins: 6, xp: 6 },
        },
        fail: {
          text: ['碎玻璃在窗框上晃了一下。手背被划开一道口子，血滴在报纸上，晕开成一朵很圆的花。'],
          effects: { hp: -2, xp: 3 },
        },
      },
      {
        id: 'smash',
        label: '干脆把剩下的窗玻璃全砸了',
        check: { attr: 'str', diff: 'hard' },
        success: {
          text: ['玻璃哗啦一声全碎了。传达室里除了霉味什么都没有，只有几枚硬币滚到窗台上。'],
          effects: { coins: 8, xp: 5 },
        },
        fail: {
          text: ['整栋楼都听见了。回声在空荡的校园里滚了一圈，然后有什么东西，从教学楼的方向，朝这边走了两步。'],
          effects: { san: -3, xp: 3 },
        },
      },
    ],
  },

  gate_crow: {
    id: 'gate_crow',
    title: '门柱上的乌鸦',
    en: 'THE CROW',
    art: 'gate',
    text: [
      '一只乌鸦停在门柱上，嘴里叼着什么亮的东西。它歪着头看爱丽丝，没有飞走，也没有叫。',
      '它的眼睛黑得很干净，干净得不像活物。',
    ],
    choices: [
      {
        id: 'hand',
        label: '慢慢朝它伸出手',
        check: { attr: 'luk', diff: 'normal' },
        success: {
          text: ['乌鸦低下头，把嘴里的东西丢在她掌心里。是一枚磨得发亮的硬币，边缘刻着一行小字：圣艾格尼丝。'],
          effects: { coins: 8, xp: 6 },
        },
        fail: {
          text: ['它俯冲下来，啄在她的手背上，又落回门柱。亮东西还在它嘴里，现在沾了一点血。'],
          effects: { hp: -1, san: -2, xp: 3 },
        },
      },
      {
        id: 'stone',
        label: '捡块石子把它吓走',
        check: { attr: 'dex', diff: 'easy' },
        success: {
          text: ['石子擦着门柱飞过去。乌鸦张开翅膀，嘴里的东西掉进草丛——是一枚校徽别针，别针的尖端弯了。'],
          effects: { item: 'pin', xp: 8 },
        },
        fail: {
          text: ['石子砸在铁门上，声音震得她自己的耳朵发麻。乌鸦没动，但整片树上的黑色翅膀都张开了。'],
          effects: { san: -3, xp: 3 },
        },
      },
      {
        id: 'ignore',
        label: '绕开它，继续往里走',
        effects: { xp: 2 },
        success: { text: ['她绕开门柱。走出十几步再回头，乌鸦已经不在了，只有一枚硬币留在她刚才站过的位置。'], effects: { xp: 2, coins: 2 } },
      },
    ],
  },

  gate_puddle: {
    id: 'gate_puddle',
    title: '水洼里的倒影',
    en: 'REFLECTION',
    art: 'gate',
    text: [
      '前庭的积水里倒映着教学楼。爱丽丝数了数，倒影里的窗户比真实的少一间。',
      '水面上有一圈一圈的涟漪，可雨已经停了很久。',
    ],
    choices: [
      {
        id: 'stare',
        label: '蹲下来，盯着那片倒影',
        check: { attr: 'knw', diff: 'hard' },
        success: {
          text: ['她数清了：少的是三楼音乐教室的窗。倒影里那个位置是一片纯粹的黑，像被人从照片上剪掉了。'],
          effects: {
            xp: 14,
            san: -2,
            clue: { id: 'c_window', title: '琴房的灯', text: '水洼的倒影里，三楼音乐教室的灯亮着。奥菲莉亚最后一条消息说，她在琴房。' },
          },
        },
        fail: {
          text: ['倒影里的她缓缓抬起头，而她自己并没有动。水面下有什么东西开始往上爬。'],
          effects: { san: -4, xp: 3 },
          combat: 'crawler',
          win: { text: ['水面重新静下来。倒影里的爱丽丝垂下头，变回了她自己的脸。'], effects: { xp: 14, coins: 5 } },
        },
      },
      {
        id: 'stir',
        label: '用脚尖把水面搅散',
        effects: { san: -1, xp: 3 },
        success: { text: ['倒影碎成一片一片，又慢慢拼回去。拼好之后，那扇少掉的窗还是没有回来。'], effects: { san: -1, xp: 3 } },
      },
      {
        id: 'cross',
        label: '跳过水洼',
        check: { attr: 'dex', diff: 'easy' },
        success: {
          text: ['她轻轻落在对面，鞋底几乎没有声音。'],
          effects: { xp: 4 },
        },
        fail: {
          text: ['鞋底踩进水里的时候，有什么冰凉的东西顺着脚踝爬了上来。她甩了很久才甩掉。'],
          effects: { hp: -1, san: -2, xp: 2 },
        },
      },
    ],
  },

  gate_final: {
    id: 'gate_final',
    title: '传达室的灯亮了',
    en: 'THE LIGHT',
    art: 'gate',
    fixed: true,
    text: [
      '就在爱丽丝准备离开前庭的时候，传达室的灯亮了。',
      '一个背对着她的身影坐在窗前，正在纸上写着什么。笔尖划过纸面的声音很慢，一下，一下，像在数数。',
      '她喊了一声。身影没有回头，只是把写好的纸从窗缝里推出来，然后连人带椅子，退进了黑暗。',
      '传达室的门自己开了一条缝。里面有什么东西，正用指甲一下一下地刮着桌面。',
    ],
    choices: [
      {
        id: 'paper',
        label: '走过去，捡起那张纸',
        success: {
          text: [
            '「我在教学楼。请不要来找我。」落款是奥菲莉亚的笔迹，可墨迹还没干。',
            '纸的背面还有一行更小的字，像是写完之后又犹豫着补上的：「如果已经来了，就别回头。」',
          ],
          effects: {
            xp: 15,
            coins: 6,
            unlock: 'hall',
            clue: { id: 'c_note1', title: '传达室里的便条', text: '「她在教学楼。别一个人来。」背后补了一句：「如果已经来了，就别回头。」' },
          },
        },
      },
      {
        id: 'chase',
        label: '推开传达室的门追进去',
        check: { attr: 'chr', diff: 'hard' },
        success: {
          text: ['传达室里只有一把还在缓慢旋转的椅子。地上一串湿脚印，从后门出去，一直通向教学楼。'],
          effects: { xp: 20, unlock: 'hall', san: -1 },
        },
        fail: {
          text: ['椅子停住了。椅背上挂着一件校工制服，制服下面鼓起来，像有什么东西正慢慢站起来。'],
          effects: { xp: 6, san: -3 },
          combat: 'gatekeeper',
          win: {
            text: ['制服塌在地上。爱丽丝从它手边捡起那张纸，纸上是奥菲莉亚的字。'],
            effects: { xp: 12, unlock: 'hall' },
          },
        },
      },
      {
        id: 'sneak',
        label: '屏住呼吸，贴着墙根绕过去',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['她贴着墙根挪到传达室侧面。窗里的东西一直低着头写字，没有发现她。'],
          effects: { xp: 14, unlock: 'hall', san: -1 },
        },
        fail: {
          text: ['铁门在她脚边响了一声。窗里的东西停下笔，慢慢转过头来。'],
          effects: { xp: 5, san: -3 },
          combat: 'gatekeeper',
          win: {
            text: ['那东西没有再站起来。爱丽丝绕过它，从传达室的后窗翻了出去。'],
            effects: { xp: 10, unlock: 'hall' },
          },
        },
      },
      {
        id: 'take',
        label: '不去追，只把纸收进口袋',
        success: {
          text: ['她把纸条折好，贴着胸口放进口袋。铁门在她身后轻轻响了一声，像谁帮她关上了。'],
          effects: { xp: 12, coins: 4, unlock: 'hall', san: 1 },
        },
      },
    ],
  },

  // ══════════════════════════ 教学楼·一层走廊 ══════════════════════════

  hall_phone: {
    id: 'hall_phone',
    title: '响个不停的公用电话',
    en: 'PAYPHONE',
    art: 'hall',
    text: [
      '走廊尽头的公用电话在响。这所学校三年前就断了线，电话机上落着厚厚一层灰，可铃声很清脆，一声一声，不肯停。',
    ],
    choices: [
      {
        id: 'answer',
        label: '拿起听筒',
        check: { attr: 'knw', diff: 'normal' },
        success: {
          text: [
            '听筒里是奥菲莉亚的声音，很轻，像贴在耳边说的：「别走走廊中间。」',
            '然后是一声很长的忙音。爱丽丝低头看，自己的鞋正踩在走廊正中那条褪色的红线上。',
          ],
          effects: {
            xp: 12,
            san: -2,
            clue: { id: 'c_phone', title: '电话里的警告', text: '奥菲莉亚在电话里说：别走走廊中间。' },
          },
        },
        fail: {
          text: ['听筒里有很多人同时吸气的声音，很长，一直不停，直到她把听筒摔回原位。'],
          effects: { san: -5, xp: 3 },
        },
      },
      {
        id: 'unplug',
        label: '把电话线从墙上拽下来',
        check: { attr: 'str', diff: 'normal' },
        success: {
          text: ['铃声停了。她转身走出十几步，铃声又在身后响起来——从另一个方向。'],
          effects: { xp: 6, san: -1 },
        },
        fail: {
          text: ['电话线像活的一样缠上她的手腕，冰凉，带着一股潮湿的腥味。她甩了很久才甩开。'],
          effects: { hp: -2, san: -2, xp: 3 },
        },
      },
      {
        id: 'pass',
        label: '贴着墙根绕过去',
        check: { attr: 'dex', diff: 'easy' },
        success: { text: ['她贴着墙走过那截走廊。铃声一直在她身后，没有追上来。'], effects: { xp: 5 } },
        fail: { text: ['铃声跟着她走了很远，最后变成了一种很低的、贴着地面的笑声。'], effects: { san: -3, xp: 3 } },
      },
    ],
  },

  hall_mirror: {
    id: 'hall_mirror',
    title: '只有一个手印的镜子',
    en: 'THE MIRROR',
    art: 'hall',
    text: [
      '走廊拐角挂着一面仪容镜。镜面蒙着灰，只有一个手印是干净的，像是有人每天都会来擦一次。',
      '那个手印的位置，比爱丽丝的头顶高出一截。',
    ],
    choices: [
      {
        id: 'wipe',
        label: '用袖子把整面镜子擦干净',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: [
            '镜子里多了一个人影，站在她身后半个身位的地方，穿着和她一样的校服。',
            '她猛地回头。走廊是空的。再转回来时，镜子里的人也转过了身，背对着她。',
          ],
          effects: {
            xp: 12,
            san: -3,
            clue: { id: 'c_mirror', title: '镜中的背影', text: '镜子里站着一个系红发带的女孩，背对着她。爱丽丝转身时，镜面裂了。' },
          },
        },
        fail: {
          text: ['灰擦不掉，越擦越多。最后整面镜子变成一片均匀的白，白里慢慢浮出一个手印，按在她脸的位置。'],
          effects: { san: -4, xp: 3 },
        },
      },
      {
        id: 'hand',
        label: '把自己的手按在那个手印上',
        effects: { xp: 5, san: -1 },
        success: {
          text: ['手印比她的手大一圈，指节更长。她把手贴上去的瞬间，镜子里的手印反过来握住了她——只是玻璃太凉了，凉得像真的。'],
          effects: { xp: 5, san: -1 },
        },
      },
      {
        id: 'sense',
        label: '不看了，相信自己的直觉',
        requires: { talent: 'instinct', label: '野兽的直觉' },
        success: {
          text: ['她背对着镜子走过去。有些东西一旦看见，就会开始跟着你。她不想知道镜子里站着谁。'],
          effects: { san: 1, xp: 8 },
        },
      },
    ],
  },

  hall_classroom: {
    id: 'hall_classroom',
    title: '三年 B 班',
    en: 'CLASS 3-B',
    art: 'hall',
    text: [
      '三年 B 班的门虚掩着。桌椅排得整整齐齐，黑板上写着一行字：她迟到了。',
      '粉笔灰还在往地上掉。',
    ],
    choices: [
      {
        id: 'read',
        label: '读那行字',
        check: { attr: 'knw', diff: 'easy' },
        success: {
          text: ['字是新写的。粉笔被放回槽里，捏着的那一头还带着一点体温。写字的力道很轻，像怕吵醒谁。'],
          effects: {
            xp: 10,
            san: -1,
            clue: { id: 'c_blackboard', title: '黑板上的字', text: '三年 B 班的黑板上写着「她迟到了」，粉笔还是温的。' },
          },
        },
        fail: {
          text: ['她眨了一下眼，那行字变成了「你也迟到了」。'],
          effects: { san: -4, xp: 3 },
        },
      },
      {
        id: 'desk',
        label: '翻讲台的抽屉',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['抽屉里有一卷绷带、几枚硬币，还有一张被撕掉一半的座位表。剩下的那一半上，奥菲莉亚的名字旁边空着。'],
          effects: { item: 'bandage', coins: 5, xp: 8 },
        },
        fail: {
          text: ['抽屉里全是头发，潮湿的，缠成一团。她把手抽出来的时候，指缝里还夹着几根。'],
          effects: { hp: -1, san: -3, xp: 3 },
        },
      },
      {
        id: 'reply',
        label: '拿起粉笔，在黑板上写下「我来了」',
        check: { attr: 'chr', diff: 'hard' },
        success: {
          text: [
            '粉笔自己从她手里滑了下去，在黑板上慢慢地擦掉她的字，然后重新写：',
            '「她在上面。」',
          ],
          effects: {
            xp: 14,
            san: 2,
            clue: { id: 'c_above', title: '黑板上的回答', text: '黑板写下「她在上面」。' },
          },
        },
        fail: {
          text: ['粉笔断在她手里。断口是暗红色的，蹭在掌心，怎么也擦不掉。'],
          effects: { san: -3, hp: -1, xp: 3 },
        },
      },
    ],
  },

  hall_steps: {
    id: 'hall_steps',
    title: '身后的脚步声',
    en: 'FOOTSTEPS',
    art: 'hall',
    text: [
      '身后有脚步声。三下，停。再三下。',
      '爱丽丝停下，脚步声也停下。她继续走，它就继续跟。',
    ],
    choices: [
      {
        id: 'turn',
        label: '猛地回头',
        check: { attr: 'per', diff: 'hard' },
        success: {
          text: ['走廊是空的。但她脚下的影子多了一个，肩膀挨着肩膀，和她保持着完全一样的姿势。'],
          effects: {
            xp: 10,
            san: -3,
            clue: { id: 'c_shadow', title: '招手的影子', text: '墙上只有她一个人的影子，可影子抬起手，比出了她和奥菲莉亚小时候的暗号。' },
          },
        },
        fail: {
          text: ['一张脸就贴在她的后颈上，冰凉，没有呼吸。她甚至能感觉到那东西的睫毛在眨。'],
          effects: { hp: -2, san: -4, xp: 3 },
        },
      },
      {
        id: 'rhythm',
        label: '学它的节奏走路：三步，停一下',
        check: { attr: 'knw', diff: 'normal' },
        success: {
          text: ['她走三步，停一下。身后的脚步也照做。走到拐角的时候，声音忽然从前面传来了。'],
          effects: { xp: 12, san: -2 },
        },
        fail: {
          text: ['有一次她数错了。身后的脚步没有停，一直走到她身边，然后和她并排走了起来。'],
          effects: { san: -4, xp: 3 },
        },
      },
      {
        id: 'run',
        label: '跑起来',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['她一直跑到走廊尽头，脚步声消失了。回头的时候，走廊还是原来的长度。'],
          effects: { xp: 6 },
        },
        fail: {
          text: ['她跑到尽头才发现，那扇门是画在墙上的。脚步声在她身后停下来，很近。'],
          effects: { hp: -1, san: -3, xp: 3 },
        },
      },
    ],
  },

  hall_locker: {
    id: 'hall_locker',
    title: '217 号储物柜',
    en: 'LOCKER 217',
    art: 'hall',
    text: [
      '一排储物柜，只有 217 号是开着的。那是奥菲莉亚的柜子。',
      '柜门内侧贴着一张便条，边缘卷起来，像是被反复揭下又贴上。',
    ],
    choices: [
      {
        id: 'open',
        label: '把柜门完全打开',
        success: {
          text: [
            '便条上的字迹很急：「如果你来了，去音乐教室。别相信穿校服的人。」',
            '柜子最里面放着一颗水果糖，包装纸被捏得皱皱巴巴，像是被人握了很久才放下。',
          ],
          effects: {
            item: 'candy',
            xp: 10,
            san: -2,
            clue: { id: 'c_locker_note', title: '储物柜里的便条', text: '「去音乐教室。别相信穿校服的人。」字迹是奥菲莉亚的，写得很急。' },
          },
        },
      },
      {
        id: 'knock',
        label: '先敲三下柜门',
        check: { attr: 'chr', diff: 'normal' },
        success: {
          text: ['柜子里传来三下很轻的敲击，回应她。然后是一颗糖从柜子深处滚出来，停在她脚边。'],
          effects: { item: 'candy', san: -2, xp: 10 },
        },
        fail: {
          text: ['柜子里的东西也在敲，越敲越快。最后柜门从里面被顶开，一只很长的、关节错位的手伸了出来。'],
          effects: { san: -4, xp: 3 },
          combat: 'doll',
          win: { text: ['柜子空了。里面只剩一件叠得很整齐的校服，和一枚校徽。'], effects: { xp: 16, coins: 7 } },
        },
      },
      {
        id: 'close',
        label: '把柜门轻轻关上',
        success: {
          text: ['柜门合上之后，走廊安静了一点。她忽然不确定自己刚才有没有听见里面有呼吸声。'],
          effects: { san: 1, xp: 3 },
        },
      },
    ],
  },

  hall_final: {
    id: 'hall_final',
    title: '教务处',
    en: 'THE OFFICE',
    art: 'hall',
    fixed: true,
    text: [
      '教务处的门虚掩着。办公桌上摊着一份名单，最上面一行被红笔圈了起来：奥菲莉亚·格蕾。',
      '名单旁边压着一把黄铜钥匙，柄是半枚校徽。',
      '门后的阴影里，有个很小的东西在哭。',
    ],
    choices: [
      {
        id: 'key',
        label: '先拿起那把钥匙',
        success: {
          text: [
            '钥匙比看上去重。齿上刻着两个字：天台。',
            '她把钥匙收进口袋，哭声停了。门后的阴影里什么也没有，只有一小片被压皱的地毯。',
          ],
          effects: {
            item: 'key_old',
            unlock: 'music',
            xp: 18,
            coins: 5,
            clue: { id: 'c_key', title: '旧校徽钥匙', text: '教务处桌上的黄铜钥匙，齿上刻着「天台」。' },
          },
        },
      },
      {
        id: 'list',
        label: '先看那份名单',
        check: { attr: 'knw', diff: 'normal' },
        success: {
          text: [
            '被红笔圈起来的名字有六个，都是这几年「离家出走」的学生。最下面一行是空的，笔尖悬在纸上，墨迹已经洇开。',
            '她拿起钥匙。哭声停了。',
          ],
          effects: {
            item: 'key_old',
            unlock: 'music',
            xp: 16,
            san: -2,
            clue: { id: 'c_list', title: '被划掉的名字', text: '失踪名单上，奥菲莉亚的名字被红笔划掉，旁边写着「已找到」。' },
          },
        },
        fail: {
          text: ['那些名字开始往下滴。帘子后面的哭声停了，一个很高的影子从名单后面站起来，手里拎着一串钥匙。'],
          effects: { xp: 5, san: -3 },
          combat: 'matron',
          win: {
            text: ['影子垮下去。爱丽丝从它手里抽出那把黄铜钥匙，钥匙牌上写着奥菲莉亚的名字。'],
            effects: { item: 'key_old', unlock: 'music', xp: 12, coins: 6 },
          },
        },
      },
      {
        id: 'curtain',
        label: '掀开门后的那道帘子',
        combat: 'matron',
        win: {
          text: ['帘子后面只有一把翻倒的椅子。舍监的影子散在地上，钥匙串滚到她脚边。'],
          effects: {
            item: 'key_old',
            unlock: 'music',
            xp: 26,
            coins: 8,
            clue: { id: 'c_key', title: '旧校徽钥匙', text: '教务处桌上的黄铜钥匙，齿上刻着「天台」。' },
          },
        },
      },
    ],
  },

  // ══════════════════════════ 音乐教室 ══════════════════════════

  music_piano: {
    id: 'music_piano',
    title: '自己弹奏的钢琴',
    en: 'THE PIANO',
    art: 'music',
    text: [
      '钢琴自己在弹。琴盖上落满灰，琴键却一个个陷下去，像有一双看不见的手。',
      '旋律很慢，是一首爱丽丝没听过的摇篮曲。',
    ],
    choices: [
      {
        id: 'hum',
        label: '跟着旋律轻轻哼',
        check: { attr: 'chr', diff: 'normal' },
        success: {
          text: ['琴声停了。爱丽丝听见有人轻轻笑了一下，是个女孩的声音，很近，像就坐在她旁边的琴凳上。'],
          effects: { san: 3, xp: 12 },
        },
        fail: {
          text: ['她的声音和琴声叠在一起，慢慢变成了别人的声音。那个人用一种她听不懂的语言，一直唱到她捂住耳朵。'],
          effects: { san: -4, xp: 3 },
        },
      },
      {
        id: 'press',
        label: '伸手按住琴键',
        check: { attr: 'str', diff: 'hard' },
        success: {
          text: ['所有琴键同时弹起来，把她弹开半米。琴声停了，琴盖上的灰簌簌落了一地。'],
          effects: { xp: 8, san: -1 },
        },
        fail: {
          text: ['琴键像牙齿一样合拢，夹住她的手指。她抽出来的时候，指甲下面全是黑的。'],
          effects: { hp: -2, san: -2, xp: 3 },
        },
      },
      {
        id: 'sheet',
        label: '去翻琴谱架',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: ['谱架上夹着一张撕下来的乐谱，标题是《合唱练习曲 第七号》。空白处用铅笔写着：她还在唱。'],
          effects: {
            item: 'sheet_music',
            xp: 14,
            san: -2,
            clue: { id: 'c_sheet', title: '撕下的乐谱', text: '乐谱空白处写着「她还在唱」。' },
          },
        },
        fail: {
          text: ['谱架是空的，只有一层湿掉的灰。她的指尖沾到灰，灰在皮肤下慢慢变成了黑色。'],
          effects: { san: -3, xp: 3 },
        },
      },
    ],
  },

  music_chairs: {
    id: 'music_chairs',
    title: '十三把合唱椅',
    en: 'THIRTEEN CHAIRS',
    art: 'music',
    text: [
      '合唱椅围成半圆，每一把椅背上都搭着一件校服外套。一共十三把椅子，但校服只有十二件。',
      '最中间那把椅子的位置，是温的。',
    ],
    choices: [
      {
        id: 'count',
        label: '一把一把地数',
        check: { attr: 'knw', diff: 'easy' },
        success: {
          text: ['第十三个人没有外套。她坐在最中间，位置是温的，扶手上留着两枚指印，很深，像攥了很久。'],
          effects: {
            xp: 10,
            san: -2,
            clue: { id: 'c_chairs', title: '第十三把椅子', text: '十三把合唱椅，只有十二件外套。中间的位置还是温的。' },
          },
        },
        fail: {
          text: ['数到第七把的时候，她忘记了自己数到几。再从头数，椅子变成了十四把。'],
          effects: { san: -3, xp: 3 },
        },
      },
      {
        id: 'sit',
        label: '在最中间那把椅子上坐下',
        success: {
          text: ['椅子很凉，凉得不像木头。坐下去的瞬间，所有椅子同时往后挪了一寸。'],
          effects: { san: -4, xp: 5 },
        },
      },
      {
        id: 'pocket',
        label: '检查那些校服的口袋',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['第三件外套的口袋里有一颗水果糖和几枚硬币。糖纸是新的，硬币却是旧的，旧得看不清年份。'],
          effects: { item: 'candy', coins: 7, xp: 8 },
        },
        fail: {
          text: ['口袋里全是水，还有一根手指的形状。她把外套甩开，那件衣服落在地上，自己叠好了。'],
          effects: { hp: -1, san: -2, xp: 3 },
        },
      },
    ],
  },

  music_photo: {
    id: 'music_photo',
    title: '被剪掉的合照',
    en: 'THE PHOTO',
    art: 'music',
    text: [
      '墙上挂着一张合唱团的合照。第三排正中间被剪掉了一个人，边缘很整齐，是用剪刀一点点剪的。',
      '相框的玻璃上有一道很新的指纹。',
    ],
    choices: [
      {
        id: 'close',
        label: '凑近看那个剪口',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: [
            '被剪掉的人旁边，站着一个更小的女孩，低着头，手腕上系着红色的发带——和爱丽丝手腕上这条一模一样。',
            '可合照的日期，是六年前。',
          ],
          effects: {
            xp: 14,
            san: -4,
            clue: { id: 'c_photo_group', title: '六年前的合照', text: '六年前的合唱团合照里，奥菲莉亚站在最边上，手腕上系着一条红发带。' },
          },
        },
        fail: {
          text: ['照片里所有人都转过来看她。她退后一步，相框里的姿势却没有变回去。'],
          effects: { san: -5, xp: 3 },
        },
      },
      {
        id: 'take',
        label: '把照片从墙上取下来',
        success: {
          text: ['相框背面用铅笔写着一个日期，是奥菲莉亚失踪的那天。字很小，写得很用力，纸都被划破了。'],
          effects: {
            xp: 8,
            san: -2,
            clue: { id: 'c_date', title: '相框背面的日期', text: '合照背面写着奥菲莉亚失踪那天的日期。' },
          },
        },
      },
      {
        id: 'dust',
        label: '用袖子擦掉相框上的灰',
        success: {
          text: ['灰擦掉之后，照片清晰了一些。她忽然不想再看清里面的人是谁。'],
          effects: { xp: 4, san: -1 },
        },
      },
    ],
  },

  music_curtain: {
    id: 'music_curtain',
    title: '幕布后的呼吸声',
    en: 'BEHIND THE CURTAIN',
    art: 'music',
    text: [
      '舞台的幕布后面有呼吸声。很轻，很均匀，像睡着了一样。',
      '幕布下摆露出一小截鞋尖，红色的，是室内鞋。',
    ],
    choices: [
      {
        id: 'open',
        label: '掀开幕布',
        combat: 'doll',
        win: {
          text: ['幕布后面只有一把翻倒的椅子，和一截断掉的红线。椅子上还留着一点温度。'],
          effects: { xp: 20, coins: 8, san: 1 },
        },
      },
      {
        id: 'backstage',
        label: '绕到后台去',
        check: { attr: 'dex', diff: 'hard' },
        success: {
          text: ['后台的门锁着，门缝里透出一线光。有人刚从这里离开，锁孔还是热的。'],
          effects: {
            xp: 12,
            clue: { id: 'c_backstage', title: '后台的门', text: '后台的门锁着，门缝里有光，锁孔还是热的。' },
          },
        },
        fail: {
          text: ['幕布自己拉开了。一个人偶从里面走出来，纽扣眼睛一直盯着她。'],
          effects: { san: -4, hp: -1, xp: 3 },
        },
      },
      {
        id: 'call',
        label: '叫奥菲莉亚的名字',
        check: { attr: 'chr', diff: 'normal' },
        success: {
          text: ['呼吸声停了。幕布轻轻鼓了一下，像有人从后面走过去，在很远的地方应了一声。'],
          effects: { san: 2, xp: 10 },
        },
        fail: {
          text: ['呼吸声贴着耳朵响起来，就在她身后。可她不敢回头。'],
          effects: { san: -4, xp: 3 },
        },
      },
    ],
  },

  music_final: {
    id: 'music_final',
    title: '最后一个音',
    en: 'THE LAST NOTE',
    art: 'music',
    fixed: true,
    text: [
      '舞台的幕布自己拉开了。',
      '几个穿着校服的影子并排站在台上，嘴的位置裂成一道竖直的黑。它们开始唱一首爱丽丝从未听过的校歌。',
      '最左边那个影子，手腕上系着一条红色的发带。',
    ],
    choices: [
      {
        id: 'step',
        label: '握紧钥匙，走上台阶',
        combat: 'chorus',
        win: {
          text: [
            '最后一个音散在空气里。影子们一个接一个地淡下去，只剩下最左边那个还站着。',
            '它抬起手，指了指幕布后面。然后连它也消失了。',
          ],
          effects: { endDemo: true, xp: 40, coins: 20 },
        },
      },
      {
        id: 'call',
        label: '喊奥菲莉亚的名字',
        check: { attr: 'chr', diff: 'hard' },
        success: {
          text: [
            '歌声乱了半拍。最左边的影子转过头，用奥菲莉亚的声音说：「快走。」',
            '其他影子像没听见，仍旧朝着空无一人的观众席唱。爱丽丝从它们中间穿过去，掀开了幕布。',
          ],
          effects: { xp: 30, endDemo: true },
        },
        fail: {
          text: ['所有的影子同时停下。它们没有脸，但爱丽丝知道它们都在看她。舞台的灯一盏一盏地灭了。'],
          effects: { xp: 5, san: -5 },
          combat: 'chorus',
          win: {
            text: ['最后一个音散在空气里。影子们一个接一个地淡下去，最左边那个指了指幕布后面。'],
            effects: { endDemo: true, xp: 40, coins: 20 },
          },
        },
      },
      {
        id: 'run',
        label: '转身就跑',
        success: {
          text: ['她转身冲向门口。门在她面前自己锁上了，锁舌落下的声音很轻，像有人在她耳边说：还不到时候。'],
          effects: { san: -3, xp: 4 },
          combat: 'chorus',
          win: {
            text: ['影子们散了。门锁自己弹开，走廊的风灌进来，吹动了幕布后面那条红色的发带。'],
            effects: { endDemo: true, xp: 40, coins: 20 },
          },
        },
      },
    ],
  },

  // ══════════════════════════ 校门·补充 ══════════════════════════

  gate_bell: {
    id: 'gate_bell',
    title: '传达室的铜铃',
    en: 'THE BELL',
    art: 'gate',
    text: [
      '传达室的窗玻璃碎了一半。门里挂着一只铜铃，铃舌被什么东西缠住了，垂在那里一动不动。',
      '铃身上有一层很薄的灰，唯独缠着铃舌的那一圈没有。',
    ],
    choices: [
      {
        id: 'untie',
        label: '伸手解开缠住铃舌的东西',
        hint: '也许只是旧绳子',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['缠住铃舌的不是绳子，是一缕很细的头发，末端用红线扎着。铃响了一声，传达室后面的雾退开半步。'],
          effects: { xp: 10, coins: 4, san: -1, clue: { id: 'c_bell', title: '铃舌上的头发', text: '缠住铜铃铃舌的是一缕头发，用红线扎着。' } },
        },
        fail: {
          text: ['她刚碰到那圈东西，铜铃就自己荡了一下。没有声音，但她的耳朵里嗡了很久。'],
          effects: { san: -3, xp: 4 },
        },
      },
      {
        id: 'ring',
        label: '抓住铃绳，用力摇响',
        hint: '让学校里的人都听见',
        check: { attr: 'chr', diff: 'hard' },
        success: {
          text: ['铃声在雾里滚出去很远。很远的地方，有一扇门应声开了，又轻轻合上。'],
          effects: { xp: 12, coins: 6 },
        },
        fail: {
          text: ['铃声只响了一半就被吞掉了。紧接着，传达室深处传来指甲刮玻璃的声音，一下一下，越来越近。'],
          effects: { san: -4, xp: 4 },
          combat: 'crawler',
          win: {
            text: ['刮擦声停了。铜铃落在地上，滚到她脚边，铃舌已经不见了。'],
            effects: { xp: 16, coins: 5 },
          },
        },
      },
      {
        id: 'leave',
        label: '不进传达室，绕过去',
        success: { text: ['她贴着墙根走过去。铜铃在身后自己晃了一下，依旧没有声音。'], effects: { xp: 2 } },
      },
    ],
  },

  gate_bus: {
    id: 'gate_bus',
    title: '亮着灯的校车',
    en: 'THE SCHOOL BUS',
    art: 'gate',
    text: [
      '一辆校车停在校门内侧，车门开着，车厢里亮着一盏不该亮的小灯。',
      '每张座椅上都整整齐齐地放着一只书包，安全带扣得好好的，像在等一群不会再回来的孩子。',
    ],
    choices: [
      {
        id: 'board',
        label: '上车，看看那些书包',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: ['所有书包的姓名牌都被撕掉了，只有一个还留着：奥菲莉亚·格蕾。里面没有课本，只有半盒火柴和一张写着「别相信广播」的纸条。'],
          effects: { xp: 12, item: 'sedative', clue: { id: 'c_bus', title: '校车里的书包', text: '奥菲莉亚的书包藏在别的书包中间，里面有一张「别相信广播」的纸条。' } },
        },
        fail: {
          text: ['她刚踏上台阶，车厢里的灯就全灭了。黑暗里有很多很轻的呼吸声，整齐得像在合唱。她退回雨里，手在发抖。'],
          effects: { san: -3, xp: 4 },
        },
      },
      {
        id: 'hook',
        label: '用钥匙链的链子勾出最上面那只书包',
        hint: '不用上车',
        requires: { weapon: 'keychain', label: '带链子的钥匙' },
        success: {
          text: ['链子勾住背带，把书包拖到车门边。里面掉出一卷绷带和一枚校徽别针，别针背面刻着「三年二班」。'],
          effects: { xp: 12, item: 'bandage', coins: 3 },
        },
      },
      {
        id: 'pass',
        label: '不去碰它，继续往前',
        success: { text: ['走到甬道中段时，身后的校车灯灭了。她没有回头。'], effects: { xp: 2, san: -1 } },
      },
    ],
  },

  gate_photo: {
    id: 'gate_photo',
    title: '积水里的照片',
    en: 'THE PHOTO',
    art: 'gate',
    text: [
      '一洼积水里泡着一张照片，正面朝下。水面很静，照片的边缘却在一鼓一鼓地动，像下面有什么在呼吸。',
    ],
    choices: [
      {
        id: 'pick',
        label: '把手伸进水里，把照片捞起来',
        check: { attr: 'luk', diff: 'normal' },
        success: {
          text: ['照片上是一群穿校服的孩子站在校门口，最后一排最右边的女孩被人用指甲刮掉了脸，但那条红发带还在。背面写着一行字：她不肯笑。'],
          effects: { xp: 10, san: -2, clue: { id: 'c_photo_scraped', title: '刮掉脸的照片', text: '合影里最右边的女孩被刮掉了脸，红发带还在。奥菲莉亚从不提那一年。' } },
        },
        fail: {
          text: ['手指刚碰到照片，水面就整个塌了下去。她抓到的是满手黑色的泥，照片已经沉得看不见了。'],
          effects: { san: -3, hp: -1, xp: 3 },
        },
      },
      {
        id: 'nudge',
        label: '用鞋尖把它翻过来',
        check: { attr: 'per', diff: 'easy' },
        success: {
          text: ['照片上的孩子都背对着镜头。只有最后一排最右边那个，转过了半张脸，眼睛的位置是两个针孔。'],
          effects: { xp: 8, san: -1, clue: { id: 'c_photo_back', title: '照片背面', text: '照片背面是奥菲莉亚的字：「等我们长大，就一起离开这里。」' } },
        },
        fail: {
          text: ['鞋尖踩碎了水面。她抬起脚时，鞋底粘着一张湿透的、空白的相纸。'],
          effects: { san: -1, xp: 2 },
        },
      },
      {
        id: 'skip',
        label: '假装没有看见',
        success: { text: ['她绕过那洼水。身后传来轻轻的一声，像有人把照片翻了过来。'], effects: { xp: 2, san: -1 } },
      },
    ],
  },

  // ══════════════════════════ 教学楼·补充 ══════════════════════════

  hall_locker13: {
    id: 'hall_locker13',
    title: '十三号储物柜',
    en: 'LOCKER 13',
    art: 'hall',
    text: [
      '一排储物柜贴着墙，编号从一到十二，然后直接跳到了十四。',
      '第十三号柜在十二和十四中间的位置，柜门缝里卡着一角红色的布。',
    ],
    choices: [
      {
        id: 'pry',
        label: '用钥匙链把柜门撬开',
        check: { attr: 'str', diff: 'hard' },
        success: {
          text: ['柜门弹开，里面没有了东西，只有一张贴在背板上的课程表。周三下午最后一节，被红笔写了三遍：合唱部。'],
          effects: { xp: 12, coins: 5, item: 'candy', clue: { id: 'c_locker13', title: '十三号柜的课程表', text: '第十三号储物柜里贴着课程表，周三最后一节被红笔写了三遍「合唱部」——奥菲莉亚的字。' } },
        },
        fail: {
          text: ['柜门纹丝不动，反震得她虎口发麻。柜子里面传来很轻的一声笑。'],
          effects: { hp: -2, xp: 3 },
        },
      },
      {
        id: 'feel',
        label: '顺着门缝，把手指探进去摸索',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: ['她摸到一小截缎带，还有别在缎带上的东西——一枚校徽别针，针尖是温的。'],
          effects: { xp: 10, item: 'pin' },
        },
        fail: {
          text: ['门缝里有另一根手指，比她先一步缩了回去。'],
          effects: { san: -3, xp: 3 },
        },
      },
      {
        id: 'knock',
        label: '敲两下柜门，等一等',
        hint: '也许里面的东西愿意出来',
        check: { attr: 'chr', diff: 'easy' },
        success: {
          text: ['柜子里回敲了两下。然后是一阵很轻的、布料摩擦的声音，红色的一角被从里面慢慢抽了回去。'],
          effects: { xp: 8, san: 1, clue: { id: 'c_locker2', title: '素描本', text: '柜子里塞着一本素描本，画的全是爱丽丝——睡着的样子、生气的样子，最后一页写着「找到了」。' } },
        },
        fail: {
          text: ['柜门从里面被撞了一下，锁扣弹开半寸，又卡住了。她听见里面有东西在急促地喘气。'],
          effects: { san: -2, xp: 3 },
          combat: 'doll',
          win: {
            text: ['柜门终于开了。里面只有一件叠得整整齐齐的校服外套，和一枚掉在地上的纽扣。'],
            effects: { xp: 15, coins: 6 },
          },
        },
      },
    ],
  },

  hall_mirror_slow: {
    id: 'hall_mirror_slow',
    title: '慢半拍的镜子',
    en: 'THE MIRROR',
    art: 'hall',
    text: [
      '走廊尽头挂着一面半身镜，镜面上的水银已经剥落了一角。',
      '爱丽丝停下来时，镜子里的她还在往前走。过了半拍，才跟着停住。',
    ],
    choices: [
      {
        id: 'wave',
        label: '抬起手，试探镜子里的自己',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: ['镜子里的人跟着抬手，但手指比了个不一样的手势——拇指压住无名指，是她们小时候约好的暗号。爱丽丝的喉咙发紧。'],
          effects: { xp: 12, san: -1, clue: { id: 'c_mirror_sign', title: '镜中的暗号', text: '镜子里的「爱丽丝」比出小时候和奥菲莉亚约定的暗号，然后指了指楼上。' } },
        },
        fail: {
          text: ['镜子里的人没有动。她的身后多了一个穿校服的影子，比她还矮半个头。'],
          effects: { san: -4, xp: 4 },
        },
      },
      {
        id: 'speak',
        label: '对着镜子，叫奥菲莉亚的名字',
        check: { attr: 'chr', diff: 'hard' },
        success: {
          text: ['镜子里的嘴唇先动了。她听见一个很轻的声音从水银后面传出来：别照太久。然后镜面起了一层雾。'],
          effects: { xp: 14, san: 2, clue: { id: 'c_mirror2', title: '镜后的声音', text: '镜子后面有一个很轻的声音说：「别走走廊中间。」和奥菲莉亚在电话里说的一模一样。' } },
        },
        fail: {
          text: ['镜子里所有剥落的水银同时开始往下流。她后退了一步，镜子里的自己却留在原地，一直看着她。'],
          effects: { san: -4, xp: 4 },
        },
      },
      {
        id: 'cover',
        label: '把外套脱下来，盖住镜面',
        success: {
          text: ['外套盖上去的一瞬间，布料下面传来一声很轻的叹息，像有人终于闭上了眼睛。'],
          effects: { xp: 5, san: -1 },
        },
      },
    ],
  },

  hall_stairs: {
    id: 'hall_stairs',
    title: '通往二楼的课桌',
    en: 'THE STAIRS',
    art: 'hall',
    text: [
      '通往二楼的楼梯被课桌堵死了，一张压一张，从下往上垒到看不见的地方。',
      '最下面那张课桌的抽屉没有关严，里面露出半截红色的东西。',
    ],
    choices: [
      {
        id: 'move',
        label: '一张一张地把课桌搬开',
        check: { attr: 'str', diff: 'hard' },
        success: {
          text: ['搬到第七张时，抽屉里的东西掉了出来——一盒还没拆封的蜡笔，和几枚硬币。楼梯上方仍旧黑着，但至少能侧身通过了。'],
          effects: { xp: 12, coins: 7, item: 'candy' },
        },
        fail: {
          text: ['课桌比看上去重得多。搬开第三张时，整摞桌子往下一沉，她的脚踝被抽屉角刮出一道血口。'],
          effects: { hp: -3, xp: 4 },
        },
      },
      {
        id: 'squeeze',
        label: '从课桌之间的缝隙钻过去',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['她侧着身子挤过缝隙，在最后一刻回头看——堵住楼梯的课桌全都面向着她，抽屉一张一张地拉开。'],
          effects: { xp: 10, san: -2, item: 'bandage' },
        },
        fail: {
          text: ['卡在两张课桌中间时，她听见抽屉在身后一张一张地拉开。等她挣脱出来，膝盖上全是木刺。'],
          effects: { hp: -2, san: -2, xp: 3 },
        },
      },
      {
        id: 'call',
        label: '对着楼上喊奥菲莉亚的名字',
        check: { attr: 'chr', diff: 'normal' },
        success: {
          text: ['楼上有东西动了一下。很轻的、布料擦过地面的声音，一直响到走廊深处才停。'],
          effects: { xp: 8, san: 1, clue: { id: 'c_stairs', title: '楼上的回应', text: '对着二楼喊奥菲莉亚的名字，有布料擦地的声音回应。' } },
        },
        fail: {
          text: ['楼上没有回应。只有她自己的声音一层一层地落下来，最后变成一个陌生的、成年人的嗓音。'],
          effects: { san: -3, xp: 3 },
        },
      },
    ],
  },

  // ══════════════════════════ 音乐教室·补充 ══════════════════════════

  music_broadcast: {
    id: 'music_broadcast',
    title: '没有关掉的广播',
    en: 'THE BROADCAST',
    art: 'music',
    text: [
      '墙角挂着一只校园广播的小喇叭，红色的指示灯还亮着。',
      '没有节目。只有电流声，和夹在电流里的一阵一阵很轻的呼吸。',
    ],
    choices: [
      {
        id: 'listen',
        label: '凑近喇叭，听那阵呼吸',
        check: { attr: 'per', diff: 'normal' },
        success: {
          text: ['电流声下面压着一段录音：一个女孩在念名字，一遍，又一遍。念到第六个时，她停了一下，然后轻轻地念了「爱丽丝」。'],
          effects: { xp: 12, san: -2, clue: { id: 'c_broadcast', title: '广播里的名字', text: '广播的电流声下面，一个女孩一遍遍念着「奥菲莉亚」，像在练习怎么叫她。' } },
        },
        fail: {
          text: ['呼吸声突然贴到了她的耳朵上。喇叭还挂在墙角，线却已经垂到了地上，有什么东西顺着线滑了下来。'],
          effects: { san: -4, xp: 4 },
          combat: 'doll',
          win: { text: ['喇叭掉在地上，红灯闪了两下，熄了。'], effects: { xp: 15, coins: 6 } },
        },
      },
      {
        id: 'speak',
        label: '对着喇叭，问「奥菲莉亚？是你吗」',
        check: { attr: 'chr', diff: 'hard' },
        success: {
          text: ['电流声停了。一个很轻、很清楚的女孩声音说：你来得太晚了。然后广播里开始放一首她没听过的摇篮曲。'],
          effects: { xp: 14, san: -2, clue: { id: 'c_broadcast2', title: '广播里的回答', text: '广播里有一个女孩回答「你来得太晚了」，随后放起了摇篮曲。' } },
        },
        fail: {
          text: ['喇叭发出一声尖锐的啸叫，红灯爆开。黑暗里有什么东西顺着广播线爬了下来。'],
          effects: { san: -3, xp: 4 },
          combat: 'doll',
          win: {
            text: ['广播线断了。小喇叭掉在地上，红灯还亮了一瞬，才彻底熄灭。'],
            effects: { xp: 16, coins: 6 },
          },
        },
      },
      {
        id: 'unplug',
        label: '找到插头，把广播关掉',
        check: { attr: 'knw', diff: 'easy' },
        success: {
          text: ['插头藏在讲台后面。红灯灭了的一瞬间，整条走廊的广播同时响了起来，念到一半又齐齐停住。'],
          effects: { xp: 10, coins: 4, san: -1 },
        },
        fail: {
          text: ['她拔掉插头，红灯还亮着。再抬头时，墙上的喇叭已经转了个方向，正对着她。'],
          effects: { san: -3, xp: 3 },
        },
      },
    ],
  },

  music_metronome: {
    id: 'music_metronome',
    title: '不会停的节拍器',
    en: 'THE METRONOME',
    art: 'music',
    text: [
      '讲台上放着一只木节拍器，摆锤在两端之间来回，声音一模一样，一下也不快，一下也不慢。',
      '它的侧面刻着一行小字：为奥菲莉亚同学伴奏。',
    ],
    choices: [
      {
        id: 'catch',
        label: '在摆锤荡到一端时抓住它',
        check: { attr: 'dex', diff: 'normal' },
        success: {
          text: ['摆锤在她手心里停住。底板下面滑出一枚硬币——它已经被压得又薄又亮，像一枚谁也不敢花的护身符。'],
          effects: { xp: 10, coins: 5, item: 'candy' },
        },
        fail: {
          text: ['手指穿过了摆锤，像穿过一道影子。节拍器没有停，她的手心却多了一道细长的白痕。'],
          effects: { hp: -1, san: -2, xp: 3 },
        },
      },
      {
        id: 'count',
        label: '跟着它数拍子，看它想让你做什么',
        check: { attr: 'knw', diff: 'easy' },
        success: {
          text: ['四十拍后她数出来了：它在按一首曲子的速度打拍子，但每七拍就错一下。错的地方，正好是走廊灯灭的节奏。'],
          effects: { xp: 10, san: -1, clue: { id: 'c_metronome', title: '练习记录', text: '节拍器下压着一张练习记录：「今天也要练到爱丽丝来。」落款是奥菲莉亚。' } },
        },
        fail: {
          text: ['她数到一半，发现自己正在跟着节拍呼吸。停下来时，胸口闷得发疼。'],
          effects: { san: -3, xp: 3 },
        },
      },
      {
        id: 'leave',
        label: '让它继续，转身离开',
        success: { text: ['节拍声一路跟着她走到门口，然后被门板关在了里面。'], effects: { xp: 2 } },
      },
    ],
  },

  music_costume: {
    id: 'music_costume',
    title: '小一号的演出服',
    en: 'THE COSTUME',
    art: 'music',
    text: [
      '衣架上挂着一件深蓝色的演出服，领口缀着褪色的亮片，尺码却小得像给十岁以下的孩子做的。',
      '衣架下方的地板上有一圈水渍，正好是两只脚并拢站着的形状。',
    ],
    choices: [
      {
        id: 'wear',
        label: '把它从衣架上取下来，披在身上比一比',
        check: { attr: 'chr', diff: 'hard' },
        success: {
          text: ['布料贴上来时有一股很淡的皂角味，是奥菲莉亚家里的味道。演出服的衬里缝着一枚小小的银铃，铃口被一块胶布封住了。'],
          effects: { xp: 14, item: 'charm', san: 1, clue: { id: 'c_costume', title: '演出服的衬里', text: '演出服衬里缝着一枚被封住铃口的银铃，衣服上有奥菲莉亚家里的皂角味。' } },
        },
        fail: {
          text: ['演出服在她手里收紧，像被一个看不见的孩子穿上了。她用力把它扯下来扔回衣架，手指上留下了几道细小的抓痕。'],
          effects: { hp: -2, san: -3, xp: 4 },
        },
      },
      {
        id: 'pockets',
        label: '翻一翻演出服的口袋',
        check: { attr: 'per', diff: 'easy' },
        success: {
          text: ['左边口袋里有一张揉皱的排练表，和几枚硬币。排练表上，奥菲莉亚的名字被排在最前面，旁边打了个问号。'],
          effects: { xp: 9, coins: 7, item: 'candy', clue: { id: 'c_costume2', title: '排练表', text: '演出服口袋里的排练表，奥菲莉亚的名字旁打了个问号。' } },
        },
        fail: {
          text: ['口袋是空的，但翻过来时掉出几粒亮片。它们落在地上没有声音，只是一直往下沉。'],
          effects: { san: -2, xp: 3 },
        },
      },
      {
        id: 'take',
        label: '把整件演出服从衣架上扯下来',
        success: {
          text: ['衣架空了以后，那圈水渍开始移动，从地板一直爬到她脚边。衣架后面站着一个很小的、没有再小的影子。'],
          effects: { san: -2, xp: 4 },
          combat: 'doll',
          win: {
            text: ['影子散了。演出服掉在地上，摊开成一个人的形状，领口的亮片全掉了。'],
            effects: { xp: 18, coins: 8 },
          },
        },
      },
    ],
  },

  // ══════════════════════════ 天台（未开放） ══════════════════════════

  roof_locked: {
    id: 'roof_locked',
    title: '锁住的天台',
    en: 'LOCKED',
    art: 'hall',
    text: [
      '铁栅栏后面的楼梯一直向上，消失在黑暗里。上面的滴水声很规律，一声，一声，像在数着什么。',
      '锁孔里积着雨水。',
    ],
    choices: [
      {
        id: 'back',
        label: '暂时先回去',
        success: { text: ['现在还不是上去的时候。爱丽丝把钥匙攥在手心，退下了楼梯。'], effects: { xp: 2 } },
      },
    ],
  },
};

export function getEvent(id) {
  const event = EVENTS[id];
  if (!event) throw new Error(`未知事件：${id}`);
  return event;
}
