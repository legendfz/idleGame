/**
 * BattleView — 战斗界面
 */
import { useBattle } from '../../hooks/useBattle';
import { useJourneyStore } from '../../store/journey';
import { formatBigNum, bn } from '../../engine/bignum';

export function BattleView() {
  const { battle, startBattle, click, endBattle } = useBattle();
  const journey = useJourneyStore(s => s.journey);

  if (!battle) {
    return (
      <div className="view-battle">
        <h2>⚔️ 取经战斗</h2>
        <p>当前：第 {journey.currentStage} 难</p>
        <button className="btn-primary" onClick={() => startBattle(journey.currentStage)}>
          进入战斗
        </button>
      </div>
    );
  }

  const enemy = battle.enemies[battle.currentEnemyIdx];

  return (
    <div className="view-battle">
      <div className="battle-header">
        <span>第 {battle.stageId} 难</span>
        <span>{battle.status}</span>
      </div>
      {enemy && (
        <div className="enemy-display">
          <h3>{enemy.name} {enemy.isBoss ? '👹' : ''}</h3>
          <div>HP: {formatBigNum(enemy.currentHp)} / {formatBigNum(enemy.maxHp)}</div>
          {enemy.isBoss && <div>⏱️ {Math.ceil(battle.bossTimer / 1000)}s</div>}
        </div>
      )}
      <button className="btn-click" onClick={() => click()}>
        攻击！
      </button>
      <div className="battle-stats">
        <span>击杀: {battle.killCount}</span>
        <span>总伤害: {formatBigNum(battle.totalDamageDealt)}</span>
      </div>
      {battle.status !== 'fighting' && (
        <div>
          <p>{battle.status === 'victory' ? '✅ 胜利！' : '❌ 失败'}</p>
          <button onClick={endBattle}>返回</button>
        </div>
      )}
    </div>
  );
}
