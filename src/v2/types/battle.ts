/**
 * v2.0 Battle Types
 */

import { DecStr, CharStats } from './game';

export interface BossSkillConfig {
  id: string;
  name: string;
  damage: DecStr;
  cooldown: number;
  type: 'single' | 'aoe';
  warning: string;
}

export interface BossPhaseConfig {
  hpThreshold: number;
  attackMultiplier: number;
  description: string;
}

export interface WaveConfig {
  type: 'minion' | 'elite';
  enemyName: string;
  enemyIcon: string;
  count: number;
  hp: DecStr;
  attack: DecStr;
  defense: DecStr;
}

export interface BossConfig {
  id: string;
  name: string;
  icon: string;
  hp: DecStr;
  attack: DecStr;
  defense: DecStr;
  skills: BossSkillConfig[];
  phases: BossPhaseConfig[];
  timeLimit: number;
  recruitable?: { condition: string; effect: string };
}

export interface StageConfig {
  stage: number;
  chapter: number;
  name: string;
  waves: WaveConfig[];
  boss: BossConfig;
  rewards: StageRewards;
  sweepUnlockStars: number;
  recommendedPower: DecStr;
}

export interface StageRewards {
  gold: [DecStr, DecStr];
  exp: [DecStr, DecStr];
  equipDropChance: number;
  equipQualityMin: string;
  firstClear: { gold: DecStr; lingshi: DecStr; equipTemplateId?: string };
}

export interface BattleState {
  stageNum: number;
  status: 'idle' | 'fighting' | 'victory' | 'defeat';
  currentWaveIndex: number;
  currentEnemyIndex: number;
  enemy: BattleEnemy | null;
  playerHp: DecStr;
  playerMaxHp: DecStr;
  elapsed: number;
  timeLimit: number;
  attackAccumulator: number;
  activeSkillWarning: { skill: BossSkillConfig; timeLeft: number } | null;
  dodgeAvailable: boolean;
  dodgeActive: boolean;
  totalDamageDealt: DecStr;
  totalDamageTaken: DecStr;
  killCount: number;
  clickCombo: number;
  clickComboTimer: number;
  log: BattleLogEntry[];
}

export interface BattleEnemy {
  name: string;
  icon: string;
  hp: DecStr;
  maxHp: DecStr;
  attack: DecStr;
  defense: DecStr;
  isBoss: boolean;
  phase?: number;
  skills?: BossSkillConfig[];
}

export interface BattleLogEntry {
  id: number;
  text: string;
  type: 'attack' | 'crit' | 'skill' | 'dodge' | 'kill' | 'phase' | 'info' | 'warn';
  timestamp: number;
}
