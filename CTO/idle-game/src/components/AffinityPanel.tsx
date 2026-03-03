import { useAffinityStore } from '../store/affinityStore';
import { useGameStore } from '../store/gameStore';
import { AFFINITY_NPCS, getGiftCost } from '../engine/affinity';

export function AffinityPanel() {
  const levels = useAffinityStore(s => s.affinity.levels);
  const gift = useAffinityStore(s => s.gift);
  const lingshi = useGameStore(s => s.player.lingshi);
  const giftCost = getGiftCost();

  const handleGift = (npcId: string) => {
    const result = gift(npcId, lingshi);
    if (result) {
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi - result.cost } }));
    }
  };

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">💕 仙缘</h3>
      <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12 }}>与仙人结缘，获取永久加成</div>
      {AFFINITY_NPCS.map(npc => {
        const lv = levels[npc.id] ?? 0;
        const pct = lv / 100;
        const canGift = lingshi >= giftCost;
        const unlockedBuffs = npc.buffs.filter(b => lv >= b.threshold);
        const nextBuff = npc.buffs.find(b => lv < b.threshold);
        const hasUltimate = lv >= 100;

        return (
          <div key={npc.id} style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 12, marginBottom: 8,
            border: hasUltimate ? '1px solid #e040fb' : '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>{npc.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{npc.name} <span style={{ fontSize: 10, color: 'var(--dim)' }}>{npc.title}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
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
                  <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>
                    {unlockedBuffs.map(b => b.desc).join(' · ')}
                  </div>
                )}
                {nextBuff && <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 1 }}>下一个: {nextBuff.threshold}♥ → {nextBuff.desc}</div>}
                {hasUltimate && <div style={{ fontSize: 10, color: '#e040fb', marginTop: 2 }}>🌟 {npc.ultimateSkill}</div>}
              </div>
              <button className={`action-btn ${canGift ? 'accent' : ''}`} disabled={!canGift}
                onClick={() => handleGift(npc.id)} style={{ fontSize: 10, padding: '4px 8px', opacity: canGift ? 1 : 0.4 }}>
                🎁 赠礼({giftCost}💰)
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
