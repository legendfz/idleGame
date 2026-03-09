/**
 * v118.0 Weekly Boss Rush Panel
 */
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { WEEKLY_FLOORS, getWeekStart, getTimeUntilReset, type WeeklyBossFloor } from '../data/weeklyBoss';
import { formatNumber } from '../utils/format';
import { Card } from '../pages/shared';

interface BossState {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
}

export function WeeklyBossPanel() {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const weeklyBoss = useGameStore(s => s.weeklyBoss);
  const setWeeklyBoss = useGameStore(s => s.setWeeklyBoss);

  const weekStart = getWeekStart();
  const currentWeek = weeklyBoss?.week === weekStart ? weeklyBoss : { week: weekStart, clearedFloors: [], claimed: [] };
  
  const [fighting, setFighting] = useState(false);
  const [currentFloor, setCurrentFloor] = useState<WeeklyBossFloor | null>(null);
  const [boss, setBoss] = useState<BossState | null>(null);
  const [playerHp, setPlayerHp] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const timerRef = useRef<any>(null);

  const stats = getEffectiveStats();
  const level = player.level;

  // Start fight
  function startFight(floor: WeeklyBossFloor) {
    if (currentWeek.clearedFloors.includes(floor.floor)) return;
    if (floor.floor > 1 && !currentWeek.clearedFloors.includes(floor.floor - 1)) return;

    const bossHp = Math.floor(floor.hpMul * level * (1 + level * 0.01));
    const bossAtk = Math.floor(floor.atkMul * level * (1 + level * 0.005));
    const bossDef = Math.floor(floor.defMul * level);

    setBoss({ hp: bossHp, maxHp: bossHp, atk: bossAtk, def: bossDef });
    setPlayerHp(stats.maxHp);
    setCurrentFloor(floor);
    setFighting(true);
    setResult(null);
    setLog([`⚔️ ${floor.emoji} ${floor.name} 现身！HP: ${formatNumber(bossHp)}`]);
  }

  // Combat loop
  useEffect(() => {
    if (!fighting || !boss || !currentFloor) return;

    timerRef.current = setInterval(() => {
      setBoss(prev => {
        if (!prev || prev.hp <= 0) return prev;

        // Player attacks boss
        const defRate = prev.def / (prev.def + 100 + level * 5);
        let dmg = Math.max(1, Math.floor(stats.attack * (1 - defRate)));
        const isCrit = Math.random() < stats.critRate;
        if (isCrit) dmg = Math.floor(dmg * stats.critDmg);

        const newBossHp = Math.max(0, prev.hp - dmg);

        setLog(l => {
          const msg = isCrit
            ? `💥 暴击！对${currentFloor.name}造成 ${formatNumber(dmg)} 伤害`
            : `⚔️ 攻击${currentFloor.name} ${formatNumber(dmg)} 伤害`;
          return [...l.slice(-30), msg];
        });

        if (newBossHp <= 0) {
          // Victory
          setResult('win');
          setFighting(false);
          clearInterval(timerRef.current);

          const rewards = currentFloor.rewards;
          const scaledLingshi = Math.floor(rewards.lingshi * Math.max(1, level / 10));
          const scaledPantao = Math.floor(rewards.pantao * Math.max(1, level / 50));

          // Apply rewards
          const state = useGameStore.getState();
          const p = { ...state.player };
          p.lingshi = (p.lingshi ?? 0) + scaledLingshi;
          p.pantao = (p.pantao ?? 0) + scaledPantao;
          if (rewards.shards > 0) p.hongmengShards = (p.hongmengShards ?? 0) + rewards.shards;
          if (rewards.daoPoints > 0) p.daoPoints = (p.daoPoints ?? 0) + rewards.daoPoints;
          if (rewards.trialTokens > 0) p.trialTokens = (p.trialTokens ?? 0) + rewards.trialTokens;
          p.weeklyBossKills = (p.weeklyBossKills ?? 0) + 1;
          useGameStore.setState({ player: p });

          // Record cleared floor
          const updated = {
            ...currentWeek,
            clearedFloors: [...currentWeek.clearedFloors, currentFloor.floor],
          };
          setWeeklyBoss(updated);

          setLog(l => [...l,
            `🎉 击败 ${currentFloor.name}！`,
            `💰 灵石 +${formatNumber(scaledLingshi)}`,
            `🍑 蟠桃 +${formatNumber(scaledPantao)}`,
            rewards.shards > 0 ? `💎 碎片 +${rewards.shards}` : '',
            rewards.daoPoints > 0 ? `☯️ 道点 +${rewards.daoPoints}` : '',
            rewards.trialTokens > 0 ? `🎟️ 令牌 +${rewards.trialTokens}` : '',
          ].filter(Boolean));

          return { ...prev, hp: 0 };
        }

        // Boss attacks player
        const pDef = 0; // player has no defense stat
        const pDefRate = pDef ? pDef / (pDef + 100 + level * 5) : 0;
        const bossDmg = Math.max(1, Math.floor(prev.atk * (1 - pDefRate)));

        setPlayerHp(ph => {
          const newPh = ph - bossDmg;
          if (newPh <= 0) {
            setResult('lose');
            setFighting(false);
            clearInterval(timerRef.current);
            setLog(l => [...l, `💀 你被${currentFloor.name}击败了...`]);
            return 0;
          }
          return newPh;
        });

        return { ...prev, hp: newBossHp };
      });
    }, 400);

    return () => clearInterval(timerRef.current);
  }, [fighting, currentFloor]);

  const resetTimer = getTimeUntilReset();
  const clearedCount = currentWeek.clearedFloors.length;

  return (
    <div style={{ padding: '8px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffd700' }}>⚔️ 周天秘境</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>每周重置 · 剩余 {resetTimer}</div>
          <div style={{ fontSize: 14, color: '#8b5cf6', marginTop: 4 }}>
            已通关 {clearedCount}/5 层
          </div>
        </div>

        {!fighting && !result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {WEEKLY_FLOORS.map(floor => {
              const cleared = currentWeek.clearedFloors.includes(floor.floor);
              const locked = floor.floor > 1 && !currentWeek.clearedFloors.includes(floor.floor - 1);
              const scaledLingshi = Math.floor(floor.rewards.lingshi * Math.max(1, level / 10));

              return (
                <button
                  key={floor.floor}
                  onClick={() => !cleared && !locked && startFight(floor)}
                  disabled={cleared || locked}
                  style={{
                    padding: '10px 12px',
                    background: cleared ? '#1a3a1a' : locked ? '#1a1a2e' : 'linear-gradient(135deg, #2d1b69, #1a1a2e)',
                    border: cleared ? '1px solid #4caf50' : locked ? '1px solid #333' : '1px solid #8b5cf6',
                    borderRadius: 8,
                    color: cleared ? '#4caf50' : locked ? '#666' : '#e0e0e0',
                    textAlign: 'left',
                    cursor: cleared || locked ? 'default' : 'pointer',
                    opacity: locked ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16 }}>
                      {cleared ? '✅' : locked ? '🔒' : floor.emoji} 第{floor.floor}层 · {floor.name}
                    </span>
                    <span style={{ fontSize: 12, color: '#ffd700' }}>
                      💰{formatNumber(scaledLingshi)}
                      {floor.rewards.daoPoints > 0 && ` ☯️${floor.rewards.daoPoints}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    HP×{floor.hpMul} ATK×{floor.atkMul} DEF×{floor.defMul}
                    {floor.rewards.shards > 0 && ` 💎${floor.rewards.shards}`}
                    {floor.rewards.trialTokens > 0 && ` 🎟️${floor.rewards.trialTokens}`}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {(fighting || result) && currentFloor && boss && (
          <div>
            {/* Boss HP bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{currentFloor.emoji} {currentFloor.name}</span>
                <span style={{ color: '#ef4444' }}>{formatNumber(Math.max(0, boss.hp))}/{formatNumber(boss.maxHp)}</span>
              </div>
              <div style={{ height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`,
                  background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>

            {/* Player HP bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>🧙 你</span>
                <span style={{ color: '#22c55e' }}>{formatNumber(Math.max(0, playerHp))}/{formatNumber(stats.maxHp)}</span>
              </div>
              <div style={{ height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(0, (playerHp / stats.maxHp) * 100)}%`,
                  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>

            {/* Combat log */}
            <div style={{
              height: 120,
              overflow: 'auto',
              background: '#0a0a1a',
              borderRadius: 6,
              padding: 6,
              fontSize: 11,
              color: '#ccc',
              marginBottom: 8,
            }}>
              {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>

            {result && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: result === 'win' ? '#ffd700' : '#ef4444',
                  marginBottom: 8,
                }}>
                  {result === 'win' ? '🎉 胜利！' : '💀 失败'}
                </div>
                <button
                  onClick={() => { setFighting(false); setResult(null); setCurrentFloor(null); setBoss(null); setLog([]); }}
                  style={{
                    padding: '8px 24px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    border: 'none',
                    borderRadius: 8,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  返回
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
