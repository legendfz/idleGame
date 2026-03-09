/**
 * v180.0 赛季通行证面板
 */
import { useSeasonStore } from '../store/seasonStore';
import { getSeasonQuests, getSeasonLevelXP, SEASON_REWARDS, getSeasonDaysLeft, getCurrentSeason } from '../data/seasonPass';

export function SeasonPassPanel({ onClose }: { onClose: () => void }) {
  const { level, exp, claimedRewards, questProgress, questClaimed, claimQuest, claimReward } = useSeasonStore();
  const quests = getSeasonQuests();
  const daysLeft = getSeasonDaysLeft();
  const needXP = level < 30 ? getSeasonLevelXP(level + 1) : 0;

  return (
    <div style={{ padding: 8 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed33, #d97706 33)',
        borderRadius: 12, padding: 16, marginBottom: 12, textAlign: 'center',
      }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fbbf24' }}>
          🏅 赛季通行证 · 第{getCurrentSeason()}季
        </div>
        <div style={{ color: '#a78bfa', fontSize: 13, marginTop: 4 }}>
          剩余 {daysLeft} 天
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: '#fbbf24', fontSize: 18, fontWeight: 'bold' }}>Lv.{level}</span>
          <span style={{ color: '#a1a1aa', fontSize: 13 }}> / 30</span>
        </div>
        {level < 30 && (
          <div style={{ marginTop: 6 }}>
            <div style={{
              height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.3)',
              overflow: 'hidden', width: '80%', margin: '0 auto',
            }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                width: `${Math.min(100, (exp / needXP) * 100)}%`, transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>{exp}/{needXP} XP</div>
          </div>
        )}
      </div>

      {/* Daily Quests */}
      <div style={{ fontWeight: 'bold', color: '#c084fc', marginBottom: 6, fontSize: 14 }}>📋 今日赛季任务</div>
      {quests.map(q => {
        const prog = questProgress[q.id] ?? 0;
        const done = prog >= q.target;
        const claimed = questClaimed.includes(q.id);
        return (
          <div key={q.id} style={{
            background: claimed ? 'rgba(34,197,94,0.1)' : 'rgba(124,58,237,0.1)',
            borderRadius: 8, padding: '8px 10px', marginBottom: 6,
            border: `1px solid ${claimed ? '#22c55e33' : '#7c3aed33'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>{q.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: claimed ? '#22c55e' : '#e4e4e7' }}>
                {q.name} <span style={{ color: '#a78bfa', fontWeight: 'normal', fontSize: 11 }}>+{q.expReward}XP</span>
              </div>
              <div style={{ fontSize: 11, color: '#a1a1aa' }}>{q.description}</div>
              {!claimed && (
                <div style={{
                  height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.3)', marginTop: 3,
                  overflow: 'hidden', width: '100%',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: done ? '#22c55e' : '#7c3aed',
                    width: `${Math.min(100, (prog / q.target) * 100)}%`,
                  }} />
                </div>
              )}
              {!claimed && <div style={{ fontSize: 10, color: '#71717a', marginTop: 1 }}>{prog}/{q.target}</div>}
            </div>
            {done && !claimed && (
              <button onClick={() => claimQuest(q.id)} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', fontWeight: 'bold',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                fontSize: 12, cursor: 'pointer',
              }}>领取</button>
            )}
            {claimed && <span style={{ color: '#22c55e', fontSize: 13 }}>✅</span>}
          </div>
        );
      })}

      {/* Reward Track */}
      <div style={{ fontWeight: 'bold', color: '#fbbf24', margin: '12px 0 6px', fontSize: 14 }}>🎁 赛季奖励</div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {SEASON_REWARDS.map(r => {
          const unlocked = level >= r.level;
          const claimed = claimedRewards.includes(r.level);
          return (
            <div key={r.level} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              borderRadius: 6, marginBottom: 3,
              background: claimed ? 'rgba(34,197,94,0.08)' : unlocked ? 'rgba(251,191,36,0.08)' : 'rgba(0,0,0,0.15)',
              opacity: !unlocked ? 0.5 : 1,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: claimed ? '#22c55e' : unlocked ? '#fbbf24' : '#52525b', color: '#000', fontSize: 11, fontWeight: 'bold',
              }}>{r.level}</span>
              <span style={{ fontSize: 16 }}>{r.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#e4e4e7' }}>{r.name}</span>
              {unlocked && !claimed && (
                <button onClick={() => claimReward(r.level)} style={{
                  padding: '3px 8px', borderRadius: 5, border: 'none',
                  background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#1a0a2e',
                  fontSize: 11, fontWeight: 'bold', cursor: 'pointer',
                }}>领取</button>
              )}
              {claimed && <span style={{ fontSize: 12, color: '#22c55e' }}>✅</span>}
            </div>
          );
        })}
      </div>

      <button onClick={onClose} style={{
        marginTop: 12, width: '100%', padding: '8px 0', borderRadius: 8,
        border: '1px solid #52525b', background: 'transparent', color: '#a1a1aa', cursor: 'pointer',
      }}>关闭</button>
    </div>
  );
}
