/**
 * JourneyEngine — 取经进度、关卡推进、星级评定
 */
import { eventBus } from './events';

export interface StageConfig {
  id: string;
  name: string;
  difficulty: number;
  isBoss: boolean;
  monsterTemplateId: string;
  requiredPower: number;
}

export interface JourneyState {
  currentStage: number;
  maxStage: number;
  totalStages: number; // 81
  stars: Map<string, number>; // stageId -> stars (0-3)
}

export class JourneyEngine {
  private stages: StageConfig[];

  constructor(stages: StageConfig[]) {
    this.stages = stages;
  }

  getCurrentStage(state: JourneyState): StageConfig | undefined {
    return this.stages[state.currentStage];
  }

  advanceStage(state: JourneyState): boolean {
    if (state.currentStage >= state.totalStages - 1) return false;
    state.currentStage++;
    if (state.currentStage > state.maxStage) {
      state.maxStage = state.currentStage;
    }
    eventBus.emit('journey:progress', {
      stage: state.currentStage,
      total: state.totalStages,
    });
    return true;
  }

  setStars(state: JourneyState, stageId: string, stars: number): void {
    const current = state.stars.get(stageId) || 0;
    if (stars > current) {
      state.stars.set(stageId, Math.min(3, stars));
    }
  }
}
