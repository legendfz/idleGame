// v42.0: Achievement state cache (updated from App.tsx tick)
let _achStatesCache: Record<string, { completed: boolean }> | null = null;
export function setAchStatesCache(states: Record<string, { completed: boolean }>) { _achStatesCache = states; }
import { create } from 'zustand';
import { PlayerState, BattleState, BattleLogEntry, TabId, GameSave, EquipmentItem, EquipSlot, Quality, Stats, QUALITY_INFO, FloatingText, INVENTORY_MAX, INVENTORY_BASE, INVENTORY_PER_REINC, INVENTORY_CAP, OfflineReport, ActiveConsumable, ConsumableEffect } from '../types';

// v114.0: Dynamic bag capacity based on reincarnation count
export function getInventoryMax(reincarnations: number): number {
  return Math.min(INVENTORY_CAP, INVENTORY_BASE + (reincarnations ?? 0) * INVENTORY_PER_REINC);
}
import { getConsumable } from '../data/consumables';
import { REALMS } from '../data/realms';
import { ACHIEVEMENTS as ACHIEVEMENTS_DATA } from '../data/achievements';
import { CHAPTERS, createEnemy } from '../data/chapters';
import { sfx } from '../engine/audio';
import { getTranscendBonuses } from '../data/transcendence';
import { AWAKENING_PATHS, totalAwakeningPoints, AWAKENING_UNLOCK_REINC } from '../data/awakening';
import {
  getEquipEffectiveStat, getActiveSetBonuses, hasFullMythic15,
} from '../data/equipment';
import { getCodexBonuses } from '../data/codexPower';
import { getLevelMilestoneBonuses } from '../data/levelMilestones';
import { getGemBonuses } from '../data/gems';
import { getPowerMilestoneBonuses } from '../data/powerMilestones';
import {
  equipItemAction, unequipSlotAction, enhanceEquipAction, refineItemAction,
  buyScrollAction, sellEquipAction, toggleLockAction, decomposeEquipAction,
  batchDecomposeAction, autoEquipBestAction, quickDecomposeAction,
  goToChapterAction, sweepChapterAction, sweepAllAction, batchEnhanceEquippedAction,
  synthesizeEquipAction, feedPetAction, setActivePetAction, reforgeEquipAction, getReforgeCost,
  socketGemAction, unsocketGemAction, mergeGemsAction,
} from './equipmentActions';
import {
  saveAction, loadAction, resetAction, saveToSlotAction,
  loadFromSlotAction, deleteSlotAction, getSaveSlotsAction, SaveSlotInfo,
} from './saveActions';
import {
  reincarnateAction, buyReincPerkAction, getReincMultiplierAction,
  transcendAction, buyTranscendPerkAction,
} from './progressionActions';
import {
  useSkillAction, useConsumableAction, addConsumableAction,
  activateFateBlessingAction, claimOnlineRewardAction, claimAbyssMilestoneAction,
  advanceTutorialAction, skipTutorialAction, dismissSystemTutorialAction,
  updatePlayerAction,
} from './miscActions';
import { calculateOfflineEarnings } from '../engine/offline';
import { getResonanceBonus } from '../data/resonance';
import { getPetTotalBonus } from '../data/pets';
import { useAffinityStore } from './affinityStore';
import { TITLES, type TitleCheckStats } from '../data/titles';
import { executeBattleTick } from './tickBattle';
import { clickAttackAction, attemptBreakthroughAction } from './battleActions';

let logIdCounter = 0;

