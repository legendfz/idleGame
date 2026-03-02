/**
 * useBattle — 战斗 hook
 */
import { useCallback } from 'react';
import useGameStore from '../store';

export function useBattle() {
  const active = useGameStore((s) => s.active);
  const stageId = useGameStore((s) => s.stageId);
  const monsterHp = useGameStore((s) => s.monsterHp);
  const monsterMaxHp = useGameStore((s) => s.monsterMaxHp);
  const startBattle = useGameStore((s) => s.startBattle);
  const endBattle = useGameStore((s) => s.endBattle);

  const hpPercent = Number(monsterMaxHp) > 0
    ? (Number(monsterHp) / Number(monsterMaxHp)) * 100
    : 0;

  return { active, stageId, monsterHp, monsterMaxHp, hpPercent, startBattle, endBattle };
}
