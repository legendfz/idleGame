/**
 * AchievementPanel — 成就列表
 */
import { useAchievementStore } from '../../store/achievement';
import { ACHIEVEMENTS } from '../../engine/achievement';

export function AchievementPanel() {
  const progress = useAchievementStore(s => s.progress);
  const unlockedCount = useAchievementStore(s => s.getUnlockedCount());
  const total = ACHIEVEMENTS.filter(a => !a.hidden).length;

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}>
        已解锁 {unlockedCount} / {total + ACHIEVEMENTS.filter(a => a.hidden && progress[a.id]?.unlocked).length}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ACHIEVEMENTS.map(def => {
          const p = progress[def.id];
          const unlocked = p?.unlocked ?? false;
          if (def.hidden && !unlocked) return null;

          return (
            <div key={def.id} style={{
              background: 'var(--color-bg-elevated, #1e1e2e)', borderRadius: 10, padding: '10px 12px',
              opacity: unlocked ? 1 : 0.5, display: 'flex', gap: 10, alignItems: 'center',
              border: unlocked ? '1px solid var(--color-accent, #ffa500)' : '1px solid var(--color-border, #333)',
            }}>
              <span style={{ fontSize: 28 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>{def.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc}</div>
              </div>
              {unlocked && <span style={{ color: 'var(--color-accent)', fontSize: 20 }}>✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
