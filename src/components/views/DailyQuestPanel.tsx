/**
 * DailyQuestPanel — 每日任务列表（v4.1 样式重构）
 */
import { useEffect } from 'react';
import { useDailyQuestStore } from '../../store/dailyQuest';
import { getQuestDef } from '../../engine/dailyQuest';

export function DailyQuestPanel() {
  const state = useDailyQuestStore(s => s.state);
  const checkReset = useDailyQuestStore(s => s.checkReset);
  const claimReward = useDailyQuestStore(s => s.claimReward);

  useEffect(() => { checkReset(); }, [checkReset]);

  const allClaimed = state.quests.every(q => q.claimed);

  return (
    <div>
      <div className="daily-meta">
        <span className="daily-date">📅 {state.date} · 每日00:00重置</span>
        {allClaimed && <span className="daily-status">✅ 今日全部完成</span>}
      </div>

      <div className="card-list">
        {state.quests.map((quest, i) => {
          const def = getQuestDef(quest.defId);
          if (!def) return null;
          const done = quest.progress >= def.target;
          const pct = Math.min(100, (quest.progress / def.target) * 100);

          const cardClass = [
            'daily-card',
            quest.claimed ? 'claimed' : '',
            done && !quest.claimed ? 'completed' : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={i} className={cardClass}>
              <div className="daily-icon">{def.icon}</div>
              <div className="daily-info">
                <div className="daily-name">{def.name}</div>
                <div className="daily-desc-text">{def.desc}</div>
                <div className="daily-bar">
                  <div className="daily-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="daily-bar-text">
                  <span>{quest.progress}/{def.target}</span>
                  <span>💰{def.reward.coins ?? 0}</span>
                </div>
              </div>
              {quest.claimed ? (
                <span className="daily-claim-btn done">已领取</span>
              ) : done ? (
                <button className="daily-claim-btn ready" onClick={() => claimReward(i)}>🎁 领取</button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
