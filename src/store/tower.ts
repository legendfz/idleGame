/**
 * TowerStore — 通天塔状态管理
 */
import { create } from 'zustand';
import {
  TowerState, createTowerState, checkTowerDailyReset,
  simulateTowerBattle, calcTowerReward, calcTowerSweep, TOWER_DAILY_LIMIT,
} from '../engine/tower';
import { usePlayerStore } from './player';
import { useMaterialStore } from './material';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';
import { getRealmConfig } from '../data/config';

interface TowerStoreType {
  state: TowerState;

  challenge: () => { success: boolean; floorReached: number } | null;
  sweep: () => void;
  tickReset: () => void;
  loadState: (s: TowerState) => void;
  getState: () => TowerState;
}

export const useTowerStore = create<TowerStoreType>((set, get) => ({
  state: createTowerState(),

  challenge: () => {
    const st = get().state;
    if (st.dailyAttempts >= TOWER_DAILY_LIMIT) {
      useUIStore.getState().addToast('今日挑战次数已用完', 'warn');
      return null;
    }

    const player = usePlayerStore.getState().player;
    const realm = getRealmConfig(player.realmId);
    const power = bn(player.totalXiuwei).div(100).add(player.totalKills * 10).mul(realm?.multiplier ?? 1);

    const floor = st.currentFloor;
    const { success, enemy } = simulateTowerBattle(floor, power);

    if (success) {
      const reward = calcTowerReward(floor, enemy.isBoss);
      if (reward.coins > 0) usePlayerStore.getState().addCoins(bn(reward.coins));
      if (reward.lingshi > 0) usePlayerStore.getState().addLingshi(reward.lingshi);
      reward.materials.forEach(m => useMaterialStore.getState().addMaterial(m.id, m.count));

      const newHighest = Math.max(st.highestFloor, floor);
      set({
        state: {
          ...st,
          currentFloor: floor + 1,
          highestFloor: newHighest,
          dailyAttempts: st.dailyAttempts + 1,
        },
      });
      useUIStore.getState().addToast(`⚔️ 通天塔第${floor}层通关！`, 'success');
      return { success: true, floorReached: floor };
    } else {
      set({ state: { ...st, dailyAttempts: st.dailyAttempts + 1 } });
      useUIStore.getState().addToast(`💀 第${floor}层挑战失败 — ${enemy.name}`, 'warn');
      return { success: false, floorReached: floor };
    }
  },

  sweep: () => {
    const st = get().state;
    if (st.highestFloor <= 0) {
      useUIStore.getState().addToast('需先手动通关至少1层', 'warn');
      return;
    }
    const reward = calcTowerSweep(st.highestFloor, st.highestFloor);
    if (reward.coins > 0) usePlayerStore.getState().addCoins(bn(reward.coins));
    if (reward.lingshi > 0) usePlayerStore.getState().addLingshi(reward.lingshi);
    reward.materials.forEach(m => useMaterialStore.getState().addMaterial(m.id, m.count));
    useUIStore.getState().addToast(`🧹 扫荡${st.highestFloor}层完成！`, 'success');
  },

  tickReset: () => {
    const st = get().state;
    const newSt = checkTowerDailyReset(st);
    if (newSt !== st) set({ state: newSt });
  },

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
