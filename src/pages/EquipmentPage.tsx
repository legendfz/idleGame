import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/format';
import { EquipmentItem, EquipSlot, QUALITY_INFO, INVENTORY_MAX } from '../types';
import {
  getEquipEffectiveStat, getEnhanceCost, getMaxEnhanceLevel, getActiveSetBonuses,
  isHighEnhance, getHighEnhanceRate, getHighEnhanceDrop,
  canRefine, getRefineCost, REFINE_MATERIAL_COUNT, REFINE_SHARD_PITY,
  hasHiddenPassive, hasFullMythic15, SCROLL_PRICES,
} from '../data/equipment';
import { Card, SubPageHeader, SubPage } from './shared';

export function EquipDetailPage({ item, onBack }: { item: EquipmentItem; onBack: () => void }) {
  const enhance = useGameStore(s => s.enhanceEquip);
  const bulkEnhance = useGameStore(s => s.bulkEnhance);
  const player = useGameStore(s => s.player);
  const [useProtect, setUseProtect] = useState(false);
  const [useLucky, setUseLucky] = useState(false);

  const stat = getEquipEffectiveStat(item);
  const maxLvl = getMaxEnhanceLevel(item);
  const atMax = item.level >= maxLvl;
  const cost = !atMax ? getEnhanceCost(item) : 0;
  const canEnhanceNow = !atMax && player.lingshi >= cost;
  const qi = QUALITY_INFO[item.quality];
  const highEnhance = isHighEnhance(item);
  const hidden = hasHiddenPassive(item);
  const targetLvl = item.level + 1;
  const rate = highEnhance ? getHighEnhanceRate(targetLvl) + (useLucky ? 10 : 0) : 100;
  const drop = highEnhance ? (useProtect ? 0 : getHighEnhanceDrop(targetLvl)) : 0;

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="装备详情" onBack={onBack} />

      <Card borderColor={qi.color}>
        <div className="equip-detail-header">
          <span style={{ color: qi.color, fontSize: 18, fontWeight: 'bold' }}>
            {qi.symbol} {item.name} {item.level > 0 ? `+${item.level}` : ''}
          </span>
          <span style={{ color: qi.color, fontSize: 12 }}>{qi.label}</span>
        </div>

        <div className="equip-detail-stats">
          {item.slot === 'weapon' && <div className="stat-row"><span className="stat-label">攻击加成</span><span className="color-attack">+{formatNumber(stat)}</span></div>}
          {item.slot === 'armor' && <div className="stat-row"><span className="stat-label">血量加成</span><span className="color-hp">+{formatNumber(stat)}</span></div>}
          {item.passive && <div className="stat-row"><span className="stat-label">被动</span><span className="color-passive">{item.passive.description}</span></div>}
          {item.setId && <div className="stat-row"><span className="stat-label">套装</span><span className="color-set">已激活</span></div>}
          {hidden && <div className="stat-row"><span className="stat-label">隐藏</span><span className="color-boss">{hidden.name}</span></div>}
        </div>
      </Card>

      {!atMax && (
        <Card title="强化">
          <div className="enhance-info">
            <div className="stat-row">
              <span className="stat-label">等级</span>
              <span>{item.level} / {maxLvl}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">费用</span>
              <span className="color-gold">{formatNumber(cost)} 灵石</span>
            </div>
            {highEnhance && (
              <>
                <div className="stat-row">
                  <span className="stat-label">成功率</span>
                  <span style={{ color: rate >= 50 ? 'var(--green)' : rate >= 30 ? 'var(--accent)' : 'var(--red)' }}>
                    {rate}%
                  </span>
                </div>
                {drop > 0 && (
                  <div className="stat-row">
                    <span className="stat-label">失败降级</span>
                    <span className="color-boss">-{drop}级</span>
                  </div>
                )}
                <div className="scroll-toggles">
                  <label className="scroll-label">
                    <input type="checkbox" checked={useProtect} onChange={e => setUseProtect(e.target.checked)} />
                    护级符({player.protectScrolls})
                  </label>
                  <label className="scroll-label">
                    <input type="checkbox" checked={useLucky} onChange={e => setUseLucky(e.target.checked)} />
                    幸运符({player.luckyScrolls})
                  </label>
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="action-btn accent" style={{ flex: 1 }} disabled={!canEnhanceNow}
              onClick={() => enhance(item.uid, useProtect, useLucky)}>
              {highEnhance ? '高阶强化' : '强化'} · {formatNumber(cost)} 灵石
            </button>
            {!highEnhance && (
              <button className="action-btn" style={{ flex: 1 }} disabled={!canEnhanceNow}
                onClick={() => bulkEnhance(item.uid)}>
                ⚡ 一键强化
              </button>
            )}
          </div>
        </Card>
      )}
      {atMax && (
        <Card><div className="color-accent" style={{ textAlign: 'center', padding: 8 }}>已满级</div></Card>
      )}
    </div>
  );
}

// ─── Equipment Slot Display (compact, in bag list) ───
export function EquipSlotDisplay({ label, item, slot, onDetail }: {
  label: string; item: EquipmentItem | null; slot: EquipSlot; onDetail: (item: EquipmentItem) => void;
}) {
  const unequip = useGameStore(s => s.unequipSlot);

  if (!item) {
    return (
      <Card className="equip-slot-card empty">
        <span className="slot-label">{label}</span>
        <span className="color-dim">— 空 —</span>
      </Card>
    );
  }

  const qi = QUALITY_INFO[item.quality];
  const stat = getEquipEffectiveStat(item);

  return (
    <Card className="equip-slot-card" borderColor={qi.color} style={{ cursor: 'pointer' }}
      onClick={() => onDetail(item)}>
      <div className="equip-header">
        <span style={{ color: qi.color }}>
          {qi.symbol} {item.name} {item.level > 0 ? `+${item.level}` : ''}
        </span>
        <span style={{ color: qi.color, fontSize: 11 }}>{qi.label}</span>
      </div>
      <div className="equip-stats">
        {item.slot === 'weapon' && <span className="color-attack">攻+{formatNumber(stat)}</span>}
        {item.slot === 'armor' && <span className="color-hp">血+{formatNumber(stat)}</span>}
        {item.passive && <span className="color-passive">{item.passive.description}</span>}
      </div>
      <div className="equip-actions">
        <button className="small-btn" onClick={(e) => { e.stopPropagation(); unequip(slot); }}>卸下</button>
        <span className="color-dim" style={{ fontSize: 11 }}>点击查看详情</span>
      </div>
    </Card>
  );
}

// ─── Refine Sub-page ───
export function RefinePage({ onBack }: { onBack: () => void }) {
  const inventory = useGameStore(s => s.inventory);
  const player = useGameStore(s => s.player);
  const refineItem = useGameStore(s => s.refineItem);
  const [targetUid, setTargetUid] = useState<string | null>(null);
  const [selectedMats, setSelectedMats] = useState<Set<string>>(new Set());
  const [useTianming, setUseTianming] = useState(false);

  const legendaryItems = inventory.filter(i => i.quality === 'legendary');
  const target = legendaryItems.find(i => i.uid === targetUid);
  const availableMats = legendaryItems.filter(i => i.uid !== targetUid);

  const toggleMat = (uid: string) => {
    const next = new Set(selectedMats);
    if (next.has(uid)) next.delete(uid); else if (next.size < REFINE_MATERIAL_COUNT) next.add(uid);
    setSelectedMats(next);
  };

  const cost = target ? getRefineCost(target) : 0;
  const canRefineNow = target && selectedMats.size >= REFINE_MATERIAL_COUNT && player.lingshi >= cost;
  const canPity = target && selectedMats.size >= REFINE_MATERIAL_COUNT && player.hongmengShards >= REFINE_SHARD_PITY && player.lingshi >= cost;

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="精炼 · 混沌→鸿蒙" onBack={onBack} />

      {legendaryItems.length === 0 ? (
        <Card><div className="color-dim" style={{ textAlign: 'center', padding: 16 }}>没有可精炼的混沌装备</div></Card>
      ) : (
        <>
          <Card title="选择目标 (混沌装备)">
            <div className="refine-targets">
              {legendaryItems.map(item => (
                <button key={item.uid}
                  className={`small-btn ${targetUid === item.uid ? 'accent' : ''}`}
                  onClick={() => { setTargetUid(item.uid === targetUid ? null : item.uid); setSelectedMats(new Set()); }}>
                  {item.name}{item.level > 0 ? `+${item.level}` : ''}
                </button>
              ))}
            </div>
          </Card>

          {target && (
            <>
              <Card title="选择材料">
                <div className="color-dim" style={{ fontSize: 12, marginBottom: 8 }}>
                  混沌装备 x{selectedMats.size}/{REFINE_MATERIAL_COUNT}
                </div>
                <div className="refine-targets">
                  {availableMats.map(item => (
                    <button key={item.uid}
                      className={`small-btn ${selectedMats.has(item.uid) ? 'accent' : ''}`}
                      onClick={() => toggleMat(item.uid)}>
                      {selectedMats.has(item.uid) ? '[已选] ' : ''}{item.name}
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="精炼信息">
                <div className="stat-row">
                  <span className="stat-label">费用</span>
                  <span className="color-gold">{formatNumber(cost)} 灵石</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">成功率</span>
                  <span className="color-crit">{useTianming ? '15%' : '10%'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">鸿蒙碎片</span>
                  <span className="color-set">{player.hongmengShards}/{REFINE_SHARD_PITY}</span>
                </div>
                <label className="scroll-label" style={{ marginTop: 4 }}>
                  <input type="checkbox" checked={useTianming} onChange={e => setUseTianming(e.target.checked)} />
                  天命符({player.tianmingScrolls}) +5%成功率
                </label>
                <div className="equip-actions" style={{ marginTop: 8 }}>
                  <button className="action-btn accent" disabled={!canRefineNow}
                    onClick={() => { refineItem(target.uid, [...selectedMats], useTianming, false); setTargetUid(null); setSelectedMats(new Set()); }}>
                    精炼
                  </button>
                  <button className="action-btn" disabled={!canPity}
                    style={{ background: canPity ? '#ce93d8' : undefined }}
                    onClick={() => { refineItem(target.uid, [...selectedMats], false, true); setTargetUid(null); setSelectedMats(new Set()); }}>
                    碎片保底 ({player.hongmengShards}/{REFINE_SHARD_PITY})
                  </button>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Shop Sub-page ───

