/**
 * StrategyStore — 战斗策略管理
 */
import { create } from 'zustand';
import { calcStrategyBuffs, canUnlockStrategy, getStrategyDef } from '../engine/strategy';
import { useUIStore } from './ui';
import { getRealmConfig } from '../data/config';
import { usePlayerStore } from './player';

interface StrategyStoreType {
  activeStrategyId: string;

  setStrategy: (id: string) => boolean;
  getBuffs: () => Record<string, number>;
  loadState: (id: string) => void;
  getState: () => string;
}

export const useStrategyStore = create<StrategyStoreType>((set, get) => ({
  activeStrategyId: 'balanced',

  setStrategy: (id) => {
    const def = getStrategyDef(id);
    if (!def) return false;
    const player = usePlayerStore.getState().player;
    const realm = getRealmConfig(player.realmId);
    if (!canUnlockStrategy(def, realm?.order ?? 1)) {
      useUIStore.getState().addToast('境界不足，无法使用此策略', 'warn');
      return false;
    }
    set({ activeStrategyId: id });
    useUIStore.getState().addToast(`⚔️ 切换至「${def.name}」`, 'info');
    return true;
  },

  getBuffs: () => calcStrategyBuffs(get().activeStrategyId),

  loadState: (id) => set({ activeStrategyId: id }),
  getState: () => get().activeStrategyId,
}));
