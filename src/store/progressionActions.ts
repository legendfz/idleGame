// v129.0: Reincarnation + Transcendence actions extracted from gameStore.ts
import { calcDaoPoints, REINC_PERKS, REINC_MIN_REALM, REINC_MIN_LEVEL } from '../data/reincarnation';
import { TRANSCEND_PERKS, TRANSCEND_MIN_REINC, calcTranscendPoints } from '../data/transcendence';
import { makeInitialPlayer, makeInitialBattle } from './gameStore';
import { sfx } from '../engine/audio';

export function reincarnateAction(get: () => any, set: (s: any) => void) {
  const state = get();
  const { player } = state;
  if (player.realmIndex < REINC_MIN_REALM || player.level < REINC_MIN_LEVEL) return;

  const daoGain = calcDaoPoints(player.level, player.realmIndex, player.reincarnations);
  const startLevel = REINC_PERKS.find((p: any) => p.id === 'start_level')!.effect(player.reincPerks['start_level'] ?? 0);

  // v152.0: Track fastest reincarnation time
  const reincTime = (state.totalPlayTime ?? 0) - (player.reincStartTime ?? 0);
  const prevBest = player.fastestReincTime ?? 0;
  const bestReincTime = (prevBest === 0 || (reincTime > 0 && reincTime < prevBest)) ? reincTime : prevBest;

  const newPlayer = makeInitialPlayer();
  newPlayer.reincarnations = player.reincarnations + 1;
  newPlayer.daoPoints = player.daoPoints + daoGain;
  newPlayer.totalDaoPoints = player.totalDaoPoints + daoGain;
  newPlayer.reincPerks = { ...player.reincPerks };
  newPlayer.tutorialDone = true;
  newPlayer.tutorialStep = 6;
  newPlayer.systemTutorials = [...player.systemTutorials];
  newPlayer.codexEquipIds = [...player.codexEquipIds];
  newPlayer.codexEnemyNames = [...player.codexEnemyNames];
  newPlayer.chapterKills = { ...(player.chapterKills ?? {}) }; // v174.0: preserve mastery
  newPlayer.activeSkills = { cooldowns: {}, buffs: {} };
  newPlayer.petLevels = { ...player.petLevels };
  newPlayer.petEvolutions = { ...(player.petEvolutions ?? {}) };
  newPlayer.activePetId = player.activePetId;
  newPlayer.bestKillStreak = player.bestKillStreak;
  newPlayer.pinnedAchievement = player.pinnedAchievement;
  newPlayer.consumableInventory = { ...player.consumableInventory };
  newPlayer.gemInventory = [...(player.gemInventory ?? [])];
  newPlayer.equippedGems = {};
  newPlayer.activeConsumables = [];
  newPlayer.allTimeLingshi = player.allTimeLingshi ?? 0;
  newPlayer.fastestReincTime = bestReincTime;
  newPlayer.totalReincarnations = (player.totalReincarnations ?? 0) + 1;
  newPlayer.reincStartTime = state.totalPlayTime ?? 0;
  newPlayer.highestLevelEver = player.highestLevelEver ?? 0;

  if (startLevel > 0) {
    newPlayer.level = Math.max(1, startLevel);
    newPlayer.stats.attack += Math.floor(startLevel * 3.5);
    newPlayer.stats.maxHp += Math.floor(startLevel * 12);
    newPlayer.stats.hp = newPlayer.stats.maxHp;
  }

  const critBonus = REINC_PERKS.find((p: any) => p.id === 'crit_flat')!.effect(player.reincPerks['crit_flat'] ?? 0);
  newPlayer.stats.critRate += critBonus;

  set({
    player: newPlayer,
    battle: makeInitialBattle(),
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    equippedTreasure: null,
    highestChapter: 1,
    highestStage: 1,
    floatingTexts: [],
    idleStats: { goldPerSec: 0, expPerSec: 0, dps: 0, sessionTime: 0 },
  });

  // Auto-allocate dao points
  if (state.autoDaoAlloc) {
    const allocOrder = ['atk_mult', 'exp_mult', 'gold_mult', 'crit_flat', 'drop_rate', 'pantao_mult', 'start_level', 'hp_mult'];
    let dp = newPlayer.daoPoints;
    const perks = { ...newPlayer.reincPerks };
    let changed = true;
    while (changed && dp > 0) {
      changed = false;
      for (const pid of allocOrder) {
        const perk = REINC_PERKS.find((p: any) => p.id === pid);
        if (!perk) continue;
        const cur = perks[pid] ?? 0;
        if (cur >= perk.maxLevel) continue;
        if (dp >= perk.costPerLevel) {
          perks[pid] = cur + 1;
          dp -= perk.costPerLevel;
          changed = true;
        }
      }
    }
    newPlayer.daoPoints = dp;
    newPlayer.reincPerks = perks;
    const newStartLevel = REINC_PERKS.find((p: any) => p.id === 'start_level')!.effect(perks['start_level'] ?? 0);
    if (newStartLevel > startLevel) {
      newPlayer.level = Math.max(newPlayer.level, newStartLevel);
      newPlayer.stats.attack = makeInitialPlayer().stats.attack + Math.floor(newStartLevel * 3.5);
      newPlayer.stats.maxHp = makeInitialPlayer().stats.maxHp + Math.floor(newStartLevel * 12);
      newPlayer.stats.hp = newPlayer.stats.maxHp;
    }
    const newCritBonus = REINC_PERKS.find((p: any) => p.id === 'crit_flat')!.effect(perks['crit_flat'] ?? 0);
    if (newCritBonus > critBonus) {
      newPlayer.stats.critRate = makeInitialPlayer().stats.critRate + newCritBonus;
    }
  }

  sfx.breakthrough();
}

