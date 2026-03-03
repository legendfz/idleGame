/**
 * CompanionPanel — 伙伴列表+装备（v5.1 样式重构）
 */
import { useCompanionStore } from '../../store/companion';
import { COMPANIONS, calcCompanionEffect, companionExpRequired } from '../../engine/companion';

const RARITY_COLORS: Record<string, string> = {
  common: 'var(--q-common)', rare: 'var(--q-immortal)', epic: 'var(--q-divine)', legendary: 'var(--q-chaos)',
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
    <div className="view-companion">
      <h2 className="companion-title">🐾 伙伴</h2>

      {/* 统计 */}
      <div className="panel-summary">
        已收集 {owned.length}/{COMPANIONS.length} · 出战 {equipped.length}/3
      </div>

      {/* 当前加成 */}
      <div className="companion-active">
        <div className="companion-active-label">伙伴加成</div>
        {activeBuffs.length > 0 ? (
          <div className="ms-buff-grid">
            {activeBuffs.map(([k, v]) => (
              <span key={k} className="ms-buff-tag">{EFFECT_LABELS[k] ?? k}+{v}%</span>
            ))}
          </div>
        ) : (
          <div className="companion-none-hint">装备伙伴获取永久加成</div>
        )}
      </div>

      {/* 伙伴列表 */}
      <div className="card-list">
        {COMPANIONS.map(def => {
          const inst = instances[def.id];
          const isEquipped = equipped.includes(def.id);
          const locked = !inst;

          const cardClass = [
            'comp-card',
            locked ? 'unowned' : isEquipped ? 'active' : 'owned',
          ].join(' ');

          const effect = inst ? calcCompanionEffect(def, inst.level) : null;
          const expReq = inst ? companionExpRequired(inst.level) : 0;
          const expPct = inst && expReq > 0 ? Math.min(100, (inst.exp / expReq) * 100) : 0;

          return (
            <div key={def.id} className={cardClass} style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--sp-md)' }}>
              <div className="comp-icon">{def.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-xs)' }}>
                  <span className="comp-name">{def.name}</span>
                  <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: RARITY_COLORS[def.rarity] }}>
                    {RARITY_LABELS[def.rarity]}
                  </span>
                  {inst && <span className="comp-level">Lv.{inst.level}</span>}
                </div>
                <div className="comp-effect">{def.desc}</div>
                {effect && (
                  <div className="ms-buff-value" style={{ fontSize: 'var(--fs-xs)', marginTop: 2 }}>
                    {EFFECT_LABELS[effect.type] ?? '?'}+{effect.value}%
                  </div>
                )}
                {inst && (
                  <div className="comp-exp-bar" style={{ marginTop: 'var(--sp-xs)' }}>
                    <div className="comp-exp-fill" style={{ width: `${expPct}%` }} />
                  </div>
                )}
                {locked && <div className="comp-obtain">{def.source}</div>}
              </div>
              {!locked && (
                isEquipped ? (
                  <button className="daily-claim-btn done" onClick={() => unequip(def.id)}>卸下</button>
                ) : (
                  <button className="daily-claim-btn ready" style={{ animation: 'none' }} onClick={() => equip(def.id)}>装备</button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
