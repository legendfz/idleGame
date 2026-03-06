import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AWAKENING_PATHS, AwakeningPath, AwakeningNode, totalAwakeningPoints, AWAKENING_UNLOCK_REINC } from '../data/awakening';

export function AwakeningPanel() {
  const player = useGameStore(s => s.player);
  const reincCount = player.reincarnations ?? 0;
  const unlocked = reincCount >= AWAKENING_UNLOCK_REINC;

  // Awakening state stored in player
  const awakeningState = player.awakening ?? { unlockedNodes: [] as string[], selectedPath: null as string | null };
  const unlockedNodes: string[] = awakeningState.unlockedNodes ?? [];
  const totalPts = totalAwakeningPoints(reincCount);
  const spentPts = unlockedNodes.reduce((sum, nid) => {
    for (const p of AWAKENING_PATHS) {
      const node = p.nodes.find(n => n.id === nid);
      if (node) return sum + node.cost;
    }
    return sum;
  }, 0);
  const availablePts = totalPts - spentPts;

  const [selectedPath, setSelectedPath] = useState<string>(awakeningState.selectedPath ?? AWAKENING_PATHS[0].id);

  if (!unlocked) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#ccc' }}>觉醒系统</div>
        <div style={{ marginTop: 8 }}>需要 {AWAKENING_UNLOCK_REINC} 次转世后解锁</div>
        <div style={{ marginTop: 4 }}>当前转世次数：{reincCount}</div>
      </div>
    );
  }

  const activePath = AWAKENING_PATHS.find(p => p.id === selectedPath) ?? AWAKENING_PATHS[0];

  const unlockNode = (node: AwakeningNode) => {
    if (unlockedNodes.includes(node.id)) return;
    if (node.requires && !unlockedNodes.includes(node.requires)) return;
    if (availablePts < node.cost) return;

    const newNodes = [...unlockedNodes, node.id];
    useGameStore.setState((s: any) => ({
      player: {
        ...s.player,
        awakening: { unlockedNodes: newNodes, selectedPath: selectedPath },
      },
    }));
  };

  return (
    <div style={{ padding: '12px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#ffd700' }}>✨ 觉醒系统</div>
        <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
          觉醒点：<span style={{ color: '#ffd700', fontWeight: 700 }}>{availablePts}</span> / {totalPts}
          <span style={{ marginLeft: 12, color: '#888' }}>转世 {reincCount} 次</span>
        </div>
      </div>

      {/* Path tabs */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
        {AWAKENING_PATHS.map(p => (
          <button key={p.id} onClick={() => setSelectedPath(p.id)}
            style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: selectedPath === p.id ? p.color + '33' : 'rgba(100,100,100,0.15)',
              border: `1px solid ${selectedPath === p.id ? p.color : 'rgba(100,100,100,0.3)'}`,
              color: selectedPath === p.id ? p.color : '#888',
              cursor: 'pointer',
            }}>
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* Path description */}
      <div style={{ textAlign: 'center', fontSize: 12, color: activePath.color, marginBottom: 12, opacity: 0.8 }}>
        {activePath.desc}
      </div>

      {/* Skill tree nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activePath.nodes.map((node, i) => {
          const isUnlocked = unlockedNodes.includes(node.id);
          const canUnlock = !isUnlocked && availablePts >= node.cost && (!node.requires || unlockedNodes.includes(node.requires));
          const isLocked = !isUnlocked && !canUnlock;

          return (
            <div key={node.id} onClick={() => canUnlock && unlockNode(node)}
              style={{
                padding: '10px 14px', borderRadius: 10, cursor: canUnlock ? 'pointer' : 'default',
                background: isUnlocked ? activePath.color + '22' : canUnlock ? 'rgba(255,215,0,0.08)' : 'rgba(50,50,50,0.3)',
                border: `1px solid ${isUnlocked ? activePath.color : canUnlock ? '#ffd700' : 'rgba(100,100,100,0.2)'}`,
                opacity: isLocked ? 0.5 : 1,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animation: canUnlock ? 'levelUpGlow 2s ease-in-out infinite' : 'none',
              }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: isUnlocked ? activePath.color : '#ccc' }}>
                  {isUnlocked ? '✅' : canUnlock ? '⭐' : '🔒'} {node.name}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{node.desc}</div>
              </div>
              <div style={{ fontSize: 12, color: isUnlocked ? '#4ade80' : '#ffd700', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {isUnlocked ? '已觉醒' : `${node.cost}点`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active bonuses summary */}
      {unlockedNodes.length > 0 && (
        <div style={{ marginTop: 16, padding: 10, borderRadius: 10, background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#ffd700', marginBottom: 6 }}>觉醒加成总览</div>
          <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6 }}>
            {getAwakeningBonusSummary(unlockedNodes)}
          </div>
        </div>
      )}
    </div>
  );
}

function getAwakeningBonusSummary(unlockedNodes: string[]): string {
  const bonuses: Record<string, number> = {};
  for (const nid of unlockedNodes) {
    for (const p of AWAKENING_PATHS) {
      const node = p.nodes.find(n => n.id === nid);
      if (node) {
        const key = node.effect.type;
        bonuses[key] = (bonuses[key] ?? 0) + node.effect.value;
      }
    }
  }
  const labels: Record<string, string> = {
    atk_pct: '攻击力', hp_pct: '生命值', crit_rate: '暴击率', crit_dmg: '暴击伤害',
    gold_pct: '灵石获取', exp_pct: '经验获取', drop_pct: '装备掉率', auto_heal: '自动回血',
    boss_dmg: 'Boss伤害', abyss_dmg: '深渊伤害', skill_cd: '技能冷却减少', pantao_pct: '蟠桃获取',
  };
  return Object.entries(bonuses).map(([k, v]) => `${labels[k] ?? k} +${v}%`).join(' · ');
}

/** Helper: get awakening bonuses for combat integration */
export function getAwakeningBonuses(player: any): Record<string, number> {
  const awakeningState = player?.awakening ?? { unlockedNodes: [] };
  const unlockedNodes: string[] = awakeningState.unlockedNodes ?? [];
  const bonuses: Record<string, number> = {};
  for (const nid of unlockedNodes) {
    for (const p of AWAKENING_PATHS) {
      const node = p.nodes.find(n => n.id === nid);
      if (node) {
        bonuses[node.effect.type] = (bonuses[node.effect.type] ?? 0) + node.effect.value;
      }
    }
  }
  return bonuses;
}
