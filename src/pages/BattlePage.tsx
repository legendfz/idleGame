import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDailyStore } from '../store/dailyStore';
import { formatNumber, expForLevel, formatTime } from '../utils/format';
import { REALMS } from '../data/realms';
import { getRandomEvent, resolveChoice, type RandomEvent, type EventChoice } from '../data/randomEvents';
import { CHAPTERS, ABYSS_CHAPTER_ID } from '../data/chapters';
import { TITLES } from '../data/titles';
import { Card, FloatingDamage, BossToast } from './shared';
import { StatBreakdownModal } from '../components/StatBreakdown';
import { useAutoWorldBoss } from '../components/WorldBossPanel';
import { WorldBossBanner, WorldBossModal } from '../components/WorldBossPanel';
import { SmartHints, PinnedAchievementTracker, SkillBar, ConsumableBar, OnlineRewardsBar, AbyssMilestoneBar } from '../components/battle';

const SPEED_OPTIONS = [1, 2, 5, 10, 20, 50];
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
  useAutoWorldBoss();
  const battle = useGameStore(s => s.battle);
  const clickAttack = useGameStore(s => s.clickAttack);
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const idleStats = useGameStore(s => s.idleStats);
  const battleSpeed = useGameStore(s => s.battleSpeed) || 1;
  const setBattleSpeed = useGameStore(s => s.setBattleSpeed);
  const killStreak = useGameStore(s => s.battle.killStreak) || 0;
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const equippedTitleId = useGameStore(s => s.equippedTitle);
  const equippedTitle = equippedTitleId ? TITLES.find(t => t.id === equippedTitleId) : null;
  const eStats = getEffectiveStats();
  const enemy = battle.currentEnemy;
  const hpPct = enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;
  const expPct = Math.min(100, (player.exp / expForLevel(player.level)) * 100);

  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);
  const chapterProgress = chapter ? Math.min(100, (battle.stageNum / chapter.stages) * 100) : 0;
  const isAbyss = battle.chapterId >= ABYSS_CHAPTER_ID;

  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreakthrough = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;
  const currentRealm = REALMS[player.realmIndex];

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

  const [showWorldBoss, setShowWorldBoss] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const sessionMinutes = Math.floor(idleStats.sessionTime / 60);
  const sessionStartRef = useRef({ gold: player.totalGoldEarned, kills: player.totalKills });
  const sessionGold = player.totalGoldEarned - sessionStartRef.current.gold;
  const sessionKills = player.totalKills - sessionStartRef.current.kills;
  const onlineRewardsClaimed = useGameStore(s => s.onlineRewardsClaimed);
  const claimOnlineReward = useGameStore(s => s.claimOnlineReward);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const highestPower = useGameStore(s => s.highestPower);
  const fateBlessing = useGameStore(s => s.fateBlessing);
  const activateFateBlessing = useGameStore(s => s.activateFateBlessing);
  const dailyCanSignIn = useDailyStore(s => s.canSignIn);
  const dailySignIn = useDailyStore(s => s.signIn);
  const dailyCheckCanSignIn = useDailyStore(s => s.checkCanSignIn);

  const collectAll = useCallback(() => {
    const msgs: string[] = [];
    dailyCheckCanSignIn();
    const dailyResult = dailySignIn();
    if (dailyResult) {
      const r = dailyResult.reward;
      const state = useGameStore.getState();
      const updates: Record<string, number> = {};
      if (r.lingshi) updates.lingshi = state.player.lingshi + r.lingshi;
      if (r.pantao) updates.pantao = state.player.pantao + r.pantao;
      if (r.shards) updates.hongmengShards = state.player.hongmengShards + r.shards;
      if (Object.keys(updates).length > 0) {
        useGameStore.setState({ player: { ...state.player, ...updates } });
      }
      msgs.push(`📅签到: ${r.desc}`);
    }
    const milestones = [10, 30, 60, 120, 240];
    for (const m of milestones) {
      const r = claimOnlineReward(m);
      if (r) msgs.push(`⏱${r.desc}`);
    }
    if (msgs.length > 0) {
      setRewardToast(`🎁 一键收取 ${msgs.length} 项奖励！\n${msgs.join(' | ')}`);
      setTimeout(() => setRewardToast(null), 4000);
    } else {
      setRewardToast('暂无可领取的奖励');
      setTimeout(() => setRewardToast(null), 2000);
    }
  }, [claimOnlineReward, dailySignIn, dailyCheckCanSignIn]);

  const hasUnclaimedRewards = useMemo(() => {
    const unclaimedMilestones = [10, 30, 60, 120, 240].some(m => sessionMinutes >= m && !onlineRewardsClaimed.includes(m));
    return unclaimedMilestones || dailyCanSignIn;
  }, [sessionMinutes, onlineRewardsClaimed, dailyCanSignIn]);

  // Random events
  const [activeEvent, setActiveEvent] = useState<RandomEvent | null>(null);
  const [eventResult, setEventResult] = useState<{ success: boolean; rewards: Record<string, number>; message: string } | null>(null);
  const lastEventKills = useRef(0);
  const totalKills = player.totalKills;

  useEffect(() => {
    if (totalKills > 0 && totalKills - lastEventKills.current >= 80 && !activeEvent) {
      const evt = getRandomEvent(player.level);
      if (evt) {
        setActiveEvent(evt);
        lastEventKills.current = totalKills;
      }
    }
  }, [totalKills, player.level, activeEvent]);

  const handleEventChoice = useCallback((choice: EventChoice) => {
    const result = resolveChoice(choice, player.level);
    setEventResult(result);
    const state = useGameStore.getState();
    const p = { ...state.player };
    if (result.rewards.lingshi) p.lingshi = Math.max(0, p.lingshi + result.rewards.lingshi);
    if (result.rewards.exp) p.exp += result.rewards.exp;
    if (result.rewards.pantao) p.pantao = Math.max(0, p.pantao + result.rewards.pantao);
    if (result.rewards.shards) p.hongmengShards += result.rewards.shards;
    if (result.rewards.scrolls) p.tianmingScrolls += result.rewards.scrolls;
    if (result.rewards.daoPoints) p.daoPoints = (p.daoPoints ?? 0) + result.rewards.daoPoints;
    useGameStore.setState({ player: p });
  }, [player.level]);

  const dismissEvent = useCallback(() => {
    setActiveEvent(null);
    setEventResult(null);
  }, []);

  // Auto-event
  const autoEvent = useGameStore(s => s.autoEvent);
  useEffect(() => {
    if (autoEvent && activeEvent && !eventResult) {
      const timer = setTimeout(() => handleEventChoice(activeEvent.choices[0]), 500);
      return () => clearTimeout(timer);
    }
  }, [autoEvent, activeEvent, eventResult, handleEventChoice]);
  useEffect(() => {
    if (autoEvent && eventResult) {
      const timer = setTimeout(dismissEvent, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoEvent, eventResult, dismissEvent]);

  return (
    <div className="main-content fade-in">
      {player.level >= 50 && <WorldBossBanner onOpen={() => setShowWorldBoss(true)} />}
      {showWorldBoss && player.level >= 50 && <WorldBossModal onClose={() => setShowWorldBoss(false)} />}
      {showBreakdown && <StatBreakdownModal onClose={() => setShowBreakdown(false)} />}

      {/* Random Event Modal */}
      {activeEvent && (
        <div className="event-modal-overlay" onClick={eventResult ? dismissEvent : undefined}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <div className="event-emoji">{activeEvent.emoji}</div>
            <div className="event-title">{activeEvent.name}</div>
            <div className="event-desc">{activeEvent.description}</div>
            {!eventResult ? (
              <div className="event-choices">
                {activeEvent.choices.map((c, i) => (
                  <button key={i} className="event-choice-btn" onClick={() => handleEventChoice(c)}>
                    <span className="event-choice-label">{c.label}</span>
                    <span className="event-choice-desc">{c.description}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="event-result">
                <div className={`event-result-msg ${eventResult.success ? 'success' : 'fail'}`}>
                  {eventResult.success ? '✅' : '❌'} {eventResult.message}
                </div>
                {Object.entries(eventResult.rewards).filter(([,v]) => v !== 0).length > 0 && (
                  <div className="event-rewards">
                    {Object.entries(eventResult.rewards).filter(([,v]) => v !== 0).map(([k, v]) => (
                      <span key={k} className={`event-reward-tag ${v > 0 ? 'gain' : 'loss'}`}>
                        {k === 'lingshi' ? '💰' : k === 'exp' ? '📖' : k === 'pantao' ? '🍑' : k === 'shards' ? '💎' : k === 'scrolls' ? '📜' : '🎁'}
                        {v > 0 ? '+' : ''}{formatNumber(v)}
                      </span>
                    ))}
                  </div>
                )}
                <button className="event-dismiss-btn" onClick={dismissEvent}>继续冒险</button>
              </div>
            )}
          </div>
        </div>
      )}

      <SmartHints />
      <PinnedAchievementTracker />

      <div className="battle-tip-marquee">
        <span className="battle-tip-text">{tip}</span>
      </div>

      {/* Realm & Level bar */}
      <div className="battle-realm-bar">
        <span className="battle-realm-name">{currentRealm?.name ?? '练气'} Lv.{player.level}{equippedTitle && <span style={{ marginLeft: 6, fontSize: 11, color: equippedTitle.color, fontWeight: 600 }}>「{equippedTitle.name}」</span>}</span>
        <div className="battle-exp-track">
          <div className="battle-exp-fill" style={{ width: `${expPct}%` }} />
        </div>
        <span className="battle-exp-pct">{Math.floor(expPct)}%</span>
      </div>

      {/* Breakthrough progress */}
      {nextRealm && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', fontSize: 10, color: '#aaa' }}>
          <span>→{nextRealm.name}</span>
          <span style={{ color: player.level >= nextRealm.levelReq ? '#4ade80' : '#888' }}>Lv.{player.level}/{nextRealm.levelReq}</span>
          <span style={{ color: player.pantao >= nextRealm.pantaoReq ? '#4ade80' : '#f59e0b' }}>🍑{formatNumber(player.pantao)}/{formatNumber(nextRealm.pantaoReq)}</span>
          <div style={{ flex: 1, height: 3, background: 'rgba(100,100,100,0.3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (player.pantao / nextRealm.pantaoReq) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Chapter progress */}
      <div className="battle-chapter-bar">
        <span className="color-dim">{isAbyss ? `深渊·${battle.stageNum}层 (最高${useGameStore.getState().highestAbyssFloor}层)` : `${chapter?.name ?? ''} ${battle.stageNum}/${chapter?.stages ?? '?'}关`}</span>
        {!isAbyss && (
          <div className="battle-chapter-track">
            <div className="battle-chapter-fill" style={{ width: `${chapterProgress}%` }} />
          </div>
        )}
        <button className={`battle-speed-btn${battleSpeed === 2 ? ' active' : battleSpeed === 5 ? ' speed-5' : battleSpeed >= 10 ? ' speed-10' : ''}`} onClick={cycleSpeed}>
          {battleSpeed}x
        </button>
      </div>

      {isAbyss && <AbyssMilestoneBar />}

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
            <div className={`hp-bar-fill${battle.isBossWave ? ' boss' : ''} ${hpPct > 60 ? 'hp-high' : hpPct > 25 ? 'hp-mid' : 'hp-low'}${hpPct < 25 ? ' low' : ''}`} style={{ width: `${hpPct}%` }} />
            <div className="hp-bar-text">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
          </div>
          <div className="enemy-sub-stats">
            防御 {formatNumber(enemy.defense)} · 经验 {formatNumber(enemy.expDrop)} · 灵石 {formatNumber(enemy.lingshiDrop)}
          </div>
          <FloatingDamage />
        </Card>
      )}

      {/* Click attack area */}
      <div className="click-area" onClick={clickAttack}>
        <div className="wukong-icon">🐵</div>
        <div className="wukong-name">悟空</div>
        <div className="wukong-hint">点击攻击 · 攻击力 {formatNumber(player.clickPower)}</div>
      </div>

      <SkillBar />
      <ConsumableBar />

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

      {/* Stats card */}
      <Card className="stats-card">
        <div className="stats-row">
          <span className="color-attack">⚔ {formatNumber(eStats.attack)}</span>
          <span className="color-hp">❤ {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">💥 {eStats.critRate.toFixed(0)}%</span>
          <span style={{ color: '#ffcc00', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline dotted' }} onClick={() => setShowBreakdown(true)}>⭐ {formatNumber(Math.floor(eStats.attack * (1 + (eStats.critRate / 100) * ((eStats.critDmg || 150) / 100)) + eStats.maxHp * 0.05))}</span>
          {highestPower > 0 && <span style={{ color: '#888', fontSize: 10 }}>🏆{formatNumber(highestPower)}</span>}
          {killStreak >= 10 && (
            <span style={{ color: killStreak >= 100 ? '#ff4444' : killStreak >= 50 ? '#ff8800' : '#ffaa00', fontWeight: 700 }}>
              🔥{killStreak}
            </span>
          )}
        </div>
      </Card>

      {/* Idle stats */}
      <Card className="idle-stats-card">
        <div className="idle-stats">
          <span className="color-gold">💰+{formatNumber(Math.floor(idleStats.goldPerSec))}/s</span>
          {'  '}<span className="color-exp">📖+{formatNumber(Math.floor(idleStats.expPerSec))}/s</span>
          {'  '}<span className="color-crit">⚔DPS {formatNumber(Math.floor(idleStats.dps))}</span>
          {'  '}<span className="color-dim">⏱{formatTime(idleStats.sessionTime)}</span>
          {idleStats.sessionTime > 60 && <>
            {'  '}<span style={{color:'#a78bfa',fontSize:10}}>💎{formatNumber(Math.floor(idleStats.goldPerSec * 60))}/m</span>
          </>}
          {idleStats.expPerSec > 0 && (() => {
            const expNeeded = expForLevel(player.level) - player.exp;
            const secsToLevel = Math.ceil(expNeeded / idleStats.expPerSec);
            return secsToLevel > 0 && secsToLevel < 86400 ? (
              <>{'  '}<span style={{color:'#34d399',fontSize:10}}>⏳ 升级 {secsToLevel < 60 ? `${secsToLevel}s` : secsToLevel < 3600 ? `${Math.floor(secsToLevel/60)}m${secsToLevel%60>0?`${secsToLevel%60}s`:''}` : `${Math.floor(secsToLevel/3600)}h${Math.floor((secsToLevel%3600)/60)}m`}</span></>
            ) : null;
          })()}
          {/* Breakthrough ETA */}
          {idleStats.expPerSec > 0 && nextRealm && !canBreakthrough && (() => {
            let totalExpNeeded = 0;
            for (let lv = player.level; lv < nextRealm.levelReq; lv++) {
              totalExpNeeded += expForLevel(lv);
            }
            totalExpNeeded -= player.exp;
            const secsToBreak = Math.ceil(totalExpNeeded / idleStats.expPerSec);
            return secsToBreak > 0 && secsToBreak < 86400 * 7 ? (
              <>{'  '}<span style={{color:'#f59e0b',fontSize:10}}>🔱 突破 {secsToBreak < 60 ? `${secsToBreak}s` : secsToBreak < 3600 ? `${Math.floor(secsToBreak/60)}m` : secsToBreak < 86400 ? `${Math.floor(secsToBreak/3600)}h${Math.floor((secsToBreak%3600)/60)}m` : `${Math.floor(secsToBreak/86400)}d`}</span></>
            ) : null;
          })()}
        </div>
        {/* Session earnings + offline estimate */}
        {sessionKills > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: 10, color: '#888', marginTop: 2, flexWrap: 'wrap' }}>
            <span>本次：</span>
            <span style={{ color: '#fbbf24' }}>💰{formatNumber(sessionGold)}</span>
            <span style={{ color: '#f87171' }}>💀{formatNumber(sessionKills)}</span>
            {sessionMinutes > 0 && <span style={{ color: '#60a5fa' }}>⚡{formatNumber(Math.floor(sessionKills / sessionMinutes))}/m</span>}
            {player.reincarnations > 0 && <span style={{ color: '#c084fc' }}>🔄{player.reincarnations}世</span>}
          </div>
        )}
        {/* v139.0: Offline earnings estimate */}
        {idleStats.goldPerSec > 0 && idleStats.sessionTime > 30 && (
          <OfflineEstimate goldPerSec={idleStats.goldPerSec} expPerSec={idleStats.expPerSec} />
        )}
      </Card>

      {/* Fate Blessing */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
        {fateBlessing.active && fateBlessing.expiresAt > Date.now() ? (
          <span style={{ color: '#ffd700', fontSize: 12, fontWeight: 700, background: 'rgba(255,215,0,0.1)', padding: '2px 8px', borderRadius: 8, border: '1px solid rgba(255,215,0,0.3)' }}>
            ✨ 天命加持 ×2 — {formatTime(Math.max(0, Math.floor((fateBlessing.expiresAt - Date.now()) / 1000)))}
          </span>
        ) : (
          player.tianmingScrolls > 0 && (
            <button
              onClick={() => { if (activateFateBlessing()) { setRewardToast('✨ 天命加持已激活！全收益×2 持续2小时'); setTimeout(() => setRewardToast(null), 3000); } }}
              style={{ fontSize: 11, padding: '2px 10px', background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              ✨ 天命加持 ×2（天命符×{player.tianmingScrolls}）
            </button>
          )
        )}
      </div>

      {/* Battle log */}
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

      {/* One-click collect */}
      {hasUnclaimedRewards && (
        <div style={{ textAlign: 'center', margin: '6px 0' }}>
          <button onClick={collectAll} style={{
            fontSize: 13, padding: '6px 20px', borderRadius: 12, cursor: 'pointer',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none',
            color: '#fff', fontWeight: 700, animation: 'levelUpGlow 1.5s ease-in-out infinite',
            boxShadow: '0 2px 12px rgba(245,158,11,0.4)',
          }}>
            🎁 一键收取所有奖励
          </button>
        </div>
      )}

      <OnlineRewardsBar
        sessionMinutes={sessionMinutes}
        claimed={onlineRewardsClaimed}
        onClaim={(min) => {
          const r = claimOnlineReward(min);
          if (r) {
            setRewardToast(`🎁 ${r.desc}：+${r.gold}💰 +${r.exp}📖${r.pantao > 0 ? ` +${r.pantao}🍑` : ''}`);
            setTimeout(() => setRewardToast(null), 3000);
          }
        }}
      />

      {rewardToast && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #4a1a8a, #7c3aed)', color: '#fff',
          padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          zIndex: 999, boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
          animation: 'dropIn 0.3s ease-out',
        }}>{rewardToast}</div>
      )}
      <BossToast />
    </div>
  );
}

/** v139.0: Show estimated offline earnings for 1h/4h/8h */
function OfflineEstimate({ goldPerSec, expPerSec }: { goldPerSec: number; expPerSec: number }) {
  const [show, setShow] = useState(false);
  if (!show) {
    return (
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <span onClick={() => setShow(true)} style={{ fontSize: 10, color: '#666', cursor: 'pointer', textDecoration: 'underline dotted' }}>
          💤 离线收益预估
        </span>
      </div>
    );
  }
  const periods = [
    { label: '1小时', secs: 3600 },
    { label: '4小时', secs: 14400 },
    { label: '8小时', secs: 28800 },
  ];
  // Offline efficiency is typically 50% of online
  const offlineRate = 0.5;
  return (
    <div style={{ marginTop: 4, padding: '4px 8px', background: 'rgba(59,130,246,0.08)', borderRadius: 6, border: '1px solid rgba(59,130,246,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600 }}>💤 离线收益预估（约50%效率）</span>
        <span onClick={() => setShow(false)} style={{ fontSize: 10, color: '#666', cursor: 'pointer' }}>✕</span>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {periods.map(p => (
          <div key={p.label} style={{ textAlign: 'center', fontSize: 10 }}>
            <div style={{ color: '#93c5fd', fontWeight: 600 }}>{p.label}</div>
            <div style={{ color: '#fbbf24' }}>💰{formatNumber(Math.floor(goldPerSec * p.secs * offlineRate))}</div>
            <div style={{ color: '#34d399' }}>📖{formatNumber(Math.floor(expPerSec * p.secs * offlineRate))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
