import { useState, useMemo, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDailyStore } from '../store/dailyStore';
import { formatNumber, expForLevel, formatTime } from '../utils/format';
import { REALMS } from '../data/realms';
import { CHAPTERS, ABYSS_CHAPTER_ID } from '../data/chapters';
import { TITLES } from '../data/titles';
import { Card } from './shared';
import { StatBreakdownModal } from '../components/StatBreakdown';
import { useAutoWorldBoss } from '../components/WorldBossPanel';
import { WorldBossBanner, WorldBossModal } from '../components/WorldBossPanel';
import {
  SmartHints, PinnedAchievementTracker, SkillBar, ConsumableBar,
  OnlineRewardsBar, AbyssMilestoneBar, QuickActions,
  RandomEventModal, BattleLog, EnemyDisplay, WeatherIndicator,
} from '../components/battle';
import { ACHIEVEMENTS } from '../data/achievements';
import { useAchievementStore } from '../store/achievementStore';

const SPEED_OPTIONS = [1, 2, 5, 10, 20, 50, 100];

const TIPS = [
  '💡 装备可强化至+15，+11以上有失败风险',
  '💡 混沌品质装备可精炼为鸿蒙装备',
  '💡 转世可获得道点，兑换永久加成',
  '💡 洞天建筑提供持续增益，记得升级',
  '💡 秘境探索可获得稀有材料和装备',
  '💡 每日签到可领取丰厚奖励',
  '💡 战斗速度可通过底部按钮切换',
  '💡 套装效果需要收集同系列装备激活',
  '💡 宝石镶嵌可大幅提升装备属性',
  '💡 五行克制可增加30%伤害',
];

