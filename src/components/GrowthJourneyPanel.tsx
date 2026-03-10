/**
 * v200.0「万道归一」— 成长回顾面板
 */
import { useGameStore } from '../store/gameStore';
import { JOURNEY_MILESTONES, CATEGORY_NAMES, JourneyMilestone } from '../data/growthJourney';
import { useState } from 'react';

const catColors: Record<string, string> = {
  combat: '#e74c3c',
  growth: '#2ecc71',
  collection: '#3498db',
  mastery: '#f39c12',
};

function MilestoneCard({ m, unlocked, value }: { m: JourneyMilestone; unlocked: boolean; value?: string }) {
  const color = catColors[m.category] ?? '#888';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: unlocked ? `${color}18` : '#1a1a2e',
      border: `1px solid ${unlocked ? color : '#333'}`,
      borderRadius: 8, opacity: unlocked ? 1 : 0.5,
      transition: 'all 0.3s',
    }}>
      <span style={{ fontSize: 24, filter: unlocked ? 'none' : 'grayscale(1)' }}>{m.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: unlocked ? color : '#666', fontSize: 13 }}>{m.title}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{m.desc}</div>
      </div>
      {unlocked && value && (
        <span style={{ fontSize: 11, color, fontWeight: 600, whiteSpace: 'nowrap' }}>{value}</span>
      )}
      {unlocked && <span style={{ fontSize: 14 }}>✅</span>}
      {!unlocked && <span style={{ fontSize: 14 }}>🔒</span>}
    </div>
  );
}

export function GrowthJourneyPanel() {
  const state = useGameStore();
  const [filterCat, setFilterCat] = useState<string>('all');
  
  const milestones = JOURNEY_MILESTONES.map(m => ({
    ...m,
    unlocked: m.check(state),
    value: m.getValue?.(state),
  }));
  
  const unlocked = milestones.filter(m => m.unlocked).length;
  const total = milestones.length;
  const pct = Math.round((unlocked / total) * 100);
  
  const filtered = filterCat === 'all' ? milestones : milestones.filter(m => m.category === filterCat);
  
  // Category stats
  const catStats = Object.keys(CATEGORY_NAMES).map(cat => {
    const ms = milestones.filter(m => m.category === cat);
    return { cat, ...CATEGORY_NAMES[cat], unlocked: ms.filter(m => m.unlocked).length, total: ms.length };
  });

  return (
    <div style={{ padding: '12px 8px' }}>
      {/* Overall progress */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#f1c40f' }}>🏆 {unlocked}/{total}</div>
        <div style={{ width: '80%', height: 8, background: '#333', borderRadius: 4, margin: '8px auto', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #f39c12, #e74c3c)', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 12, color: '#888' }}>仙途完成度 {pct}%</div>
      </div>

      {/* Category summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
        {catStats.map(c => (
          <div key={c.cat} onClick={() => setFilterCat(filterCat === c.cat ? 'all' : c.cat)}
            style={{
              padding: '6px 4px', borderRadius: 6, textAlign: 'center', cursor: 'pointer',
              background: filterCat === c.cat ? `${catColors[c.cat]}30` : '#1a1a2e',
              border: `1px solid ${filterCat === c.cat ? catColors[c.cat] : '#333'}`,
            }}>
            <div style={{ fontSize: 16 }}>{c.icon}</div>
            <div style={{ fontSize: 10, color: catColors[c.cat] }}>{c.name}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#ccc' }}>{c.unlocked}/{c.total}</div>
          </div>
        ))}
      </div>

      {/* Milestone list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.sort((a, b) => {
          // Unlocked first, then by order
          if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
          return a.order - b.order;
        }).map(m => (
          <MilestoneCard key={m.id} m={m} unlocked={m.unlocked} value={m.value} />
        ))}
      </div>
    </div>
  );
}
