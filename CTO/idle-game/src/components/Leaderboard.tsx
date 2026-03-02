/**
 * v1.3 排行榜页面（本地）
 */

import { useState } from 'react';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { formatNumber } from '../utils/format';

const TABS = [
  { key: 'combat_power', label: '🏆 战力' },
  { key: 'total_kills', label: '💀 击杀' },
  { key: 'max_level', label: '📈 等级' },
] as const;

export default function Leaderboard() {
  const [tab, setTab] = useState<string>('combat_power');
  const rankings = useLeaderboardStore(s => s.getRanking(tab));

  return (
    <div className="leaderboard fade-in">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 8 }}>🏆 排行榜</h3>

      <div className="bag-filters" style={{ marginBottom: 8 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`filter-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rankings.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8b8b9e', padding: 24 }}>
          暂无记录，继续冒险吧！
        </div>
      ) : (
        rankings.map((entry, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
          return (
            <div key={`${entry.timestamp}-${i}`} className="inv-item" style={{ borderLeftColor: i < 3 ? '#f0c040' : '#555' }}>
              <div className="equip-header">
                <span>{medal} {entry.playerName}</span>
                <span style={{ color: '#f0c040', fontWeight: 'bold' }}>{formatNumber(entry.score)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#8b8b9e' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
