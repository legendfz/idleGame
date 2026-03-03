/**
 * v2.0 Core Game Types
 */

/** Serialized Decimal = string */
export type DecStr = string;

export interface GameState {
  player: PlayerState;
  characters: CharacterState[];
  activeCharId: string;
  journey: JourneyState;
  resources: ResourceState;
  settings: SettingsState;
}

export interface PlayerState {
  name: string;
  realmId: string;
  realmSubLevel: number; // 1-9
  cultivationXp: DecStr;
  totalCultivation: DecStr;
  totalPlayTime: number;
  createdAt: number;
}

export interface CharStats {
  attack: DecStr;
  defense: DecStr;
  hp: DecStr;
  maxHp: DecStr;
  speed: number;
  critRate: number;
  critDmg: number;
}

export interface CharacterState {
  id: string;
  unlocked: boolean;
  level: number;
  exp: DecStr;
  stats: CharStats;
  equipment: Record<EquipSlotV2, string | null>;
  skillPoints: number;
  skills: Record<string, number>;
}

export type EquipSlotV2 = 'weapon' | 'headgear' | 'armor' | 'accessory' | 'mount' | 'treasure';
export const EQUIP_SLOTS_V2: EquipSlotV2[] = ['weapon', 'headgear', 'armor', 'accessory', 'mount', 'treasure'];

export interface ResourceState {
  gold: DecStr;
  lingshi: DecStr;
  materials: Record<string, number>;
  pills: Record<string, number>;
  foyuan: number;
}

export interface JourneyState {
  currentStage: number;
  stageProgress: Record<number, StageResult>;
  dailySweepCount: Record<number, number>;
  dailyResetDate: string;
}

export interface StageResult {
  cleared: boolean;
  stars: number;
  bestTime: number | null;
  clearCount: number;
}

export interface SettingsState {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  autoSave: boolean;
}

export type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'legendary' | 'mythic';

export const QUALITY_INFO_V2: Record<Quality, { label: string; color: string; multiplier: number }> = {
  common:    { label: '凡品', color: '#9E9E9E', multiplier: 1 },
  spirit:    { label: '灵品', color: '#4CAF50', multiplier: 2 },
  immortal:  { label: '仙品', color: '#2196F3', multiplier: 5 },
  divine:    { label: '神品', color: '#9C27B0', multiplier: 12 },
  legendary: { label: '混沌', color: '#FF9800', multiplier: 30 },
  mythic:    { label: '鸿蒙', color: '#FFD700', multiplier: 80 },
};
