// v128.0: Save/Load/Reset/Slot actions extracted from gameStore.ts
import { GameSave, EquipmentItem, OfflineReport, PlayerState } from '../types';
import { createEnemy } from '../data/chapters';
import { CHAPTERS } from '../data/chapters';
import { REALMS } from '../data/realms';
import { expForLevel } from '../utils/format';
import { calculateOfflineEarnings } from '../engine/offline';
import { useSanctuaryStore } from './sanctuaryStore';
import { useExplorationStore } from './explorationStore';
import { useAffinityStore } from './affinityStore';
import { getInventoryMax } from './gameStore';
import { calcEffectiveStats } from './gameStore';

// Re-export SaveSlotInfo type
export interface SaveSlotInfo {
  id: number;
  hasData: boolean;
  summary?: {
    name: string;
    level: number;
    realm: string;
    chapter: number;
    stage: number;
    playTime: number;
    savedAt: number;
  };
}

let logIdCounter = Date.now();

export function saveAction(get: () => any, set: (s: any) => void) {
  const state = get();
  // v58.0: update highest power before save
  const _es58 = calcEffectiveStats(state.player.stats, state.equippedWeapon, state.equippedArmor, state.equippedTreasure);
  const _cp58 = Math.floor(_es58.attack * (1 + (_es58.critRate / 100) * ((_es58.critDmg || 150) / 100)) + _es58.maxHp * 0.05);
  const _hp58 = Math.max(state.highestPower, _cp58);
  if (_hp58 > state.highestPower) set({ highestPower: _hp58 });
  const save: GameSave = {
    version: 4,
    player: state.player,
    battle: { chapterId: state.battle.chapterId, stageNum: state.battle.stageNum, wave: state.battle.wave },
    highestChapter: state.highestChapter,
    highestStage: state.highestStage,
    highestPower: _hp58,
    highestAbyssFloor: state.highestAbyssFloor,
    allTimeKills: state.allTimeKills,
    claimedAbyssMilestones: state.claimedAbyssMilestones,
    lastSaveTimestamp: Date.now(),
    totalPlayTime: state.totalPlayTime,
    equipment: { weapon: state.equippedWeapon, armor: state.equippedArmor, treasure: state.equippedTreasure },
    inventory: state.inventory,
    sanctuary: useSanctuaryStore.getState().sanctuary,
    exploration: useExplorationStore.getState().exploration,
    affinity: useAffinityStore.getState().affinity,
    battleSpeed: state.battleSpeed,
    autoDecomposeQuality: state.autoDecomposeQuality,
    autoEquipOnDrop: state.autoEquipOnDrop,
    autoSkill: state.autoSkill,
    autoConsume: state.autoConsume,
    autoWorldBoss: state.autoWorldBoss,
    autoExplore: state.autoExplore,
    autoSanctuary: state.autoSanctuary,
    autoAffinity: state.autoAffinity,
    autoSweep: state.autoSweep,
    autoFate: state.autoFate,
    autoWheel: state.autoWheel,
    autoTrial: state.autoTrial,
    autoAscension: state.autoAscension,
    autoEnhance: state.autoEnhance,
    autoReforge: state.autoReforge,
    autoFeedPet: state.autoFeedPet,
    autoBuyPerks: state.autoBuyPerks,
    autoSynth: state.autoSynth,
    autoReincarnate: state.autoReincarnate,
    autoDaoAlloc: state.autoDaoAlloc,
    autoFarm: state.autoFarm,
    autoEvent: state.autoEvent,
    autoWeeklyBoss: state.autoWeeklyBoss,
    autoTranscend: state.autoTranscend,
    autoBuyTranscendPerks: state.autoBuyTranscendPerks,
    lastWheelSpin: state.lastWheelSpin,
    equippedTitle: state.equippedTitle,
    unlockedTitles: state.unlockedTitles,
    seenStories: state.seenStories,
    fateBlessing: state.fateBlessing,
    onlineRewardsClaimed: state.onlineRewardsClaimed,
    completedChallenges: state.completedChallenges,
    completedChallengesDate: state.completedChallengesDate,
    weeklyBoss: state.weeklyBoss,
    equipLoadouts: state.equipLoadouts ?? [],
  };
  try {
    const saveStr = JSON.stringify(save);
    // v94.0: Rotate backup saves (keep last 3)
    try {
      const prev = localStorage.getItem('xiyou-idle-save');
      if (prev) {
        const b2 = localStorage.getItem('xiyou-idle-backup-2');
        if (b2) localStorage.setItem('xiyou-idle-backup-3', b2);
        const b1 = localStorage.getItem('xiyou-idle-backup-1');
        if (b1) localStorage.setItem('xiyou-idle-backup-2', b1);
        localStorage.setItem('xiyou-idle-backup-1', prev);
      }
    } catch { /* backup rotation is best-effort */ }
    localStorage.setItem('xiyou-idle-save', saveStr);
  } catch (e) { console.warn('[Save] localStorage unavailable', e); }
  set({ lastSaveTimestamp: Date.now() });
}

