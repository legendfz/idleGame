/**
 * BattleStore — 战斗状态
 */
import { StateCreator } from 'zustand';

export interface BattleSlice {
  active: boolean;
  stageId: string;
  monsterHp: string;
  monsterMaxHp: string;
  isBoss: boolean;
  bossTimer: number;
  startBattle: (stageId: string, hp: string, isBoss: boolean) => void;
  endBattle: () => void;
  setMonsterHp: (hp: string) => void;
}

export const createBattleSlice: StateCreator<BattleSlice> = (set) => ({
  active: false,
  stageId: '',
  monsterHp: '0',
  monsterMaxHp: '0',
  isBoss: false,
  bossTimer: 0,
  startBattle: (stageId, hp, isBoss) => set({ active: true, stageId, monsterHp: hp, monsterMaxHp: hp, isBoss, bossTimer: 0 }),
  endBattle: () => set({ active: false, stageId: '', monsterHp: '0', monsterMaxHp: '0' }),
  setMonsterHp: (hp) => set({ monsterHp: hp }),
});
