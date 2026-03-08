/**
 * v87.0 天道考验 — Ascension Challenge Panel
 */
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { getDailyChallenges, getCombinedModifiers, MODIFIERS, AscensionChallenge } from '../data/ascensionChallenge';
import { formatNumber } from '../utils/format';

export function AscensionChallengePanel() {
  const player = useGameStore(s => s.player);
  const updatePlayer = useGameStore(s => s.updatePlayer);
  const challenges = getDailyChallenges();
  const completedToday = useGameStore(s => s.completedChallenges) ?? [];
  const setCompletedChallenges = useGameStore(s => s.setCompletedChallenges);

  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number | null>(null);
  const [battleState, setBattleState] = useState<{ wave: number; enemyHp: number; enemyMaxHp: number; log: string[] } | null>(null);
  const timerRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startChallenge = (idx: number) => {
    const ch = challenges[idx];
    if (player.level < ch.levelReq) return;
    if (completedToday.includes(ch.id)) return;
    
    const mods = getCombinedModifiers(ch.modifiers);
    const stats = useGameStore.getState().getEffectiveStats();
    const baseEnemyHp = Math.floor(stats.attack * 3 * mods.enemyHpMult * (1 + idx * 0.5));
    
    setActiveChallengeIdx(idx);
    setBattleState({ wave: 1, enemyHp: baseEnemyHp, enemyMaxHp: baseEnemyHp, log: [`🔱 ${ch.name} 开始！第1波`] });
    
    // Auto-battle loop
    let wave = 1;
    let enemyHp = baseEnemyHp;
    const maxWave = ch.waves;
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const currentStats = useGameStore.getState().getEffectiveStats();
      const dmg = Math.floor(currentStats.attack * mods.playerAtkMult * (0.8 + Math.random() * 0.4));
      enemyHp -= dmg;
      
      if (enemyHp <= 0) {
        wave++;
        if (wave > maxWave) {
          // Victory!
          clearInterval(timerRef.current!);
          timerRef.current = null;
          const lv = useGameStore.getState().player.level;
          const scale = Math.max(1, lv / 10);
          const r = ch.rewards;
          const p = useGameStore.getState().player;
          updatePlayer({
            lingshi: p.lingshi + Math.floor(r.lingshi * scale),
            pantao: p.pantao + Math.floor(r.pantao * scale),
            hongmengShards: p.hongmengShards + Math.floor(r.shards * scale),
            trialTokens: p.trialTokens + Math.floor(r.trialTokens * scale),
            daoPoints: p.daoPoints + Math.floor(r.daoPoints * scale),
          });
          
          const newCompleted = [...(useGameStore.getState().completedChallenges ?? []), ch.id];
          if (setCompletedChallenges) setCompletedChallenges(newCompleted);
          
          setBattleState(prev => prev ? { ...prev, wave, enemyHp: 0, log: [...prev.log.slice(-4), `✅ 天道考验完成！获得丰厚奖励`] } : null);
          setTimeout(() => { setActiveChallengeIdx(null); setBattleState(null); }, 2000);
          return;
        }
        const newMaxHp = Math.floor(baseEnemyHp * (1 + (wave - 1) * 0.15));
        enemyHp = newMaxHp;
        setBattleState(prev => prev ? { ...prev, wave, enemyHp, enemyMaxHp: newMaxHp, log: [...prev.log.slice(-4), `⚔️ 第${wave}波 敌人出现`] } : null);
      } else {
        setBattleState(prev => prev ? { ...prev, enemyHp, log: [...prev.log.slice(-4), `💥 造成 ${formatNumber(dmg)} 伤害`] } : null);
      }
    }, 300);
  };

  const lv = player.level;

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#ffd700', marginBottom: 12, textAlign: 'center' }}>
        🔱 天道考验
      </div>
      <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginBottom: 16 }}>
        每日刷新 · 完成挑战获取丰厚奖励
      </div>

      {activeChallengeIdx !== null && battleState ? (
        <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 16, border: '1px solid #ffd700' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#ffd700', fontWeight: 700 }}>{challenges[activeChallengeIdx].name}</span>
            <span style={{ color: '#aaa' }}>波次 {battleState.wave}/{challenges[activeChallengeIdx].waves}</span>
          </div>
          {/* HP Bar */}
          <div style={{ background: '#333', borderRadius: 6, height: 16, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 6, transition: 'width 0.2s',
              width: `${Math.max(0, battleState.enemyHp / battleState.enemyMaxHp * 100)}%`,
              background: 'linear-gradient(90deg, #ff4444, #ff8800)',
            }} />
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>
            {battleState.log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      ) : (
        challenges.map((ch, i) => {
          const completed = completedToday.includes(ch.id);
          const locked = lv < ch.levelReq;
          const mods = ch.modifiers.map(id => MODIFIERS.find(m => m.id === id)!);
          const scale = Math.max(1, lv / 10);
          
          return (
            <div key={ch.id} style={{
              background: completed ? '#1a2e1a' : locked ? '#1a1a1a' : '#1a1a2e',
              borderRadius: 12, padding: 14, marginBottom: 10,
              border: `1px solid ${completed ? '#4a4' : locked ? '#333' : '#ffd70066'}`,
              opacity: locked ? 0.5 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 16 }}>{ch.icon} </span>
                  <span style={{ fontWeight: 700, color: completed ? '#4a4' : '#eee' }}>
                    {ch.name} {completed && '✓'}
                  </span>
                  {locked && <span style={{ color: '#888', fontSize: 12 }}> (Lv.{ch.levelReq})</span>}
                </div>
              </div>
              
              {/* Modifiers */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {mods.map(m => (
                  <span key={m.id} style={{
                    background: '#2a1a3e', borderRadius: 6, padding: '2px 8px',
                    fontSize: 11, color: '#e0b0ff',
                  }}>
                    {m.icon} {m.name}: {m.desc}
                  </span>
                ))}
              </div>
              
              {/* Rewards */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 11, color: '#aaa', flexWrap: 'wrap' }}>
                {ch.rewards.lingshi > 0 && <span>💰{formatNumber(Math.floor(ch.rewards.lingshi * scale))}</span>}
                {ch.rewards.pantao > 0 && <span>🍑{formatNumber(Math.floor(ch.rewards.pantao * scale))}</span>}
                {ch.rewards.shards > 0 && <span>💎{formatNumber(Math.floor(ch.rewards.shards * scale))}</span>}
                {ch.rewards.trialTokens > 0 && <span>🎫{Math.floor(ch.rewards.trialTokens * scale)}</span>}
                {ch.rewards.daoPoints > 0 && <span>☯️{Math.floor(ch.rewards.daoPoints * scale)}</span>}
              </div>
              
              {!completed && !locked && (
                <button
                  onClick={() => startChallenge(i)}
                  style={{
                    marginTop: 10, width: '100%', padding: '8px 0',
                    background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                    border: 'none', borderRadius: 8, color: '#000', fontWeight: 700,
                    fontSize: 14, cursor: 'pointer',
                  }}
                >
                  开始挑战
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
