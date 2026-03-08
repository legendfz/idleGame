// v155.0「仙途璀璨」— 宝石镶嵌面板
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GEM_TYPES, gemSlotsForQuality, GEM_MERGE_COUNT, GEM_MAX_LEVEL, type GemItem } from '../data/gems';

export function GemPanel() {
  const { player, equippedWeapon, equippedArmor, equippedTreasure, socketGem, unsocketGem, mergeGems } = useGameStore();
  const gemInv = player.gemInventory ?? [];
  const equippedGems = player.equippedGems ?? {};
  const [selectedEquip, setSelectedEquip] = useState<string | null>(null);

  const equipped = [
    { label: '⚔️ 武器', item: equippedWeapon },
    { label: '🛡️ 护甲', item: equippedArmor },
    { label: '📿 法宝', item: equippedTreasure },
  ];

  // Group inventory gems by type+level for merge
  const gemGroups: Record<string, { typeId: string; level: number; count: number }> = {};
  gemInv.forEach(g => {
    const key = `${g.typeId}_${g.level}`;
    if (!gemGroups[key]) gemGroups[key] = { typeId: g.typeId, level: g.level, count: 0 };
    gemGroups[key].count++;
  });

  return (
    <div style={{ padding: '8px' }}>
      <h3 style={{ margin: '0 0 8px', color: '#e0d4ff' }}>💎 宝石镶嵌</h3>

      {/* Equipped items gem slots */}
      {equipped.map(({ label, item }) => {
        if (!item) return null;
        const maxSlots = gemSlotsForQuality(item.quality);
        if (maxSlots === 0) return null;
        const gems: GemItem[] = equippedGems[item.uid] ?? [];
        const isSelected = selectedEquip === item.uid;
        return (
          <div key={item.uid} style={{
            background: isSelected ? '#2d1b69' : '#1a1a2e',
            border: `1px solid ${isSelected ? '#a855f7' : '#333'}`,
            borderRadius: 8, padding: 8, marginBottom: 6, cursor: 'pointer',
          }} onClick={() => setSelectedEquip(isSelected ? null : item.uid)}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>
              {label} {item.name} — 插槽 {gems.length}/{maxSlots}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: maxSlots }).map((_, i) => {
                const gem = gems[i];
                const gemType = gem ? GEM_TYPES.find(t => t.id === gem.typeId) : null;
                return (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: 6,
                    background: gem ? `${gemType?.color}33` : '#0a0a1a',
                    border: `1px solid ${gem ? gemType?.color ?? '#555' : '#333'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, cursor: gem ? 'pointer' : 'default',
                  }} onClick={(e) => {
                    e.stopPropagation();
                    if (gem) unsocketGem(item.uid, i);
                  }} title={gem ? `${gemType?.name} Lv.${gem.level} (点击拆卸)` : '空插槽'}>
                    {gem ? gemType?.emoji : '◇'}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Gem inventory */}
      <h4 style={{ margin: '12px 0 6px', color: '#c4b5fd', fontSize: 13 }}>
        背包宝石 ({gemInv.length})
      </h4>
      {Object.values(gemGroups).length === 0 && (
        <div style={{ color: '#666', fontSize: 12 }}>暂无宝石（击杀Boss有几率掉落）</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Object.entries(gemGroups).map(([key, g]) => {
          const gemType = GEM_TYPES.find(t => t.id === g.typeId)!;
          const canMerge = g.count >= GEM_MERGE_COUNT && g.level < GEM_MAX_LEVEL;
          return (
            <div key={key} style={{
              background: `${gemType.color}22`, border: `1px solid ${gemType.color}55`,
              borderRadius: 6, padding: '4px 8px', fontSize: 12, minWidth: 80,
            }}>
              <div>{gemType.emoji} {gemType.name} Lv.{g.level} ×{g.count}</div>
              <div style={{ color: '#aaa', fontSize: 11 }}>{gemType.desc(g.level)}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {selectedEquip && (
                  <button onClick={() => {
                    const idx = gemInv.findIndex(gi => gi.typeId === g.typeId && gi.level === g.level);
                    if (idx >= 0) socketGem(selectedEquip, idx);
                  }} style={{
                    background: '#7c3aed', color: '#fff', border: 'none',
                    borderRadius: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer',
                  }}>镶嵌</button>
                )}
                {canMerge && (
                  <button onClick={() => mergeGems(g.typeId, g.level)} style={{
                    background: '#d97706', color: '#fff', border: 'none',
                    borderRadius: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer',
                  }}>合成3→1</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
