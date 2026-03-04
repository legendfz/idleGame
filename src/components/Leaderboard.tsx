/**
 * 排行榜页面
 */

import { useState } from 'react';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { LEADERBOARD_CONFIGS } from '../data/leaderboards';
import { formatNumber } from '../utils/format';
import TabBar from './shared/TabBar';

const RANK_ICONS = ['', '1st', '2nd', '3rd'];
const RANK_COLORS = ['', '#ffd700', '#c0c0c0', '#cd7f32'];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState(LEADERBOARD_CONFIGS[0].id);
  const config = LEADERBOARD_CONFIGS.find(c => c.id === activeTab) ?? LEADERBOARD_CONFIGS[0];

  const storeType = config.scoreType === 'dungeon_time' && config.dungeonId
    ? `dungeon_speed_${config.dungeonId}`
    : config.scoreType;
  const rankings = useLeaderboardStore(s => s.getRanking(storeType));

  const isSpeed = config.sortBy === 'asc';

  const tabs = LEADERBOARD_CONFIGS.map(c => ({
    id: c.id,
    label: c.name.replace('排行', ''),
    icon: c.icon,
  }));

  return (
    <div className="leaderboard fade-in">
      <div className="page-title-bar">
        <span>═══ 排行榜 ═══</span>
      </div>

      <TabBar
        tabs={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        scrollable
      />

      <div className="lb-category-title">
        ── {config.icon} {config.name} ──
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>
        {config.description}
      </div>

      {rankings.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>
          暂无记录，继续冒险吧！
        </div>
      ) : (
        <div className="lb-list">
          {rankings.map((entry, i) => {
            const rank = i + 1;
            return (
              <div key={`${entry.timestamp}-${i}`} className="lb-row">
                <span
                  className="lb-rank"
                  style={rank <= 3 ? { color: RANK_COLORS[rank] } : undefined}
                >
                  {rank <= 3 ? RANK_ICONS[rank] : `${rank}.`}
                </span>
                <span className="lb-value">
                  {isSpeed ? `${entry.score}秒` : formatNumber(entry.score)}
                </span>
                <span className="lb-date">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {rankings.length > 0 && (
        <div className="lb-current">
          <div>最佳记录：{isSpeed ? `${rankings[0].score}秒` : formatNumber(rankings[0].score)}</div>
        </div>
      )}
    </div>
  );
}