export function loadAction(get: () => any, set: (s: any) => void, addLog: (log: any[], text: string, type: any) => any[], makeInitialPlayer: () => PlayerState, makeInitialBattle: () => any) {
  let raw: string | null = null;
  try { raw = localStorage.getItem('xiyou-idle-save'); } catch { return; }
  // v94.0: If main save is corrupted/missing, try backups
  const tryParse = (s: string | null): GameSave | null => {
    if (!s) return null;
    try { const p = JSON.parse(s); if (p && p.player && p.battle) return p; } catch { /* corrupted */ }
    return null;
  };
  let save = tryParse(raw);
  if (!save) {
    for (let i = 1; i <= 3; i++) {
      try { save = tryParse(localStorage.getItem(`xiyou-idle-backup-${i}`)); } catch { continue; }
      if (save) { console.warn(`[Save] Main save corrupted, recovered from backup-${i}`); break; }
    }
  }
  if (!save) return;
  try {
    // Save migrations
    if (save.version <= 2) {
      const remap = (item: EquipmentItem | null) => {
        if (item && (item.quality as string) === 'chaos') (item as any).quality = 'mythic';
        return item;
      };
      if (save.equipment) {
        save.equipment.weapon = remap(save.equipment.weapon);
        save.equipment.armor = remap(save.equipment.armor);
        save.equipment.treasure = remap(save.equipment.treasure);
      }
      if (save.inventory) save.inventory = save.inventory.map(i => remap(i)!);
      save.version = 3;
    }
    // v1.2: Add scroll/shard fields
    if (save.version <= 3) {
      save.player.hongmengShards = save.player.hongmengShards ?? 0;
      save.player.tianmingScrolls = save.player.tianmingScrolls ?? 0;
      save.player.protectScrolls = save.player.protectScrolls ?? 0;
      save.player.luckyScrolls = save.player.luckyScrolls ?? 0;
      save.player.totalCultivateTime = save.player.totalCultivateTime ?? 0;
      save.player.maxDamage = save.player.maxDamage ?? 0;
      save.player.totalEquipDrops = save.player.totalEquipDrops ?? 0;
      save.player.totalGoldEarned = save.player.totalGoldEarned ?? save.player.lingshi ?? 0;
      save.player.totalKills = save.player.totalKills ?? 0;
      save.player.totalBreakthroughs = save.player.totalBreakthroughs ?? 0;
      save.player.tutorialStep = save.player.tutorialStep ?? (save.player.level > 5 ? 6 : 1);
      save.player.tutorialDone = save.player.tutorialDone ?? (save.player.level > 5);
      // Force skip tutorial for high-level players
      if (save.player.level > 5 && !save.player.tutorialDone) {
        save.player.tutorialDone = true;
        save.player.tutorialStep = 6;
      }
      save.player.systemTutorials = save.player.systemTutorials ?? [];
      save.player.codexEquipIds = save.player.codexEquipIds ?? [];
      save.player.codexEnemyNames = save.player.codexEnemyNames ?? [];
      save.player.activeSkills = save.player.activeSkills ?? { cooldowns: {}, buffs: {} };
      save.player.consumableInventory = save.player.consumableInventory ?? {};
      save.player.activeConsumables = save.player.activeConsumables ?? [];
      save.player.petLevels = save.player.petLevels ?? {};
      save.player.activePetId = save.player.activePetId ?? null;
      save.player.bestKillStreak = save.player.bestKillStreak ?? 0;
      save.player.pinnedAchievement = save.player.pinnedAchievement ?? null;
      save.player.fastestReincTime = save.player.fastestReincTime ?? 0;
      save.player.totalReincarnations = save.player.totalReincarnations ?? 0;
      save.player.reincStartTime = save.player.reincStartTime ?? 0;
      save.player.transcendCount = save.player.transcendCount ?? 0;
      save.player.transcendPoints = save.player.transcendPoints ?? 0;
      save.player.totalTranscendPoints = save.player.totalTranscendPoints ?? 0;
      save.player.transcendPerks = save.player.transcendPerks ?? {};
      save.player.trialShopPurchases = save.player.trialShopPurchases ?? {};
      save.player.reincPerks = save.player.reincPerks ?? {};
      // Ensure all dynamic fields have safe defaults
      const p = save.player as any;
      p.reincCount = p.reincCount ?? 0;
      p.killStreak = p.killStreak ?? 0;
      p.allTimeKills = p.allTimeKills ?? 0;
      p.maxAbyssFloor = p.maxAbyssFloor ?? 0;
      p.ascensionCount = p.ascensionCount ?? 0;
      p.celestialPoints = p.celestialPoints ?? 0;
      p.guildId = p.guildId ?? null;
      p.guildContribution = p.guildContribution ?? 0;
      p.formationSlots = p.formationSlots ?? {};
      p.unlockedFormations = p.unlockedFormations ?? ['basic'];
      p.activeFormation = p.activeFormation ?? 'basic';
      p.activeTitle = p.activeTitle ?? null;
      p.unlockedTitles = p.unlockedTitles ?? [];
      p.dailyChallenges = p.dailyChallenges ?? {};
      p.dailyChallengeProgress = p.dailyChallengeProgress ?? {};
      p.dailyChallengesClaimed = p.dailyChallengesClaimed ?? {};
      p.awakeningLevel = p.awakeningLevel ?? 0;
      p.awakeningPoints = p.awakeningPoints ?? {};
      save.version = 4;
    }

    // v118.0: Weekly Boss
    save.weeklyBoss = save.weeklyBoss ?? { week: 0, clearedFloors: [], claimed: [] };
    save.sanctuary = save.sanctuary ?? { levels: {} };
    if (!save.sanctuary.levels) save.sanctuary.levels = {};
    save.affinity = save.affinity ?? { levels: {} };
    if (!save.affinity.levels) save.affinity.levels = {};

    const enemy = createEnemy(save.battle.chapterId, save.battle.stageNum, false)!;
    const offlineSec = (Date.now() - save.lastSaveTimestamp) / 1000;

    const weapon = save.equipment?.weapon ?? null;
    const armor = save.equipment?.armor ?? null;
    const treasure = save.equipment?.treasure ?? null;
    const invSize = save.inventory?.length ?? 0;

    const offline = calculateOfflineEarnings(
      offlineSec, save.player, weapon, armor, treasure,
      save.battle.chapterId, save.battle.stageNum, invSize, CHAPTERS,
      save.equippedTitle,
    );

    const player = {
      ...save.player,
      lingshi: save.player.lingshi + offline.lingshi,
      exp: save.player.exp + offline.exp,
      pantao: save.player.pantao + offline.pantao,
    };

    while (player.exp >= expForLevel(player.level)) {
      player.exp -= expForLevel(player.level);
      player.level++;
      player.stats.attack += Math.floor(3 + player.level * 0.5);
      player.stats.maxHp += Math.floor(10 + player.level * 2);
      player.stats.hp = player.stats.maxHp;
      player.clickPower = Math.floor(5 + player.level * 0.8);
    }

    const finalInventory = [...(save.inventory ?? []), ...offline.equipmentItems].slice(0, getInventoryMax(save.player?.reincarnations ?? 0));

    const report: OfflineReport | null = offline.duration >= 60 ? {
      duration: offline.duration,
      lingshi: offline.lingshi,
      exp: offline.exp,
      pantao: offline.pantao,
      equipment: offline.equipment,
      kills: offline.kills,
      stagesCleared: offline.stagesCleared,
      levelsGained: offline.levelsGained,
    } : null;

    set({
      player,
      battle: {
        chapterId: save.battle.chapterId, stageNum: save.battle.stageNum,
        wave: save.battle.wave, maxWaves: 10, currentEnemy: enemy,
        log: [{ id: logIdCounter++, text: '存档已加载', type: 'info', timestamp: Date.now() }],
        isAutoBattle: true, isBossWave: false, killStreak: 0,
      },
      highestChapter: save.highestChapter,
      highestStage: save.highestStage,
      highestPower: save.highestPower ?? 0,
      highestAbyssFloor: save.highestAbyssFloor ?? 0,
      allTimeKills: save.allTimeKills ?? 0,
      claimedAbyssMilestones: save.claimedAbyssMilestones ?? [],
      totalPlayTime: save.totalPlayTime,
      lastSaveTimestamp: Date.now(),
      equippedWeapon: weapon,
      equippedArmor: armor,
      equippedTreasure: treasure,
      inventory: finalInventory,
      offlineReport: report,
      battleSpeed: save.battleSpeed ?? 1,
      autoDecomposeQuality: save.autoDecomposeQuality ?? 0,
      autoEquipOnDrop: save.autoEquipOnDrop ?? true,
      autoSkill: save.autoSkill ?? false,
      autoConsume: save.autoConsume ?? false,
      autoWorldBoss: save.autoWorldBoss ?? false,
      autoExplore: save.autoExplore ?? false,
      autoSanctuary: save.autoSanctuary ?? false,
      autoAffinity: save.autoAffinity ?? false,
      autoSweep: save.autoSweep ?? false,
      autoFate: save.autoFate ?? false,
      autoWheel: save.autoWheel ?? false,
      autoTrial: save.autoTrial ?? false,
      autoAscension: save.autoAscension ?? false,
      autoEnhance: save.autoEnhance ?? false,
      autoReforge: save.autoReforge ?? false,
      autoFeedPet: save.autoFeedPet ?? false,
      autoBuyPerks: save.autoBuyPerks ?? false,
      autoSynth: save.autoSynth ?? false,
      autoReincarnate: save.autoReincarnate ?? false,
      autoDaoAlloc: save.autoDaoAlloc ?? false,
      autoFarm: save.autoFarm ?? false,
      autoEvent: save.autoEvent ?? false,
      autoWeeklyBoss: save.autoWeeklyBoss ?? false,
      autoTranscend: save.autoTranscend ?? false,
      autoBuyTranscendPerks: save.autoBuyTranscendPerks ?? false,
      lastWheelSpin: save.lastWheelSpin ?? 0,
      equippedTitle: save.equippedTitle ?? null,
      unlockedTitles: save.unlockedTitles ?? [],
      seenStories: save.seenStories ?? [],
      fateBlessing: save.fateBlessing ?? { active: false, expiresAt: 0 },
      onlineRewardsClaimed: [],
      completedChallenges: save.completedChallenges ?? [],
      completedChallengesDate: save.completedChallengesDate ?? '',
      weeklyBoss: save.weeklyBoss ?? { week: 0, clearedFloors: [], claimed: [] },
      equipLoadouts: save.equipLoadouts ?? [],
    } as any);

    if (save.sanctuary) useSanctuaryStore.getState().load(save.sanctuary);
    if (save.exploration) useExplorationStore.getState().load(save.exploration);
    if (save.affinity) useAffinityStore.getState().load(save.affinity);
  } catch {
    console.error('Failed to load save');
  }
}

