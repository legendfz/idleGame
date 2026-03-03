/**
 * AffinityPanel — 仙缘NPC好感度
 */
import { useAffinityStore } from '../../store/affinity';
import { NPCS, getAffinityTier, getGiftCost } from '../../engine/affinity';
import '../../styles/affinity.css';

export function AffinityPanel() {
  const levels = useAffinityStore(s => s.state.levels);
  const gift = useAffinityStore(s => s.gift);
  const giftCost = getGiftCost();

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>💕 仙缘</h2>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>与仙人结缘，获取永久加成</div>
      {NPCS.map(npc => {
        const lv = levels[npc.id] ?? 0;
        const tier = getAffinityTier(lv);
        const hasUlt = lv >= 100;

        return (
          <div key={npc.id} style={{
            background: 'var(--color-bg-elevated)', borderRadius: 10, padding: 12, marginBottom: 8,
            border: hasUlt ? '1px solid #e040fb' : '1px solid var(--color-border, #333)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>{npc.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>
                  {npc.name} <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{npc.desc}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-border, #333)' }}>
                    <div style={{
                      width: `${lv}%`, height: '100%', borderRadius: 3,
                      background: hasUlt ? 'linear-gradient(90deg, #e040fb, #f0c040)' : 'var(--color-accent)',
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{lv}/100 (阶{tier})</span>
                </div>
                {tier > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 2 }}>
                    {npc.buffs.map(b => `${b.stat}+${b.perTier * tier}%`).join(' · ')}
                  </div>
                )}
                {!hasUlt && <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>下阶: {(tier + 1) * 20}♥</div>}
                {hasUlt && <div style={{ fontSize: 10, color: '#e040fb', marginTop: 2 }}>🌟 {npc.ultimateSkill} — {npc.ultimateDesc}</div>}
              </div>
              <button onClick={() => gift(npc.id)} style={{
                padding: '4px 8px', border: 'none', borderRadius: 8,
                background: lv >= 100 ? 'var(--color-bg-muted)' : 'var(--color-primary)',
                color: '#fff', fontSize: 10, cursor: lv >= 100 ? 'not-allowed' : 'pointer',
              }} disabled={lv >= 100}>🎁 ({giftCost}💰)</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
