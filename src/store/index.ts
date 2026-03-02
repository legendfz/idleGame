/**
 * 合并 Store — Zustand 主入口
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPlayerSlice, PlayerSlice } from './player';
import { createBattleSlice, BattleSlice } from './battle';
import { createEquipmentSlice, EquipmentSlice } from './equipment';
import { createJourneySlice, JourneySlice } from './journey';
import { createUISlice, UISlice } from './ui';

export type GameStore = PlayerSlice & BattleSlice & EquipmentSlice & JourneySlice & UISlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPlayerSlice(...a),
      ...createBattleSlice(...a),
      ...createEquipmentSlice(...a),
      ...createJourneySlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'xiyou-idle-v2',
      version: 1,
    }
  )
);

export default useGameStore;
