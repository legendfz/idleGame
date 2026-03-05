/**
 * v70.0 每日挑战系统
 * 每天刷新3个挑战，完成可领取奖励
 */

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  trackKey: 'kills' | 'gold' | 'equips' | 'enhance' | 'boss' | 'crit';
  rewardType: 'lingshi' | 'pantao' | 'shards' | 'tokens';
  rewardBase: number; // scaled by player level
}

const CHALLENGE_POOL: DailyChallenge[] = [
  { id: 'dc_kill_50', name: '斩妖除魔', description: '击杀50个敌人', icon: '⚔️', target: 50, trackKey: 'kills', rewardType: 'lingshi', rewardBase: 500 },
  { id: 'dc_kill_200', name: '百战不殆', description: '击杀200个敌人', icon: '🗡️', target: 200, trackKey: 'kills', rewardType: 'pantao', rewardBase: 5 },
  { id: 'dc_kill_500', name: '万夫不当', description: '击杀500个敌人', icon: '💀', target: 500, trackKey: 'kills', rewardType: 'shards', rewardBase: 3 },
  { id: 'dc_gold_5k', name: '聚宝纳财', description: '累计获得5000灵石', icon: '💎', target: 5000, trackKey: 'gold', rewardType: 'pantao', rewardBase: 3 },
  { id: 'dc_gold_20k', name: '富可敌国', description: '累计获得20000灵石', icon: '💰', target: 20000, trackKey: 'gold', rewardType: 'shards', rewardBase: 2 },
  { id: 'dc_equip_5', name: '兵刃入库', description: '获得5件装备', icon: '🛡️', target: 5, trackKey: 'equips', rewardType: 'lingshi', rewardBase: 800 },
  { id: 'dc_equip_15', name: '军械满仓', description: '获得15件装备', icon: '⚒️', target: 15, trackKey: 'equips', rewardType: 'pantao', rewardBase: 5 },
  { id: 'dc_enhance_5', name: '百炼成钢', description: '强化装备5次', icon: '🔨', target: 5, trackKey: 'enhance', rewardType: 'lingshi', rewardBase: 600 },
  { id: 'dc_enhance_15', name: '千锤百炼', description: '强化装备15次', icon: '⚡', target: 15, trackKey: 'enhance', rewardType: 'shards', rewardBase: 2 },
  { id: 'dc_boss_1', name: '擒贼擒王', description: '击败1个Boss', icon: '👹', target: 1, trackKey: 'boss', rewardType: 'pantao', rewardBase: 3 },
  { id: 'dc_boss_3', name: '三战三捷', description: '击败3个Boss', icon: '🐉', target: 3, trackKey: 'boss', rewardType: 'shards', rewardBase: 3 },
  { id: 'dc_crit_20', name: '一击必杀', description: '触发20次暴击', icon: '💥', target: 20, trackKey: 'crit', rewardType: 'lingshi', rewardBase: 400 },
  { id: 'dc_crit_100', name: '暴击如雨', description: '触发100次暴击', icon: '🌟', target: 100, trackKey: 'crit', rewardType: 'pantao', rewardBase: 4 },
];

/** Get today's date string YYYY-MM-DD */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Seed-based pseudo-random using date */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Get 3 daily challenges for today */
export function getDailyChallenges(): DailyChallenge[] {
  const key = todayKey();
  const seed = key.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);
  
  // Pick 3 unique challenges
  const pool = [...CHALLENGE_POOL];
  const selected: DailyChallenge[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return selected;
}

export interface DailyChallengeState {
  date: string;
  progress: Record<string, number>; // challengeId → current count
  claimed: Record<string, boolean>; // challengeId → claimed
  counters: Record<string, number>; // trackKey → session count
}

export function createFreshState(): DailyChallengeState {
  return { date: todayKey(), progress: {}, claimed: {}, counters: {} };
}

export function ensureToday(state: DailyChallengeState): DailyChallengeState {
  if (state.date !== todayKey()) return createFreshState();
  return state;
}

export function getRewardAmount(challenge: DailyChallenge, level: number): number {
  const scale = Math.max(1, Math.floor(level / 10));
  return challenge.rewardBase * scale;
}

export { todayKey };
