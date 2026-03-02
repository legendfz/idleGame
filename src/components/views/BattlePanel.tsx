/**
 * BattlePanel — 战斗面板（嵌入 BattleView 使用）
 */
import { useBattle } from '../../hooks/useBattle';
import { formatBigNum } from '../../engine/bignum';

export function BattlePanel() {
  const { battle, click } = useBattle();
  if (!battle) return null;

  const enemy = battle.enemies[battle.currentEnemyIdx];
  if (!enemy) return null;

  return (
    <div className="battle-panel">
      <div className="enemy-info">
        <span>{enemy.name}</span>
        <span>HP: {formatBigNum(enemy.currentHp)}/{formatBigNum(enemy.maxHp)}</span>
      </div>
      <button onClick={() => click()}>⚔️ 攻击</button>
    </div>
  );
}
