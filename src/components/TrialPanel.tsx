import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/format';
import { TRIAL_MODIFIERS, TrialModifier, TRIAL_SHOP, calcTrialRewards } from '../data/roguelikeTrial';
import { Card } from './shared/Card';

type TrialPhase = 'idle' | 'choose_modifier' | 'fighting' | 'floor_clear' | 'dead' | 'rewards';

interface TrialEnemy {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  atk: number;
}

const TRIAL_ENEMIES = [
  { name: '劫灵', emoji: '👻' },
  { name: '魔影', emoji: '🦇' },
  { name: '邪修', emoji: '🧟' },
  { name: '天魔', emoji: '👿' },
  { name: '混沌兽', emoji: '🐉' },
];
const TRIAL_BOSSES = [
  { name: '劫难之主', emoji: '💀' },
  { name: '轮回守卫', emoji: '⚔️' },
  { name: '万劫魔尊', emoji: '👑' },
];

export function TrialPanel() {
  const player = useGameStore(s => s.player);
  const updatePlayer = useGameStore(s => s.updatePlayer);

  const [phase, setPhase] = useState<TrialPhase>('idle');
  const [floor, setFloor] = useState(0);
  const [modifiers, setModifiers] = useState<TrialModifier[]>([]);
  const [activeModifiers, setActiveModifiers] = useState<TrialModifier[]>([]);
  const [choices, setChoices] = useState<TrialModifier[]>([]);
  const [enemy, setEnemy] = useState<TrialEnemy | null>(null);
  const [playerHp, setPlayerHp] = useState(0);
  const [playerMaxHp, setPlayerMaxHp] = useState(0);
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [totalEnemies, setTotalEnemies] = useState(0);
  const [fightLog, setFightLog] = useState<string[]>([]);
  const [showShop, setShowShop] = useState(false);
  const tickRef = useRef<number>(0);

  const trialTokens = player.trialTokens || 0;
  const trialBestFloor = player.trialBestFloor || 0;
  const trialShopPurchases = player.trialShopPurchases || {};

  // Calculate effective stats with modifiers
  function getEffectiveStats() {
    let atkMult = 1, hpMult = 1, enemyAtkMult = 1, enemyHpMult = 1;
    let goldMult = 1, expMult = 1, critBonus = 0, dropBonus = 0;
    for (const m of activeModifiers) {
      if (m.effect.atkMult) atkMult *= m.effect.atkMult;
      if (m.effect.hpMult) hpMult *= m.effect.hpMult;
      if (m.effect.enemyAtkMult) enemyAtkMult *= m.effect.enemyAtkMult;
      if (m.effect.enemyHpMult) enemyHpMult *= m.effect.enemyHpMult;
      if (m.effect.goldMult) goldMult *= m.effect.goldMult;
      if (m.effect.expMult) expMult *= m.effect.expMult;
      if (m.effect.critBonus) critBonus += m.effect.critBonus;
      if (m.effect.dropBonus) dropBonus += m.effect.dropBonus;
    }
    // Trial shop permanent bonuses
    for (const [itemId, count] of Object.entries(trialShopPurchases)) {
      const item = TRIAL_SHOP.find(i => i.id === itemId);
      if (!item) continue;
      const v = item.effect.value * count;
      if (item.effect.type === 'atkPercent') atkMult *= (1 + v);
      if (item.effect.type === 'hpPercent') hpMult *= (1 + v);
      if (item.effect.type === 'critRate') critBonus += v * count;
      if (item.effect.type === 'goldPercent') goldMult *= (1 + v);
      if (item.effect.type === 'expPercent') expMult *= (1 + v);
    }
    return { atkMult, hpMult, enemyAtkMult, enemyHpMult, goldMult, expMult, critBonus, dropBonus };
  }

  function startTrial() {
    setFloor(1);
    setActiveModifiers([]);
    setFightLog([]);
    startFloor(1, []);
  }

  function startFloor(f: number, mods: TrialModifier[]) {
    if (f > 1) {
      // Show modifier choices
      const available = TRIAL_MODIFIERS.filter(m => !mods.some(am => am.id === m.id));
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      setChoices(shuffled.slice(0, 3));
      setPhase('choose_modifier');
    } else {
      beginCombat(f, mods);
    }
  }

  function pickModifier(mod: TrialModifier) {
    const newMods = [...activeModifiers, mod];
    setActiveModifiers(newMods);
    setChoices([]);
    beginCombat(floor, newMods);
  }

  function beginCombat(f: number, mods: TrialModifier[]) {
    const isBoss = f % 5 === 0;
    const count = isBoss ? 1 : 3 + Math.floor(f * 0.5);
    const eff = getEffectiveStatsWithMods(mods);
    
    const baseHp = 50 + f * 30 + player.level * 5;
    const baseAtk = 5 + f * 3 + player.level * 0.5;
    
    const template = isBoss
      ? TRIAL_BOSSES[f / 5 % TRIAL_BOSSES.length | 0]
      : TRIAL_ENEMIES[Math.random() * TRIAL_ENEMIES.length | 0];

    const e: TrialEnemy = {
      name: isBoss ? `⭐${template.name}` : template.name,
      emoji: template.emoji,
      hp: Math.floor((isBoss ? baseHp * 5 : baseHp) * eff.enemyHpMult),
      maxHp: Math.floor((isBoss ? baseHp * 5 : baseHp) * eff.enemyHpMult),
      atk: Math.floor((isBoss ? baseAtk * 3 : baseAtk) * eff.enemyAtkMult),
    };

    const pMaxHp = Math.floor(player.stats.maxHp * eff.hpMult);
    setEnemy(e);
    setPlayerHp(pMaxHp);
    setPlayerMaxHp(pMaxHp);
    setEnemyIdx(0);
    setTotalEnemies(count);
    setPhase('fighting');
    setFightLog(prev => [...prev, `--- 第${f}层 ${isBoss ? '👑BOSS' : ''} ---`]);
  }

  function getEffectiveStatsWithMods(mods: TrialModifier[]) {
    let atkMult = 1, hpMult = 1, enemyAtkMult = 1, enemyHpMult = 1;
    let goldMult = 1, expMult = 1, critBonus = 0, dropBonus = 0;
    for (const m of mods) {
      if (m.effect.atkMult) atkMult *= m.effect.atkMult;
      if (m.effect.hpMult) hpMult *= m.effect.hpMult;
      if (m.effect.enemyAtkMult) enemyAtkMult *= m.effect.enemyAtkMult;
      if (m.effect.enemyHpMult) enemyHpMult *= m.effect.enemyHpMult;
      if (m.effect.goldMult) goldMult *= m.effect.goldMult;
      if (m.effect.expMult) expMult *= m.effect.expMult;
      if (m.effect.critBonus) critBonus += m.effect.critBonus;
      if (m.effect.dropBonus) dropBonus += m.effect.dropBonus;
    }
    for (const [itemId, count] of Object.entries(trialShopPurchases)) {
      const item = TRIAL_SHOP.find(i => i.id === itemId);
      if (!item) continue;
      const v = item.effect.value * count;
      if (item.effect.type === 'atkPercent') atkMult *= (1 + v);
      if (item.effect.type === 'hpPercent') hpMult *= (1 + v);
    }
    return { atkMult, hpMult, enemyAtkMult, enemyHpMult, goldMult, expMult, critBonus, dropBonus };
  }

  // Combat tick
  useEffect(() => {
    if (phase !== 'fighting' || !enemy) return;
    const eff = getEffectiveStats();
    const interval = setInterval(() => {
      setEnemy(prev => {
        if (!prev || prev.hp <= 0) return prev;
        const pAtk = Math.floor(player.stats.attack * eff.atkMult);
        const isCrit = Math.random() * 100 < (player.stats.critRate + eff.critBonus);
        const dmg = isCrit ? Math.floor(pAtk * (1 + player.stats.critDmg)) : pAtk;
        const newHp = prev.hp - dmg;
        setFightLog(l => [...l.slice(-20), `${isCrit ? '💥暴击' : '⚔️'}${prev.name} -${formatNumber(dmg)}`]);
        
        // Enemy attacks back
        setPlayerHp(php => {
          const eDmg = Math.max(1, prev.atk - Math.floor(player.stats.maxHp * 0.01));
          const newPhp = php - eDmg;
          if (newPhp <= 0) {
            setPhase('dead');
            return 0;
          }
          return newPhp;
        });

        if (newHp <= 0) {
          // Enemy killed
          const nextIdx = enemyIdx + 1;
          if (nextIdx >= totalEnemies) {
            // Floor cleared
            setPhase('floor_clear');
            return { ...prev, hp: 0 };
          } else {
            // Next enemy
            setEnemyIdx(nextIdx);
            const isBoss = floor % 5 === 0;
            const baseHp = 50 + floor * 30 + player.level * 5;
            const baseAtk = 5 + floor * 3 + player.level * 0.5;
            const template = TRIAL_ENEMIES[Math.random() * TRIAL_ENEMIES.length | 0];
            return {
              name: template.name,
              emoji: template.emoji,
              hp: Math.floor(baseHp * eff.enemyHpMult),
              maxHp: Math.floor(baseHp * eff.enemyHpMult),
              atk: Math.floor(baseAtk * eff.enemyAtkMult),
            };
          }
        }
        return { ...prev, hp: newHp };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [phase, enemy, floor, enemyIdx, totalEnemies, activeModifiers]);

  function nextFloor() {
    const f = floor + 1;
    setFloor(f);
    // Heal 30% between floors
    setPlayerHp(hp => Math.min(playerMaxHp, hp + Math.floor(playerMaxHp * 0.3)));
    startFloor(f, activeModifiers);
  }

  function claimRewards() {
    const rewards = calcTrialRewards(floor, player.level);
    const best = Math.max(trialBestFloor, floor);
    updatePlayer({
      lingshi: player.lingshi + rewards.lingshi,
      exp: player.exp + rewards.exp,
      pantao: player.pantao + rewards.pantao,
      hongmengShards: player.hongmengShards + rewards.hongmengShards,
      trialTokens: trialTokens + rewards.trialTokens,
      trialBestFloor: best,
    });
    setPhase('idle');
    setFloor(0);
    setActiveModifiers([]);
    setFightLog([]);
  }

  function buyShopItem(itemId: string) {
    const item = TRIAL_SHOP.find(i => i.id === itemId);
    if (!item || trialTokens < item.cost) return;
    const newPurchases = { ...trialShopPurchases, [itemId]: (trialShopPurchases[itemId] || 0) + 1 };
    updatePlayer({
      trialTokens: trialTokens - item.cost,
      trialShopPurchases: newPurchases,
    });
  }

  // --- Render ---
  if (showShop) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>🏪 试炼商店</h3>
          <button onClick={() => setShowShop(false)} style={{ padding: '4px 12px' }}>返回</button>
        </div>
        <div className="color-gold" style={{ marginBottom: 12 }}>🪙 试炼令牌：{trialTokens}</div>
        {TRIAL_SHOP.map(item => {
          const owned = trialShopPurchases[item.id] || 0;
          return (
            <Card key={item.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>{item.emoji} {item.name}</span>
                  <div className="color-dim" style={{ fontSize: 12 }}>{item.description} (已购{owned}次)</div>
                </div>
                <button
                  onClick={() => buyShopItem(item.id)}
                  disabled={trialTokens < item.cost}
                  style={{ padding: '4px 12px', opacity: trialTokens < item.cost ? 0.5 : 1 }}
                >
                  {item.cost}🪙
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  if (phase === 'idle') {
    return (
      <div style={{ padding: 16 }}>
        <h3 style={{ textAlign: 'center' }}>🌀 万劫轮回</h3>
        <Card style={{ marginBottom: 12, textAlign: 'center' }}>
          <div className="color-dim">在万劫试炼中，每层选择祝福或诅咒</div>
          <div className="color-dim">走得越远，奖励越丰</div>
          <div style={{ marginTop: 8 }}>
            <span className="color-gold">最高纪录：第{trialBestFloor}层</span>
            <span style={{ marginLeft: 16 }}>🪙 令牌：{trialTokens}</span>
          </div>
        </Card>
        <button onClick={startTrial} style={{ width: '100%', padding: 12, marginBottom: 8, background: 'linear-gradient(135deg, #6b21a8, #9333ea)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          ⚡ 进入试炼
        </button>
        {trialBestFloor >= 3 && (
          <button onClick={() => {
            // Quick trial: auto-complete at 70% of best floor, instant rewards
            const quickFloor = Math.max(1, Math.floor(trialBestFloor * 0.7));
            const rewards = calcTrialRewards(quickFloor, player.level);
            updatePlayer({
              lingshi: player.lingshi + rewards.lingshi,
              exp: player.exp + rewards.exp,
              pantao: player.pantao + rewards.pantao,
              trialTokens: (player.trialTokens || 0) + rewards.trialTokens,
            });
            setFightLog([`⚡ 快速试炼完成！通过${quickFloor}层`, `💰 +${formatNumber(rewards.lingshi)}灵石 +${formatNumber(rewards.exp)}经验`, `🍑 +${rewards.pantao}蟠桃 🪙 +${rewards.trialTokens}令牌`]);
            setPhase('rewards');
          }} style={{ width: '100%', padding: 10, marginBottom: 8, background: 'linear-gradient(135deg, #b45309, #d97706)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
            ⚡ 快速试炼（通过{Math.floor(trialBestFloor * 0.7)}层，70%最高纪录）
          </button>
        )}
        <button onClick={() => setShowShop(true)} style={{ width: '100%', padding: 10, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          🏪 试炼商店
        </button>
      </div>
    );
  }

  if (phase === 'choose_modifier') {
    return (
      <div style={{ padding: 16 }}>
        <h3 style={{ textAlign: 'center' }}>第{floor}层 - 选择命运</h3>
        <div className="color-dim" style={{ textAlign: 'center', marginBottom: 12 }}>选择一个效果，将持续整个试炼</div>
        {choices.map(mod => (
          <Card key={mod.id} onClick={() => pickModifier(mod)} style={{
            marginBottom: 8, cursor: 'pointer',
            borderLeft: `3px solid ${mod.rarity === 'blessing' ? '#22c55e' : mod.rarity === 'curse' ? '#ef4444' : '#eab308'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>{mod.emoji}</span>
              <div>
                <div style={{ fontWeight: 'bold', color: mod.rarity === 'blessing' ? '#22c55e' : mod.rarity === 'curse' ? '#ef4444' : '#eab308' }}>
                  {mod.name}
                </div>
                <div className="color-dim" style={{ fontSize: 12 }}>{mod.description}</div>
              </div>
            </div>
          </Card>
        ))}
        {activeModifiers.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12 }} className="color-dim">
            已有效果：{activeModifiers.map(m => `${m.emoji}${m.name}`).join(' ')}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'fighting') {
    const hpPercent = enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;
    const pHpPercent = playerMaxHp > 0 ? Math.max(0, (playerHp / playerMaxHp) * 100) : 0;
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>🌀 第{floor}层</span>
          <span className="color-dim">{enemyIdx + 1}/{totalEnemies}</span>
        </div>
        {/* Player HP */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12 }} className="color-dim">你 ❤️ {formatNumber(playerHp)}/{formatNumber(playerMaxHp)}</div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${pHpPercent}%`, background: '#22c55e', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        </div>
        {/* Enemy */}
        {enemy && (
          <Card style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 36 }}>{enemy.emoji}</div>
            <div style={{ fontWeight: 'bold' }}>{enemy.name}</div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, margin: '8px 0' }}>
              <div style={{ height: '100%', width: `${hpPercent}%`, background: '#ef4444', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <div className="color-dim" style={{ fontSize: 12 }}>{formatNumber(Math.max(0, enemy.hp))}/{formatNumber(enemy.maxHp)}</div>
          </Card>
        )}
        {/* Log */}
        <div style={{ maxHeight: 120, overflow: 'auto', fontSize: 12, padding: 8, background: 'var(--card-bg)', borderRadius: 8 }}>
          {fightLog.slice(-8).map((l, i) => <div key={i} className="color-dim">{l}</div>)}
        </div>
        {activeModifiers.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 11 }} className="color-dim">
            {activeModifiers.map(m => `${m.emoji}`).join(' ')}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'floor_clear') {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <h3>✅ 第{floor}层通过！</h3>
        <div className="color-dim">❤️ 剩余生命：{formatNumber(playerHp)}/{formatNumber(playerMaxHp)}</div>
        <div style={{ margin: '16px 0' }}>
          <button onClick={nextFloor} style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg, #6b21a8, #9333ea)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>
            ⚡ 继续挑战第{floor + 1}层
          </button>
          <button onClick={() => setPhase('rewards')} style={{ width: '100%', padding: 10 }}>
            🏆 结算离开
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'dead') {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>💀 试炼失败</h3>
        <div className="color-dim">倒在第{floor}层</div>
        <div style={{ margin: '16px 0' }}>
          <button onClick={() => setPhase('rewards')} style={{ width: '100%', padding: 12 }}>
            🏆 领取奖励
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'rewards') {
    const rewards = calcTrialRewards(floor, player.level);
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <h3>🏆 试炼结算</h3>
        <div className="color-dim" style={{ marginBottom: 12 }}>到达第{floor}层</div>
        <Card>
          <div className="stat-row"><span>灵石</span><span className="color-gold">+{formatNumber(rewards.lingshi)}</span></div>
          <div className="stat-row"><span>经验</span><span className="color-exp">+{formatNumber(rewards.exp)}</span></div>
          {rewards.pantao > 0 && <div className="stat-row"><span>蟠桃</span><span className="color-pantao">+{rewards.pantao}</span></div>}
          {rewards.hongmengShards > 0 && <div className="stat-row"><span>鸿蒙碎片</span><span>+{rewards.hongmengShards}</span></div>}
          <div className="stat-row"><span>🪙试炼令牌</span><span className="color-gold">+{rewards.trialTokens}</span></div>
        </Card>
        <button onClick={claimRewards} style={{ width: '100%', padding: 12, marginTop: 12, background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 'bold' }}>
          领取奖励
        </button>
      </div>
    );
  }

  return null;
}
