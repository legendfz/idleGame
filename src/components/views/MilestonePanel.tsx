/**
 * MilestonePanel — 里程碑列表 + buff汇总（v4.1 样式重构）
 */
import { useMilestoneStore } from '../../store/milestone';
import { MILESTONES } from '../../engine/milestone';

const BUFF_LABELS: Record<string, string> = {
  xiuweiPercent: '修炼加速',
  atkPercent: '攻击加成',
  defPercent: '防御加成',
  forgeSuccessRate: '锻造成功率',
  gatherSpeed: '采集速度',
  coinPercent: '金币加成',
};

export function MilestonePanel() {
  const progress = useMilestoneStore(s => s.progress);
  const buffs = useMilestoneStore(s => s.getBuffs());
  const unlocked = useMilestoneStore(s => s.getUnlockedCount());

  const activeBuffs = Object.entries(buffs).filter(([, v]) => v > 0);

  return (
    <div>
      <div className="panel-summary">
        已达成 {unlocked} / {MILESTONES.length}
      </div>

      {/* Buff 汇总面板 */}
      <div className="ms-buff-summary">
        <div className="ms-buff-title">🔥 当前永久加成</div>
        {activeBuffs.length > 0 ? (
          <div className="ms-buff-grid">
            {activeBuffs.map(([type, val]) => (
              <span key={type} className="ms-buff-tag">
                {BUFF_LABELS[type] ?? type} +{val}%
              </span>
            ))}
          </div>
        ) : (
          <div className="ms-buff-empty">暂无加成，达成里程碑解锁永久buff</div>
        )}
      </div>

      {/* 里程碑列表 */}
      <div className="card-list">
        {MILESTONES.map(def => {
          const p = progress[def.id];
          const done = p?.unlocked ?? false;

          return (
            <div key={def.id} className={`ms-card ${done ? 'unlocked' : 'locked'}`}>
              <div className="ms-icon">{def.icon}</div>
              <div className="ms-info">
                <div className="ms-name">{def.name}</div>
                <div className="ms-desc-text">{def.desc}</div>
                <div className="ms-buff-value">
                  {BUFF_LABELS[def.buff.type] ?? def.buff.type} +{def.buff.value}%
                </div>
              </div>
              {done && <span className="ms-badge">✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