export function resetAction(set: (s: any) => void, makeInitialPlayer: () => PlayerState, makeInitialBattle: () => any) {
  try { localStorage.removeItem('xiyou-idle-save'); } catch {}
  set({
    player: makeInitialPlayer(),
    battle: makeInitialBattle(),
    highestChapter: 1, highestStage: 1,
    highestAbyssFloor: 0, allTimeKills: 0, claimedAbyssMilestones: [],
    equippedWeapon: null, equippedArmor: null, equippedTreasure: null,
    inventory: [],
    floatingTexts: [],
    idleStats: { goldPerSec: 0, expPerSec: 0, dps: 0, sessionTime: 0 },
    totalPlayTime: 0, lastSaveTimestamp: Date.now(), offlineReport: null,
  });
}

export function saveToSlotAction(get: () => any, slotId: number) {
  const state = get();
  const save: GameSave = {
    version: 4,
    player: state.player,
    battle: { chapterId: state.battle.chapterId, stageNum: state.battle.stageNum, wave: state.battle.wave },
    highestChapter: state.highestChapter,
    highestStage: state.highestStage,
    highestPower: state.highestPower,
    highestAbyssFloor: state.highestAbyssFloor,
    allTimeKills: state.allTimeKills,
    claimedAbyssMilestones: state.claimedAbyssMilestones,
    lastSaveTimestamp: Date.now(),
    totalPlayTime: state.totalPlayTime,
    equipment: { weapon: state.equippedWeapon, armor: state.equippedArmor, treasure: state.equippedTreasure },
    inventory: state.inventory,
  };
  try { localStorage.setItem(`xiyou-idle-slot-${slotId}`, JSON.stringify(save)); } catch {}
}

