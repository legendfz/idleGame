import { useAffinityStore } from '../store/affinityStore';
import { useGameStore } from '../store/gameStore';
import { AFFINITY_NPCS, GIFT_TIERS } from '../engine/affinity';

export function AffinityPanel() {
  const levels = useAffinityStore(s => s.affinity.levels);
  const gift = useAffinityStore(s => s.gift);
  const lingshi = useGameStore(s => s.player.lingshi);

  const handleGift = (npcId: string, tier: number) => {
    const result = gift(npcId, lingshi, tier);
    if (result) {
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi - result.cost } }));
    }
  };

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">仙缘</h3>
      <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 16 }}>与仙人结缘，获取永久加成</div>
      {AFFINITY_NPCS.map(npc => {
        const lv = levels[npc.id] ?? 0;
        const pct = lv / 100;
        const unlockedBuffs = npc.buffs.filter(b => lv >= b.threshold);
        const nextBuff = npc.buffs.find(b => lv < b.threshold);
        const hasUltimate = lv >= 100;

        return (
          <div key={npc.id} style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 14, marginBottom: 10,
            border: hasUltimate ? '1px solid #e040fb' : '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 'bold', minWidth: 36, textAlign: 'center' }}>{npc.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{npc.name} <span style={{ fontSize: 10, color: 'var(--dim)' }}>{npc.title}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <div style={{
                    flex: 1, height: 6, borderRadius: 3, background: 'var(--border)',
                  }}>
                    <div style={{
                      width: `${pct * 100}%`, height: '100%', borderRadius: 3,
                      background: hasUltimate ? 'linear-gradient(90deg, #e040fb, #f0c040)' : 'var(--accent)',
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--dim)' }}>{lv}/100</span>
                </div>
                {unlockedBuffs.length > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 4 }}>
                    {unlockedBuffs.map(b => b.desc).join(' · ')}
                  </div>
                )}
                {nextBuff && <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>下一个: {nextBuff.threshold} 好感 → {nextBuff.desc}</div>}
                {hasUltimate && <div style={{ fontSize: 10, color: '#e040fb', marginTop: 4 }}>★ {npc.ultimateSkill}</div>}
              </div>
            </div>
            {/* Gift tier buttons */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
              {GIFT_TIERS.map((t, i) => {
                const canGift = lingshi >= t.cost;
                return (
                  <button key={t.id} className={`action-btn ${canGift ? 'accent' : ''}`} disabled={!canGift}
                    onClick={() => handleGift(npc.id, i)}
                    style={{ fontSize: 10, padding: '5px 8px', opacity: canGift ? 1 : 0.35 }}>
                    {t.icon} {t.cost >= 10000 ? `${t.cost/1000}K` : t.cost}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
