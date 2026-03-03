/**
 * FestivalPanel — 活动增强界面
 */
import { useFestivalStore } from '../../store/festival';
import { FESTIVAL_DEFS } from '../../engine/festival';
import { useState, useEffect } from 'react';

export function FestivalPanel() {
  const state = useFestivalStore(s => s.state);
  const start = useFestivalStore(s => s.start);
  const claimTier = useFestivalStore(s => s.claimTier);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const active = state.active;
  const remaining = active ? Math.max(0, active.endTime - now) : 0;
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🎊 竞技活动</h2>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
        已参与 {state.history} 次活动
      </div>

      {active ? (
        <div style={{
          background: 'rgba(255,165,0,0.1)', border: '1px solid var(--color-accent)',
          borderRadius: 12, padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{active.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 14 }}>{active.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{active.desc}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, marginBottom: 4 }}>当前积分: <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{active.score}</span></div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>⏰ {h}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</div>

          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {active.rewardTiers.map((tier, i) => {
              const reached = active.score >= tier.threshold;
              const claimed = active.claimed[i];
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: reached ? '#4caf50' : 'var(--color-text-muted)' }}>
                    {reached ? '✅' : '🔒'} {tier.threshold}分 → {tier.reward.coins}💰 {tier.reward.merit}功德
                  </span>
                  {reached && !claimed && (
                    <button onClick={() => claimTier(i)} style={{ padding: '2px 8px', background: 'var(--color-primary)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 10, cursor: 'pointer' }}>领取</button>
                  )}
                  {claimed && <span style={{ color: '#4caf50' }}>已领</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>
            选择一个活动开始挑战
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FESTIVAL_DEFS.map(def => (
              <div key={def.type} style={{
                background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px 12px',
                border: '1px solid var(--color-border, #333)', display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{ fontSize: 28 }}>{def.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>{def.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc} · {def.durationSec / 3600}h</div>
                </div>
                <button onClick={() => start(def.type)} style={{
                  padding: '5px 12px', background: 'var(--color-primary)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, cursor: 'pointer',
                }}>开始</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
