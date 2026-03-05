import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber, expForLevel, formatTime } from '../utils/format';
import { REALMS } from '../data/realms';
import { CHAPTERS, ABYSS_CHAPTER_ID } from '../data/chapters';
import { Card, FloatingDamage, BossToast } from './shared';

const SPEED_OPTIONS = [1, 2, 5, 10];
type LogFilter = 'all' | 'drop' | 'levelup' | 'boss' | 'crit';

const TIPS = [
  '💡 装备可强化至+15，+11以上有失败风险',
  '💡 混沌品质装备可精炼为鸿蒙装备',
  '💡 转世可获得道点，兑换永久加成',
  '💡 洞天建筑提供持续增益，记得升级',
  '💡 秘境探索可获得稀有材料和装备',
  '💡 每日签到可领取丰厚奖励',
  '💡 战斗速度可通过底部按钮切换',
  '💡 套装效果需要收集同系列装备激活',
  '💡 仙缘赠礼可获得神通技能加成',
  '💡 背包满时可快速分解低品质装备',
];

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
  const killStreak = useGameStore(s => s.battle.killStreak) || 0;
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

  // Log filter
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const filteredLog = battle.log.filter(e => {
    if (logFilter === 'all') return true;
    if (logFilter === 'drop') return e.type === 'drop';
    if (logFilter === 'levelup') return e.type === 'levelup';
    if (logFilter === 'boss') return e.type === 'boss';
    if (logFilter === 'crit') return e.type === 'crit';
    return true;
  });
  const visibleLog = filteredLog.slice(-10);

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(battleSpeed);
    setBattleSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);

  return (
    <div className="main-content fade-in">
      {/* Scrolling tip */}
      <div className="battle-tip-marquee">
        <span className="battle-tip-text">{tip}</span>
      </div>
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
        <span className="color-dim">{isAbyss ? `深渊·${battle.stageNum}层` : `${chapter?.name ?? ''} ${battle.stageNum}/${chapter?.stages ?? '?'}关`}</span>
        {!isAbyss && (
          <div className="battle-chapter-track">
            <div className="battle-chapter-fill" style={{ width: `${chapterProgress}%` }} />
          </div>
        )}
        <button className={`battle-speed-btn${battleSpeed === 2 ? ' active' : battleSpeed === 5 ? ' speed-5' : battleSpeed === 10 ? ' speed-10' : ''}`} onClick={cycleSpeed}>
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

      {/* Tribulation timer */}
      {battle.tribulation?.active && (
        <div className="tribulation-timer">
          <span>⚡ 天劫倒计时</span>
          <span className={`tribulation-countdown${battle.tribulation.timer <= 10 ? ' urgent' : ''}`}>
            {battle.tribulation.timer}s
          </span>
        </div>
      )}

      {/* Breakthrough button */}
      {canBreakthrough && !battle.tribulation?.active && (
        <div style={{ padding: '0 12px', marginBottom: 8 }}>
          <button className="breakthrough-btn" onClick={attemptBreakthrough}>
            ⚡ 渡劫突破 → {nextRealm.name} (需蟠桃 {nextRealm.pantaoReq})
          </button>
        </div>
      )}

      <Card className="stats-card">
        <div className="stats-row">
          <span className="color-attack">⚔ {formatNumber(eStats.attack)}</span>
          <span className="color-hp">❤ {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">💥 {eStats.critRate.toFixed(0)}%</span>
          <span style={{ color: '#ffcc00', fontWeight: 700 }}>⭐ {formatNumber(Math.floor(eStats.attack * (1 + (eStats.critRate / 100) * ((eStats.critDmg || 150) / 100)) + eStats.maxHp * 0.05))}</span>
          {killStreak >= 10 && (
            <span style={{ color: killStreak >= 100 ? '#ff4444' : killStreak >= 50 ? '#ff8800' : '#ffaa00', fontWeight: 700 }}>
              🔥{killStreak}
            </span>
          )}
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
        <div className="log-filter-tabs">
          {([['all','全部'],['drop','掉落'],['levelup','升级'],['crit','暴击'],['boss','Boss']] as const).map(([k,l]) => (
            <button key={k} className={`log-filter-btn${logFilter===k?' active':''}`} onClick={()=>setLogFilter(k as LogFilter)}>{l}</button>
          ))}
        </div>
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
