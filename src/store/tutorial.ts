/**
 * TutorialStore — 新手引导状态
 */
import { create } from 'zustand';
import { TutorialState, createTutorialState, getCurrentStep, TUTORIAL_STEPS } from '../engine/tutorial';
import { usePlayerStore } from './player';
import { useTalentStore } from './talent';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface TutorialStoreType {
  state: TutorialState;

  completeStep: () => void;
  skip: () => void;
  getCurrentStep: () => ReturnType<typeof getCurrentStep>;
  loadState: (s: TutorialState) => void;
  getState: () => TutorialState;
}

export const useTutorialStore = create<TutorialStoreType>((set, get) => ({
  state: createTutorialState(),

  completeStep: () => {
    const st = get().state;
    const step = getCurrentStep(st);
    if (!step) return;

    // 发放奖励
    if (step.reward) {
      switch (step.reward.type) {
        case 'coins': usePlayerStore.getState().addCoins(bn(step.reward.amount)); break;
        case 'xiuwei': usePlayerStore.getState().addXiuwei(bn(step.reward.amount)); break;
        case 'talentPoint': useTalentStore.getState().addPoints(step.reward.amount); break;
      }
      useUIStore.getState().addToast(`🎁 引导奖励已发放！`, 'success');
    }

    const nextStep = st.currentStep + 1;
    const completed = nextStep > TUTORIAL_STEPS.length;
    set({ state: { currentStep: nextStep, completed } });

    if (completed) {
      useUIStore.getState().addToast('🎉 新手引导完成！', 'success');
    }
  },

  skip: () => set({ state: { currentStep: TUTORIAL_STEPS.length + 1, completed: true } }),

  getCurrentStep: () => getCurrentStep(get().state),

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
