let _lastBackpackFullWarn = 0;
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
import { CHAPTERS, createEnemy, ABYSS_CHAPTER_ID } from '../data/chapters';
import { expForLevel, formatNumber } from '../utils/format';
import { sfx } from '../engine/audio';
import { REINC_PERKS, getReincMilestoneBonus } from '../data/reincarnation';
import { getTranscendBonuses } from '../data/transcendence';
import { AWAKENING_PATHS, totalAwakeningPoints, AWAKENING_UNLOCK_REINC } from '../data/awakening';
import { ACTIVE_SKILLS } from '../data/skills';
import { getAwakeningBonuses } from '../components/AwakeningPanel';
import { ABYSS_MILESTONES } from '../data/abyssMilestones';
import { calcTrialRewards } from '../data/roguelikeTrial';
import { getDailyChallenges, MODIFIERS as ASC_MODIFIERS } from '../data/ascensionChallenge';
import {
  rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat,
  getEnhanceCost, getMaxEnhanceLevel, getActiveSetBonuses,
  isHighEnhance, getHighEnhanceRate, getHighEnhanceDrop,
  canRefine, getRefineCost, REFINE_MATERIAL_COUNT, REFINE_BASE_RATE,
  REFINE_TIANMING_BONUS, REFINE_SHARD_PITY, hasHiddenPassive, hasFullMythic15,
  SCROLL_PRICES, EQUIPMENT_TEMPLATES,
} from '../data/equipment';
import {
  equipItemAction, unequipSlotAction, enhanceEquipAction, refineItemAction,
  buyScrollAction, sellEquipAction, toggleLockAction, decomposeEquipAction,
  batchDecomposeAction, autoEquipBestAction, quickDecomposeAction,
  goToChapterAction, sweepChapterAction, sweepAllAction, batchEnhanceEquippedAction,
  synthesizeEquipAction, feedPetAction, setActivePetAction,
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
import { useSanctuaryStore } from './sanctuaryStore';
import { BUILDINGS as SANCT_BUILDINGS, getUpgradeCost as getSanctUpgradeCost } from '../engine/sanctuary';
import { getResonanceBonus } from '../data/resonance';
import { getPetTotalBonus, PETS as PETS_DATA } from '../data/pets';
import { useAffinityStore } from './affinityStore';
import { AFFINITY_NPCS as AFFINITY_NPCS_LIST } from '../engine/affinity';
import { TITLES, type TitleCheckStats } from '../data/titles';
import { STORIES as STORY_LIST } from '../data/story';
import { useExplorationStore } from './explorationStore';
import { runAllAutoActions, type TickContext } from './tickAutoActions';

let logIdCounter = 0;
let floatIdCounter = 0;

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
  autoFeedPet: boolean; // v108.0: auto-feed active pet
  autoBuyPerks: boolean; // v96.0: auto-buy reincarnation perks
  autoSynth: boolean; // v98.0: auto-synthesize 3 same-quality equips
  autoReincarnate: boolean; // v102.0: auto-reincarnate when conditions met
  autoDaoAlloc: boolean; // v105.0: auto-allocate dao points after reincarnation
  autoFarm: boolean; // v111.0: auto-retreat to optimal farming chapter
  autoEvent: boolean; // v133.0: auto-choose random events
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
  setAutoFeedPet: (v: boolean) => void;
  setAutoBuyPerks: (v: boolean) => void;
  setAutoSynth: (v: boolean) => void;
  setAutoReincarnate: (v: boolean) => void;
  setAutoDaoAlloc: (v: boolean) => void; // v105.0
  setAutoFarm: (v: boolean) => void; // v111.0
  setAutoEvent: (v: boolean) => void; // v133.0
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
    pinnedAchievement: null,
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
  return s;
}

function calcClickPower(baseClick: number, treasure: EquipmentItem | null): number {
  let cp = baseClick;
  if (treasure?.passive?.type === 'clickPower') cp += treasure.passive.value;
  return cp;
}

function getLingshiBonusMul(weapon: EquipmentItem | null, armor: EquipmentItem | null, treasure: EquipmentItem | null): number {
  let mul = 1;
  for (const eq of [weapon, armor, treasure]) {
    if (eq?.passive?.type === 'lingshiBonus') mul += eq.passive.value;
  }
  return mul;
}

