import { useEffect, useState } from 'react';
import { useDailyStore, DAILY_REWARDS_DATA } from '../store/dailyStore';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/format';

// v99.0: Login milestone rewards
const LOGIN_MILESTONES = [
  { days: 3,  lingshi: 20000,  pantao: 10, shards: 5,  label: '3日签到' },
  { days: 7,  lingshi: 50000,  pantao: 30, shards: 10, label: '7日签到' },
  { days: 14, lingshi: 150000, pantao: 60, shards: 20, label: '14日签到' },
  { days: 30, lingshi: 500000, pantao: 150, shards: 50, label: '30日签到' },
  { days: 60, lingshi: 1500000, pantao: 300, shards: 100, label: '60日签到' },
  { days: 100, lingshi: 5000000, pantao: 500, shards: 200, label: '100日签到' },
];

export function DailyPanel() {
  const { currentDay, totalSignIns, canSignIn, checkCanSignIn, signIn } = useDailyStore();

  useEffect(() => { checkCanSignIn(); }, [checkCanSignIn]);

  const handleSignIn = () => {
    const result = signIn();
    if (!result) return;
    const r = result.reward;
    // Apply rewards directly via setState
    useGameStore.setState(state => {
      const p = { ...state.player };
      if (r.lingshi) p.lingshi += r.lingshi;
      if (r.pantao) p.pantao += r.pantao;
      if (r.shards) p.hongmengShards += r.shards;
      if (r.scrollType === 'tianming') p.tianmingScrolls += 1;
      if (r.scrollType === 'lucky') p.luckyScrolls += 1;
      // v53.0: Consumable rewards
      if (r.consumable) {
        const inv = { ...(p.consumableInventory ?? {}) };
        inv[r.consumable.id] = (inv[r.consumable.id] ?? 0) + r.consumable.count;
        p.consumableInventory = inv;
      }
      return { player: p };
    });
    useGameStore.getState().save();
  };

  const todayIndex = (currentDay - 1) % 7;

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">📅 每日签到</h3>
      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
        累计签到 {totalSignIns} 天
      </div>

      <div className="daily-grid">
        {DAILY_REWARDS_DATA.map((r, i) => {
          const isPast = i < todayIndex;
          const isToday = i === todayIndex;
          const signed = isToday && !canSignIn;

          return (
            <div key={i} className={`daily-cell ${signed || isPast ? 'signed' : ''} ${isToday && canSignIn ? 'today' : ''} ${!signed && !isPast && !isToday ? 'future' : ''}`}>
              <div className="daily-day">第{r.day}天</div>
              <div className="daily-reward">{r.desc}</div>
              {(signed || isPast) && <div className="daily-check">✓</div>}
              {isToday && canSignIn && <div className="daily-available">可领</div>}
            </div>
          );
        })}
      </div>

      {canSignIn ? (
        <button className="sign-in-btn pulse-glow" onClick={handleSignIn}>
          🎁 签到领取 — {DAILY_REWARDS_DATA[todayIndex].desc}
        </button>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '16px 0', fontSize: 13 }}>
          ✅ 今日已签到，明天再来！
        </div>
      )}

      {/* v99.0: Login milestones */}
      <LoginMilestones totalSignIns={totalSignIns} />
    </div>
  );
}

function LoginMilestones({ totalSignIns }: { totalSignIns: number }) {
  const [claimed, setClaimed] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('idlegame_login_milestones') || '[]'); } catch { return []; }
  });

  const claimMilestone = (days: number) => {
    const ms = LOGIN_MILESTONES.find(m => m.days === days);
    if (!ms || claimed.includes(days) || totalSignIns < days) return;
    useGameStore.setState(state => {
      const p = { ...state.player };
      p.lingshi += ms.lingshi;
      p.pantao += ms.pantao;
      p.hongmengShards += ms.shards;
      return { player: p };
    });
    useGameStore.getState().save();
    const next = [...claimed, days];
    setClaimed(next);
    localStorage.setItem('idlegame_login_milestones', JSON.stringify(next));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 8 }}>🏆 签到里程碑</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {LOGIN_MILESTONES.map(ms => {
          const done = claimed.includes(ms.days);
          const canClaim = totalSignIns >= ms.days && !done;
          return (
            <div key={ms.days} onClick={() => canClaim && claimMilestone(ms.days)} style={{
              padding: '8px 4px', borderRadius: 8, textAlign: 'center', fontSize: 11, cursor: canClaim ? 'pointer' : 'default',
              background: done ? 'rgba(34,197,94,0.15)' : canClaim ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${done ? '#22c55e44' : canClaim ? '#fbbf2466' : 'var(--border)'}`,
              animation: canClaim ? 'pulse-glow 2s infinite' : 'none',
            }}>
              <div style={{ fontWeight: 'bold', color: done ? '#22c55e' : canClaim ? '#fbbf24' : 'var(--text-dim)' }}>
                {ms.label} {done ? '✓' : canClaim ? '🎁' : `${totalSignIns}/${ms.days}`}
              </div>
              <div style={{ color: 'var(--text-dim)', marginTop: 2 }}>
                💰{formatNumber(ms.lingshi)} 🍑{ms.pantao} 💎{ms.shards}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
