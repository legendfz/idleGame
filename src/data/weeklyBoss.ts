/**
 * v118.0「周天秘境」— Weekly Boss Rush
 * 每周重置的连续Boss挑战，5层递增难度，丰厚奖励
 */

export interface WeeklyBossFloor {
  floor: number;
  name: string;
  emoji: string;
  hpMul: number;   // multiplied by player level
  atkMul: number;
  defMul: number;
  rewards: {
    lingshi: number;  // multiplied by level
    pantao: number;
    shards: number;
    daoPoints: number;
    trialTokens: number;
  };
}

export const WEEKLY_FLOORS: WeeklyBossFloor[] = [
  {
    floor: 1, name: '白骨精', emoji: '💀',
    hpMul: 50, atkMul: 8, defMul: 3,
    rewards: { lingshi: 500, pantao: 5, shards: 10, daoPoints: 0, trialTokens: 2 },
  },
  {
    floor: 2, name: '红孩儿', emoji: '🔥',
    hpMul: 120, atkMul: 18, defMul: 8,
    rewards: { lingshi: 1200, pantao: 12, shards: 25, daoPoints: 1, trialTokens: 5 },
  },
  {
    floor: 3, name: '蜘蛛精', emoji: '🕷️',
    hpMul: 300, atkMul: 40, defMul: 20,
    rewards: { lingshi: 3000, pantao: 30, shards: 60, daoPoints: 3, trialTokens: 10 },
  },
  {
    floor: 4, name: '牛魔王', emoji: '🐂',
    hpMul: 800, atkMul: 90, defMul: 50,
    rewards: { lingshi: 8000, pantao: 80, shards: 150, daoPoints: 8, trialTokens: 20 },
  },
  {
    floor: 5, name: '混世魔王', emoji: '👹',
    hpMul: 2000, atkMul: 200, defMul: 120,
    rewards: { lingshi: 20000, pantao: 200, shards: 500, daoPoints: 20, trialTokens: 50 },
  },
];

/** Get Monday 00:00 UTC of current week */
export function getWeekStart(): number {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.getTime();
}

export function getWeekEnd(): number {
  return getWeekStart() + 7 * 24 * 60 * 60 * 1000;
}

export function getTimeUntilReset(): string {
  const ms = getWeekEnd() - Date.now();
  if (ms <= 0) return '已重置';
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours >= 24) return `${Math.floor(hours / 24)}天${hours % 24}时`;
  return `${hours}时${mins}分`;
}
