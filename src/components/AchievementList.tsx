/**
 * 成就列表页
 */

import { useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import { useAchievementStore } from '../store/achievementStore';
import { useGameStore } from '../store/gameStore';
import TabBar from './shared/TabBar';
import MiniProgressBar from './shared/MiniProgressBar';

export default function AchievementList() {
  const states = useAchievementStore(s => s.states);
  const selectedTitle = useAchievementStore(s => s.selectedTitle);
  const unlockedTitles = useAchievementStore(s => s.unlockedTitles);
  const selectTitle = useAchievementStore(s => s.selectTitle);
  const pinnedAch = useGameStore(s => s.player.pinnedAchievement);
  const pinAchievement = useGameStore(s => s.pinAchievement);
  const [activeTab, setActiveTab] = useState<string>('milestone');

  const filtered = ACHIEVEMENTS.filter(a =>
    activeTab === 'all' ? true : a.category === activeTab
  );
  const completedCount = ACHIEVEMENTS.filter(a => states[a.id]?.completed).length;
  const pct = Math.round((completedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="achievement-panel fade-in">
      {/* Title + progress */}
      <div className="page-title-bar">
        <span>═══ 成就 ═══</span>
      </div>

      <div className="achievement-summary">
        <span>完成进度：{completedCount}/{ACHIEVEMENTS.length} ({pct}%)</span>
        <MiniProgressBar current={completedCount} max={ACHIEVEMENTS.length} color="var(--green)" height={8} />
      </div>

      {/* Title selector */}
      <div style={{ textAlign: 'center', fontSize: 12, marginBottom: 12 }}>
        称号：
        <select
          value={selectedTitle}
          onChange={e => selectTitle(e.target.value)}
          style={{ background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}
        >
          {unlockedTitles.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Tab */}
      <TabBar
        tabs={[
          { id: 'milestone', label: '里程碑' },
          { id: 'challenge', label: '挑战' },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* List */}
      <div className="achievement-list">
        {filtered.map(ach => {
          const state = states[ach.id];
          const completed = state?.completed ?? false;
          const progress = state?.progress ?? 0;
          const status = completed ? 'completed' : progress > 0 ? 'in_progress' : 'locked';

          return (
            <div key={ach.id} className={`achievement-item ach-${status}`}>
              <span className="ach-status-icon">
                {status === 'completed' ? '◆' : status === 'in_progress' ? '▸' : '·'}
              </span>
              <div className="ach-info">
                <div className="ach-name">{ach.icon} {ach.name}</div>
                <div className="ach-desc">{ach.description}</div>
                {status === 'in_progress' && (
                  <MiniProgressBar
                    current={Math.round(progress * ach.target)}
                    max={ach.target}
                    height={4}
                    showText
                  />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="ach-reward">奖励: {ach.reward.description}</span>
                {!completed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); pinAchievement(pinnedAch === ach.id ? null : ach.id); }}
                    style={{
                      background: pinnedAch === ach.id ? '#805ad5' : 'transparent',
                      border: `1px solid ${pinnedAch === ach.id ? '#805ad5' : '#555'}`,
                      borderRadius: 4, padding: '1px 5px', fontSize: 10,
                      color: pinnedAch === ach.id ? '#fff' : '#888', cursor: 'pointer',
                    }}
                  >
                    {pinnedAch === ach.id ? '📌' : '📌'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
