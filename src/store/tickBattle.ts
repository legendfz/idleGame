/**
 * v135.0: Battle tick logic extracted from gameStore.ts
 * Handles: combat, loot, level-up, wave/stage progression, skill/consumable ticking, auto-actions
 */
import { EquipmentItem, QUALITY_INFO, FloatingText } from '../types';
import { REALMS } from '../data/realms';
import { CHAPTERS, createEnemy, ABYSS_CHAPTER_ID } from '../data/chapters';
import { expForLevel, formatNumber } from '../utils/format';
import { sfx } from '../engine/audio';
import { REINC_PERKS, getReincMilestoneBonus } from '../data/reincarnation';
import { getTranscendBonuses } from '../data/transcendence';
import { ACTIVE_SKILLS } from '../data/skills';
import { getAwakeningBonuses } from '../components/AwakeningPanel';
import { getConsumable } from '../data/consumables';
import { GEM_TYPES, gemDropChance, getGemBonuses } from '../data/gems';
import { getPowerMilestoneBonuses } from '../data/powerMilestones';
import { TITLES } from '../data/titles';
import { getCodexBonuses } from '../data/codexPower';
import { getLevelMilestoneBonuses } from '../data/levelMilestones';
import {
  rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat,
  hasHiddenPassive,
} from '../data/equipment';
import { getPetTotalBonus } from '../data/pets';
import { rollElite, type EliteModifier } from '../data/eliteEnemies';
import { useAffinityStore } from './affinityStore';
import { useSanctuaryStore } from './sanctuaryStore';
import { calcEffectiveStats, addLog, getInventoryMax } from './gameStore';
import type { TickContext } from './tickAutoActions';
import { runAllAutoActions } from './tickAutoActions';

// Counters — shared mutable state (same as gameStore originals)
let floatIdCounter = 1000000;
let _lastBackpackFullWarn = 0;

/** Apply elite modifier to a non-boss enemy */
function applyElite(enemy: import('../types').Enemy, level: number): import('../types').Enemy {
  const mod = rollElite(level);
  if (!mod) return enemy;
  return {
    ...enemy,
    name: `${mod.emoji}${mod.name}·${enemy.name}`,
    hp: Math.floor(enemy.hp * mod.hpMul),
    maxHp: Math.floor(enemy.maxHp * mod.hpMul),
    defense: Math.floor(enemy.defense * 1.5),
    lingshiDrop: Math.floor(enemy.lingshiDrop * mod.rewardMul),
    expDrop: Math.floor(enemy.expDrop * mod.rewardMul),
    pantaoDrop: Math.min(1, enemy.pantaoDrop * 2),
    elite: { id: mod.id, name: mod.name, emoji: mod.emoji, color: mod.color, rewardMul: mod.rewardMul },
  };
}

function getLingshiBonusMulLocal(weapon: EquipmentItem | null, armor: EquipmentItem | null, treasure: EquipmentItem | null): number {
  let mul = 1;
  for (const eq of [weapon, armor, treasure]) {
    if (!eq?.passive) continue;
    if (eq.passive.type === 'lingshiBonus') mul += eq.passive.value;
  }
  return mul;
}

function getGlobalStageLocal(chapterId: number, stageNum: number): number {
  let total = 0;
  for (const ch of CHAPTERS) {
    if (ch.id < chapterId) total += ch.stages;
    else break;
  }
  return total + stageNum;
}

function getActiveConsumableEffectsLocal(actives: { buffId: string }[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const ac of actives) {
    const def = getConsumable(ac.buffId);
    if (!def) continue;
    result.expMult = (result.expMult ?? 0) + (def.effect.expMult ?? 0);
    result.goldMult = (result.goldMult ?? 0) + (def.effect.goldMult ?? 0);
    result.dropRateMult = (result.dropRateMult ?? 0) + (def.effect.dropRateMult ?? 0);
    result.atkMult = (result.atkMult ?? 0) + (def.effect.atkMult ?? 0);
    result.critRateAdd = (result.critRateAdd ?? 0) + (def.effect.critRateAdd ?? 0);
  }
  return result;
}

/**
 * Execute one battle tick. Called from gameStore's tick action.
 */
