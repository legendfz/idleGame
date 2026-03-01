/**
 * v1.1 模拟式离线收益计算
 * 基于真实怪物数据 + 装备加成，替代粗略 DPS 公式
 */

import { PlayerState, Stats, EquipmentItem, QUALITY_INFO, INVENTORY_MAX } from '../types';
import { createEnemy } from '../data/chapters';
import { rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat, getActiveSetBonuses } from '../data/equipment';
import { expForLevel } from '../utils/format';

export interface OfflineResult {
  duration: number;       // capped seconds
  lingshi: number;
  exp: number;
  pantao: number;
  equipment: string[];    // display names of dropped equipment
  equipmentItems: EquipmentItem[];
  kills: number;
  stagesCleared: number;
  levelsGained: number;
}

/** Calculate effective stats (same logic as gameStore but standalone) */
function calcEffectiveStats(
  baseStats: Stats,
  weapon: EquipmentItem | null,
  armor: EquipmentItem | null,
  treasure: EquipmentItem | null,
): Stats {
  const s = { ...baseStats };
  if (weapon) s.attack += getEquipEffectiveStat(weapon);
  if (armor) s.maxHp += getEquipEffectiveStat(armor);
  for (const eq of [weapon, armor, treasure]) {
    if (!eq?.passive) continue;
    switch (eq.passive.type) {
      case 'critRate': s.critRate += eq.passive.value; break;
      case 'critDmg': s.critDmg += eq.passive.value; break;
      case 'speed': s.speed += eq.passive.value; break;
    }
  }
  const setBonuses = getActiveSetBonuses(weapon, armor, treasure);
  for (const sb of setBonuses) {
    for (const bonus of sb.bonuses) {
      if (bonus.effect.attack) s.attack = Math.floor(s.attack * (1 + bonus.effect.attack));
      if (bonus.effect.maxHp) s.maxHp = Math.floor(s.maxHp * (1 + bonus.effect.maxHp));
      if (bonus.effect.critRate) s.critRate += bonus.effect.critRate;
      if (bonus.effect.critDmg) s.critDmg += bonus.effect.critDmg;
    }
  }
  return s;
}

/** Get lingshi bonus multiplier from equipment */
function getLingshiBonusMul(weapon: EquipmentItem | null, armor: EquipmentItem | null, treasure: EquipmentItem | null): number {
  let mul = 1;
  for (const eq of [weapon, armor, treasure]) {
    if (eq?.passive?.type === 'lingshiBonus') mul += eq.passive.value;
  }
  return mul;
}

/** Get offline efficiency multiplier from equipment */
function getOfflineEfficiency(weapon: EquipmentItem | null, armor: EquipmentItem | null, treasure: EquipmentItem | null): number {
  let eff = 0.5; // base 50%
  for (const eq of [weapon, armor, treasure]) {
    if (eq?.passive?.type === 'offlineEfficiency') eff += eq.passive.value;
  }
  return Math.min(eff, 1.0); // cap at 100%
}

/** Convert chapter+stage to global stage index */
function getGlobalStage(chapterId: number, stageNum: number, chapters: { id: number; stages: number }[]): number {
  let total = 0;
  for (const ch of chapters) {
    if (ch.id < chapterId) total += ch.stages;
    else break;
  }
  return total + stageNum;
}

/**
 * Main offline calculation — simulation-based
 */
export function calculateOfflineEarnings(
  offlineSeconds: number,
  player: PlayerState,
  weapon: EquipmentItem | null,
  armor: EquipmentItem | null,
  treasure: EquipmentItem | null,
  chapterId: number,
  stageNum: number,
  existingInventorySize: number,
  chapters: { id: number; stages: number }[],
): OfflineResult {
  const MAX_OFFLINE = 86400; // 24h cap
  const cappedSec = Math.min(offlineSeconds, MAX_OFFLINE);

  if (cappedSec < 60) {
    return { duration: cappedSec, lingshi: 0, exp: 0, pantao: 0, equipment: [], equipmentItems: [], kills: 0, stagesCleared: 0, levelsGained: 0 };
  }

  const eStats = calcEffectiveStats(player.stats, weapon, armor, treasure);
  const lingshiMul = getLingshiBonusMul(weapon, armor, treasure);
  const efficiency = getOfflineEfficiency(weapon, armor, treasure);

  // Average DPS including crit expectation
  const avgCritMul = 1 + (eStats.critRate / 100) * (eStats.critDmg - 1);

  // Get enemy data at current stage
  const minion = createEnemy(chapterId, stageNum, false)!;
  const boss = createEnemy(chapterId, stageNum, true)!;

  // Effective damage per second (accounting for defense)
  const minionDmgPerHit = Math.max(1, eStats.attack - minion.defense) * avgCritMul;
  const bossDmgPerHit = Math.max(1, eStats.attack - boss.defense) * avgCritMul;

  // Kill times in seconds (1 hit per second base)
  const minionKillTime = Math.max(1, Math.ceil(minion.hp / minionDmgPerHit));
  const bossKillTime = Math.max(1, Math.ceil(boss.hp / bossDmgPerHit));

  // Stage time = 10 minions + 1 boss
  const stageTime = minionKillTime * 10 + bossKillTime;

  // Apply offline efficiency
  const effectiveSec = cappedSec * efficiency;

  // Stages and extra kills
  const stagesCleared = Math.floor(effectiveSec / stageTime);
  const remainingSec = effectiveSec - stagesCleared * stageTime;
  const extraMinions = Math.min(10, Math.floor(remainingSec / minionKillTime));

  const totalMinions = stagesCleared * 10 + extraMinions;
  const totalBosses = stagesCleared;
  const totalKills = totalMinions + totalBosses;

  // Resource rewards
  const lingshi = Math.floor(
    (totalMinions * minion.lingshiDrop + totalBosses * boss.lingshiDrop) * lingshiMul
  );
  const exp = totalMinions * minion.expDrop + totalBosses * boss.expDrop;

  // Pantao: use expected value (boss pantao chance × boss kills)
  const pantao = Math.floor(totalBosses * (boss.pantaoDrop || 0));

  // Equipment drops from boss kills
  const equipmentItems: EquipmentItem[] = [];
  const equipmentNames: string[] = [];
  const globalStage = getGlobalStage(chapterId, stageNum, chapters);
  let invSize = existingInventorySize;

  for (let i = 0; i < totalBosses && invSize + equipmentItems.length < INVENTORY_MAX; i++) {
    const drop = rollEquipDrop(globalStage, true);
    if (drop) {
      const item = createEquipFromTemplate(drop);
      equipmentItems.push(item);
      equipmentNames.push(`${QUALITY_INFO[drop.quality].symbol}${drop.name}`);
    }
  }

  // Calculate levels gained (for report display, actual levelup happens on dismiss)
  let tempExp = player.exp + exp;
  let tempLevel = player.level;
  let levelsGained = 0;
  while (tempExp >= expForLevel(tempLevel)) {
    tempExp -= expForLevel(tempLevel);
    tempLevel++;
    levelsGained++;
  }

  return {
    duration: cappedSec,
    lingshi,
    exp,
    pantao,
    equipment: equipmentNames,
    equipmentItems,
    kills: totalKills,
    stagesCleared,
    levelsGained,
  };
}
