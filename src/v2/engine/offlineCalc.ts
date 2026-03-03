/**
 * v2.0 Offline Calculation — placeholder
 */

import { GameState } from '../types';
import { getCultivationPerSec } from './gameLoop';
import { D, mul, toDecStr } from '../utils/bignum';

export interface OfflineReportV2 {
  duration: number;
  cultivation: string;
  gold: string;
}

const MAX_OFFLINE_HOURS = 24;
const OFFLINE_EFFICIENCY = 0.5;

export function calculateOfflineEarnings(offlineSeconds: number, state: GameState): OfflineReportV2 {
  const capped = Math.min(offlineSeconds, MAX_OFFLINE_HOURS * 3600);
  if (capped < 60) return { duration: capped, cultivation: '0', gold: '0' };

  const cps = getCultivationPerSec(state);
  const cultivation = mul(mul(cps, String(capped)), String(OFFLINE_EFFICIENCY));
  // TODO: gold calculation based on journey stage
  const gold = D(0);

  return {
    duration: capped,
    cultivation: toDecStr(cultivation),
    gold: toDecStr(gold),
  };
}
