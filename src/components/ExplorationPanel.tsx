import { useExplorationStore } from '../store/explorationStore';
import { useGameStore } from '../store/gameStore';
import { getPowerThreshold, DAILY_FREE, EXTRA_COST } from '../engine/exploration';
import { formatNumber } from '../utils/format';

const DIFFICULTIES = [
  { level: 1, name: '凡境', color: '#aaa' },
  { level: 2, name: '灵境', color: '#4caf50' },
  { level: 3, name: '仙境', color: '#2196f3' },
  { level: 4, name: '圣境', color: '#e040fb' },
];

export function ExplorationPanel() {
  const exploration = useExplorationStore(s => s.exploration);
  const startRun = useExplorationStore(s => s.startRun);
  const resolveNode = useExplorationStore(s => s.resolveNode);
  const lingshi = useGameStore(s => s.player.lingshi);
  const attack = useGameStore(s => s.player.stats.attack);

  const run = exploration.currentRun;
  const hasFree = exploration.dailyFree > 0;

  const handleStart = (difficulty: number) => {
    const result = startRun(difficulty, lingshi);
    if (result && result.cost > 0) {
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi - result.cost } }));
    }
  };

  const handleResolve = () => {
    const result = resolveNode();
    if (!result) return;
    if (result.reward) {
      useGameStore.setState(s => ({
        player: {
          ...s.player,
          lingshi: s.player.lingshi + (result.reward?.lingshi ?? 0),
          exp: s.player.exp + (result.reward?.exp ?? 0),
          pantao: s.player.pantao + (result.reward?.pantao ?? 0),
        },
      }));
    }
  };

  if (run && !run.completed) {
    const node = run.nodes[run.currentIndex];
    return (
      <div className="main-content fade-in">
        <h3 className="section-title">🗺️ 秘境探索</h3>
        <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 8 }}>
          进度: {run.currentIndex + 1}/{run.nodes.length} · 难度 {run.difficulty}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {run.nodes.map((n, i) => (
            <div key={n.id} style={{
              width: 28, height: 28, borderRadius: 6,
              background: n.resolved ? 'var(--accent)' : i === run.currentIndex ? '#fff' : 'var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              border: i === run.currentIndex ? '2px solid var(--accent)' : '1px solid var(--border)',
            }}>{n.resolved ? '✅' : n.icon}</div>
          ))}
        </div>
        {node && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 16, textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 36 }}>{node.icon}</div>
            <div style={{ fontWeight: 'bold', fontSize: 16, margin: '8px 0' }}>{node.name}</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12 }}>{node.desc}</div>
            {node.reward && <div style={{ fontSize: 11, color: 'var(--accent)' }}>
              奖励: {node.reward.lingshi ? `${node.reward.lingshi}💰 ` : ''}{node.reward.exp ? `${node.reward.exp}✨ ` : ''}{node.reward.pantao ? `${node.reward.pantao}🍑` : ''}
            </div>}
            {node.damage && <div style={{ fontSize: 11, color: '#e74c3c' }}>⚠️ 受到 {node.damage} 伤害</div>}
            <button className="action-btn accent" onClick={handleResolve} style={{ marginTop: 12, padding: '8px 24px' }}>
              {node.type === 'battle' ? '⚔️ 战斗' : node.type === 'trap' ? '🛡️ 闯过' : '✨ 探索'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">🗺️ 秘境探索</h3>
      <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12 }}>
        免费次数: {exploration.dailyFree}/{DAILY_FREE} · 总探索: {exploration.totalRuns}
        {!hasFree && <span> · 额外消耗 {EXTRA_COST}💰</span>}
      </div>
      {DIFFICULTIES.map(d => {
        const threshold = getPowerThreshold(d.level);
        const canEnter = attack >= threshold;
        return (
          <div key={d.level} style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 12, marginBottom: 8,
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10,
            opacity: canEnter ? 1 : 0.4,
          }}>
            <div style={{ fontSize: 24, color: d.color }}>🌀</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: d.color }}>{d.name} (难度{d.level})</div>
              <div style={{ fontSize: 11, color: 'var(--dim)' }}>战力要求: {formatNumber(threshold)}</div>
            </div>
            <button className={`action-btn ${canEnter ? 'accent' : ''}`} disabled={!canEnter}
              onClick={() => handleStart(d.level)} style={{ fontSize: 11, padding: '4px 12px' }}>
              探索
            </button>
          </div>
        );
      })}
    </div>
  );
}
