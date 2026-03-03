/**
 * AchievementPanel — 成就列表（v4.1 样式重构）
 */
import { useAchievementStore } from '../../store/achievement';
import { ACHIEVEMENTS } from '../../engine/achievement';

export function AchievementPanel() {
  const progress = useAchievementStore(s => s.progress);
  const unlockedCount = useAchievementStore(s => s.getUnlockedCount());
  const visibleHidden = ACHIEVEMENTS.filter(a => a.hidden && progress[a.id]?.unlocked).length;
  const total = ACHIEVEMENTS.filter(a => !a.hidden).length + visibleHidden;
  const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <div>
      <div className="panel-summary">
        已解锁 {unlockedCount} / {total}
      </div>
      <div className="ach-total-bar">
        <div className="ach-total-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="card-list">
        {ACHIEVEMENTS.map(def => {
          const p = progress[def.id];
          const unlocked = p?.unlocked ?? false;
          if (def.hidden && !unlocked) return null;

          const cardClass = `ach-card ${unlocked ? 'unlocked' : 'locked'}`;

          return (
            <div key={def.id} className={cardClass}>
              <div className="ach-icon">{def.icon}</div>
              <div className="ach-info">
                <div className="ach-name">{def.name}</div>
                <div className="ach-desc">{def.desc}</div>
              </div>
              {unlocked && <span className="ach-badge">✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
