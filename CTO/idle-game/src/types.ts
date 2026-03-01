// === Core Game Types ===

export interface PlayerState {
  name: string;
  level: number;
  exp: number;
  lingshi: number; // 灵石 (gold)
  pantao: number;  // 蟠桃 (breakthrough material)
  realmIndex: number;
  stats: Stats;
  clickPower: number;
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
}

export interface EquipSet {
  id: string;
  name: string;
  pieces: string[];
  bonuses: { count: number; description: string; effect: Partial<Stats> }[];
}

/** Quality display info — using Unicode symbol prefixes per CDO spec */
export const QUALITY_INFO: Record<Quality, { label: string; symbol: string; multiplier: number; color: string }> = {
  common:   { label: '○凡品', symbol: '○', multiplier: 1,  color: '#aaa' },
  spirit:   { label: '●灵品', symbol: '●', multiplier: 2,  color: '#4caf50' },
  immortal: { label: '◆仙品', symbol: '◆', multiplier: 5,  color: '#64b5f6' },
  divine:   { label: '★神品', symbol: '★', multiplier: 12, color: '#ce93d8' },
  chaos:    { label: '✦混沌', symbol: '✦', multiplier: 30, color: '#f0c040' },
};

export const INVENTORY_MAX = 50;

export type TabId = 'battle' | 'team' | 'journey' | 'bag' | 'settings';

/** Floating damage text */
export interface FloatingText {
  id: number;
  text: string;
  type: 'normal' | 'crit' | 'click';
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
  lastSaveTimestamp: number;
  totalPlayTime: number;
  equipment: {
    weapon: EquipmentItem | null;
    armor: EquipmentItem | null;
    treasure: EquipmentItem | null;
  };
  inventory: EquipmentItem[];
}
