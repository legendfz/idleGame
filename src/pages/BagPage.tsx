import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/format';
import { EquipmentItem, EquipSlot, QUALITY_INFO } from '../types';
import { getInventoryMax } from '../store/gameStore';
import { getReforgeCost } from '../store/equipmentActions';
import {
  getEquipEffectiveStat, getEnhanceCost, getMaxEnhanceLevel, getActiveSetBonuses,
  hasFullMythic15,
} from '../data/equipment';
import { Card, SubPage } from './shared';
import { EquipSlotDisplay } from './EquipmentPage';

export function BagView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const inventory = useGameStore(s => s.inventory);
  const equipItem = useGameStore(s => s.equipItem);
  const sellEquip = useGameStore(s => s.sellEquip);
  const decomposeEquip = useGameStore(s => s.decomposeEquip);
  const batchDecompose = useGameStore(s => s.batchDecompose);
  const toggleLock = useGameStore(s => s.toggleLock);
  const player = useGameStore(s => s.player);
  const autoEquipBest = useGameStore(s => s.autoEquipBest);
  const quickDecompose = useGameStore(s => s.quickDecompose);
  const synthesizeEquip = useGameStore(s => s.synthesizeEquip);
  const reforgeEquip = useGameStore(s => s.reforgeEquip);
  const [filter, setFilter] = useState<EquipSlot | 'all'>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [decomposeMode, setDecomposeMode] = useState(false);
  const [synthMode, setSynthMode] = useState(false);
  const [synthSelected, setSynthSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);

  const toggleSelect = (uid: string) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(uid)) next.delete(uid); else next.add(uid); return next; });
  };

  const smartRecommend = () => {
    const qualityOrder = Object.keys(QUALITY_INFO);
    const sorted = [...inventory].filter(i => !i.locked).sort((a, b) => {
      const qa = qualityOrder.indexOf(a.quality), qb = qualityOrder.indexOf(b.quality);
      if (qa !== qb) return qa - qb;
      return a.level - b.level;
    });
    const count = Math.max(1, Math.min(Math.floor(inventory.length / 2), inventory.length - 25));
    setSelected(new Set(sorted.slice(0, count).map(i => i.uid)));
  };

  const handleBatchDecompose = () => {
    if (selected.size === 0) return;
    if (confirm(`确定分解 ${selected.size} 件装备？`)) {
      batchDecompose(Array.from(selected));
      setSelected(new Set());
      setDecomposeMode(false);
    }
  };

  const setBonuses = getActiveSetBonuses(weapon, armor, treasure);
  const filtered = inventory
    .filter(item => filter === 'all' || item.slot === filter)
    .filter(item => qualityFilter === 'all' || item.quality === qualityFilter)
    .sort((a, b) => {
      const qi = Object.keys(QUALITY_INFO);
      return qi.indexOf(b.quality) - qi.indexOf(a.quality);
    });

  const onDetail = (item: EquipmentItem) => setSubPage({ type: 'equipDetail', item, location: 'equipped' });

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">装备</h3>

      <EquipSlotDisplay label="武器" item={weapon} slot="weapon" onDetail={onDetail} />
      <EquipSlotDisplay label="护甲" item={armor} slot="armor" onDetail={onDetail} />
      <EquipSlotDisplay label="法宝" item={treasure} slot="treasure" onDetail={onDetail} />

      {setBonuses.length > 0 && (
        <div className="set-bonus-section">
          {setBonuses.map(sb => (
            <Card key={sb.set.id} borderColor="#ce93d8" className="set-bonus-card">
              <div className="color-set" style={{ fontWeight: 'bold' }}>{sb.set.name} ({sb.activeCount}/{sb.set.pieces.length})</div>
              {sb.bonuses.map((b, i) => (
                <div key={i} className="color-accent" style={{ fontSize: 12 }}>{b.description}</div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {hasFullMythic15(weapon, armor, treasure) && (
        <Card borderColor="var(--red)" className="mythic-card">
          <div className="color-boss" style={{ fontWeight: 'bold' }}>鸿蒙至尊</div>
          <div className="color-accent" style={{ fontSize: 12 }}>全属性额外 +100%</div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="bag-quick-actions">
        <button className="small-btn accent" onClick={() => {
          const n = autoEquipBest();
          if (n === 0) alert('已是最优装备！');
        }}>一键最优</button>
        <button className="small-btn" style={synthMode ? { background: 'linear-gradient(135deg, #7c4dff, #448aff)', color: '#fff' } : {}} onClick={() => { setSynthMode(!synthMode); setSynthSelected([]); setDecomposeMode(false); }}>合成</button>
        <button className="small-btn" onClick={() => setSubPage({ type: 'refine' })}>精炼</button>
        <button className="small-btn" onClick={() => setSubPage({ type: 'shop' })}>商店</button>
        <button className="small-btn danger" onClick={() => {
          const qualityNames = ['凡品', '灵品', '仙品'];
          const choice = prompt('快速分解品质以下装备：\n1. 凡品\n2. 凡品+灵品\n3. 凡品+灵品+仙品\n输入数字：');
          if (!choice) return;
          const maxQ = parseInt(choice) - 1;
          if (maxQ < 0 || maxQ > 2) return;
          if (confirm(`确定分解所有 ${qualityNames.slice(0, maxQ + 1).join('+')} 装备？`)) {
            const n = quickDecompose(maxQ);
            if (n === 0) alert('没有可分解的装备');
          }
        }}>速分</button>
      </div>

      {/* Resources */}
      <Card className="resources-card">
        <div className="resources-row">
          <span className="color-set">碎片 {player.hongmengShards}</span>
          <span className="color-dim">天命 {player.tianmingScrolls}</span>
          <span className="color-dim">护级 {player.protectScrolls}</span>
          <span className="color-dim">幸运 {player.luckyScrolls}</span>
        </div>
      </Card>

      {/* Bag header */}
      <div className="bag-header">
        <h3 className="section-title" style={{ margin: 0 }}>
          背包 ({inventory.length}/{getInventoryMax(player.reincarnations)})
        </h3>
        <button className={`small-btn ${decomposeMode ? 'danger' : ''}`}
          onClick={() => { setDecomposeMode(!decomposeMode); setSelected(new Set()); }}
          style={{ fontSize: 11 }}>
          {decomposeMode ? '取消' : '分解'}
        </button>
      </div>

      {decomposeMode && (
        <div className="decompose-toolbar">
          <button className="small-btn" onClick={smartRecommend}>智能推荐</button>
          <button className="small-btn" onClick={() => setSelected(new Set(inventory.map(i => i.uid)))}>全选</button>
          <button className="small-btn" onClick={() => setSelected(new Set())}>清空</button>
          <button className="small-btn danger" onClick={handleBatchDecompose} disabled={selected.size === 0}>
            分解({selected.size})
          </button>
        </div>
      )}

      {synthMode && (
        <div className="decompose-toolbar" style={{ background: 'rgba(124,77,255,0.1)', borderColor: '#7c4dff' }}>
          <span className="color-accent" style={{ fontSize: 12 }}>选择3件同品质装备合成更高品质 ({synthSelected.length}/3)</span>
          <button className="small-btn accent" disabled={synthSelected.length !== 3} onClick={() => {
            const result = synthesizeEquip(synthSelected);
            alert(result.message);
            if (result.success) setSynthSelected([]);
          }}>合成!</button>
          <button className="small-btn" onClick={() => { setSynthMode(false); setSynthSelected([]); }}>取消</button>
        </div>
      )}

      <div className="bag-filters">
        {([['all', '全部'], ['weapon', '武器'], ['armor', '护甲'], ['treasure', '法宝']] as const).map(([key, label]) => (
          <button key={key} className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => { setFilter(key); setPage(0); }}>{label}</button>
        ))}
      </div>
      <div className="bag-filters" style={{ marginTop: 4 }}>
        <button className={`filter-btn ${qualityFilter === 'all' ? 'active' : ''}`}
          onClick={() => { setQualityFilter('all'); setPage(0); }}>全品质</button>
        {(Object.entries(QUALITY_INFO) as [string, { label: string; color: string }][]).map(([key, qi]) => (
          <button key={key} className={`filter-btn ${qualityFilter === key ? 'active' : ''}`}
            style={qualityFilter === key ? { borderColor: qi.color, color: qi.color } : { color: qi.color }}
            onClick={() => { setQualityFilter(key); setPage(0); }}>{qi.label.slice(0, 2)}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card><div className="color-dim" style={{ textAlign: 'center', padding: 16 }}>背包空空如也…去战斗获取装备吧！</div></Card>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="bag-pagination" style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '8px 0' }}>
          <button className="small-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>上一页</button>
          <span className="color-dim" style={{ lineHeight: '28px', fontSize: 12 }}>
            {page + 1}/{Math.ceil(filtered.length / PAGE_SIZE)}
          </span>
          <button className="small-btn" disabled={(page + 1) * PAGE_SIZE >= filtered.length} onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      )}

      {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(item => {
        const stat = getEquipEffectiveStat(item);
        const maxLvl = getMaxEnhanceLevel(item);
        const cost = item.level < maxLvl ? getEnhanceCost(item) : 0;
        const sellPrice = Math.floor(stat * 2 + (item.level + 1) * 50);
        const qi = QUALITY_INFO[item.quality];
        const decompLingshi = Math.floor(sellPrice * 0.6);
        const isSelected = selected.has(item.uid);

        return (
          <Card key={item.uid} className="inv-item-card" borderColor={qi.color}
            style={{ background: decomposeMode && isSelected ? 'rgba(244,67,54,0.1)' : synthMode && synthSelected.includes(item.uid) ? 'rgba(124,77,255,0.15)' : undefined, cursor: (decomposeMode || synthMode) ? 'pointer' : undefined }}
            onClick={decomposeMode ? () => { if (!item.locked) toggleSelect(item.uid); } : synthMode ? () => {
              if (item.locked) return;
              setSynthSelected(prev => {
                if (prev.includes(item.uid)) return prev.filter(u => u !== item.uid);
                if (prev.length >= 3) return prev;
                // Enforce same quality
                if (prev.length > 0) {
                  const firstItem = inventory.find(i => i.uid === prev[0]);
                  if (firstItem && firstItem.quality !== item.quality) { alert('必须选择相同品质的装备'); return prev; }
                }
                if (item.quality === 'mythic') { alert('鸿蒙品质已是最高'); return prev; }
                return [...prev, item.uid];
              });
            } : undefined}>
            <div className="equip-header">
              <span style={{ color: qi.color }}>
                {decomposeMode && <span style={{ marginRight: 4 }}>{isSelected ? '[x]' : '[ ]'}</span>}
                {synthMode && <span style={{ marginRight: 4, color: '#7c4dff' }}>{synthSelected.includes(item.uid) ? '◆' : '◇'}</span>}
                {item.locked ? '🔒' : ''}{qi.symbol} {item.name} {item.level > 0 ? `+${item.level}` : ''}
              </span>
              <span style={{ color: qi.color, fontSize: 11 }}>{qi.label}</span>
            </div>
            <div className="equip-stats">
              {item.slot === 'weapon' && (() => {
                const equipped = weapon;
                const eqStat = equipped ? getEquipEffectiveStat(equipped) : 0;
                const diff = stat - eqStat;
                return <>
                  <span className="color-attack">攻+{formatNumber(stat)}</span>
                  {diff !== 0 && <span style={{ color: diff > 0 ? '#4caf50' : '#f44336', fontSize: 11, marginLeft: 4 }}>
                    ({diff > 0 ? '↑' : '↓'}{formatNumber(Math.abs(diff))})
                  </span>}
                </>;
              })()}
              {item.slot === 'armor' && (() => {
                const equipped = armor;
                const eqStat = equipped ? getEquipEffectiveStat(equipped) : 0;
                const diff = stat - eqStat;
                return <>
                  <span className="color-hp">血+{formatNumber(stat)}</span>
                  {diff !== 0 && <span style={{ color: diff > 0 ? '#4caf50' : '#f44336', fontSize: 11, marginLeft: 4 }}>
                    ({diff > 0 ? '↑' : '↓'}{formatNumber(Math.abs(diff))})
                  </span>}
                </>;
              })()}
              {item.slot === 'treasure' && (() => {
                const equipped = treasure;
                const eqStat = equipped ? getEquipEffectiveStat(equipped) : 0;
                const diff = stat - eqStat;
                return <>
                  <span className="color-accent">法+{formatNumber(stat)}</span>
                  {diff !== 0 && <span style={{ color: diff > 0 ? '#4caf50' : '#f44336', fontSize: 11, marginLeft: 4 }}>
                    ({diff > 0 ? '↑' : '↓'}{formatNumber(Math.abs(diff))})
                  </span>}
                </>;
              })()}
              {item.passive && <span className="color-passive">{item.passive.description}</span>}
              {item.substats?.length ? <span style={{ color: '#64b5f6', fontSize: 10 }}>📜{item.substats.length}词缀</span> : null}
              {item.setId && <span className="color-set" style={{ fontSize: 11 }}>套装</span>}
            </div>
            {!decomposeMode && (
              <div className="equip-actions">
                <button className="small-btn accent" onClick={() => equipItem(item)}>装备</button>
                <button className="small-btn" onClick={() => toggleLock(item.uid)}>{item.locked ? '🔓解锁' : '🔒锁定'}</button>
                <button className="small-btn" onClick={() => setSubPage({ type: 'equipDetail', item, location: 'inventory' })}>详情</button>
                <button className="small-btn" style={{background:'linear-gradient(135deg,#9c27b0,#e040fb)',color:'#fff'}}
                  onClick={() => { const cost = getReforgeCost(item); if (player.lingshi < cost) { alert(`需要 ${formatNumber(cost)} 灵石`); return; } reforgeEquip(item.uid); }}
                  title={`洗炼 ${formatNumber(getReforgeCost(item))} 灵石`}>🔮洗炼</button>
                <button className="small-btn" onClick={() => {
                  if (item.locked) { alert('装备已锁定，无法分解'); return; }
                  if (confirm(`确定分解 ${qi.symbol}${item.name}？获得 ${decompLingshi} 灵石`)) decomposeEquip(item.uid);
                }}>分解</button>
                <button className="small-btn danger" onClick={() => {
                  if (confirm(`确定卖出 ${qi.symbol}${item.name}？获得 ${sellPrice} 灵石`)) sellEquip(item.uid);
                }}>卖 {sellPrice}</button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Settings View ───
