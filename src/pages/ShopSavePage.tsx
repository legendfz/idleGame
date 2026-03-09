import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatTime, formatNumber } from '../utils/format';
import { SCROLL_PRICES } from '../data/equipment';
import { Card, SubPageHeader, SubPage } from './shared';

// v176.0: Resource exchange rates
const EXCHANGE_RATES = [
  { from: 'lingshi', to: 'pantao', fromName: '灵石', toName: '蟠桃', rate: 1000, amount: 1, icon: '💰→🍑' },
  { from: 'pantao', to: 'lingshi', fromName: '蟠桃', toName: '灵石', rate: 1, amount: 500, icon: '🍑→💰' },
  { from: 'lingshi', to: 'hongmengShards', fromName: '灵石', toName: '鸿蒙碎片', rate: 5000, amount: 1, icon: '💰→💎' },
  { from: 'hongmengShards', to: 'lingshi', fromName: '鸿蒙碎片', toName: '灵石', rate: 1, amount: 2000, icon: '💎→💰' },
  { from: 'pantao', to: 'hongmengShards', fromName: '蟠桃', toName: '鸿蒙碎片', rate: 10, amount: 1, icon: '🍑→💎' },
  { from: 'hongmengShards', to: 'pantao', fromName: '鸿蒙碎片', toName: '蟠桃', rate: 1, amount: 5, icon: '💎→🍑' },
];

