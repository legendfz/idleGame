/**
 * PetPanel — 灵兽界面
 */
import { usePetStore } from '../../store/pet';
import { PETS, calcPetEffect, petExpRequired } from '../../engine/pet';

const EFFECT_LABELS: Record<string, string> = {
  atkPercent: '攻击', defPercent: '防御', xiuweiPercent: '修炼速度',
  dropRate: '掉落率', lingshiPercent: '灵石',
};

export function PetPanel() {
  const instances = usePetStore(s => s.instances);
  const activePetId = usePetStore(s => s.activePetId);
  const setActive = usePetStore(s => s.setActive);
  const buffs = usePetStore(s => s.getBuffs());

  const owned = Object.keys(instances);
  const activeBuffs = Object.entries(buffs).filter(([, v]) => v > 0);

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🐾 灵兽</h2>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        已收集 {owned.length}/{PETS.length} · 出战: {activePetId ? PETS.find(p => p.id === activePetId)?.name : '无'}
      </div>

      {activeBuffs.length > 0 && (
        <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid var(--color-accent)', borderRadius: 10, padding: '6px 12px', marginBottom: 10, fontSize: 12 }}>
          🐾 灵兽加成: {activeBuffs.map(([k, v]) => `${EFFECT_LABELS[k] ?? k}+${v}%`).join('　')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PETS.map(def => {
          const inst = instances[def.id];
          const isActive = activePetId === def.id;
          const locked = !inst;

          return (
            <div key={def.id} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px 12px',
              border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
              opacity: locked ? 0.35 : 1, display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 28 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>
                  {def.name} <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{def.element}</span>
                  {inst && <span style={{ fontSize: 10, marginLeft: 4 }}>Lv.{inst.level}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc}</div>
                {inst && (
                  <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 2 }}>
                    {EFFECT_LABELS[calcPetEffect(def, inst.level).type]}+{calcPetEffect(def, inst.level).value}%
                    · EXP {inst.exp}/{petExpRequired(inst.level)}
                  </div>
                )}
                {locked && <div style={{ fontSize: 10, color: '#888' }}>通天塔Boss掉落</div>}
              </div>
              {!locked && (
                isActive
                  ? <button style={{ padding: '4px 10px', background: '#e74c3c', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }} onClick={() => setActive(null)}>收回</button>
                  : <button style={{ padding: '4px 10px', background: 'var(--color-primary)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }} onClick={() => setActive(def.id)}>出战</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
