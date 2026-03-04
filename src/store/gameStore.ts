import { create } from 'zustand';
import { PlayerState, BattleState, BattleLogEntry, TabId, GameSave, EquipmentItem, EquipSlot, Stats, QUALITY_INFO, FloatingText, INVENTORY_MAX, OfflineReport } from '../types';
import { REALMS } from '../data/realms';
import { CHAPTERS, createEnemy, ABYSS_CHAPTER_ID } from '../data/chapters';
import { expForLevel } from '../utils/format';
import { sfx } from '../engine/audio';
import { calcDaoPoints, REINC_PERKS, REINC_MIN_REALM, REINC_MIN_LEVEL } from '../data/reincarnation';
import {
  rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat,
  getEnhanceCost, getMaxEnhanceLevel, getActiveSetBonuses,
  isHighEnhance, getHighEnhanceRate, getHighEnhanceDrop,
  canRefine, getRefineCost, REFINE_MATERIAL_COUNT, REFINE_BASE_RATE,
  REFINE_TIANMING_BONUS, REFINE_SHARD_PITY, hasHiddenPassive, hasFullMythic15,
  SCROLL_PRICES,
} from '../data/equipment';
import { calculateOfflineEarnings } from '../engine/offline';
import { useSanctuaryStore } from './sanctuaryStore';
import { useExplorationStore } from './explorationStore';
import { useAffinityStore } from './affinityStore';

let logIdCounter = 0;
let floatIdCounter = 0;

interface GameStore {
  player: PlayerState;
  battle: BattleState;
  highestChapter: number;
  highestStage: number;
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

  // Actions
  setTab: (tab: TabId) => void;
  tick: () => void;
  clickAttack: () => void;
  attemptBreakthrough: () => void;
  reincarnate: () => void;
  buyReincPerk: (perkId: string) => void;
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
  refineItem: (targetUid: string, materialUids: string[], useTianming?: boolean, usePity?: boolean) => void;
  buyScroll: (type: 'tianming' | 'protect' | 'lucky') => void;
  clearFloatingText: (id: number) => void;
  getEffectiveStats: () => Stats;
  setBattleSpeed: (speed: number) => void;
  setAutoDecomposeQuality: (quality: number) => void;
  autoEquipBest: () => number;
  quickDecompose: (maxQuality: number) => number;
  // Multi-save
  saveToSlot: (slotId: number) => void;
  loadFromSlot: (slotId: number) => void;
  deleteSlot: (slotId: number) => void;
  getSaveSlots: () => SaveSlotInfo[];
  // Tutorial
  advanceTutorial: () => void;
  skipTutorial: () => void;
  dismissSystemTutorial: (id: string) => void;
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
    totalBreakthroughs: 0,
    tutorialStep: 1,
    tutorialDone: false,
    systemTutorials: [],
    reincarnations: 0,
    daoPoints: 0,
    totalDaoPoints: 0,
    reincPerks: {},
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
  };
}

function addLog(log: BattleLogEntry[], text: string, type: BattleLogEntry['type']): BattleLogEntry[] {
  return [{ id: logIdCounter++, text, type, timestamp: Date.now() }, ...log].slice(0, 30);
}

