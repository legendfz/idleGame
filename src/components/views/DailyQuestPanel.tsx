/**
 * DailyQuestPanel — 每日任务列表
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
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
        📅 {state.date} · {allClaimed ? '✅ 今日已全部完成' : '每日00:00重置'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.quests.map((quest, i) => {
          const def = getQuestDef(quest.defId);
          if (!def) return null;
          const done = quest.progress >= def.target;

          return (
            <div key={i} style={{
              background: 'var(--color-bg-elevated, #1e1e2e)', borderRadius: 10, padding: '10px 12px',
              border: quest.claimed ? '1px solid #4caf50' : done ? '1px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 24 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>{def.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc}</div>
                {/* 进度条 */}
                <div style={{ marginTop: 4, height: 6, background: 'var(--color-bg-muted, #2a2a3a)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (quest.progress / def.target) * 100)}%`, background: done ? '#4caf50' : 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {quest.progress}/{def.target} · 奖励: 💰{def.reward.coins ?? 0}
                </div>
              </div>
              {quest.claimed ? (
                <span style={{ color: '#4caf50', fontSize: 13, fontWeight: 'bold' }}>已领取</span>
              ) : done ? (
                <button style={{
                  padding: '6px 14px', background: 'var(--color-accent)', border: 'none', borderRadius: 8,
                  color: '#000', fontWeight: 'bold', fontSize: 12, cursor: 'pointer',
                }} onClick={() => claimReward(i)}>领取</button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
