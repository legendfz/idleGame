/**
 * QuestView — 任务总面板(成就+每日+里程碑子标签)
 */
import { useState } from 'react';
import { AchievementPanel } from './AchievementPanel';
import { DailyQuestPanel } from './DailyQuestPanel';
import { MilestonePanel } from './MilestonePanel';

type QuestTab = 'daily' | 'achievement' | 'milestone';

export function QuestView() {
  const [tab, setTab] = useState<QuestTab>('daily');

  return (
    <div className="view-quests">
      <h2>📜 任务</h2>
      <div className="quest-tabs">
        <button className={`quest-tab ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>📅 每日</button>
        <button className={`quest-tab ${tab === 'achievement' ? 'active' : ''}`} onClick={() => setTab('achievement')}>🏆 成就</button>
        <button className={`quest-tab ${tab === 'milestone' ? 'active' : ''}`} onClick={() => setTab('milestone')}>🎯 里程碑</button>
      </div>
      {tab === 'daily' && <DailyQuestPanel />}
      {tab === 'achievement' && <AchievementPanel />}
      {tab === 'milestone' && <MilestonePanel />}
    </div>
  );
}
