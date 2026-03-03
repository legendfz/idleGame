/**
 * v2.0 Battle Engine — placeholder
 */

import { BattleState, StageConfig } from '../types/battle';
import { CharacterState } from '../types/game';

export function initBattle(_stage: StageConfig, _party: CharacterState[]): BattleState {
  // TODO: full implementation in M2
  return {
    stageNum: _stage.stage,
    status: 'idle',
    currentWaveIndex: 0,
    currentEnemyIndex: 0,
    enemy: null,
    playerHp: '0',
    playerMaxHp: '0',
    elapsed: 0,
    timeLimit: _stage.boss.timeLimit,
    attackAccumulator: 0,
    activeSkillWarning: null,
    dodgeAvailable: false,
    dodgeActive: false,
    totalDamageDealt: '0',
    totalDamageTaken: '0',
    killCount: 0,
    clickCombo: 0,
    clickComboTimer: 0,
    log: [],
  };
}

export function tickBattle(state: BattleState, _dt: number): BattleState {
  // TODO: full implementation in M2
  return state;
}

export function playerClick(state: BattleState): { state: BattleState; damage: string; isCrit: boolean } {
  // TODO: full implementation in M2
  return { state, damage: '0', isCrit: false };
}

export function dodge(state: BattleState): BattleState {
  // TODO: full implementation in M2
  return { ...state, dodgeActive: true };
}
