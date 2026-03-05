import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CONSUMABLE_BUFFS } from '../data/consumables';

interface WheelSlot {
  label: string;
  emoji: string;
  weight: number;
  reward: () => string; // returns description
}

const SPIN_COST = 5000; // lingshi
const COOLDOWN_MS = 3600_000; // 1 hour

function getSlots(level: number): WheelSlot[] {
  const goldBase = Math.max(1000, level * 500);
  return [
    { label: '灵石', emoji: '💰', weight: 25, reward: () => {
      const amt = goldBase * (1 + Math.floor(Math.random() * 3));
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi + amt } }));
      return `灵石 ×${amt}`;
    }},
    { label: '蟠桃', emoji: '🍑', weight: 20, reward: () => {
      const amt = Math.max(1, Math.floor(level / 20));
      useGameStore.setState(s => ({ player: { ...s.player, pantao: s.player.pantao + amt } }));
      return `蟠桃 ×${amt}`;
    }},
    { label: '碎片', emoji: '🔮', weight: 15, reward: () => {
      const amt = Math.max(1, Math.floor(level / 30));
      useGameStore.setState(s => ({ player: { ...s.player, hongmengShards: s.player.hongmengShards + amt } }));
      return `鸿蒙碎片 ×${amt}`;
    }},
    { label: '悟道丹', emoji: '📗', weight: 12, reward: () => {
      useGameStore.getState().addConsumable('exp_pill', 1);
      return '悟道丹 ×1';
    }},
    { label: '聚宝丹', emoji: '📙', weight: 10, reward: () => {
      useGameStore.getState().addConsumable('gold_pill', 1);
      return '聚宝丹 ×1';
    }},
    { label: '狂暴丹', emoji: '💊', weight: 8, reward: () => {
      useGameStore.getState().addConsumable('atk_pill', 1);
      return '狂暴丹 ×1';
    }},
    { label: '天命符', emoji: '📜', weight: 5, reward: () => {
      useGameStore.setState(s => ({ player: { ...s.player, tianmingScrolls: s.player.tianmingScrolls + 1 } }));
      return '天命符 ×1';
    }},
    { label: '混元仙丹', emoji: '🌟', weight: 3, reward: () => {
      useGameStore.getState().addConsumable('mega_pill', 1);
      return '混元仙丹 ×1';
    }},
    { label: '大奖', emoji: '🎆', weight: 2, reward: () => {
      const amt = goldBase * 10;
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi + amt, pantao: s.player.pantao + 10 } }));
      useGameStore.getState().addConsumable('mega_pill', 2);
      return `大奖！灵石×${amt} + 蟠桃×10 + 混元仙丹×2`;
    }},
  ];
}

function weightedRandom(slots: WheelSlot[]): number {
  const total = slots.reduce((s, sl) => s + sl.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < slots.length; i++) {
    r -= slots[i].weight;
    if (r <= 0) return i;
  }
  return slots.length - 1;
}

const SAVE_KEY = 'idlegame_wheel';

export function LuckyWheel() {
  const player = useGameStore(s => s.player);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [lastSpin, setLastSpin] = useState(() => {
    try { return Number(localStorage.getItem(SAVE_KEY) || '0'); } catch { return 0; }
  });

  const now = Date.now();
  const cooldownLeft = Math.max(0, SPIN_COST > player.lingshi ? 0 : lastSpin + COOLDOWN_MS - now);
  const canSpin = !spinning && cooldownLeft === 0 && player.lingshi >= SPIN_COST;

  const fmtCd = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const slots = getSlots(player.level);

  const doSpin = () => {
    if (!canSpin) return;
    // Deduct cost
    useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi - SPIN_COST } }));
    setSpinning(true);
    setResult(null);

    // Pick result after animation
    setTimeout(() => {
      const idx = weightedRandom(slots);
      const desc = slots[idx].reward();
      setResult(`${slots[idx].emoji} ${desc}`);
      setSpinning(false);
      const t = Date.now();
      setLastSpin(t);
      localStorage.setItem(SAVE_KEY, String(t));
      useGameStore.getState().save();
    }, 1500);
  };

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">🎡 天道轮盘</h3>
      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
        消耗 {SPIN_COST} 灵石转动轮盘，每小时可转1次
      </div>

      {/* Wheel display */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
        maxWidth: 300, margin: '0 auto 16px',
      }}>
        {slots.map((s, i) => (
          <div key={i} style={{
            padding: '8px 4px', borderRadius: 8, textAlign: 'center', fontSize: 11,
            background: spinning ? `hsl(${(i * 40 + Date.now() / 50) % 360}, 50%, 15%)` : 'var(--panel)',
            border: '1px solid var(--border)',
            transition: 'background 0.3s',
          }}>
            <div style={{ fontSize: 20 }}>{s.emoji}</div>
            <div>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div style={{
          textAlign: 'center', padding: '12px 16px', marginBottom: 12, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,100,50,0.1))',
          border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', fontSize: 14,
          animation: 'dropIn 0.3s ease-out',
        }}>
          🎉 {result}
        </div>
      )}

      {/* Spin button */}
      {cooldownLeft > 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, padding: 12 }}>
          ⏳ 冷却中 {fmtCd(cooldownLeft)}
        </div>
      ) : (
        <button
          className={`sign-in-btn${canSpin ? ' pulse-glow' : ''}`}
          onClick={doSpin}
          disabled={!canSpin}
          style={{ opacity: canSpin ? 1 : 0.5 }}
        >
          {spinning ? '🌀 转动中...' : `🎡 转动轮盘（${SPIN_COST} 灵石）`}
        </button>
      )}
      {player.lingshi < SPIN_COST && !spinning && (
        <div style={{ textAlign: 'center', color: '#f44', fontSize: 12, marginTop: 8 }}>
          灵石不足（需要 {SPIN_COST}）
        </div>
      )}
    </div>
  );
}
