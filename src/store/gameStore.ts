let _lastBackpackFullWarn = 0;
// v42.0: Achievement state cache (updated from App.tsx tick)
let _achStatesCache: Record<string, { completed: boolean }> | null = null;
export function setAchStatesCache(states: Record<string, { completed: boolean }>) { _achStatesCache = states; }
import { create } from 'zustand';
import { PlayerState, BattleState, BattleLogEntry, TabId, GameSave, EquipmentItem, EquipSlot, Quality, Stats, QUALITY_INFO, FloatingText, INVENTORY_MAX, OfflineReport, ActiveConsumable, ConsumableEffect } from '../types';
import { getConsumable } from '../data/consumables';
import { REALMS } from '../data/realms';
import { ACHIEVEMENTS as ACHIEVEMENTS_DATA } from '../data/achievements';
import { CHAPTERS, createEnemy, ABYSS_CHAPTER_ID } from '../data/chapters';
import { expForLevel } from '../utils/format';
import { sfx } from '../engine/audio';
import { calcDaoPoints, REINC_PERKS, REINC_MIN_REALM, REINC_MIN_LEVEL, getReincMilestoneBonus } from '../data/reincarnation';
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
import { calculateOfflineEarnings } from '../engine/offline';
import { useSanctuaryStore } from './sanctuaryStore';
import { BUILDINGS as SANCT_BUILDINGS, getUpgradeCost as getSanctUpgradeCost } from '../engine/sanctuary';
import { getResonanceBonus } from '../data/resonance';
import { useAffinityStore } from './affinityStore';
import { AFFINITY_NPCS as AFFINITY_NPCS_LIST } from '../engine/affinity';
import { TITLES, type TitleCheckStats } from '../data/titles';
import { useExplorationStore } from './explorationStore';

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
  autoBuyPerks: boolean; // v96.0: auto-buy reincarnation perks
  autoSynth: boolean; // v98.0: auto-synthesize 3 same-quality equips
  lastWheelSpin: number; // v83.0: last wheel spin timestamp
  equippedTitle: string | null; // v81.0: equipped title id
  unlockedTitles: string[]; // v81.0: unlocked title ids
  onlineRewardsClaimed: number[]; // v57.0: claimed milestone minutes
  fateBlessing: { active: boolean; expiresAt: number }; // v73.0: double gains buff
  completedChallenges: string[]; // v87.0: completed ascension challenge ids today
  completedChallengesDate: string; // v87.0: date string for daily reset
  titleToast: string | null; // v89.0: title unlock toast

  // Actions
  setTab: (tab: TabId) => void;
  tick: () => void;
  clickAttack: () => void;
  attemptBreakthrough: () => void;
  reincarnate: () => void;
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
  setAutoBuyPerks: (v: boolean) => void;
  setAutoSynth: (v: boolean) => void;
  setEquippedTitle: (id: string | null) => void;
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

interface SaveSlotInfo {
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

function makeInitialPlayer(): PlayerState {
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
    trialShopPurchases: {},
  };
}

