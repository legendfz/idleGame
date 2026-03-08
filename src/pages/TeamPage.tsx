import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber } from '../utils/format';
import { Card, SubPageHeader, SubPage } from './shared';
import { GemPanel } from '../components/GemPanel';
import { getResonanceBonus } from '../data/resonance';
import { getActiveSetBonuses, EQUIP_SETS, EQUIPMENT_TEMPLATES } from '../data/equipment';
import { QUALITY_INFO, EquipmentItem } from '../types';
import { getEnhanceCost, getMaxEnhanceLevel, isHighEnhance, getHighEnhanceRate, getEquipPerfection, getEquipEffectiveStat } from '../data/equipment';
import { getReforgeCost } from '../store/equipmentActions';
import { SUBSTAT_INFO, type Substat } from '../data/substats';

export function CharacterDetailPage({ onBack }: { onBack: () => void }) {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreak = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="角色详情" onBack={onBack} />
      <Card title={player.name} titleColor="var(--accent)">
        <div className="stat-grid">
          <div className="stat-item"><span className="stat-label">攻击</span><span className="color-attack">{formatNumber(eStats.attack)}</span></div>
          <div className="stat-item"><span className="stat-label">血量</span><span className="color-hp">{formatNumber(eStats.maxHp)}</span></div>
          <div className="stat-item"><span className="stat-label">速度</span><span className="color-speed">{eStats.speed.toFixed(1)}</span></div>
          <div className="stat-item"><span className="stat-label">暴击率</span><span className="color-crit">{eStats.critRate.toFixed(0)}%</span></div>
          <div className="stat-item"><span className="stat-label">暴击伤害</span><span className="color-crit">{eStats.critDmg.toFixed(1)}x</span></div>
          <div className="stat-item"><span className="stat-label">点击攻击</span><span className="color-attack">{player.clickPower}</span></div>
        </div>
      </Card>
      <Card title={`境界 · ${currentRealm.name}`} titleColor="var(--realm-color)">
        <div className="color-dim" style={{ fontSize: 12 }}>{currentRealm.description}</div>
        {nextRealm && (
          <>
            <div style={{ fontSize: 12, marginTop: 12 }} className="color-dim">
              下一境界：{nextRealm.name} (Lv.{nextRealm.levelReq} + {nextRealm.pantaoReq} 蟠桃)
            </div>
            <button className="breakthrough-btn" disabled={!canBreak} onClick={attemptBreakthrough}>
              {canBreak ? '突破！' : '条件不足'}
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

function SetBonusPanel({ weapon, armor, treasure }: { weapon: EquipmentItem | null; armor: EquipmentItem | null; treasure: EquipmentItem | null }) {
  const equipped = [weapon, armor, treasure].filter(Boolean) as EquipmentItem[];
  const activeSets = getActiveSetBonuses(weapon, armor, treasure);
  
  if (activeSets.length === 0 && equipped.length === 0) return null;

  // Find sets where player has at least 1 piece equipped
  const relevantSets = EQUIP_SETS.map(set => {
    const ownedCount = set.pieces.filter(pid => equipped.some(e => e.templateId === pid)).length;
    return { set, ownedCount };
  }).filter(s => s.ownedCount > 0);

  if (relevantSets.length === 0) return null;

  return (
    <Card style={{ borderColor: '#8b5cf6', background: 'rgba(139,92,246,0.06)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 8, textAlign: 'center' }}>
        ⚔️ 套装效果
      </div>
      {relevantSets.map(({ set, ownedCount }) => {
        const totalPieces = set.pieces.length;
        const isActive = ownedCount >= (set.bonuses[0]?.count ?? 2);
        return (
          <div key={set.id} style={{ marginBottom: 8, padding: '6px 8px', borderRadius: 8, background: isActive ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#a78bfa' : '#888' }}>
                {set.name}
              </span>
              <span style={{ fontSize: 11, color: isActive ? '#a78bfa' : '#666' }}>
                {ownedCount}/{totalPieces}
              </span>
            </div>
            {/* Show pieces */}
            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
              {set.pieces.map(pid => {
                const tmpl = EQUIPMENT_TEMPLATES.find(t => t.id === pid);
                const owned = equipped.some(e => e.templateId === pid);
                const quality = tmpl?.quality ?? 'common';
                return (
                  <span key={pid} style={{
                    fontSize: 10, padding: '1px 5px', borderRadius: 4,
                    border: `1px solid ${owned ? QUALITY_INFO[quality].color : '#333'}`,
                    color: owned ? QUALITY_INFO[quality].color : '#555',
                    background: owned ? `${QUALITY_INFO[quality].color}15` : 'transparent',
                  }}>
                    {tmpl?.emoji ?? '?'} {tmpl?.name ?? pid}
                  </span>
                );
              })}
            </div>
            {/* Show bonuses */}
            {set.bonuses.map((b, i) => (
              <div key={i} style={{
                fontSize: 10, marginTop: 3,
                color: ownedCount >= b.count ? '#4ade80' : '#555',
              }}>
                [{b.count}件] {b.description} {ownedCount >= b.count ? '✅' : ''}
              </div>
            ))}
          </div>
        );
      })}
    </Card>
  );
}

export function TeamView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const batchEnhanceEquipped = useGameStore(s => s.batchEnhanceEquipped);
  const reforgeEquip = useGameStore(s => s.reforgeEquip);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const [enhanceMsg, setEnhanceMsg] = useState<string | null>(null);

  const handleBatchEnhance = () => {
    const result = batchEnhanceEquipped();
    if (result.count === 0) {
      setEnhanceMsg('没有可强化的装备（已满级或灵石不足）');
    } else {
      setEnhanceMsg(`强化 ${result.count} 次`);
    }
    setTimeout(() => setEnhanceMsg(null), 2500);
  };

  // Combat power
  const combatPower = Math.floor(eStats.attack * (1 + (eStats.critRate / 100) * ((eStats.critDmg || 150) / 100)) + eStats.maxHp * 0.05);
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const resonance = getResonanceBonus(weapon, armor, treasure);

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">队伍</h3>
      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'characterDetail' })}>
        <div className="card-title" style={{ color: 'var(--accent)' }}>{player.name}</div>
        <div className="stat-grid-compact">
          <span className="color-attack">攻 {formatNumber(eStats.attack)}</span>
          <span className="color-hp">血 {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">暴 {eStats.critRate.toFixed(0)}%</span>
          <span style={{ color: '#ffcc00', fontWeight: 700 }}>⭐ {formatNumber(combatPower)}</span>
        </div>
        <div className="card-footer">
          <span className="color-realm">{currentRealm.name}</span>
          <span className="color-dim">Lv.{player.level}</span>
          <span className="color-dim" style={{ marginLeft: 'auto' }}>查看详情 →</span>
        </div>
      </Card>
      {resonance && (
        <Card style={{ borderColor: '#e2c97e', background: 'rgba(226,201,126,0.08)' }}>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#e2c97e', fontWeight: 700 }}>
            🔮 {resonance.name}
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#ccc', marginTop: 4 }}>
            {resonance.description}
          </div>
        </Card>
      )}
      <SetBonusPanel weapon={weapon} armor={armor} treasure={treasure} />
      {/* v162.0: Equipment substats */}
      {[weapon, armor, treasure].some(e => e?.substats?.length) && (
        <Card title="📜 副属性" titleColor="#64b5f6">
          {([['武器', weapon], ['护甲', armor], ['法宝', treasure]] as const).map(([label, item]) => {
            if (!item?.substats?.length) return null;
            return (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: QUALITY_INFO[item.quality].color, marginBottom: 4 }}>{item.emoji} {item.name}</div>
                {item.substats.map((s: { type: string; value: number }, i: number) => {
                  const info = SUBSTAT_INFO[s.type as keyof typeof SUBSTAT_INFO];
                  return info ? (
                    <div key={i} style={{ fontSize: 11, color: '#b0bec5', marginLeft: 12, lineHeight: 1.6 }}>
                      {info.emoji} {info.name} {info.format(s.value)}
                    </div>
                  ) : null;
                })}
              </div>
            );
          })}
        </Card>
      )}
      {/* Equipment enhance info */}
      <Card title="装备强化" titleColor="#e2c97e">
        {([['武器', weapon], ['护甲', armor], ['法宝', treasure]] as const).map(([label, item]) => {
          if (!item) return <div key={label} style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>{label}：未装备</div>;
          const maxLv = getMaxEnhanceLevel(item);
          const atMax = item.level >= maxLv;
          const cost = atMax ? 0 : getEnhanceCost(item);
          const high = isHighEnhance(item);
          const rate = high && !atMax ? getHighEnhanceRate(item.level + 1) : 100;
          const qColor = QUALITY_INFO[item.quality].color;
          return (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: qColor }}>{item.emoji} {item.name} +{item.level}
                <span style={{ color: getEquipPerfection(item) >= 90 ? '#4ade80' : getEquipPerfection(item) >= 60 ? '#ffcc00' : '#ff6b6b', fontSize: 10, marginLeft: 4 }}>
                  {getEquipPerfection(item)}%
                </span>
              </span>
              <span style={{ color: atMax ? '#4ade80' : '#ccc' }}>
                {atMax ? '✅ 满级' : `💰${formatNumber(cost)} · ${rate}%`}
              </span>
            </div>
          );
        })}
      </Card>
      <button className="breakthrough-btn" style={{ margin: '0 12px 12px', fontSize: 13 }} onClick={handleBatchEnhance}>
        ⚒ 一键强化已装备
      </button>
      {enhanceMsg && <div style={{ textAlign: 'center', color: '#ffcc00', fontSize: 13, marginBottom: 8 }}>{enhanceMsg}</div>}
      {/* v142.0: Reforge equipped */}
      <Card title="🔮 装备洗炼" titleColor="#e040fb">
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>重置基础属性（±30%），消耗灵石</div>
        {([['武器', weapon], ['护甲', armor], ['法宝', treasure]] as const).map(([label, item]) => {
          if (!item) return <div key={label} style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>{label}：未装备</div>;
          const cost = getReforgeCost(item);
          const canAfford = player.lingshi >= cost;
          return (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: QUALITY_INFO[item.quality].color }}>{item.emoji} {item.name} (基础:{item.baseStat})</span>
              <button className="small-btn" style={{ background: canAfford ? 'linear-gradient(135deg,#9c27b0,#e040fb)' : '#333', color: '#fff', fontSize: 11 }}
                onClick={() => reforgeEquip(item.uid)} disabled={!canAfford}>
                🔮 {formatNumber(cost)}
              </button>
            </div>
          );
        })}
        <button className="small-btn" style={{ width: '100%', marginTop: 8, padding: '8px', background: 'linear-gradient(135deg,#7c3aed,#e040fb)', color: '#fff', fontSize: 12, borderRadius: 8 }}
          onClick={() => { const n = useGameStore.getState().batchReforgeEquipped(); setEnhanceMsg(n > 0 ? `✨ ${n}件装备属性提升！` : '💨 本次未获提升'); setTimeout(() => setEnhanceMsg(''), 2000); }}>
          🔮 一键洗炼（仅保留提升）
        </button>
      </Card>
      {/* v167.0: Equipment Score Summary */}
      {(() => {
        const equipped = [weapon, armor, treasure].filter(Boolean) as EquipmentItem[];
        if (equipped.length === 0) return null;
        const perfs = equipped.map(e => getEquipPerfection(e));
        const avg = Math.round(perfs.reduce((a, b) => a + b, 0) / perfs.length);
        const avgColor = avg >= 90 ? '#4ade80' : avg >= 70 ? '#fbbf24' : avg >= 50 ? '#fb923c' : '#ef4444';
        const grade = avg >= 95 ? 'SSS' : avg >= 90 ? 'SS' : avg >= 80 ? 'S' : avg >= 70 ? 'A' : avg >= 50 ? 'B' : 'C';
        return (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>📊 装备总评</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: avgColor }}>{grade}</span>
                <span style={{ fontSize: 12, color: avgColor }}>{avg}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6, fontSize: 10 }}>
              {(['武器', '护甲', '法宝'] as const).map((label, i) => {
                const item = [weapon, armor, treasure][i];
                if (!item) return <span key={label} style={{ color: '#555' }}>{label}: —</span>;
                const p = perfs[i];
                return <span key={label} style={{ color: p >= 90 ? '#4ade80' : p >= 60 ? '#fbbf24' : '#ef4444' }}>{label}: {p}%</span>;
              })}
            </div>
          </Card>
        );
      })()}
      {/* v137.0: Equipment Loadouts */}
      <LoadoutPanel />
      {/* v155.0: Gem System */}
      <Card><GemPanel /></Card>
    </div>
  );
}

