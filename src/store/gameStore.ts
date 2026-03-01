/**
 * Zustand 游戏状态 Store
 * 单一 store，persist 到 localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Monster } from '../data/monsters';
import type { Quality, EquipSlot } from '../data/equipment';

/** 装备实例 */
export interface EquipmentItem {
  id: string;
  templateId: string;
  name: string;
  slot: EquipSlot;
  quality: Quality;
  baseStat: number;
  level: number;
}

/** 战斗日志条目 */
export interface BattleLogEntry {
  text: string;
  timestamp: number;
}

export interface GameState {
  // === 角色 ===
  level: number;
  exp: number;
  gold: number;
  peaches: number;
  realmIndex: number;

  // === 属性 ===
  baseAttack: number;
  baseHp: number;
  maxHp: number;
  currentHp: number;
  speed: number;
  critRate: number;
  critDamage: number;
  clickPower: number;

  // === 关卡进度 ===
  currentStage: number;       // 全局关卡索引
  maxStage: number;           // 最高通关关卡
  currentWave: number;        // 当前波次 0-9, 10=Boss
  currentEnemy: Monster | null;

  // === 装备 ===
  equippedWeapon: EquipmentItem | null;
  equippedArmor: EquipmentItem | null;
  inventory: EquipmentItem[];

  // === 战斗日志 ===
  battleLog: BattleLogEntry[];

  // === 存档 ===
  lastSaveTime: number;
  totalPlayTime: number;

  // === 离线报告 ===
  offlineReport: {
    show: boolean;
    duration: number;
    gold: number;
    exp: number;
    kills: number;
  } | null;

  // === Actions ===
  setEnemy: (enemy: Monster | null) => void;
  damageEnemy: (dmg: number) => void;
  addGold: (amount: number) => void;
  addExp: (amount: number) => void;
  addPeaches: (amount: number) => void;
  levelUp: (newLevel: number, atkGain: number, hpGain: number) => void;
  advanceWave: () => void;
  advanceStage: () => void;
  setRealmIndex: (idx: number) => void;
  addBattleLog: (text: string) => void;
  equipItem: (item: EquipmentItem) => void;
  addToInventory: (item: EquipmentItem) => void;
  updateSaveTime: () => void;
  setOfflineReport: (report: GameState['offlineReport']) => void;
  clickAttack: () => void;
  resetEnemy: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // 初始状态
      level: 1,
      exp: 0,
      gold: 0,
      peaches: 0,
      realmIndex: 0,

      baseAttack: 10,
      baseHp: 100,
      maxHp: 100,
      currentHp: 100,
      speed: 1,
      critRate: 5,
      critDamage: 1.5,
      clickPower: 1,

      currentStage: 0,
      maxStage: 0,
      currentWave: 0,
      currentEnemy: null,

      equippedWeapon: null,
      equippedArmor: null,
      inventory: [],

      battleLog: [],

      lastSaveTime: Date.now(),
      totalPlayTime: 0,

      offlineReport: null,

      // Actions
      setEnemy: (enemy) => set({ currentEnemy: enemy }),

      damageEnemy: (dmg) => set((s) => {
        if (!s.currentEnemy) return {};
        const newHp = Math.max(0, s.currentEnemy.hp - dmg);
        return {
          currentEnemy: { ...s.currentEnemy, hp: newHp },
        };
      }),

      addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
      addExp: (amount) => set((s) => ({ exp: s.exp + amount })),
      addPeaches: (amount) => set((s) => ({ peaches: s.peaches + amount })),

      levelUp: (newLevel, atkGain, hpGain) => set((s) => ({
        level: newLevel,
        baseAttack: s.baseAttack + atkGain,
        baseHp: s.baseHp + hpGain,
        maxHp: s.maxHp + hpGain,
        currentHp: s.currentHp + hpGain, // 升级回血
      })),

      advanceWave: () => set((s) => ({ currentWave: s.currentWave + 1 })),

      advanceStage: () => set((s) => ({
        currentStage: s.currentStage + 1,
        maxStage: Math.max(s.maxStage, s.currentStage + 1),
        currentWave: 0,
      })),

      setRealmIndex: (idx) => set({ realmIndex: idx }),

      addBattleLog: (text) => set((s) => ({
        battleLog: [
          { text, timestamp: Date.now() },
          ...s.battleLog.slice(0, 49), // 保留最近50条
        ],
      })),

      equipItem: (item) => set((s) => {
        if (item.slot === 'weapon') {
          const old = s.equippedWeapon;
          return {
            equippedWeapon: item,
            inventory: old
              ? [...s.inventory.filter(i => i.id !== item.id), old]
              : s.inventory.filter(i => i.id !== item.id),
          };
        } else {
          const old = s.equippedArmor;
          return {
            equippedArmor: item,
            inventory: old
              ? [...s.inventory.filter(i => i.id !== item.id), old]
              : s.inventory.filter(i => i.id !== item.id),
          };
        }
      }),

      addToInventory: (item) => set((s) => ({
        inventory: [...s.inventory, item],
      })),

      updateSaveTime: () => set({ lastSaveTime: Date.now() }),

      setOfflineReport: (report) => set({ offlineReport: report }),

      clickAttack: () => {
        const s = get();
        if (!s.currentEnemy || s.currentEnemy.hp <= 0) return;
        const dmg = Math.max(1, s.clickPower);
        s.damageEnemy(dmg);
        s.addBattleLog(`👆 点击攻击 -${dmg}`);
      },

      resetEnemy: () => set({ currentEnemy: null }),
    }),
    {
      name: 'idle-xiyou-save',
      version: 1,
    }
  )
);
