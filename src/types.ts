// === Core Game Types ===

export interface PlayerState {
  name: string;
  level: number;
  exp: number;
  lingshi: number;
  pantao: number;
  realmIndex: number;
  stats: Stats;
  clickPower: number;
  // v1.2: Refine & enhance items
  hongmengShards: number;   // 鸿蒙碎片
  tianmingScrolls: number;  // 天命符 (refine +5%)
  protectScrolls: number;   // 护级符 (prevent downgrade)
  luckyScrolls: number;     // 幸运符 (enhance +10%)
  // v12.0 统计
  totalCultivateTime: number;
  maxDamage: number;
  totalEquipDrops: number;
  totalKills: number;
  totalGoldEarned: number;
  totalBossKills: number;
  totalEliteKills?: number; // v151.0
  tribulationWins?: number; // v171.0: 天劫通关次数
  worldBossKills?: number; // v171.0: 世界Boss击杀数
  weeklyBossKills?: number; // v171.0: 周天Boss击杀数
  totalCrits: number;
  totalEnhances: number;
  totalBreakthroughs: number;
  // v12.0 教程
  tutorialStep: number;      // 0=未开始, 1-5=进行中, 6=完成
  tutorialDone: boolean;
  systemTutorials: string[]; // 已看过的系统教程id
  // v22.0 转世系统
  reincarnations: number;      // 转世次数
  daoPoints: number;           // 道点（转世货币）
  totalDaoPoints: number;      // 历史总道点
  reincPerks: Record<string, number>; // 永久加成 {perkId: level}
  // v51.0 图鉴
  codexEquipIds: string[];           // 已收集装备模板ID
  codexEnemyNames: string[];         // 已遭遇敌人名
  // v52.0 主动技能
  activeSkills: ActiveSkillState;
  // v53.0 消耗品
  consumableInventory: Record<string, number>;  // buffId → count
  activeConsumables: ActiveConsumable[];
  // v59.0 觉醒
  awakening: { unlockedNodes: string[]; selectedPath: string | null };
  awakeningPoints: number;
  // v55.0 轮回试炼
  trialTokens: number;
  trialBestFloor: number;
  trialShopPurchases: Record<string, number>; // shopItemId → count
  // v107.0 灵兽
  petLevels: Record<string, number>;   // petId → level
  petEvolutions: Record<string, number>; // petId → evolution stage (0-3)
  activePetId: string | null;          // currently summoned pet
  // v115.0
  bestKillStreak: number;              // highest kill streak ever
  allTimeLingshi: number;              // v144.0: total lingshi earned all time
  fastestReincTime: number;            // v152.0: fastest reincarnation time in seconds (0=never)
  totalReincarnations: number;         // v152.0: all-time reincarnation count (across transcends)
  reincStartTime: number;              // v152.0: totalPlayTime when current reincarnation started
  highestLevelEver: number;            // v153.0: highest level ever reached (across all reincarnations)
  pinnedAchievement: string | null;    // pinned achievement id for battle page
  // v155.0 宝石系统
  gemInventory: { typeId: string; level: number }[];  // unequipped gems
  equippedGems: Record<string, { typeId: string; level: number }[]>; // equipUid → gems[]
  // v116.0
  transcendCount: number;
  transcendPoints: number;
  totalTranscendPoints: number;
  transcendPerks: Record<string, number>;
}

export interface ActiveSkillState {
  cooldowns: Record<string, number>;  // skillId → remaining seconds
  buffs: Record<string, number>;      // skillId → remaining duration
}

// v53.0 消耗品临时增益
export interface ConsumableBuff {
  id: string;
  name: string;
  emoji: string;
  description: string;
  durationSec: number;        // 持续时间（秒）
  effect: ConsumableEffect;
}

export interface ConsumableEffect {
  expMult?: number;           // 经验倍率加成 (如 1.0 = +100%)
  goldMult?: number;          // 灵石倍率加成
  dropRateMult?: number;      // 掉率倍率加成
  atkMult?: number;           // 攻击倍率加成
  critRateAdd?: number;       // 暴击率加成
}

export interface ActiveConsumable {
  buffId: string;
  remainingSec: number;
}

export interface Stats {
  attack: number;
  hp: number;
  maxHp: number;
  speed: number;    // attacks per second multiplier
  critRate: number;  // 0-100
  critDmg: number;   // multiplier, e.g. 1.5
}

export interface Enemy {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  defense: number;
  lingshiDrop: number;
  expDrop: number;
  pantaoDrop: number; // chance 0-1
  isBoss: boolean;
  // v151.0 精英敌人
  elite?: { id: string; name: string; emoji: string; color: string; rewardMul: number };
}

export interface Chapter {
  id: number;
  name: string;
  stages: number; // total stages
  levelRange: [number, number];
  description: string;
}

export interface Stage {
  chapterId: number;
  stageNum: number;
  waves: number;     // enemies per stage before boss
  enemyTemplate: EnemyTemplate;
  bossTemplate: EnemyTemplate;
}

export interface EnemyTemplate {
  name: string;
  emoji: string;
  baseHp: number;
  baseDefense: number;
  baseLingshi: number;
  baseExp: number;
  pantaoChance: number;
}

export interface BattleState {
  chapterId: number;
  stageNum: number;
  wave: number;
  maxWaves: number;
  currentEnemy: Enemy | null;
  log: BattleLogEntry[];
  isAutoBattle: boolean;
  isBossWave: boolean;
  killStreak: number;
  tribulation?: {
    active: boolean;
    realmIndex: number; // which realm we're breaking through to
    timer: number; // seconds remaining
  };
}

export interface BattleLogEntry {
  id: number;
  text: string;
  type: 'attack' | 'crit' | 'kill' | 'drop' | 'levelup' | 'info' | 'boss';
  timestamp: number;
}

