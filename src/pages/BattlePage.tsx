import { useGameStore } from '../store/gameStore';
import { formatNumber, expForLevel, formatTime } from '../utils/format';
import { Card, FloatingDamage, BossToast } from './shared';
import { CHAPTERS } from '../data/chapters';

export function BattleView() {
  const battle = useGameStore(s => s.battle);
  const clickAttack = useGameStore(s => s.clickAttack);
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const idleStats = useGameStore(s => s.idleStats);
  const battleSpeed = useGameStore(s => s.battleSpeed);
  const setBattleSpeed = useGameStore(s => s.setBattleSpeed);
  const eStats = getEffectiveStats();
  const enemy = battle.currentEnemy;
  const hpPct = enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;

  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);
  const stagePct = chapter ? Math.min(100, ((battle.stageNum - 1) / chapter.stages) * 100) : 0;

  return (
    <div className="main-content fade-in">
      {/* Chapter & Stage Progress */}
      <Card className="stage-progress-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            {chapter?.name || '未知'}
          </span>
          <span className="color-dim" style={{ fontSize: 11 }}>
            第{battle.stageNum}关 / {chapter?.stages || '?'}
          </span>
        </div>
        <div className="stage-bar-bg">
          <div className="stage-bar-fill" style={{ width: `${stagePct}%` }} />
        </div>
      </Card>

      {/* Enemy Display */}
      {enemy && (
        <Card className="enemy-section">
          <div style={{ textAlign: 'center', fontSize: 40, lineHeight: 1.2, marginBottom: 4 }}>
            <span className={battle.isBossWave ? 'boss-emoji-pulse' : 'enemy-emoji-idle'}>
              {enemy.emoji}
            </span>
          </div>
          <div className="enemy-name">
            {battle.isBossWave && <span className="color-boss">[BOSS] </span>}
            <span>{enemy.name}</span>
            <span style={{ float: 'right', fontSize: 12 }} className="color-dim">
              [{battle.wave}/{battle.maxWaves + 1}]
            </span>
          </div>
          <div className="hp-bar-bg">
            <div className={`hp-bar-fill ${battle.isBossWave ? 'boss-hp' : ''}`} style={{ width: `${hpPct}%` }} />
            <div className="hp-bar-text">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
          </div>
          <FloatingDamage />
        </Card>
      )}
      <div className="click-area" onClick={clickAttack}>
        <div style={{ fontSize: 32 }}>🐵</div>
        <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>悟空</div>
        <div style={{ fontSize: 11, marginTop: 2 }} className="color-dim">点击攻击 +{player.clickPower}</div>
      </div>
      <Card className="stats-card">
        <div className="stats-row">
          <span className="color-attack">⚔️{formatNumber(eStats.attack)}</span>
          <span className="color-hp">❤️{formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">💥{eStats.critRate.toFixed(0)}%</span>
          <span className="color-dim">💀{formatNumber(player.totalKills)}</span>
        </div>
        <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4 }} className="color-exp">
          Lv.{player.level} — {formatNumber(player.exp)}/{formatNumber(expForLevel(player.level))}
        </div>
        <div className="exp-bar-bg">
          <div className="exp-bar-fill" style={{ width: `${Math.min(100, (player.exp / expForLevel(player.level)) * 100)}%` }} />
        </div>
      </Card>
      <Card className="idle-stats-card">
        <div className="idle-stats">
          <span className="color-gold">💰+{formatNumber(Math.floor(idleStats.goldPerSec))}/s</span>
          {'  '}<span className="color-exp">✨+{formatNumber(Math.floor(idleStats.expPerSec))}/s</span>
          {'  '}<span className="color-crit">DPS {formatNumber(Math.floor(idleStats.dps))}</span>
          {'  '}<span className="color-dim">⏱{formatTime(idleStats.sessionTime)}</span>
        </div>
        <div className="speed-controls">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              className={`speed-btn ${battleSpeed === s ? 'speed-active' : ''}`}
              onClick={() => setBattleSpeed(s)}
            >
              {s}x
            </button>
          ))}
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
