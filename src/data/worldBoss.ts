// v56.0 世界Boss数据

export interface WorldBossTemplate {
  id: string;
  name: string;
  emoji: string;
  title: string;
  baseHp: number;
  baseDefense: number;
  rewards: {
    lingshi: number;
    pantao: number;
    hongmengShards: number;
    daoPoints: number;
    trialTokens: number;
  };
}

export const WORLD_BOSSES: WorldBossTemplate[] = [
  {
    id: 'wb_niuwang',
    name: '牛魔王',
    emoji: '🐂',
    title: '平天大圣',
    baseHp: 1_000_000,
    baseDefense: 500,
    rewards: { lingshi: 50000, pantao: 20, hongmengShards: 100, daoPoints: 5, trialTokens: 10 },
  },
  {
    id: 'wb_jiutou',
    name: '九头虫',
    emoji: '🐲',
    title: '碧波潭妖王',
    baseHp: 2_000_000,
    baseDefense: 800,
    rewards: { lingshi: 80000, pantao: 35, hongmengShards: 150, daoPoints: 8, trialTokens: 15 },
  },
  {
    id: 'wb_jinchi',
    name: '金翅大鹏',
    emoji: '🦅',
    title: '狮驼岭之主',
    baseHp: 5_000_000,
    baseDefense: 1200,
    rewards: { lingshi: 150000, pantao: 60, hongmengShards: 250, daoPoints: 15, trialTokens: 25 },
  },
  {
    id: 'wb_huangmei',
    name: '黄眉大王',
    emoji: '👹',
    title: '小西天假佛',
    baseHp: 10_000_000,
    baseDefense: 2000,
    rewards: { lingshi: 300000, pantao: 100, hongmengShards: 500, daoPoints: 25, trialTokens: 40 },
  },
  {
    id: 'wb_huntian',
    name: '混天大圣',
    emoji: '🔥',
    title: '七大圣之首',
    baseHp: 50_000_000,
    baseDefense: 5000,
    rewards: { lingshi: 1000000, pantao: 300, hongmengShards: 1000, daoPoints: 50, trialTokens: 80 },
  },
];

// Boss spawns every 2 hours, lasts 30 minutes
export const WORLD_BOSS_INTERVAL = 2 * 60 * 60; // 7200 seconds
export const WORLD_BOSS_DURATION = 30 * 60; // 1800 seconds

// Which boss spawns depends on cycle count
export function getCurrentWorldBoss(nowMs: number): { boss: WorldBossTemplate; remainingSec: number; hpScale: number } | null {
  const epochSec = Math.floor(nowMs / 1000);
  const cyclePos = epochSec % WORLD_BOSS_INTERVAL;
  
  if (cyclePos >= WORLD_BOSS_DURATION) {
    return null; // Boss not active
  }
  
  const cycleNum = Math.floor(epochSec / WORLD_BOSS_INTERVAL);
  const bossIdx = cycleNum % WORLD_BOSSES.length;
  const remainingSec = WORLD_BOSS_DURATION - cyclePos;
  // HP scales with cycle number (gets harder over time)
  const hpScale = 1 + Math.floor(cycleNum / WORLD_BOSSES.length) * 0.5;
  
  return { boss: WORLD_BOSSES[bossIdx], remainingSec, hpScale };
}

export function getNextBossSpawnSec(nowMs: number): number {
  const epochSec = Math.floor(nowMs / 1000);
  const cyclePos = epochSec % WORLD_BOSS_INTERVAL;
  if (cyclePos < WORLD_BOSS_DURATION) return 0; // Boss is active now
  return WORLD_BOSS_INTERVAL - cyclePos;
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
