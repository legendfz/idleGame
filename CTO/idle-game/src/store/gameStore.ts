import { create } from 'zustand';
import { PlayerState, BattleState, BattleLogEntry, Enemy, TabId, GameSave, EquipmentItem, EquipSlot, QUALITY_INFO } from '../types';
import { REALMS } from '../data/realms';
import { CHAPTERS, createEnemy } from '../data/chapters';
import { expForLevel } from '../utils/format';
import { rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat, getActiveSetBonuses, getEnhanceCost, MAX_ENHANCE_LEVEL } from '../data/equipment';

let logIdCounter = 0;

interface EquipState {
  weapon: EquipmentItem | null;
  armor: EquipmentItem | null;
  treasure: EquipmentItem | null;
}

interface GameStore {
  // Player
  player: PlayerState;
  // Battle
  battle: BattleState;
  // Equipment
  equipment: EquipState;
  inventory: EquipmentItem[];
  // Progress
  highestChapter: number;
  highestStage: number;
  // UI
  activeTab: TabId;
  totalPlayTime: number;
  lastSaveTimestamp: number;
  offlineReport: { duration: number; lingshi: number; exp: number } | null;

  // Actions
  setTab: (tab: TabId) => void;
  tick: () => void;
  clickAttack: () => void;
  attemptBreakthrough: () => void;
  dismissOfflineReport: () => void;
  save: () => void;
  load: () => void;
  reset: () => void;

  // Equipment actions
  equipItem: (uid: string) => void;
  unequipItem: (slot: EquipSlot) => void;
  enhanceItem: (uid: string) => void;
  sellItem: (uid: string) => void;

  // Computed
  getEffectiveStats: () => { attack: number; maxHp: number; critRate: number; critDmg: number; speed: number; clickPower: number };
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
  const entry = { id: logIdCounter++, text, type, timestamp: Date.now() };
  const newLog = [entry, ...log];
  return newLog.slice(0, 30);
}

