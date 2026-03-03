/**
 * ExplorationEngine — 秘境探索: 随机事件链
 */

export type EventType = 'battle' | 'treasure' | 'fortune' | 'trap' | 'merchant';

export interface ExplorationNode {
  id: number;
  type: EventType;
  name: string;
  icon: string;
  desc: string;
  resolved: boolean;
  reward?: { coins?: number; xiuwei?: number; merit?: number };
  damage?: number;
}

export interface ExplorationRun {
  difficulty: number;
  nodes: ExplorationNode[];
  currentIndex: number;
  completed: boolean;
}

export interface ExplorationState {
  dailyFree: number;
  dailyResetTime: number;
  currentRun: ExplorationRun | null;
  totalRuns: number;
}

export const DAILY_FREE = 3;
export const EXTRA_COST = 500;

const EVENT_POOL: Omit<ExplorationNode, 'id' | 'resolved'>[] = [
  { type: 'battle', name: '妖兽袭击', icon: '👹', desc: '击败妖兽获得奖励', reward: { coins: 200, xiuwei: 100 } },
  { type: 'battle', name: '山贼拦路', icon: '🗡️', desc: '击退山贼', reward: { coins: 150, xiuwei: 80 } },
  { type: 'treasure', name: '宝箱', icon: '📦', desc: '发现藏宝', reward: { coins: 300, merit: 5 } },
  { type: 'treasure', name: '灵泉', icon: '💧', desc: '灵泉恢复', reward: { xiuwei: 200 } },
  { type: 'fortune', name: '仙人指路', icon: '🧙', desc: '仙人赐福', reward: { xiuwei: 300, coins: 100 } },
  { type: 'fortune', name: '灵根觉醒', icon: '🌱', desc: '灵根品质提升', reward: { xiuwei: 500 } },
  { type: 'trap', name: '毒雾陷阱', icon: '☠️', desc: '中毒受伤', damage: 50, reward: { coins: 50 } },
  { type: 'trap', name: '落石机关', icon: '🪨', desc: '被落石砸中', damage: 80, reward: { coins: 30 } },
  { type: 'merchant', name: '行脚商人', icon: '🧳', desc: '交换物品', reward: { merit: 10 } },
  { type: 'merchant', name: '炼丹师', icon: '⚗️', desc: '获得丹药', reward: { xiuwei: 150, coins: 50 } },
];

export function createExplorationState(): ExplorationState {
  return { dailyFree: DAILY_FREE, dailyResetTime: Date.now() + 86400000, currentRun: null, totalRuns: 0 };
}

export function generateRun(difficulty: number): ExplorationRun {
  const count = 5 + Math.floor(Math.random() * 4);
  const nodes: ExplorationNode[] = Array.from({ length: count }, (_, i) => {
    const t = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
    return {
      ...t, id: i, resolved: false,
      reward: t.reward ? {
        coins: (t.reward.coins ?? 0) * difficulty,
        xiuwei: (t.reward.xiuwei ?? 0) * difficulty,
        merit: (t.reward.merit ?? 0) * difficulty,
      } : undefined,
      damage: t.damage ? t.damage * difficulty : undefined,
    };
  });
  return { difficulty, nodes, currentIndex: 0, completed: false };
}

export function getPowerThreshold(difficulty: number): number {
  return [0, 100, 500, 2000, 10000][difficulty] ?? 0;
}