export function ShopPage({ onBack }: { onBack: () => void }) {
  const player = useGameStore(s => s.player);
  const buyScroll = useGameStore(s => s.buyScroll);
  const exchangeResource = useGameStore(s => s.exchangeResource);
  const [exchangeMsg, setExchangeMsg] = useState('');

  const scrolls = [
    { type: 'tianming' as const, name: '天命符', desc: '精炼成功率+5%', price: SCROLL_PRICES.tianming, count: player.tianmingScrolls },
    { type: 'protect' as const, name: '护级符', desc: '高阶强化失败不降级', price: SCROLL_PRICES.protect, count: player.protectScrolls },
    { type: 'lucky' as const, name: '幸运符', desc: '高阶强化成功率+10%', price: SCROLL_PRICES.lucky, count: player.luckyScrolls },
  ];

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="道具商店" onBack={onBack} />
      <Card>
        <div className="color-dim" style={{ fontSize: 12, marginBottom: 8 }}>蟠桃余额：<span className="color-pantao">{player.pantao}</span></div>
        {scrolls.map(s => (
          <Card key={s.type} className="shop-item-card">
            <div className="shop-item-header">
              <span className="color-accent">{s.name}</span>
              <span className="color-dim">x{s.count}</span>
            </div>
            <div className="color-dim" style={{ fontSize: 11 }}>{s.desc}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button className="small-btn accent" disabled={player.pantao < s.price}
                onClick={() => buyScroll(s.type)}>
                购买 · {s.price} 蟠桃
              </button>
              <button className="small-btn" disabled={player.pantao < s.price * 10}
                onClick={() => { for (let i = 0; i < 10; i++) buyScroll(s.type); }}
                style={{ background: player.pantao >= s.price * 10 ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.08)', color: player.pantao >= s.price * 10 ? '#fff' : 'var(--text-dim)', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: player.pantao >= s.price * 10 ? 'pointer' : 'default' }}>
                ×10 · {s.price * 10} 蟠桃
              </button>
              {player.pantao >= s.price && (
                <button className="small-btn"
                  onClick={() => { const max = Math.floor(player.pantao / s.price); for (let i = 0; i < max; i++) buyScroll(s.type); }}
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
                  买满({Math.floor(player.pantao / s.price)})
                </button>
              )}
            </div>
          </Card>
        ))}
      </Card>

      {/* v176.0: Resource Exchange */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🔄 资源转换</div>
        <div className="color-dim" style={{ fontSize: 11, marginBottom: 8 }}>
          灵石: {formatNumber(player.lingshi)} · 蟠桃: {formatNumber(player.pantao)} · 碎片: {formatNumber(player.hongmengShards)}
        </div>
        {exchangeMsg && <div style={{ color: '#34d399', fontSize: 11, marginBottom: 6 }}>{exchangeMsg}</div>}
        {EXCHANGE_RATES.map((ex, i) => {
          const fromVal = (player as any)[ex.from] ?? 0;
          const canExchange = fromVal >= ex.rate;
          const maxTimes = Math.floor(fromVal / ex.rate);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12, minWidth: 40 }}>{ex.icon}</span>
              <span className="color-dim" style={{ fontSize: 11, flex: 1 }}>{ex.rate}{ex.fromName} → {ex.amount}{ex.toName}</span>
              <button className="small-btn accent" disabled={!canExchange}
                onClick={() => { exchangeResource(ex.from, ex.to, ex.rate, ex.amount, 1); setExchangeMsg(`${ex.amount}${ex.toName} 已到账`); setTimeout(() => setExchangeMsg(''), 1500); }}
                style={{ fontSize: 10, padding: '2px 6px' }}>×1</button>
              <button className="small-btn" disabled={maxTimes < 10}
                onClick={() => { exchangeResource(ex.from, ex.to, ex.rate, ex.amount, 10); setExchangeMsg(`${ex.amount * 10}${ex.toName} 已到账`); setTimeout(() => setExchangeMsg(''), 1500); }}
                style={{ fontSize: 10, padding: '2px 6px', background: maxTimes >= 10 ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.08)', color: maxTimes >= 10 ? '#fff' : 'var(--text-dim)', border: 'none', borderRadius: 6 }}>×10</button>
              {maxTimes > 0 && <button className="small-btn"
                onClick={() => { exchangeResource(ex.from, ex.to, ex.rate, ex.amount, maxTimes); setExchangeMsg(`${formatNumber(ex.amount * maxTimes)}${ex.toName} 已到账`); setTimeout(() => setExchangeMsg(''), 1500); }}
                style={{ fontSize: 10, padding: '2px 6px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', border: 'none', borderRadius: 6 }}>全换({maxTimes})</button>}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── Save Manager Sub-page ───
export function SaveManagerPage({ onBack }: { onBack: () => void }) {
  const saveToSlot = useGameStore(s => s.saveToSlot);
  const loadFromSlot = useGameStore(s => s.loadFromSlot);
  const deleteSlot = useGameStore(s => s.deleteSlot);
  const getSaveSlots = useGameStore(s => s.getSaveSlots);
  const [slots, setSlots] = useState(getSaveSlots());
  const [message, setMessage] = useState('');

  const refresh = () => setSlots(getSaveSlots());

  const handleSave = (slotId: number) => {
    const slotData = slots.find(s => s.id === slotId);
    if (slotData?.hasData && !confirm(`槽位 ${slotId} 已有存档，确定覆盖？`)) return;
    saveToSlot(slotId);
    refresh();
    setMessage(`已保存到槽位 ${slotId}`);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleLoad = (slotId: number) => {
    if (!confirm(`确定加载槽位 ${slotId} 的存档？当前进度将丢失！`)) return;
    loadFromSlot(slotId);
    refresh();
    setMessage(`已加载槽位 ${slotId}`);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDelete = (slotId: number) => {
    if (!confirm(`确定删除槽位 ${slotId} 的存档？`)) return;
    deleteSlot(slotId);
    refresh();
    setMessage(`已删除槽位 ${slotId}`);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="存档管理" onBack={onBack} />

      {message && (
        <div className="save-message">{message}</div>
      )}

      {slots.map(slot => (
        <Card key={slot.id} className="save-slot-card">
          <div className="save-slot-header">
            <span className="color-accent">存档槽 {slot.id}</span>
            {slot.hasData ? (
              <span className="color-success">[有数据]</span>
            ) : (
              <span className="color-dim">[空]</span>
            )}
          </div>
          {slot.hasData && slot.summary && (
            <div className="save-slot-info">
              <div className="stat-row"><span className="stat-label">角色</span><span>{slot.summary.name} Lv.{slot.summary.level}</span></div>
              <div className="stat-row"><span className="stat-label">境界</span><span className="color-realm">{slot.summary.realm}</span></div>
              <div className="stat-row"><span className="stat-label">章节</span><span>第{slot.summary.chapter}章 第{slot.summary.stage}关</span></div>
              <div className="stat-row"><span className="stat-label">游戏时间</span><span>{formatTime(slot.summary.playTime)}</span></div>
              <div className="stat-row"><span className="stat-label">保存时间</span><span className="color-dim">{new Date(slot.summary.savedAt).toLocaleString()}</span></div>
            </div>
          )}
          <div className="save-slot-actions">
            <button className="small-btn accent" onClick={() => handleSave(slot.id)}>保存</button>
            {slot.hasData && (
              <>
                <button className="small-btn" onClick={() => handleLoad(slot.id)}>加载</button>
                <button className="small-btn danger" onClick={() => handleDelete(slot.id)}>删除</button>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Bag View ───
