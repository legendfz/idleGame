/**
 * TutorialEngine — 新手引导: 5步流程
 */

export interface TutorialStep {
  id: number;
  title: string;
  desc: string;
  targetTab: string; // 导航到哪个tab
  icon: string;
  reward?: { type: 'coins' | 'xiuwei' | 'talentPoint'; amount: number };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1, title: '开始修炼', desc: '点击修炼按钮，获取修为。修为是一切的基础。',
    targetTab: 'idle', icon: '🧘',
    reward: { type: 'xiuwei', amount: 500 },
  },
  {
    id: 2, title: '初战告捷', desc: '进入战斗页面，击败第一个妖怪！',
    targetTab: 'battle', icon: '⚔️',
    reward: { type: 'coins', amount: 1000 },
  },
  {
    id: 3, title: '突破境界', desc: '修为足够后，尝试突破到练气期。',
    targetTab: 'idle', icon: '⬆️',
    reward: { type: 'xiuwei', amount: 2000 },
  },
  {
    id: 4, title: '锻造装备', desc: '到达筑基后，前往锻造台打造你的第一件装备。',
    targetTab: 'forge', icon: '🔨',
    reward: { type: 'coins', amount: 5000 },
  },
  {
    id: 5, title: '踏上征途', desc: '查看取经之路，规划你的修仙之旅！',
    targetTab: 'journey', icon: '🗺️',
    reward: { type: 'talentPoint', amount: 1 },
  },
];

export interface TutorialState {
  currentStep: number; // 0=未开始, 1-5=进行中, 6=完成
  completed: boolean;
}

export function createTutorialState(): TutorialState {
  return { currentStep: 1, completed: false };
}

export function getCurrentStep(state: TutorialState): TutorialStep | null {
  if (state.completed) return null;
  return TUTORIAL_STEPS.find(s => s.id === state.currentStep) ?? null;
}
