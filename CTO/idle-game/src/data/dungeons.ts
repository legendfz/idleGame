/**
 * v1.3 副本/关卡静态数据配置
 * 数据来源：CPO v1.3 数据配置表 + CTO 类型定义
 */

export interface BossSkill {
  name: string;
  damage: number;
  cooldown: number; // seconds
  type: 'single' | 'aoe';
  warning: string;
}

export interface BossPhase {
  hpThreshold: number; // 0-1, triggers when boss HP% <= this
  attackMultiplier: number;
  description: string;
}

export interface DungeonWave {
  type: 'minion' | 'elite' | 'boss';
  enemyName: string;
  enemyIcon: string;
  count: number;
  hp: number;
  attack: number;
  defense: number;
}

export interface DungeonRewardConfig {
  lingshi: [number, number]; // [min, max]
  exp: [number, number];
  pantao: number;
  equipDropChance: number; // 0-1
  equipQualityMin: string;
}

export interface DungeonConfig {
  id: string;
  name: string;
  chapter: number;
  icon: string;
  requiredLevel: number;
  requiredRealmIndex: number;
  prerequisite: string | null;
  dailyLimit: number;
  timeLimit: number; // seconds
  description: string;
  waves: DungeonWave[];
  boss: {
    name: string;
    icon: string;
    hp: number;
    attack: number;
    defense: number;
    skills: BossSkill[];
    phases: BossPhase[];
  };
  rewards: DungeonRewardConfig;
  firstClearReward: {
    equipTemplateId: string | null;
    pantao: number;
    lingshi: number;
  };
}

