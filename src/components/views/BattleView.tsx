/**
 * BattleView — 战斗界面（完整集成版）
 */
import { useBattle } from '../../hooks/useBattle';
import { useJourneyStore } from '../../store/journey';
import { usePlayerStore } from '../../store/player';
import { formatBigNum, bn } from '../../engine/bignum';
import { getStageConfig, getRealmConfig } from '../../data/config';
import { bossHp, bossTimeLimit } from '../../engine/formulas';

export function BattleView() {
  const { battle, startBattle, click, endBattle } = useBattle();
  const journey = useJourneyStore(s => s.journey);
  const canEnter = useJourneyStore(s => s.canEnter);
  const player = usePlayerStore(s => s.player);

  const currentStage = journey.currentStage;
  const stageConfig = getStageConfig(currentStage);

  // === 非战斗状态 ===
  if (!battle) {
    const bHp = bossHp(currentStage);
    const timeLimit = bossTimeLimit(currentStage);

    return (
      <div className="view-battle">
        <h2>⚔️ 取经 — 第 {currentStage} 难</h2>
        {stageConfig && (
          <div className="stage-info">
            <div className="stage-name">{stageConfig.boss.icon} {stageConfig.name}</div>
            <div className="stage-boss">Boss: {stageConfig.boss.name}</div>
            <div className="stage-detail">
              <span>Boss HP: {formatBigNum(bHp)}</span>
              <span>时限: {timeLimit}秒</span>
            </div>
          </div>
        )}
        <button
          className="btn-primary btn-large"
          onClick={() => startBattle(currentStage)}
          disabled={!canEnter(currentStage)}
        >
          进入战斗
        </button>
        {currentStage > 1 && (
          <div className="prev-stages">
            已通关: {Object.values(journey.stages).filter(s => s.stars > 0).length} 难
          </div>
        )}
      </div>
    );
  }

  // === 战斗中 ===
  const enemy = battle.enemies[battle.currentEnemyIdx];
  const progress = enemy ? (1 - enemy.currentHp.div(enemy.maxHp).toNumber()) : 1;
  const bossTimerSec = Math.ceil(battle.bossTimer / 1000);
  const isLowTime = enemy?.isBoss && bossTimerSec <= 10;

  return (
    <div className="view-battle">
      <div className="battle-header">
        <span>第 {battle.stageId} 难</span>
        <span>击杀: {battle.killCount}/{battle.enemies.length}</span>
        <span>{Math.floor(battle.elapsed / 1000)}秒</span>
      </div>

      {enemy && (
        <div className="enemy-display">
          <h3>{enemy.name} {enemy.isBoss ? '👹 BOSS' : ''}</h3>
          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${(1 - progress) * 100}%` }} />
            <span className="hp-text">{formatBigNum(enemy.currentHp)} / {formatBigNum(enemy.maxHp)}</span>
          </div>
          {enemy.isBoss && (
            <div className={`boss-timer ${isLowTime ? 'low-time' : ''}`}>
              ⏱️ {bossTimerSec}s
            </div>
          )}
        </div>
      )}

      {battle.comboBuff > 0 && (
        <div className="combo-badge">🔥 连击 ×2！</div>
      )}

      <div className="click-area" onClick={() => click()}>
        <span className="click-icon">⚔️</span>
        <span>点击攻击</span>
      </div>

      <div className="battle-stats">
        <span>总伤害: {formatBigNum(battle.totalDamageDealt)}</span>
      </div>

      {battle.status !== 'fighting' && (
        <div className="battle-result">
          {battle.status === 'victory' ? (
            <div className="victory">
              <h3>✅ 胜利！</h3>
              <p>奖励已自动领取</p>
            </div>
          ) : (
            <div className="defeat">
              <h3>❌ 失败</h3>
              <p>{battle.bossTimer <= 0 ? 'Boss 时间耗尽' : '战斗失败'}</p>
            </div>
          )}
          <button className="btn-primary" onClick={endBattle}>返回</button>
        </div>
      )}
    </div>
  );
}
