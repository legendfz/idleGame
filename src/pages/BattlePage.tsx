import { useGameStore } from '../store/gameStore';
import { formatNumber, expForLevel, formatTime } from '../utils/format';
import { REALMS } from '../data/realms';
import { CHAPTERS, ABYSS_CHAPTER_ID } from '../data/chapters';
import { Card, FloatingDamage, BossToast } from './shared';

const SPEED_OPTIONS = [1, 2, 5, 10];

export function BattleView() {
  const battle = useGameStore(s => s.battle);
  const clickAttack = useGameStore(s => s.clickAttack);
  const player = useGameStore(s => s.player);
  const highestChapter = useGameStore(s => s.highestChapter);
  const highestStage = useGameStore(s => s.highestStage);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const idleStats = useGameStore(s => s.idleStats);
  const battleSpeed = useGameStore(s => s.battleSpeed) || 1;
  const setBattleSpeed = useGameStore(s => s.setBattleSpeed);
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const eStats = getEffectiveStats();
  const enemy = battle.currentEnemy;
  const hpPct = enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;
  const expPct = Math.min(100, (player.exp / expForLevel(player.level)) * 100);

  // Chapter progress
  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);
  const chapterProgress = chapter ? Math.min(100, (battle.stageNum / chapter.stages) * 100) : 0;
  const isAbyss = battle.chapterId >= ABYSS_CHAPTER_ID;

  // Breakthrough check
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreakthrough = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;
  const currentRealm = REALMS[player.realmIndex];

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(battleSpeed);
    setBattleSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  return (
    <div className="main-content fade-in">
      {/* Realm & Level bar */}
      <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
        <span style={{ color: '#ce93d8', fontWeight: 600 }}>{currentRealm?.name ?? '练气'} Lv.{player.level}</span>
        <div style={{ flex: 1, margin: '0 8px', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${expPct}%`, height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <span className="color-dim" style={{ fontSize: 11 }}>{Math.floor(expPct)}%</span>
      </div>

      {/* Chapter progress bar */}
      <div style={{ padding: '2px 12px 6px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
        <span className="color-dim">{isAbyss ? `深渊·${battle.stageNum}层` : `${battle.stageNum}/${chapter?.stages ?? '?'}关`}</span>
        {!isAbyss && (
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${chapterProgress}%`, height: '100%', background: 'linear-gradient(90deg, #4caf50, #81c784)', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        )}
        <button onClick={cycleSpeed} style={{
          background: battleSpeed > 1 ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '2px 10px',
          color: battleSpeed > 1 ? '#667eea' : '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer'
        }}>
          {battleSpeed}x
        </button>
      </div>

      {/* Enemy display with large emoji */}
      {enemy && (
        <Card className="enemy-section" style={{ textAlign: 'center', padding: '8px 12px' }}>
          <div style={{ fontSize: 48, lineHeight: 1.2, margin: '4px 0', filter: battle.isBossWave ? 'drop-shadow(0 0 12px #ff4444)' : 'none' }}>
            {enemy.emoji || '👾'}
          </div>
          <div className="enemy-name" style={{ fontSize: 15, fontWeight: 700 }}>
            {battle.isBossWave && <span className="color-boss">⚠ </span>}
            <span>{enemy.name}</span>
          </div>
          <div className="hp-bar-bg" style={{ marginTop: 6 }}>
            <div className="hp-bar-fill" style={{
              width: `${hpPct}%`,
              background: battle.isBossWave ? 'linear-gradient(90deg, #d32f2f, #ff6659)' : undefined
            }} />
            <div className="hp-bar-text">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
          </div>
          <div style={{ fontSize: 11, color: '#777', marginTop: 4 }}>
            防御 {formatNumber(enemy.defense)} · 经验 {formatNumber(enemy.expDrop)} · 灵石 {formatNumber(enemy.lingshiDrop)}
          </div>
          <FloatingDamage />
        </Card>
      )}

      <div className="click-area" onClick={clickAttack} style={{ padding: '12px 0' }}>
        <div style={{ fontSize: 28, color: 'var(--accent)' }}>悟空</div>
        <div style={{ fontSize: 12, marginTop: 4 }} className="color-dim">点击攻击 (攻击力 {player.clickPower})</div>
      </div>

      {/* Breakthrough button */}
      {canBreakthrough && (
        <div style={{ padding: '0 12px', marginBottom: 8 }}>
          <button onClick={attemptBreakthrough} style={{
            width: '100%', padding: '10px', border: 'none', borderRadius: 8,
            background: 'linear-gradient(135deg, #f0c040, #ff6b35)', color: '#000',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            突破 → {nextRealm.name} (需蟠桃 {nextRealm.pantaoReq})
          </button>
        </div>
      )}

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
          {'  '}<span className="color-crit">DPS {formatNumber(Math.floor(idleStats.dps))}</span>
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
