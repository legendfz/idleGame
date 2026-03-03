/**
 * PvPEngine — 擂台系统
 */
import Decimal from 'break_infinity.js';
import { bn } from './bignum';

export interface PvpOpponent {
  name: string;
  icon: string;
  power: number;
  realmName: string;
}

export interface PvpBattleLog {
  opponent: string;
  won: boolean;
  honorChange: number;
  timestamp: number;
}

export interface PvpState {
  honor: number; // 仙誉积分
  rank: number;
  dailyAttempts: number;
  dailyResetTime: number;
  logs: PvpBattleLog[];
  weeklyResetTime: number;
}

const PVP_DAILY_LIMIT = 5;

const OPPONENT_NAMES = [
  { name: '剑圣·青云', icon: '⚔️' }, { name: '魔尊·血煞', icon: '👹' },
  { name: '仙子·紫烟', icon: '💜' }, { name: '药王·百草', icon: '🌿' },
  { name: '剑仙·御风', icon: '🌬️' }, { name: '天师·雷音', icon: '⚡' },
  { name: '妖王·白泽', icon: '🦁' }, { name: '散仙·清风', icon: '🍃' },
];

export function createPvpState(): PvpState {
  return {
    honor: 0, rank: 100, dailyAttempts: 0,
    dailyResetTime: Date.now() + 24 * 3600 * 1000,
    logs: [], weeklyResetTime: Date.now() + 7 * 24 * 3600 * 1000,
  };
}

export function generateOpponents(playerPower: number, count: number = 3): PvpOpponent[] {
  return Array.from({ length: count }, () => {
    const npc = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
    const ratio = 0.8 + Math.random() * 0.4; // ±20%
    return {
      name: npc.name, icon: npc.icon,
      power: Math.floor(playerPower * ratio),
      realmName: ratio > 1.1 ? '强' : ratio < 0.9 ? '弱' : '均',
    };
  });
}

export function simulatePvp(playerPower: number, opponentPower: number): { won: boolean; honorChange: number } {
  // 战力比决定胜负 + 10%随机
  const ratio = playerPower / Math.max(opponentPower, 1);
  const roll = Math.random();
  const won = roll < Math.min(0.95, ratio * 0.5);
  const honorChange = won ? Math.floor(10 + opponentPower / playerPower * 20) : -Math.floor(5 + Math.random() * 5);
  return { won, honorChange };
}

export function checkPvpDailyReset(state: PvpState): PvpState {
  const now = Date.now();
  if (now >= state.dailyResetTime) {
    return { ...state, dailyAttempts: 0, dailyResetTime: now + 24 * 3600 * 1000 };
  }
  return state;
}

export function calcPvpRank(honor: number): number {
  return Math.max(1, 100 - Math.floor(honor / 10));
}

export { PVP_DAILY_LIMIT };
