/**
 * v1.3 副本/关卡静态数据配置
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
    description: '五百年的封印终于松动，石灵在山中觉醒…',
    waves: [
      { type: 'minion', enemyName: '山石精', enemyIcon: '🪨', count: 5, hp: 200, attack: 15, defense: 5 },
      { type: 'minion', enemyName: '山石精', enemyIcon: '🪨', count: 5, hp: 300, attack: 20, defense: 8 },
      { type: 'elite', enemyName: '巨岩魔', enemyIcon: '⛰️', count: 2, hp: 800, attack: 40, defense: 15 },
    ],
    boss: {
      name: '五行山石灵',
      icon: '🏔️',
      hp: 5000,
      attack: 60,
      defense: 20,
      skills: [
        { name: '山崩地裂', damage: 150, cooldown: 8, type: 'aoe', warning: '大地开始震动…' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '石灵苏醒' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：石灵化为巨人！' },
      ],
    },
    rewards: { lingshi: [5000, 8000], exp: [3000, 5000], pantao: 1, equipDropChance: 0.3, equipQualityMin: 'common' },
    firstClearReward: { equipTemplateId: null, pantao: 10, lingshi: 20000 },
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
    description: '涧中白龙盘踞，欲吞唐僧白马…',
    waves: [
      { type: 'minion', enemyName: '水妖', enemyIcon: '🌊', count: 5, hp: 500, attack: 30, defense: 10 },
      { type: 'minion', enemyName: '水妖', enemyIcon: '🌊', count: 5, hp: 600, attack: 35, defense: 12 },
      { type: 'elite', enemyName: '蛟龙兵', enemyIcon: '🐉', count: 2, hp: 1500, attack: 60, defense: 25 },
    ],
    boss: {
      name: '小白龙',
      icon: '🐲',
      hp: 12000,
      attack: 100,
      defense: 35,
      skills: [
        { name: '龙息', damage: 250, cooldown: 7, type: 'single', warning: '小白龙深吸一口气…' },
        { name: '水柱冲击', damage: 180, cooldown: 10, type: 'aoe', warning: '涧水开始翻涌！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '白龙出水' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：白龙化为人形！' },
      ],
    },
    rewards: { lingshi: [8000, 12000], exp: [5000, 8000], pantao: 1, equipDropChance: 0.35, equipQualityMin: 'spirit' },
    firstClearReward: { equipTemplateId: null, pantao: 10, lingshi: 30000 },
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
    description: '庄中妖怪强占民女，原来是天蓬元帅下凡…',
    waves: [
      { type: 'minion', enemyName: '野猪精', enemyIcon: '🐗', count: 5, hp: 1000, attack: 55, defense: 18 },
      { type: 'minion', enemyName: '野猪精', enemyIcon: '🐗', count: 5, hp: 1200, attack: 60, defense: 20 },
      { type: 'elite', enemyName: '猪将军', enemyIcon: '🐷', count: 2, hp: 3000, attack: 100, defense: 35 },
    ],
    boss: {
      name: '猪八戒',
      icon: '🐷',
      hp: 25000,
      attack: 150,
      defense: 50,
      skills: [
        { name: '钉耙横扫', damage: 400, cooldown: 6, type: 'aoe', warning: '八戒挥舞钉耙！' },
        { name: '翻滚冲撞', damage: 600, cooldown: 12, type: 'single', warning: '八戒蓄力冲撞！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '猪八戒发怒' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：八戒现出天蓬真身！' },
      ],
    },
    rewards: { lingshi: [12000, 18000], exp: [8000, 12000], pantao: 2, equipDropChance: 0.4, equipQualityMin: 'spirit' },
    firstClearReward: { equipTemplateId: null, pantao: 10, lingshi: 50000 },
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
    description: '流沙河中妖怪出没，原来是卷帘大将…',
    waves: [
      { type: 'minion', enemyName: '沙怪', enemyIcon: '🏜️', count: 5, hp: 2000, attack: 80, defense: 30 },
      { type: 'minion', enemyName: '沙怪', enemyIcon: '🏜️', count: 5, hp: 2500, attack: 90, defense: 35 },
      { type: 'elite', enemyName: '流沙将', enemyIcon: '⚔️', count: 2, hp: 5000, attack: 150, defense: 50 },
    ],
    boss: {
      name: '沙悟净',
      icon: '🧔',
      hp: 50000,
      attack: 220,
      defense: 70,
      skills: [
        { name: '降妖杖击', damage: 600, cooldown: 7, type: 'single', warning: '沙僧举起降妖杖！' },
        { name: '流沙漩涡', damage: 450, cooldown: 10, type: 'aoe', warning: '河水形成漩涡！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '沙悟净拦路' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：沙僧现出真身！' },
      ],
    },
    rewards: { lingshi: [18000, 25000], exp: [12000, 18000], pantao: 2, equipDropChance: 0.4, equipQualityMin: 'immortal' },
    firstClearReward: { equipTemplateId: null, pantao: 10, lingshi: 80000 },
  },
  {
    id: 'huoyanshan',
    name: '火焰山',
    chapter: 5,
    icon: '🔥',
    requiredLevel: 70,
    requiredRealmIndex: 4,
    prerequisite: 'liushahe',
    dailyLimit: 3,
    timeLimit: 300,
    description: '火焰山八百里火海，需借芭蕉扇方可通过…',
    waves: [
      { type: 'minion', enemyName: '火精灵', enemyIcon: '🔥', count: 5, hp: 4000, attack: 120, defense: 45 },
      { type: 'minion', enemyName: '火精灵', enemyIcon: '🔥', count: 5, hp: 5000, attack: 140, defense: 50 },
      { type: 'elite', enemyName: '铁扇公主', enemyIcon: '🪭', count: 1, hp: 15000, attack: 250, defense: 80 },
      { type: 'elite', enemyName: '红孩儿', enemyIcon: '👶', count: 1, hp: 12000, attack: 300, defense: 60 },
    ],
    boss: {
      name: '牛魔王',
      icon: '🐂',
      hp: 120000,
      attack: 350,
      defense: 100,
      skills: [
        { name: '铁扇烈焰', damage: 1200, cooldown: 8, type: 'aoe', warning: '牛魔王召唤烈焰！' },
        { name: '牛角冲撞', damage: 1800, cooldown: 12, type: 'single', warning: '牛魔王低头蓄力！' },
        { name: '狂牛践踏', damage: 800, cooldown: 15, type: 'aoe', warning: '大地开始颤抖…' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '牛魔王现身' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：牛魔王化为大白牛！' },
      ],
    },
    rewards: { lingshi: [25000, 40000], exp: [18000, 25000], pantao: 3, equipDropChance: 0.5, equipQualityMin: 'immortal' },
    firstClearReward: { equipTemplateId: null, pantao: 15, lingshi: 150000 },
  },
  {
    id: 'pansidong',
    name: '盘丝洞',
    chapter: 6,
    icon: '🕸️',
    requiredLevel: 85,
    requiredRealmIndex: 5,
    prerequisite: 'huoyanshan',
    dailyLimit: 3,
    timeLimit: 300,
    description: '七个蜘蛛精盘踞此处，以丝网困人…',
    waves: [
      { type: 'minion', enemyName: '蛛丝妖', enemyIcon: '🕸️', count: 5, hp: 6000, attack: 180, defense: 60 },
      { type: 'minion', enemyName: '蛛丝妖', enemyIcon: '🕸️', count: 5, hp: 7000, attack: 200, defense: 65 },
      { type: 'elite', enemyName: '蜘蛛将', enemyIcon: '🕷️', count: 2, hp: 20000, attack: 350, defense: 100 },
    ],
    boss: {
      name: '蜘蛛精王',
      icon: '🕷️',
      hp: 200000,
      attack: 450,
      defense: 130,
      skills: [
        { name: '毒丝缠绕', damage: 1500, cooldown: 7, type: 'single', warning: '蛛丝从四面八方袭来！' },
        { name: '蛛网陷阱', damage: 1000, cooldown: 10, type: 'aoe', warning: '地面出现蛛网！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '蜘蛛精现身' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：七蛛合体！' },
      ],
    },
    rewards: { lingshi: [40000, 60000], exp: [25000, 35000], pantao: 3, equipDropChance: 0.5, equipQualityMin: 'divine' },
    firstClearReward: { equipTemplateId: null, pantao: 15, lingshi: 250000 },
  },
  {
    id: 'shituoling',
    name: '狮驼岭',
    chapter: 7,
    icon: '🏯',
    requiredLevel: 100,
    requiredRealmIndex: 6,
    prerequisite: 'pansidong',
    dailyLimit: 3,
    timeLimit: 300,
    description: '三大魔王盘踞，实力通天…',
    waves: [
      { type: 'minion', enemyName: '狮驼兵', enemyIcon: '🦁', count: 5, hp: 10000, attack: 250, defense: 80 },
      { type: 'minion', enemyName: '狮驼兵', enemyIcon: '🦁', count: 5, hp: 12000, attack: 280, defense: 90 },
      { type: 'elite', enemyName: '象将军', enemyIcon: '🐘', count: 1, hp: 40000, attack: 500, defense: 150 },
      { type: 'elite', enemyName: '大鹏精', enemyIcon: '🦅', count: 1, hp: 35000, attack: 600, defense: 120 },
    ],
    boss: {
      name: '青狮精',
      icon: '🦁',
      hp: 500000,
      attack: 700,
      defense: 200,
      skills: [
        { name: '狮子吼', damage: 3000, cooldown: 8, type: 'aoe', warning: '青狮张开血盆大口！' },
        { name: '利爪撕裂', damage: 4000, cooldown: 12, type: 'single', warning: '青狮蓄力扑击！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '青狮精现身' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：三魔合体！' },
      ],
    },
    rewards: { lingshi: [60000, 90000], exp: [35000, 50000], pantao: 5, equipDropChance: 0.6, equipQualityMin: 'divine' },
    firstClearReward: { equipTemplateId: null, pantao: 20, lingshi: 500000 },
  },
  {
    id: 'huangfengling',
    name: '黄风岭',
    chapter: 8,
    icon: '👁️',
    requiredLevel: 60,
    requiredRealmIndex: 4,
    prerequisite: 'liushahe',
    dailyLimit: 3,
    timeLimit: 300,
    description: '黄风怪善使妖风，迷人心智…',
    waves: [
      { type: 'minion', enemyName: '黄风妖', enemyIcon: '🌪️', count: 5, hp: 3000, attack: 100, defense: 40 },
      { type: 'minion', enemyName: '黄风妖', enemyIcon: '🌪️', count: 5, hp: 3500, attack: 110, defense: 45 },
      { type: 'elite', enemyName: '风将', enemyIcon: '💨', count: 2, hp: 8000, attack: 200, defense: 60 },
    ],
    boss: {
      name: '黄风怪',
      icon: '🐀',
      hp: 80000,
      attack: 280,
      defense: 85,
      skills: [
        { name: '三昧神风', damage: 1000, cooldown: 7, type: 'aoe', warning: '妖风大作！' },
        { name: '迷心术', damage: 500, cooldown: 15, type: 'single', warning: '黄风怪施展妖术…' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '黄风怪出洞' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：黄风大作！' },
      ],
    },
    rewards: { lingshi: [20000, 30000], exp: [15000, 22000], pantao: 2, equipDropChance: 0.45, equipQualityMin: 'immortal' },
    firstClearReward: { equipTemplateId: null, pantao: 10, lingshi: 100000 },
  },
  {
    id: 'shepanshan',
    name: '蛇盘山',
    chapter: 9,
    icon: '🐍',
    requiredLevel: 45,
    requiredRealmIndex: 2,
    prerequisite: 'gaolaozhuang',
    dailyLimit: 3,
    timeLimit: 300,
    description: '蟒蛇精盘踞山中，吞噬过路行人…',
    waves: [
      { type: 'minion', enemyName: '蛇妖', enemyIcon: '🐍', count: 5, hp: 1500, attack: 70, defense: 25 },
      { type: 'minion', enemyName: '蛇妖', enemyIcon: '🐍', count: 5, hp: 2000, attack: 80, defense: 28 },
      { type: 'elite', enemyName: '蟒蛇将', enemyIcon: '🐍', count: 2, hp: 4000, attack: 130, defense: 45 },
    ],
    boss: {
      name: '蟒蛇精',
      icon: '🐍',
      hp: 40000,
      attack: 200,
      defense: 60,
      skills: [
        { name: '缠绕绞杀', damage: 500, cooldown: 8, type: 'single', warning: '蟒蛇精缠住了你！' },
        { name: '毒雾', damage: 350, cooldown: 10, type: 'aoe', warning: '毒雾弥漫…' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '蟒蛇精出洞' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：蟒蛇精巨化！' },
      ],
    },
    rewards: { lingshi: [15000, 22000], exp: [10000, 15000], pantao: 2, equipDropChance: 0.4, equipQualityMin: 'spirit' },
    firstClearReward: { equipTemplateId: null, pantao: 10, lingshi: 60000 },
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
    timeLimit: 300,
    description: '取经终点，如来的最终考验…',
    waves: [
      { type: 'minion', enemyName: '金刚力士', enemyIcon: '💪', count: 5, hp: 20000, attack: 400, defense: 120 },
      { type: 'minion', enemyName: '金刚力士', enemyIcon: '💪', count: 5, hp: 25000, attack: 450, defense: 140 },
      { type: 'elite', enemyName: '罗汉', enemyIcon: '🧘', count: 2, hp: 60000, attack: 700, defense: 200 },
      { type: 'elite', enemyName: '菩萨', enemyIcon: '🙏', count: 1, hp: 100000, attack: 900, defense: 250 },
    ],
    boss: {
      name: '如来考验',
      icon: '☸️',
      hp: 1000000,
      attack: 1200,
      defense: 300,
      skills: [
        { name: '五指山', damage: 5000, cooldown: 10, type: 'single', warning: '如来伸出手掌…' },
        { name: '佛光普照', damage: 3000, cooldown: 8, type: 'aoe', warning: '金光万丈！' },
        { name: '天降神雷', damage: 8000, cooldown: 20, type: 'single', warning: '雷云聚集…' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '如来微笑' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：如来展现真身！' },
        { hpThreshold: 0.2, attackMultiplier: 2, description: '最终考验：佛光大显！' },
      ],
    },
    rewards: { lingshi: [100000, 200000], exp: [80000, 120000], pantao: 10, equipDropChance: 0.8, equipQualityMin: 'legendary' },
    firstClearReward: { equipTemplateId: null, pantao: 50, lingshi: 2000000 },
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
