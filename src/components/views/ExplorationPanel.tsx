/**
 * ExplorationPanel — 秘境探索面板
 */
import { useExplorationStore } from '../../store/exploration';
import { getAllDifficulties, getDifficultyConfig, Difficulty } from '../../engine/exploration';
import '../../styles/exploration.css';

export function ExplorationPanel() {
  const state = useExplorationStore(s => s.state);
  const startRun = useExplorationStore(s => s.startRun);
  const stepForward = useExplorationStore(s => s.stepForward);
  const abandonRun = useExplorationStore(s => s.abandonRun);
  const run = state.currentRun;

  if (run && !run.completed) {
    const node = run.nodes[run.currentNode];
    return (
      <div className="exploration-panel">
        <h2>🗺️ 秘境探索</h2>
        <div className="exploration-progress">
          节点 {run.currentNode + 1} / {run.nodes.length}
        </div>
        <div className="exploration-nodes">
          {run.nodes.map((n, i) => (
            <div key={n.id} className={`exploration-node ${n.resolved ? 'resolved' : ''} ${i === run.currentNode ? 'current' : ''}`}>
              <span>{n.resolved ? '✅' : i === run.currentNode ? '👉' : '❓'}</span>
            </div>
          ))}
        </div>
        {node && (
          <div className="exploration-event">
            <h3>{node.name}</h3>
            <p>{node.desc}</p>
            <div className="event-type-badge">{node.type}</div>
          </div>
        )}
        <div className="exploration-actions">
          <button className="explore-btn" onClick={stepForward}>继续探索</button>
          <button className="abandon-btn" onClick={abandonRun}>放弃</button>
        </div>
      </div>
    );
  }

  return (
    <div className="exploration-panel">
      <h2>🗺️ 秘境探索</h2>
      <p>每日免费次数: {state.dailyFreeRuns}/3 | 累计探索: {state.totalRuns}次</p>
      {run?.completed && <p className="exploration-complete">✅ 上次探索已完成！</p>}
      <div className="difficulty-grid">
        {getAllDifficulties().map((d: Difficulty) => {
          const cfg = getDifficultyConfig(d);
          return (
            <button key={d} className="difficulty-btn" onClick={() => startRun(d)}>
              <div className="diff-name">{cfg.name}</div>
              <div className="diff-info">节点: {cfg.nodeCount[0]}-{cfg.nodeCount[1]} | 奖励: ×{cfg.rewardMult}</div>
              {cfg.powerReq > 0 && <div className="diff-req">需求战力: {cfg.powerReq}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
