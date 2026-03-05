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
