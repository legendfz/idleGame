import { create } from 'zustand';
import { PlayerState, BattleState, BattleLogEntry, Enemy, TabId, GameSave } from '../types';
import { REALMS } from '../data/realms';
import { CHAPTERS, createEnemy } from '../data/chapters';
import { expForLevel } from '../utils/format';

let logIdCounter = 0;

interface GameStore {
  // Player
  player: PlayerState;
  // Battle
  battle: BattleState;
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
  tick: () => void;               // main game loop (1s)
  clickAttack: () => void;
  attemptBreakthrough: () => void;
  dismissOfflineReport: () => void;
  save: () => void;
  load: () => void;
  reset: () => void;
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
  return newLog.slice(0, 30); // keep last 30
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: makeInitialPlayer(),
  battle: makeInitialBattle(),
  highestChapter: 1,
  highestStage: 1,
  activeTab: 'battle',
  totalPlayTime: 0,
  lastSaveTimestamp: Date.now(),
  offlineReport: null,

  setTab: (tab) => set({ activeTab: tab }),

  dismissOfflineReport: () => set({ offlineReport: null }),

  tick: () => {
    const { player, battle } = get();
    if (!battle.currentEnemy) return;

    const enemy = { ...battle.currentEnemy };
    let log = [...battle.log];
    let updatedPlayer = { ...player, stats: { ...player.stats } };
    let updatedBattle = { ...battle };

    // Auto attack
    const isCrit = Math.random() * 100 < player.stats.critRate;
    let dmg = Math.max(1, player.stats.attack - enemy.defense);
    if (isCrit) dmg = Math.floor(dmg * player.stats.critDmg);

    enemy.hp -= dmg;

    if (isCrit) {
      log = addLog(log, `🐒 悟空 →→ ${enemy.emoji} ${enemy.name}  -${dmg} 💥暴击！`, 'crit');
    } else {
      log = addLog(log, `🐒 悟空 → ${enemy.emoji} ${enemy.name}  -${dmg}`, 'attack');
    }

    if (enemy.hp <= 0) {
      // Enemy killed
      log = addLog(log, `${enemy.emoji} ${enemy.name} 💀 击败！`, 'kill');

      // Drops
      updatedPlayer.lingshi += enemy.lingshiDrop;
      updatedPlayer.exp += enemy.expDrop;
      log = addLog(log, `  → 🪙 +${enemy.lingshiDrop}  ✨ +${enemy.expDrop}`, 'drop');

      if (enemy.pantaoDrop > 0 && Math.random() < enemy.pantaoDrop) {
        updatedPlayer.pantao += 1;
        log = addLog(log, `  → 🍑 蟠桃 +1！`, 'drop');
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
        // Stage cleared — advance
        const nextStage = updatedBattle.stageNum + 1;
        const chapter = CHAPTERS.find(c => c.id === updatedBattle.chapterId);

        let newChapterId = updatedBattle.chapterId;
        let newStageNum = nextStage;

        if (chapter && nextStage > chapter.stages) {
          // Chapter cleared
          const nextChapter = CHAPTERS.find(c => c.id === updatedBattle.chapterId + 1);
          if (nextChapter) {
            newChapterId = nextChapter.id;
            newStageNum = 1;
            log = addLog(log, `🏆 第${chapter.id}章「${chapter.name}」通关！`, 'info');
          } else {
            // No more chapters — stay at last stage
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

        // Update highest
        const highest = get();
        const hc = newChapterId > highest.highestChapter ? newChapterId : highest.highestChapter;
        const hs = newChapterId > highest.highestChapter ? newStageNum :
          (newChapterId === highest.highestChapter && newStageNum > highest.highestStage ? newStageNum : highest.highestStage);

        set({ highestChapter: hc, highestStage: hs });
      } else {
        const nextWave = updatedBattle.wave + 1;
        if (nextWave > updatedBattle.maxWaves) {
          // Boss wave
          const boss = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, true)!;
          log = addLog(log, `═══ 🐉 BOSS: ${boss.name} ═══`, 'boss');
          updatedBattle = {
            ...updatedBattle,
            wave: nextWave,
            isBossWave: true,
            currentEnemy: boss,
            log,
          };
        } else {
          const newEnemy = createEnemy(updatedBattle.chapterId, updatedBattle.stageNum, false)!;
          updatedBattle = {
            ...updatedBattle,
            wave: nextWave,
            isBossWave: false,
            currentEnemy: newEnemy,
            log,
          };
        }
      }
    } else {
      updatedBattle = { ...updatedBattle, currentEnemy: enemy, log };
    }

    set({
      player: updatedPlayer,
      battle: updatedBattle,
      totalPlayTime: get().totalPlayTime + 1,
    });
  },

  clickAttack: () => {
    const { player, battle } = get();
    if (!battle.currentEnemy) return;

    const enemy = { ...battle.currentEnemy };
    let log = [...battle.log];
    const dmg = player.clickPower;
    enemy.hp -= dmg;
    log = addLog(log, `👆 点击 → ${enemy.emoji} ${enemy.name}  -${dmg}`, 'attack');

    set({
      battle: { ...battle, currentEnemy: enemy.hp <= 0 ? enemy : enemy, log },
    });

    // If killed, let tick handle it (enemy hp <= 0 will trigger on next tick)
    if (enemy.hp <= 0) {
      set({ battle: { ...get().battle, currentEnemy: { ...enemy, hp: 0 } } });
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

  save: () => {
    const state = get();
    const save: GameSave = {
      version: 1,
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

      // Calculate offline earnings
      const offlineSec = Math.min((Date.now() - save.lastSaveTimestamp) / 1000, 86400); // max 24h
      const dps = save.player.stats.attack; // rough estimate
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
      highestChapter: 1,
      highestStage: 1,
      totalPlayTime: 0,
      lastSaveTimestamp: Date.now(),
      offlineReport: null,
    });
  },
}));