function LoadoutPanel() {
  const equipLoadouts = useGameStore(s => s.equipLoadouts) || [];
  const saveLoadout = useGameStore(s => s.saveLoadout);
  const applyLoadout = useGameStore(s => s.applyLoadout);
  const deleteLoadout = useGameStore(s => s.deleteLoadout);
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const [msg, setMsg] = useState('');
  const [editSlot, setEditSlot] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const MAX_SLOTS = 3;

  const handleSave = (i: number) => {
    const name = editSlot === i ? editName : `方案${i + 1}`;
    saveLoadout(i, name);
    setEditSlot(null);
    setMsg(`已保存「${name}」`);
    setTimeout(() => setMsg(''), 2000);
  };

  const handleApply = (i: number) => {
    const result = applyLoadout(i);
    setMsg(result.message);
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <Card title="📋 装备预设" titleColor="#a78bfa">
      {Array.from({ length: MAX_SLOTS }, (_, i) => {
        const loadout = equipLoadouts[i];
        const hasData = loadout && (loadout.weapon || loadout.armor || loadout.treasure);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '6px 8px', background: 'rgba(167,139,250,0.08)', borderRadius: 8 }}>
            {editSlot === i ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => { handleSave(i); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(i); }}
                autoFocus
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #a78bfa', borderRadius: 4, color: '#fff', padding: '2px 6px', fontSize: 12, width: 80 }}
                placeholder={`方案${i + 1}`}
              />
            ) : (
              <span style={{ color: hasData ? '#e2c97e' : '#666', fontSize: 13 }}>
                {hasData ? `${loadout.name || `方案${i + 1}`}` : `空槽${i + 1}`}
              </span>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => { setEditSlot(i); setEditName(equipLoadouts[i]?.name || `方案${i + 1}`); }}
                style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
              >保存</button>
              {hasData && (
                <>
                  <button
                    onClick={() => handleApply(i)}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
                  >装备</button>
                  <button
                    onClick={() => { deleteLoadout(i); setMsg('已删除'); setTimeout(() => setMsg(''), 2000); }}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
                  >删</button>
                </>
              )}
            </div>
          </div>
        );
      })}
      {msg && <div style={{ textAlign: 'center', color: '#ffcc00', fontSize: 12, marginTop: 4 }}>{msg}</div>}
    </Card>
  );
}
