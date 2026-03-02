/**
 * v1.3 副本战斗界面
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDungeonStore } from '../store/dungeonStore';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/format';

interface Props {
  onEnd: () => void;
}

export default function DungeonBattle({ onEnd }: Props) {
  const battle = useDungeonStore(s => s.activeBattle);
  const dungeon = useDungeonStore(s => s.activeDungeon);
  const tickBattle = useDungeonStore(s => s.tickBattle);
  const dodge = useDungeonStore(s => s.dodge);
  const endBattle = useDungeonStore(s => s.endBattle);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const lastTickRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  const loop = useCallback((now: number) => {
    const dt = Math.min((now - lastTickRef.current) / 1000, 0.1); // cap dt
    lastTickRef.current = now;
    const stats = getEffectiveStats();
    tickBattle(dt, stats);
    rafRef.current = requestAnimationFrame(loop);
  }, [tickBattle, getEffectiveStats]);

  useEffect(() => {
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  if (!battle || !dungeon) return null;

  const handleEnd = () => {
    const rewards = endBattle();
    if (rewards) {
      // Apply rewards to main game store
      const state = useGameStore.getState();
      useGameStore.setState({
        player: {
          ...state.player,
          lingshi: state.player.lingshi + rewards.lingshi,
          exp: state.player.exp + rewards.exp,
          pantao: state.player.pantao + rewards.pantao,
        },
      });
    }
    onEnd();
  };

  const isOver = battle.status === 'victory' || battle.status === 'defeat';
  const timeLeft = Math.max(0, battle.timeLimit - battle.elapsed);

  return (
    <div className="dungeon-battle fade-in">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h3 style={{ color: '#f0c040', margin: 0 }}>{dungeon.icon} {dungeon.name}</h3>
        <div style={{ fontSize: 12, color: timeLeft < 30 ? '#f44336' : '#8b8b9e' }}>
          ⏱️ {Math.floor(timeLeft)}秒
        </div>
      </div>

      {/* Enemy */}
      {battle.enemy && (
        <div className="dungeon-enemy-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {battle.enemy.icon} {battle.enemy.name}
              {battle.enemy.isBoss && ' 👹'}
            </span>
            <span style={{ fontSize: 11, color: '#8b8b9e' }}>
              {formatNumber(Math.max(0, battle.enemy.hp))}/{formatNumber(battle.enemy.maxHp)}
            </span>
          </div>
          <div className="hp-bar-container" style={{ marginTop: 4 }}>
            <div
              className="hp-bar"
              style={{
                width: `${Math.max(0, (battle.enemy.hp / battle.enemy.maxHp) * 100)}%`,
                background: battle.enemy.isBoss ? '#f44336' : '#4caf50',
              }}
            />
          </div>
        </div>
      )}

      {/* Player HP */}
      <div style={{ margin: '8px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span>❤️ 你的生命</span>
          <span>{formatNumber(Math.max(0, battle.playerHp))}/{formatNumber(battle.playerMaxHp)}</span>
        </div>
        <div className="hp-bar-container">
          <div
            className="hp-bar"
            style={{
              width: `${Math.max(0, (battle.playerHp / battle.playerMaxHp) * 100)}%`,
              background: '#4caf50',
            }}
          />
        </div>
      </div>

      {/* Skill Warning */}
      {battle.activeSkillWarning && (
        <div className="skill-warning" style={{
          background: 'rgba(244,67,54,0.15)',
          border: '1px solid #f44336',
          borderRadius: 6,
          padding: 8,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          <div style={{ color: '#f44336', fontWeight: 'bold' }}>
            ⚠️ {battle.activeSkillWarning.skill.warning}
          </div>
          <div style={{ fontSize: 12, color: '#ff8a80' }}>
            {battle.activeSkillWarning.skill.name} — {Math.ceil(battle.activeSkillWarning.timeLeft)}秒后释放
          </div>
          {battle.dodgeAvailable && !battle.dodgeActive && (
            <button
              className="small-btn accent"
              onClick={dodge}
              style={{ marginTop: 4, background: '#2196f3' }}
            >
              🛡️ 闪避（伤害-50%）
            </button>
          )}
          {battle.dodgeActive && (
            <div style={{ fontSize: 11, color: '#4caf50', marginTop: 4 }}>✅ 已准备闪避</div>
          )}
        </div>
      )}

      {/* Battle Stats */}
      <div style={{ fontSize: 11, color: '#8b8b9e', textAlign: 'center', margin: '4px 0' }}>
        击杀 {battle.killCount} · 总伤害 {formatNumber(battle.totalDamageDealt)} · 闪避 {battle.dodgeCount}
      </div>

      {/* Log */}
      <div className="battle-log" style={{ maxHeight: 120, overflow: 'auto', fontSize: 11, marginTop: 8 }}>
        {battle.log.slice(-8).map(l => (
          <div key={l.id} style={{
            color: l.type === 'crit' ? '#f0c040' : l.type === 'warn' ? '#f44336' : l.type === 'kill' ? '#4caf50' : l.type === 'dodge' ? '#2196f3' : '#8b8b9e',
          }}>
            {l.text}
          </div>
        ))}
      </div>

      {/* End state */}
      {isOver && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <div style={{
            fontSize: 18, fontWeight: 'bold',
            color: battle.status === 'victory' ? '#4caf50' : '#f44336',
            marginBottom: 8,
          }}>
            {battle.status === 'victory' ? '🎉 通关成功！' : '💀 挑战失败'}
          </div>
          {battle.status === 'victory' && (
            <div style={{ fontSize: 12, color: '#8b8b9e', marginBottom: 8 }}>
              ⏱️ 用时 {Math.floor(battle.elapsed)}秒
            </div>
          )}
          <button className="small-btn accent" onClick={handleEnd}>
            {battle.status === 'victory' ? '📦 领取奖励' : '返回'}
          </button>
        </div>
      )}
    </div>
  );
}
