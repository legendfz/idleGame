// v56.0 世界Boss面板
import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { getCurrentWorldBoss, getNextBossSpawnSec, formatTime, type WorldBossTemplate } from '../data/worldBoss';

interface WorldBossState {
  boss: WorldBossTemplate | null;
  remainingSec: number;
  nextSpawnSec: number;
  currentHp: number;
  maxHp: number;
  totalDamageDealt: number;
  hpScale: number;
  defeated: boolean;
}

function getWorldBossState(): WorldBossState {
  const now = Date.now();
  const active = getCurrentWorldBoss(now);
  const saved = loadWorldBossSave();
  
  if (!active) {
    return {
      boss: null, remainingSec: 0, nextSpawnSec: getNextBossSpawnSec(now),
      currentHp: 0, maxHp: 0, totalDamageDealt: 0, hpScale: 1, defeated: false,
    };
  }
  
  const maxHp = Math.floor(active.boss.baseHp * active.hpScale);
  const cycleId = getCycleId(now);
  
  // Check if we already have damage for this cycle
  if (saved && saved.cycleId === cycleId) {
    const hp = Math.max(0, maxHp - saved.totalDamage);
    return {
      boss: active.boss, remainingSec: active.remainingSec,
      nextSpawnSec: 0, currentHp: hp, maxHp,
      totalDamageDealt: saved.totalDamage, hpScale: active.hpScale,
      defeated: saved.defeated || hp <= 0,
    };
  }
  
  return {
    boss: active.boss, remainingSec: active.remainingSec,
    nextSpawnSec: 0, currentHp: maxHp, maxHp,
    totalDamageDealt: 0, hpScale: active.hpScale, defeated: false,
  };
}

function getCycleId(nowMs: number): number {
  return Math.floor(nowMs / 1000 / 7200); // WORLD_BOSS_INTERVAL
}

interface WorldBossSave {
  cycleId: number;
  totalDamage: number;
  defeated: boolean;
  rewardClaimed: boolean;
}