interface GameStore {
  player: PlayerState;
  battle: BattleState;
  highestChapter: number;
  highestPower: number;
  highestStage: number;
  highestAbyssFloor: number; // v85.0: highest abyss floor reached
  allTimeKills: number; // v85.0: total kills across all reincarnations
  claimedAbyssMilestones: number[]; // v86.0: claimed abyss floor milestones
  // Equipment
  equippedWeapon: EquipmentItem | null;
  equippedArmor: EquipmentItem | null;
  equippedTreasure: EquipmentItem | null;
  inventory: EquipmentItem[];
  // Floating damage text (P0-3)
  floatingTexts: FloatingText[];
  // Idle stats (P0-5)
  idleStats: { goldPerSec: number; expPerSec: number; dps: number; sessionTime: number };
  // UI
  activeTab: TabId;
  totalPlayTime: number;
  lastSaveTimestamp: number;
  offlineReport: OfflineReport | null;
  // v31.0 settings
  battleSpeed: number;
  autoDecomposeQuality: number; // 0=off, 1=common, 2=spirit+below, 3=immortal+below
  autoEquipOnDrop: boolean; // v39.0: auto-equip better drops
  autoSkill: boolean; // v57.0: auto-cast skills when off cooldown
  autoConsume: boolean; // v63.0: auto-use potions
  autoWorldBoss: boolean; // v72.0: auto-attack world boss
  autoExplore: boolean; // v78.0: auto-explore dungeons
  autoSanctuary: boolean; // v79.0: auto-upgrade sanctuary buildings
  autoAffinity: boolean; // v80.0: auto-gift affinity NPCs
  autoSweep: boolean; // v83.0: auto-sweep cleared chapters
  autoFate: boolean; // v83.0: auto-activate fate blessing
  autoWheel: boolean; // v83.0: auto-spin lucky wheel
  autoTrial: boolean; // v93.0: auto quick trial every 5 min
  autoAscension: boolean; // v93.0: auto ascension challenge daily
  autoEnhance: boolean; // v95.0: auto-enhance equipped gear
  autoReforge: boolean; // v143.0: auto-reforge equipped gear (only accept upgrades)
  autoFeedPet: boolean; // v108.0: auto-feed active pet
  autoBuyPerks: boolean; // v96.0: auto-buy reincarnation perks
  autoSynth: boolean; // v98.0: auto-synthesize 3 same-quality equips
  autoReincarnate: boolean; // v102.0: auto-reincarnate when conditions met
  autoDaoAlloc: boolean; // v105.0: auto-allocate dao points after reincarnation
  autoFarm: boolean; // v111.0: auto-retreat to optimal farming chapter
  autoEvent: boolean; // v133.0: auto-choose random events
  autoWeeklyBoss: boolean; // v145.0: auto-complete weekly boss floors
  autoTranscend: boolean; // v117.0: auto-transcend when 10+ reincarnations
  autoBuyTranscendPerks: boolean; // v117.0: auto-buy transcendence perks
  lastWheelSpin: number; // v83.0: last wheel spin timestamp
  equippedTitle: string | null; // v81.0: equipped title id
  unlockedTitles: string[]; // v81.0: unlocked title ids
  onlineRewardsClaimed: number[]; // v57.0: claimed milestone minutes
  fateBlessing: { active: boolean; expiresAt: number }; // v73.0: double gains buff
  completedChallenges: string[]; // v87.0: completed ascension challenge ids today
  completedChallengesDate: string; // v87.0: date string for daily reset
  titleToast: string | null; // v89.0: title unlock toast
  seenStories: string[]; // v101.0: seen story entries
  activeStory: { title: string; text: string; reward?: { type: string; amount: number } } | null; // v101.0
  weeklyBoss: { week: number; clearedFloors: number[]; claimed: number[] }; // v118.0
  // v137.0: Equipment loadouts
  equipLoadouts: { name: string; weapon: string | null; armor: string | null; treasure: string | null }[];

