/**
 * v123.0「千锤百炼」— Auto-action functions extracted from gameStore tick()
 * Each function operates on mutable player/battle state and returns void.
 */
import { PlayerState, BattleState, EquipmentItem, Quality, QUALITY_INFO } from '../types';
import { useDailyStore } from './dailyStore';
import { CHAPTERS, createEnemy, ABYSS_CHAPTER_ID } from '../data/chapters';
import { ABYSS_MILESTONES } from '../data/abyssMilestones';
import { REINC_PERKS, REINC_MIN_REALM, REINC_MIN_LEVEL } from '../data/reincarnation';
import { TRANSCEND_PERKS, TRANSCEND_MIN_REINC } from '../data/transcendence';
import { AWAKENING_PATHS, totalAwakeningPoints, AWAKENING_UNLOCK_REINC } from '../data/awakening';
import { calcTrialRewards } from '../data/roguelikeTrial';
import { getDailyChallenges as getAscChallenges, MODIFIERS as ASC_MODIFIERS } from '../data/ascensionChallenge';
import { getDailyChallenges as getDCChallenges } from '../data/dailyChallenge';
import { getEnhanceCost, getMaxEnhanceLevel, EQUIPMENT_TEMPLATES } from '../data/equipment';
import { getReforgeCost } from './equipmentActions';
import { PETS as PETS_DATA, EVOLUTION_STAGES as EVOLUTION_STAGES_DATA } from '../data/pets';
import { useSanctuaryStore } from './sanctuaryStore';
import { BUILDINGS as SANCT_BUILDINGS, getUpgradeCost as getSanctUpgradeCost } from '../engine/sanctuary';
import { useAffinityStore } from './affinityStore';
import { AFFINITY_NPCS as AFFINITY_NPCS_LIST } from '../engine/affinity';
import { TITLES, type TitleCheckStats } from '../data/titles';
import { STORIES as STORY_LIST } from '../data/story';
import { WEEKLY_FLOORS, getWeekStart } from '../data/weeklyBoss';
import { useExplorationStore } from './explorationStore';
import { useDailyChallengeStore } from './dailyChallengeStore';
import { REALMS } from '../data/realms';
import { SCROLL_PRICES } from '../data/equipment';
import { sfx } from '../engine/audio';

// Helper type for tick context
export interface TickContext {
  state: any; // GameStore state
  get: () => any;
  set: (partial: any) => void;
  updatedPlayer: PlayerState;
  updatedBattle: BattleState;
  updatedInventory: EquipmentItem[];
  log: any[];
  addLog: (log: any[], msg: string, type: 'attack' | 'crit' | 'kill' | 'drop' | 'levelup' | 'info' | 'boss') => any[];
  totalPlayTime: number;
}

/** Auto-upgrade sanctuary buildings (cheapest first) */
export function autoUpgradeSanctuary(ctx: TickContext) {
  if (!ctx.state.autoSanctuary) return;
  const sanctStore = useSanctuaryStore.getState();
  const sanctLevels = sanctStore.sanctuary.levels;
  const upgradeable = SANCT_BUILDINGS
    .map(b => ({ id: b.id, cost: getSanctUpgradeCost(b, sanctLevels[b.id] ?? 0), lv: sanctLevels[b.id] ?? 0 }))
    .filter(x => x.lv < 10 && x.cost <= ctx.updatedPlayer.lingshi)
    .sort((a, b) => a.cost - b.cost);
  if (upgradeable.length > 0) {
    const best = upgradeable[0];
    const res = sanctStore.upgrade(best.id, ctx.updatedPlayer.lingshi);
    if (res) ctx.updatedPlayer.lingshi -= res.cost;
  }
}

/** Auto-gift affinity NPCs (smart tier selection, every 10 ticks) */
export function autoGiftAffinity(ctx: TickContext) {
  if (!ctx.state.autoAffinity || ctx.totalPlayTime % 10 !== 0) return;
  const affStore = useAffinityStore.getState();
  for (const npc of AFFINITY_NPCS_LIST) {
    const tier = ctx.updatedPlayer.lingshi >= 10000 ? 2 : ctx.updatedPlayer.lingshi >= 1000 ? 1 : 0;
    const cost = [100, 1000, 10000][tier];
    if (ctx.updatedPlayer.lingshi >= cost) {
      const result = affStore.gift(npc.id, ctx.updatedPlayer.lingshi, tier);
      if (result) ctx.updatedPlayer.lingshi -= result.cost;
    }
  }
}

