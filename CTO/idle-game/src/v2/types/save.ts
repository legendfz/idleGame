/**
 * v2.0 Save Types
 */

import { GameState } from './game';
import { EquipInstanceV2 } from './equipment';

export interface SaveDataV2 {
  version: 'v2.0';
  timestamp: number;
  game: GameState;
  equipment: {
    instances: EquipInstanceV2[];
    inventory: string[];
  };
  achievements: Record<string, { progress: number; completed: boolean; completedAt?: number }>;
  leaderboard: Record<string, { playerId: string; playerName: string; score: number; timestamp: number }[]>;
  prestige: {
    count: number;
    foyuan: number;
    permanentBonuses: Record<string, number>;
  };
}
