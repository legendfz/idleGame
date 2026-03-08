import { useGameStore } from '../../store/gameStore';
import { CONSUMABLE_BUFFS } from '../../data/consumables';

export function ConsumableBar() {
  const player = useGameStore(s => s.player);
  const useConsumable = useGameStore(s => s.useConsumable);
  const inv = player.consumableInventory ?? {};
  const actives = player.activeConsumables ?? [];
  const available = CONSUMABLE_BUFFS.filter(b => (inv[b.id] ?? 0) > 0);

  if (available.length === 0 && actives.length === 0) return null;

  const fmtTime = (s: number) => s >= 60 ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` : `${s}s`;

  return (
    <div style={{ margin: '6px 0' }}>
      {actives.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, justifyContent: 'center' }}>
          {actives.map(ac => {
            const def = CONSUMABLE_BUFFS.find(b => b.id === ac.buffId);
            if (!def) return null;
            return (
              <span key={ac.buffId} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(255,200,50,0.2), rgba(255,100,50,0.2))',
                border: '1px solid rgba(255,200,50,0.4)', color: '#ffd700',
              }}>
                {def.emoji} {def.name} {fmtTime(ac.remainingSec)}
              </span>
            );
          })}
        </div>
      )}
      {available.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {available.map(buff => (
            <button key={buff.id} onClick={() => useConsumable(buff.id)}
              title={buff.description}
              style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(100,50,200,0.2)', border: '1px solid rgba(150,100,255,0.4)',
                color: '#ccc',
              }}>
              {buff.emoji} {buff.name} ×{inv[buff.id]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
