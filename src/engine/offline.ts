/**
 * v1.1 模拟式离线收益计算
 * 基于真实怪物数据 + 装备加成，替代粗略 DPS 公式
 */

import { PlayerState, Stats, EquipmentItem, QUALITY_INFO, INVENTORY_MAX } from '../types';
import { createEnemy } from '../data/chapters';
import { rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat, getActiveSetBonuses, EQUIPMENT_TEMPLATES } from '../data/equipment';
import { expForLevel } from '../utils/format';
import { REINC_PERKS } from '../data/reincarnation';
import { getAwakeningBonuses } from '../components/AwakeningPanel';

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

  // v64.0: Apply reincarnation bonuses
  const atkMul = REINC_PERKS.find(p => p.id === 'atk_mult')!.effect(player.reincPerks?.['atk_mult'] ?? 0);
  const expMul = REINC_PERKS.find(p => p.id === 'exp_mult')!.effect(player.reincPerks?.['exp_mult'] ?? 0);
  const goldMul = REINC_PERKS.find(p => p.id === 'gold_mult')!.effect(player.reincPerks?.['gold_mult'] ?? 0);

  // v64.0: Apply awakening bonuses
  const awk = getAwakeningBonuses(player);
  eStats.attack = Math.floor(eStats.attack * atkMul * (1 + (awk.atk_pct ?? 0) / 100));
  eStats.maxHp = Math.floor(eStats.maxHp * (1 + (awk.hp_pct ?? 0) / 100));
  eStats.critRate = Math.min(100, eStats.critRate + (awk.crit_rate ?? 0));
  eStats.critDmg += (awk.crit_dmg ?? 0) / 100;

  // Average DPS including crit expectation
  const avgCritMul = 1 + (eStats.critRate / 100) * (eStats.critDmg - 1);

  // Get enemy data at current stage
  const minion = createEnemy(chapterId, stageNum, false)!;
  const boss = createEnemy(chapterId, stageNum, true)!;

  // v64.0: Percentage-based defense (matching v33 battle formula)
  const minionDefReduction = minion.defense / (minion.defense + 100 + player.level * 5);
  const bossDefReduction = boss.defense / (boss.defense + 100 + player.level * 5);
  const minionDmgPerHit = Math.max(1, eStats.attack * (1 - minionDefReduction)) * avgCritMul;
  const bossDmgPerHit = Math.max(1, eStats.attack * (1 - bossDefReduction)) * avgCritMul;

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

  // Resource rewards (v64.0: apply reincarnation + awakening multipliers)
  const lingshiAwkMul = 1 + (awk.lingshi_pct ?? 0) / 100;
  const expAwkMul = 1 + (awk.exp_pct ?? 0) / 100;
  const lingshi = Math.floor(
    (totalMinions * minion.lingshiDrop + totalBosses * boss.lingshiDrop) * lingshiMul * goldMul * lingshiAwkMul
  );
  const exp = Math.floor((totalMinions * minion.expDrop + totalBosses * boss.expDrop) * expMul * expAwkMul);

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

  // 离线掉落保底：每100关保底灵品，每500关保底仙品
  if (stagesCleared >= 100 && invSize + equipmentItems.length < INVENTORY_MAX) {
    const spiritGuaranteed = Math.floor(stagesCleared / 100);
    const spiritPool = EQUIPMENT_TEMPLATES.filter(e => e.quality === 'spirit' && globalStage >= e.dropFromStage);
    for (let i = 0; i < spiritGuaranteed && invSize + equipmentItems.length < INVENTORY_MAX; i++) {
      if (spiritPool.length > 0) {
        const tmpl = spiritPool[Math.floor(Math.random() * spiritPool.length)];
        const item = createEquipFromTemplate(tmpl);
        equipmentItems.push(item);
        equipmentNames.push(`${QUALITY_INFO[tmpl.quality].symbol}${tmpl.name}(保底)`);
      }
    }
  }
  if (stagesCleared >= 500 && invSize + equipmentItems.length < INVENTORY_MAX) {
    const immortalGuaranteed = Math.floor(stagesCleared / 500);
    const immortalPool = EQUIPMENT_TEMPLATES.filter(e => e.quality === 'immortal' && globalStage >= e.dropFromStage);
    for (let i = 0; i < immortalGuaranteed && invSize + equipmentItems.length < INVENTORY_MAX; i++) {
      if (immortalPool.length > 0) {
        const tmpl = immortalPool[Math.floor(Math.random() * immortalPool.length)];
        const item = createEquipFromTemplate(tmpl);
        equipmentItems.push(item);
        equipmentNames.push(`${QUALITY_INFO[tmpl.quality].symbol}${tmpl.name}(保底)`);
      }
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
