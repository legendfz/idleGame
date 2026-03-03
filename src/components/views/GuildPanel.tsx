/**
 * GuildPanel — 仙盟管理+任务+仓库
 */
import { useState } from 'react';
import { useGuildStore } from '../../store/guild';
import { guildLevelExp } from '../../engine/guild';

export function GuildPanel() {
  const state = useGuildStore(s => s.state);
  const createGuild = useGuildStore(s => s.createGuild);
  const leaveGuild = useGuildStore(s => s.leaveGuild);
  const claimQuest = useGuildStore(s => s.claimQuest);
  const [guildName, setGuildName] = useState('');

  if (!state.joined) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <h2>🏯 仙盟</h2>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏯</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>创建你的仙盟，召集志同道合的修仙者</div>
        <input value={guildName} onChange={e => setGuildName(e.target.value)} placeholder="仙盟名称"
          style={{ width: '80%', padding: 8, borderRadius: 8, border: '1px solid var(--color-border, #333)', background: 'var(--color-bg-elevated)', color: '#fff', marginBottom: 8, textAlign: 'center' }} />
        <br />
        <button disabled={!guildName.trim()} onClick={() => createGuild(guildName.trim())} style={{
          padding: '10px 24px', background: guildName.trim() ? 'var(--color-primary)' : 'var(--color-bg-muted)',
          border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: guildName.trim() ? 'pointer' : 'not-allowed',
        }}>创建仙盟</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🏯 {state.name}</h2>
        <button onClick={leaveGuild} style={{ padding: '4px 10px', background: '#e74c3c', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, cursor: 'pointer' }}>退出</button>
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
        Lv.{state.level} · EXP {state.exp}/{guildLevelExp(state.level)} · 贡献 {state.contribution} · 成员 {state.members.length}
      </div>

      <div style={{ fontSize: 11, color: 'var(--color-accent)', marginBottom: 12 }}>
        🔥 仙盟加成: 修炼速度+{state.level * 5}%
      </div>

      <h3 style={{ fontSize: 13, marginBottom: 6 }}>📋 仙盟任务</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {state.quests.map(q => (
          <div key={q.id} style={{
            background: 'var(--color-bg-elevated)', borderRadius: 8, padding: '8px 10px',
            border: q.claimed ? '1px solid #4caf50' : '1px solid var(--color-border, #333)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>{q.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{q.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div style={{ fontSize: 10 }}>
                进度 {Math.min(q.progress, q.target)}/{q.target} · 奖励 {q.reward.coins}💰 {q.reward.contribution}贡献
              </div>
              {q.claimed ? <span style={{ color: '#4caf50', fontSize: 11 }}>✅</span> :
                q.progress >= q.target ? <button onClick={() => claimQuest(q.id)} style={{ padding: '3px 8px', background: 'var(--color-primary)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, cursor: 'pointer' }}>领取</button> : null}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 13, marginBottom: 6 }}>👥 成员</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
        {state.members.map((m, i) => (
          <span key={i} style={{ color: m.isPlayer ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
            {m.icon}{m.name}({m.contribution})
          </span>
        ))}
      </div>
    </div>
  );
}