  // Actions
  setTab: (tab: TabId) => void;
  tick: () => void;
  clickAttack: () => void;
  attemptBreakthrough: () => void;
  reincarnate: () => void;
  feedPet: (petId: string) => void;
  setActivePet: (petId: string | null) => void;
  buyReincPerk: (perkId: string, maxBuy?: boolean) => void;
  getReincMultiplier: (perkId: string) => number;
  dismissOfflineReport: () => void;
  save: () => void;
  load: () => void;
  reset: () => void;
  equipItem: (item: EquipmentItem) => void;
  unequipSlot: (slot: EquipSlot) => void;
  enhanceEquip: (uid: string, useProtect?: boolean, useLucky?: boolean) => void;
  sellEquip: (uid: string) => void;
  decomposeEquip: (uid: string) => void;
  batchDecompose: (uids: string[]) => void;
  toggleLock: (uid: string) => void;
  refineItem: (targetUid: string, materialUids: string[], useTianming?: boolean, usePity?: boolean) => void;
  buyScroll: (type: 'tianming' | 'protect' | 'lucky') => void;
  clearFloatingText: (id: number) => void;
  getEffectiveStats: () => Stats;
  setBattleSpeed: (speed: number) => void;
  setAutoDecomposeQuality: (quality: number) => void;
  setAutoEquipOnDrop: (v: boolean) => void;
  setAutoSkill: (v: boolean) => void;
  setAutoConsume: (v: boolean) => void;
  setAutoWorldBoss: (v: boolean) => void;
  setAutoExplore: (v: boolean) => void;
  setAutoSanctuary: (v: boolean) => void;
  setAutoAffinity: (v: boolean) => void;
  setAutoSweep: (v: boolean) => void;
  setAutoFate: (v: boolean) => void;
  setAutoWheel: (v: boolean) => void;
  setAutoTrial: (v: boolean) => void;
  setAutoAscension: (v: boolean) => void;
  setAutoEnhance: (v: boolean) => void;
  setAutoReforge: (v: boolean) => void;
  setAutoFeedPet: (v: boolean) => void;
  setAutoBuyPerks: (v: boolean) => void;
  setAutoSynth: (v: boolean) => void;
  setAutoReincarnate: (v: boolean) => void;
  setAutoDaoAlloc: (v: boolean) => void; // v105.0
  setAutoFarm: (v: boolean) => void; // v111.0
  setAutoEvent: (v: boolean) => void; // v133.0
  setAutoWeeklyBoss: (v: boolean) => void; // v145.0
  setAutoTranscend: (v: boolean) => void; // v117.0
  setAutoBuyTranscendPerks: (v: boolean) => void; // v117.0
  setWeeklyBoss: (data: { week: number; clearedFloors: number[]; claimed: number[] }) => void; // v118.0
  setEquippedTitle: (id: string | null) => void;
  pinAchievement: (id: string | null) => void; // v115.0
  transcend: () => void; // v116.0: 超越轮回
  buyTranscendPerk: (perkId: string, maxBuy?: boolean) => void; // v116.0
  setCompletedChallenges: (ids: string[]) => void;
  activateFateBlessing: () => boolean;
  claimOnlineReward: (minutes: number) => { gold: number; exp: number; pantao: number; desc: string } | null;
  claimAbyssMilestone: (floor: number) => boolean; // v86.0
  autoEquipBest: () => number;
  quickDecompose: (maxQuality: number) => number;
  goToChapter: (chapterId: number) => void;
  sweepChapter: (chapterId: number, count: number) => { gold: number; exp: number; items: string[] };
  sweepAll: () => { gold: number; exp: number; items: string[]; chapters: number };
  batchEnhanceEquipped: () => { count: number; cost: number };
  // Multi-save
  saveToSlot: (slotId: number) => void;
  loadFromSlot: (slotId: number) => void;
  deleteSlot: (slotId: number) => void;
  getSaveSlots: () => SaveSlotInfo[];
  // Tutorial
  advanceTutorial: () => void;
  skipTutorial: () => void;
  dismissSystemTutorial: (id: string) => void;
  // v52.0 Active Skills
  useSkill: (skillId: string) => boolean;
  // v53.0 Consumables
  useConsumable: (buffId: string) => boolean;
  addConsumable: (buffId: string, count: number) => void;
  // v55.0 Generic player update
  updatePlayer: (partial: Partial<PlayerState>) => void;
  // v97.0 Equipment synthesis
  synthesizeEquip: (uids: string[]) => { success: boolean; result?: EquipmentItem; message: string };
  reforgeEquip: (uid: string) => void;
  socketGem: (equipUid: string, gemIndex: number) => void;
  unsocketGem: (equipUid: string, slotIndex: number) => void;
  mergeGems: (typeId: string, level: number) => void;
  // v137.0: Equipment loadouts
  saveLoadout: (slotIndex: number, name: string) => void;
  applyLoadout: (slotIndex: number) => { applied: number; message: string };
  deleteLoadout: (slotIndex: number) => void;
}

// SaveSlotInfo imported from ./saveActions

