import { useGameStore } from '../../store/gameStore';
import { ABYSS_MILESTONES } from '../../data/abyssMilestones';

export function AbyssMilestoneBar() {
  const highestFloor = useGameStore(s => s.highestAbyssFloor);
  const claimed = useGameStore(s => s.claimedAbyssMilestones);
  const claimMilestone = useGameStore(s => s.claimAbyssMilestone);
  const unclaimed = ABYSS_MILESTONES.filter(m => highestFloor >= m.floor && !claimed.includes(m.floor));
  const nextMilestone = ABYSS_MILESTONES.find(m => highestFloor < m.floor);

  if (unclaimed.length === 0 && !nextMilestone) return null;

  return (
    <div style={{ display: 'flex', gap: 4, padding: '2px 8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {unclaimed.map(m => (
        <button key={m.floor} onClick={() => claimMilestone(m.floor)}
          style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 8, cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)', border: '1px solid #a855f7',
            color: '#fff', fontWeight: 700, animation: 'levelUpGlow 1.5s ease-in-out infinite',
          }}>
          🎁 {m.floor}层·{m.label}
        </button>
      ))}
      {nextMilestone && unclaimed.length === 0 && (
        <span style={{ fontSize: 10, color: '#888' }}>
          下一里程碑: {nextMilestone.floor}层·{nextMilestone.label}
        </span>
      )}
    </div>
  );
}
