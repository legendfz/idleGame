import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/format';
import { EquipmentItem, EquipSlot, QUALITY_INFO, INVENTORY_MAX } from '../types';
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
  const player = useGameStore(s => s.player);
  const autoEquipBest = useGameStore(s => s.autoEquipBest);
  const quickDecompose = useGameStore(s => s.quickDecompose);
  const [filter, setFilter] = useState<EquipSlot | 'all'>('all');
  const [decomposeMode, setDecomposeMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (uid: string) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(uid)) next.delete(uid); else next.add(uid); return next; });
  };

  const smartRecommend = () => {
    const qualityOrder = Object.keys(QUALITY_INFO);
    const sorted = [...inventory].sort((a, b) => {
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
          背包 ({inventory.length}/{INVENTORY_MAX})
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

      <div className="bag-filters">
        {([['all', '全部'], ['weapon', '武器'], ['armor', '护甲'], ['treasure', '法宝']] as const).map(([key, label]) => (
          <button key={key} className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card><div className="color-dim" style={{ textAlign: 'center', padding: 16 }}>背包空空如也…去战斗获取装备吧！</div></Card>
      )}

      {filtered.map(item => {
        const stat = getEquipEffectiveStat(item);
        const maxLvl = getMaxEnhanceLevel(item);
        const cost = item.level < maxLvl ? getEnhanceCost(item) : 0;
        const canEnhance = item.level < maxLvl && player.lingshi >= cost;
        const sellPrice = Math.floor(stat * 2 + (item.level + 1) * 50);
        const qi = QUALITY_INFO[item.quality];
        const decompLingshi = Math.floor(sellPrice * 0.6);
        const isSelected = selected.has(item.uid);

        return (
          <Card key={item.uid} className="inv-item-card" borderColor={qi.color}
            style={{ background: decomposeMode && isSelected ? 'rgba(244,67,54,0.1)' : undefined, cursor: decomposeMode ? 'pointer' : undefined }}
            onClick={decomposeMode ? () => toggleSelect(item.uid) : undefined}>
            <div className="equip-header">
              <span style={{ color: qi.color }}>
                {decomposeMode && <span style={{ marginRight: 4 }}>{isSelected ? '[x]' : '[ ]'}</span>}
                {qi.symbol} {item.name} {item.level > 0 ? `+${item.level}` : ''}
              </span>
              <span style={{ color: qi.color, fontSize: 11 }}>{qi.label}</span>
            </div>
            <div className="equip-stats">
              {item.slot === 'weapon' && <span className="color-attack">攻+{formatNumber(stat)}</span>}
              {item.slot === 'armor' && <span className="color-hp">血+{formatNumber(stat)}</span>}
              {item.passive && <span className="color-passive">{item.passive.description}</span>}
              {item.setId && <span className="color-set" style={{ fontSize: 11 }}>套装</span>}
            </div>
            {!decomposeMode && (
              <div className="equip-actions">
                <button className="small-btn accent" onClick={() => equipItem(item)}>装备</button>
                <button className="small-btn" onClick={() => setSubPage({ type: 'equipDetail', item, location: 'inventory' })}>详情</button>
                <button className="small-btn" onClick={() => {
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
