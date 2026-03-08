const ONLINE_MILESTONES = [10, 30, 60, 120, 240];
const MILESTONE_LABELS: Record<number, string> = { 10: '10分', 30: '30分', 60: '1时', 120: '2时', 240: '4时' };

export function OnlineRewardsBar({ sessionMinutes, claimed, onClaim }: {
  sessionMinutes: number;
  claimed: number[];
  onClaim: (min: number) => void;
}) {
  const unclaimed = ONLINE_MILESTONES.filter(m => sessionMinutes >= m && !claimed.includes(m));
  if (unclaimed.length === 0 && !ONLINE_MILESTONES.some(m => !claimed.includes(m))) return null;

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', margin: '6px 0', flexWrap: 'wrap' }}>
      {ONLINE_MILESTONES.map(m => {
        const canClaim = sessionMinutes >= m && !claimed.includes(m);
        const done = claimed.includes(m);
        return (
          <button key={m} onClick={() => canClaim && onClaim(m)} disabled={!canClaim}
            style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 8, cursor: canClaim ? 'pointer' : 'default',
              background: canClaim ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : done ? 'rgba(34,197,94,0.2)' : 'rgba(100,100,100,0.2)',
              border: canClaim ? '1px solid #f59e0b' : '1px solid rgba(100,100,100,0.3)',
              color: canClaim ? '#fff' : done ? '#4ade80' : '#666',
              animation: canClaim ? 'levelUpGlow 1.5s ease-in-out infinite' : 'none',
              fontWeight: canClaim ? 700 : 400,
            }}>
            {done ? '✅' : canClaim ? '🎁' : '🔒'} {MILESTONE_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}
