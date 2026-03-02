/**
 * v1.3 成就列表页
 */

import { useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import { useAchievementStore } from '../store/achievementStore';

export default function AchievementList() {
  const states = useAchievementStore(s => s.states);
  const selectedTitle = useAchievementStore(s => s.selectedTitle);
  const unlockedTitles = useAchievementStore(s => s.unlockedTitles);
  const selectTitle = useAchievementStore(s => s.selectTitle);
  const [filter, setFilter] = useState<'all' | 'milestone' | 'challenge'>('all');

  const filtered = ACHIEVEMENTS.filter(a => filter === 'all' || a.category === filter);
  const completedCount = ACHIEVEMENTS.filter(a => states[a.id]?.completed).length;

  return (
    <div className="achievement-list fade-in">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 4 }}>🏆 成就</h3>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#8b8b9e', marginBottom: 8 }}>
        已完成 {completedCount}/{ACHIEVEMENTS.length} ({Math.floor((completedCount / ACHIEVEMENTS.length) * 100)}%)
      </div>

      {/* Title selector */}
      <div style={{ textAlign: 'center', fontSize: 12, marginBottom: 8 }}>
        称号：
        <select
          value={selectedTitle}
          onChange={e => selectTitle(e.target.value)}
          style={{ background: '#1a1a2e', color: '#e0e0e0', border: '1px solid #2a2a4a', borderRadius: 4, padding: '2px 4px', fontSize: 11 }}
        >
          {unlockedTitles.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Filter */}
      <div className="bag-filters" style={{ marginBottom: 8 }}>
        {([['all', '全部'], ['milestone', '🏅里程碑'], ['challenge', '⚡挑战']] as const).map(([key, label]) => (
          <button
            key={key}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.map(ach => {
        const state = states[ach.id];
        const completed = state?.completed ?? false;
        const progress = state?.progress ?? 0;

        return (
          <div
            key={ach.id}
            className="inv-item"
            style={{
              borderLeftColor: completed ? '#4caf50' : progress > 0 ? '#f0c040' : '#555',
              opacity: completed ? 0.7 : 1,
            }}
          >
            <div className="equip-header">
              <span>{ach.icon} {ach.name} {completed && '✅'}</span>
              <span style={{ fontSize: 11, color: '#8b8b9e' }}>{ach.category === 'milestone' ? '里程碑' : '挑战'}</span>
            </div>
            <div style={{ fontSize: 11, color: '#8b8b9e' }}>{ach.description}</div>
            {!completed && progress > 0 && (
              <div style={{ marginTop: 4 }}>
                <div className="hp-bar-container" style={{ height: 6 }}>
                  <div className="hp-bar" style={{ width: `${progress * 100}%`, background: '#f0c040' }} />
                </div>
                <div style={{ fontSize: 10, color: '#8b8b9e', textAlign: 'right' }}>
                  {Math.floor(progress * 100)}%
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#64b5f6', marginTop: 2 }}>🎁 {ach.reward.description}</div>
          </div>
        );
      })}
    </div>
  );
}
