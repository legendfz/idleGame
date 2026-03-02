/**
 * GatherView — 采集面板
 */
import { useState, useEffect } from 'react';
import { useGatherStore } from '../../store/gather';
import { useMaterialStore } from '../../store/material';
import { usePlayerStore } from '../../store/player';
import { useUIStore } from '../../store/ui';
import { GatherNode, isNodeUnlocked } from '../../engine/gather';
import { getRealmConfig } from '../../data/config';
import gatherNodesData from '../../data/configs/gather-nodes.json';
import materialsData from '../../data/configs/materials.json';

const gatherNodes = gatherNodesData as GatherNode[];
const materialMap = Object.fromEntries(materialsData.map(m => [m.id, m]));

function formatSeconds(s: number): string {
  if (s <= 0) return '就绪';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`;
}

export function GatherView() {
  const [now, setNow] = useState(Date.now());
  const activeGather = useGatherStore(s => s.activeGather);
  const cooldowns = useGatherStore(s => s.cooldowns);
  const startGather = useGatherStore(s => s.start);
  const collectGather = useGatherStore(s => s.collect);
  const player = usePlayerStore(s => s.player);
  const addToast = useUIStore(s => s.addToast);

  const realm = getRealmConfig(player.realmId);
  const realmOrder = realm?.order ?? 1;

  // 每秒刷新定时器
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="view-gather">
      <h2>⛏️ 采集</h2>

      {activeGather && (
        <div className="active-gather-banner">
          <span>🔄 正在采集：{gatherNodes.find(n => n.id === activeGather.nodeId)?.name ?? activeGather.nodeId}</span>
          <span>
            {now >= activeGather.completesAt
              ? '✅ 可收取'
              : `⏳ ${formatSeconds((activeGather.completesAt - now) / 1000)}`
            }
          </span>
        </div>
      )}

      <div className="gather-grid">
        {gatherNodes.map(node => {
          const unlocked = isNodeUnlocked(node, player.realmId, realmOrder);
          const isActive = activeGather?.nodeId === node.id;
          const canCollect = isActive && now >= (activeGather?.completesAt ?? Infinity);
          const cooling = (cooldowns[node.id] ?? 0) > now;
          const coolRemain = cooling ? (cooldowns[node.id] - now) / 1000 : 0;
          const busy = !!activeGather && !isActive;

          return (
            <div key={node.id} className={`gather-card ${!unlocked ? 'locked' : ''} ${isActive ? 'active' : ''}`}>
              <div className="gather-icon">{node.icon}</div>
              <div className="gather-name">{node.name}</div>
              <div className="gather-location">📍 {node.location}</div>

              <div className="gather-materials">
                {node.materials.map(m => (
                  <span key={m.materialId} className="gather-mat">
                    {materialMap[m.materialId]?.icon ?? '?'} {materialMap[m.materialId]?.name ?? m.materialId}
                    <span className="mat-chance">({Math.round(m.chance * 100)}%)</span>
                    <span className="mat-range">{m.countRange[0]}-{m.countRange[1]}</span>
                  </span>
                ))}
              </div>

              <div className="gather-meta">
                <span>⏱️ {formatSeconds(node.gatherTime)}</span>
                <span>冷却 {formatSeconds(node.cooldown)}</span>
              </div>

              {!unlocked ? (
                <button className="btn-gather" disabled>
                  🔒 需达到{node.unlockRealm}境界
                </button>
              ) : canCollect ? (
                <button className="btn-gather btn-collect" onClick={() => collectGather(node)}>
                  ✅ 收取
                </button>
              ) : isActive ? (
                <button className="btn-gather" disabled>
                  ⏳ 采集中 {formatSeconds((activeGather!.completesAt - now) / 1000)}
                </button>
              ) : cooling ? (
                <button className="btn-gather" disabled>
                  ❄️ 冷却 {formatSeconds(coolRemain)}
                </button>
              ) : (
                <button className="btn-gather" disabled={busy} onClick={() => {
                  const ok = startGather(node);
                  if (ok) addToast(`开始采集 ${node.name}`, 'info');
                }}>
                  {busy ? '⏳ 正在采集其他' : `⛏️ 开始采集`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