export const DUNGEONS: DungeonConfig[] = [
  {
    id: 'wuxingshan',
    name: '五行山',
    chapter: 1,
    icon: '🏔️',
    requiredLevel: 10,
    requiredRealmIndex: 1,
    prerequisite: null,
    dailyLimit: 3,
    timeLimit: 300,
    description: '五行山下，石灵觉醒，封印之力化为妖邪。取经路的第一难。',
    waves: [
      { type: 'minion', enemyName: '石精', enemyIcon: '🪨', count: 3, hp: 200, attack: 25, defense: 15 },
      { type: 'minion', enemyName: '山魈', enemyIcon: '👹', count: 2, hp: 300, attack: 30, defense: 10 },
      { type: 'minion', enemyName: '石精', enemyIcon: '🪨', count: 2, hp: 200, attack: 25, defense: 15 },
      { type: 'minion', enemyName: '山魈', enemyIcon: '👹', count: 2, hp: 300, attack: 30, defense: 10 },
      { type: 'minion', enemyName: '封印傀儡', enemyIcon: '🗿', count: 2, hp: 500, attack: 40, defense: 25 },
      { type: 'elite', enemyName: '五行石将', enemyIcon: '⛰️', count: 1, hp: 1200, attack: 60, defense: 40 },
      { type: 'elite', enemyName: '封印守卫', enemyIcon: '🛡️', count: 1, hp: 1500, attack: 50, defense: 60 },
    ],
    boss: {
      name: '五行山石灵',
      icon: '🗻',
      hp: 8000,
      attack: 80,
      defense: 50,
      skills: [
        { name: '巨石崩击', damage: 150, cooldown: 8, type: 'single', warning: '石灵举起巨拳！' },
        { name: '五行震荡', damage: 80, cooldown: 15, type: 'aoe', warning: '大地开始颤抖！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '石灵觉醒' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '五行狂暴！石灵吸收山脉之力！' },
      ],
    },
    rewards: { lingshi: [3000, 7000], exp: [500, 1100], pantao: 0, equipDropChance: 0.3, equipQualityMin: 'common' },
    firstClearReward: { equipTemplateId: 'stone_chain_armor', pantao: 10, lingshi: 10000 },
  },
  {
    id: 'yingchoujian',
    name: '鹰愁涧',
    chapter: 2,
    icon: '🌊',
    requiredLevel: 20,
    requiredRealmIndex: 1,
    prerequisite: 'wuxingshan',
    dailyLimit: 3,
    timeLimit: 300,
    description: '涧中白龙翻波逐浪，正是西海龙王三太子。降服他，便得白龙马。',
    waves: [
      { type: 'minion', enemyName: '水妖', enemyIcon: '🐟', count: 3, hp: 350, attack: 35, defense: 12 },
      { type: 'minion', enemyName: '蛟灵', enemyIcon: '🐉', count: 2, hp: 500, attack: 45, defense: 18 },
      { type: 'minion', enemyName: '水妖', enemyIcon: '🐟', count: 3, hp: 350, attack: 35, defense: 12 },
      { type: 'minion', enemyName: '涧底虾兵', enemyIcon: '🦐', count: 5, hp: 250, attack: 30, defense: 8 },
      { type: 'minion', enemyName: '蛟灵', enemyIcon: '🐉', count: 3, hp: 500, attack: 45, defense: 18 },
      { type: 'elite', enemyName: '涧龙卫', enemyIcon: '🐲', count: 1, hp: 2000, attack: 75, defense: 45 },
      { type: 'elite', enemyName: '水幕护法', enemyIcon: '🌊', count: 1, hp: 1800, attack: 65, defense: 55 },
    ],
    boss: {
      name: '小白龙',
      icon: '🐲',
      hp: 15000,
      attack: 120,
      defense: 60,
      skills: [
        { name: '龙息喷涌', damage: 200, cooldown: 10, type: 'aoe', warning: '白龙深吸一口气！' },
        { name: '龙尾横扫', damage: 300, cooldown: 12, type: 'single', warning: '白龙转身甩尾！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '白龙怒啸' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '白龙化为真身！' },
      ],
    },
    rewards: { lingshi: [5000, 11000], exp: [1000, 2000], pantao: 0, equipDropChance: 0.25, equipQualityMin: 'spirit' },
    firstClearReward: { equipTemplateId: 'white_dragon_scale', pantao: 10, lingshi: 15000 },
  },
  {
    id: 'gaolaozhuang',
    name: '高老庄',
    chapter: 3,
    icon: '🏠',
    requiredLevel: 35,
    requiredRealmIndex: 2,
    prerequisite: 'yingchoujian',
    dailyLimit: 3,
    timeLimit: 300,
    description: '高老庄中妖怪作乱，天蓬元帅下凡为猪。一番恶战后收为弟子。',
    waves: [
      { type: 'minion', enemyName: '猪妖小兵', enemyIcon: '🐷', count: 3, hp: 500, attack: 50, defense: 20 },
      { type: 'minion', enemyName: '野猪精', enemyIcon: '🐗', count: 2, hp: 700, attack: 60, defense: 30 },
      { type: 'minion', enemyName: '猪妖小兵', enemyIcon: '🐷', count: 4, hp: 500, attack: 50, defense: 20 },
      { type: 'minion', enemyName: '野猪精', enemyIcon: '🐗', count: 3, hp: 700, attack: 60, defense: 30 },
      { type: 'minion', enemyName: '猪妖小兵', enemyIcon: '🐷', count: 2, hp: 500, attack: 50, defense: 20 },
      { type: 'elite', enemyName: '猪妖统领', enemyIcon: '🐖', count: 1, hp: 3000, attack: 100, defense: 55 },
      { type: 'elite', enemyName: '高老庄护院', enemyIcon: '💪', count: 1, hp: 2500, attack: 90, defense: 65 },
    ],
    boss: {
      name: '猪八戒',
      icon: '🐽',
      hp: 25000,
      attack: 160,
      defense: 80,
      skills: [
        { name: '九齿钉耙', damage: 400, cooldown: 8, type: 'single', warning: '八戒举起钉耙！' },
        { name: '泰山压顶', damage: 250, cooldown: 15, type: 'aoe', warning: '八戒跳了起来！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '天蓬元帅显威' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '八戒恼羞成怒！' },
      ],
    },
    rewards: { lingshi: [8000, 16000], exp: [1500, 3500], pantao: 0, equipDropChance: 0.3, equipQualityMin: 'spirit' },
    firstClearReward: { equipTemplateId: 'broken_rake', pantao: 10, lingshi: 20000 },
  },
  {
    id: 'liushahe',
    name: '流沙河',
    chapter: 4,
    icon: '🏜️',
    requiredLevel: 50,
    requiredRealmIndex: 3,
    prerequisite: 'gaolaozhuang',
    dailyLimit: 3,
    timeLimit: 300,
    description: '流沙河中沙僧拦路，卷帘大将一身煞气。',
    waves: [
      { type: 'minion', enemyName: '沙蝎', enemyIcon: '🦂', count: 3, hp: 800, attack: 70, defense: 25 },
      { type: 'minion', enemyName: '流沙鬼卒', enemyIcon: '💀', count: 2, hp: 1000, attack: 80, defense: 35 },
      { type: 'minion', enemyName: '沙蝎', enemyIcon: '🦂', count: 4, hp: 800, attack: 70, defense: 25 },
      { type: 'minion', enemyName: '流沙鬼卒', enemyIcon: '💀', count: 3, hp: 1000, attack: 80, defense: 35 },
      { type: 'minion', enemyName: '沙蝎', enemyIcon: '🦂', count: 2, hp: 800, attack: 70, defense: 25 },
      { type: 'elite', enemyName: '河底蛟龙', enemyIcon: '🐊', count: 1, hp: 4000, attack: 130, defense: 70 },
      { type: 'elite', enemyName: '沙暴魔将', enemyIcon: '🌪️', count: 1, hp: 3500, attack: 140, defense: 50 },
    ],
    boss: {
      name: '沙悟净',
      icon: '🧔',
      hp: 40000,
      attack: 200,
      defense: 110,
      skills: [
        { name: '降妖宝杖', damage: 500, cooldown: 7, type: 'single', warning: '沙僧挥杖！' },
        { name: '流沙漩涡', damage: 300, cooldown: 18, type: 'aoe', warning: '河水开始翻涌！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '卷帘大将' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '沙僧暴怒，流沙席卷！' },
      ],
    },
    rewards: { lingshi: [10000, 20000], exp: [2500, 5500], pantao: 1, equipDropChance: 0.35, equipQualityMin: 'immortal' },
    firstClearReward: { equipTemplateId: 'shadow_staff', pantao: 10, lingshi: 25000 },
  },
  {
    id: 'shepanshan',
    name: '蛇盘山',
    chapter: 5,
    icon: '🐍',
    requiredLevel: 45,
    requiredRealmIndex: 2,
    prerequisite: 'gaolaozhuang',
    dailyLimit: 3,
    timeLimit: 300,
    description: '蛇盘山上蟒蛇精盘踞，毒雾弥漫，行路艰难。',
    waves: [
      { type: 'minion', enemyName: '毒蛇', enemyIcon: '🐍', count: 4, hp: 600, attack: 65, defense: 15 },
      { type: 'minion', enemyName: '蛇妖', enemyIcon: '🐍', count: 2, hp: 900, attack: 75, defense: 25 },
      { type: 'minion', enemyName: '毒蛇', enemyIcon: '🐍', count: 3, hp: 600, attack: 65, defense: 15 },
      { type: 'minion', enemyName: '蛇妖', enemyIcon: '🐍', count: 3, hp: 900, attack: 75, defense: 25 },
      { type: 'minion', enemyName: '毒蛇', enemyIcon: '🐍', count: 5, hp: 600, attack: 65, defense: 15 },
      { type: 'elite', enemyName: '蛇王卫士', enemyIcon: '🐉', count: 1, hp: 3500, attack: 120, defense: 50 },
      { type: 'elite', enemyName: '毒雾蛇灵', enemyIcon: '☠️', count: 1, hp: 3000, attack: 110, defense: 40 },
    ],
    boss: {
      name: '蟒蛇精',
      icon: '🐍',
      hp: 35000,
      attack: 180,
      defense: 90,
      skills: [
        { name: '毒雾喷射', damage: 250, cooldown: 10, type: 'aoe', warning: '蟒蛇精张开巨口！' },
        { name: '缠绕绞杀', damage: 600, cooldown: 20, type: 'single', warning: '蟒蛇精盘起身躯！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '蟒蛇精吐信' },
        { hpThreshold: 0.5, attackMultiplier: 1.4, description: '蟒蛇精暴怒缠绕！' },
      ],
    },
    rewards: { lingshi: [9000, 17000], exp: [2000, 5000], pantao: 1, equipDropChance: 0.3, equipQualityMin: 'spirit' },
    firstClearReward: { equipTemplateId: 'snake_skin_armor', pantao: 10, lingshi: 22000 },
  },
  {
    id: 'huangfengling',
    name: '黄风岭',
    chapter: 6,
    icon: '👁️',
    requiredLevel: 60,
    requiredRealmIndex: 4,
    prerequisite: 'liushahe',
    dailyLimit: 3,
    timeLimit: 300,
    description: '黄风怪吹起三昧神风，遮天蔽日，令人目不能视。',
    waves: [
      { type: 'minion', enemyName: '黄风小妖', enemyIcon: '🐀', count: 3, hp: 1000, attack: 85, defense: 30 },
      { type: 'minion', enemyName: '风蝠', enemyIcon: '🦇', count: 4, hp: 800, attack: 95, defense: 15 },
      { type: 'minion', enemyName: '黄风小妖', enemyIcon: '🐀', count: 2, hp: 1000, attack: 85, defense: 30 },
      { type: 'minion', enemyName: '风蝠', enemyIcon: '🦇', count: 2, hp: 800, attack: 95, defense: 15 },
      { type: 'minion', enemyName: '黄风小妖', enemyIcon: '🐀', count: 4, hp: 1000, attack: 85, defense: 30 },
      { type: 'elite', enemyName: '风暴鬼将', enemyIcon: '🌪️', count: 1, hp: 5000, attack: 160, defense: 70 },
      { type: 'elite', enemyName: '黄风先锋', enemyIcon: '⚔️', count: 1, hp: 4500, attack: 150, defense: 80 },
    ],
    boss: {
      name: '黄风怪',
      icon: '🐀',
      hp: 55000,
      attack: 240,
      defense: 120,
      skills: [
        { name: '三昧神风', damage: 400, cooldown: 12, type: 'aoe', warning: '黄风怪张口吐风！' },
        { name: '飞沙走石', damage: 350, cooldown: 8, type: 'single', warning: '沙尘暴来袭！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '黄风初起' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '三昧神风大作！' },
      ],
    },
    rewards: { lingshi: [12000, 24000], exp: [3000, 7000], pantao: 2, equipDropChance: 0.4, equipQualityMin: 'immortal' },
    firstClearReward: { equipTemplateId: 'wind_eye_amulet', pantao: 10, lingshi: 30000 },
  },
  {
    id: 'huoyanshan',
    name: '火焰山',
    chapter: 7,
    icon: '🔥',
    requiredLevel: 70,
    requiredRealmIndex: 4,
    prerequisite: 'huangfengling',
    dailyLimit: 3,
    timeLimit: 300,
    description: '火焰山八百里火焰，非芭蕉扇不能熄灭。牛魔王与铁扇公主联手阻路。',
    waves: [
      { type: 'minion', enemyName: '火鸦', enemyIcon: '🔥', count: 3, hp: 1200, attack: 100, defense: 25 },
      { type: 'minion', enemyName: '炎魔兵', enemyIcon: '👿', count: 2, hp: 1500, attack: 110, defense: 40 },
      { type: 'minion', enemyName: '火鸦', enemyIcon: '🔥', count: 2, hp: 1200, attack: 100, defense: 25 },
      { type: 'minion', enemyName: '炎魔兵', enemyIcon: '👿', count: 3, hp: 1500, attack: 110, defense: 40 },
      { type: 'minion', enemyName: '火鸦', enemyIcon: '🔥', count: 5, hp: 1200, attack: 100, defense: 25 },
      { type: 'elite', enemyName: '铁扇公主', enemyIcon: '👸', count: 1, hp: 8000, attack: 180, defense: 90 },
      { type: 'elite', enemyName: '红孩儿', enemyIcon: '👦', count: 1, hp: 7000, attack: 200, defense: 70 },
    ],
    boss: {
      name: '牛魔王',
      icon: '🐂',
      hp: 120000,
      attack: 350,
      defense: 180,
      skills: [
        { name: '铁扇烈焰', damage: 1200, cooldown: 15, type: 'aoe', warning: '铁扇公主摇动芭蕉扇！' },
        { name: '狂牛冲撞', damage: 1800, cooldown: 10, type: 'single', warning: '牛魔王低头冲来！' },
        { name: '大力牛魔真身', damage: 2500, cooldown: 25, type: 'aoe', warning: '牛魔王现出原形！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '牛魔王持叉迎战' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '牛魔王狂暴！铁扇公主助阵！' },
      ],
    },
    rewards: { lingshi: [15000, 25000], exp: [5000, 9000], pantao: 3, equipDropChance: 0.45, equipQualityMin: 'immortal' },
    firstClearReward: { equipTemplateId: 'banana_fan_shard', pantao: 15, lingshi: 40000 },
  },
  {
    id: 'pansidong',
    name: '盘丝洞',
    chapter: 8,
    icon: '🕸️',
    requiredLevel: 85,
    requiredRealmIndex: 5,
    prerequisite: 'huoyanshan',
    dailyLimit: 3,
    timeLimit: 300,
    description: '七个蜘蛛精盘踞盘丝洞，以蛛丝为网，困杀过路行人。',
    waves: [
      { type: 'minion', enemyName: '蛛丝小妖', enemyIcon: '🕷️', count: 3, hp: 1800, attack: 130, defense: 40 },
      { type: 'minion', enemyName: '毒蛛卫', enemyIcon: '🕷️', count: 2, hp: 2200, attack: 150, defense: 50 },
      { type: 'minion', enemyName: '蛛丝小妖', enemyIcon: '🕷️', count: 4, hp: 1800, attack: 130, defense: 40 },
      { type: 'minion', enemyName: '毒蛛卫', enemyIcon: '🕷️', count: 3, hp: 2200, attack: 150, defense: 50 },
      { type: 'minion', enemyName: '蛛丝小妖', enemyIcon: '🕷️', count: 3, hp: 1800, attack: 130, defense: 40 },
      { type: 'elite', enemyName: '蛛后护法', enemyIcon: '🕸️', count: 1, hp: 8000, attack: 220, defense: 100 },
      { type: 'elite', enemyName: '丝网魔将', enemyIcon: '🕸️', count: 1, hp: 7500, attack: 200, defense: 110 },
    ],
    boss: {
      name: '七蜘蛛精',
      icon: '🕷️',
      hp: 120000,
      attack: 300,
      defense: 150,
      skills: [
        { name: '天罗地网', damage: 500, cooldown: 12, type: 'aoe', warning: '蛛丝从四面八方射来！' },
        { name: '噬魂毒牙', damage: 800, cooldown: 18, type: 'single', warning: '蜘蛛精露出毒牙！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '七蛛结阵' },
        { hpThreshold: 0.5, attackMultiplier: 1.6, description: '蜘蛛精合体为蛛后！' },
      ],
    },
    rewards: { lingshi: [18000, 32000], exp: [6000, 12000], pantao: 3, equipDropChance: 0.5, equipQualityMin: 'divine' },
    firstClearReward: { equipTemplateId: 'spider_silk_robe', pantao: 15, lingshi: 50000 },
  },
  {
    id: 'shituoling',
    name: '狮驼岭',
    chapter: 9,
    icon: '🏯',
    requiredLevel: 100,
    requiredRealmIndex: 6,
    prerequisite: 'pansidong',
    dailyLimit: 3,
    timeLimit: 300,
    description: '狮驼岭三魔聚首：青狮、白象、大鹏。西行路上最凶险的一战。',
    waves: [
      { type: 'minion', enemyName: '狮驼小妖', enemyIcon: '👹', count: 3, hp: 2500, attack: 180, defense: 60 },
      { type: 'minion', enemyName: '象兵', enemyIcon: '🐘', count: 2, hp: 3000, attack: 160, defense: 90 },
      { type: 'minion', enemyName: '狮驼小妖', enemyIcon: '👹', count: 3, hp: 2500, attack: 180, defense: 60 },
      { type: 'minion', enemyName: '鹏妖卫', enemyIcon: '🦅', count: 3, hp: 2000, attack: 220, defense: 40 },
      { type: 'minion', enemyName: '象兵', enemyIcon: '🐘', count: 2, hp: 3000, attack: 160, defense: 90 },
      { type: 'elite', enemyName: '白象精', enemyIcon: '🐘', count: 1, hp: 12000, attack: 280, defense: 150 },
      { type: 'elite', enemyName: '青狮精', enemyIcon: '🦁', count: 1, hp: 15000, attack: 320, defense: 130 },
    ],
    boss: {
      name: '大鹏金翅',
      icon: '🦅',
      hp: 250000,
      attack: 500,
      defense: 200,
      skills: [
        { name: '金翅斩', damage: 1500, cooldown: 8, type: 'single', warning: '大鹏展翅！' },
        { name: '吞天噬地', damage: 1000, cooldown: 20, type: 'aoe', warning: '天空暗了下来！' },
        { name: '三魔合击', damage: 2000, cooldown: 30, type: 'aoe', warning: '三大魔王同时发力！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '大鹏独战' },
        { hpThreshold: 0.5, attackMultiplier: 1.8, description: '三魔合击！青狮白象加入战斗！' },
      ],
    },
    rewards: { lingshi: [25000, 45000], exp: [10000, 20000], pantao: 5, equipDropChance: 0.6, equipQualityMin: 'divine' },
    firstClearReward: { equipTemplateId: 'chaos_yinyang_bottle', pantao: 20, lingshi: 80000 },
  },
  {
    id: 'lingshan',
    name: '灵山雷音寺',
    chapter: 10,
    icon: '🏛️',
    requiredLevel: 150,
    requiredRealmIndex: 7,
    prerequisite: 'shituoling',
    dailyLimit: 3,
    timeLimit: 600,
    description: '取经路的终点，如来设下最终考验。九九八十一难的终章。',
    waves: [
      { type: 'minion', enemyName: '金刚力士', enemyIcon: '💪', count: 2, hp: 5000, attack: 300, defense: 150 },
      { type: 'minion', enemyName: '天兵', enemyIcon: '⚔️', count: 3, hp: 4000, attack: 280, defense: 120 },
      { type: 'minion', enemyName: '金刚力士', enemyIcon: '💪', count: 2, hp: 5000, attack: 300, defense: 150 },
      { type: 'elite', enemyName: '四大天王·增长', enemyIcon: '👑', count: 1, hp: 20000, attack: 400, defense: 200 },
      { type: 'elite', enemyName: '四大天王·广目', enemyIcon: '👑', count: 1, hp: 20000, attack: 380, defense: 220 },
      { type: 'elite', enemyName: '韦陀护法', enemyIcon: '🛡️', count: 1, hp: 30000, attack: 450, defense: 300 },
      { type: 'elite', enemyName: '观音化身', enemyIcon: '🙏', count: 1, hp: 25000, attack: 500, defense: 250 },
    ],
    boss: {
      name: '如来考验',
      icon: '☸️',
      hp: 1000000,
      attack: 800,
      defense: 400,
      skills: [
        { name: '如来神掌', damage: 5000, cooldown: 10, type: 'single', warning: '金光大盛！' },
        { name: '佛光普照', damage: 3000, cooldown: 8, type: 'aoe', warning: '金光万丈！' },
        { name: '法轮转世', damage: 8000, cooldown: 25, type: 'aoe', warning: '法轮在空中旋转！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '如来初试' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '如来正式考验！' },
        { hpThreshold: 0.2, attackMultiplier: 2, description: '最终试炼！大彻大悟之门！' },
      ],
    },
    rewards: { lingshi: [80000, 120000], exp: [30000, 70000], pantao: 10, equipDropChance: 0.8, equipQualityMin: 'legendary' },
    firstClearReward: { equipTemplateId: 'hongmeng_diamond_sutra', pantao: 50, lingshi: 200000 },
  },
];

/** Get dungeon by id */
export function getDungeon(id: string): DungeonConfig | undefined {
  return DUNGEONS.find(d => d.id === id);
}

/** Get dungeons sorted by chapter */
export function getDungeonsByChapter(): DungeonConfig[] {
  return [...DUNGEONS].sort((a, b) => a.chapter - b.chapter);
}