/** Auto-farm: retreat when struggling, push when farming too easy */
export function autoFarmPush(ctx: TickContext) {
  if (!ctx.state.autoFarm || ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const curChapter = ctx.updatedBattle.chapterId;
  if (curChapter >= ctx.state.highestChapter && ctx.state.highestChapter > 1 && curChapter < ABYSS_CHAPTER_ID) {
    const curEnemy = ctx.updatedBattle.currentEnemy;
    if (curEnemy && curEnemy.hp > curEnemy.maxHp * 0.5) {
      const farmChapter = ctx.state.highestChapter - 1;
      const farmCh = CHAPTERS.find(c => c.id === farmChapter);
      if (farmCh) {
        const farmEnemy = createEnemy(farmChapter, 1, false)!;
        ctx.log = ctx.addLog(ctx.log, `🧭 自动回退至「${farmCh.name}」高效刷怪`, 'info');
        ctx.updatedBattle = { ...ctx.updatedBattle, chapterId: farmChapter, stageNum: 1, wave: 1, isBossWave: false, currentEnemy: farmEnemy, log: ctx.log, tribulation: undefined };
      }
    }
  } else if (curChapter < ctx.state.highestChapter && curChapter < ABYSS_CHAPTER_ID) {
    const curEnemy = ctx.updatedBattle.currentEnemy;
    if (curEnemy && curEnemy.hp <= 0) {
      const pushCh = CHAPTERS.find(c => c.id === ctx.state.highestChapter);
      if (pushCh) {
        const pushEnemy = createEnemy(ctx.state.highestChapter, ctx.state.highestStage, false)!;
        ctx.log = ctx.addLog(ctx.log, `⚔️ 实力提升！自动推进至「${pushCh.name}」`, 'info');
        ctx.updatedBattle = { ...ctx.updatedBattle, chapterId: ctx.state.highestChapter, stageNum: ctx.state.highestStage, wave: 1, isBossWave: false, currentEnemy: pushEnemy, log: ctx.log, tribulation: undefined };
      }
    }
  }
}

/** Auto-sweep cleared chapters every 60 ticks */
export function autoSweepChapters(ctx: TickContext) {
  if (!ctx.state.autoSweep || ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  const result = ctx.get().sweepAll();
  if (result.chapters > 0) {
    ctx.updatedPlayer = ctx.get().player;
  }
}

/** Auto-activate fate blessing */
export function autoActivateFate(ctx: TickContext) {
  if (!ctx.state.autoFate || ctx.state.fateBlessing.active || ctx.updatedPlayer.tianmingScrolls <= 0) return;
  ctx.updatedPlayer.tianmingScrolls -= 1;
  ctx.set({ fateBlessing: { active: true, expiresAt: Date.now() + 2 * 60 * 60 * 1000 } });
}

/** Auto-spin lucky wheel every hour */
export function autoSpinWheel(ctx: TickContext) {
  if (!ctx.state.autoWheel || ctx.totalPlayTime % 30 !== 0 || ctx.updatedPlayer.lingshi < 5000) return;
  const now = Date.now();
  if (now - ctx.state.lastWheelSpin < 3600_000) return;
  ctx.updatedPlayer.lingshi -= 5000;
  const roll = Math.random();
  const lv = ctx.updatedPlayer.level;
  const goldBase = Math.max(1000, lv * 500);
  if (roll < 0.25) { ctx.updatedPlayer.lingshi += goldBase; }
  else if (roll < 0.45) { ctx.updatedPlayer.exp += Math.floor(goldBase * 0.8); }
  else if (roll < 0.60) { ctx.updatedPlayer.pantao += Math.max(10, Math.floor(lv / 2)); }
  else if (roll < 0.72) { ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + Math.max(5, Math.floor(lv / 10)); }
  else if (roll < 0.82) { ctx.updatedPlayer.lingshi += Math.floor(goldBase * 1.5); }
  else if (roll < 0.90) { ctx.updatedPlayer.pantao += Math.max(20, lv); }
  else if (roll < 0.95) { ctx.updatedPlayer.tianmingScrolls = (ctx.updatedPlayer.tianmingScrolls ?? 0) + 1; }
  else if (roll < 0.98) { ctx.updatedPlayer.lingshi += goldBase * 3; }
  else { ctx.updatedPlayer.lingshi += goldBase * 10; }
  ctx.set({ lastWheelSpin: now });
}

/** Auto quick trial every 300 ticks */
export function autoQuickTrial(ctx: TickContext) {
  if (!ctx.state.autoTrial || ctx.totalPlayTime % 300 !== 0 || ctx.totalPlayTime === 0) return;
  if ((ctx.updatedPlayer.trialBestFloor ?? 0) < 3) return;
  const quickFloor = Math.max(1, Math.floor((ctx.updatedPlayer.trialBestFloor ?? 0) * 0.7));
  const rewards = calcTrialRewards(quickFloor, ctx.updatedPlayer.level);
  ctx.updatedPlayer.lingshi += rewards.lingshi;
  ctx.updatedPlayer.exp += rewards.exp;
  ctx.updatedPlayer.pantao += rewards.pantao;
  ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens ?? 0) + rewards.trialTokens;
}

/** Auto ascension challenge daily (every 600 ticks) */
export function autoAscensionChallenge(ctx: TickContext) {
  if (!ctx.state.autoAscension || ctx.totalPlayTime % 600 !== 0 || ctx.totalPlayTime === 0) return;
  const today = new Date().toDateString();
  const completed = ctx.state.completedChallengesDate === today ? [...(ctx.state.completedChallenges ?? [])] : [];
  const challenges = getAscChallenges();
  let changed = false;
  for (const ch of challenges) {
    if (completed.includes(ch.id)) continue;
    if (ctx.updatedPlayer.level < (ch.levelReq ?? 0)) continue;
    const rewardMult = ch.modifiers.reduce((m: number, mid: string) => {
      const mod = ASC_MODIFIERS.find((x) => x.id === mid);
      return m * (mod?.rewardMult ?? 1);
    }, 1);
    const lv = ctx.updatedPlayer.level;
    ctx.updatedPlayer.lingshi += Math.floor(ch.rewards.lingshi * lv * rewardMult);
    ctx.updatedPlayer.pantao += Math.floor(ch.rewards.pantao * rewardMult);
    ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + Math.floor(ch.rewards.shards * rewardMult);
    ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens ?? 0) + Math.floor(ch.rewards.trialTokens * rewardMult);
    ctx.updatedPlayer.daoPoints = (ctx.updatedPlayer.daoPoints ?? 0) + Math.floor(ch.rewards.daoPoints * rewardMult);
    completed.push(ch.id);
    changed = true;
  }
  if (changed) {
    ctx.set({ completedChallenges: completed, completedChallengesDate: today });
  }
}