export function buyReincPerkAction(get: () => any, set: (s: any) => void, perkId: string, maxBuy?: boolean) {
  const { player } = get();
  const perk = REINC_PERKS.find((p: any) => p.id === perkId);
  if (!perk) return;
  const currentLv = player.reincPerks[perkId] ?? 0;
  if (currentLv >= perk.maxLevel) return;
  if (player.daoPoints < perk.costPerLevel) return;

  const affordable = Math.floor(player.daoPoints / perk.costPerLevel);
  const remaining = perk.maxLevel - currentLv;
  const count = maxBuy ? Math.min(affordable, remaining) : 1;
  if (count <= 0) return;

  set({
    player: {
      ...player,
      daoPoints: player.daoPoints - perk.costPerLevel * count,
      reincPerks: { ...player.reincPerks, [perkId]: currentLv + count },
    },
  });
  sfx.click();
}

export function getReincMultiplierAction(get: () => any, perkId: string): number {
  const { player } = get();
  const perk = REINC_PERKS.find((p: any) => p.id === perkId);
  if (!perk) return 1;
  return perk.effect(player.reincPerks[perkId] ?? 0);
}

export function transcendAction(get: () => any, set: (s: any) => void) {
  const state = get();
  const { player } = state;
  if (player.reincarnations < TRANSCEND_MIN_REINC) return;

  const tpGain = calcTranscendPoints(player.reincarnations, player.totalDaoPoints);

  const newPlayer = makeInitialPlayer();
  newPlayer.transcendCount = (player.transcendCount ?? 0) + 1;
  newPlayer.transcendPoints = (player.transcendPoints ?? 0) + tpGain;
  newPlayer.totalTranscendPoints = (player.totalTranscendPoints ?? 0) + tpGain;
  newPlayer.transcendPerks = { ...(player.transcendPerks ?? {}) };
  newPlayer.tutorialDone = true;
  newPlayer.tutorialStep = 6;
  newPlayer.systemTutorials = [...player.systemTutorials];
  newPlayer.codexEquipIds = [...player.codexEquipIds];
  newPlayer.codexEnemyNames = [...player.codexEnemyNames];
  newPlayer.chapterKills = { ...(player.chapterKills ?? {}) }; // v174.0
  newPlayer.petLevels = { ...player.petLevels };
  newPlayer.petEvolutions = { ...(player.petEvolutions ?? {}) };
  newPlayer.activePetId = player.activePetId;
  newPlayer.bestKillStreak = player.bestKillStreak;
  newPlayer.pinnedAchievement = player.pinnedAchievement;
  newPlayer.consumableInventory = { ...player.consumableInventory };
  newPlayer.gemInventory = [...(player.gemInventory ?? [])];
  newPlayer.equippedGems = {};
  newPlayer.allTimeLingshi = player.allTimeLingshi ?? 0;
  newPlayer.fastestReincTime = player.fastestReincTime ?? 0;
  newPlayer.totalReincarnations = player.totalReincarnations ?? 0;
  newPlayer.reincStartTime = state.totalPlayTime ?? 0;
  newPlayer.highestLevelEver = player.highestLevelEver ?? 0;
  newPlayer.reincarnations = 0;
  newPlayer.daoPoints = 0;
  newPlayer.totalDaoPoints = 0;
  newPlayer.reincPerks = {};
  newPlayer.awakening = { unlockedNodes: [], selectedPath: null };
  newPlayer.awakeningPoints = 0;

  set({
    player: newPlayer,
    battle: makeInitialBattle(),
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    equippedTreasure: null,
    highestChapter: 1,
    highestStage: 1,
    floatingTexts: [],
    idleStats: { goldPerSec: 0, expPerSec: 0, dps: 0, sessionTime: 0 },
  });
  sfx.breakthrough();
}

export function buyTranscendPerkAction(get: () => any, set: (s: any) => void, perkId: string, maxBuy?: boolean) {
  const { player } = get();
  const perk = TRANSCEND_PERKS.find((p: any) => p.id === perkId);
  if (!perk) return;
  const currentLv = (player.transcendPerks ?? {})[perkId] ?? 0;
  if (currentLv >= perk.maxLevel) return;
  if ((player.transcendPoints ?? 0) < perk.costPerLevel) return;

  const affordable = Math.floor((player.transcendPoints ?? 0) / perk.costPerLevel);
  const remaining = perk.maxLevel - currentLv;
  const count = maxBuy ? Math.min(affordable, remaining) : 1;
  if (count <= 0) return;

  set({
    player: {
      ...player,
      transcendPoints: (player.transcendPoints ?? 0) - perk.costPerLevel * count,
      transcendPerks: { ...(player.transcendPerks ?? {}), [perkId]: currentLv + count },
    },
  });
  sfx.click();
}
