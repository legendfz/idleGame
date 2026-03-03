/**
 * PvpPanel — 擂台界面
 */
import { useEffect } from 'react';
import { usePvpStore } from '../../store/pvp';
import { PVP_DAILY_LIMIT } from '../../engine/pvp';

export function PvpPanel() {
  const state = usePvpStore(s => s.state);
  const opponents = usePvpStore(s => s.opponents);
  const refreshOpponents = usePvpStore(s => s.refreshOpponents);
  const fight = usePvpStore(s => s.fight);
  const remaining = PVP_DAILY_LIMIT - state.dailyAttempts;

  useEffect(() => { if (opponents.length === 0) refreshOpponents(); }, []);

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>⚔️ 擂台</h2>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
        仙誉: {state.honor} · 排名: 第{state.rank}名 · 今日剩余: {remaining}/{PVP_DAILY_LIMIT}
      </div>

      <h3 style={{ fontSize: 13, marginBottom: 6 }}>🎯 对手</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {opponents.map((opp, i) => (
          <div key={i} style={{
            background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px 12px',
            border: '1px solid var(--color-border, #333)', display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <span style={{ fontSize: 24 }}>{opp.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: 13 }}>{opp.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                战力 {opp.power.toLocaleString()} · {opp.realmName === '强' ? '🔴强' : opp.realmName === '弱' ? '🟢弱' : '🟡均'}
              </div>
            </div>
            <button disabled={remaining <= 0} onClick={() => fight(i)} style={{
              padding: '5px 12px', background: remaining > 0 ? 'var(--color-primary)' : 'var(--color-bg-muted)',
              border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, cursor: remaining > 0 ? 'pointer' : 'not-allowed',
            }}>挑战</button>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 13, marginBottom: 6 }}>📜 战斗日志</h3>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
        {state.logs.length === 0 ? '暂无记录' : state.logs.slice(0, 10).map((log, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {log.won ? '✅' : '❌'} vs {log.opponent} · 仙誉{log.honorChange > 0 ? '+' : ''}{log.honorChange}
          </div>
        ))}
      </div>
    </div>
  );
}
