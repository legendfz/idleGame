/**
 * v2.0 Battle Store — placeholder
 */

import { create } from 'zustand';
import { BattleState } from '../types/battle';

interface BattleStore {
  battle: BattleState | null;
  setBattle: (b: BattleState | null) => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  battle: null,
  setBattle: (b) => set({ battle: b }),
}));
