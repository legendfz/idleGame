/**
 * v1.1 模拟式离线收益计算
 * 基于真实怪物数据 + 装备加成，替代粗略 DPS 公式
 */

import { PlayerState, Stats, EquipmentItem, QUALITY_INFO } from '../types';
import { getInventoryMax } from '../store/gameStore';
import { createEnemy } from '../data/chapters';
import { rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat, getActiveSetBonuses, EQUIPMENT_TEMPLATES } from '../data/equipment';
import { getResonanceBonus } from '../data/resonance';
import { expForLevel } from '../utils/format';
import { REINC_PERKS, getReincMilestoneBonus } from '../data/reincarnation';
import { getTranscendBonuses } from '../data/transcendence';
import { getAwakeningBonuses } from '../components/AwakeningPanel';
import { getPetTotalBonus } from '../data/pets';
import { getCodexBonuses } from '../data/codexPower';
import { getLevelMilestoneBonuses } from '../data/levelMilestones';
import { getGemBonuses } from '../data/gems';
import { getPowerMilestoneBonuses } from '../data/powerMilestones';
import { TITLES } from '../data/titles';
import { getSubstatBonuses } from '../data/substats';
import { useAffinityStore } from '../store/affinityStore';

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
  comebackMul: number;    // v99.0: comeback bonus multiplier
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
  // v71.0: Equipment resonance
  const resonance = getResonanceBonus(weapon, armor, treasure);
  if (resonance) {
    s.attack = Math.floor(s.attack * (1 + resonance.atkPct / 100));
    s.maxHp = Math.floor(s.maxHp * (1 + resonance.hpPct / 100));
    s.critRate = Math.min(100, s.critRate + resonance.critRate);
    s.critDmg += resonance.critDmg;
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
  equippedTitle?: string | null,
  highestPower?: number,
): OfflineResult {
  const MAX_OFFLINE = 86400; // 24h cap
  const cappedSec = Math.min(offlineSeconds, MAX_OFFLINE);

  if (cappedSec < 60) {
    return { duration: cappedSec, lingshi: 0, exp: 0, pantao: 0, equipment: [], equipmentItems: [], kills: 0, stagesCleared: 0, levelsGained: 0, comebackMul: 1.0 };
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
  // v108.0: Apply pet bonuses
  const petBonus = getPetTotalBonus(player.petLevels ?? {}, player.activePetId ?? null, player.petEvolutions);
  // v148.0: Apply transcendence, milestones, title, affinity (previously missing!)
  const trBonus = getTranscendBonuses(player.transcendPerks ?? {});
  const rmb = getReincMilestoneBonus(player.reincarnations ?? 0);
  const titleBonus: any = equippedTitle ? TITLES.find(t => t.id === equippedTitle)?.bonuses ?? {} : {};
  const afBuf = useAffinityStore.getState().getBuffs();

  eStats.attack = Math.floor(eStats.attack * atkMul
    * (1 + (awk.atk_pct ?? 0) / 100) * (1 + (petBonus.atkPct ?? 0) / 100)
    * (1 + rmb.atk) * (1 + (titleBonus.attack ?? 0)) * trBonus.atkMul);
  eStats.maxHp = Math.floor(eStats.maxHp
    * (1 + (awk.hp_pct ?? 0) / 100) * (1 + (petBonus.hpPct ?? 0) / 100)
    * (1 + rmb.hp) * (1 + (titleBonus.maxHp ?? 0)) * trBonus.hpMul);
  eStats.critRate = Math.min(100, eStats.critRate + (awk.crit_rate ?? 0) + (petBonus.critRate ?? 0)
    + rmb.crit + (titleBonus.critRate ?? 0) + trBonus.critFlat);
  eStats.critDmg += (awk.crit_dmg ?? 0) / 100 + (petBonus.critDmg ?? 0) / 100
    + rmb.critDmg + (titleBonus.critDmg ?? 0) + trBonus.critDmg / 100;

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
  // v108.0: Pet gold/exp multipliers for offline
  const petGoldMul = 1 + (petBonus.goldPct ?? 0) / 100;
  const petExpMul = 1 + (petBonus.expPct ?? 0) / 100;
  // v147.0: Codex power offline bonuses
  const codexB = getCodexBonuses(
    (player.codexEquipIds ?? []).length,
    (player.codexEnemyNames ?? []).length,
  );
  const codexGoldMul = 1 + codexB.lingshiPct / 100;
  const codexExpMul = 1 + codexB.expPct / 100;
  // v148.0: Include transcendence, milestones, title, affinity in offline rewards
  const afLingshi = 1 + (afBuf.lingshiMul ?? 0) / 100;
  const afExp = 1 + (afBuf.expMul ?? 0) / 100;
  // v154.0: Level milestone bonuses for offline
  const lvlMilB = getLevelMilestoneBonuses(player.highestLevelEver ?? player.level);
  const lvlMilGold = 1 + lvlMilB.lingshiPct / 100;
  const lvlMilExp = 1 + lvlMilB.expPct / 100;
  // v155.0: Gem bonuses for offline
  const allGems = Object.values(player.equippedGems ?? {}).flat() as { typeId: string; level: number }[];
  const gemB = allGems.length > 0 ? getGemBonuses(allGems) : { goldMul: 0, expMul: 0 };
  const gemGold = 1 + gemB.goldMul / 100;
  const gemExp = 1 + gemB.expMul / 100;
  // v157.0: Power milestone bonuses for offline
  const pwrMilB = getPowerMilestoneBonuses(highestPower ?? 0);
  const pwrGold = 1 + (pwrMilB.goldMul ?? 0);
  const pwrExp = 1 + (pwrMilB.expMul ?? 0);
  // v162.0: Substat bonuses for offline
  const subArrays = [weapon, armor, treasure].filter(Boolean).map(e => e!.substats ?? []);
  const subB = getSubstatBonuses(subArrays);
  const subGold = 1 + subB.goldPct / 100;
  const subExp = 1 + subB.expPct / 100;
  const lingshi = Math.floor(
    (totalMinions * minion.lingshiDrop + totalBosses * boss.lingshiDrop)
    * lingshiMul * goldMul * lingshiAwkMul * petGoldMul * codexGoldMul
    * (1 + rmb.gold) * (1 + (titleBonus.goldMul ?? 0)) * trBonus.goldMul * afLingshi * lvlMilGold * gemGold * pwrGold * subGold
  );
  const exp = Math.floor(
    (totalMinions * minion.expDrop + totalBosses * boss.expDrop)
    * expMul * expAwkMul * petExpMul * codexExpMul
    * (1 + rmb.exp) * (1 + (titleBonus.expMul ?? 0)) * trBonus.expMul * afExp * lvlMilExp * gemExp * pwrExp * subExp
  );

  // Pantao: use expected value (boss pantao chance × boss kills)
  const pantao = Math.floor(totalBosses * (boss.pantaoDrop || 0));

  // Equipment drops from boss kills
  const equipmentItems: EquipmentItem[] = [];
  const equipmentNames: string[] = [];
  const globalStage = getGlobalStage(chapterId, stageNum, chapters);
  const invMax = getInventoryMax(player.reincarnations ?? 0);
  let invSize = existingInventorySize;

  for (let i = 0; i < totalBosses && invSize + equipmentItems.length < invMax; i++) {
    const drop = rollEquipDrop(globalStage, true);
    if (drop) {
      const item = createEquipFromTemplate(drop);
      equipmentItems.push(item);
      equipmentNames.push(`${QUALITY_INFO[drop.quality].symbol}${drop.name}`);
    }
  }

  // 离线掉落保底：每100关保底灵品，每500关保底仙品
  if (stagesCleared >= 100 && invSize + equipmentItems.length < invMax) {
    const spiritGuaranteed = Math.floor(stagesCleared / 100);
    const spiritPool = EQUIPMENT_TEMPLATES.filter(e => e.quality === 'spirit' && globalStage >= e.dropFromStage);
    for (let i = 0; i < spiritGuaranteed && invSize + equipmentItems.length < invMax; i++) {
      if (spiritPool.length > 0) {
        const tmpl = spiritPool[Math.floor(Math.random() * spiritPool.length)];
        const item = createEquipFromTemplate(tmpl);
        equipmentItems.push(item);
        equipmentNames.push(`${QUALITY_INFO[tmpl.quality].symbol}${tmpl.name}(保底)`);
      }
    }
  }
  if (stagesCleared >= 500 && invSize + equipmentItems.length < invMax) {
    const immortalGuaranteed = Math.floor(stagesCleared / 500);
    const immortalPool = EQUIPMENT_TEMPLATES.filter(e => e.quality === 'immortal' && globalStage >= e.dropFromStage);
    for (let i = 0; i < immortalGuaranteed && invSize + equipmentItems.length < invMax; i++) {
      if (immortalPool.length > 0) {
        const tmpl = immortalPool[Math.floor(Math.random() * immortalPool.length)];
        const item = createEquipFromTemplate(tmpl);
        equipmentItems.push(item);
        equipmentNames.push(`${QUALITY_INFO[tmpl.quality].symbol}${tmpl.name}(保底)`);
      }
    }
  }

  // v99.0: Comeback bonus — offline ≥4h → 1.5x, ≥8h → 2.0x
  const comebackMul = cappedSec >= 28800 ? 2.0 : cappedSec >= 14400 ? 1.5 : 1.0;
  const finalLingshi = Math.floor(lingshi * comebackMul);
  const finalExp = Math.floor(exp * comebackMul);
  const finalPantao = Math.floor(pantao * comebackMul);

  // Recalculate levels gained with bonus
  let tempExp2 = player.exp + finalExp;
  let tempLevel2 = player.level;
  let levelsGained2 = 0;
  while (tempExp2 >= expForLevel(tempLevel2)) {
    tempExp2 -= expForLevel(tempLevel2);
    tempLevel2++;
    levelsGained2++;
  }

  return {
    duration: cappedSec,
    lingshi: finalLingshi,
    exp: finalExp,
    pantao: finalPantao,
    equipment: equipmentNames,
    equipmentItems,
    kills: totalKills,
    stagesCleared,
    levelsGained: levelsGained2,
    comebackMul,
  };
}
