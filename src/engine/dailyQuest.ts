/**
 * DailyQuestEngine — 每日任务池 + 随机抽取 + 进度追踪
 * 每日00:00本地时间重置
 */

export interface DailyQuestDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  target: number;
  trackType: DailyTrackType;
  reward: { coins?: number; materials?: { id: string; count: number } };
}

export type DailyTrackType =
  | 'kills' | 'clicks' | 'breakthroughs' | 'forges' | 'gathers'
  | 'dungeons' | 'smelts' | 'xiuwei' | 'stages';

export interface DailyQuestState {
  date: string;           // YYYY-MM-DD
  quests: DailyQuestInstance[];
}

export interface DailyQuestInstance {
  defId: string;
  progress: number;
  claimed: boolean;
}

// === 任务池 ===

const QUEST_POOL: DailyQuestDef[] = [
  { id: 'dq_kill_10', name: '日行一善', desc: '击杀10个妖怪', icon: '⚔️', target: 10, trackType: 'kills', reward: { coins: 500 } },
  { id: 'dq_kill_50', name: '斩妖除魔', desc: '击杀50个妖怪', icon: '💀', target: 50, trackType: 'kills', reward: { coins: 2000 } },
  { id: 'dq_click_100', name: '勤修苦练', desc: '点击100次', icon: '👆', target: 100, trackType: 'clicks', reward: { coins: 300 } },
  { id: 'dq_click_500', name: '铁杵磨针', desc: '点击500次', icon: '🔨', target: 500, trackType: 'clicks', reward: { coins: 1500 } },
  { id: 'dq_break_1', name: '百尺竿头', desc: '突破1次', icon: '⬆️', target: 1, trackType: 'breakthroughs', reward: { coins: 1000 } },
  { id: 'dq_forge_1', name: '锻造日课', desc: '锻造1次', icon: '🔨', target: 1, trackType: 'forges', reward: { coins: 800 } },
  { id: 'dq_forge_3', name: '精益求精', desc: '锻造3次', icon: '⚒️', target: 3, trackType: 'forges', reward: { coins: 2500 } },
  { id: 'dq_gather_2', name: '日常采集', desc: '完成2次采集', icon: '⛏️', target: 2, trackType: 'gathers', reward: { coins: 600 } },
  { id: 'dq_dungeon_1', name: '秘境日行', desc: '完成1次秘境', icon: '🐉', target: 1, trackType: 'dungeons', reward: { coins: 1200 } },
  { id: 'dq_smelt_2', name: '炼化日课', desc: '炼化2次', icon: '🔮', target: 2, trackType: 'smelts', reward: { coins: 500 } },
  { id: 'dq_stage_1', name: '推图日课', desc: '通关1个关卡', icon: '🗺️', target: 1, trackType: 'stages', reward: { coins: 1000 } },
];

// === Engine ===

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 从池中随机抽取N个任务
 */
export function rollDailyQuests(count: number = 5): DailyQuestInstance[] {
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => ({ defId: q.id, progress: 0, claimed: false }));
}

/**
 * 获取任务定义
 */
export function getQuestDef(defId: string): DailyQuestDef | undefined {
  return QUEST_POOL.find(q => q.id === defId);
}

/**
 * 检查是否需要重置
 */
export function checkDailyReset(state: DailyQuestState): DailyQuestState {
  const today = getTodayStr();
  if (state.date !== today) {
    return { date: today, quests: rollDailyQuests(5) };
  }
  return state;
}

/**
 * 创建初始状态
 */
export function createDailyQuestState(): DailyQuestState {
  return { date: getTodayStr(), quests: rollDailyQuests(5) };
}

/**
 * 增加任务进度
 */
export function addQuestProgress(
  state: DailyQuestState,
  trackType: DailyTrackType,
  amount: number = 1,
): DailyQuestState {
  const quests = state.quests.map(q => {
    const def = getQuestDef(q.defId);
    if (!def || def.trackType !== trackType || q.claimed) return q;
    return { ...q, progress: Math.min(q.progress + amount, def.target) };
  });
  return { ...state, quests };
}
