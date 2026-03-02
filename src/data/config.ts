/**
 * ConfigDB — 静态配置加载与查询
 */
import realmsConfig from './configs/realms.json';
import stagesConfig from './configs/stages.json';
import monstersConfig from './configs/monsters.json';
import equipmentConfig from './configs/equipment.json';
import charactersConfig from './configs/characters.json';
import lootTablesConfig from './configs/loot-tables.json';

export const configs = {
  realms: realmsConfig,
  stages: stagesConfig,
  monsters: monstersConfig,
  equipment: equipmentConfig,
  characters: charactersConfig,
  lootTables: lootTablesConfig,
} as const;

export function getRealmById(id: string) {
  return configs.realms.find((r: any) => r.id === id);
}

export function getStageById(id: string) {
  return configs.stages.find((s: any) => s.id === id);
}

export function getMonsterById(id: string) {
  return configs.monsters.find((m: any) => m.id === id);
}

export default configs;