/** Calculate effective stats including equipment + set bonuses */
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
  autoDecomposeQuality: 0,

  setTab: (tab) => set({ activeTab: tab }),
  dismissOfflineReport: () => set({ offlineReport: null }),
  setBattleSpeed: (speed) => set({ battleSpeed: speed }),
  setAutoDecomposeQuality: (quality) => set({ autoDecomposeQuality: quality }),
  clearFloatingText: (id) => set(s => ({ floatingTexts: s.floatingTexts.filter(f => f.id !== id) })),

  getEffectiveStats: () => {
    const { player, equippedWeapon, equippedArmor, equippedTreasure } = get();
    return calcEffectiveStats(player.stats, equippedWeapon, equippedArmor, equippedTreasure);
  },

  tick: () => {
    const state = get();
    const { player, battle, equippedWeapon, equippedArmor, equippedTreasure } = state;
    if (!battle.currentEnemy) return;

    const effectiveStats = calcEffectiveStats(player.stats, equippedWeapon, equippedArmor, equippedTreasure);
    const lingshiMul = getLingshiBonusMul(equippedWeapon, equippedArmor, equippedTreasure);

    // v22.0 转世加成
    const atkMul = REINC_PERKS.find(p => p.id === 'atk_mult')!.effect(player.reincPerks?.['atk_mult'] ?? 0);
    const expMul = REINC_PERKS.find(p => p.id === 'exp_mult')!.effect(player.reincPerks?.['exp_mult'] ?? 0);
    const goldMul = REINC_PERKS.find(p => p.id === 'gold_mult')!.effect(player.reincPerks?.['gold_mult'] ?? 0);
    effectiveStats.attack = Math.floor(effectiveStats.attack * atkMul);

    const enemy = { ...battle.currentEnemy };
    let log = [...battle.log];
    let updatedPlayer = { ...player, stats: { ...player.stats } };
    let updatedBattle = { ...battle };
    let updatedInventory = [...state.inventory];
    let newFloats = [...state.floatingTexts];

    // Track gold/exp/dps for idle stats
    let tickGold = 0;
    let tickExp = 0;
    let tickDmg = 0;

    // Auto attack
    const isCrit = Math.random() * 100 < effectiveStats.critRate;
    // Percentage-based defense: reduction = def / (def + 100 + level*5)
    const defReduction = enemy.defense / (enemy.defense + 100 + updatedPlayer.level * 5);
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
    } else if (isCrit) {
      log = addLog(log, `悟空 >> ${enemy.name}  -${dmg} 暴击！`, 'crit');
    } else {
      log = addLog(log, `悟空 > ${enemy.name}  -${dmg}`, 'attack');
    }

    // 记录最高伤害
    updatedPlayer.maxDamage = Math.max(updatedPlayer.maxDamage, dmg);

    if (enemy.hp <= 0) {
      updatedPlayer.totalKills++;
      log = addLog(log, `${enemy.name} 击败！`, 'kill');

      const lingshiDrop = Math.floor(enemy.lingshiDrop * lingshiMul * goldMul);
      const expDrop = Math.floor(enemy.expDrop * expMul);
      updatedPlayer.lingshi += lingshiDrop;
      updatedPlayer.exp += expDrop;
      tickGold += lingshiDrop;
      tickExp += expDrop;
      log = addLog(log, `  灵石+${lingshiDrop}  经验+${expDrop}`, 'drop');

      if (enemy.pantaoDrop > 0 && Math.random() < enemy.pantaoDrop) {
        updatedPlayer.pantao += 1;
        log = addLog(log, `  蟠桃+1！`, 'drop');
      }

      // Equipment drop (with inventory limit check — T-100 fix)
      if (updatedInventory.length < INVENTORY_MAX) {
        const globalStage = getGlobalStage(updatedBattle.chapterId, updatedBattle.stageNum);
        const eqDrop = rollEquipDrop(globalStage, enemy.isBoss);
        if (eqDrop) {
          const newItem = createEquipFromTemplate(eqDrop);
          updatedInventory.push(newItem);
          updatedPlayer.totalEquipDrops++;
          const qi = QUALITY_INFO[eqDrop.quality];
          log = addLog(log, `  获得 ${qi.symbol}${eqDrop.name}`, 'drop');
          sfx.itemDrop();
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

      // Next wave / stage
      if (updatedBattle.isBossWave) {
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
        set({ highestChapter: hc, highestStage: hs });
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

    // v13: Exploration daily reset
    useExplorationStore.getState().tickReset();

    // v31.0: Auto-decompose low quality items
    const adq = state.autoDecomposeQuality;
    if (adq > 0) {
      const qualityOrder = ['common', 'spirit', 'immortal', 'divine', 'legendary', 'mythic'];
      const equipped = [state.equippedWeapon?.uid, state.equippedArmor?.uid, state.equippedTreasure?.uid];
      const toDecomp = updatedInventory.filter(i => {
        const qi = qualityOrder.indexOf(i.quality);
        return qi < adq && !equipped.includes(i.uid);
      });
      if (toDecomp.length > 0) {
        for (const item of toDecomp) {
          const qm = QUALITY_INFO[item.quality].multiplier;
          updatedPlayer.hongmengShards += Math.ceil(qm * (1 + item.level * 0.5));
        }
        updatedInventory = updatedInventory.filter(i => !toDecomp.some(d => d.uid === i.uid));
      }
    }

    // v32.0: Auto-breakthrough when conditions met
    const autoBreakNext = REALMS[updatedPlayer.realmIndex + 1];
    if (autoBreakNext && updatedPlayer.level >= autoBreakNext.levelReq && updatedPlayer.pantao >= autoBreakNext.pantaoReq) {
      updatedPlayer = { ...updatedPlayer,
        pantao: updatedPlayer.pantao - autoBreakNext.pantaoReq,
        realmIndex: updatedPlayer.realmIndex + 1,
        totalBreakthroughs: updatedPlayer.totalBreakthroughs + 1,
        stats: { ...updatedPlayer.stats,
          attack: Math.floor(updatedPlayer.stats.attack * 1.5),
          maxHp: Math.floor(updatedPlayer.stats.maxHp * 1.5),
          hp: Math.floor(updatedPlayer.stats.maxHp * 1.5),
        },
      };
      updatedBattle = { ...updatedBattle,
        log: addLog(updatedBattle.log, `境界突破！「${autoBreakNext.name}」— ${autoBreakNext.bonus}`, 'levelup'),
      };
      sfx.breakthrough();
    }

    set({
      player: updatedPlayer,
      battle: updatedBattle,
      inventory: updatedInventory,
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
    set({
      player: {
        ...player,
        pantao: player.pantao - nextRealm.pantaoReq,
        realmIndex: player.realmIndex + 1,
        totalBreakthroughs: player.totalBreakthroughs + 1,
        stats: {
          ...player.stats,
          attack: Math.floor(player.stats.attack * 1.5),
          maxHp: Math.floor(player.stats.maxHp * 1.5),
          hp: Math.floor(player.stats.maxHp * 1.5),
        },
      },
      battle: {
        ...battle,
        log: addLog(battle.log, `境界突破！「${nextRealm.name}」— ${nextRealm.bonus}`, 'levelup'),
      },
    });
    sfx.breakthrough();
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

  buyReincPerk: (perkId: string) => {
    const { player } = get();
    const perk = REINC_PERKS.find(p => p.id === perkId);
    if (!perk) return;
    const currentLv = player.reincPerks[perkId] ?? 0;
    if (currentLv >= perk.maxLevel) return;
    if (player.daoPoints < perk.costPerLevel) return;

    set({
      player: {
        ...player,
        daoPoints: player.daoPoints - perk.costPerLevel,
        reincPerks: { ...player.reincPerks, [perkId]: currentLv + 1 },
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

  decomposeEquip: (uid) => {
    const state = get();
    const idx = state.inventory.findIndex(i => i.uid === uid);
    if (idx === -1) return;
    const eq = state.inventory[idx];
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
      if (uidSet.has(item.uid)) {
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

  save: () => {
    const state = get();
    const save: GameSave = {
      version: 4,
      player: state.player,
      battle: { chapterId: state.battle.chapterId, stageNum: state.battle.stageNum, wave: state.battle.wave },
      highestChapter: state.highestChapter,
      highestStage: state.highestStage,
      lastSaveTimestamp: Date.now(),
      totalPlayTime: state.totalPlayTime,
      equipment: { weapon: state.equippedWeapon, armor: state.equippedArmor, treasure: state.equippedTreasure },
      inventory: state.inventory,
      sanctuary: useSanctuaryStore.getState().sanctuary,
      exploration: useExplorationStore.getState().exploration,
      affinity: useAffinityStore.getState().affinity,
      battleSpeed: state.battleSpeed,
      autoDecomposeQuality: state.autoDecomposeQuality,
    } as any;
    localStorage.setItem('xiyou-idle-save', JSON.stringify(save));
    set({ lastSaveTimestamp: Date.now() });
  },

  load: () => {
    const raw = localStorage.getItem('xiyou-idle-save');
    if (!raw) return;
    try {
      const save: GameSave = JSON.parse(raw);

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
      save.player.totalKills = save.player.totalKills ?? 0;
      save.player.totalBreakthroughs = save.player.totalBreakthroughs ?? 0;
      save.player.tutorialStep = save.player.tutorialStep ?? (save.player.level > 5 ? 6 : 1);
      save.player.tutorialDone = save.player.tutorialDone ?? (save.player.level > 5);
      save.player.systemTutorials = save.player.systemTutorials ?? [];
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
          isAutoBattle: true, isBossWave: false,
        },
        highestChapter: save.highestChapter,
        highestStage: save.highestStage,
        totalPlayTime: save.totalPlayTime,
        lastSaveTimestamp: Date.now(),
        equippedWeapon: weapon,
        equippedArmor: armor,
        equippedTreasure: treasure,
        inventory: finalInventory,
        offlineReport: report,
        battleSpeed: (save as any).battleSpeed ?? 1,
        autoDecomposeQuality: (save as any).autoDecomposeQuality ?? 0,
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
    localStorage.removeItem('xiyou-idle-save');
    set({
      player: makeInitialPlayer(),
      battle: makeInitialBattle(),
      highestChapter: 1, highestStage: 1,
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
      lastSaveTimestamp: Date.now(),
      totalPlayTime: state.totalPlayTime,
      equipment: { weapon: state.equippedWeapon, armor: state.equippedArmor, treasure: state.equippedTreasure },
      inventory: state.inventory,
    };
    localStorage.setItem(`xiyou-idle-slot-${slotId}`, JSON.stringify(save));
  },

  loadFromSlot: (slotId: number) => {
    const raw = localStorage.getItem(`xiyou-idle-slot-${slotId}`);
    if (!raw) return;
    // Save current to auto-save first
    get().save();
    // Then load from slot (reuse load logic by temporarily setting localStorage)
    localStorage.setItem('xiyou-idle-save', raw);
    get().load();
  },

  deleteSlot: (slotId: number) => {
    localStorage.removeItem(`xiyou-idle-slot-${slotId}`);
  },

  getSaveSlots: () => {
    const slots: SaveSlotInfo[] = [];
    for (let i = 1; i <= 3; i++) {
      const raw = localStorage.getItem(`xiyou-idle-slot-${i}`);
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
}));
