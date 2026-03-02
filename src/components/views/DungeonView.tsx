/**
 * DungeonView — 秘境/副本面板
 */
import { useState } from 'react';
import { useMaterialStore } from '../../store/material';
import { usePlayerStore } from '../../store/player';
import { useJourneyStore } from '../../store/journey';
import { useUIStore } from '../../store/ui';
import { bn, formatBigNum } from '../../engine/bignum';
import { DungeonConfig, canEnterDungeon, simulateDungeon, dungeonBossHp } from '../../engine/dungeon';
import dungeonsData from '../../data/configs/dungeons.json';
import materialsData from '../../data/configs/materials.json';

const dungeons = dungeonsData as DungeonConfig[];
const materialMap = Object.fromEntries(materialsData.map(m => [m.id, m]));

export function DungeonView() {
  const [dailyAttempts, setDailyAttempts] = useState<Record<string, number>>({});
  const [resultModal, setResultModal] = useState<{ dungeon: string; success: boolean; rewards: { materialId: string; count: number }[]; message: string } | null>(null);

  const player = usePlayerStore(s => s.player);
  const journey = useJourneyStore(s => s.journey);
  const addToast = useUIStore(s => s.addToast);
  const addMaterials = useMaterialStore(s => s.addMaterials);

  // 简化体力：用金币*0.01近似战力
  const playerPower = bn(player.xiuwei).add(bn(player.coins).mul(0.01));

  return (
    <div className="view-dungeon">
      <h2>🐉 秘境</h2>

      <div className="dungeon-grid">
        {dungeons.map(dungeon => {
          const attempts = dailyAttempts[dungeon.id] ?? 0;
          const currentStage = journey.currentStage;
          const check = canEnterDungeon(dungeon, currentStage, attempts, 100); // 简化体力
          const bHp = dungeonBossHp(dungeon);

          return (
            <div key={dungeon.id} className={`dungeon-card ${!check.ok ? 'locked' : ''}`}>
              <div className="dungeon-header">
                <span className="dungeon-icon">{dungeon.icon}</span>
                <div>
                  <div className="dungeon-name">{dungeon.name}</div>
                  <div className="dungeon-tier">T{dungeon.tier} · {dungeon.waves}波</div>
                </div>
              </div>

              <div className="dungeon-info">
                <div>Boss HP: {formatBigNum(bHp)}</div>
                <div>体力: {dungeon.staminaCost}</div>
                <div>次数: {attempts}/{dungeon.dailyLimit}</div>
                <div>解锁: 通关第{dungeon.unlockStage}难</div>
              </div>

              <div className="dungeon-rewards">
                <span className="reward-label">奖励:</span>
                {dungeon.rewards.map(r => (
                  <span key={r.materialId} className="reward-item">
                    {materialMap[r.materialId]?.icon ?? '?'} {materialMap[r.materialId]?.name ?? r.materialId}
                    ×{r.count} ({Math.round(r.chance * 100)}%)
                  </span>
                ))}
              </div>

              <button
                className="btn-dungeon"
                disabled={!check.ok}
                onClick={() => {
                  const result = simulateDungeon(dungeon, playerPower);
                  setDailyAttempts(prev => ({ ...prev, [dungeon.id]: (prev[dungeon.id] ?? 0) + 1 }));
                  if (result.success && result.rewards.length > 0) {
                    addMaterials(result.rewards);
                  }
                  setResultModal({
                    dungeon: dungeon.name,
                    success: result.success,
                    rewards: result.rewards,
                    message: result.message,
                  });
                }}
              >
                {check.ok ? '⚔️ 挑战' : check.reason}
              </button>
            </div>
          );
        })}
      </div>

      {/* 结果弹窗 */}
      {resultModal && (
        <div className="dungeon-modal-overlay" onClick={() => setResultModal(null)}>
          <div className="dungeon-modal" onClick={e => e.stopPropagation()}>
            <h3>{resultModal.success ? '✅ 通关！' : '❌ 失败'}</h3>
            <p>{resultModal.message}</p>
            {resultModal.rewards.length > 0 && (
              <div className="reward-list">
                <h4>获得材料:</h4>
                {resultModal.rewards.map((r, i) => (
                  <div key={i} className="reward-row">
                    {materialMap[r.materialId]?.icon ?? '?'} {materialMap[r.materialId]?.name ?? r.materialId} ×{r.count}
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary" onClick={() => setResultModal(null)}>确定</button>
          </div>
        </div>
      )}
    </div>
  );
}
