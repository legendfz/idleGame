/**
 * v188.0: Quick Actions bar — one-tap common operations from battle page
 */
import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatNumber } from '../../utils/format';
import { Quality } from '../../types';

const QUALITY_ORDER: Quality[] = ['common', 'spirit', 'immortal', 'divine', 'legendary', 'mythic'];

export function QuickActions() {
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const autoEquipBest = useGameStore(s => s.autoEquipBest);
  const batchEnhanceEquipped = useGameStore(s => s.batchEnhanceEquipped);
  const quickDecompose = useGameStore(s => s.quickDecompose);
  const inventory = useGameStore(s => s.inventory);
  const autoDecomposeQuality = useGameStore(s => s.autoDecomposeQuality);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleEquipBest = useCallback(() => {
    const count = autoEquipBest();
    showToast(count > 0 ? `🎯 装备${count}件最优装备` : '已是最优装备');
  }, [autoEquipBest, showToast]);

  const handleEnhanceAll = useCallback(() => {
    const r = batchEnhanceEquipped();
    showToast(r.count > 0 ? `🔨 强化${r.count}次 花费${formatNumber(r.cost)}💰` : '无可强化装备');
  }, [batchEnhanceEquipped, showToast]);

  const handleDecompose = useCallback(() => {
    // Decompose quality 2 and below (仙品以下) by default, or use autoDecomposeQuality setting
    const quality = autoDecomposeQuality || 2;
    const count = quickDecompose(quality);
    showToast(count > 0 ? `♻ 分解${count}件低品质装备` : '无可分解装备');
  }, [quickDecompose, autoDecomposeQuality, showToast]);

  // Auto-synthesize: find 3+ items of same quality and synth
  const handleAutoSynth = useCallback(() => {
    const state = useGameStore.getState();
    const inv = state.inventory;
    const qualityCounts: Map<Quality, string[]> = new Map();
    for (const item of inv) {
      if (item.locked) continue;
      if (item.quality === 'mythic') continue; // skip 鸿蒙
      if (!qualityCounts.has(item.quality)) qualityCounts.set(item.quality, []);
      qualityCounts.get(item.quality)!.push(item.uid);
    }
    let totalSynth = 0;
    // Synth from lowest quality up
    for (const q of QUALITY_ORDER.slice(0, 5)) {
      const uids = qualityCounts.get(q);
      if (!uids || uids.length < 3) continue;
      const batches = Math.floor(uids.length / 3);
      for (let b = 0; b < batches; b++) {
        const batch = uids.slice(b * 3, b * 3 + 3);
        const r = state.synthesizeEquip(batch);
        if (r.success) totalSynth++;
      }
    }
    showToast(totalSynth > 0 ? `⚗ 合成${totalSynth}件高品质装备` : '无可合成装备');
  }, [showToast]);

  const invCount = inventory.length;

  if (!expanded) {
    return (
      <div style={{ textAlign: 'center', padding: '2px 0' }}>
        <span
          onClick={() => setExpanded(true)}
          style={{ fontSize: 10, color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline dotted' }}
        >
          ⚡ 快捷操作 ({invCount}件装备)
        </span>
      </div>
    );
  }

  const btnStyle = (bg: string): React.CSSProperties => ({
    fontSize: 11, padding: '4px 8px', borderRadius: 8, cursor: 'pointer',
    background: bg, border: 'none', color: '#fff', fontWeight: 600,
    flex: 1, minWidth: 0,
  });

  return (
    <div style={{ padding: '4px 12px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>⚡ 快捷操作</span>
        <span onClick={() => setExpanded(false)} style={{ fontSize: 10, color: '#666', cursor: 'pointer' }}>✕</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={handleEquipBest} style={btnStyle('linear-gradient(135deg, #3b82f6, #2563eb)')}>🎯最优装备</button>
        <button onClick={handleEnhanceAll} style={btnStyle('linear-gradient(135deg, #8b5cf6, #7c3aed)')}>🔨全部强化</button>
        <button onClick={handleDecompose} style={btnStyle('linear-gradient(135deg, #ef4444, #dc2626)')}>♻快速分解</button>
        <button onClick={handleAutoSynth} style={btnStyle('linear-gradient(135deg, #f59e0b, #d97706)')}>⚗合成</button>
      </div>
      {toast && (
        <div style={{
          position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, color: '#fff', background: 'rgba(0,0,0,0.8)', padding: '2px 10px',
          borderRadius: 6, whiteSpace: 'nowrap', zIndex: 10,
        }}>{toast}</div>
      )}
    </div>
  );
}
