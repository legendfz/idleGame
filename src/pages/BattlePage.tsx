import { useGameStore } from '../store/gameStore';
import { formatNumber, expForLevel, formatTime } from '../utils/format';
import { Card, FloatingDamage, BossToast } from './shared';

export function BattleView() {
  const battle = useGameStore(s => s.battle);
  const clickAttack = useGameStore(s => s.clickAttack);
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const idleStats = useGameStore(s => s.idleStats);
  const eStats = getEffectiveStats();
  const enemy = battle.currentEnemy;
  const hpPct = enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;

  return (
    <div className="main-content fade-in">
      {enemy && (
        <Card className="enemy-section">
          <div className="enemy-name">
            {battle.isBossWave && <span className="color-boss">[BOSS] </span>}
            <span>{enemy.name}</span>
            <span style={{ float: 'right', fontSize: 12 }} className="color-dim">
              [{battle.wave}/{battle.maxWaves + 1}]
            </span>
          </div>
          <div className="hp-bar-bg">
            <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
            <div className="hp-bar-text">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
          </div>
          <FloatingDamage />
        </Card>
      )}
      <div className="click-area" onClick={clickAttack}>
        <div style={{ fontSize: 28, color: 'var(--accent)' }}>悟空</div>
        <div style={{ fontSize: 12, marginTop: 4 }} className="color-dim">点击攻击 (攻击力 {player.clickPower})</div>
      </div>
      <Card className="stats-card">
        <div className="stats-row">
          <span className="color-attack">攻 {formatNumber(eStats.attack)}</span>
          <span className="color-hp">血 {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">暴 {eStats.critRate.toFixed(0)}%</span>
          <span className="color-exp">经验 {formatNumber(player.exp)}/{formatNumber(expForLevel(player.level))}</span>
        </div>
      </Card>
      <Card className="idle-stats-card">
        <div className="idle-stats">
          <span className="color-gold">+{formatNumber(Math.floor(idleStats.goldPerSec))}/秒</span>
          {'  '}<span className="color-exp">+{formatNumber(Math.floor(idleStats.expPerSec))}/秒</span>
          {'  '}<span className="color-dim">挂机 {formatTime(idleStats.sessionTime)}</span>
        </div>
      </Card>
      <Card className="battle-log-card">
        <div className="battle-log">
          {battle.log.map(entry => (
            <div key={entry.id} className={`log-${entry.type}`}>{entry.text}</div>
          ))}
        </div>
      </Card>
      <BossToast />
    </div>
  );
}
