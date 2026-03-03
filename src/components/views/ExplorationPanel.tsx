/**
 * ExplorationPanel — 秘境探索
 */
import { useExplorationStore } from '../../store/exploration';
import { getAllDifficulties, getDifficultyConfig, Difficulty } from '../../engine/exploration';
import '../../styles/exploration.css';

const DIFF_COLORS: Record<Difficulty, string> = {
  fan: '#aaa', ling: '#4caf50', xian: '#2196f3', sheng: '#e040fb',
};

export function ExplorationPanel() {
  const state = useExplorationStore(s => s.state);
  const startRun = useExplorationStore(s => s.startRun);
  const resolve = useExplorationStore(s => s.resolve);
  const run = state.currentRun;

  if (run && !run.completed) {
    const node = run.nodes[run.currentNode];
    const cfg = getDifficultyConfig(run.difficulty);
    return (
      <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
        <h2>🗺️ {cfg.name}</h2>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
          进度 {run.currentNode + 1}/{run.nodes.length}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
          {run.nodes.map((n, i) => (
            <div key={n.id} style={{
              width: 28, height: 28, borderRadius: 6, fontSize: 12,
              background: n.resolved ? 'var(--color-accent)' : i === run.currentNode ? '#fff' : 'var(--color-bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: i === run.currentNode ? '2px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
              color: n.resolved ? '#000' : 'var(--color-text-muted)',
            }}>{n.resolved ? '✅' : i + 1}</div>
          ))}
        </div>
        {node && (
          <div style={{
            background: 'var(--color-bg-elevated)', borderRadius: 12, padding: 16, textAlign: 'center',
            border: '1px solid var(--color-border, #333)',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 16, margin: '8px 0' }}>{node.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>{node.desc}</div>
            <div style={{ fontSize: 10, padding: '2px 8px', background: 'var(--color-bg-muted, #333)', borderRadius: 4, display: 'inline-block', marginBottom: 8 }}>
              {node.type}
            </div>
            {node.reward && <div style={{ fontSize: 11, color: 'var(--color-accent)' }}>
              {node.reward.coins ? `${node.reward.coins}💰 ` : ''}{node.reward.xiuwei ? `${node.reward.xiuwei}✨` : ''}
            </div>}
            <button onClick={resolve} style={{
              marginTop: 12, padding: '8px 24px', border: 'none', borderRadius: 8,
              background: 'var(--color-primary)', color: '#fff', fontSize: 13, cursor: 'pointer',
            }}>{node.type === 'battle' ? '⚔️ 战斗' : node.type === 'trap' ? '🛡️ 闯过' : '✨ 探索'}</button>
          </div>
        )}
      </div>
    );
  }

  const diffs = getAllDifficulties();
  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🗺️ 秘境探索</h2>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        免费 {state.dailyFreeRuns}/3 · 总探索 {state.totalRuns}
        {state.dailyFreeRuns <= 0 && <span> · 额外 500💰</span>}
      </div>
      {run?.completed && (
        <div style={{ background: 'rgba(76,175,80,0.1)', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: '#4caf50' }}>
          ✅ 上次探索已完成！
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {diffs.map(d => {
          const cfg = getDifficultyConfig(d);
          return (
            <div key={d} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px 12px',
              border: '1px solid var(--color-border, #333)', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontSize: 24, color: DIFF_COLORS[d] }}>🌀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: DIFF_COLORS[d] }}>{cfg.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>战力要求: {cfg.powerReq} · 奖励×{cfg.rewardMult}</div>
              </div>
              <button onClick={() => startRun(d)} style={{
                padding: '5px 12px', background: 'var(--color-primary)', border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 11, cursor: 'pointer',
              }}>探索</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
