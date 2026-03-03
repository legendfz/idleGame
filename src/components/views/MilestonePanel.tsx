/**
 * MilestonePanel — 里程碑列表 + 当前buff汇总
 */
import { useMilestoneStore } from '../../store/milestone';
import { MILESTONES } from '../../engine/milestone';

const BUFF_LABELS: Record<string, string> = {
  xiuweiPercent: '修炼加速', atkPercent: '攻击加成', defPercent: '防御加成',
  forgeSuccessRate: '锻造成功率', gatherSpeed: '采集速度', coinPercent: '金币加成',
};

export function MilestonePanel() {
  const progress = useMilestoneStore(s => s.progress);
  const buffs = useMilestoneStore(s => s.getBuffs());
  const unlocked = useMilestoneStore(s => s.getUnlockedCount());

  const activeBuffs = Object.entries(buffs).filter(([, v]) => v > 0);

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
        已达成 {unlocked} / {MILESTONES.length}
      </div>

      {activeBuffs.length > 0 && (
        <div style={{
          background: 'rgba(255,165,0,0.1)', border: '1px solid var(--color-accent)',
          borderRadius: 10, padding: '8px 12px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>🔥 当前永久加成</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
            {activeBuffs.map(([type, val]) => (
              <span key={type} style={{ color: 'var(--color-accent)' }}>
                {BUFF_LABELS[type] ?? type} +{val}%
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MILESTONES.map(def => {
          const p = progress[def.id];
          const done = p?.unlocked ?? false;

          return (
            <div key={def.id} style={{
              background: 'var(--color-bg-elevated, #1e1e2e)', borderRadius: 10, padding: '10px 12px',
              opacity: done ? 1 : 0.5, display: 'flex', gap: 10, alignItems: 'center',
              border: done ? '1px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
            }}>
              <span style={{ fontSize: 24 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>{def.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc}</div>
                <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 2 }}>
                  {BUFF_LABELS[def.buff.type] ?? def.buff.type} +{def.buff.value}%
                </div>
              </div>
              {done && <span style={{ color: 'var(--color-accent)', fontSize: 18 }}>✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