/** Compute total global stage index for drop calculations */
function getGlobalStage(chapterId: number, stageNum: number): number {
  let total = 0;
  for (const ch of CHAPTERS) {
    if (ch.id < chapterId) total += ch.stages;
    else { total += stageNum; break; }
  }
  return total;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: makeInitialPlayer(),
  battle: makeInitialBattle(),
  equipment: { weapon: null, armor: null, treasure: null },
  inventory: [],
  highestChapter: 1,
  highestStage: 1,
  activeTab: 'battle',
  totalPlayTime: 0,
  lastSaveTimestamp: Date.now(),
  offlineReport: null,

  setTab: (tab) => set({ activeTab: tab }),
  dismissOfflineReport: () => set({ offlineReport: null }),

  getEffectiveStats: () => {
    const { player, equipment } = get();
    const base = { ...player.stats };
    let clickPower = player.clickPower;

    // Add equipment stats
    const { weapon, armor, treasure } = equipment;
    if (weapon) base.attack += getEquipEffectiveStat(weapon);
    if (armor) base.maxHp += getEquipEffectiveStat(armor);

    // Add passives
    const allEquipped = [weapon, armor, treasure].filter(Boolean) as EquipmentItem[];
    for (const item of allEquipped) {
      if (item.passive) {
        switch (item.passive.type) {
          case 'critRate': base.critRate += item.passive.value; break;
          case 'critDmg': base.critDmg += item.passive.value; break;
          case 'speed': base.speed += item.passive.value; break;
          case 'clickPower': clickPower += item.passive.value; break;
        }
      }
    }

    // Set bonuses
    const setBonuses = getActiveSetBonuses(weapon, armor, treasure);
    for (const sb of setBonuses) {
      for (const bonus of sb.bonuses) {
        if (bonus.effect.attack) base.attack = Math.floor(base.attack * (1 + bonus.effect.attack));
        if (bonus.effect.maxHp) base.maxHp = Math.floor(base.maxHp * (1 + bonus.effect.maxHp));
        if (bonus.effect.critRate) base.critRate += bonus.effect.critRate;
        if (bonus.effect.critDmg) base.critDmg += bonus.effect.critDmg;
      }
    }

    return { attack: base.attack, maxHp: base.maxHp, critRate: base.critRate, critDmg: base.critDmg, speed: base.speed, clickPower };
  },

  tick: () => {
    const state = get();
    const { player, battle } = state;
    if (!battle.currentEnemy) return;

    const effectiveStats = state.getEffectiveStats();
    const enemy = { ...battle.currentEnemy };
    let log = [...battle.log];
    let updatedPlayer = { ...player, stats: { ...player.stats } };
    let updatedBattle = { ...battle };
    let newInventory = [...state.inventory];

    // Auto attack
    const isCrit = Math.random() * 100 < effectiveStats.critRate;
    let dmg = Math.max(1, effectiveStats.attack - enemy.defense);
    if (isCrit) dmg = Math.floor(dmg * effectiveStats.critDmg);

    enemy.hp -= dmg;

    if (isCrit) {
      log = addLog(log, `🐒 悟空 →→ ${enemy.emoji} ${enemy.name}  -${dmg} 💥暴击！`, 'crit');
    } else {
      log = addLog(log, `🐒 悟空 → ${enemy.emoji} ${enemy.name}  -${dmg}`, 'attack');
    }

    if (enemy.hp <= 0) {
      log = addLog(log, `${enemy.emoji} ${enemy.name} 💀 击败！`, 'kill');

      // Drops
      updatedPlayer.lingshi += enemy.lingshiDrop;
      updatedPlayer.exp += enemy.expDrop;
      log = addLog(log, `  → 🪙 +${enemy.lingshiDrop}  ✨ +${enemy.expDrop}`, 'drop');

      if (enemy.pantaoDrop > 0 && Math.random() < enemy.pantaoDrop) {
        updatedPlayer.pantao += 1;
        log = addLog(log, `  → 🍑 蟠桃 +1！`, 'drop');
      }

      // Equipment drop
      const globalStage = getGlobalStage(updatedBattle.chapterId, updatedBattle.stageNum);
      const dropTemplate = rollEquipDrop(globalStage, enemy.isBoss);
      if (dropTemplate) {
        const newItem = createEquipFromTemplate(dropTemplate);
        newInventory = [...newInventory, newItem];
        const qualityLabel = QUALITY_INFO[newItem.quality].label;
        log = addLog(log, `  → 📦 获得 ${qualityLabel} ${newItem.emoji} ${newItem.name}！`, 'drop');
      }

      // Check level up
      while (updatedPlayer.exp >= expForLevel(updatedPlayer.level)) {
        updatedPlayer.exp -= expForLevel(updatedPlayer.level);
        updatedPlayer.level += 1;
        updatedPlayer.stats.attack += Math.floor(3 + updatedPlayer.level * 0.5);
        updatedPlayer.stats.maxHp += Math.floor(10 + updatedPlayer.level * 2);
        updatedPlayer.stats.hp = updatedPlayer.stats.maxHp;
        updatedPlayer.clickPower = Math.floor(5 + updatedPlayer.level * 0.8);
        log = addLog(log, `⬆️ 升级！Lv.${updatedPlayer.level}  ⚡+${Math.floor(3 + updatedPlayer.level * 0.5)}  ❤️+${Math.floor(10 + updatedPlayer.level * 2)}`, 'levelup');
      }

      // Next wave or next stage
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
          ...updatedBattle,
          chapterId: newChapterId,
          stageNum: newStageNum,
          wave: 1,
          isBossWave: false,
          currentEnemy: newEnemy,
          log,
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

    set({
      player: updatedPlayer,
      battle: updatedBattle,
      inventory: newInventory,
      totalPlayTime: state.totalPlayTime + 1,
    });
  },

  clickAttack: () => {
    const state = get();
    const { battle } = state;
    if (!battle.currentEnemy) return;

    const effectiveStats = state.getEffectiveStats();
    const enemy = { ...battle.currentEnemy };
    let log = [...battle.log];
    const dmg = effectiveStats.clickPower;
    enemy.hp -= dmg;
    log = addLog(log, `👆 点击 → ${enemy.emoji} ${enemy.name}  -${dmg}`, 'attack');

    if (enemy.hp <= 0) {
      set({ battle: { ...battle, currentEnemy: { ...enemy, hp: 0 }, log } });
    } else {
      set({ battle: { ...battle, currentEnemy: enemy, log } });
    }
  },

  attemptBreakthrough: () => {
    const { player } = get();
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
        ...get().battle,
        log: addLog(get().battle.log, `🌟 境界突破！「${nextRealm.name}」— ${nextRealm.bonus}`, 'levelup'),
      },
    });
  },

  // Equipment actions
  equipItem: (uid: string) => {
    const { inventory, equipment } = get();
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;

    const slot = item.slot;
    const currentEquipped = equipment[slot];
    let newInventory = inventory.filter(i => i.uid !== uid);
    if (currentEquipped) {
      newInventory = [...newInventory, currentEquipped];
    }

    set({
      equipment: { ...equipment, [slot]: item },
      inventory: newInventory,
    });
  },

  unequipItem: (slot: EquipSlot) => {
    const { equipment, inventory } = get();
    const item = equipment[slot];
    if (!item) return;
    if (inventory.length >= 50) return; // inventory full

    set({
      equipment: { ...equipment, [slot]: null },
      inventory: [...inventory, item],
    });
  },

  enhanceItem: (uid: string) => {
    const { inventory, equipment, player } = get();
    // Find item in inventory or equipment
    let item: EquipmentItem | null = inventory.find(i => i.uid === uid) ?? null;
    let inSlot: EquipSlot | null = null;
    if (!item) {
      for (const slot of ['weapon', 'armor', 'treasure'] as EquipSlot[]) {
        if (equipment[slot]?.uid === uid) {
          item = equipment[slot];
          inSlot = slot;
          break;
        }
      }
    }
    if (!item || item.level >= MAX_ENHANCE_LEVEL) return;

    const cost = getEnhanceCost(item);
    if (player.lingshi < cost) return;

    const enhanced = { ...item, level: item.level + 1 };

    if (inSlot) {
      set({
        player: { ...player, lingshi: player.lingshi - cost },
        equipment: { ...equipment, [inSlot]: enhanced },
      });
    } else {
      set({
        player: { ...player, lingshi: player.lingshi - cost },
        inventory: inventory.map(i => i.uid === uid ? enhanced : i),
      });
    }
  },

  sellItem: (uid: string) => {
    const { inventory, player } = get();
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;

    const sellValue = Math.floor(getEquipEffectiveStat(item) * 2 + (item.level + 1) * 50);

    set({
      inventory: inventory.filter(i => i.uid !== uid),
      player: { ...player, lingshi: player.lingshi + sellValue },
    });
  },

  save: () => {
    const state = get();
    const save: GameSave = {
      version: 2,
      player: state.player,
      battle: {
        chapterId: state.battle.chapterId,
        stageNum: state.battle.stageNum,
        wave: state.battle.wave,
      },
      highestChapter: state.highestChapter,
      highestStage: state.highestStage,
      lastSaveTimestamp: Date.now(),
      totalPlayTime: state.totalPlayTime,
      equipment: state.equipment,
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
      const offlineLingshi = Math.floor(offlineSec * dps * 0.3);
      const offlineExp = Math.floor(offlineSec * dps * 0.2);

      const player = {
        ...save.player,
        lingshi: save.player.lingshi + offlineLingshi,
        exp: save.player.exp + offlineExp,
      };

      set({
        player,
        battle: {
          chapterId: save.battle.chapterId,
          stageNum: save.battle.stageNum,
          wave: save.battle.wave,
          maxWaves: 10,
          currentEnemy: enemy,
          log: [{ id: logIdCounter++, text: '📖 存档已加载', type: 'info', timestamp: Date.now() }],
          isAutoBattle: true,
          isBossWave: false,
        },
        highestChapter: save.highestChapter,
        highestStage: save.highestStage,
        totalPlayTime: save.totalPlayTime,
        lastSaveTimestamp: Date.now(),
        equipment: save.equipment ?? { weapon: null, armor: null, treasure: null },
        inventory: save.inventory ?? [],
        offlineReport: offlineSec > 60 ? { duration: offlineSec, lingshi: offlineLingshi, exp: offlineExp } : null,
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
      equipment: { weapon: null, armor: null, treasure: null },
      inventory: [],
      highestChapter: 1,
      highestStage: 1,
      totalPlayTime: 0,
      lastSaveTimestamp: Date.now(),
      offlineReport: null,
    });
  },
}));
