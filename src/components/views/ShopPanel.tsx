/**
 * ShopPanel — 商店界面
 */
import { useShopStore } from '../../store/shop';
import { getSlotPrice, getManualRefreshCost } from '../../engine/shop';
import { useState, useEffect } from 'react';

const CURRENCY_ICONS: Record<string, string> = { coins: '💰', lingshi: '💎', merit: '🙏' };

export function ShopPanel() {
  const shopState = useShopStore(s => s.state);
  const buy = useShopStore(s => s.buy);
  const manualRefresh = useShopStore(s => s.manualRefresh);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, shopState.nextRefreshTime - now);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const refreshCost = getManualRefreshCost(shopState.manualRefreshCount);

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🏪 仙界商铺</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 12 }}>
        <span style={{ color: 'var(--color-text-muted)' }}>⏰ 刷新: {h}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>
        <button style={{ padding: '4px 12px', background: 'var(--color-primary)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }} onClick={manualRefresh}>
          🔄 手动刷新 ({refreshCost}💰)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {shopState.slots.map((slot, i) => {
          const price = getSlotPrice(slot);
          const soldOut = slot.remaining === 0;

          return (
            <div key={i} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px',
              border: slot.discount < 1 ? '1px solid #e74c3c' : '1px solid var(--color-border, #333)',
              opacity: soldOut ? 0.4 : 1, position: 'relative',
            }}>
              {slot.discount < 1 && (
                <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 10, color: '#e74c3c', fontWeight: 'bold' }}>🔥 {Math.round(slot.discount * 100)}%折</span>
              )}
              <div style={{ fontSize: 24, textAlign: 'center' }}>{slot.def.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginTop: 4 }}>{slot.def.name}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }}>{slot.def.desc}</div>
              <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                {slot.discount < 1 && <s style={{ color: '#888', marginRight: 4 }}>{slot.def.price}</s>}
                {price} {CURRENCY_ICONS[slot.def.currency]}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }}>库存: {slot.remaining}</div>
              <button disabled={soldOut} style={{
                width: '100%', marginTop: 6, padding: '5px', border: 'none', borderRadius: 6,
                background: soldOut ? 'var(--color-bg-muted)' : 'var(--color-primary)',
                color: '#fff', fontSize: 11, cursor: soldOut ? 'not-allowed' : 'pointer',
              }} onClick={() => buy(i)}>
                {soldOut ? '售罄' : '购买'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
