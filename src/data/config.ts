/**
 * ConfigDB — 静态配置加载与查询
 */
import realmsData from './configs/realms.json';
import charactersData from './configs/characters.json';
import stagesData from './configs/stages.json';
import equipmentData from './configs/equipment.json';
import monstersData from './configs/monsters.json';
import lootTablesData from './configs/loot-tables.json';

// === Types ===

export interface RealmConfig {
  id: string;
  name: string;
  order: number;
  maxLevel: number;
  multiplier: number;
  unlock: string;
}

export interface CharacterConfig {
  id: string;
  name: string;
  role: string;
  icon: string;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
  atkGrowth: number;
  passive: { id: string; name: string; description: string; effect: { type: string; value: number } };
  unlockCondition: string;
}

export interface StageConfig {
  id: number;
  chapter: number;
  name: string;
  waves: number;
  boss: { name: string; icon: string; monsterId: string };
  rewards: { firstClearCoins: number; firstClearLingshi: number };
}

export interface EquipmentTemplateConfig {
  id: string;
  name: string;
  slot: string;
  baseQuality: string;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
  enhanceCostBase: number;
  description: string;
  lore: string;
}

export interface MonsterConfig {
  id: string;
  name: string;
  icon: string;
  capturable: boolean;
  captureBonus?: { type: string; value: number; desc: string };
}

// === Constants ===

export const REALM_COUNT = 14;
export const MAX_SUB_LEVEL = 9;
export const MAX_STAGE = 81;

// === Query Functions ===

const realms = realmsData as RealmConfig[];
const characters = charactersData as CharacterConfig[];
const stages = stagesData as StageConfig[];
const equipment = equipmentData as EquipmentTemplateConfig[];
const monsters = monstersData as MonsterConfig[];
const lootTables = lootTablesData as any;

export function getRealmConfig(id: string): RealmConfig | undefined {
  return realms.find(r => r.id === id);
}

export function getRealmByOrder(order: number): RealmConfig | undefined {
  return realms.find(r => r.order === order);
}

export function getAllRealms(): RealmConfig[] {
  return realms;
}

export function getCharacterConfig(id: string): CharacterConfig | undefined {
  return characters.find(c => c.id === id);
}

export function getAllCharacters(): CharacterConfig[] {
  return characters;
}

export function getStageConfig(id: number): StageConfig | undefined {
  return stages.find(s => s.id === id);
}

export function getAllStages(): StageConfig[] {
  return stages;
}

export function getEquipTemplate(id: string): EquipmentTemplateConfig | undefined {
  return equipment.find(e => e.id === id);
}

export function getAllEquipTemplates(): EquipmentTemplateConfig[] {
  return equipment;
}

export function getMonsterConfig(id: string): MonsterConfig | undefined {
  return monsters.find(m => m.id === id);
}

export function getLootTables(): typeof lootTablesData {
  return lootTables;
}

/**
 * 根据关卡获取固定掉落
 */
export function getFixedDrops(stageId: number): { templateId: string; quality: string; type: string }[] {
  return (lootTables.fixedDrops as any)?.[String(stageId)] ?? [];
}
