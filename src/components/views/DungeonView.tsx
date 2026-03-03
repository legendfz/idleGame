/**
 * DungeonView — 秘境/副本面板
 */
import { useState, useEffect, useRef } from 'react';
import { useMaterialStore } from '../../store/material';
import { usePlayerStore } from '../../store/player';
import { useJourneyStore } from '../../store/journey';
import { useUIStore } from '../../store/ui';
import { useDungeonStore } from '../../store/dungeon';
import { useAchievementStore } from '../../store/achievement';
import { useDailyQuestStore } from '../../store/dailyQuest';
import { bn, formatBigNum } from '../../engine/bignum';
import { DungeonConfig, canEnterDungeon, simulateDungeon, dungeonBossHp } from '../../engine/dungeon';
import dungeonsData from '../../data/configs/dungeons.json';
import materialsData from '../../data/configs/materials.json';

const dungeons = dungeonsData as DungeonConfig[];
const materialMap = Object.fromEntries(materialsData.map(m => [m.id, m]));

interface BattleAnim {
  dungeonName: string;
  progress: number; // 0-1
  phase: 'fighting' | 'result';
  success: boolean;
  rewards: { materialId: string; count: number }[];
  message: string;
  dmgTexts: string[];
}

export function DungeonView() {
  const [resultModal, setResultModal] = useState<{ dungeon: string; success: boolean; rewards: { materialId: string; count: number }[]; message: string } | null>(null);
  const [battleAnim, setBattleAnim] = useState<BattleAnim | null>(null);
  const animRef = useRef<number>(0);

  const player = usePlayerStore(s => s.player);
  const journey = useJourneyStore(s => s.journey);
  const addToast = useUIStore(s => s.addToast);
  const addMaterials = useMaterialStore(s => s.addMaterials);
  const dungeonState = useDungeonStore(s => s.state);
  const getAttempts = useDungeonStore(s => s.getAttempts);
  const addAttempt = useDungeonStore(s => s.addAttempt);
  const checkReset = useDungeonStore(s => s.checkReset);

  // 每次进入检查每日重置
  useEffect(() => { checkReset(); }, [checkReset]);

  // 简化体力：用金币*0.01近似战力
  const playerPower = bn(player.xiuwei).add(bn(player.coins).mul(0.01));

  return (
    <div className="view-dungeon">
      <h2>🐉 秘境</h2>

      <div className="dungeon-grid">
        {dungeons.map(dungeon => {
          const attempts = getAttempts(dungeon.id);
          const currentStage = journey.currentStage;
          const check = canEnterDungeon(dungeon, currentStage, attempts, 100);
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
                disabled={!check.ok || !!battleAnim}
                onClick={() => {
                  addAttempt(dungeon.id);
                  const result = simulateDungeon(dungeon, playerPower);
                  if (result.success) {
                    useAchievementStore.getState().addStat('dungeonClears');
                    useDailyQuestStore.getState().addProgress('dungeons', 1);
                  }
                  // Animate 5-8s battle
                  const duration = 5000 + Math.random() * 3000;
                  const dmgLabels = ['💥', '⚔️', '🔥', '✨', '💫'];
                  setBattleAnim({ dungeonName: dungeon.name, progress: 0, phase: 'fighting', success: result.success, rewards: result.rewards, message: result.message, dmgTexts: [] });
                  const start = Date.now();
                  const tick = () => {
                    const elapsed = Date.now() - start;
                    const p = Math.min(1, elapsed / duration);
                    const dmg = p > 0.1 && Math.random() < 0.15 ? [dmgLabels[Math.floor(Math.random() * dmgLabels.length)]] : [];
                    if (p < 1) {
                      setBattleAnim(prev => prev ? { ...prev, progress: p, dmgTexts: dmg.length ? dmg : prev.dmgTexts } : null);
                      animRef.current = requestAnimationFrame(tick);
                    } else {
                      if (result.success && result.rewards.length > 0) addMaterials(result.rewards);
                      setBattleAnim(prev => prev ? { ...prev, progress: 1, phase: 'result' } : null);
                    }
                  };
                  animRef.current = requestAnimationFrame(tick);
                }}
              >
                {check.ok ? '⚔️ 挑战' : check.reason}
              </button>
            </div>
          );
        })}
      </div>

      {/* 战斗动画 */}
      {battleAnim && battleAnim.phase === 'fighting' && (
        <div className="dungeon-modal-overlay">
          <div className="dungeon-modal" style={{ minWidth: 260 }}>
            <h3>⚔️ {battleAnim.dungeonName}</h3>
            <div className="hp-bar" style={{ height: 20, background: 'var(--color-bg-muted, #2a2a3a)', borderRadius: 10, overflow: 'hidden', margin: '12px 0' }}>
              <div style={{ height: '100%', width: `${battleAnim.progress * 100}%`, background: 'linear-gradient(90deg, #6c5ce7, #e74c3c)', borderRadius: 10, transition: 'width 0.1s' }} />
            </div>
            <div style={{ fontSize: 24, minHeight: 36 }}>{battleAnim.dmgTexts.join(' ')}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>战斗中... {Math.floor(battleAnim.progress * 100)}%</div>
          </div>
        </div>
      )}

      {/* 战斗结果 */}
      {battleAnim && battleAnim.phase === 'result' && (
        <div className="dungeon-modal-overlay" onClick={() => setBattleAnim(null)}>
          <div className="dungeon-modal" onClick={e => e.stopPropagation()}>
            <h3>{battleAnim.success ? '✅ 通关！' : '❌ 失败'}</h3>
            <p>{battleAnim.message}</p>
            {battleAnim.rewards.length > 0 && (
              <div className="reward-list">
                <h4>获得材料:</h4>
                {battleAnim.rewards.map((r, i) => (
                  <div key={i} className="reward-row">
                    {materialMap[r.materialId]?.icon ?? '?'} {materialMap[r.materialId]?.name ?? r.materialId} ×{r.count}
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary" onClick={() => setBattleAnim(null)}>确定</button>
          </div>
        </div>
      )}

      {/* 旧结果弹窗(备用) */}
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
