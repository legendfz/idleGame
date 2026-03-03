/**
 * LeaderboardPanel — 排行榜UI
 */
import { useMemo } from 'react';
import { generateLeaderboard } from '../../engine/leaderboard';
import { usePlayerStore } from '../../store/player';
import { getRealmConfig } from '../../data/config';

export function LeaderboardPanel() {
  const player = usePlayerStore(s => s.player);
  const realm = getRealmConfig(player.realmId);
  const realmOrder = realm?.order ?? 0;
  const power = Math.floor(Number(player.totalXiuwei) / 1000) + player.totalKills * 10;

  const entries = useMemo(
    () => generateLeaderboard('悟空', realmOrder, Math.max(power, 100)),
    [realmOrder, Math.floor(power / 100)], // 每100战力变化才重算
  );

  const playerRank = entries.findIndex(e => e.isPlayer) + 1;

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🏆 排行榜</h2>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}>
        你的排名: 第 {playerRank} 名 / {entries.length}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map((entry, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8,
            background: entry.isPlayer ? 'rgba(255,165,0,0.15)' : i % 2 === 0 ? 'var(--color-bg-elevated)' : 'transparent',
            border: entry.isPlayer ? '1px solid var(--color-accent)' : 'none',
          }}>
            <span style={{ width: 24, textAlign: 'center', fontWeight: 'bold', fontSize: 13, color: i < 3 ? '#ffd54f' : 'var(--color-text-muted)' }}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
            </span>
            <span style={{ fontSize: 20 }}>{entry.icon}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: entry.isPlayer ? 'bold' : 'normal' }}>{entry.name}</span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 6 }}>{entry.realmName}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-accent)' }}>{entry.power.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
