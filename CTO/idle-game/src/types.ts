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

export type TabId = 'battle' | 'team' | 'journey' | 'bag' | 'settings';

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
}
