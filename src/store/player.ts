/**
 * PlayerStore — 玩家状态（修为、境界、资源）
 */
import { StateCreator } from 'zustand';

export interface PlayerSlice {
  xiuwei: string; // Decimal serialized
  gold: string;
  realmId: string;
  realmStage: number;
  level: number;
  characterId: string;
  // Actions
  addXiuwei: (amount: string) => void;
  addGold: (amount: string) => void;
  setRealm: (realmId: string, stage: number) => void;
}

export const createPlayerSlice: StateCreator<PlayerSlice> = (set) => ({
  xiuwei: '0',
  gold: '0',
  realmId: 'lianqi',
  realmStage: 0,
  level: 1,
  characterId: 'tangseng',
  addXiuwei: (amount) => set((s) => ({ xiuwei: String(Number(s.xiuwei) + Number(amount)) })),
  addGold: (amount) => set((s) => ({ gold: String(Number(s.gold) + Number(amount)) })),
  setRealm: (realmId, stage) => set({ realmId, realmStage: stage }),
});
