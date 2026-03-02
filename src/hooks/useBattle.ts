/**
 * useBattle — 战斗 hook
 */
import { useBattleStore } from '../store/battle';

export function useBattle() {
  const battle = useBattleStore(s => s.battle);
  const startBattle = useBattleStore(s => s.startBattle);
  const click = useBattleStore(s => s.click);
  const endBattle = useBattleStore(s => s.endBattle);

  return { battle, startBattle, click, endBattle };
}