export function makeInitialPlayer(): PlayerState {
  return {
    name: '孙悟空',
    level: 1,
    exp: 0,
    lingshi: 0,
    pantao: 0,
    realmIndex: 0,
    stats: { attack: 10, hp: 100, maxHp: 100, speed: 1, critRate: 5, critDmg: 1.5 },
    clickPower: 5,
    hongmengShards: 0,
    tianmingScrolls: 0,
    protectScrolls: 0,
    luckyScrolls: 0,
    totalCultivateTime: 0,
    maxDamage: 0,
    totalEquipDrops: 0,
    totalKills: 0,
    totalGoldEarned: 0,
    totalBossKills: 0,
    totalCrits: 0,
    totalEnhances: 0,
    totalBreakthroughs: 0,
    tutorialStep: 1,
    tutorialDone: false,
    systemTutorials: [],
    reincarnations: 0,
    daoPoints: 0,
    totalDaoPoints: 0,
    reincPerks: {},
    codexEquipIds: [],
    codexEnemyNames: [],
    activeSkills: { cooldowns: {}, buffs: {} },
    consumableInventory: {},
    activeConsumables: [],
    awakening: { unlockedNodes: [], selectedPath: null },
    awakeningPoints: 0,
    trialTokens: 0,
    trialBestFloor: 0,
    petLevels: {},
    activePetId: null,
    trialShopPurchases: {},
    bestKillStreak: 0,
    allTimeLingshi: 0,
    fastestReincTime: 0,
    totalReincarnations: 0,
    reincStartTime: 0,
    highestLevelEver: 0,
    pinnedAchievement: null,
    gemInventory: [],
    equippedGems: {},
    transcendCount: 0,
    transcendPoints: 0,
    totalTranscendPoints: 0,
    transcendPerks: {},
  };
}

export function makeInitialBattle(): BattleState {
  const enemy = createEnemy(1, 1, false)!;
  return {
    chapterId: 1,
    stageNum: 1,
    wave: 1,
    maxWaves: 10,
    currentEnemy: enemy,
    log: [{ id: logIdCounter++, text: `${enemy.name} 出现了！`, type: 'info', timestamp: Date.now() }],
    isAutoBattle: true,
    isBossWave: false,
    killStreak: 0,
  };
}

export function addLog(log: BattleLogEntry[], text: string, type: BattleLogEntry['type']): BattleLogEntry[] {
  return [{ id: logIdCounter++, text, type, timestamp: Date.now() }, ...log].slice(0, 30);
}

