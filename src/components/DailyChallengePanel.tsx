import { useGameStore } from '../store/gameStore';
import { useDailyChallengeStore } from '../store/dailyChallengeStore';
import { getDailyChallenges, getRewardAmount } from '../data/dailyChallenge';
import { formatNumber } from '../utils/format';

const REWARD_ICONS: Record<string, string> = {
  lingshi: '💎', pantao: '🍑', shards: '🔮', tokens: '🎟️',
};
const REWARD_NAMES: Record<string, string> = {
  lingshi: '灵石', pantao: '蟠桃', shards: '碎片', tokens: '令牌',
};

export function DailyChallengePanel() {
  const level = useGameStore(s => s.player.level);
  const challenges = getDailyChallenges();
  const progress = useDailyChallengeStore(s => s.progress);
  const claimed = useDailyChallengeStore(s => s.claimed);
  const claim = useDailyChallengeStore(s => s.claim);

  const handleClaim = (challengeId: string) => {
    const reward = claim(challengeId, level);
    if (!reward) return;
    const gs = useGameStore.getState();
    const up = { ...gs.player };
    if (reward.type === 'lingshi') up.lingshi += reward.amount;
    else if (reward.type === 'pantao') up.pantao += reward.amount;
    else if (reward.type === 'shards') up.hongmengShards += reward.amount;
    useGameStore.setState({ player: up });
    useDailyChallengeStore.getState().save();
  };

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2c97e', marginBottom: 8, textAlign: 'center' }}>
        📜 每日挑战
      </div>
      {challenges.map(ch => {
        const current = Math.min(progress[ch.id] || 0, ch.target);
        const pct = Math.min(100, (current / ch.target) * 100);
        const isDone = current >= ch.target;
        const isClaimed = claimed[ch.id];
        const reward = getRewardAmount(ch, level);
        return (
          <div key={ch.id} style={{
            background: isClaimed ? 'rgba(76,175,80,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isClaimed ? '#4caf50' : isDone ? '#e2c97e' : '#333'}`,
            borderRadius: 10, padding: '10px 12px', marginBottom: 8,
            ...(isDone && !isClaimed ? { animation: 'pulse 2s infinite', boxShadow: '0 0 8px rgba(226,201,126,0.3)' } : {}),
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>
                {ch.icon} {ch.name}
              </span>
              <span style={{ fontSize: 12, color: '#aaa' }}>
                {REWARD_ICONS[ch.rewardType]} {formatNumber(reward)} {REWARD_NAMES[ch.rewardType]}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#888', margin: '4px 0' }}>{ch.description}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: 3,
                  background: isClaimed ? '#4caf50' : isDone ? 'linear-gradient(90deg, #e2c97e, #f0d78c)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  transition: 'width 0.3s',
                }} />
              </div>
              <span style={{ fontSize: 11, color: isDone ? '#e2c97e' : '#888', minWidth: 55, textAlign: 'right' }}>
                {formatNumber(current)}/{formatNumber(ch.target)}
              </span>
              {isDone && !isClaimed && (
                <button onClick={() => handleClaim(ch.id)} style={{
                  background: 'linear-gradient(135deg, #e2c97e, #d4a745)', color: '#1a1a2e',
                  border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer',
                }}>领取</button>
              )}
              {isClaimed && <span style={{ color: '#4caf50', fontSize: 12, fontWeight: 600 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