function loadWorldBossSave(): WorldBossSave | null {
  try {
    const raw = localStorage.getItem('worldBoss');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveWorldBoss(data: WorldBossSave) {
  localStorage.setItem('worldBoss', JSON.stringify(data));
}

export function WorldBossBanner({ onOpen }: { onOpen: () => void }) {
  const [state, setState] = useState(getWorldBossState);
  
  useEffect(() => {
    const iv = setInterval(() => setState(getWorldBossState()), 1000);
    return () => clearInterval(iv);
  }, []);
  
  if (!state.boss) {
    if (state.nextSpawnSec <= 0) return null;
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '1px solid #333',
        borderRadius: 8, padding: '8px 12px', margin: '0 0 8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#888', fontSize: 13 }}>⏳ 下一个世界Boss</span>
        <span style={{ color: '#f0c040', fontSize: 13, fontWeight: 600 }}>
          {formatTime(state.nextSpawnSec)}
        </span>
      </div>
    );
  }
  
  const hpPct = state.maxHp > 0 ? (state.currentHp / state.maxHp * 100) : 0;
  
  return (
    <div onClick={onOpen} style={{
      background: state.defeated
        ? 'linear-gradient(135deg, #1a2e1a, #1e3e16)'
        : 'linear-gradient(135deg, #2e1a1a, #3e1616)',
      border: state.defeated ? '1px solid #4caf50' : '1px solid #f44',
      borderRadius: 8, padding: '8px 12px', margin: '0 0 8px', cursor: 'pointer',
      animation: state.defeated ? 'none' : 'worldBossPulse 2s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>
          {state.boss.emoji} <strong style={{ color: '#ff6b6b' }}>{state.boss.name}</strong>
          <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>{state.boss.title}</span>
        </span>
        <span style={{ color: '#f0c040', fontSize: 12 }}>
          {state.defeated ? '✅ 已击败' : `⏱ ${formatTime(state.remainingSec)}`}
        </span>
      </div>
      {!state.defeated && (
        <div style={{
          background: '#111', borderRadius: 4, height: 6, marginTop: 4, overflow: 'hidden',
        }}>
          <div style={{
            background: hpPct > 50 ? '#f44' : hpPct > 20 ? '#ff9800' : '#4caf50',
            height: '100%', width: `${hpPct}%`, transition: 'width 0.3s',
          }} />
        </div>
      )}
      <div style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>
        {state.defeated ? '点击领取奖励 →' : `点击挑战 · HP: ${formatNumber(state.currentHp)}/${formatNumber(state.maxHp)}`}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

export function WorldBossModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState(getWorldBossState);
  const player = useGameStore(s => s.player);
  const updatePlayer = useGameStore(s => s.updatePlayer);
  const [attacking, setAttacking] = useState(false);
  const [lastHit, setLastHit] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  
  useEffect(() => {
    const iv = setInterval(() => setState(getWorldBossState()), 1000);
    return () => clearInterval(iv);
  }, []);
  
  useEffect(() => {
    const saved = loadWorldBossSave();
    if (saved && saved.cycleId === getCycleId(Date.now()) && saved.rewardClaimed) {
      setRewardClaimed(true);
    }
  }, []);
  
  const doAttack = useCallback(() => {
    if (!state.boss || state.defeated) return;
    
    const atk = player.stats.attack;
    const isCrit = Math.random() * 100 < player.stats.critRate;
    const dmg = Math.floor(atk * (isCrit ? player.stats.critDmg : 1));
    
    const cycleId = getCycleId(Date.now());
    const saved = loadWorldBossSave();
    const prevDmg = (saved && saved.cycleId === cycleId) ? saved.totalDamage : 0;
    const newTotal = prevDmg + dmg;
    const maxHp = state.maxHp;
    const defeated = newTotal >= maxHp;
    
    saveWorldBoss({ cycleId, totalDamage: newTotal, defeated, rewardClaimed: false });
    setLastHit(dmg);
    setState(getWorldBossState());
  }, [state, player]);
  
  // Auto-attack every 500ms
  useEffect(() => {
    if (!state.boss || state.defeated || !attacking) return;
    const iv = setInterval(doAttack, 500);
    return () => clearInterval(iv);
  }, [attacking, state.boss, state.defeated, doAttack]);
  
  const claimReward = useCallback(() => {
    if (!state.boss || !state.defeated || rewardClaimed) return;
    const r = state.boss.rewards;
    const scale = Math.max(1, player.level / 100);
    updatePlayer({
      lingshi: player.lingshi + Math.floor(r.lingshi * scale),
      pantao: player.pantao + Math.floor(r.pantao * scale),
      hongmengShards: player.hongmengShards + Math.floor(r.hongmengShards * scale),
      daoPoints: player.daoPoints + r.daoPoints,
      trialTokens: player.trialTokens + r.trialTokens,
    });
    const cycleId = getCycleId(Date.now());
    const saved = loadWorldBossSave();
    saveWorldBoss({ cycleId, totalDamage: saved?.totalDamage || 0, defeated: true, rewardClaimed: true });
    setRewardClaimed(true);
  }, [state, player, updatePlayer, rewardClaimed]);
  
  if (!state.boss) {
    return (
      <div style={modalStyle}>
        <div style={modalContentStyle}>
          <h3 style={{ color: '#fff', margin: 0 }}>世界Boss</h3>
          <p style={{ color: '#888' }}>当前没有世界Boss出没</p>
          <p style={{ color: '#f0c040' }}>下一个Boss将在 {formatTime(state.nextSpawnSec)} 后出现</p>
          <button onClick={onClose} style={btnStyle}>返回</button>
        </div>
      </div>
    );
  }
  
  const hpPct = state.maxHp > 0 ? Math.max(0, state.currentHp / state.maxHp * 100) : 0;
  const r = state.boss.rewards;
  const scale = Math.max(1, player.level / 100);
  
  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ff6b6b', margin: 0 }}>
            {state.boss.emoji} {state.boss.name}
          </h3>
          <span style={{ color: '#f0c040', fontSize: 13 }}>⏱ {formatTime(state.remainingSec)}</span>
        </div>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>{state.boss.title}</div>
        
        {/* HP Bar */}
        <div style={{ background: '#111', borderRadius: 6, height: 20, overflow: 'hidden', position: 'relative', marginBottom: 8 }}>
          <div style={{
            background: hpPct > 50 ? 'linear-gradient(90deg, #f44, #ff6b6b)' : hpPct > 20 ? 'linear-gradient(90deg, #ff9800, #ffc107)' : 'linear-gradient(90deg, #4caf50, #81c784)',
            height: '100%', width: `${hpPct}%`, transition: 'width 0.3s',
          }} />
          <span style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: 11, fontWeight: 600, textShadow: '0 0 4px #000' }}>
            {formatNumber(state.currentHp)} / {formatNumber(state.maxHp)}
          </span>
        </div>
        
        {/* Last hit */}
        {lastHit > 0 && (
          <div style={{ textAlign: 'center', color: '#ff6b6b', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            -{formatNumber(lastHit)}
          </div>
        )}
        
        {/* My damage */}
        <div style={{ color: '#ccc', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
          我的伤害: <span style={{ color: '#f0c040' }}>{formatNumber(state.totalDamageDealt)}</span>
        </div>
        
        {/* Actions */}
        {state.defeated ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#4caf50', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              ✅ 世界Boss已击败！
            </div>
            {!rewardClaimed ? (
              <>
                <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>
                  奖励预览: 💰{formatNumber(Math.floor(r.lingshi * scale))} 🍑{Math.floor(r.pantao * scale)} 💎{Math.floor(r.hongmengShards * scale)} ☯{r.daoPoints} 🎟{r.trialTokens}
                </div>
                <button onClick={claimReward} style={{ ...btnStyle, background: 'linear-gradient(135deg, #f0c040, #ff9800)' }}>
                  🎁 领取奖励
                </button>
              </>
            ) : (
              <div style={{ color: '#4caf50', fontSize: 13 }}>✅ 奖励已领取</div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setAttacking(!attacking)}
              style={{
                ...btnStyle,
                background: attacking ? 'linear-gradient(135deg, #f44, #c62828)' : 'linear-gradient(135deg, #ff6b6b, #f44)',
                fontSize: 16, padding: '12px 32px',
                animation: attacking ? 'worldBossPulse 0.5s ease-in-out infinite' : 'none',
              }}
            >
              {attacking ? '⚔️ 攻击中...' : '⚔️ 开始攻击'}
            </button>
            <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
              每次攻击造成 {formatNumber(player.stats.attack)} 伤害
            </div>
          </div>
        )}
        
        {/* Reward preview */}
        {!state.defeated && (
          <div style={{
            background: '#111', borderRadius: 6, padding: 8, marginTop: 8,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontSize: 11, color: '#aaa',
          }}>
            <span>💰 {formatNumber(Math.floor(r.lingshi * scale))}</span>
            <span>🍑 {Math.floor(r.pantao * scale)}</span>
            <span>💎 {Math.floor(r.hongmengShards * scale)}</span>
            <span>☯ {r.daoPoints} 道点</span>
            <span>🎟 {r.trialTokens} 令牌</span>
            <span style={{ color: '#f0c040' }}>击败可领</span>
          </div>
        )}
        
        <button onClick={onClose} style={{ ...btnStyle, background: '#333', marginTop: 8 }}>返回</button>
      </div>
    </div>
  );
}

const modalStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.8)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalContentStyle: React.CSSProperties = {
  background: '#1a1a2e', borderRadius: 12, padding: 16,
  width: '90%', maxWidth: 380, border: '1px solid #333',
};

const btnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  color: '#fff', border: 'none', borderRadius: 8,
  padding: '10px 24px', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', width: '100%',
};
