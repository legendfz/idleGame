/**
 * ExplorationEngine — 秘境探索：随机事件链
 */

export type EventType = 'battle' | 'treasure' | 'fortune' | 'trap' | 'merchant';
export type Difficulty = 'fan' | 'ling' | 'xian' | 'sheng';

export interface ExplorationNode {
  id: number;
  type: EventType;
  name: string;
  desc: string;
  resolved: boolean;
  reward?: { coins: number; xiuwei: number; materials?: string[] };
}

export interface ExplorationRun {
  difficulty: Difficulty;
  nodes: ExplorationNode[];
  currentNode: number;
  completed: boolean;
}

export interface ExplorationState {
  dailyFreeRuns: number;
  lastResetDay: string;
  currentRun: ExplorationRun | null;
  totalRuns: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { name: string; nodeCount: [number, number]; rewardMult: number; powerReq: number }> = {
  fan:   { name: '凡境秘境', nodeCount: [5, 6], rewardMult: 1,   powerReq: 0 },
  ling:  { name: '灵境秘境', nodeCount: [6, 7], rewardMult: 2.5, powerReq: 500 },
  xian:  { name: '仙境秘境', nodeCount: [7, 8], rewardMult: 6,   powerReq: 2000 },
  sheng: { name: '圣境秘境', nodeCount: [8, 8], rewardMult: 15,  powerReq: 8000 },
};

const EVENT_TEMPLATES: Record<EventType, { names: string[]; descs: string[] }> = {
  battle:   { names: ['妖兽拦路', '山贼伏击', '邪修偷袭'], descs: ['击败敌人获得奖励', '一场恶战', '危险的遭遇'] },
  treasure: { names: ['宝箱发现', '古墓遗宝', '灵石矿脉'], descs: ['发现了珍贵宝物', '远古宝藏', '闪闪发光的矿脉'] },
  fortune:  { names: ['仙人指路', '灵泉涌现', '祥云降临'], descs: ['获得修为加成', '灵气充沛', '天降福缘'] },
  trap:     { names: ['毒雾弥漫', '阵法困境', '落石陷阱'], descs: ['小心规避陷阱', '破阵而出', '险象环生'] },
  merchant: { names: ['游商驻留', '仙人摆摊', '黑市商人'], descs: ['可以交易物品', '珍稀商品', '来路不明的好货'] },
};

export function createExplorationState(): ExplorationState {
  return { dailyFreeRuns: 3, lastResetDay: new Date().toDateString(), currentRun: null, totalRuns: 0 };
}

export function getDifficultyConfig(d: Difficulty) { return DIFFICULTY_CONFIG[d]; }
export function getAllDifficulties(): Difficulty[] { return ['fan', 'ling', 'xian', 'sheng']; }

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const EVENT_TYPES: EventType[] = ['battle', 'treasure', 'fortune', 'trap', 'merchant'];

export function generateRun(difficulty: Difficulty): ExplorationRun {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const count = randInt(cfg.nodeCount[0], cfg.nodeCount[1]);
  const nodes: ExplorationNode[] = [];
  for (let i = 0; i < count; i++) {
    const type = pick(EVENT_TYPES);
    const tpl = EVENT_TEMPLATES[type];
    const baseReward = Math.floor((50 + i * 30) * cfg.rewardMult);
    nodes.push({
      id: i,
      type,
      name: pick(tpl.names),
      desc: pick(tpl.descs),
      resolved: false,
      reward: { coins: baseReward, xiuwei: Math.floor(baseReward * 0.8) },
    });
  }
  return { difficulty, nodes, currentNode: 0, completed: false };
}

export function resolveNode(run: ExplorationRun): { success: boolean; reward?: ExplorationNode['reward'] } {
  const node = run.nodes[run.currentNode];
  if (!node || node.resolved) return { success: false };

  // trap has 30% fail chance, others always succeed
  const success = node.type === 'trap' ? Math.random() > 0.3 : true;
  node.resolved = true;

  if (run.currentNode >= run.nodes.length - 1) {
    run.completed = true;
  } else {
    run.currentNode++;
  }

  return { success, reward: success ? node.reward : undefined };
}