export function executeBattleTick(get: () => any, set: (partial: any) => void): void {
  const state = get();
  // v87.0: daily challenge reset
  const today = new Date().toISOString().slice(0, 10);
  if (state.completedChallengesDate !== today) {
    set({ completedChallenges: [], completedChallengesDate: today });
  }
  const { player, battle, equippedWeapon, equippedArmor, equippedTreasure } = state;
  if (!battle.currentEnemy) return;

  const effectiveStats = calcEffectiveStats(player.stats, equippedWeapon, equippedArmor, equippedTreasure);
  const lingshiMul = getLingshiBonusMulLocal(equippedWeapon, equippedArmor, equippedTreasure);

  // v22.0 转世加成
  const atkMul = REINC_PERKS.find(p => p.id === 'atk_mult')!.effect(player.reincPerks?.['atk_mult'] ?? 0);
  const expMul = REINC_PERKS.find(p => p.id === 'exp_mult')!.effect(player.reincPerks?.['exp_mult'] ?? 0);
  const goldMul = REINC_PERKS.find(p => p.id === 'gold_mult')!.effect(player.reincPerks?.['gold_mult'] ?? 0);
  // v116.0 超越加成
  const trBonusTick = getTranscendBonuses(player.transcendPerks ?? {});
  // v53.0 消耗品增益
  const cEffect = getActiveConsumableEffectsLocal(player.activeConsumables ?? []);
  // v59.0 觉醒加成
  const awk = getAwakeningBonuses(player);
  // v67.0 转世里程碑加成
  const rmb = getReincMilestoneBonus(player.reincarnations);
  // v147.0 图鉴之力
  const codexB = getCodexBonuses(
    (player.codexEquipIds ?? []).length,
    (player.codexEnemyNames ?? []).length,
  );
  // v81.0 称号加成
  const titleId = get().equippedTitle;
  const titleBonus: any = titleId ? TITLES.find(t => t.id === titleId)?.bonuses ?? {} : {};
  effectiveStats.attack = Math.floor(effectiveStats.attack * atkMul * (1 + (cEffect.atkMult ?? 0)) * (1 + (awk.atk_pct ?? 0) / 100) * (1 + rmb.atk) * (1 + (titleBonus.attack ?? 0)));
  effectiveStats.maxHp = Math.floor(effectiveStats.maxHp * (1 + (awk.hp_pct ?? 0) / 100) * (1 + rmb.hp) * (1 + (titleBonus.maxHp ?? 0)));
  effectiveStats.critRate = Math.min(100, effectiveStats.critRate + (cEffect.critRateAdd ?? 0) + (awk.crit_rate ?? 0) + rmb.crit + (titleBonus.critRate ?? 0));
  effectiveStats.critDmg = (effectiveStats.critDmg ?? 150) + (awk.crit_dmg ?? 0) + rmb.critDmg * 100 + (titleBonus.critDmg ?? 0) * 100;

  const enemy = { ...battle.currentEnemy };
  let log = [...battle.log];
  let updatedPlayer = { ...player, stats: { ...player.stats } };
  let updatedBattle = { ...battle };
  let updatedInventory = [...state.inventory];
  let newFloats = [...state.floatingTexts];
  const autoEquipState = { equippedWeapon, equippedArmor, equippedTreasure } as Record<string, EquipmentItem | null>;

  // v40.0: Tribulation timer countdown
  if (updatedBattle.tribulation?.active) {
    updatedBattle.tribulation = { ...updatedBattle.tribulation, timer: updatedBattle.tribulation.timer - 1 };
    if (updatedBattle.tribulation.timer <= 0) {
      const failedRealmIdx = updatedBattle.tribulation.realmIndex;
      const failedRealm = REALMS[failedRealmIdx];
      const refund = Math.floor((failedRealm?.pantaoReq ?? 0) * 0.5);
      updatedPlayer.pantao += refund;
      log = addLog(log, `💀 天劫失败！渡劫超时。退还蟠桃 ${refund}`, 'boss');
      if (updatedBattle.killStreak >= 10) log = addLog(log, `🔥 连杀×${updatedBattle.killStreak} 中断！`, 'info');
      const resumeEnemy = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, false)!;
      updatedBattle = { ...updatedBattle, wave: 1, isBossWave: false, currentEnemy: resumeEnemy, log, tribulation: undefined, killStreak: 0 };
      set({ player: updatedPlayer, battle: updatedBattle });
      return;
    }
  }

  // Track gold/exp/dps for idle stats
  let tickGold = 0;
  let tickExp = 0;
  let tickDmg = 0;

  // v52.0: Tick skill cooldowns & buffs
  const as = updatedPlayer.activeSkills ?? { cooldowns: {}, buffs: {} };
  const skillState = { ...as, cooldowns: { ...(as.cooldowns ?? {}) }, buffs: { ...(as.buffs ?? {}) } };
  for (const sid of Object.keys(skillState.cooldowns)) {
    skillState.cooldowns[sid] = Math.max(0, skillState.cooldowns[sid] - 1);
    if (skillState.cooldowns[sid] <= 0) delete skillState.cooldowns[sid];
  }
  for (const sid of Object.keys(skillState.buffs)) {
    skillState.buffs[sid] = Math.max(0, skillState.buffs[sid] - 1);
    if (skillState.buffs[sid] <= 0) delete skillState.buffs[sid];
  }
  updatedPlayer.activeSkills = skillState;

  // v73.0: Expire fate blessing
  if (state.fateBlessing.active && state.fateBlessing.expiresAt <= Date.now()) {
    set({ fateBlessing: { active: false, expiresAt: 0 } });
  }

  // v57.0: Auto-cast skills when off cooldown
  if (state.autoSkill) {
    for (const skill of ACTIVE_SKILLS) {
      if (updatedPlayer.level >= skill.unlockLevel && !(skillState.cooldowns[skill.id])) {
        skillState.cooldowns[skill.id] = skill.cooldown;
        if (skill.duration > 0) {
          skillState.buffs[skill.id] = skill.duration;
        }
        if (skill.id === 'jindouyun' && updatedBattle.currentEnemy) {
          const e = updatedBattle.currentEnemy;
          const goldReward = e.lingshiDrop * 2;
          const expReward = e.expDrop * 2;
          updatedPlayer.lingshi += goldReward;
          updatedPlayer.exp += expReward;
          updatedBattle.log = addLog(updatedBattle.log, `🌀 筋斗云·瞬杀 ${e.name}！双倍奖励`, 'boss');
          updatedBattle.currentEnemy = { ...e, hp: 0 };
        }
      }
    }
    updatedPlayer.activeSkills = skillState;
  }

  // v53.0: Tick consumable timers
  if (updatedPlayer.activeConsumables && updatedPlayer.activeConsumables.length > 0) {
    updatedPlayer.activeConsumables = updatedPlayer.activeConsumables
      .map((c: any) => ({ ...c, remainingSec: c.remainingSec - 1 }))
      .filter((c: any) => c.remainingSec > 0);
  }

  // v63.0: Auto-consume potions
  if (state.autoConsume) {
    const actives = updatedPlayer.activeConsumables ?? [];
    const activeIds = new Set(actives.map((a: any) => a.buffId));
    const inv = updatedPlayer.consumableInventory ?? {};
    const CONSUME_ORDER = ['mega_pill', 'exp_pill', 'gold_pill', 'atk_pill', 'crit_pill', 'drop_pill'];
    for (const buffId of CONSUME_ORDER) {
      if ((inv[buffId] ?? 0) > 0 && !activeIds.has(buffId)) {
        const def = getConsumable(buffId);
        if (def) {
          const newInv = { ...inv };
          newInv[buffId]--;
          if (newInv[buffId] <= 0) delete newInv[buffId];
          updatedPlayer.consumableInventory = newInv;
          updatedPlayer.activeConsumables = [...actives, { buffId, remainingSec: def.durationSec }];
          break;
        }
      }
    }
  }

  // v52.0: Apply attack buff from 七十二变
  const atkBuffActive = (skillState.buffs['qishier'] ?? 0) > 0;
  if (atkBuffActive) {
    const skill = ACTIVE_SKILLS.find(s => s.id === 'qishier')!;
    effectiveStats.attack = Math.floor(effectiveStats.attack * skill.effect.value);
  }

  // Auto attack
  const isCrit = Math.random() * 100 < effectiveStats.critRate;
  const shieldActive = (skillState.buffs['jingang'] ?? 0) > 0;
  const defReduction = shieldActive ? 0 : enemy.defense / (enemy.defense + 100 + updatedPlayer.level * 5);
  let dmg = Math.max(1, Math.floor(effectiveStats.attack * (1 - defReduction)));
  if (isCrit) dmg = Math.floor(dmg * effectiveStats.critDmg);

  // v1.2: Weapon +15 hidden passive — 鸿蒙一击
  const weaponHidden = equippedWeapon ? hasHiddenPassive(equippedWeapon) : null;
  let isHongmengStrike = false;
  if (weaponHidden?.procChance && Math.random() * 100 < weaponHidden.procChance) {
    dmg = Math.floor(dmg * (weaponHidden.multiplier ?? 3));
    isHongmengStrike = true;
  }

  enemy.hp -= dmg;
  tickDmg += dmg;

  // Floating text
  newFloats.push({
    id: floatIdCounter++,
    text: isHongmengStrike ? `鸿蒙 ${dmg}` : isCrit ? `暴击 ${dmg}` : `-${dmg}`,
    type: isCrit || isHongmengStrike ? 'crit' : 'normal',
    timestamp: Date.now(),
  } as FloatingText);

  if (isHongmengStrike) {
    log = addLog(log, `悟空 >>> ${enemy.name}  -${dmg} 鸿蒙一击！`, 'crit');
    updatedPlayer.totalCrits = (updatedPlayer.totalCrits || 0) + 1;
  } else if (isCrit) {
    log = addLog(log, `悟空 >> ${enemy.name}  -${dmg} 暴击！`, 'crit');
    updatedPlayer.totalCrits = (updatedPlayer.totalCrits || 0) + 1;
  } else {
    log = addLog(log, `悟空 > ${enemy.name}  -${dmg}`, 'attack');
  }

  updatedPlayer.maxDamage = Math.max(updatedPlayer.maxDamage, dmg);

  if (enemy.hp <= 0) {
    updatedPlayer.totalKills++;
    set({ allTimeKills: state.allTimeKills + 1 });
    if (!(updatedPlayer.codexEnemyNames ?? []).includes(enemy.name)) {
      updatedPlayer.codexEnemyNames = [...(updatedPlayer.codexEnemyNames ?? []), enemy.name];
    }
    // v49.0: Kill streak
    updatedBattle.killStreak = (updatedBattle.killStreak || 0) + 1;
    const streak = updatedBattle.killStreak;
    if (streak > (updatedPlayer.bestKillStreak || 0)) {
      updatedPlayer.bestKillStreak = streak;
    }
    const streakBonus = streak >= 100 ? 0.5 : streak >= 50 ? 0.3 : streak >= 20 ? 0.2 : streak >= 10 ? 0.1 : 0;
    log = addLog(log, `${enemy.name} 击败！${streak >= 10 ? ` 🔥连杀×${streak} (+${Math.round(streakBonus*100)}%奖励)` : ''}`, 'kill');
    if ([10,20,50,100,200,500,1000].includes(streak)) {
      log = addLog(log, `🔥🔥 连杀${streak}！额外奖励+${Math.round(streakBonus*100)}%`, 'levelup');
    }

    // v43.0: Kill milestones
    const km = updatedPlayer.totalKills;
    const milestones: Record<number, { label: string; gold: number; pantao: number }> = {
      100: { label: '百妖斩', gold: 1000, pantao: 0 },
      500: { label: '五百斩', gold: 5000, pantao: 1 },
      1000: { label: '千妖斩', gold: 10000, pantao: 3 },
      5000: { label: '五千斩', gold: 50000, pantao: 10 },
      10000: { label: '万妖斩', gold: 100000, pantao: 20 },
      50000: { label: '五万斩', gold: 500000, pantao: 50 },
    };
    if (milestones[km]) {
      const ms = milestones[km];
      updatedPlayer.lingshi += ms.gold;
      updatedPlayer.pantao += ms.pantao;
      log = addLog(log, `🎉 击杀里程碑「${ms.label}」！灵石+${ms.gold}${ms.pantao ? ` 蟠桃+${ms.pantao}` : ''}`, 'levelup');
    }

    // Rewards with all multipliers
    const afBuf = useAffinityStore.getState().getBuffs();
    const afLingshi = 1 + (afBuf.lingshiMul ?? 0) / 100;
    const afExp = 1 + (afBuf.expMul ?? 0) / 100;
    const fateMul = (state.fateBlessing.active && state.fateBlessing.expiresAt > Date.now()) ? 2 : 1;
    const petB = getPetTotalBonus(player.petLevels ?? {}, player.activePetId);
    const codexLingshi = 1 + codexB.lingshiPct / 100;
    const codexExp = 1 + codexB.expPct / 100;
    // v154.0: Level milestone bonuses
    const lvlMilB = getLevelMilestoneBonuses(updatedPlayer.highestLevelEver ?? updatedPlayer.level);
    const lvlMilLingshi = 1 + lvlMilB.lingshiPct / 100;
    const lvlMilExp = 1 + lvlMilB.expPct / 100;
    // v155.0: Gem bonuses for gold/exp
    const allGems = Object.values(updatedPlayer.equippedGems ?? {}).flat() as { typeId: string; level: number }[];
    const gemB = allGems.length > 0 ? getGemBonuses(allGems) : { goldMul: 0, expMul: 0 };
    const gemGold = 1 + gemB.goldMul / 100;
    const gemExp = 1 + gemB.expMul / 100;
    // v157.0: Power milestone bonuses
    const pwrMilB = getPowerMilestoneBonuses(state.highestPower ?? 0);
    const pwrGold = 1 + (pwrMilB.goldMul ?? 0);
    const pwrExp = 1 + (pwrMilB.expMul ?? 0);
    const lingshiDrop = Math.floor(enemy.lingshiDrop * lingshiMul * goldMul * (1 + (cEffect.goldMult ?? 0)) * (1 + streakBonus) * (1 + (awk.gold_pct ?? 0) / 100) * afLingshi * (1 + rmb.gold) * fateMul * (1 + (titleBonus.goldMul ?? 0)) * (1 + (petB.goldPct ?? 0) / 100) * trBonusTick.goldMul * codexLingshi * lvlMilLingshi * gemGold * pwrGold);
    const expDrop = Math.floor(enemy.expDrop * expMul * (1 + (cEffect.expMult ?? 0)) * (1 + streakBonus) * (1 + (awk.exp_pct ?? 0) / 100) * afExp * (1 + rmb.exp) * fateMul * (1 + (titleBonus.expMul ?? 0)) * (1 + (petB.expPct ?? 0) / 100) * trBonusTick.expMul * codexExp * lvlMilExp * gemExp * pwrExp);
    updatedPlayer.lingshi += lingshiDrop;
    updatedPlayer.totalGoldEarned = (updatedPlayer.totalGoldEarned || 0) + lingshiDrop;
    updatedPlayer.allTimeLingshi = (updatedPlayer.allTimeLingshi ?? 0) + lingshiDrop;
    updatedPlayer.exp += expDrop;
    tickGold += lingshiDrop;
    tickExp += expDrop;
    log = addLog(log, `  灵石+${lingshiDrop}  经验+${expDrop}`, 'drop');
    if (lingshiDrop > 0) newFloats.push({ id: floatIdCounter++, text: `+${formatNumber(lingshiDrop)}💰`, type: 'gold', timestamp: Date.now() } as FloatingText);
    if (expDrop > 0) newFloats.push({ id: floatIdCounter++, text: `+${formatNumber(expDrop)}✨`, type: 'exp', timestamp: Date.now() } as FloatingText);

    if (enemy.pantaoDrop > 0 && Math.random() < enemy.pantaoDrop) {
      updatedPlayer.pantao += 1;
      log = addLog(log, `  蟠桃+1！`, 'drop');
    }

    // v53.0: Boss consumable drop (20% chance)
    if (enemy.isBoss && Math.random() < 0.2) {
      const pillIds = ['exp_pill', 'gold_pill', 'drop_pill', 'atk_pill', 'crit_pill'];
      const pillId = pillIds[Math.floor(Math.random() * pillIds.length)];
      const def = getConsumable(pillId);
      if (def) {
        const cInv = { ...(updatedPlayer.consumableInventory ?? {}) };
        cInv[pillId] = (cInv[pillId] ?? 0) + 1;
        updatedPlayer.consumableInventory = cInv;
        log = addLog(log, `  获得 ${def.emoji}${def.name} ×1！`, 'drop');
      }
    }

    // v151.0: Elite consumable drop (50% chance)
    if (enemy.elite && Math.random() < 0.5) {
      const pillIds = ['exp_pill', 'gold_pill', 'drop_pill', 'atk_pill', 'crit_pill', 'mega_pill'];
      const pillId = pillIds[Math.floor(Math.random() * pillIds.length)];
      const def = getConsumable(pillId);
      if (def) {
        const cInv = { ...(updatedPlayer.consumableInventory ?? {}) };
        cInv[pillId] = (cInv[pillId] ?? 0) + 1;
        updatedPlayer.consumableInventory = cInv;
        log = addLog(log, `  精英掉落 ${def.emoji}${def.name} ×1！`, 'drop');
      }
    }

    // v155.0: Gem drop from boss/elite kills
    if ((enemy.isBoss || enemy.elite) && Math.random() < gemDropChance(updatedPlayer.level)) {
      const gemType = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
      const gemLv = Math.min(10, 1 + Math.floor(updatedPlayer.level / 500));
      const gemInv = [...(updatedPlayer.gemInventory ?? [])];
      gemInv.push({ typeId: gemType.id, level: gemLv });
      updatedPlayer.gemInventory = gemInv;
      log = addLog(log, `  获得 ${gemType.emoji}${gemType.name} Lv.${gemLv}！`, 'drop');
    }

    // Equipment drop (elite = guaranteed)
    if (updatedInventory.length < getInventoryMax(updatedPlayer.reincarnations)) {
      const globalStage = getGlobalStageLocal(updatedBattle.chapterId, updatedBattle.stageNum);
      const dropMul = REINC_PERKS.find(p => p.id === 'drop_mult')!.effect(updatedPlayer.reincPerks?.['drop_mult'] ?? 0) - 1 + rmb.drop;
      const eqDrop = enemy.elite ? rollEquipDrop(globalStage, true, dropMul + 2) : rollEquipDrop(globalStage, enemy.isBoss, dropMul);
      if (eqDrop) {
        const newItem = createEquipFromTemplate(eqDrop);
        updatedInventory.push(newItem);
        updatedPlayer.totalEquipDrops++;
        if (!(updatedPlayer.codexEquipIds ?? []).includes(eqDrop.id)) {
          updatedPlayer.codexEquipIds = [...(updatedPlayer.codexEquipIds ?? []), eqDrop.id];
        }
        const qi = QUALITY_INFO[eqDrop.quality];
        log = addLog(log, `  获得 ${qi.symbol}${eqDrop.name}`, 'drop');
        newFloats.push({ id: floatIdCounter++, text: `${qi.symbol}${eqDrop.name}`, type: 'drop', timestamp: Date.now() } as FloatingText);
        sfx.itemDrop();
        // v39.0: Auto-equip if better
        if (state.autoEquipOnDrop) {
          const slotKey = newItem.slot === 'weapon' ? 'equippedWeapon' : newItem.slot === 'armor' ? 'equippedArmor' : 'equippedTreasure';
          const current = autoEquipState[slotKey] as EquipmentItem | null;
          const newPower = newItem.baseStat * (1 + newItem.level * 0.1);
          const curPower = current ? current.baseStat * (1 + current.level * 0.1) : 0;
          if (newPower > curPower) {
            if (current) updatedInventory.push(current);
            updatedInventory = updatedInventory.filter(i => i.uid !== newItem.uid);
            autoEquipState[slotKey] = newItem;
            log = addLog(log, `  ⚡ 自动装备 ${qi.symbol}${newItem.name}`, 'info');
          }
        }
      }
    } else {
      const now = Date.now();
      if (now - _lastBackpackFullWarn > 30000) {
        log = addLog(log, `  ⚠️ 背包已满(${updatedInventory.length}/${getInventoryMax(updatedPlayer.reincarnations)})！请分解或开启自动分解`, 'info');
        _lastBackpackFullWarn = now;
      }
    }

    // Level up
    while (updatedPlayer.exp >= expForLevel(updatedPlayer.level)) {
      updatedPlayer.exp -= expForLevel(updatedPlayer.level);
      updatedPlayer.level += 1;
      if (updatedPlayer.level > (updatedPlayer.highestLevelEver ?? 0)) {
        updatedPlayer.highestLevelEver = updatedPlayer.level;
      }
      updatedPlayer.stats.attack += Math.floor(3 + updatedPlayer.level * 0.5);
      updatedPlayer.stats.maxHp += Math.floor(10 + updatedPlayer.level * 2);
      updatedPlayer.stats.hp = updatedPlayer.stats.maxHp;
      updatedPlayer.clickPower = Math.floor(5 + updatedPlayer.level * 0.8);
      log = addLog(log, `升级 Lv.${updatedPlayer.level}  攻+${Math.floor(3 + updatedPlayer.level * 0.5)}  血+${Math.floor(10 + updatedPlayer.level * 2)}`, 'levelup');
      newFloats.push({ id: floatIdCounter++, text: `🎉 Lv.${updatedPlayer.level}`, type: 'levelup', timestamp: Date.now() } as FloatingText);
      sfx.levelUp();
    }

    // Check tribulation completion
    if (updatedBattle.tribulation?.active) {
      const tri = updatedBattle.tribulation;
      const nextRealm = REALMS[tri.realmIndex];
      log = addLog(log, `🎆 天劫已渡！突破「${nextRealm.name}」— ${nextRealm.bonus}`, 'levelup');
      updatedPlayer.realmIndex = tri.realmIndex;
      updatedPlayer.totalBreakthroughs = (updatedPlayer.totalBreakthroughs || 0) + 1;
      updatedPlayer.stats.attack = Math.floor(updatedPlayer.stats.attack * 1.5);
      updatedPlayer.stats.maxHp = Math.floor(updatedPlayer.stats.maxHp * 1.5);
      updatedPlayer.stats.hp = updatedPlayer.stats.maxHp;
      sfx.breakthrough();
      const resumeEnemy = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, false)!;
      updatedBattle = { ...updatedBattle, wave: 1, isBossWave: false, currentEnemy: resumeEnemy, log, tribulation: undefined };
    } else
    // v151.0: Track elite kills
    if (enemy.elite) {
      updatedPlayer.totalEliteKills = (updatedPlayer.totalEliteKills ?? 0) + 1;
    }

    // Next wave / stage
    if (updatedBattle.isBossWave) {
      updatedPlayer.totalBossKills = (updatedPlayer.totalBossKills || 0) + 1;
      const nextStage = updatedBattle.stageNum + 1;
      const chapter = CHAPTERS.find(c => c.id === updatedBattle.chapterId);
      let newChapterId = updatedBattle.chapterId;
      let newStageNum = nextStage;

      if (chapter && nextStage > chapter.stages) {
        const nextChapter = CHAPTERS.find(c => c.id === updatedBattle.chapterId + 1);
        if (nextChapter) {
          newChapterId = nextChapter.id;
          newStageNum = 1;
          log = addLog(log, `第${chapter.id}章「${chapter.name}」通关！`, 'info');
        } else {
          newChapterId = ABYSS_CHAPTER_ID;
          newStageNum = 1;
          log = addLog(log, `第${chapter.id}章「${chapter.name}」通关！进入无尽深渊！`, 'info');
        }
      }

      const newEnemy = applyElite(createEnemy(newChapterId, newStageNum, false)!, updatedPlayer.level);
      updatedBattle = {
        ...updatedBattle, chapterId: newChapterId, stageNum: newStageNum,
        wave: 1, isBossWave: false, currentEnemy: newEnemy, log,
      };
      log = addLog(log, newEnemy.elite ? `⚡ 精英 ${newEnemy.name} 降临！` : `${newEnemy.name} 出现了！`, newEnemy.elite ? 'boss' : 'info');

      const hc = newChapterId > state.highestChapter ? newChapterId : state.highestChapter;
      const hs = newChapterId > state.highestChapter ? newStageNum :
        (newChapterId === state.highestChapter && newStageNum > state.highestStage ? newStageNum : state.highestStage);
      const haf = newChapterId === ABYSS_CHAPTER_ID && newStageNum > state.highestAbyssFloor
        ? newStageNum : state.highestAbyssFloor;
      set({ highestChapter: hc, highestStage: hs, highestAbyssFloor: haf });
    } else {
      const nextWave = updatedBattle.wave + 1;
      if (nextWave > updatedBattle.maxWaves) {
        const boss = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, true)!;
        log = addLog(log, `══ BOSS: ${boss.name} ══`, 'boss');
        sfx.bossAppear();
        updatedBattle = { ...updatedBattle, wave: nextWave, isBossWave: true, currentEnemy: boss, log };
      } else {
        const newEnemy = applyElite(createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, false)!, updatedPlayer.level);
        if (newEnemy.elite) log = addLog(log, `⚡ 精英 ${newEnemy.name} 降临！`, 'boss');
        updatedBattle = { ...updatedBattle, wave: nextWave, isBossWave: false, currentEnemy: newEnemy, log };
      }
    }
  } else {
    updatedBattle = { ...updatedBattle, currentEnemy: enemy, log };
  }

  // Update idle stats (rolling average)
  const prevStats = state.idleStats;
  const sessionTime = prevStats.sessionTime + 1;
  const alpha = 0.2;
  const goldPerSec = prevStats.goldPerSec * (1 - alpha) + tickGold * alpha;
  const expPerSec = prevStats.expPerSec * (1 - alpha) + tickExp * alpha;
  const dps = prevStats.dps * (1 - alpha) + tickDmg * alpha;

  updatedPlayer.totalCultivateTime += 1;

  // v13: Sanctuary production per tick
  const sBuffs = useSanctuaryStore.getState().getBuffs();
  if (sBuffs.lingshi) updatedPlayer.lingshi += sBuffs.lingshi;
  if (sBuffs.exp) updatedPlayer.exp += sBuffs.exp;

  // v123.0: All auto-actions
  const tickCtx: TickContext = {
    state, get, set,
    updatedPlayer, updatedBattle, updatedInventory,
    log, addLog,
    totalPlayTime: state.totalPlayTime,
  };
  if (runAllAutoActions(tickCtx)) return;
  updatedPlayer = tickCtx.updatedPlayer;
  updatedBattle = tickCtx.updatedBattle;
  updatedInventory = tickCtx.updatedInventory;
  log = tickCtx.log;

  set({
    player: updatedPlayer,
    battle: updatedBattle,
    inventory: updatedInventory.length > getInventoryMax(updatedPlayer.reincarnations)
      ? (() => {
          const qualityOrder = Object.keys(QUALITY_INFO);
          const unlocked = updatedInventory.filter(i => !i.locked);
          unlocked.sort((a, b) => qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality));
          const toRemove = new Set(unlocked.slice(0, updatedInventory.length - getInventoryMax(updatedPlayer.reincarnations)).map(i => i.uid));
          for (const item of unlocked.slice(0, updatedInventory.length - getInventoryMax(updatedPlayer.reincarnations))) {
            const stat = item.baseStat * (1 + item.level * 0.1);
            updatedPlayer.lingshi += Math.floor(stat * 0.6 + (item.level + 1) * 30);
          }
          return updatedInventory.filter(i => !toRemove.has(i.uid));
        })()
      : updatedInventory,
    equippedWeapon: autoEquipState.equippedWeapon ?? null,
    equippedArmor: autoEquipState.equippedArmor ?? null,
    equippedTreasure: autoEquipState.equippedTreasure ?? null,
    floatingTexts: newFloats.slice(-10),
    idleStats: { goldPerSec, expPerSec, dps, sessionTime },
    totalPlayTime: state.totalPlayTime + 1,
  });
}
