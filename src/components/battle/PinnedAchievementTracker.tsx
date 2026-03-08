import { useGameStore } from '../../store/gameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { formatNumber } from '../../utils/format';

export function PinnedAchievementTracker() {
  const pinnedId = useGameStore(s => s.player.pinnedAchievement);
  const player = useGameStore(s => s.player);
  if (!pinnedId) return null;
  const ach = ACHIEVEMENTS.find(a => a.id === pinnedId);
  if (!ach) return null;

  let current = 0;
  const target = ach.target;
  switch (ach.conditionType) {
    case 'level': current = player.level; break;
    case 'kill_count': current = player.totalKills; break;
    case 'equipment_count': current = player.totalEquipDrops; break;
    case 'gold_total': current = player.totalGoldEarned; break;
    case 'online_time': current = player.totalCultivateTime; break;
    case 'enhance_max': current = 0; break;
    case 'collect_unique': current = player.codexEquipIds?.length ?? 0; break;
    case 'realm_reach': current = player.realmIndex >= 7 ? 1 : 0; break;
    default: current = 0;
  }
  const pct = Math.min(100, Math.floor((current / target) * 100));
  const completed = current >= target;

  return (
    <div style={{
      margin: '4px 12px', padding: '6px 10px', borderRadius: 8,
      background: completed ? 'rgba(76,175,80,0.15)' : 'rgba(128,90,213,0.12)',
      border: `1px solid ${completed ? '#4caf50' : '#805ad5'}44`,
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
    }}>
      <span>{ach.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: completed ? '#4caf50' : '#c4b5fd', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          📌 {ach.name} {completed ? '✅' : `${formatNumber(current)}/${formatNumber(target)}`}
        </div>
        {!completed && (
          <div style={{ height: 3, background: '#333', borderRadius: 2, marginTop: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #805ad5, #c4b5fd)', width: `${pct}%`, transition: 'width 0.3s' }} />
          </div>
        )}
      </div>
      <span style={{ color: '#888', fontSize: 10 }}>{pct}%</span>
    </div>
  );
}