export default function BattlePage() {
  useAutoWorldBoss();
  const battle = useGameStore(s => s.battle);
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const idleStats = useGameStore(s => s.idleStats);
  const battleSpeed = useGameStore(s => s.battleSpeed) || 1;
  const setBattleSpeed = useGameStore(s => s.setBattleSpeed);
  const killStreak = battle.killStreak || 0;
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const equippedTitleId = useGameStore(s => s.equippedTitle);
  const equippedTitle = equippedTitleId ? TITLES.find(t => t.id === equippedTitleId) : null;
  const eStats = getEffectiveStats();
  const expPct = Math.min(100, (player.exp / expForLevel(player.level)) * 100);
  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);
  const chapterProgress = chapter ? Math.min(100, (battle.stageNum / chapter.stages) * 100) : 0;
  const isAbyss = battle.chapterId === ABYSS_CHAPTER_ID;
  const currentRealm = REALMS.filter(r => player.level >= r.levelReq).pop();
  const nextRealm = REALMS.find(r => player.level < r.levelReq);
  const canBreakthrough = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;
  const highestPower = useGameStore(s => s.highestPower) || 0;
  const onlineRewardsClaimed = useGameStore(s => s.onlineRewardsClaimed) || [];
  const claimOnlineReward = useGameStore(s => s.claimOnlineReward);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const fateBlessing = useGameStore(s => s.fateBlessing) || { active: false, expiresAt: 0 };
  const luckyMoment = useGameStore(s => s.luckyMoment);
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

  const sessionMinutes = Math.floor(idleStats.sessionTime / 60);
  const hasUnclaimedRewards = useMemo(() => {
    const unclaimedMilestones = [10, 30, 60, 120, 240].some(m => sessionMinutes >= m && !onlineRewardsClaimed.includes(m));
    return unclaimedMilestones || dailyCanSignIn;
  }, [sessionMinutes, onlineRewardsClaimed, dailyCanSignIn]);

  const sessionStartRef = useRef({ gold: player.totalGoldEarned, kills: player.totalKills });
  const sessionGold = player.totalGoldEarned - sessionStartRef.current.gold;
  const sessionKills = player.totalKills - sessionStartRef.current.kills;

  const availableSpeeds = useMemo(() => {
    return SPEED_OPTIONS.filter(s => {
      if (s <= 10) return true;
      if (s === 20) return player.level >= 100;
      if (s === 50) return player.level >= 300;
      if (s === 100) return player.level >= 1000;
      return true;
    });
  }, [player.level]);
  const cycleSpeed = () => {
    const idx = availableSpeeds.indexOf(battleSpeed);
    setBattleSpeed(availableSpeeds[(idx + 1) % availableSpeeds.length]);
  };

  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);
  const [showWorldBoss, setShowWorldBoss] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div className="main-content fade-in">
      {player.level >= 50 && <WorldBossBanner onOpen={() => setShowWorldBoss(true)} />}
      {showWorldBoss && player.level >= 50 && <WorldBossModal onClose={() => setShowWorldBoss(false)} />}
      {showBreakdown && <StatBreakdownModal onClose={() => setShowBreakdown(false)} />}

      <RandomEventModal />
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
        <button className={`battle-speed-btn${battleSpeed === 100 ? ' speed-100' : battleSpeed === 2 ? ' active' : battleSpeed === 5 ? ' speed-5' : battleSpeed >= 10 ? ' speed-10' : ''}`} onClick={cycleSpeed}>
          {battleSpeed}x
        </button>
      </div>

      {isAbyss && <AbyssMilestoneBar />}

      <EnemyDisplay />
      <SkillBar />
      <ConsumableBar />
      <QuickActions />

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
              🔥{killStreak}{killStreak >= 30 && <span style={{ fontSize: 10, color: '#34d399' }}> ⚡{killStreak >= 100 ? '×2' : '×1.5'}加速</span>}
            </span>
          )}
        </div>
      </Card>

      <WeatherIndicator />

      {/* Idle stats */}
      <Card className="idle-stats-card">
        <div className="idle-stats">
          <span className="color-gold">💰+{formatNumber(Math.floor(idleStats.goldPerSec))}/s</span>
          {'  '}<span className="color-exp">📖+{formatNumber(Math.floor(idleStats.expPerSec))}/s</span>
          {'  '}<span className="color-crit">⚔DPS {formatNumber(Math.floor(idleStats.dps))}</span>
          {'  '}<span className="color-dim">⏱{formatTime(idleStats.sessionTime)}</span>
          {battleSpeed > 1 && <span style={{color: battleSpeed >= 100 ? '#ff6b6b' : battleSpeed >= 10 ? '#ffc107' : '#a78bfa', fontSize:10, fontWeight: 700}}>⚡{battleSpeed}x</span>}
          {fateBlessing.active && fateBlessing.expiresAt > Date.now() && <span style={{color:'#ffd700',fontSize:10,fontWeight:700}}>✨×2</span>}
          {luckyMoment?.active && luckyMoment.expiresAt > Date.now() && <span style={{color:'#4ade80',fontSize:10,fontWeight:700}}>🍀×1.5</span>}
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
        {sessionKills > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: 10, color: '#888', marginTop: 2, flexWrap: 'wrap' }}>
            <span>本次：</span>
            <span style={{ color: '#fbbf24' }}>💰{formatNumber(sessionGold)}</span>
            <span style={{ color: '#f87171' }}>💀{formatNumber(sessionKills)}</span>
            {sessionMinutes > 0 && <span style={{ color: '#60a5fa' }}>⚡{formatNumber(Math.floor(sessionKills / sessionMinutes))}/m</span>}
            {sessionMinutes > 0 && <span style={{ color: '#fcd34d' }}>💰{formatNumber(Math.floor(sessionGold / sessionMinutes))}/m</span>}
            {player.reincarnations > 0 && <span style={{ color: '#c084fc' }}>🔄{player.reincarnations}世</span>}
            <span style={{ color: '#34d399' }}>🏆{Object.values(useAchievementStore.getState().states).filter(s => s?.completed).length}/{ACHIEVEMENTS.length}</span>
          </div>
        )}
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

      {/* Lucky Moment */}
      {luckyMoment?.active && luckyMoment.expiresAt > Date.now() && (
        <div style={{ textAlign: 'center', padding: '2px 0' }}>
          <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 700, background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: 8, border: '1px solid rgba(74,222,128,0.3)', animation: 'levelUpGlow 2s infinite' }}>
            🍀 幸运时刻 ×1.5 — {formatTime(Math.max(0, Math.floor((luckyMoment.expiresAt - Date.now()) / 1000)))}
          </span>
        </div>
      )}

      <BattleLog />

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
    </div>
  );
}

/** Offline earnings estimate */
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