/** Auto-enhance equipped gear every 30 ticks (+1~+10 only) */
export function autoEnhanceGear(ctx: TickContext) {
  if (!ctx.state.autoEnhance || ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const slots: Array<{ item: EquipmentItem | null; key: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' }> = [
    { item: ctx.state.equippedWeapon, key: 'equippedWeapon' },
    { item: ctx.state.equippedArmor, key: 'equippedArmor' },
    { item: ctx.state.equippedTreasure, key: 'equippedTreasure' },
  ];
  for (const { item, key } of slots) {
    if (!item) continue;
    const maxLv = getMaxEnhanceLevel(item);
    if (item.level >= maxLv || item.level >= 10) continue;
    const cost = getEnhanceCost(item);
    if (ctx.updatedPlayer.lingshi >= cost) {
      ctx.updatedPlayer.lingshi -= cost;
      const enhanced = { ...item, level: item.level + 1 };
      ctx.set({ [key]: enhanced } as any);
    }
  }
}

/** Auto-reforge equipped items every 60 ticks: only reforge if result would be better */
export function autoReforgeGear(ctx: TickContext) {
  if (!ctx.state.autoReforge || ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  const slots: Array<{ item: EquipmentItem | null; key: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' }> = [
    { item: ctx.state.equippedWeapon, key: 'equippedWeapon' },
    { item: ctx.state.equippedArmor, key: 'equippedArmor' },
    { item: ctx.state.equippedTreasure, key: 'equippedTreasure' },
  ];
  for (const { item, key } of slots) {
    if (!item) continue;
    const template = EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId);
    if (!template) continue;
    // Only reforge if current baseStat < template max (130%)
    const maxPossible = Math.ceil(template.baseStat * 1.3);
    if (item.baseStat >= maxPossible) continue; // Already perfect
    const cost = getReforgeCost(item);
    if (ctx.updatedPlayer.lingshi < cost * 3) continue; // Keep buffer: only reforge if can afford 3x
    // Roll
    const min = Math.max(1, Math.floor(template.baseStat * 0.7));
    const max = Math.ceil(template.baseStat * 1.3);
    const newBaseStat = min + Math.floor(Math.random() * (max - min + 1));
    if (newBaseStat <= item.baseStat) continue; // Only accept upgrades
    ctx.updatedPlayer.lingshi -= cost;
    const enhanced = { ...item, baseStat: newBaseStat };
    ctx.set({ [key]: enhanced } as any);
    break; // One reforge per tick
  }
}

/** v155.0: Auto-socket gems into equipped items every 30 ticks */
export function autoSocketGems(ctx: TickContext) {
  if (ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const gemInv = ctx.updatedPlayer.gemInventory ?? [];
  if (gemInv.length === 0) return;
  const slots = [
    { item: ctx.state.equippedWeapon },
    { item: ctx.state.equippedArmor },
    { item: ctx.state.equippedTreasure },
  ];
  const equippedGems = { ...(ctx.updatedPlayer.equippedGems ?? {}) };
  const remaining = [...gemInv];
  let changed = false;
  for (const { item } of slots) {
    if (!item) continue;
    const maxSlots = QUALITY_GEM_SLOTS[item.quality] ?? 0;
    const current = [...(equippedGems[item.uid] ?? [])];
    while (current.length < maxSlots && remaining.length > 0) {
      // Pick highest level gem
      let bestIdx = 0;
      for (let i = 1; i < remaining.length; i++) {
        if (remaining[i].level > remaining[bestIdx].level) bestIdx = i;
      }
      current.push(remaining.splice(bestIdx, 1)[0]);
      changed = true;
    }
    if (current.length > 0) equippedGems[item.uid] = current;
  }
  if (changed) {
    ctx.updatedPlayer.gemInventory = remaining;
    ctx.updatedPlayer.equippedGems = equippedGems;
  }
  // Auto-merge: combine 3 same-type same-level gems
  let inv = ctx.updatedPlayer.gemInventory ?? [];
  let merged = true;
  while (merged) {
    merged = false;
    const counts: Record<string, number> = {};
    for (const g of inv) { const k = `${g.typeId}_${g.level}`; counts[k] = (counts[k] ?? 0) + 1; }
    for (const [key, count] of Object.entries(counts)) {
      if (count < 3) continue;
      const [typeId, lvStr] = key.split('_');
      const lv = parseInt(lvStr);
      if (lv >= 10) continue;
      let removed = 0;
      inv = inv.filter(g => {
        if (removed >= 3) return true;
        if (g.typeId === typeId && g.level === lv) { removed++; return false; }
        return true;
      });
      inv.push({ typeId, level: lv + 1 });
      merged = true;
      break;
    }
  }
  ctx.updatedPlayer.gemInventory = inv;
}

const QUALITY_GEM_SLOTS: Record<string, number> = {
  common: 0, spirit: 1, immortal: 1, divine: 2, legendary: 2, mythic: 3,
};

/** Auto-feed active pet every 20 ticks + auto-switch best pet every 60 ticks */
export function autoManagePets(ctx: TickContext) {
  if (!ctx.state.autoFeedPet || ctx.totalPlayTime === 0) return;
  // Feed every 20 ticks
  if (ctx.totalPlayTime % 20 === 0 && ctx.updatedPlayer.activePetId) {
    const pet = PETS_DATA.find(p => p.id === ctx.updatedPlayer.activePetId);
    if (pet) {
      const currentLv = ctx.updatedPlayer.petLevels?.[pet.id] ?? 0;
      if (currentLv < pet.maxLevel) {
        const cost = pet.feedCost(currentLv);
        if (ctx.updatedPlayer.lingshi >= cost) {
          ctx.updatedPlayer.lingshi -= cost;
          ctx.updatedPlayer.petLevels = { ...ctx.updatedPlayer.petLevels, [pet.id]: currentLv + 1 };
        }
      }
    }
  }
  // Auto-evolve pets every 60 ticks (v159.0)
  if (ctx.totalPlayTime % 60 === 0) {
    for (const pet of PETS_DATA) {
      const lv = ctx.updatedPlayer.petLevels?.[pet.id] ?? 0;
      if (lv < pet.maxLevel) continue;
      const stage = ctx.updatedPlayer.petEvolutions?.[pet.id] ?? 0;
      if (stage >= 3) continue;
      const next = EVOLUTION_STAGES_DATA[stage + 1];
      if (ctx.updatedPlayer.lingshi >= next.cost.lingshi && ctx.updatedPlayer.pantao >= next.cost.pantao && ctx.updatedPlayer.hongmengShards >= next.cost.hongmengShards) {
        ctx.updatedPlayer.lingshi -= next.cost.lingshi;
        ctx.updatedPlayer.pantao -= next.cost.pantao;
        ctx.updatedPlayer.hongmengShards -= next.cost.hongmengShards;
        ctx.updatedPlayer.petEvolutions = { ...(ctx.updatedPlayer.petEvolutions ?? {}), [pet.id]: stage + 1 };
        ctx.log = ctx.addLog(ctx.log, `${pet.emoji}${pet.name} 自动进化为【${next.name}】！`, 'levelup');
        break; // one per tick
      }
    }
  }
  // Switch best pet every 60 ticks
  if (ctx.totalPlayTime % 60 === 0) {
    let bestPet: string | null = null;
    let bestScore = -1;
    for (const pet of PETS_DATA) {
      if (ctx.updatedPlayer.level < pet.unlockLevel) continue;
      const lv = ctx.updatedPlayer.petLevels?.[pet.id] ?? 0;
      if (lv <= 0) continue;
      const b = pet.bonuses(lv);
      const score = (b.atkPct ?? 0) + (b.hpPct ?? 0) * 0.3 + (b.expPct ?? 0) * 0.5 + (b.goldPct ?? 0) * 0.3 + (b.critRate ?? 0) * 2 + (b.critDmg ?? 0) * 0.5 + (b.dropRate ?? 0) * 0.5;
      if (score > bestScore) { bestScore = score; bestPet = pet.id; }
    }
    if (bestPet && bestPet !== ctx.updatedPlayer.activePetId) {
      ctx.updatedPlayer.activePetId = bestPet;
    }
  }
}

/** Auto-buy reincarnation perks + awakening nodes every 60 ticks */
export function autoBuyPerksAndAwakening(ctx: TickContext) {
  if (!ctx.state.autoBuyPerks || ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  // Buy reincarnation perks
  if (ctx.updatedPlayer.daoPoints > 0) {
    let bought = true;
    while (bought) {
      bought = false;
      let cheapest: { id: string; cost: number } | null = null;
      for (const perk of REINC_PERKS) {
        const lv = ctx.updatedPlayer.reincPerks?.[perk.id] ?? 0;
        if (lv >= perk.maxLevel) continue;
        if (!cheapest || perk.costPerLevel < cheapest.cost) {
          cheapest = { id: perk.id, cost: perk.costPerLevel };
        }
      }
      if (cheapest && ctx.updatedPlayer.daoPoints >= cheapest.cost) {
        ctx.updatedPlayer.daoPoints -= cheapest.cost;
        ctx.updatedPlayer.reincPerks = { ...ctx.updatedPlayer.reincPerks, [cheapest.id]: (ctx.updatedPlayer.reincPerks?.[cheapest.id] ?? 0) + 1 };
        bought = true;
      }
    }
  }
  // Unlock awakening nodes
  const reincCount = ctx.updatedPlayer.reincarnations ?? 0;
  if (reincCount >= AWAKENING_UNLOCK_REINC) {
    const awState = ctx.updatedPlayer.awakening ?? { unlockedNodes: [] as string[], selectedPath: null };
    const unlocked = new Set<string>(awState.unlockedNodes ?? []);
    const totalPts = totalAwakeningPoints(reincCount);
    const spentPts = (awState.unlockedNodes ?? []).reduce((sum: number, nid: string) => {
      for (const path of AWAKENING_PATHS) {
        const node = path.nodes.find(n => n.id === nid);
        if (node) return sum + node.cost;
      }
      return sum;
    }, 0);
    let avail = totalPts - spentPts;
    let changed = false;
    let found = true;
    // Prefer selected path first, then cheapest across all paths
    const preferredPathId = awState.selectedPath;
    const sortedPaths = preferredPathId
      ? [AWAKENING_PATHS.find(p => p.id === preferredPathId)!, ...AWAKENING_PATHS.filter(p => p.id !== preferredPathId)]
      : AWAKENING_PATHS;
    while (found && avail > 0) {
      found = false;
      let cheapestNode: { id: string; cost: number } | null = null;
      for (const path of sortedPaths) {
        if (!path) continue;
        for (const node of path.nodes) {
          if (unlocked.has(node.id)) continue;
          if (node.requires && !unlocked.has(node.requires)) continue;
          if (node.cost <= avail && (!cheapestNode || node.cost < cheapestNode.cost)) {
            cheapestNode = { id: node.id, cost: node.cost };
            // If this is on the preferred path, prioritize it immediately
            if (preferredPathId && path.id === preferredPathId) break;
          }
        }
        if (cheapestNode && preferredPathId && path.id === preferredPathId) break;
      }
      if (cheapestNode) {
        unlocked.add(cheapestNode.id);
        avail -= cheapestNode.cost;
        changed = true;
        found = true;
      }
    }
    if (changed) {
      ctx.updatedPlayer.awakening = { ...awState, unlockedNodes: Array.from(unlocked) };
    }
  }
}

/** Auto-synthesize equipment every 45 ticks */
export function autoSynthEquip(ctx: TickContext) {
  if (!ctx.state.autoSynth || ctx.totalPlayTime % 45 !== 0 || ctx.totalPlayTime === 0) return;
  const qualityOrder: Quality[] = ['common', 'spirit', 'immortal', 'divine', 'legendary'];
  let didSynth = true;
  while (didSynth) {
    didSynth = false;
    const currentInv = ctx.get().inventory;
    for (const q of qualityOrder) {
      const candidates = currentInv.filter((i: EquipmentItem) => i.quality === q && !i.locked);
      if (candidates.length >= 3) {
        const uids = candidates.slice(0, 3).map((i: EquipmentItem) => i.uid);
        const result = ctx.get().synthesizeEquip(uids);
        if (result.success) { didSynth = true; break; }
      }
    }
  }
}

/** Auto-reincarnate every 120 ticks. Returns true if reincarnated (caller should return early). */
export function autoReincarnate(ctx: TickContext): boolean {
  if (!ctx.state.autoReincarnate || ctx.totalPlayTime % 120 !== 0 || ctx.totalPlayTime === 0) return false;
  if (ctx.updatedPlayer.realmIndex >= REINC_MIN_REALM && ctx.updatedPlayer.level >= REINC_MIN_LEVEL) {
    ctx.set({ player: ctx.updatedPlayer, battle: ctx.updatedBattle, inventory: ctx.updatedInventory });
    ctx.get().reincarnate();
    return true;
  }
  return false;
}

/** Auto-transcend every 180 ticks. Returns true if transcended. */
export function autoTranscend(ctx: TickContext): boolean {
  if (!ctx.state.autoTranscend || ctx.totalPlayTime % 180 !== 0 || ctx.totalPlayTime === 0) return false;
  const reincCount = ctx.updatedPlayer.reincarnations ?? 0;
  if (reincCount >= TRANSCEND_MIN_REINC && ctx.updatedPlayer.realmIndex >= REINC_MIN_REALM && ctx.updatedPlayer.level >= REINC_MIN_LEVEL) {
    ctx.set({ player: ctx.updatedPlayer, battle: ctx.updatedBattle, inventory: ctx.updatedInventory });
    ctx.get().transcend();
    return true;
  }
  return false;
}

/** Auto-buy transcendence perks every 90 ticks */
export function autoBuyTranscendPerks(ctx: TickContext) {
  if (!ctx.state.autoBuyTranscendPerks || ctx.totalPlayTime % 90 !== 0 || ctx.totalPlayTime === 0) return;
  if ((ctx.updatedPlayer.transcendPoints ?? 0) <= 0) return;
  let bought = true;
  while (bought) {
    bought = false;
    let cheapest: { id: string; cost: number } | null = null;
    for (const perk of TRANSCEND_PERKS) {
      const lv = (ctx.updatedPlayer.transcendPerks ?? {})[perk.id] ?? 0;
      if (lv >= perk.maxLevel) continue;
      if (!cheapest || perk.costPerLevel < cheapest.cost) {
        cheapest = { id: perk.id, cost: perk.costPerLevel };
      }
    }
    if (cheapest && (ctx.updatedPlayer.transcendPoints ?? 0) >= cheapest.cost) {
      ctx.updatedPlayer.transcendPoints = (ctx.updatedPlayer.transcendPoints ?? 0) - cheapest.cost;
      ctx.updatedPlayer.transcendPerks = { ...(ctx.updatedPlayer.transcendPerks ?? {}), [cheapest.id]: ((ctx.updatedPlayer.transcendPerks ?? {})[cheapest.id] ?? 0) + 1 };
      bought = true;
    }
  }
}

/** Auto-explore dungeons */
export function autoExploreDungeons(ctx: TickContext) {
  useExplorationStore.getState().tickReset(); // daily reset always
  if (!ctx.state.autoExplore) return;
  const explStore = useExplorationStore.getState();
  const expl = explStore.exploration;
  if (expl.currentRun && !expl.currentRun.completed) {
    const result = explStore.resolveNode();
    if (result?.reward) {
      if (result.reward.lingshi) ctx.updatedPlayer.lingshi += result.reward.lingshi;
      if (result.reward.exp) ctx.updatedPlayer.exp += result.reward.exp;
      if (result.reward.pantao) ctx.updatedPlayer.pantao += result.reward.pantao;
    }
  } else if (!expl.currentRun || expl.currentRun.completed) {
    if (expl.dailyFree > 0) {
      const diff = Math.min(4, Math.max(1, Math.floor(ctx.updatedPlayer.level / 50) + 1));
      explStore.startRun(diff, ctx.updatedPlayer.lingshi);
    }
  }
}

/** Title unlock check every 30 ticks */
export function checkTitleUnlocks(ctx: TickContext) {
  if (ctx.totalPlayTime % 30 !== 0) return;
  const titleStats: TitleCheckStats = {
    level: ctx.updatedPlayer.level,
    reincarnations: ctx.updatedPlayer.reincarnations ?? 0,
    totalKills: ctx.updatedPlayer.totalKills ?? 0,
    highestChapter: ctx.state.highestChapter,
    achievementCount: 0,
    equipmentCollected: (ctx.updatedPlayer.codexEquipIds ?? []).length,
    monsterCollected: (ctx.updatedPlayer.codexEnemyNames ?? []).length,
    trialBestFloor: ctx.updatedPlayer.trialBestFloor ?? 0,
    totalPlayTimeSec: ctx.state.totalPlayTime,
    awakeningPoints: ctx.updatedPlayer.awakeningPoints ?? 0,
  };
  const current = ctx.state.unlockedTitles ?? [];
  const newUnlocked = TITLES.filter(t => t.condition(titleStats)).map(t => t.id);
  if (newUnlocked.length > current.length) {
    const newlyEarned = newUnlocked.filter((id: string) => !current.includes(id));
    const newTitle = newlyEarned.length > 0 ? TITLES.find(t => t.id === newlyEarned[0]) : null;
    ctx.set({ unlockedTitles: newUnlocked, titleToast: newTitle ? `🏅 称号解锁：${newTitle.name}` : null });
    if (newTitle) setTimeout(() => ctx.set({ titleToast: null }), 4000);
  }
}

/** Story triggers every 10 ticks */
export function checkStoryTriggers(ctx: TickContext) {
  if (ctx.totalPlayTime % 10 !== 0) return;
  const seen = ctx.state.seenStories ?? [];
  for (const story of STORY_LIST) {
    if (seen.includes(story.id)) continue;
    let triggered = false;
    if (story.trigger.type === 'level' && ctx.updatedPlayer.level >= story.trigger.value) triggered = true;
    if (story.trigger.type === 'reincarnation' && ctx.updatedPlayer.reincarnations >= story.trigger.value) triggered = true;
    if (triggered) {
      const newSeen = [...seen, story.id];
      if (story.reward) {
        if (story.reward.type === 'lingshi') ctx.updatedPlayer.lingshi += story.reward.amount;
        if (story.reward.type === 'pantao') ctx.updatedPlayer.pantao += story.reward.amount;
        if (story.reward.type === 'exp') ctx.updatedPlayer.exp += story.reward.amount;
      }
      ctx.set({ seenStories: newSeen, activeStory: { title: story.title, text: story.text, reward: story.reward }, player: ctx.updatedPlayer });
      break;
    }
  }
}

/** Auto-decompose low quality items */
export function autoDecompose(ctx: TickContext) {
  const adq = ctx.state.autoDecomposeQuality;
  if (adq <= 0) return;
  const qualityOrder = ['common', 'spirit', 'immortal', 'divine', 'legendary', 'mythic'];
  const equipped = [ctx.state.equippedWeapon?.uid, ctx.state.equippedArmor?.uid, ctx.state.equippedTreasure?.uid];
  const toDecomp = ctx.updatedInventory.filter((i: EquipmentItem) => {
    const qi = qualityOrder.indexOf(i.quality);
    return qi < adq && !equipped.includes(i.uid) && !i.locked;
  });
  if (toDecomp.length > 0) {
    for (const item of toDecomp) {
      const qm = QUALITY_INFO[item.quality].multiplier;
      ctx.updatedPlayer.hongmengShards += Math.ceil(qm * (1 + item.level * 0.5));
    }
    ctx.updatedInventory = ctx.updatedInventory.filter((i: EquipmentItem) => !toDecomp.some((d: EquipmentItem) => d.uid === i.uid));
  }
}

/** Auto-breakthrough triggers tribulation */
export function autoBreakthrough(ctx: TickContext) {
  const autoBreakNext = REALMS[ctx.updatedPlayer.realmIndex + 1];
  if (!autoBreakNext || ctx.updatedPlayer.level < autoBreakNext.levelReq || ctx.updatedPlayer.pantao < autoBreakNext.pantaoReq || ctx.updatedBattle.tribulation?.active) return;
  const tribNames = ['雷劫', '火劫', '风劫', '心魔', '天劫', '九天雷罚', '混沌劫', '灭世天劫', '鸿蒙劫'];
  const tribEmojis = ['[雷]', '[火]', '[风]', '[魔]', '[劫]', '[雷]', '[混]', '[灭]', '[鸿]'];
  const ri = ctx.updatedPlayer.realmIndex;
  const tribHp = Math.floor(ctx.updatedPlayer.stats.maxHp * (3 + ri * 2));
  const tribDef = Math.floor(ctx.updatedPlayer.level * 5 * (1 + ri * 0.15));
  const tribName = tribNames[Math.min(ri, tribNames.length - 1)];
  const tribEmoji = tribEmojis[Math.min(ri, tribEmojis.length - 1)];
  ctx.updatedPlayer = { ...ctx.updatedPlayer, pantao: ctx.updatedPlayer.pantao - autoBreakNext.pantaoReq };
  ctx.updatedBattle = { ...ctx.updatedBattle,
    currentEnemy: {
      name: tribName, emoji: tribEmoji, hp: tribHp, maxHp: tribHp, defense: tribDef,
      lingshiDrop: 0, expDrop: 0, pantaoDrop: Math.floor(autoBreakNext.pantaoReq * 0.3), isBoss: true,
    },
    isBossWave: true,
    tribulation: { active: true, realmIndex: ctx.updatedPlayer.realmIndex + 1, timer: 60 + ri * 10 },
    log: ctx.addLog(ctx.updatedBattle.log, `⚡ 自动渡劫！「${tribName}」降临 — ${60 + ri * 10}秒限时！`, 'boss'),
  };
  sfx.bossAppear();
}

/** Run all auto-actions in sequence. Returns true if tick should exit early (reincarnate/transcend). */
/** Auto-complete weekly boss floors every 120 ticks */
export function autoWeeklyBoss(ctx: TickContext) {
  if (!ctx.state.autoWeeklyBoss || ctx.totalPlayTime % 120 !== 0 || ctx.totalPlayTime === 0) return;
  const weekStart = getWeekStart();
  const wb = ctx.state.weeklyBoss;
  const current = (wb && wb.week === weekStart) ? wb : { week: weekStart, clearedFloors: [] as number[], claimed: [] as number[] };
  const stats = ctx.get().getEffectiveStats();
  const level = ctx.updatedPlayer.level;

  let changed = false;
  for (const floor of WEEKLY_FLOORS) {
    if (current.clearedFloors.includes(floor.floor)) continue;
    if (floor.floor > 1 && !current.clearedFloors.includes(floor.floor - 1)) break;

    // Simulate combat: can we win?
    const bossHp = Math.floor(floor.hpMul * level * (1 + level * 0.01));
    const bossAtk = Math.floor(floor.atkMul * level * (1 + level * 0.005));
    const bossDef = Math.floor(floor.defMul * level);

    const defRate = bossDef / (bossDef + 100 + level * 5);
    const playerDmg = Math.max(1, Math.floor(stats.attack * (1 - defRate)));
    const avgDmg = playerDmg * (1 + stats.critRate * (stats.critDmg - 1));
    const turnsToKill = Math.ceil(bossHp / avgDmg);

    const bossDefRate = 0; // player has no defense
    const bossDmgPerTurn = Math.max(1, Math.floor(bossAtk * (1 - bossDefRate)));
    const turnsToSurvive = Math.ceil(stats.maxHp / bossDmgPerTurn);

    if (turnsToKill > turnsToSurvive) break; // Can't win, stop

    // Win — apply rewards
    const rewards = floor.rewards;
    const scaledLingshi = Math.floor(rewards.lingshi * Math.max(1, level / 10));
    const scaledPantao = Math.floor(rewards.pantao * Math.max(1, level / 50));
    ctx.updatedPlayer.lingshi = (ctx.updatedPlayer.lingshi ?? 0) + scaledLingshi;
    ctx.updatedPlayer.pantao = (ctx.updatedPlayer.pantao ?? 0) + scaledPantao;
    if (rewards.shards > 0) ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + rewards.shards;
    if (rewards.daoPoints > 0) ctx.updatedPlayer.daoPoints = (ctx.updatedPlayer.daoPoints ?? 0) + rewards.daoPoints;
    if (rewards.trialTokens > 0) ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens ?? 0) + rewards.trialTokens;

    current.clearedFloors = [...current.clearedFloors, floor.floor];
    changed = true;
  }

  if (changed) {
    ctx.set({ weeklyBoss: current });
  }
}

/** Auto-claim completed daily challenges every 30 ticks */
export function autoClaimDailyChallenges(ctx: TickContext) {
  if (!ctx.state.autoClaimChallenges || ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const dcStore = useDailyChallengeStore.getState();
  if (!dcStore.hasUnclaimed()) return;
  const challenges = getDCChallenges();
  for (const ch of challenges) {
    const result = dcStore.claim(ch.id, ctx.updatedPlayer.level);
    if (result) {
      if (result.type === 'lingshi') ctx.updatedPlayer.lingshi += result.amount;
      else if (result.type === 'pantao') ctx.updatedPlayer.pantao += result.amount;
      else if (result.type === 'hongmengShards') ctx.updatedPlayer.hongmengShards += result.amount;
      else if (result.type === 'trialTokens') ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens || 0) + result.amount;
      ctx.log = ctx.addLog(ctx.log, `🎯 自动领取每日挑战奖励: ${result.type} ×${result.amount}`, 'info');
    }
  }
  dcStore.save();
}

export function autoClaimAbyssMilestones(ctx: TickContext) {
  if (ctx.totalPlayTime % 10 !== 0 || ctx.totalPlayTime === 0) return;
  const claimed = [...(ctx.state.claimedAbyssMilestones ?? [])];
  const highest = ctx.state.highestAbyssFloor ?? 0;
  let changed = false;
  for (const m of ABYSS_MILESTONES) {
    if (m.floor <= highest && !claimed.includes(m.floor)) {
      claimed.push(m.floor);
      ctx.log = ctx.addLog(ctx.log, `🏔️ 深渊里程碑「${m.label}」已解锁！`, 'info');
      changed = true;
    }
  }
  if (changed) ctx.set({ claimedAbyssMilestones: claimed });
}

export function runAllAutoActions(ctx: TickContext): boolean {
  autoUpgradeSanctuary(ctx);
  autoGiftAffinity(ctx);
  autoFarmPush(ctx);
  autoSweepChapters(ctx);
  autoActivateFate(ctx);
  autoSpinWheel(ctx);
  autoQuickTrial(ctx);
  autoAscensionChallenge(ctx);
  autoEnhanceGear(ctx);
  autoReforgeGear(ctx);
  autoSocketGems(ctx);
  autoManagePets(ctx);
  autoBuyPerksAndAwakening(ctx);
  autoSynthEquip(ctx);
  if (autoReincarnate(ctx)) return true;
  if (autoTranscend(ctx)) return true;
  autoBuyTranscendPerks(ctx);
  autoExploreDungeons(ctx);
  checkTitleUnlocks(ctx);
  checkStoryTriggers(ctx);
  autoDecompose(ctx);
  autoBreakthrough(ctx);
  autoWeeklyBoss(ctx);
  autoClaimDailyChallenges(ctx);
  autoClaimAbyssMilestones(ctx);
  autoSignIn(ctx);
  autoBuyScrolls(ctx);
  return false;
}

/** v172.0: Auto-buy scrolls with excess pantao every 120 ticks */
export function autoBuyScrolls(ctx: TickContext) {
  if (!ctx.state.autoBuyScrolls || ctx.totalPlayTime % 120 !== 0 || ctx.totalPlayTime === 0) return;
  // Only buy if pantao > 500 (keep a buffer)
  const scrollTypes: Array<{ key: 'tianming' | 'protect' | 'lucky'; field: 'tianmingScrolls' | 'protectScrolls' | 'luckyScrolls' }> = [
    { key: 'lucky', field: 'luckyScrolls' },
    { key: 'protect', field: 'protectScrolls' },
    { key: 'tianming', field: 'tianmingScrolls' },
  ];
  let bought = 0;
  for (const s of scrollTypes) {
    const price = SCROLL_PRICES[s.key];
    // Buy up to 5 per cycle, keep 200 pantao buffer
    let count = 0;
    while (count < 5 && ctx.updatedPlayer.pantao >= price + 200) {
      ctx.updatedPlayer.pantao -= price;
      (ctx.updatedPlayer as any)[s.field] = ((ctx.updatedPlayer as any)[s.field] ?? 0) + 1;
      count++;
      bought++;
    }
  }
  if (bought > 0) {
    ctx.log = ctx.addLog(ctx.log, `📜 自动购买 ${bought} 张卷轴`, 'info');
  }
}

/** Auto daily sign-in: check every 60 ticks */
export function autoSignIn(ctx: TickContext) {
  if (ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  try {
    const daily = useDailyStore.getState();
    daily.checkCanSignIn();
    if (daily.canSignIn) {
      const result = daily.signIn();
      if (result) {
        const r = result.reward;
        if (r.lingshi) ctx.updatedPlayer.lingshi += r.lingshi;
        if (r.pantao) ctx.updatedPlayer.pantao = (ctx.updatedPlayer.pantao ?? 0) + r.pantao;
        if (r.shards) ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + r.shards;
        if (r.consumable) {
          const inv: Record<string, number> = (ctx.updatedPlayer as any).consumables ?? {};
          inv[r.consumable.id] = (inv[r.consumable.id] ?? 0) + r.consumable.count;
          (ctx.updatedPlayer as any).consumables = inv;
        }
        if (r.scrollType === 'tianming') ctx.updatedPlayer.tianmingScrolls = (ctx.updatedPlayer.tianmingScrolls ?? 0) + 1;
        if (r.scrollType === 'lucky') ctx.updatedPlayer.luckyScrolls = (ctx.updatedPlayer.luckyScrolls ?? 0) + 1;
        ctx.log = ctx.addLog(ctx.log, `📅 自动签到：${r.desc}`, 'info');
      }
    }
  } catch {}
}