/** Calculate effective stats including equipment + set bonuses */
function getActiveConsumableEffects(actives: ActiveConsumable[]): ConsumableEffect {
  const result: ConsumableEffect = {};
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

export function calcEffectiveStats(
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
  // v1.2: Full Mythic +15 bonus (鸿蒙至尊: +100% all stats)
  if (hasFullMythic15(weapon, armor, treasure)) {
    s.attack = Math.floor(s.attack * 2);
    s.maxHp = Math.floor(s.maxHp * 2);
    s.critRate = Math.min(100, s.critRate * 2);
    s.critDmg *= 2;
  }
  // v42.0: Achievement stat_boost rewards
  for (const def of ACHIEVEMENTS_DATA) {
    if (!_achStatesCache?.[def.id]?.completed) continue;
    if (def.reward.type !== 'stat_boost') continue;
    const pct = def.reward.value / 100;
    switch (def.reward.stat) {
      case 'attack': s.attack = Math.floor(s.attack * (1 + pct)); break;
      case 'speed': s.speed += def.reward.value; break;
      case 'critRate': s.critRate += def.reward.value; break;
      case 'critDmg': s.critDmg += def.reward.value; break;
      case 'all':
        s.attack = Math.floor(s.attack * (1 + pct));
        s.maxHp = Math.floor(s.maxHp * (1 + pct));
        s.critRate = Math.min(100, s.critRate + def.reward.value);
        break;
    }
  }
  // v62.0: Affinity buffs (仙缘加成)
  const affinityBuffs = useAffinityStore.getState().getBuffs();
  if (affinityBuffs.attack) s.attack = Math.floor(s.attack * (1 + affinityBuffs.attack / 100));
  if (affinityBuffs.maxHp) s.maxHp = Math.floor(s.maxHp * (1 + affinityBuffs.maxHp / 100));
  if (affinityBuffs.critRate) s.critRate = Math.min(100, s.critRate + affinityBuffs.critRate);
  if (affinityBuffs.critDmg) s.critDmg += affinityBuffs.critDmg / 100;
  if (affinityBuffs.speed) s.speed += affinityBuffs.speed / 100;
  // defense buff stored but not on Stats type — applied as maxHp proxy
  if (affinityBuffs.defense) s.maxHp = Math.floor(s.maxHp * (1 + affinityBuffs.defense / 100));
  // v71.0: Equipment resonance (三件同品质)
  const resonance = getResonanceBonus(weapon, armor, treasure);
  if (resonance) {
    s.attack = Math.floor(s.attack * (1 + resonance.atkPct / 100));
    s.maxHp = Math.floor(s.maxHp * (1 + resonance.hpPct / 100));
    s.critRate = Math.min(100, s.critRate + resonance.critRate);
    s.critDmg += resonance.critDmg;
  }
  // v116.0: Transcendence bonuses (超越加成)
  const gs = useGameStore.getState();
  const trBonus = getTranscendBonuses(gs.player.transcendPerks ?? {});
  s.attack = Math.floor(s.attack * trBonus.atkMul);
  s.maxHp = Math.floor(s.maxHp * trBonus.hpMul);
  s.critRate = Math.min(100, s.critRate + trBonus.critFlat);
  s.critDmg += trBonus.critDmg;
  // v107.0: Pet bonuses (灵兽加成)
  const petBonus = getPetTotalBonus(gs.player.petLevels ?? {}, gs.player.activePetId);
  if (petBonus.atkPct) s.attack = Math.floor(s.attack * (1 + petBonus.atkPct / 100));
  if (petBonus.hpPct) s.maxHp = Math.floor(s.maxHp * (1 + petBonus.hpPct / 100));
  if (petBonus.critRate) s.critRate = Math.min(100, s.critRate + petBonus.critRate);
  if (petBonus.critDmg) s.critDmg += petBonus.critDmg / 100;
  // v147.0: Codex power (图鉴之力)
  const codex = getCodexBonuses(
    (gs.player.codexEquipIds ?? []).length,
    (gs.player.codexEnemyNames ?? []).length,
  );
  if (codex.atkPct) s.attack = Math.floor(s.attack * (1 + codex.atkPct / 100));
  if (codex.hpPct) s.maxHp = Math.floor(s.maxHp * (1 + codex.hpPct / 100));
  if (codex.critRate) s.critRate = Math.min(100, s.critRate + codex.critRate);
  if (codex.critDmg) s.critDmg += codex.critDmg;
  // v154.0: Level milestone bonuses (历史最高等级里程碑)
  const lvlMil = getLevelMilestoneBonuses(gs.player.highestLevelEver ?? gs.player.level);
  if (lvlMil.atkPct) s.attack = Math.floor(s.attack * (1 + lvlMil.atkPct / 100));
  if (lvlMil.hpPct) s.maxHp = Math.floor(s.maxHp * (1 + lvlMil.hpPct / 100));
  if (lvlMil.critRate) s.critRate = Math.min(100, s.critRate + lvlMil.critRate);
  if (lvlMil.critDmg) s.critDmg += lvlMil.critDmg;
  // v155.0: Gem bonuses (宝石加成)
  const allEquippedGems = Object.values(gs.player.equippedGems ?? {}).flat();
  if (allEquippedGems.length > 0) {
    const gemB = getGemBonuses(allEquippedGems);
    if (gemB.atkPct) s.attack = Math.floor(s.attack * (1 + gemB.atkPct / 100));
    if (gemB.hpPct) s.maxHp = Math.floor(s.maxHp * (1 + gemB.hpPct / 100));
    if (gemB.critRate) s.critRate = Math.min(100, s.critRate + gemB.critRate);
    if (gemB.critDmg) s.critDmg += gemB.critDmg / 100;
  }
  // v157.0: Power milestone bonuses (战力里程碑)
  const pwrMil = getPowerMilestoneBonuses(gs.highestPower ?? 0);
  if (pwrMil.atkMul) s.attack = Math.floor(s.attack * (1 + pwrMil.atkMul));
  if (pwrMil.hpMul) s.maxHp = Math.floor(s.maxHp * (1 + pwrMil.hpMul));
  if (pwrMil.critRate) s.critRate = Math.min(100, s.critRate + pwrMil.critRate);
  if (pwrMil.critDmg) s.critDmg += pwrMil.critDmg;
  return s;
}

/** Helper to apply enhance result to the correct location */
export const useGameStore = create<GameStore>((set, get) => ({
  player: makeInitialPlayer(),
  battle: makeInitialBattle(),
  highestChapter: 1,
  highestStage: 1,
  highestPower: 0,
  highestAbyssFloor: 0,
  allTimeKills: 0,
  claimedAbyssMilestones: [],
  equippedWeapon: null,
  equippedArmor: null,
  equippedTreasure: null,
  inventory: [],
  floatingTexts: [],
  idleStats: { goldPerSec: 0, expPerSec: 0, dps: 0, sessionTime: 0 },
  activeTab: 'battle',
  totalPlayTime: 0,
  lastSaveTimestamp: Date.now(),
  offlineReport: null,
  battleSpeed: 1,
  autoDecomposeQuality: 1,
  autoEquipOnDrop: true,
  autoSkill: false,
  autoConsume: false,
  autoWorldBoss: false,
  autoExplore: false,
  autoSanctuary: false,
  autoAffinity: false,
  autoSweep: false,
  autoFate: false,
  autoWheel: false,
  autoTrial: false,
  autoAscension: false,
  autoEnhance: false,
  autoReforge: false,
  autoFeedPet: false,
  autoBuyPerks: false,
  autoSynth: false,
  autoReincarnate: false,
  autoDaoAlloc: false, // v105.0
  autoFarm: false, // v111.0
  autoEvent: false, // v133.0: auto-choose safest random event option
  autoWeeklyBoss: false, // v145.0
  autoTranscend: false, // v117.0
  autoBuyTranscendPerks: false, // v117.0
  lastWheelSpin: 0,
  equippedTitle: null,
  completedChallenges: [],
  completedChallengesDate: '',
  titleToast: null,
  seenStories: [],
  activeStory: null,
  unlockedTitles: [],
  onlineRewardsClaimed: [],
  fateBlessing: { active: false, expiresAt: 0 },
  weeklyBoss: { week: 0, clearedFloors: [] as number[], claimed: [] as number[] },
  equipLoadouts: [] as { name: string; weapon: string | null; armor: string | null; treasure: string | null }[],

  setTab: (tab) => set({ activeTab: tab }),
  dismissOfflineReport: () => set({ offlineReport: null }),
  setBattleSpeed: (speed) => set({ battleSpeed: speed }),
  setAutoDecomposeQuality: (quality) => set({ autoDecomposeQuality: quality }),
  setAutoEquipOnDrop: (v) => set({ autoEquipOnDrop: v }),
  setAutoSkill: (v) => set({ autoSkill: v }),
  setAutoConsume: (v: boolean) => set({ autoConsume: v }),
  setAutoWorldBoss: (v: boolean) => set({ autoWorldBoss: v }),
  setAutoExplore: (v: boolean) => set({ autoExplore: v }),
  setAutoSanctuary: (v: boolean) => set({ autoSanctuary: v }),
  setAutoAffinity: (v: boolean) => set({ autoAffinity: v }),
  setAutoSweep: (v: boolean) => set({ autoSweep: v }),
  setAutoFate: (v: boolean) => set({ autoFate: v }),
  setAutoWheel: (v: boolean) => set({ autoWheel: v }),
  setAutoTrial: (v: boolean) => set({ autoTrial: v }),
  setAutoAscension: (v: boolean) => set({ autoAscension: v }),
  setAutoEnhance: (v: boolean) => set({ autoEnhance: v }),
  setAutoReforge: (v: boolean) => set({ autoReforge: v }),
  setAutoFeedPet: (v: boolean) => set({ autoFeedPet: v }),
  setAutoBuyPerks: (v: boolean) => set({ autoBuyPerks: v }),
  setAutoSynth: (v: boolean) => set({ autoSynth: v }),
  setAutoReincarnate: (v: boolean) => set({ autoReincarnate: v }),
  setAutoDaoAlloc: (v: boolean) => set({ autoDaoAlloc: v }),
  setAutoFarm: (v: boolean) => set({ autoFarm: v }),
  setAutoEvent: (v: boolean) => set({ autoEvent: v }),
  setAutoWeeklyBoss: (v: boolean) => set({ autoWeeklyBoss: v }),
  setAutoTranscend: (v: boolean) => set({ autoTranscend: v }),
  setAutoBuyTranscendPerks: (v: boolean) => set({ autoBuyTranscendPerks: v }),
  // v118.0: Weekly Boss
  setWeeklyBoss: (data: { week: number; clearedFloors: number[]; claimed: number[] }) => set({ weeklyBoss: data }),
  // v115.0: Pin achievement
  pinAchievement: (id: string | null) => set({ player: { ...get().player, pinnedAchievement: id } }),
  setEquippedTitle: (id: string | null) => set({ equippedTitle: id }),
  setCompletedChallenges: (ids: string[]) => {
    const today = new Date().toISOString().slice(0, 10);
    set({ completedChallenges: ids, completedChallengesDate: today });
  },
  activateFateBlessing: () => activateFateBlessingAction(get, set),
  claimOnlineReward: (minutes: number) => claimOnlineRewardAction(get, set, minutes),
  claimAbyssMilestone: (floor: number) => claimAbyssMilestoneAction(get, set, floor),

  clearFloatingText: (id) => set(s => ({ floatingTexts: s.floatingTexts.filter(f => f.id !== id) })),

  getEffectiveStats: () => {
    const { player, equippedWeapon, equippedArmor, equippedTreasure } = get();
    return calcEffectiveStats(player.stats, equippedWeapon, equippedArmor, equippedTreasure);
  },

  tick: () => {
    executeBattleTick(get, set);
  },

  clickAttack: () => clickAttackAction(get, set),

  attemptBreakthrough: () => attemptBreakthroughAction(get, set),

  // === Progression === (delegated to progressionActions.ts v129.0)
  reincarnate: () => reincarnateAction(get, set),
  buyReincPerk: (perkId: string, maxBuy?: boolean) => buyReincPerkAction(get, set, perkId, maxBuy),
  getReincMultiplier: (perkId: string) => getReincMultiplierAction(get, perkId),
  transcend: () => transcendAction(get, set),
  buyTranscendPerk: (perkId: string, maxBuy?: boolean) => buyTranscendPerkAction(get, set, perkId, maxBuy),

  equipItem: (item) => equipItemAction(get, set, item),
  unequipSlot: (slot) => unequipSlotAction(get, set, slot),
  enhanceEquip: (uid, useProtect = false, useLucky = false) => enhanceEquipAction(get, set, uid, useProtect, useLucky),
  refineItem: (targetUid, materialUids, useTianming = false, usePity = false) => refineItemAction(get, set, targetUid, materialUids, useTianming, usePity),
  buyScroll: (type) => buyScrollAction(get, set, type),
  sellEquip: (uid) => sellEquipAction(get, set, uid),
  toggleLock: (uid) => toggleLockAction(get, set, uid),
  decomposeEquip: (uid) => decomposeEquipAction(get, set, uid),
  batchDecompose: (uids) => batchDecomposeAction(get, set, uids),
  autoEquipBest: () => autoEquipBestAction(get, set),
  quickDecompose: (maxQuality: number) => quickDecomposeAction(get, set, maxQuality),
  goToChapter: (chapterId: number) => goToChapterAction(get, set, chapterId),
  sweepChapter: (chapterId: number, count: number) => sweepChapterAction(get, set, chapterId, count),
  sweepAll: () => sweepAllAction(get, set),
  batchEnhanceEquipped: () => batchEnhanceEquippedAction(get, set),

  save: () => saveAction(get, set),
  load: () => loadAction(get, set, addLog, makeInitialPlayer, makeInitialBattle),
  reset: () => resetAction(set, makeInitialPlayer, makeInitialBattle),
  saveToSlot: (slotId: number) => saveToSlotAction(get, slotId),
  loadFromSlot: (slotId: number) => loadFromSlotAction(get, slotId),
  deleteSlot: (slotId: number) => deleteSlotAction(slotId),
  getSaveSlots: () => getSaveSlotsAction(),

  advanceTutorial: () => advanceTutorialAction(get, set),
  skipTutorial: () => skipTutorialAction(get, set),
  dismissSystemTutorial: (id: string) => dismissSystemTutorialAction(get, set, id),

  // v52.0: Active Skills (delegated to miscActions.ts v131.0)
  useSkill: (skillId: string) => useSkillAction(get, set, skillId),
  // v53.0 Consumables (delegated to miscActions.ts v131.0)
  useConsumable: (buffId: string) => useConsumableAction(get, set, buffId),
  addConsumable: (buffId: string, count: number) => addConsumableAction(get, set, buffId, count),
  updatePlayer: (partial: Partial<PlayerState>) => updatePlayerAction(get, set, partial),

  // v97.0: Equipment synthesis — 3 same-quality items → 1 higher-quality item
  synthesizeEquip: (uids: string[]) => synthesizeEquipAction(get, set, uids),

  // v107.0: Pet system (delegated to equipmentActions.ts)
  reforgeEquip: (uid: string) => reforgeEquipAction(get, set, uid),
  socketGem: (equipUid: string, gemIndex: number) => socketGemAction(get, set, equipUid, gemIndex),
  unsocketGem: (equipUid: string, slotIndex: number) => unsocketGemAction(get, set, equipUid, slotIndex),
  mergeGems: (typeId: string, level: number) => mergeGemsAction(get, set, typeId, level),
  feedPet: (petId: string) => feedPetAction(get, set, petId),

  setActivePet: (petId: string | null) => setActivePetAction(get, set, petId),

  // v137.0: Equipment loadouts
  saveLoadout: (slotIndex: number, name: string) => {
    const { equippedWeapon, equippedArmor, equippedTreasure, equipLoadouts } = get();
    const loadout = {
      name: name || `方案${slotIndex + 1}`,
      weapon: equippedWeapon?.uid ?? null,
      armor: equippedArmor?.uid ?? null,
      treasure: equippedTreasure?.uid ?? null,
    };
    const updated = [...(equipLoadouts || [])];
    while (updated.length <= slotIndex) updated.push({ name: '', weapon: null, armor: null, treasure: null });
    updated[slotIndex] = loadout;
    set({ equipLoadouts: updated });
  },
  applyLoadout: (slotIndex: number) => {
    const { equipLoadouts, inventory, equippedWeapon, equippedArmor, equippedTreasure } = get();
    const loadout = (equipLoadouts || [])[slotIndex];
    if (!loadout) return { applied: 0, message: '预设不存在' };
    let applied = 0;
    // Unequip all first
    const allItems = [...inventory];
    if (equippedWeapon) allItems.push(equippedWeapon);
    if (equippedArmor) allItems.push(equippedArmor);
    if (equippedTreasure) allItems.push(equippedTreasure);
    
    let newWeapon: EquipmentItem | null = null;
    let newArmor: EquipmentItem | null = null;
    let newTreasure: EquipmentItem | null = null;
    const usedUids = new Set<string>();
    
    // Find items by uid
    if (loadout.weapon) {
      const item = allItems.find(i => i.uid === loadout.weapon);
      if (item && item.slot === 'weapon') { newWeapon = item; usedUids.add(item.uid); applied++; }
    }
    if (loadout.armor) {
      const item = allItems.find(i => i.uid === loadout.armor);
      if (item && item.slot === 'armor') { newArmor = item; usedUids.add(item.uid); applied++; }
    }
    if (loadout.treasure) {
      const item = allItems.find(i => i.uid === loadout.treasure);
      if (item && item.slot === 'treasure') { newTreasure = item; usedUids.add(item.uid); applied++; }
    }
    
    // Remaining items go to inventory
    const newInventory = allItems.filter(i => !usedUids.has(i.uid));
    
    set({
      equippedWeapon: newWeapon,
      equippedArmor: newArmor,
      equippedTreasure: newTreasure,
      inventory: newInventory,
    });
    return { applied, message: applied > 0 ? `已装备${applied}件` : '未找到匹配装备' };
  },
  deleteLoadout: (slotIndex: number) => {
    const { equipLoadouts } = get();
    const updated = [...(equipLoadouts || [])];
    if (slotIndex < updated.length) {
      updated[slotIndex] = { name: '', weapon: null, armor: null, treasure: null };
    }
    set({ equipLoadouts: updated });
  },
}));