/** Helper: convert chapter+stage to global stage index */
function getGlobalStage(chapterId: number, stageNum: number): number {
  let total = 0;
  for (const ch of CHAPTERS) {
    if (ch.id < chapterId) total += ch.stages;
    else break;
  }
  return total + stageNum;
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
  autoFeedPet: false,
  autoBuyPerks: false,
  autoSynth: false,
  autoReincarnate: false,
  autoDaoAlloc: false, // v105.0
  autoFarm: false, // v111.0
  autoEvent: false, // v133.0: auto-choose safest random event option
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
  setAutoFeedPet: (v: boolean) => set({ autoFeedPet: v }),
  setAutoBuyPerks: (v: boolean) => set({ autoBuyPerks: v }),
  setAutoSynth: (v: boolean) => set({ autoSynth: v }),
  setAutoReincarnate: (v: boolean) => set({ autoReincarnate: v }),
  setAutoDaoAlloc: (v: boolean) => set({ autoDaoAlloc: v }),
  setAutoFarm: (v: boolean) => set({ autoFarm: v }),
  setAutoEvent: (v: boolean) => set({ autoEvent: v }),
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
    const state = get();
    // v87.0: daily challenge reset
    const today = new Date().toISOString().slice(0, 10);
    if (state.completedChallengesDate !== today) {
      set({ completedChallenges: [], completedChallengesDate: today });
    }
    const { player, battle, equippedWeapon, equippedArmor, equippedTreasure } = state;
    if (!battle.currentEnemy) return;

    const effectiveStats = calcEffectiveStats(player.stats, equippedWeapon, equippedArmor, equippedTreasure);
    const lingshiMul = getLingshiBonusMul(equippedWeapon, equippedArmor, equippedTreasure);

    // v22.0 转世加成
    const atkMul = REINC_PERKS.find(p => p.id === 'atk_mult')!.effect(player.reincPerks?.['atk_mult'] ?? 0);
    const expMul = REINC_PERKS.find(p => p.id === 'exp_mult')!.effect(player.reincPerks?.['exp_mult'] ?? 0);
    const goldMul = REINC_PERKS.find(p => p.id === 'gold_mult')!.effect(player.reincPerks?.['gold_mult'] ?? 0);
    // v116.0 超越加成
    const trBonusTick = getTranscendBonuses(player.transcendPerks ?? {});
    // v53.0 消耗品增益
    const cEffect = getActiveConsumableEffects(player.activeConsumables ?? []);
    // v59.0 觉醒加成
    const awk = getAwakeningBonuses(player);
    // v67.0 转世里程碑加成
    const rmb = getReincMilestoneBonus(player.reincarnations);
    // v81.0 称号加成
    const titleId = get().equippedTitle;
    const titleBonus = titleId ? TITLES.find(t => t.id === titleId)?.bonuses ?? {} : {};
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
        // Failed tribulation — refund half pantao, resume normal battle
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
          // Auto-activate: set cooldown and buff
          skillState.cooldowns[skill.id] = skill.cooldown;
          if (skill.duration > 0) {
            skillState.buffs[skill.id] = skill.duration;
          }
          // instant kill for jindouyun
          if (skill.id === 'jindouyun' && updatedBattle.currentEnemy) {
            const enemy = updatedBattle.currentEnemy;
            const goldReward = enemy.lingshiDrop * 2;
            const expReward = enemy.expDrop * 2;
            updatedPlayer.lingshi += goldReward;
            updatedPlayer.exp += expReward;
            updatedBattle.log = addLog(updatedBattle.log, `🌀 筋斗云·瞬杀 ${enemy.name}！双倍奖励`, 'boss');
            updatedBattle.currentEnemy = { ...enemy, hp: 0 };
          }
        }
      }
      updatedPlayer.activeSkills = skillState;
    }

    // v53.0: Tick consumable timers
    if (updatedPlayer.activeConsumables && updatedPlayer.activeConsumables.length > 0) {
      updatedPlayer.activeConsumables = updatedPlayer.activeConsumables
        .map(c => ({ ...c, remainingSec: c.remainingSec - 1 }))
        .filter(c => c.remainingSec > 0);
    }

    // v63.0: Auto-consume potions when available and no active buff of same type
    if (state.autoConsume) {
      const actives = updatedPlayer.activeConsumables ?? [];
      const activeIds = new Set(actives.map(a => a.buffId));
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
            break; // one per tick
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
    // Percentage-based defense: reduction = def / (def + 100 + level*5)
    // v52.0: 金刚不坏 ignores defense
    const shieldActive = (skillState.buffs['jingang'] ?? 0) > 0;
    const defReduction = shieldActive ? 0 : enemy.defense / (enemy.defense + 100 + updatedPlayer.level * 5);
    let dmg = Math.max(1, Math.floor(effectiveStats.attack * (1 - defReduction)));
    if (isCrit) dmg = Math.floor(dmg * effectiveStats.critDmg);

    // v1.2: Weapon +15 hidden passive — 鸿蒙一击 (5% chance 3x damage)
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
    });

    if (isHongmengStrike) {
      log = addLog(log, `悟空 >>> ${enemy.name}  -${dmg} 鸿蒙一击！`, 'crit');
      updatedPlayer.totalCrits = (updatedPlayer.totalCrits || 0) + 1;
    } else if (isCrit) {
      log = addLog(log, `悟空 >> ${enemy.name}  -${dmg} 暴击！`, 'crit');
      updatedPlayer.totalCrits = (updatedPlayer.totalCrits || 0) + 1;
    } else {
      log = addLog(log, `悟空 > ${enemy.name}  -${dmg}`, 'attack');
    }

    // 记录最高伤害
    updatedPlayer.maxDamage = Math.max(updatedPlayer.maxDamage, dmg);

    if (enemy.hp <= 0) {
      updatedPlayer.totalKills++;
      // v85.0: all-time kills (persists across reincarnations)
      set({ allTimeKills: state.allTimeKills + 1 });
      // v51.0: Codex tracking - enemy
      if (!updatedPlayer.codexEnemyNames.includes(enemy.name)) {
        updatedPlayer.codexEnemyNames = [...updatedPlayer.codexEnemyNames, enemy.name];
      }
      // v49.0: Kill streak
      updatedBattle.killStreak = (updatedBattle.killStreak || 0) + 1;
      const streak = updatedBattle.killStreak;
      // v115.0: Track best kill streak
      if (streak > (updatedPlayer.bestKillStreak || 0)) {
        updatedPlayer.bestKillStreak = streak;
      }
      const streakBonus = streak >= 100 ? 0.5 : streak >= 50 ? 0.3 : streak >= 20 ? 0.2 : streak >= 10 ? 0.1 : 0;
      log = addLog(log, `${enemy.name} 击败！${streak >= 10 ? ` 🔥连杀×${streak} (+${Math.round(streakBonus*100)}%奖励)` : ''}`, 'kill');
      // Streak milestone notifications
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

      // v62.0: Affinity lingshi/exp multipliers
      const afBuf = useAffinityStore.getState().getBuffs();
      const afLingshi = 1 + (afBuf.lingshiMul ?? 0) / 100;
      const afExp = 1 + (afBuf.expMul ?? 0) / 100;
      const fateMul = (state.fateBlessing.active && state.fateBlessing.expiresAt > Date.now()) ? 2 : 1;
      const petB = getPetTotalBonus(player.petLevels ?? {}, player.activePetId);
      const lingshiDrop = Math.floor(enemy.lingshiDrop * lingshiMul * goldMul * (1 + (cEffect.goldMult ?? 0)) * (1 + streakBonus) * (1 + (awk.gold_pct ?? 0) / 100) * afLingshi * (1 + rmb.gold) * fateMul * (1 + (titleBonus.goldMul ?? 0)) * (1 + (petB.goldPct ?? 0) / 100) * trBonusTick.goldMul);
      const expDrop = Math.floor(enemy.expDrop * expMul * (1 + (cEffect.expMult ?? 0)) * (1 + streakBonus) * (1 + (awk.exp_pct ?? 0) / 100) * afExp * (1 + rmb.exp) * fateMul * (1 + (titleBonus.expMul ?? 0)) * (1 + (petB.expPct ?? 0) / 100) * trBonusTick.expMul);
      updatedPlayer.lingshi += lingshiDrop;
      updatedPlayer.totalGoldEarned = (updatedPlayer.totalGoldEarned || 0) + lingshiDrop;
      updatedPlayer.exp += expDrop;
      tickGold += lingshiDrop;
      tickExp += expDrop;
      log = addLog(log, `  灵石+${lingshiDrop}  经验+${expDrop}`, 'drop');
      // v106.0: Reward floats
      if (lingshiDrop > 0) newFloats.push({ id: floatIdCounter++, text: `+${formatNumber(lingshiDrop)}💰`, type: 'gold', timestamp: Date.now() });
      if (expDrop > 0) newFloats.push({ id: floatIdCounter++, text: `+${formatNumber(expDrop)}✨`, type: 'exp', timestamp: Date.now() });

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

      // Equipment drop (with inventory limit check — T-100 fix)
      if (updatedInventory.length < getInventoryMax(updatedPlayer.reincarnations)) {
        const globalStage = getGlobalStage(updatedBattle.chapterId, updatedBattle.stageNum);
        const dropMul = REINC_PERKS.find(p => p.id === 'drop_mult')!.effect(updatedPlayer.reincPerks?.['drop_mult'] ?? 0) - 1 + rmb.drop;
        const eqDrop = rollEquipDrop(globalStage, enemy.isBoss, dropMul);
        if (eqDrop) {
          const newItem = createEquipFromTemplate(eqDrop);
          updatedInventory.push(newItem);
          updatedPlayer.totalEquipDrops++;
          // v51.0: Codex tracking - equip
          if (!updatedPlayer.codexEquipIds.includes(eqDrop.id)) {
            updatedPlayer.codexEquipIds = [...updatedPlayer.codexEquipIds, eqDrop.id];
          }
          const qi = QUALITY_INFO[eqDrop.quality];
          log = addLog(log, `  获得 ${qi.symbol}${eqDrop.name}`, 'drop');
          newFloats.push({ id: floatIdCounter++, text: `${qi.symbol}${eqDrop.name}`, type: 'drop', timestamp: Date.now() });
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
        // Backpack full warning (P0 fix: inform player)
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
        updatedPlayer.stats.attack += Math.floor(3 + updatedPlayer.level * 0.5);
        updatedPlayer.stats.maxHp += Math.floor(10 + updatedPlayer.level * 2);
        updatedPlayer.stats.hp = updatedPlayer.stats.maxHp;
        updatedPlayer.clickPower = Math.floor(5 + updatedPlayer.level * 0.8);
        log = addLog(log, `升级 Lv.${updatedPlayer.level}  攻+${Math.floor(3 + updatedPlayer.level * 0.5)}  血+${Math.floor(10 + updatedPlayer.level * 2)}`, 'levelup');
        newFloats.push({ id: floatIdCounter++, text: `🎉 Lv.${updatedPlayer.level}`, type: 'levelup', timestamp: Date.now() });
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
        // Resume normal battle
        const resumeEnemy = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, false)!;
        updatedBattle = { ...updatedBattle, wave: 1, isBossWave: false, currentEnemy: resumeEnemy, log, tribulation: undefined };
        // skip normal boss→next stage logic
      } else
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
            // Enter Abyss mode — infinite scaling
            newChapterId = ABYSS_CHAPTER_ID;
            newStageNum = 1;
            log = addLog(log, `第${chapter.id}章「${chapter.name}」通关！进入无尽深渊！`, 'info');
          }
        }

        const newEnemy = createEnemy(newChapterId, newStageNum, false)!;
        updatedBattle = {
          ...updatedBattle, chapterId: newChapterId, stageNum: newStageNum,
          wave: 1, isBossWave: false, currentEnemy: newEnemy, log,
        };
        log = addLog(log, `${newEnemy.name} 出现了！`, 'info');

        const hc = newChapterId > state.highestChapter ? newChapterId : state.highestChapter;
        const hs = newChapterId > state.highestChapter ? newStageNum :
          (newChapterId === state.highestChapter && newStageNum > state.highestStage ? newStageNum : state.highestStage);
        // v85.0: track highest abyss floor
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
          const newEnemy = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, false)!;
          updatedBattle = { ...updatedBattle, wave: nextWave, isBossWave: false, currentEnemy: newEnemy, log };
        }
      }
    } else {
      updatedBattle = { ...updatedBattle, currentEnemy: enemy, log };
    }

    // Update idle stats (rolling average)
    const prevStats = state.idleStats;
    const sessionTime = prevStats.sessionTime + 1;
    const alpha = 0.2; // smoothing
    const goldPerSec = prevStats.goldPerSec * (1 - alpha) + tickGold * alpha;
    const expPerSec = prevStats.expPerSec * (1 - alpha) + tickExp * alpha;
    const dps = prevStats.dps * (1 - alpha) + tickDmg * alpha;

    updatedPlayer.totalCultivateTime += 1;

    // v13: Sanctuary production per tick
    const sBuffs = useSanctuaryStore.getState().getBuffs();
    if (sBuffs.lingshi) updatedPlayer.lingshi += sBuffs.lingshi;
    if (sBuffs.exp) updatedPlayer.exp += sBuffs.exp;

    // v123.0: All auto-actions extracted to tickAutoActions.ts
    const tickCtx: TickContext = {
      state, get, set,
      updatedPlayer, updatedBattle, updatedInventory,
      log, addLog,
      totalPlayTime: state.totalPlayTime,
    };
    if (runAllAutoActions(tickCtx)) return; // reincarnate/transcend exits early
    updatedPlayer = tickCtx.updatedPlayer;
    updatedBattle = tickCtx.updatedBattle;
    updatedInventory = tickCtx.updatedInventory;
    log = tickCtx.log;

    set({
      player: updatedPlayer,
      battle: updatedBattle,
      inventory: updatedInventory.length > getInventoryMax(updatedPlayer.reincarnations)
        ? (() => {
            // Auto-decompose: remove lowest quality unlocked items
            const qualityOrder = Object.keys(QUALITY_INFO);
            const unlocked = updatedInventory.filter(i => !i.locked);
            unlocked.sort((a, b) => qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality));
            const toRemove = new Set(unlocked.slice(0, updatedInventory.length - getInventoryMax(updatedPlayer.reincarnations)).map(i => i.uid));
            // Add decompose proceeds
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
      floatingTexts: newFloats.slice(-10), // keep max 10
      idleStats: { goldPerSec, expPerSec, dps, sessionTime },
      totalPlayTime: state.totalPlayTime + 1,
    });
  },

  clickAttack: () => {
    const { player, battle, equippedTreasure, floatingTexts } = get();
    if (!battle.currentEnemy) return;
    const enemy = { ...battle.currentEnemy };
    const cp = calcClickPower(player.clickPower, equippedTreasure);
    enemy.hp -= cp;
    sfx.hit();
    const log = addLog([...battle.log], `点击 > ${enemy.name}  -${cp}`, 'attack');
    const newFloat: FloatingText = {
      id: floatIdCounter++,
      text: `点击 ${cp}`,
      type: 'click',
      timestamp: Date.now(),
    };
    set({
      battle: { ...battle, currentEnemy: enemy.hp <= 0 ? { ...enemy, hp: 0 } : enemy, log },
      floatingTexts: [...floatingTexts, newFloat].slice(-10),
    });
  },

  attemptBreakthrough: () => {
    const { player, battle } = get();
    const nextRealm = REALMS[player.realmIndex + 1];
    if (!nextRealm) return;
    if (player.level < nextRealm.levelReq || player.pantao < nextRealm.pantaoReq) return;
    // If tribulation already active, don't restart
    if (battle.tribulation?.active) return;

    // Tribulation boss: scales with realm level
    const tribNames = ['雷劫', '火劫', '风劫', '心魔', '天劫', '九天雷罚', '混沌劫', '灭世天劫', '鸿蒙劫'];
    const tribEmojis = ['[雷]', '[火]', '[风]', '[魔]', '[劫]', '[雷]', '[混]', '[灭]', '[鸿]'];
    const ri = player.realmIndex; // 0-based, breakthrough to ri+1
    const tribHp = Math.floor(player.stats.maxHp * (3 + ri * 2));
    const tribDef = Math.floor(player.stats.attack * 0.15 * (1 + ri * 0.3));
    const tribAtk = Math.floor(player.stats.maxHp * 0.08 * (1 + ri * 0.2));
    const tribName = tribNames[Math.min(ri, tribNames.length - 1)];
    const tribEmoji = tribEmojis[Math.min(ri, tribEmojis.length - 1)];

    // Spend pantao, spawn tribulation enemy
    set({
      player: {
        ...player,
        pantao: player.pantao - nextRealm.pantaoReq,
      },
      battle: {
        ...battle,
        currentEnemy: {
          name: tribName,
          emoji: tribEmoji,
          hp: tribHp,
          maxHp: tribHp,
          defense: tribDef,
          lingshiDrop: 0,
          expDrop: 0,
          pantaoDrop: Math.floor(nextRealm.pantaoReq * 0.3),
          isBoss: true,
        },
        isBossWave: true,
        tribulation: {
          active: true,
          realmIndex: player.realmIndex + 1,
          timer: 60 + ri * 10, // 60-150 seconds
        },
        log: addLog(battle.log, `⚡ 天劫降临！「${tribName}」— 在 ${60 + ri * 10}秒内击败它！`, 'boss'),
      },
    });
    sfx.bossAppear();
  },

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
  feedPet: (petId: string) => feedPetAction(get, set, petId),

  setActivePet: (petId: string | null) => setActivePetAction(get, set, petId),
}));
