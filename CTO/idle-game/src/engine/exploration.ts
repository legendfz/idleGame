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
  reward?: { lingshi?: number; exp?: number; pantao?: number };
  damage?: number; // trap
}

export interface ExplorationRun {
  difficulty: number; // 1-4
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

const DAILY_FREE = 3;
const EXTRA_COST = 500; // lingshi

const EVENT_POOL: Omit<ExplorationNode, 'id' | 'resolved'>[] = [
  { type: 'battle', name: '妖兽袭击', icon: '👹', desc: '击败妖兽获得奖励', reward: { lingshi: 200, exp: 100 } },
  { type: 'battle', name: '山贼拦路', icon: '🗡️', desc: '击退山贼', reward: { lingshi: 150, exp: 80 } },
  { type: 'treasure', name: '宝箱', icon: '📦', desc: '发现藏宝', reward: { lingshi: 300, pantao: 1 } },
  { type: 'treasure', name: '灵泉', icon: '💧', desc: '灵泉恢复', reward: { exp: 200 } },
  { type: 'fortune', name: '仙人指路', icon: '🧙', desc: '获得仙人赐福', reward: { exp: 300, lingshi: 100 } },
  { type: 'fortune', name: '灵根觉醒', icon: '🌱', desc: '灵根品质提升', reward: { exp: 500 } },
  { type: 'trap', name: '毒雾陷阱', icon: '☠️', desc: '中毒受伤', damage: 50, reward: { lingshi: 50 } },
  { type: 'trap', name: '落石机关', icon: '🪨', desc: '被落石砸中', damage: 80, reward: { lingshi: 30 } },
  { type: 'merchant', name: '行脚商人', icon: '🧳', desc: '以灵石交换物品', reward: { pantao: 1 } },
  { type: 'merchant', name: '炼丹师', icon: '⚗️', desc: '获得丹药', reward: { exp: 150, lingshi: 50 } },
];

export function createExplorationState(): ExplorationState {
  return { dailyFree: DAILY_FREE, dailyResetTime: Date.now() + 86400000, currentRun: null, totalRuns: 0 };
}

export function generateRun(difficulty: number): ExplorationRun {
  const count = 5 + Math.floor(Math.random() * 4); // 5-8
  const mul = difficulty;
  const nodes: ExplorationNode[] = Array.from({ length: count }, (_, i) => {
    const template = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
    return {
      ...template, id: i, resolved: false,
      reward: template.reward ? {
        lingshi: (template.reward.lingshi ?? 0) * mul,
        exp: (template.reward.exp ?? 0) * mul,
        pantao: template.reward.pantao,
      } : undefined,
      damage: template.damage ? template.damage * mul : undefined,
    };
  });
  return { difficulty, nodes, currentIndex: 0, completed: false };
}

export function getPowerThreshold(difficulty: number): number {
  return [0, 100, 500, 2000, 10000][difficulty] ?? 0;
}

export { DAILY_FREE, EXTRA_COST };
