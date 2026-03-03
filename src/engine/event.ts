/**
 * EventEngine — 限时活动系统
 */

export type EventType = 'cultivationBoost' | 'bossRush' | 'gatherFest';

export interface GameEvent {
  id: string;
  name: string;
  icon: string;
  type: EventType;
  desc: string;
  multiplier: number; // 加成倍率
  startTime: number;
  endTime: number;
}

// === 活动模板 ===
const EVENT_TEMPLATES: Omit<GameEvent, 'id' | 'startTime' | 'endTime'>[] = [
  { name: '修炼狂潮', icon: '🧘', type: 'cultivationBoost', desc: '修为获取×2', multiplier: 2 },
  { name: '猎魔盛宴', icon: '⚔️', type: 'bossRush', desc: '战斗奖励×2,功德×3', multiplier: 2 },
  { name: '灵材丰收', icon: '🌿', type: 'gatherFest', desc: '采集速度×2,产出×1.5', multiplier: 1.5 },
];

const EVENT_DURATION = 4 * 3600 * 1000; // 4小时
const EVENT_CYCLE = 24 * 3600 * 1000;   // 每24小时检查

// === Engine ===

export interface EventState {
  current: GameEvent | null;
  lastCheckTime: number;
  history: string[]; // 最近10个event id
}

export function createEventState(): EventState {
  return { current: null, lastCheckTime: Date.now(), history: [] };
}

/**
 * 检查是否应生成新活动
 */
export function checkEventTick(state: EventState, now: number): EventState {
  // 当前活动是否结束
  if (state.current && now >= state.current.endTime) {
    return { ...state, current: null };
  }

  // 有活动运行中，不生成新的
  if (state.current) return state;

  // 每24小时随机一次
  if (now - state.lastCheckTime < EVENT_CYCLE) return state;

  // 随机生成（70%概率）
  if (Math.random() > 0.7) {
    return { ...state, lastCheckTime: now };
  }

  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  const event: GameEvent = {
    ...template,
    id: `evt_${now}`,
    startTime: now,
    endTime: now + EVENT_DURATION,
  };

  return {
    current: event,
    lastCheckTime: now,
    history: [...state.history.slice(-9), event.id],
  };
}

/**
 * 获取当前活动对特定类型的加成倍率
 */
export function getEventMultiplier(state: EventState, type: EventType): number {
  if (!state.current || state.current.type !== type) return 1;
  if (Date.now() > state.current.endTime) return 1;
  return state.current.multiplier;
}
