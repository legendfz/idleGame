/**
 * CompanionPanel — 伙伴列表+详情+装备
 */
import { useCompanionStore } from '../../store/companion';
import { COMPANIONS, calcCompanionEffect, companionExpRequired, getCompanionDef } from '../../engine/companion';

const RARITY_COLORS: Record<string, string> = {
  common: '#aaa', rare: '#4fc3f7', epic: '#ce93d8', legendary: '#ffd54f',
};
const RARITY_LABELS: Record<string, string> = {
  common: '普通', rare: '稀有', epic: '史诗', legendary: '传说',
};
const EFFECT_LABELS: Record<string, string> = {
  atkPercent: '攻击', defPercent: '防御', xiuweiPercent: '修为', coinPercent: '金币',
  critRate: '暴击率', forgeRate: '锻造成功率', gatherSpeed: '采集速度', allPercent: '全属性',
};

export function CompanionPanel() {
  const instances = useCompanionStore(s => s.instances);
  const equipped = useCompanionStore(s => s.equipped);
  const equip = useCompanionStore(s => s.equip);
  const unequip = useCompanionStore(s => s.unequip);
  const buffs = useCompanionStore(s => s.getBuffs());

  const activeBuffs = Object.entries(buffs).filter(([, v]) => v > 0);
  const owned = Object.keys(instances);

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
        已收集 {owned.length}/{COMPANIONS.length} · 出战 {equipped.length}/3
      </div>

      {activeBuffs.length > 0 && (
        <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid var(--color-accent)', borderRadius: 10, padding: '6px 12px', marginBottom: 10, fontSize: 12 }}>
          🔥 伙伴加成: {activeBuffs.map(([k, v]) => `${EFFECT_LABELS[k] ?? k}+${v}%`).join('　')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COMPANIONS.map(def => {
          const inst = instances[def.id];
          const isEquipped = equipped.includes(def.id);
          const locked = !inst;

          return (
            <div key={def.id} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px 12px',
              border: isEquipped ? `1px solid ${RARITY_COLORS[def.rarity]}` : '1px solid var(--color-border, #333)',
              opacity: locked ? 0.35 : 1, display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 28 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>
                  {def.name}
                  <span style={{ fontSize: 10, color: RARITY_COLORS[def.rarity], marginLeft: 6 }}>{RARITY_LABELS[def.rarity]}</span>
                  {inst && <span style={{ fontSize: 10, marginLeft: 4 }}>Lv.{inst.level}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc}</div>
                {inst && (
                  <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 2 }}>
                    {EFFECT_LABELS[calcCompanionEffect(def, inst.level).type] ?? '?'}+{calcCompanionEffect(def, inst.level).value}%
                    · EXP {inst.exp}/{companionExpRequired(inst.level)}
                  </div>
                )}
                {locked && <div style={{ fontSize: 10, color: '#888' }}>来源: {def.source}</div>}
              </div>
              {!locked && (
                isEquipped
                  ? <button style={{ padding: '4px 10px', background: '#e74c3c', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }} onClick={() => unequip(def.id)}>卸下</button>
                  : <button style={{ padding: '4px 10px', background: 'var(--color-primary)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }} onClick={() => equip(def.id)}>装备</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
