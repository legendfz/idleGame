import { useState, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDailyStore } from '../store/dailyStore';
import { formatNumber, expForLevel, formatTime } from '../utils/format';
import { REALMS } from '../data/realms';
import { CHAPTERS, ABYSS_CHAPTER_ID } from '../data/chapters';
import { ACTIVE_SKILLS } from '../data/skills';
import { CONSUMABLE_BUFFS } from '../data/consumables';
import { Card, FloatingDamage, BossToast } from './shared';
import { WorldBossBanner, WorldBossModal } from '../components/WorldBossPanel';

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

  const useSkill = useGameStore(s => s.useSkill);
  const activeSkills = useGameStore(s => s.player.activeSkills);
  const [showWorldBoss, setShowWorldBoss] = useState(false);
  const sessionMinutes = Math.floor(idleStats.sessionTime / 60);
  const onlineRewardsClaimed = useGameStore(s => s.onlineRewardsClaimed);
  const claimOnlineReward = useGameStore(s => s.claimOnlineReward);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const highestPower = useGameStore(s => s.highestPower);
  const dailyCanSignIn = useDailyStore(s => s.canSignIn);
  const dailySignIn = useDailyStore(s => s.signIn);
  const dailyCheckCanSignIn = useDailyStore(s => s.checkCanSignIn);

  // v58.0: one-click collect all pending rewards
  const collectAll = useCallback(() => {
    const msgs: string[] = [];
    // 1) Daily sign-in
    dailyCheckCanSignIn();
    const dailyResult = dailySignIn();
    if (dailyResult) {
      const r = dailyResult.reward;
      // Apply daily rewards to game store
      const state = useGameStore.getState();
      const updates: any = {};
      if (r.lingshi) updates.lingshi = state.player.lingshi + r.lingshi;
      if (r.pantao) updates.pantao = state.player.pantao + r.pantao;
      if (r.shards) updates.hongmengShards = state.player.hongmengShards + r.shards;
      if (Object.keys(updates).length > 0) {
        useGameStore.setState({ player: { ...state.player, ...updates } });
      }
      msgs.push(`📅签到: ${r.desc}`);
    }
    // 2) Online milestones
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

  // Check if there are unclaimed rewards
  const hasUnclaimedRewards = useMemo(() => {
    const unclaimedMilestones = [10, 30, 60, 120, 240].some(m => sessionMinutes >= m && !onlineRewardsClaimed.includes(m));
    return unclaimedMilestones || dailyCanSignIn;
  }, [sessionMinutes, onlineRewardsClaimed, dailyCanSignIn]);

  return (
    <div className="main-content fade-in">
      {/* World Boss Banner */}
      <WorldBossBanner onOpen={() => setShowWorldBoss(true)} />
      {showWorldBoss && <WorldBossModal onClose={() => setShowWorldBoss(false)} />}
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

      {/* v52.0: Active Skills Bar */}
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

      <Card className="stats-card">
        <div className="stats-row">
          <span className="color-attack">⚔ {formatNumber(eStats.attack)}</span>
          <span className="color-hp">❤ {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">💥 {eStats.critRate.toFixed(0)}%</span>
          <span style={{ color: '#ffcc00', fontWeight: 700 }}>⭐ {formatNumber(Math.floor(eStats.attack * (1 + (eStats.critRate / 100) * ((eStats.critDmg || 150) / 100)) + eStats.maxHp * 0.05))}</span>
          {highestPower > 0 && <span style={{ color: '#888', fontSize: 10 }}>🏆{formatNumber(highestPower)}</span>}
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
          {idleStats.sessionTime > 60 && <>
            {'  '}<span style={{color:'#a78bfa',fontSize:10}}>💎{formatNumber(Math.floor(idleStats.goldPerSec * 60))}/m</span>
          </>}
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
      {/* v58.0: One-click collect all */}
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

function SkillBar() {
  const player = useGameStore(s => s.player);
  const useSkill = useGameStore(s => s.useSkill);
  const skills = ACTIVE_SKILLS.filter(s => player.level >= s.unlockLevel);

  if (skills.length === 0) return null;

  return (
    <div className="skill-bar">
      {skills.map(skill => {
        const cd = player.activeSkills.cooldowns[skill.id] ?? 0;
        const buffActive = (player.activeSkills.buffs[skill.id] ?? 0) > 0;
        const buffTime = player.activeSkills.buffs[skill.id] ?? 0;
        const onCooldown = cd > 0;
        const cdPct = onCooldown ? (cd / skill.cooldown) * 100 : 0;

        return (
          <button
            key={skill.id}
            className={`skill-btn${buffActive ? ' skill-active' : ''}${onCooldown ? ' skill-cd' : ''}`}
            onClick={() => useSkill(skill.id)}
            disabled={onCooldown}
            title={skill.description}
          >
            <span className="skill-emoji">{skill.emoji}</span>
            <span className="skill-name">{skill.name}</span>
            {onCooldown && (
              <>
                <div className="skill-cd-overlay" style={{ height: `${cdPct}%` }} />
                <span className="skill-cd-text">{cd}s</span>
              </>
            )}
            {buffActive && <span className="skill-buff-text">{buffTime}s</span>}
          </button>
        );
      })}
    </div>
  );
}

const ONLINE_MILESTONES = [10, 30, 60, 120, 240];
const MILESTONE_LABELS: Record<number, string> = { 10: '10分', 30: '30分', 60: '1时', 120: '2时', 240: '4时' };

function OnlineRewardsBar({ sessionMinutes, claimed, onClaim }: {
  sessionMinutes: number;
  claimed: number[];
  onClaim: (min: number) => void;
}) {
  const unclaimed = ONLINE_MILESTONES.filter(m => sessionMinutes >= m && !claimed.includes(m));
  if (unclaimed.length === 0 && !ONLINE_MILESTONES.some(m => !claimed.includes(m))) return null;

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', margin: '6px 0', flexWrap: 'wrap' }}>
      {ONLINE_MILESTONES.map(m => {
        const canClaim = sessionMinutes >= m && !claimed.includes(m);
        const done = claimed.includes(m);
        const locked = sessionMinutes < m;
        return (
          <button key={m} onClick={() => canClaim && onClaim(m)} disabled={!canClaim}
            style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 8, cursor: canClaim ? 'pointer' : 'default',
              background: canClaim ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : done ? 'rgba(34,197,94,0.2)' : 'rgba(100,100,100,0.2)',
              border: canClaim ? '1px solid #f59e0b' : '1px solid rgba(100,100,100,0.3)',
              color: canClaim ? '#fff' : done ? '#4ade80' : '#666',
              animation: canClaim ? 'levelUpGlow 1.5s ease-in-out infinite' : 'none',
              fontWeight: canClaim ? 700 : 400,
            }}>
            {done ? '✅' : canClaim ? '🎁' : '🔒'} {MILESTONE_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}

function ConsumableBar() {
  const player = useGameStore(s => s.player);
  const useConsumable = useGameStore(s => s.useConsumable);
  const inv = player.consumableInventory ?? {};
  const actives = player.activeConsumables ?? [];
  const available = CONSUMABLE_BUFFS.filter(b => (inv[b.id] ?? 0) > 0);

  if (available.length === 0 && actives.length === 0) return null;

  const fmtTime = (s: number) => s >= 60 ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` : `${s}s`;

  return (
    <div style={{ margin: '6px 0' }}>
      {actives.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, justifyContent: 'center' }}>
          {actives.map(ac => {
            const def = CONSUMABLE_BUFFS.find(b => b.id === ac.buffId);
            if (!def) return null;
            return (
              <span key={ac.buffId} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(255,200,50,0.2), rgba(255,100,50,0.2))',
                border: '1px solid rgba(255,200,50,0.4)', color: '#ffd700',
              }}>
                {def.emoji} {def.name} {fmtTime(ac.remainingSec)}
              </span>
            );
          })}
        </div>
      )}
      {available.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {available.map(buff => (
            <button key={buff.id} onClick={() => useConsumable(buff.id)}
              title={buff.description}
              style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(100,50,200,0.2)', border: '1px solid rgba(150,100,255,0.4)',
                color: '#ccc',
              }}>
              {buff.emoji} {buff.name} ×{inv[buff.id]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