export interface Realm {
  name: string;
  levelReq: number;
  pantaoReq: number;
  description: string;
  bonus: string;
}

// === Equipment Types ===

export type EquipSlot = 'weapon' | 'armor' | 'treasure';
export type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'legendary' | 'mythic';

export interface EquipmentTemplate {
  id: string;
  name: string;
  emoji: string;
  slot: EquipSlot;
  quality: Quality;
  baseStat: number;
  passive?: EquipPassive;
  setId?: string;
  dropFromStage: number;
  dropWeight: number;
}

export interface EquipPassive {
  type: 'critRate' | 'critDmg' | 'speed' | 'clickPower' | 'lingshiBonus' | 'expBonus' | 'offlineEfficiency';
  value: number;
  description: string;
}

export interface EquipmentItem {
  uid: string;
  templateId: string;
  name: string;
  emoji: string;
  slot: EquipSlot;
  quality: Quality;
  baseStat: number;
  level: number;
  passive?: EquipPassive;
  setId?: string;
  locked?: boolean;
  substats?: { type: string; value: number }[]; // v162.0 副属性
}

export interface EquipSet {
  id: string;
  name: string;
  pieces: string[];
  bonuses: { count: number; description: string; effect: Partial<Stats> }[];
}

/** Quality display info — using Unicode symbol prefixes per CDO spec */
export const QUALITY_INFO: Record<Quality, { label: string; symbol: string; multiplier: number; color: string }> = {
  common:    { label: '○凡品', symbol: '○', multiplier: 1,   color: '#aaa' },
  spirit:    { label: '●灵品', symbol: '●', multiplier: 2,   color: '#4caf50' },
  immortal:  { label: '◆仙品', symbol: '◆', multiplier: 5,   color: '#64b5f6' },
  divine:    { label: '★神品', symbol: '★', multiplier: 12,  color: '#ce93d8' },
  legendary: { label: '✧混沌', symbol: '✧', multiplier: 30,  color: '#f0c040' },
  mythic:    { label: '✦鸿蒙', symbol: '✦', multiplier: 80,  color: '#ff4444' },
};

export const INVENTORY_BASE = 200;
export const INVENTORY_PER_REINC = 50;
export const INVENTORY_CAP = 1000;
export const INVENTORY_MAX = 200; // legacy fallback, use getInventoryMax()

// v31.0 游戏设置
export interface GameSettings {
  battleSpeed: number;          // 1, 2, 5, 10
  autoDecomposeQuality: number; // 0=关闭, 1=凡品, 2=灵品以下, 3=仙品以下
  soundEnabled: boolean;
  soundVolume: number;
}

export type TabId = 'battle' | 'team' | 'journey' | 'bag' | 'achievement' | 'settings' | 'stats' | 'reincarnation' | 'sanctuary' | 'exploration' | 'affinity' | 'trial' | 'awakening' | 'pets';

/** Floating damage text */
export interface FloatingText {
  id: number;
  text: string;
  type: 'normal' | 'crit' | 'click' | 'gold' | 'exp' | 'levelup' | 'drop';
  timestamp: number;
}

export interface OfflineReport {
  duration: number;
  lingshi: number;
  exp: number;
  pantao: number;
  equipment: string[];
  kills: number;
  stagesCleared: number;
  levelsGained: number;
  comebackMul?: number;
}

export interface GameSave {
  version: number;
  player: PlayerState;
  battle: {
    chapterId: number;
    stageNum: number;
    wave: number;
  };
  highestChapter: number;
  highestStage: number;
  highestPower?: number; // v58.0: all-time best combat power
  highestAbyssFloor?: number; // v85.0: highest abyss floor
  allTimeKills?: number; // v85.0: total kills across reincarnations
  claimedAbyssMilestones?: number[]; // v86.0: claimed abyss milestones
  lastSaveTimestamp: number;
  totalPlayTime: number;
  equipment: {
    weapon: EquipmentItem | null;
    armor: EquipmentItem | null;
    treasure: EquipmentItem | null;
  };
  inventory: EquipmentItem[];
  // Settings
  battleSpeed?: number;
  autoDecomposeQuality?: number;
  autoEquipOnDrop?: boolean;
  autoSkill?: boolean;
  autoConsume?: boolean;
  autoWorldBoss?: boolean;
  autoExplore?: boolean;
  autoSanctuary?: boolean;
  autoAffinity?: boolean;
  autoSweep?: boolean;
  autoFate?: boolean;
  autoWheel?: boolean;
  autoTrial?: boolean;
  autoAscension?: boolean;
  autoEnhance?: boolean;
  autoReforge?: boolean;
  autoFeedPet?: boolean;
  autoBuyPerks?: boolean;
  autoSynth?: boolean;
  autoReincarnate?: boolean;
  autoDaoAlloc?: boolean;
  autoFarm?: boolean;
  autoEvent?: boolean;
  autoWeeklyBoss?: boolean;
  autoClaimChallenges?: boolean;
  autoTranscend?: boolean;
  autoBuyTranscendPerks?: boolean;
  lastWheelSpin?: number;
  equippedTitle?: string | null;
  unlockedTitles?: string[];
  seenStories?: string[];
  fateBlessing?: { active: boolean; expiresAt: number };
  onlineRewardsClaimed?: number[];
  completedChallenges?: string[];
  completedChallengesDate?: string;
  weeklyBoss?: { week: number; clearedFloors: number[]; claimed: number[] };
  equipLoadouts?: { name: string; weapon: string | null; armor: string | null; treasure: string | null }[];
  // v13
  sanctuary?: any;
  exploration?: any;
  affinity?: any;
}
