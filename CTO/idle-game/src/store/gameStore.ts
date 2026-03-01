import { create } from 'zustand';
import { PlayerState, BattleState, BattleLogEntry, Enemy, TabId, GameSave, EquipmentItem, EquipSlot, Stats, QUALITY_INFO, FloatingText, INVENTORY_MAX } from '../types';
import { REALMS } from '../data/realms';
import { CHAPTERS, createEnemy } from '../data/chapters';
import { expForLevel } from '../utils/format';
import {
  rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat,
  getEnhanceCost, MAX_ENHANCE_LEVEL, getActiveSetBonuses
} from '../data/equipment';

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
  idleStats: { goldPerSec: number; expPerSec: number; sessionTime: number };
  // UI
  activeTab: TabId;
  totalPlayTime: number;
  lastSaveTimestamp: number;
  offlineReport: { duration: number; lingshi: number; exp: number; equipment: string[] } | null;

  // Actions
  setTab: (tab: TabId) => void;
  tick: () => void;
  clickAttack: () => void;
  attemptBreakthrough: () => void;
  dismissOfflineReport: () => void;
  save: () => void;
  load: () => void;
  reset: () => void;
  equipItem: (item: EquipmentItem) => void;
  unequipSlot: (slot: EquipSlot) => void;
  enhanceEquip: (uid: string) => void;
  sellEquip: (uid: string) => void;
  clearFloatingText: (id: number) => void;
  getEffectiveStats: () => Stats;
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
    log: [{ id: logIdCounter++, text: `⚔️ ${enemy.emoji} ${enemy.name} 出现了！`, type: 'info', timestamp: Date.now() }],
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
  idleStats: { goldPerSec: 0, expPerSec: 0, sessionTime: 0 },
  activeTab: 'battle',
  totalPlayTime: 0,
  lastSaveTimestamp: Date.now(),
  offlineReport: null,

  setTab: (tab) => set({ activeTab: tab }),
  dismissOfflineReport: () => set({ offlineReport: null }),
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

    const enemy = { ...battle.currentEnemy };
    let log = [...battle.log];
    let updatedPlayer = { ...player, stats: { ...player.stats } };
    let updatedBattle = { ...battle };
    let updatedInventory = [...state.inventory];
    let newFloats = [...state.floatingTexts];

    // Track gold/exp for idle stats
    let tickGold = 0;
    let tickExp = 0;

    // Auto attack
    const isCrit = Math.random() * 100 < effectiveStats.critRate;
    let dmg = Math.max(1, effectiveStats.attack - enemy.defense);
    if (isCrit) dmg = Math.floor(dmg * effectiveStats.critDmg);

    enemy.hp -= dmg;

    // Floating text (P0-3)
    newFloats.push({
      id: floatIdCounter++,
      text: isCrit ? `💥 ${dmg}` : `-${dmg}`,
      type: isCrit ? 'crit' : 'normal',
      timestamp: Date.now(),
    });

    if (isCrit) {
      log = addLog(log, `🐒 悟空 →→ ${enemy.emoji} ${enemy.name}  -${dmg} 💥暴击！`, 'crit');
    } else {
      log = addLog(log, `🐒 悟空 → ${enemy.emoji} ${enemy.name}  -${dmg}`, 'attack');
    }

    if (enemy.hp <= 0) {
      log = addLog(log, `${enemy.emoji} ${enemy.name} 💀 击败！`, 'kill');

      const lingshiDrop = Math.floor(enemy.lingshiDrop * lingshiMul);
      updatedPlayer.lingshi += lingshiDrop;
      updatedPlayer.exp += enemy.expDrop;
      tickGold += lingshiDrop;
      tickExp += enemy.expDrop;
      log = addLog(log, `  → 🪙 +${lingshiDrop}  ✨ +${enemy.expDrop}`, 'drop');

      if (enemy.pantaoDrop > 0 && Math.random() < enemy.pantaoDrop) {
        updatedPlayer.pantao += 1;
        log = addLog(log, `  → 🍑 蟠桃 +1！`, 'drop');
      }

      // Equipment drop (with inventory limit check — T-100 fix)
      if (updatedInventory.length < INVENTORY_MAX) {
        const globalStage = getGlobalStage(updatedBattle.chapterId, updatedBattle.stageNum);
        const eqDrop = rollEquipDrop(globalStage, enemy.isBoss);
        if (eqDrop) {
          const newItem = createEquipFromTemplate(eqDrop);
          updatedInventory.push(newItem);
          const qi = QUALITY_INFO[eqDrop.quality];
          log = addLog(log, `  → 📦 ${qi.symbol}${eqDrop.name}`, 'drop');
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
        log = addLog(log, `⬆️ 升级！Lv.${updatedPlayer.level}  ⚡+${Math.floor(3 + updatedPlayer.level * 0.5)}  ❤️+${Math.floor(10 + updatedPlayer.level * 2)}`, 'levelup');
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
            log = addLog(log, `🏆 第${chapter.id}章「${chapter.name}」通关！`, 'info');
          } else {
            newStageNum = chapter.stages;
            log = addLog(log, `🎉 所有章节通关！继续刷最后一关`, 'info');
          }
        }

        const newEnemy = createEnemy(newChapterId, newStageNum, false)!;
        updatedBattle = {
          ...updatedBattle, chapterId: newChapterId, stageNum: newStageNum,
          wave: 1, isBossWave: false, currentEnemy: newEnemy, log,
        };
        log = addLog(log, `⚔️ ${newEnemy.emoji} ${newEnemy.name} 出现了！`, 'info');

        const hc = newChapterId > state.highestChapter ? newChapterId : state.highestChapter;
        const hs = newChapterId > state.highestChapter ? newStageNum :
          (newChapterId === state.highestChapter && newStageNum > state.highestStage ? newStageNum : state.highestStage);
        set({ highestChapter: hc, highestStage: hs });
      } else {
        const nextWave = updatedBattle.wave + 1;
        if (nextWave > updatedBattle.maxWaves) {
          const boss = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, true)!;
          log = addLog(log, `═══ 🐉 BOSS: ${boss.name} ═══`, 'boss');
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

    set({
      player: updatedPlayer,
      battle: updatedBattle,
      inventory: updatedInventory,
      floatingTexts: newFloats.slice(-10), // keep max 10
      idleStats: { goldPerSec, expPerSec, sessionTime },
      totalPlayTime: state.totalPlayTime + 1,
    });
  },

  clickAttack: () => {
    const { player, battle, equippedTreasure, floatingTexts } = get();
    if (!battle.currentEnemy) return;
    const enemy = { ...battle.currentEnemy };
    const cp = calcClickPower(player.clickPower, equippedTreasure);
    enemy.hp -= cp;
    const log = addLog([...battle.log], `👆 点击 → ${enemy.emoji} ${enemy.name}  -${cp}`, 'attack');
    const newFloat: FloatingText = {
      id: floatIdCounter++,
      text: `👆 ${cp}`,
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
        stats: {
          ...player.stats,
          attack: Math.floor(player.stats.attack * 1.5),
          maxHp: Math.floor(player.stats.maxHp * 1.5),
          hp: Math.floor(player.stats.maxHp * 1.5),
        },
      },
      battle: {
        ...battle,
        log: addLog(battle.log, `🌟 境界突破！「${nextRealm.name}」— ${nextRealm.bonus}`, 'levelup'),
      },
    });
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
      battle: { ...state.battle, log: addLog(state.battle.log, `🔧 装备 ${QUALITY_INFO[item.quality].symbol}${item.name}`, 'info') },
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

  enhanceEquip: (uid) => {
    const state = get();
    for (const key of ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const) {
      const eq = state[key];
      if (eq && eq.uid === uid) {
        if (eq.level >= MAX_ENHANCE_LEVEL) return;
        const cost = getEnhanceCost(eq);
        if (state.player.lingshi < cost) return;
        set({
          player: { ...state.player, lingshi: state.player.lingshi - cost },
          [key]: { ...eq, level: eq.level + 1 },
          battle: { ...state.battle, log: addLog(state.battle.log, `⬆️ 强化 ${eq.emoji}${eq.name} → +${eq.level + 1}（🪙-${cost}）`, 'info') },
        } as any);
        return;
      }
    }
    const idx = state.inventory.findIndex(i => i.uid === uid);
    if (idx === -1) return;
    const eq = state.inventory[idx];
    if (eq.level >= MAX_ENHANCE_LEVEL) return;
    const cost = getEnhanceCost(eq);
    if (state.player.lingshi < cost) return;
    const newInv = [...state.inventory];
    newInv[idx] = { ...eq, level: eq.level + 1 };
    set({
      player: { ...state.player, lingshi: state.player.lingshi - cost },
      inventory: newInv,
      battle: { ...state.battle, log: addLog(state.battle.log, `⬆️ 强化 ${eq.emoji}${eq.name} → +${eq.level + 1}（🪙-${cost}）`, 'info') },
    });
  },

  sellEquip: (uid) => {
    const state = get();
    const idx = state.inventory.findIndex(i => i.uid === uid);
    if (idx === -1) return;
    const eq = state.inventory[idx];
    // T-049: sell price = effectiveStat * 2 + (level+1) * 50
    const sellPrice = Math.floor(getEquipEffectiveStat(eq) * 2 + (eq.level + 1) * 50);
    set({
      player: { ...state.player, lingshi: state.player.lingshi + sellPrice },
      inventory: state.inventory.filter(i => i.uid !== uid),
      battle: { ...state.battle, log: addLog(state.battle.log, `💰 卖出 ${eq.emoji}${eq.name} → 🪙+${sellPrice}`, 'info') },
    });
  },

  save: () => {
    const state = get();
    const save: GameSave = {
      version: 2,
      player: state.player,
      battle: { chapterId: state.battle.chapterId, stageNum: state.battle.stageNum, wave: state.battle.wave },
      highestChapter: state.highestChapter,
      highestStage: state.highestStage,
      lastSaveTimestamp: Date.now(),
      totalPlayTime: state.totalPlayTime,
      equipment: { weapon: state.equippedWeapon, armor: state.equippedArmor, treasure: state.equippedTreasure },
      inventory: state.inventory,
    };
    localStorage.setItem('xiyou-idle-save', JSON.stringify(save));
    set({ lastSaveTimestamp: Date.now() });
  },

  load: () => {
    const raw = localStorage.getItem('xiyou-idle-save');
    if (!raw) return;
    try {
      const save: GameSave = JSON.parse(raw);
      const enemy = createEnemy(save.battle.chapterId, save.battle.stageNum, false)!;

      const offlineSec = Math.min((Date.now() - save.lastSaveTimestamp) / 1000, 86400);
      const dps = save.player.stats.attack;
      const offlineLingshi = Math.floor(offlineSec * dps * 0.5); // PRD: 50% efficiency
      const offlineExp = Math.floor(offlineSec * dps * 0.3);

      // P0-4: Offline equipment drops
      const offlineEquipment: string[] = [];
      if (offlineSec > 60) {
        const estimatedBossKills = Math.floor(offlineSec / 120); // ~1 boss per 2 min
        const globalStage = getGlobalStage(save.battle.chapterId, save.battle.stageNum);
        const offlineInv = save.inventory ? [...save.inventory] : [];
        for (let i = 0; i < estimatedBossKills && offlineInv.length < INVENTORY_MAX; i++) {
          const drop = rollEquipDrop(globalStage, true);
          if (drop) {
            offlineInv.push(createEquipFromTemplate(drop));
            offlineEquipment.push(`${QUALITY_INFO[drop.quality].symbol}${drop.name}`);
          }
        }
        save.inventory = offlineInv;
      }

      const player = { ...save.player, lingshi: save.player.lingshi + offlineLingshi, exp: save.player.exp + offlineExp };

      set({
        player,
        battle: {
          chapterId: save.battle.chapterId, stageNum: save.battle.stageNum,
          wave: save.battle.wave, maxWaves: 10, currentEnemy: enemy,
          log: [{ id: logIdCounter++, text: '📖 存档已加载', type: 'info', timestamp: Date.now() }],
          isAutoBattle: true, isBossWave: false,
        },
        highestChapter: save.highestChapter,
        highestStage: save.highestStage,
        totalPlayTime: save.totalPlayTime,
        lastSaveTimestamp: Date.now(),
        equippedWeapon: save.equipment?.weapon ?? null,
        equippedArmor: save.equipment?.armor ?? null,
        equippedTreasure: save.equipment?.treasure ?? null,
        inventory: save.inventory ?? [],
        offlineReport: offlineSec > 60 ? { duration: offlineSec, lingshi: offlineLingshi, exp: offlineExp, equipment: offlineEquipment } : null,
      });
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
      idleStats: { goldPerSec: 0, expPerSec: 0, sessionTime: 0 },
      totalPlayTime: 0, lastSaveTimestamp: Date.now(), offlineReport: null,
    });
  },
}));
