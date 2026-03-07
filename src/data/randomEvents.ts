/**
 * v66.0 — Random Events System
 * Events trigger every ~60 kills with choices that affect rewards
 */

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  choices: EventChoice[];
  minLevel: number;
}

export interface EventChoice {
  label: string;
  description: string;
  outcome: EventOutcome;
}

export interface EventOutcome {
  type: 'reward' | 'risk';
  successRate: number; // 0-1
  successReward: Record<string, number>; // multiplied by player level
  failPenalty?: Record<string, number>;
  message: string;
  failMessage?: string;
}

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'merchant', name: '云游商人', emoji: '🧳',
    description: '一位神秘商人从云雾中走出，向你展示他的宝物...',
    minLevel: 5,
    choices: [
      {
        label: '交易', description: '用灵石换取宝物',
        outcome: { type: 'reward', successRate: 1, successReward: { pantao: 2, shards: 5 }, message: '商人满意地离去，留下宝物' },
      },
      {
        label: '抢夺', description: '强行夺取，但可能失败',
        outcome: { type: 'risk', successRate: 0.4, successReward: { pantao: 5, shards: 15, lingshi: 500 }, failPenalty: { lingshi: -200 }, message: '你成功夺得所有宝物！', failMessage: '商人施法逃走，你损失了一些灵石' },
      },
      {
        label: '离开', description: '礼貌告辞',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 50 }, message: '商人赠你一句箴言，你有所领悟' },
      },
    ],
  },
  {
    id: 'treasure_chest', name: '宝箱', emoji: '📦',
    description: '路边发现一个散发微光的宝箱...',
    minLevel: 1,
    choices: [
      {
        label: '打开', description: '直接开启',
        outcome: { type: 'risk', successRate: 0.7, successReward: { lingshi: 300, shards: 3 }, failPenalty: {}, message: '宝箱中藏有灵石和碎片！', failMessage: '宝箱是空的，什么都没有...' },
      },
      {
        label: '谨慎检查', description: '仔细查看后再开',
        outcome: { type: 'reward', successRate: 1, successReward: { lingshi: 150, exp: 30 }, message: '你小心翼翼地取出了灵石' },
      },
    ],
  },
  {
    id: 'spirit_spring', name: '灵泉', emoji: '💧',
    description: '一处灵气充沛的泉眼在闪烁...',
    minLevel: 10,
    choices: [
      {
        label: '修炼', description: '在灵泉旁打坐修炼',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 200, pantao: 1 }, message: '灵泉之力涌入体内，修为大增！' },
      },
      {
        label: '饮用', description: '直接饮用泉水',
        outcome: { type: 'risk', successRate: 0.5, successReward: { pantao: 5 }, failPenalty: {}, message: '甘甜的泉水化为蟠桃之力！', failMessage: '泉水入口苦涩，似乎没什么效果' },
      },
    ],
  },
  {
    id: 'wandering_sage', name: '云游仙人', emoji: '👴',
    description: '一位白发老者拦住你的去路，似有话说...',
    minLevel: 20,
    choices: [
      {
        label: '请教', description: '虚心请教',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 500 }, message: '仙人指点迷津，你豁然开朗！' },
      },
      {
        label: '切磋', description: '请求切磋武艺',
        outcome: { type: 'risk', successRate: 0.6, successReward: { shards: 20, lingshi: 1000 }, failPenalty: {}, message: '你在切磋中领悟新招！', failMessage: '仙人轻描淡写地击败了你' },
      },
      {
        label: '赠礼', description: '赠送100灵石表示敬意',
        outcome: { type: 'reward', successRate: 1, successReward: { pantao: 3, scrolls: 1 }, message: '仙人欣慰，回赠蟠桃与天命符' },
      },
    ],
  },
  {
    id: 'demon_ambush', name: '妖魔伏击', emoji: '👹',
    description: '前方传来厉啸，一群妖魔挡住了去路！',
    minLevel: 15,
    choices: [
      {
        label: '迎战', description: '正面迎击',
        outcome: { type: 'risk', successRate: 0.65, successReward: { lingshi: 800, exp: 300, shards: 10 }, failPenalty: {}, message: '妖魔被你打得落花流水，掉落大量战利品！', failMessage: '妖魔太强了，你且战且退' },
      },
      {
        label: '绕道', description: '避开妖魔',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 50 }, message: '你绕道而行，虽无收获但也安全' },
      },
    ],
  },
  {
    id: 'ancient_ruins', name: '远古遗迹', emoji: '🏛️',
    description: '你发现了一座被遗忘的远古遗迹...',
    minLevel: 30,
    choices: [
      {
        label: '探索', description: '深入探索遗迹',
        outcome: { type: 'risk', successRate: 0.5, successReward: { shards: 30, pantao: 5, lingshi: 2000 }, failPenalty: {}, message: '遗迹深处藏有大量宝物！', failMessage: '遗迹内空无一物，只有灰尘...' },
      },
      {
        label: '祈祷', description: '在遗迹前祈祷',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 300, pantao: 2 }, message: '远古之力降临，你感到神清气爽' },
      },
    ],
  },
  // ── v122.0 新增：6个中高级随机事件 ──
  {
    id: 'dragon_gate', name: '龙门飞渡', emoji: '🐲',
    description: '前方出现一座金光闪闪的龙门，传说跃过龙门可脱胎换骨...',
    minLevel: 100,
    choices: [
      {
        label: '纵身飞跃', description: '全力一搏，跃过龙门',
        outcome: { type: 'risk', successRate: 0.35, successReward: { pantao: 20, shards: 50, daoPoints: 5 }, failPenalty: {}, message: '你一跃而过！龙门金光灌体，实力暴增！', failMessage: '差之毫厘，被龙门弹回，但你有所领悟' },
      },
      {
        label: '参悟龙纹', description: '在龙门旁静心参悟纹路',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 2000, pantao: 5 }, message: '龙纹中蕴含大道至理，你修为大增' },
      },
      {
        label: '取龙门水', description: '收集龙门瀑布灵水',
        outcome: { type: 'reward', successRate: 1, successReward: { pantao: 8, lingshi: 3000 }, message: '灵水甘甜，蕴含蟠桃之力' },
      },
    ],
  },
  {
    id: 'celestial_forge', name: '天工炉', emoji: '🔥',
    description: '一座无人看守的仙家锻炉正熊熊燃烧，炉火通明...',
    minLevel: 150,
    choices: [
      {
        label: '投入碎片锻造', description: '用鸿蒙碎片尝试锻造',
        outcome: { type: 'risk', successRate: 0.45, successReward: { shards: 80, scrolls: 2 }, failPenalty: { shards: -10 }, message: '天火淬炼，碎片化为更纯粹的精华！', failMessage: '火候不对，部分碎片化为灰烬' },
      },
      {
        label: '以火炼体', description: '步入炉火淬炼肉身',
        outcome: { type: 'risk', successRate: 0.5, successReward: { exp: 5000, pantao: 10 }, failPenalty: {}, message: '烈火焚身，浴火重生！修为暴涨！', failMessage: '火势太猛，你不得不退出' },
      },
      {
        label: '观火悟道', description: '在一旁观摩火焰变化',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 1500, lingshi: 2000 }, message: '火中蕴含天道法则，你有所悟' },
      },
    ],
  },
  {
    id: 'void_rift', name: '虚空裂隙', emoji: '🌀',
    description: '空间突然撕裂，一道通往未知世界的裂隙出现在面前...',
    minLevel: 200,
    choices: [
      {
        label: '闯入裂隙', description: '纵身跃入虚空',
        outcome: { type: 'risk', successRate: 0.3, successReward: { lingshi: 20000, shards: 100, daoPoints: 10 }, failPenalty: {}, message: '虚空彼岸藏有无尽宝藏！你满载而归！', failMessage: '虚空混沌难辨方向，你被弹了回来' },
      },
      {
        label: '封印裂隙', description: '施法封印虚空裂缝',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 3000, pantao: 8, scrolls: 1 }, message: '封印虚空获得天道馈赠' },
      },
    ],
  },
  {
    id: 'peach_banquet', name: '蟠桃盛会', emoji: '🍑',
    description: '你意外闯入一场蟠桃盛会，仙果琳琅满目...',
    minLevel: 80,
    choices: [
      {
        label: '大快朵颐', description: '尽情享用蟠桃',
        outcome: { type: 'reward', successRate: 1, successReward: { pantao: 15, exp: 1000 }, message: '仙桃入口即化，修为精进！' },
      },
      {
        label: '偷藏几个', description: '趁人不注意多拿一些',
        outcome: { type: 'risk', successRate: 0.4, successReward: { pantao: 40, lingshi: 5000 }, failPenalty: { pantao: -3 }, message: '你悄悄藏了一大把蟠桃！', failMessage: '被王母娘娘发现了，罚你交出蟠桃' },
      },
      {
        label: '敬献灵石', description: '献上灵石表示尊敬',
        outcome: { type: 'reward', successRate: 1, successReward: { pantao: 10, scrolls: 1 }, message: '王母大悦，赐你天命符一枚' },
      },
    ],
  },
  {
    id: 'karma_mirror', name: '因果镜', emoji: '🪞',
    description: '一面悬浮的古镜映照出你的前世今生...',
    minLevel: 300,
    choices: [
      {
        label: '直视因果', description: '凝视镜中前世',
        outcome: { type: 'risk', successRate: 0.5, successReward: { daoPoints: 15, exp: 10000 }, failPenalty: {}, message: '因果轮转，你领悟了前世道行！', failMessage: '因果缠绕太深，你暂时无法参透' },
      },
      {
        label: '打破镜子', description: '斩断因果束缚',
        outcome: { type: 'risk', successRate: 0.25, successReward: { shards: 200, daoPoints: 20, pantao: 30 }, failPenalty: {}, message: '因果断裂！无量功德降临！', failMessage: '镜子纹丝不动，因果不可强断' },
      },
      {
        label: '对镜修行', description: '以镜为引，参悟大道',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 5000, pantao: 12 }, message: '镜花水月，你悟出一丝天道' },
      },
    ],
  },
  {
    id: 'star_fall', name: '星辰陨落', emoji: '☄️',
    description: '一颗燃烧的星辰从天而降，坠落在前方不远处！',
    minLevel: 500,
    choices: [
      {
        label: '吸收星力', description: '吞噬星辰精华',
        outcome: { type: 'risk', successRate: 0.4, successReward: { lingshi: 50000, shards: 150, daoPoints: 25, scrolls: 3 }, failPenalty: {}, message: '星辰之力涌入经脉！你感到无穷力量！', failMessage: '星力太过狂暴，你无法吸收' },
      },
      {
        label: '采集星铁', description: '收取陨铁材料',
        outcome: { type: 'reward', successRate: 1, successReward: { shards: 80, lingshi: 10000 }, message: '星铁入手，锻造神兵的绝佳材料！' },
      },
      {
        label: '星坑打坐', description: '在余温中修炼',
        outcome: { type: 'reward', successRate: 1, successReward: { exp: 15000, pantao: 20 }, message: '星辰余力温润经脉，修为精进' },
      },
    ],
  },
];

export function getRandomEvent(level: number): RandomEvent | null {
  const eligible = RANDOM_EVENTS.filter(e => level >= e.minLevel);
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function resolveChoice(choice: EventChoice, level: number): {
  success: boolean;
  rewards: Record<string, number>;
  message: string;
} {
  const success = Math.random() < choice.outcome.successRate;
  const scale = Math.max(1, Math.floor(level / 10));
  
  if (success) {
    const rewards: Record<string, number> = {};
    for (const [k, v] of Object.entries(choice.outcome.successReward)) {
      rewards[k] = Math.floor(v * scale);
    }
    return { success: true, rewards, message: choice.outcome.message };
  } else {
    const rewards: Record<string, number> = {};
    if (choice.outcome.failPenalty) {
      for (const [k, v] of Object.entries(choice.outcome.failPenalty)) {
        rewards[k] = Math.floor(v * scale);
      }
    }
    return { success: false, rewards, message: choice.outcome.failMessage ?? '失败了...' };
  }
}