function makeInitialBattle(): BattleState {
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

function addLog(log: BattleLogEntry[], text: string, type: BattleLogEntry['type']): BattleLogEntry[] {
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
function applyEnhanceResult(
  set: any,
  state: any,
  location: string,
  invIdx: number,
  newItem: EquipmentItem,
  updatedPlayer: PlayerState,
  log: BattleLogEntry[],
) {
  updatedPlayer.totalEnhances = (updatedPlayer.totalEnhances || 0) + 1;
  if (location === 'inventory') {
    const newInv = [...state.inventory];
    newInv[invIdx] = newItem;
    set({ player: updatedPlayer, inventory: newInv, battle: { ...state.battle, log } });
  } else {
    set({
      player: updatedPlayer,
      [location]: newItem,
      battle: { ...state.battle, log },
    } as any);
  }
}

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
  autoBuyPerks: false,
  autoSynth: false,
  lastWheelSpin: 0,
  equippedTitle: null,
  completedChallenges: [],
  completedChallengesDate: '',
  titleToast: null,
  unlockedTitles: [],
  onlineRewardsClaimed: [],
  fateBlessing: { active: false, expiresAt: 0 },

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
  setAutoBuyPerks: (v: boolean) => set({ autoBuyPerks: v }),
  setAutoSynth: (v: boolean) => set({ autoSynth: v }),
  setEquippedTitle: (id: string | null) => set({ equippedTitle: id }),
  setCompletedChallenges: (ids: string[]) => {
    const today = new Date().toISOString().slice(0, 10);
    set({ completedChallenges: ids, completedChallengesDate: today });
  },
  activateFateBlessing: () => {
    const state = get();
    if (state.player.tianmingScrolls <= 0) return false;
    const now = Date.now();
    if (state.fateBlessing.active && state.fateBlessing.expiresAt > now) return false; // already active
    const updatedPlayer = { ...state.player, tianmingScrolls: state.player.tianmingScrolls - 1 };
    set({ player: updatedPlayer, fateBlessing: { active: true, expiresAt: now + 2 * 60 * 60 * 1000 } });
    return true;
  },
  claimOnlineReward: (minutes: number) => {
    const state = get();
    if (state.onlineRewardsClaimed.includes(minutes)) return null;
    const level = state.player.level;
    const rewards: Record<number, { gold: number; exp: number; pantao: number; desc: string }> = {
      10:  { gold: Math.max(5000, level * 200), exp: Math.max(3000, level * 150), pantao: 0, desc: '在线10分钟奖励' },
      30:  { gold: Math.max(20000, level * 500), exp: Math.max(10000, level * 400), pantao: Math.max(5, Math.floor(level / 20)), desc: '在线30分钟奖励' },
      60:  { gold: Math.max(50000, level * 1000), exp: Math.max(30000, level * 800), pantao: Math.max(15, Math.floor(level / 10)), desc: '在线1小时奖励' },
      120: { gold: Math.max(150000, level * 3000), exp: Math.max(80000, level * 2000), pantao: Math.max(30, Math.floor(level / 5)), desc: '在线2小时奖励' },
      240: { gold: Math.max(500000, level * 8000), exp: Math.max(200000, level * 5000), pantao: Math.max(80, Math.floor(level / 3)), desc: '在线4小时奖励' },
    };
    const r = rewards[minutes];
    if (!r) return null;
    set({
      player: { ...state.player, lingshi: state.player.lingshi + r.gold, exp: state.player.exp + r.exp, pantao: state.player.pantao + r.pantao },
      onlineRewardsClaimed: [...state.onlineRewardsClaimed, minutes],
    });
    return r;
  },
  // v86.0: Claim abyss milestone rewards
  claimAbyssMilestone: (floor: number) => {
    const state = get();
    if (state.claimedAbyssMilestones.includes(floor)) return false;
    const milestone = ABYSS_MILESTONES.find(m => m.floor === floor);
    if (!milestone || state.highestAbyssFloor < floor) return false;
    const p = { ...state.player };
    if (milestone.rewards.lingshi) p.lingshi += milestone.rewards.lingshi;
    if (milestone.rewards.pantao) p.pantao += milestone.rewards.pantao;
    if (milestone.rewards.shards) p.hongmengShards += milestone.rewards.shards;
    if (milestone.rewards.daoPoints) p.daoPoints = (p.daoPoints ?? 0) + milestone.rewards.daoPoints;
    if (milestone.rewards.trialTokens) p.trialTokens = (p.trialTokens ?? 0) + milestone.rewards.trialTokens;
    if (milestone.rewards.tianmingScrolls) p.tianmingScrolls += milestone.rewards.tianmingScrolls;
    set({ player: p, claimedAbyssMilestones: [...state.claimedAbyssMilestones, floor] });
    return true;
  },

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
    const skillState = { ...updatedPlayer.activeSkills, cooldowns: { ...updatedPlayer.activeSkills.cooldowns }, buffs: { ...updatedPlayer.activeSkills.buffs } };
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
      const lingshiDrop = Math.floor(enemy.lingshiDrop * lingshiMul * goldMul * (1 + (cEffect.goldMult ?? 0)) * (1 + streakBonus) * (1 + (awk.gold_pct ?? 0) / 100) * afLingshi * (1 + rmb.gold) * fateMul * (1 + (titleBonus.goldMul ?? 0)));
      const expDrop = Math.floor(enemy.expDrop * expMul * (1 + (cEffect.expMult ?? 0)) * (1 + streakBonus) * (1 + (awk.exp_pct ?? 0) / 100) * afExp * (1 + rmb.exp) * fateMul * (1 + (titleBonus.expMul ?? 0)));
      updatedPlayer.lingshi += lingshiDrop;
      updatedPlayer.totalGoldEarned = (updatedPlayer.totalGoldEarned || 0) + lingshiDrop;
      updatedPlayer.exp += expDrop;
      tickGold += lingshiDrop;
      tickExp += expDrop;
      log = addLog(log, `  灵石+${lingshiDrop}  经验+${expDrop}`, 'drop');

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
      if (updatedInventory.length < INVENTORY_MAX) {
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
          log = addLog(log, `  ⚠️ 背包已满(${INVENTORY_MAX}/${INVENTORY_MAX})！请分解或开启自动分解`, 'info');
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

    // v79.0: Auto-upgrade sanctuary buildings (cheapest first)
    if (state.autoSanctuary) {
      const sanctStore = useSanctuaryStore.getState();
      const sanctLevels = sanctStore.sanctuary.levels;
      const upgradeable = SANCT_BUILDINGS
        .map(b => ({ id: b.id, cost: getSanctUpgradeCost(b, sanctLevels[b.id] ?? 0), lv: sanctLevels[b.id] ?? 0 }))
        .filter(x => x.lv < 10 && x.cost <= updatedPlayer.lingshi)
        .sort((a, b) => a.cost - b.cost);
      if (upgradeable.length > 0) {
        const best = upgradeable[0];
        const res = sanctStore.upgrade(best.id, updatedPlayer.lingshi);
        if (res) updatedPlayer.lingshi -= res.cost;
      }
    }

    // v80.0: Auto-gift affinity NPCs (cheapest tier, every 10 ticks)
    if (state.autoAffinity && state.totalPlayTime % 10 === 0) {
      const affStore = useAffinityStore.getState();
      // v100.0: Smart gifting — use highest affordable tier
      for (const npc of AFFINITY_NPCS_LIST) {
        const tier = updatedPlayer.lingshi >= 10000 ? 2 : updatedPlayer.lingshi >= 1000 ? 1 : 0;
        const cost = [100, 1000, 10000][tier];
        if (updatedPlayer.lingshi >= cost) {
          const result = affStore.gift(npc.id, updatedPlayer.lingshi, tier);
          if (result) updatedPlayer.lingshi -= result.cost;
        }
      }
    }

    // v83.0: Auto-sweep all cleared chapters every 60 ticks
    if (state.autoSweep && state.totalPlayTime % 60 === 0 && state.totalPlayTime > 0) {
      const result = get().sweepAll();
      if (result.chapters > 0) {
        updatedPlayer = get().player; // sweepAll modifies player directly
      }
    }

    // v83.0: Auto-activate fate blessing when have tokens
    if (state.autoFate && !state.fateBlessing.active && updatedPlayer.tianmingScrolls > 0) {
      updatedPlayer.tianmingScrolls -= 1;
      set({ fateBlessing: { active: true, expiresAt: Date.now() + 2 * 60 * 60 * 1000 } });
    }

    // v83.0: Auto-spin lucky wheel every hour when affordable
    if (state.autoWheel && state.totalPlayTime % 30 === 0 && updatedPlayer.lingshi >= 5000) {
      const now = Date.now();
      if (now - state.lastWheelSpin >= 3600_000) {
        updatedPlayer.lingshi -= 5000;
        // Simplified wheel reward (weighted random inline)
        const roll = Math.random();
        const lv = updatedPlayer.level;
        const goldBase = Math.max(1000, lv * 500);
        if (roll < 0.25) { updatedPlayer.lingshi += goldBase; }
        else if (roll < 0.45) { updatedPlayer.exp += Math.floor(goldBase * 0.8); }
        else if (roll < 0.60) { updatedPlayer.pantao += Math.max(10, Math.floor(lv / 2)); }
        else if (roll < 0.72) { updatedPlayer.hongmengShards = (updatedPlayer.hongmengShards ?? 0) + Math.max(5, Math.floor(lv / 10)); }
        else if (roll < 0.82) { /* random consumable */ updatedPlayer.lingshi += Math.floor(goldBase * 1.5); }
        else if (roll < 0.90) { updatedPlayer.pantao += Math.max(20, lv); }
        else if (roll < 0.95) { updatedPlayer.tianmingScrolls = (updatedPlayer.tianmingScrolls ?? 0) + 1; }
        else if (roll < 0.98) { updatedPlayer.lingshi += goldBase * 3; }
        else { updatedPlayer.lingshi += goldBase * 10; } // 2% jackpot
        set({ lastWheelSpin: now });
      }
    }

    // v93.0: Auto quick trial every 5 minutes (300 ticks)
    if (state.autoTrial && state.totalPlayTime % 300 === 0 && state.totalPlayTime > 0 && (updatedPlayer.trialBestFloor ?? 0) >= 3) {
      const quickFloor = Math.max(1, Math.floor((updatedPlayer.trialBestFloor ?? 0) * 0.7));
      const rewards = calcTrialRewards(quickFloor, updatedPlayer.level);
      updatedPlayer.lingshi += rewards.lingshi;
      updatedPlayer.exp += rewards.exp;
      updatedPlayer.pantao += rewards.pantao;
      updatedPlayer.trialTokens = (updatedPlayer.trialTokens ?? 0) + rewards.trialTokens;
    }

    // v93.0: Auto ascension challenge daily
    if (state.autoAscension && state.totalPlayTime % 600 === 0 && state.totalPlayTime > 0) {
      const today = new Date().toDateString();
      const completed = state.completedChallengesDate === today ? [...state.completedChallenges] : [];
      const challenges = getDailyChallenges();
      let changed = false;
      for (const ch of challenges) {
        if (completed.includes(ch.id)) continue;
        if (updatedPlayer.level < (ch.levelReq ?? 0)) continue;
        const rewardMult = ch.modifiers.reduce((m: number, mid: string) => {
          const mod = ASC_MODIFIERS.find((x) => x.id === mid);
          return m * (mod?.rewardMult ?? 1);
        }, 1);
        const lv = updatedPlayer.level;
        updatedPlayer.lingshi += Math.floor(ch.rewards.lingshi * lv * rewardMult);
        updatedPlayer.pantao += Math.floor(ch.rewards.pantao * rewardMult);
        updatedPlayer.hongmengShards = (updatedPlayer.hongmengShards ?? 0) + Math.floor(ch.rewards.shards * rewardMult);
        updatedPlayer.trialTokens = (updatedPlayer.trialTokens ?? 0) + Math.floor(ch.rewards.trialTokens * rewardMult);
        updatedPlayer.daoPoints = (updatedPlayer.daoPoints ?? 0) + Math.floor(ch.rewards.daoPoints * rewardMult);
        completed.push(ch.id);
        changed = true;
      }
      if (changed) {
        set({ completedChallenges: completed, completedChallengesDate: today });
      }
    }

    // v95.0: Auto-enhance equipped gear every 30 ticks
    if (state.autoEnhance && state.totalPlayTime % 30 === 0 && state.totalPlayTime > 0) {
      const slots: Array<{ item: EquipmentItem | null; key: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' }> = [
        { item: state.equippedWeapon, key: 'equippedWeapon' },
        { item: state.equippedArmor, key: 'equippedArmor' },
        { item: state.equippedTreasure, key: 'equippedTreasure' },
      ];
      for (const { item, key } of slots) {
        if (!item) continue;
        const maxLv = getMaxEnhanceLevel(item);
        if (item.level >= maxLv) continue;
        // Only normal enhance (+1~+10), skip high enhance
        if (item.level >= 10) continue;
        const cost = getEnhanceCost(item);
        if (updatedPlayer.lingshi >= cost) {
          updatedPlayer.lingshi -= cost;
          const enhanced = { ...item, level: item.level + 1 };
          set({ [key]: enhanced } as any);
        }
      }
    }

    // v96.0: Auto-buy reincarnation perks every 60 ticks
    if (state.autoBuyPerks && state.totalPlayTime % 60 === 0 && state.totalPlayTime > 0 && updatedPlayer.daoPoints > 0) {
      // Buy cheapest available perk repeatedly until out of points
      let bought = true;
      while (bought) {
        bought = false;
        let cheapest: { id: string; cost: number } | null = null;
        for (const perk of REINC_PERKS) {
          const lv = updatedPlayer.reincPerks?.[perk.id] ?? 0;
          if (lv >= perk.maxLevel) continue;
          if (!cheapest || perk.costPerLevel < cheapest.cost) {
            cheapest = { id: perk.id, cost: perk.costPerLevel };
          }
        }
        if (cheapest && updatedPlayer.daoPoints >= cheapest.cost) {
          updatedPlayer.daoPoints -= cheapest.cost;
          updatedPlayer.reincPerks = { ...updatedPlayer.reincPerks, [cheapest.id]: (updatedPlayer.reincPerks?.[cheapest.id] ?? 0) + 1 };
          bought = true;
        }
      }
    }

    // v96.0: Auto-unlock awakening nodes every 60 ticks
    if (state.autoBuyPerks && state.totalPlayTime % 60 === 0 && state.totalPlayTime > 0) {
      const reincCount = updatedPlayer.reincarnations ?? 0;
      if (reincCount >= AWAKENING_UNLOCK_REINC) {
        const awState = updatedPlayer.awakening ?? { unlockedNodes: [] as string[], selectedPath: null };
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
        // Greedily unlock cheapest available nodes across all paths
        let found = true;
        while (found && avail > 0) {
          found = false;
          let cheapestNode: { id: string; cost: number } | null = null;
          for (const path of AWAKENING_PATHS) {
            for (const node of path.nodes) {
              if (unlocked.has(node.id)) continue;
              if (node.requires && !unlocked.has(node.requires)) continue;
              if (node.cost <= avail && (!cheapestNode || node.cost < cheapestNode.cost)) {
                cheapestNode = { id: node.id, cost: node.cost };
              }
            }
          }
          if (cheapestNode) {
            unlocked.add(cheapestNode.id);
            avail -= cheapestNode.cost;
            changed = true;
            found = true;
          }
        }
        if (changed) {
          updatedPlayer.awakening = { ...awState, unlockedNodes: Array.from(unlocked) };
        }
      }
    }

    // v98.0: Auto-synthesize equipment every 45 ticks
    if (state.autoSynth && state.totalPlayTime % 45 === 0 && state.totalPlayTime > 0) {
      const qualityOrder: Quality[] = ['common', 'spirit', 'immortal', 'divine', 'legendary'];
      let didSynth = true;
      while (didSynth) {
        didSynth = false;
        const currentInv = get().inventory;
        // Find first quality with 3+ unlocked non-equipped items
        for (const q of qualityOrder) {
          const candidates = currentInv.filter(i => i.quality === q && !i.locked);
          if (candidates.length >= 3) {
            const uids = candidates.slice(0, 3).map(i => i.uid);
            const result = get().synthesizeEquip(uids);
            if (result.success) { didSynth = true; break; }
          }
        }
      }
    }

    // v13: Exploration daily reset
    useExplorationStore.getState().tickReset();

    // v78.0: Auto-explore dungeons
    if (state.autoExplore) {
      const explStore = useExplorationStore.getState();
      const expl = explStore.exploration;
      if (expl.currentRun && !expl.currentRun.completed) {
        // Auto-resolve next node
        const result = explStore.resolveNode();
        if (result?.reward) {
          if (result.reward.lingshi) updatedPlayer.lingshi += result.reward.lingshi;
          if (result.reward.exp) updatedPlayer.exp += result.reward.exp;
          if (result.reward.pantao) updatedPlayer.pantao += result.reward.pantao;
        }
      } else if (!expl.currentRun || expl.currentRun.completed) {
        // Auto-start new run if free runs available
        if (expl.dailyFree > 0) {
          const diff = Math.min(4, Math.max(1, Math.floor(updatedPlayer.level / 50) + 1));
          explStore.startRun(diff, updatedPlayer.lingshi);
        }
      }
    }

    // v81.0: Title unlock check (every 30 ticks)
    if (state.totalPlayTime % 30 === 0) {
      const titleStats: TitleCheckStats = {
        level: updatedPlayer.level,
        reincarnations: updatedPlayer.reincarnations ?? 0,
        totalKills: updatedPlayer.totalKills ?? 0,
        highestChapter: state.highestChapter,
        achievementCount: 0, // simplified
        equipmentCollected: (updatedPlayer.codexEquipIds ?? []).length,
        monsterCollected: (updatedPlayer.codexEnemyNames ?? []).length,
        trialBestFloor: updatedPlayer.trialBestFloor ?? 0,
        totalPlayTimeSec: state.totalPlayTime,
        awakeningPoints: updatedPlayer.awakeningPoints ?? 0,
      };
      const current = state.unlockedTitles;
      const newUnlocked = TITLES.filter(t => t.condition(titleStats)).map(t => t.id);
      if (newUnlocked.length > current.length) {
        const newlyEarned = newUnlocked.filter(id => !current.includes(id));
        const newTitle = newlyEarned.length > 0 ? TITLES.find(t => t.id === newlyEarned[0]) : null;
        set({ unlockedTitles: newUnlocked, titleToast: newTitle ? `🏅 称号解锁：${newTitle.name}` : null });
        if (newTitle) setTimeout(() => set({ titleToast: null }), 4000);
      }
    }

    // v31.0: Auto-decompose low quality items
    const adq = state.autoDecomposeQuality;
    if (adq > 0) {
      const qualityOrder = ['common', 'spirit', 'immortal', 'divine', 'legendary', 'mythic'];
      const equipped = [state.equippedWeapon?.uid, state.equippedArmor?.uid, state.equippedTreasure?.uid];
      const toDecomp = updatedInventory.filter(i => {
        const qi = qualityOrder.indexOf(i.quality);
        return qi < adq && !equipped.includes(i.uid) && !i.locked;
      });
      if (toDecomp.length > 0) {
        for (const item of toDecomp) {
          const qm = QUALITY_INFO[item.quality].multiplier;
          updatedPlayer.hongmengShards += Math.ceil(qm * (1 + item.level * 0.5));
        }
        updatedInventory = updatedInventory.filter(i => !toDecomp.some(d => d.uid === i.uid));
      }
    }

    // v76.0: Auto-breakthrough triggers tribulation (no longer bypasses 天劫)
    const autoBreakNext = REALMS[updatedPlayer.realmIndex + 1];
    if (autoBreakNext && updatedPlayer.level >= autoBreakNext.levelReq && updatedPlayer.pantao >= autoBreakNext.pantaoReq && !updatedBattle.tribulation?.active) {
      const tribNames = ['雷劫', '火劫', '风劫', '心魔', '天劫', '九天雷罚', '混沌劫', '灭世天劫', '鸿蒙劫'];
      const tribEmojis = ['[雷]', '[火]', '[风]', '[魔]', '[劫]', '[雷]', '[混]', '[灭]', '[鸿]'];
      const ri = updatedPlayer.realmIndex;
      const tribHp = Math.floor(updatedPlayer.stats.maxHp * (3 + ri * 2));
      const tribDef = Math.floor(updatedPlayer.stats.attack * 0.15 * (1 + ri * 0.3));
      const tribName = tribNames[Math.min(ri, tribNames.length - 1)];
      const tribEmoji = tribEmojis[Math.min(ri, tribEmojis.length - 1)];
      updatedPlayer = { ...updatedPlayer, pantao: updatedPlayer.pantao - autoBreakNext.pantaoReq };
      updatedBattle = { ...updatedBattle,
        currentEnemy: {
          name: tribName, emoji: tribEmoji, hp: tribHp, maxHp: tribHp, defense: tribDef,
          lingshiDrop: 0, expDrop: 0, pantaoDrop: Math.floor(autoBreakNext.pantaoReq * 0.3), isBoss: true,
        },
        isBossWave: true,
        tribulation: { active: true, realmIndex: updatedPlayer.realmIndex + 1, timer: 60 + ri * 10 },
        log: addLog(updatedBattle.log, `⚡ 自动渡劫！「${tribName}」降临 — ${60 + ri * 10}秒限时！`, 'boss'),
      };
      sfx.bossAppear();
    }

    set({
      player: updatedPlayer,
      battle: updatedBattle,
      inventory: updatedInventory.length > INVENTORY_MAX
        ? (() => {
            // Auto-decompose: remove lowest quality unlocked items
            const qualityOrder = Object.keys(QUALITY_INFO);
            const unlocked = updatedInventory.filter(i => !i.locked);
            unlocked.sort((a, b) => qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality));
            const toRemove = new Set(unlocked.slice(0, updatedInventory.length - INVENTORY_MAX).map(i => i.uid));
            // Add decompose proceeds
            for (const item of unlocked.slice(0, updatedInventory.length - INVENTORY_MAX)) {
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

  reincarnate: () => {
    const state = get();
    const { player } = state;
    if (player.realmIndex < REINC_MIN_REALM || player.level < REINC_MIN_LEVEL) return;

    const daoGain = calcDaoPoints(player.level, player.realmIndex, player.reincarnations);
    const startLevel = REINC_PERKS.find(p => p.id === 'start_level')!.effect(player.reincPerks['start_level'] ?? 0);

    // Reset player but keep permanent stuff
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
    newPlayer.activeSkills = { cooldowns: {}, buffs: {} }; // Reset cooldowns on reincarnation
    newPlayer.consumableInventory = { ...player.consumableInventory }; // Keep consumables
    newPlayer.activeConsumables = []; // Clear active buffs

    // Apply start_level perk
    if (startLevel > 0) {
      newPlayer.level = Math.max(1, startLevel);
      newPlayer.stats.attack += Math.floor(startLevel * 3.5);
      newPlayer.stats.maxHp += Math.floor(startLevel * 12);
      newPlayer.stats.hp = newPlayer.stats.maxHp;
    }

    // Apply crit perk
    const critBonus = REINC_PERKS.find(p => p.id === 'crit_flat')!.effect(player.reincPerks['crit_flat'] ?? 0);
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

    sfx.breakthrough();
  },

  buyReincPerk: (perkId: string, maxBuy?: boolean) => {
    const { player } = get();
    const perk = REINC_PERKS.find(p => p.id === perkId);
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
  },

  getReincMultiplier: (perkId: string) => {
    const { player } = get();
    const perk = REINC_PERKS.find(p => p.id === perkId);
    if (!perk) return 1;
    return perk.effect(player.reincPerks[perkId] ?? 0);
  },

  // === Equipment ===

  equipItem: (item) => {
    const state = get();
    const key = item.slot === 'weapon' ? 'equippedWeapon' : item.slot === 'armor' ? 'equippedArmor' : 'equippedTreasure';
    const current = state[key];
    let newInv = state.inventory.filter(i => i.uid !== item.uid);
    if (current) newInv.push(current);
    set({
      [key]: item,
      inventory: newInv,
      battle: { ...state.battle, log: addLog(state.battle.log, `装备 ${QUALITY_INFO[item.quality].symbol}${item.name}`, 'info') },
    } as any);
  },

  unequipSlot: (slot) => {
    const state = get();
    const key = slot === 'weapon' ? 'equippedWeapon' : slot === 'armor' ? 'equippedArmor' : 'equippedTreasure';
    const item = state[key];
    if (!item) return;
    // T-039: check inventory limit
    if (state.inventory.length >= INVENTORY_MAX) return;
    set({ [key]: null, inventory: [...state.inventory, item] } as any);
  },

  enhanceEquip: (uid, useProtect = false, useLucky = false) => {
    const state = get();

    // Find the item (equipped or inventory)
    let eq: EquipmentItem | null = null;
    let location: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' | 'inventory' = 'inventory';
    let invIdx = -1;

    for (const key of ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const) {
      if (state[key]?.uid === uid) { eq = state[key]; location = key; break; }
    }
    if (!eq) {
      invIdx = state.inventory.findIndex(i => i.uid === uid);
      if (invIdx === -1) return;
      eq = state.inventory[invIdx];
    }

    const maxLvl = getMaxEnhanceLevel(eq);
    if (eq.level >= maxLvl) return;

    const cost = getEnhanceCost(eq);
    if (state.player.lingshi < cost) return;

    const targetLevel = eq.level + 1;
    const isHigh = isHighEnhance(eq); // +11~+15 territory
    let updatedPlayer = { ...state.player, lingshi: state.player.lingshi };

    // Consume scrolls if requested
    if (isHigh && useProtect && updatedPlayer.protectScrolls > 0) {
      updatedPlayer.protectScrolls--;
    } else {
      useProtect = false; // can't use what you don't have
    }
    if (isHigh && useLucky && updatedPlayer.luckyScrolls > 0) {
      updatedPlayer.luckyScrolls--;
    } else {
      useLucky = false;
    }

    let success: boolean;
    let log = [...state.battle.log];

    if (isHigh) {
      // High-tier: variable success rate
      let rate = getHighEnhanceRate(targetLevel);
      if (useLucky) rate = Math.min(90, rate + 10);
      success = Math.random() * 100 < rate;

      if (success) {
        updatedPlayer.lingshi -= cost;
        const newItem = { ...eq, level: targetLevel };
        log = addLog(log, `高阶强化成功！${eq.name} → +${targetLevel}`, 'levelup');

        // Check hidden passive unlock
        const hidden = hasHiddenPassive(newItem);
        if (hidden) {
          log = addLog(log, `觉醒隐藏被动「${hidden.name}」：${hidden.description}`, 'levelup');
        }

        applyEnhanceResult(set, state, location, invIdx, newItem, updatedPlayer, log);
      } else {
        // Failure: consume 60% lingshi
        updatedPlayer.lingshi -= Math.floor(cost * 0.6);

        const dropLevels = useProtect ? 0 : getHighEnhanceDrop(targetLevel);
        const newLevel = Math.max(10, eq.level - dropLevels);
        const newItem = { ...eq, level: newLevel };

        if (useProtect) {
          log = addLog(log, `强化失败！护级符生效，等级保持 +${eq.level}`, 'info');
        } else {
          log = addLog(log, `强化失败！${eq.name} +${eq.level} → +${newLevel}`, 'info');
        }

        applyEnhanceResult(set, state, location, invIdx, newItem, updatedPlayer, log);
      }
    } else {
      // Standard +1~+10: always success
      success = true;
      updatedPlayer.lingshi -= cost;
      const newItem = { ...eq, level: targetLevel };
      log = addLog(log, `强化 ${eq.name} → +${targetLevel}（灵石-${cost}）`, 'info');
      applyEnhanceResult(set, state, location, invIdx, newItem, updatedPlayer, log);
    }
  },

  refineItem: (targetUid, materialUids, useTianming = false, usePity = false) => {
    const state = get();

    // Find target item (must be legendary/混沌, equipped or inventory)
    let target: EquipmentItem | null = null;
    let targetLoc: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' | 'inventory' = 'inventory';
    let targetInvIdx = -1;

    for (const key of ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const) {
      if (state[key]?.uid === targetUid) { target = state[key]; targetLoc = key; break; }
    }
    if (!target) {
      targetInvIdx = state.inventory.findIndex(i => i.uid === targetUid);
      if (targetInvIdx === -1) return;
      target = state.inventory[targetInvIdx];
    }

    if (!canRefine(target)) return;

    // Validate materials: 5 legendary items from inventory
    const materials = materialUids
      .map(uid => state.inventory.find(i => i.uid === uid))
      .filter((i): i is EquipmentItem => !!i && i.quality === 'legendary' && i.uid !== targetUid);
    if (materials.length < REFINE_MATERIAL_COUNT) return;

    const cost = getRefineCost(target);
    let updatedPlayer = { ...state.player };

    // Pity path
    if (usePity) {
      if (updatedPlayer.hongmengShards < REFINE_SHARD_PITY) return;
      if (updatedPlayer.lingshi < cost) return;

      // 100% success
      updatedPlayer.hongmengShards -= REFINE_SHARD_PITY;
      updatedPlayer.lingshi -= cost;

      // Remove materials
      const matUids = new Set(materials.slice(0, REFINE_MATERIAL_COUNT).map(m => m.uid));
      const newInv = state.inventory.filter(i => !matUids.has(i.uid));

      // Upgrade target
      const refined = { ...target, quality: 'mythic' as const };
      let log = addLog(state.battle.log, `碎片保底精炼成功！${target.name} → 鸿蒙`, 'levelup');

      if (targetLoc === 'inventory') {
        const idx = newInv.findIndex(i => i.uid === targetUid);
        if (idx >= 0) newInv[idx] = refined;
        set({ player: updatedPlayer, inventory: newInv, battle: { ...state.battle, log } });
      } else {
        set({
          player: updatedPlayer,
          [targetLoc]: refined,
          inventory: newInv,
          battle: { ...state.battle, log },
        } as any);
      }
      return;
    }

    // Normal refine path
    if (updatedPlayer.lingshi < cost) return;

    // Tianming scroll
    let rate = REFINE_BASE_RATE;
    if (useTianming && updatedPlayer.tianmingScrolls > 0) {
      updatedPlayer.tianmingScrolls--;
      rate += REFINE_TIANMING_BONUS;
    }

    const success = Math.random() * 100 < rate;
    let log = [...state.battle.log];

    if (success) {
      updatedPlayer.lingshi -= cost;

      // Remove materials
      const matUids = new Set(materials.slice(0, REFINE_MATERIAL_COUNT).map(m => m.uid));
      const newInv = state.inventory.filter(i => !matUids.has(i.uid));

      const refined = { ...target, quality: 'mythic' as const };
      log = addLog(log, `精炼成功！${target.name} → 鸿蒙`, 'levelup');

      if (targetLoc === 'inventory') {
        const idx = newInv.findIndex(i => i.uid === targetUid);
        if (idx >= 0) newInv[idx] = refined;
        set({ player: updatedPlayer, inventory: newInv, battle: { ...state.battle, log } });
      } else {
        set({
          player: updatedPlayer,
          [targetLoc]: refined,
          inventory: newInv,
          battle: { ...state.battle, log },
        } as any);
      }
    } else {
      // Failure: consume 50% lingshi, keep materials, gain shard
      updatedPlayer.lingshi -= Math.floor(cost * 0.5);
      updatedPlayer.hongmengShards += 1;
      log = addLog(log, `精炼失败！鸿蒙碎片+1 (${updatedPlayer.hongmengShards}/${REFINE_SHARD_PITY})`, 'info');
      log = addLog(log, `消耗灵石 ${Math.floor(cost * 0.5)}，材料已返还`, 'info');
      set({ player: updatedPlayer, battle: { ...state.battle, log } });
    }
  },

  buyScroll: (type) => {
    const state = get();
    const price = SCROLL_PRICES[type];
    if (state.player.pantao < price) return;
    const updatedPlayer = { ...state.player, pantao: state.player.pantao - price };
    switch (type) {
      case 'tianming': updatedPlayer.tianmingScrolls++; break;
      case 'protect': updatedPlayer.protectScrolls++; break;
      case 'lucky': updatedPlayer.luckyScrolls++; break;
    }
    const scrollName = type === 'tianming' ? '天命符' : type === 'protect' ? '护级符' : '幸运符';
    const log = addLog(state.battle.log, `购买 ${scrollName} x1（蟠桃-${price}）`, 'info');
    set({ player: updatedPlayer, battle: { ...state.battle, log } });
  },

  sellEquip: (uid) => {
    const state = get();
    const idx = state.inventory.findIndex(i => i.uid === uid);
    if (idx === -1) return;
    const eq = state.inventory[idx];
    const sellPrice = Math.floor(getEquipEffectiveStat(eq) * 2 + (eq.level + 1) * 50);
    set({
      player: { ...state.player, lingshi: state.player.lingshi + sellPrice },
      inventory: state.inventory.filter(i => i.uid !== uid),
      battle: { ...state.battle, log: addLog(state.battle.log, `卖出 ${eq.name} → 灵石+${sellPrice}`, 'info') },
    });
  },

  toggleLock: (uid) => {
    const state = get();
    set({ inventory: state.inventory.map(i => i.uid === uid ? { ...i, locked: !i.locked } : i) });
  },
  decomposeEquip: (uid) => {
    const state = get();
    const idx = state.inventory.findIndex(i => i.uid === uid);
    if (idx === -1) return;
    const eq = state.inventory[idx];
    if (eq.locked) return; // Cannot decompose locked items
    // 分解得灵石 = sellPrice * 0.6，legendary/mythic 额外得鸿蒙碎片
    const sellPrice = Math.floor(getEquipEffectiveStat(eq) * 2 + (eq.level + 1) * 50);
    const decompLingshi = Math.floor(sellPrice * 0.6);
    const updatedPlayer = { ...state.player, lingshi: state.player.lingshi + decompLingshi };
    let shardMsg = '';
    if (eq.quality === 'legendary' || eq.quality === 'mythic') {
      updatedPlayer.hongmengShards += 1;
      shardMsg = ' 碎片+1';
    }
    set({
      player: updatedPlayer,
      inventory: state.inventory.filter(i => i.uid !== uid),
      battle: { ...state.battle, log: addLog(state.battle.log, `分解 ${eq.name} → 灵石+${decompLingshi}${shardMsg}`, 'info') },
    });
  },

  batchDecompose: (uids) => {
    const state = get();
    let totalLingshi = 0;
    let totalShards = 0;
    let count = 0;
    const uidSet = new Set(uids);
    const remaining: EquipmentItem[] = [];
    for (const item of state.inventory) {
      if (uidSet.has(item.uid) && !item.locked) {
        const sellPrice = Math.floor(getEquipEffectiveStat(item) * 2 + (item.level + 1) * 50);
        totalLingshi += Math.floor(sellPrice * 0.6);
        if (item.quality === 'legendary' || item.quality === 'mythic') totalShards++;
        count++;
      } else {
        remaining.push(item);
      }
    }
    if (count === 0) return;
    const updatedPlayer = { ...state.player, lingshi: state.player.lingshi + totalLingshi, hongmengShards: state.player.hongmengShards + totalShards };
    const shardMsg = totalShards > 0 ? ` 碎片+${totalShards}` : '';
    set({
      player: updatedPlayer,
      inventory: remaining,
      battle: { ...state.battle, log: addLog(state.battle.log, `批量分解 ${count}件 → 灵石+${totalLingshi}${shardMsg}`, 'info') },
    });
  },

  autoEquipBest: () => {
    const state = get();
    let equipped = 0;
    for (const slot of ['weapon', 'armor', 'treasure'] as EquipSlot[]) {
      const key = slot === 'weapon' ? 'equippedWeapon' : slot === 'armor' ? 'equippedArmor' : 'equippedTreasure';
      const current = state[key as keyof typeof state] as EquipmentItem | null;
      const currentStat = current ? getEquipEffectiveStat(current) : 0;
      const candidates = (get().inventory as EquipmentItem[]).filter(i => i.slot === slot);
      let best: EquipmentItem | null = null;
      let bestStat = currentStat;
      for (const c of candidates) {
        const s = getEquipEffectiveStat(c);
        if (s > bestStat) { best = c; bestStat = s; }
      }
      if (best) {
        get().equipItem(best);
        equipped++;
      }
    }
    if (equipped > 0) {
      set({ battle: { ...get().battle, log: addLog(get().battle.log, `一键装备：更换了 ${equipped} 件最优装备`, 'info') } });
    }
    return equipped;
  },

  quickDecompose: (maxQuality: number) => {
    const state = get();
    const qualityOrder = Object.keys(QUALITY_INFO);
    const toDecompose = state.inventory.filter(i => qualityOrder.indexOf(i.quality) <= maxQuality);
    if (toDecompose.length === 0) return 0;
    get().batchDecompose(toDecompose.map(i => i.uid));
    return toDecompose.length;
  },

  goToChapter: (chapterId: number) => {
    const state = get();
    if (chapterId > state.highestChapter) return;
    if (chapterId === state.battle.chapterId) return;
    const ch = CHAPTERS.find(c => c.id === chapterId);
    if (!ch) return;
    const enemy = createEnemy(chapterId, 1, false)!;
    const log = addLog(state.battle.log, `传送至第${chapterId}章「${ch.name}」`, 'info');
    set({
      battle: { ...state.battle, chapterId, stageNum: 1, wave: 1, isBossWave: false, maxWaves: 3, currentEnemy: enemy, log, tribulation: undefined },
    });
  },

  sweepChapter: (chapterId: number, count: number) => {
    const state = get();
    if (chapterId >= state.highestChapter) return { gold: 0, exp: 0, items: [] as string[] };
    const ch = CHAPTERS.find(c => c.id === chapterId);
    if (!ch) return { gold: 0, exp: 0, items: [] as string[] };
    const avgLv = Math.floor((ch.levelRange[0] + ch.levelRange[1]) / 2);
    const sweepCount = Math.min(count, 10);
    let totalGold = 0, totalExp = 0;
    const droppedItems: string[] = [];
    const reincMults = {
      gold: state.player.reincPerks?.gold_mult ? (1 + state.player.reincPerks.gold_mult * 0.1) : 1,
      exp: state.player.reincPerks?.exp_mult ? (1 + state.player.reincPerks.exp_mult * 0.1) : 1,
    };
    for (let i = 0; i < sweepCount; i++) {
      const gold = Math.floor((avgLv * 5 + 10) * (1 + Math.random() * 0.5) * reincMults.gold);
      const exp = Math.floor((avgLv * 3 + 5) * (1 + Math.random() * 0.5) * reincMults.exp);
      totalGold += gold;
      totalExp += exp;
      if (Math.random() < 0.25 && state.inventory.length < INVENTORY_MAX) {
        const midStage = Math.floor((ch.stages || 50) / 2) + (chapterId - 1) * 50;
        const drop = rollEquipDrop(midStage, false);
        if (drop) {
          const item = createEquipFromTemplate(drop);
          state.inventory.push(item);
          // v51.0: Codex tracking
          if (!state.player.codexEquipIds.includes(drop.id)) {
            state.player.codexEquipIds = [...state.player.codexEquipIds, drop.id];
          }
          droppedItems.push(`${QUALITY_INFO[item.quality].label}${item.name}`);
        }
      }
    }
    const updatedPlayer = { ...state.player };
    updatedPlayer.lingshi += totalGold;
    updatedPlayer.exp += totalExp;
    while (updatedPlayer.exp >= expForLevel(updatedPlayer.level)) {
      updatedPlayer.exp -= expForLevel(updatedPlayer.level);
      updatedPlayer.level++;
    }
    const log = addLog(state.battle.log, `⚡ 扫荡「${ch.name}」×${sweepCount}：+${totalGold}灵石 +${totalExp}经验${droppedItems.length ? ' +' + droppedItems.length + '件装备' : ''}`, 'drop');
    set({ player: updatedPlayer, inventory: [...state.inventory], battle: { ...state.battle, log } });
    return { gold: totalGold, exp: totalExp, items: droppedItems };
  },

  sweepAll: () => {
    const state = get();
    let totalGold = 0, totalExp = 0;
    const allItems: string[] = [];
    let chapCount = 0;
    for (const ch of CHAPTERS) {
      if (ch.id >= state.highestChapter) continue;
      const r = get().sweepChapter(ch.id, 10);
      totalGold += r.gold;
      totalExp += r.exp;
      allItems.push(...r.items);
      chapCount++;
    }
    return { gold: totalGold, exp: totalExp, items: allItems, chapters: chapCount };
  },

  batchEnhanceEquipped: () => {
    const state = get();
    const slots = ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const;
    let totalCount = 0;
    let totalCost = 0;
    for (const slot of slots) {
      const eq = state[slot];
      if (!eq) continue;
      // Enhance up to 10 times or until fail/no gold
      for (let i = 0; i < 10; i++) {
        const s = get();
        const currentEq = s[slot];
        if (!currentEq || currentEq.level >= 10) break;
        const cost = (currentEq.level + 1) * 100;
        if (s.player.lingshi < cost) break;
        get().enhanceEquip(currentEq.uid);
        totalCount++;
        totalCost += cost;
      }
    }
    return { count: totalCount, cost: totalCost };
  },

  save: () => {
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
      autoBuyPerks: state.autoBuyPerks,
      autoSynth: state.autoSynth,
      lastWheelSpin: state.lastWheelSpin,
      equippedTitle: state.equippedTitle,
      unlockedTitles: state.unlockedTitles,
      fateBlessing: state.fateBlessing,
      onlineRewardsClaimed: state.onlineRewardsClaimed,
      completedChallenges: state.completedChallenges,
      completedChallengesDate: state.completedChallengesDate,
    } as any;
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
  },

  load: () => {
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
      // Force skip tutorial for high-level players (fix: old saves may have tutorialDone=false with high level)
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
        save.version = 4;
      }

      const enemy = createEnemy(save.battle.chapterId, save.battle.stageNum, false)!;
      const offlineSec = (Date.now() - save.lastSaveTimestamp) / 1000;

      const weapon = save.equipment?.weapon ?? null;
      const armor = save.equipment?.armor ?? null;
      const treasure = save.equipment?.treasure ?? null;
      const invSize = save.inventory?.length ?? 0;

      // v1.1: Simulation-based offline calculation
      const offline = calculateOfflineEarnings(
        offlineSec,
        save.player,
        weapon, armor, treasure,
        save.battle.chapterId, save.battle.stageNum,
        invSize,
        CHAPTERS,
      );

      // Apply offline earnings to player
      const player = {
        ...save.player,
        lingshi: save.player.lingshi + offline.lingshi,
        exp: save.player.exp + offline.exp,
        pantao: save.player.pantao + offline.pantao,
      };

      // Batch level-up after offline earnings
      while (player.exp >= expForLevel(player.level)) {
        player.exp -= expForLevel(player.level);
        player.level++;
        player.stats.attack += Math.floor(3 + player.level * 0.5);
        player.stats.maxHp += Math.floor(10 + player.level * 2);
        player.stats.hp = player.stats.maxHp;
        player.clickPower = Math.floor(5 + player.level * 0.8);
      }

      // Merge offline equipment into inventory
      const finalInventory = [...(save.inventory ?? []), ...offline.equipmentItems].slice(0, INVENTORY_MAX);

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
        highestPower: (save as any).highestPower ?? 0,
        highestAbyssFloor: (save as any).highestAbyssFloor ?? 0,
        allTimeKills: (save as any).allTimeKills ?? 0,
        claimedAbyssMilestones: (save as any).claimedAbyssMilestones ?? [],
        totalPlayTime: save.totalPlayTime,
        lastSaveTimestamp: Date.now(),
        equippedWeapon: weapon,
        equippedArmor: armor,
        equippedTreasure: treasure,
        inventory: finalInventory,
        offlineReport: report,
        battleSpeed: (save as any).battleSpeed ?? 1,
        autoDecomposeQuality: (save as any).autoDecomposeQuality ?? 0,
        autoEquipOnDrop: (save as any).autoEquipOnDrop ?? true,
        autoSkill: (save as any).autoSkill ?? false,
        autoConsume: (save as any).autoConsume ?? false,
        autoWorldBoss: (save as any).autoWorldBoss ?? false,
        autoExplore: (save as any).autoExplore ?? false,
        autoSanctuary: (save as any).autoSanctuary ?? false,
        autoAffinity: (save as any).autoAffinity ?? false,
        autoSweep: (save as any).autoSweep ?? false,
        autoFate: (save as any).autoFate ?? false,
        autoWheel: (save as any).autoWheel ?? false,
        autoTrial: (save as any).autoTrial ?? false,
        autoAscension: (save as any).autoAscension ?? false,
        autoEnhance: (save as any).autoEnhance ?? false,
        autoBuyPerks: (save as any).autoBuyPerks ?? false,
        autoSynth: (save as any).autoSynth ?? false,
        lastWheelSpin: (save as any).lastWheelSpin ?? 0,
        equippedTitle: (save as any).equippedTitle ?? null,
        unlockedTitles: (save as any).unlockedTitles ?? [],
        fateBlessing: (save as any).fateBlessing ?? { active: false, expiresAt: 0 },
        onlineRewardsClaimed: [], // reset per session
        completedChallenges: (save as any).completedChallenges ?? [],
        completedChallengesDate: (save as any).completedChallengesDate ?? '',
      });

      // Load v13 stores
      if ((save as any).sanctuary) useSanctuaryStore.getState().load((save as any).sanctuary);
      if ((save as any).exploration) useExplorationStore.getState().load((save as any).exploration);
      if ((save as any).affinity) useAffinityStore.getState().load((save as any).affinity);
    } catch {
      console.error('Failed to load save');
    }
  },

  reset: () => {
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
  },

  // ─── Multi-save slots ───
  saveToSlot: (slotId: number) => {
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
  },

  loadFromSlot: (slotId: number) => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(`xiyou-idle-slot-${slotId}`); } catch { return; }
    if (!raw) return;
    get().save();
    try { localStorage.setItem('xiyou-idle-save', raw); } catch {}
    get().load();
  },

  deleteSlot: (slotId: number) => {
    try { localStorage.removeItem(`xiyou-idle-slot-${slotId}`); } catch {}
  },

  getSaveSlots: () => {
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
  },

  advanceTutorial: () => {
    const { player } = get();
    if (player.tutorialDone) return;
    const next = player.tutorialStep + 1;
    const done = next > 5;
    set({ player: { ...player, tutorialStep: next, tutorialDone: done } });
  },

  skipTutorial: () => {
    const { player } = get();
    set({ player: { ...player, tutorialStep: 6, tutorialDone: true } });
  },

  dismissSystemTutorial: (id: string) => {
    const { player } = get();
    if (player.systemTutorials.includes(id)) return;
    set({ player: { ...player, systemTutorials: [...player.systemTutorials, id] } });
  },

  // v52.0: Active Skills
  useSkill: (skillId: string) => {
    const state = get();
    const { player, battle } = state;
    const skill = ACTIVE_SKILLS.find(s => s.id === skillId);
    if (!skill) return false;
    if (player.level < skill.unlockLevel) return false;
    const cd = player.activeSkills.cooldowns[skillId] ?? 0;
    if (cd > 0) return false;

    const newSkillState = {
      cooldowns: { ...player.activeSkills.cooldowns, [skillId]: skill.cooldown },
      buffs: { ...player.activeSkills.buffs },
    };

    if (skill.effect.type === 'shield' || skill.effect.type === 'attackBuff') {
      newSkillState.buffs[skillId] = skill.duration;
      sfx.breakthrough();
    }

    if (skill.effect.type === 'instantKill' && battle.currentEnemy) {
      // Instant kill current enemy with double rewards
      const enemy = battle.currentEnemy;
      const mul = skill.effect.value;
      const updatedPlayer = { ...player, activeSkills: newSkillState };
      updatedPlayer.lingshi += Math.floor(enemy.lingshiDrop * mul);
      updatedPlayer.exp += Math.floor(enemy.expDrop * mul);
      updatedPlayer.totalKills += 1;
      updatedPlayer.totalGoldEarned += Math.floor(enemy.lingshiDrop * mul);
      let log = [...battle.log];
      log = addLog(log, `☁️ 筋斗云！瞬杀 ${enemy.name}，获得${mul}倍奖励！`, 'boss');
      // Spawn next enemy
      const nextEnemy = createEnemy(battle.chapterId, battle.stageNum, false);
      set({
        player: updatedPlayer,
        battle: { ...battle, currentEnemy: nextEnemy, log, wave: battle.wave + 1 },
      });
      sfx.kill();
      return true;
    }

    set({ player: { ...player, activeSkills: newSkillState } });
    return true;
  },

  // v53.0 Consumables
  useConsumable: (buffId: string) => {
    const state = get();
    const player = state.player;
    const inv = player.consumableInventory ?? {};
    if ((inv[buffId] ?? 0) <= 0) return false;
    const def = getConsumable(buffId);
    if (!def) return false;
    const newInv = { ...inv, [buffId]: inv[buffId] - 1 };
    if (newInv[buffId] <= 0) delete newInv[buffId];
    // Stack: if same buff active, extend duration
    const actives = [...(player.activeConsumables ?? [])];
    const existing = actives.find(a => a.buffId === buffId);
    if (existing) {
      existing.remainingSec += def.durationSec;
    } else {
      actives.push({ buffId, remainingSec: def.durationSec });
    }
    set({ player: { ...player, consumableInventory: newInv, activeConsumables: actives } });
    return true;
  },

  addConsumable: (buffId: string, count: number) => {
    const player = get().player;
    const inv = { ...(player.consumableInventory ?? {}) };
    inv[buffId] = (inv[buffId] ?? 0) + count;
    set({ player: { ...player, consumableInventory: inv } });
  },
  updatePlayer: (partial: Partial<PlayerState>) => {
    set({ player: { ...get().player, ...partial } });
  },

  // v97.0: Equipment synthesis — 3 same-quality items → 1 higher-quality item
  synthesizeEquip: (uids: string[]) => {
    const state = get();
    if (uids.length !== 3) return { success: false, message: '需要选择3件装备' };

    const items = uids.map(uid => state.inventory.find(i => i.uid === uid)).filter(Boolean) as EquipmentItem[];
    if (items.length !== 3) return { success: false, message: '装备不存在' };
    if (items.some(i => i.locked)) return { success: false, message: '不能合成已锁定装备' };

    const quality = items[0].quality;
    if (!items.every(i => i.quality === quality)) return { success: false, message: '3件装备品质必须相同' };

    const qualityOrder: Quality[] = ['common', 'spirit', 'immortal', 'divine', 'legendary', 'mythic'];
    const qIdx = qualityOrder.indexOf(quality);
    if (qIdx >= qualityOrder.length - 1) return { success: false, message: '鸿蒙品质已是最高，无法合成' };

    const nextQuality = qualityOrder[qIdx + 1];
    // Pick random template of next quality, preferring same slot as majority input
    const slotCounts: Record<string, number> = {};
    items.forEach(i => { slotCounts[i.slot] = (slotCounts[i.slot] || 0) + 1; });
    const preferredSlot = Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0][0] as EquipSlot;

    let pool = EQUIPMENT_TEMPLATES.filter(t => t.quality === nextQuality && t.slot === preferredSlot);
    if (pool.length === 0) pool = EQUIPMENT_TEMPLATES.filter(t => t.quality === nextQuality);
    if (pool.length === 0) return { success: false, message: '没有可合成的目标装备' };

    const template = pool[Math.floor(Math.random() * pool.length)];
    const newItem = createEquipFromTemplate(template);

    // Remove 3 materials, add result
    const uidSet = new Set(uids);
    const newInventory = state.inventory.filter(i => !uidSet.has(i.uid));
    newInventory.push(newItem);

    // Update codex
    const codexEquipIds = [...state.player.codexEquipIds];
    if (!codexEquipIds.includes(newItem.templateId)) codexEquipIds.push(newItem.templateId);

    set({
      inventory: newInventory,
      player: { ...state.player, codexEquipIds },
      battle: {
        ...state.battle,
        log: addLog(state.battle.log, `合成成功！${QUALITY_INFO[quality].symbol}×3 → ${QUALITY_INFO[nextQuality].symbol}${newItem.name}`, 'levelup'),
      },
    });

    return { success: true, result: newItem, message: `合成成功！获得 ${QUALITY_INFO[nextQuality].symbol}${newItem.name}` };
  },
}));
