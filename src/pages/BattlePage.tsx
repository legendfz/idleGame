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

  // Battle log: show latest 10 entries only
  const visibleLog = battle.log.slice(-10);

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(battleSpeed);
    setBattleSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  return (
    <div className="main-content fade-in">
      {/* Realm & Level bar */}
      <div className="battle-realm-bar">
        <span className="battle-realm-name">{currentRealm?.name ?? '练气'} Lv.{player.level}</span>
        <div className="battle-exp-track">
          <div className="battle-exp-fill" style={{ width: `${expPct}%` }} />
        </div>
        <span className="battle-exp-pct">{Math.floor(expPct)}%</span>
      </div>

      {/* Chapter progress bar */}
      <div className="battle-chapter-bar">
        <span className="color-dim">{isAbyss ? `深渊·${battle.stageNum}层` : `${battle.stageNum}/${chapter?.stages ?? '?'}关`}</span>
        {!isAbyss && (
          <div className="battle-chapter-track">
            <div className="battle-chapter-fill" style={{ width: `${chapterProgress}%` }} />
          </div>
        )}
        <button className={`battle-speed-btn${battleSpeed > 1 ? ' active' : ''}`} onClick={cycleSpeed}>
          {battleSpeed}x
        </button>
      </div>

      {/* Enemy display */}
      {enemy && (
        <Card className={`enemy-section${battle.isBossWave ? ' boss-active' : ''}`} style={{ textAlign: 'center', padding: '8px 12px' }}>
          <div className={`enemy-emoji${battle.isBossWave ? ' boss-glow' : ''}`}>
            {enemy.emoji || '👾'}
          </div>
          <div className="enemy-name">
            {battle.isBossWave && <span className="color-boss">⚠ </span>}
            <span>{enemy.name}</span>
          </div>
          <div className="hp-bar-bg" style={{ marginTop: 6 }}>
            <div className={`hp-bar-fill${battle.isBossWave ? ' boss' : ''}${hpPct < 25 ? ' low' : ''}`} style={{ width: `${hpPct}%` }} />
            <div className="hp-bar-text">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
          </div>
          <div className="enemy-sub-stats">
            防御 {formatNumber(enemy.defense)} · 经验 {formatNumber(enemy.expDrop)} · 灵石 {formatNumber(enemy.lingshiDrop)}
          </div>
          <FloatingDamage />
        </Card>
      )}

      {/* Wukong click area — enhanced */}
      <div className="click-area" onClick={clickAttack}>
        <div className="wukong-icon">🐵</div>
        <div className="wukong-name">悟空</div>
        <div className="wukong-hint">点击攻击 · 攻击力 {formatNumber(player.clickPower)}</div>
      </div>

      {/* Breakthrough button */}
      {canBreakthrough && (
        <div style={{ padding: '0 12px', marginBottom: 8 }}>
          <button className="breakthrough-btn" onClick={attemptBreakthrough}>
            ⚡ 突破 → {nextRealm.name} (需蟠桃 {nextRealm.pantaoReq})
          </button>
        </div>
      )}

      <Card className="stats-card">
        <div className="stats-row">
          <span className="color-attack">⚔ {formatNumber(eStats.attack)}</span>
          <span className="color-hp">❤ {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">💥 {eStats.critRate.toFixed(0)}%</span>
          <span className="color-exp">✦ {formatNumber(player.exp)}/{formatNumber(expForLevel(player.level))}</span>
        </div>
      </Card>
      <Card className="idle-stats-card">
        <div className="idle-stats">
          <span className="color-gold">💰+{formatNumber(Math.floor(idleStats.goldPerSec))}/s</span>
          {'  '}<span className="color-exp">📖+{formatNumber(Math.floor(idleStats.expPerSec))}/s</span>
          {'  '}<span className="color-crit">⚔DPS {formatNumber(Math.floor(idleStats.dps))}</span>
          {'  '}<span className="color-dim">⏱{formatTime(idleStats.sessionTime)}</span>
        </div>
      </Card>

      <Card className="battle-log-card">
        <div className="battle-log">
          {visibleLog.map(entry => (
            <div key={entry.id} className={`log-${entry.type}`}>{entry.text}</div>
          ))}
        </div>
      </Card>
      <BossToast />
    </div>
  );
}