export function loadFromSlotAction(get: () => any, slotId: number) {
  let raw: string | null = null;
  try { raw = localStorage.getItem(`xiyou-idle-slot-${slotId}`); } catch { return; }
  if (!raw) return;
  get().save();
  try { localStorage.setItem('xiyou-idle-save', raw); } catch {}
  get().load();
}

export function deleteSlotAction(slotId: number) {
  try { localStorage.removeItem(`xiyou-idle-slot-${slotId}`); } catch {}
}

export function getSaveSlotsAction(): SaveSlotInfo[] {
  const slots: SaveSlotInfo[] = [];
  for (let i = 1; i <= 3; i++) {
    let raw: string | null = null;
    try { raw = localStorage.getItem(`xiyou-idle-slot-${i}`); } catch {}
    if (raw) {
      try {
        const save: GameSave = JSON.parse(raw);
        slots.push({
          id: i,
          hasData: true,
          summary: {
            name: save.player.name,
            level: save.player.level,
            realm: REALMS[save.player.realmIndex]?.name ?? '未知',
            chapter: save.battle.chapterId,
            stage: save.battle.stageNum,
            playTime: save.totalPlayTime,
            savedAt: save.lastSaveTimestamp,
          },
        });
      } catch {
        slots.push({ id: i, hasData: false });
      }
    } else {
      slots.push({ id: i, hasData: false });
    }
  }
  return slots;
}
