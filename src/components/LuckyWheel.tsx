import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { CONSUMABLE_BUFFS } from '../data/consumables';
import { formatNumber } from '../utils/format';

interface WheelSlot {
  label: string;
  emoji: string;
  weight: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: () => string;
}

const SPIN_COST = 5000;
const MULTI_SPIN_COUNT = 10;
const MULTI_SPIN_COST = SPIN_COST * MULTI_SPIN_COUNT; // 50000
const COOLDOWN_MS = 3600_000;

const SAVE_KEY = 'idlegame_wheel';
const FREE_KEY = 'idlegame_wheel_free';
const HISTORY_KEY = 'idlegame_wheel_history';

function getSlots(level: number): WheelSlot[] {
  const goldBase = Math.max(1000, level * 500);
  return [
    { label: '灵石', emoji: '💰', weight: 25, rarity: 'common', reward: () => {
      const amt = goldBase * (1 + Math.floor(Math.random() * 3));
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi + amt } }));
      return `灵石 ×${formatNumber(amt)}`;
    }},
    { label: '蟠桃', emoji: '🍑', weight: 20, rarity: 'common', reward: () => {
      const amt = Math.max(1, Math.floor(level / 20));
      useGameStore.setState(s => ({ player: { ...s.player, pantao: s.player.pantao + amt } }));
      return `蟠桃 ×${amt}`;
    }},
    { label: '碎片', emoji: '🔮', weight: 15, rarity: 'rare', reward: () => {
      const amt = Math.max(1, Math.floor(level / 30));
      useGameStore.setState(s => ({ player: { ...s.player, hongmengShards: s.player.hongmengShards + amt } }));
      return `鸿蒙碎片 ×${amt}`;
    }},
    { label: '悟道丹', emoji: '📗', weight: 12, rarity: 'rare', reward: () => {
      useGameStore.getState().addConsumable('exp_pill', 1);
      return '悟道丹 ×1';
    }},
    { label: '聚宝丹', emoji: '📙', weight: 10, rarity: 'rare', reward: () => {
      useGameStore.getState().addConsumable('gold_pill', 1);
      return '聚宝丹 ×1';
    }},
    { label: '狂暴丹', emoji: '💊', weight: 8, rarity: 'rare', reward: () => {
      useGameStore.getState().addConsumable('atk_pill', 1);
      return '狂暴丹 ×1';
    }},
    { label: '天命符', emoji: '📜', weight: 5, rarity: 'epic', reward: () => {
      useGameStore.setState(s => ({ player: { ...s.player, tianmingScrolls: s.player.tianmingScrolls + 1 } }));
      return '天命符 ×1';
    }},
    { label: '混元仙丹', emoji: '🌟', weight: 3, rarity: 'epic', reward: () => {
      useGameStore.getState().addConsumable('mega_pill', 1);
      return '混元仙丹 ×1';
    }},
    { label: '大奖', emoji: '🎆', weight: 2, rarity: 'legendary', reward: () => {
      const amt = goldBase * 10;
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi + amt, pantao: s.player.pantao + 10 } }));
      useGameStore.getState().addConsumable('mega_pill', 2);
      return `大奖！灵石×${formatNumber(amt)} + 蟠桃×10 + 混元仙丹×2`;
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

/** Weighted random but guarantee at least one rare+ for multi-spin */
function weightedRandomGuaranteeRare(slots: WheelSlot[]): number {
  // Force pick from rare+ pool
  const rareSlots = slots.map((s, i) => ({ ...s, idx: i })).filter(s => s.rarity !== 'common');
  const total = rareSlots.reduce((s, sl) => s + sl.weight, 0);
  let r = Math.random() * total;
  for (const sl of rareSlots) {
    r -= sl.weight;
    if (r <= 0) return sl.idx;
  }
  return rareSlots[rareSlots.length - 1].idx;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#fbbf24',
};

interface HistoryEntry { emoji: string; desc: string; time: number; rarity: string }

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
}

function isFreeAvailable(): boolean {
  const last = localStorage.getItem(FREE_KEY);
  if (!last) return true;
  const lastDate = new Date(Number(last));
  const now = new Date();
  return lastDate.toDateString() !== now.toDateString();
}

function markFreeUsed() {
  localStorage.setItem(FREE_KEY, String(Date.now()));
}

export function LuckyWheel() {
  const player = useGameStore(s => s.player);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [multiResults, setMultiResults] = useState<HistoryEntry[] | null>(null);
  const [lastSpin, setLastSpin] = useState(() => {
    try { return Number(localStorage.getItem(SAVE_KEY) || '0'); } catch { return 0; }
  });
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [freeAvail, setFreeAvail] = useState(isFreeAvailable);

  const now = Date.now();
  const cooldownLeft = Math.max(0, lastSpin + COOLDOWN_MS - now);
  const canSpin = !spinning && (freeAvail || (cooldownLeft === 0 && player.lingshi >= SPIN_COST));
  const canMultiSpin = !spinning && player.lingshi >= MULTI_SPIN_COST;

  const fmtCd = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const slots = getSlots(player.level);

  const addToHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(prev => {
      const next = [...entries, ...prev].slice(0, 20);
      saveHistory(next);
      return next;
    });
  }, []);

  const doSpin = () => {
    if (!canSpin) return;
    const isFree = freeAvail;
    if (!isFree) {
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi - SPIN_COST } }));
    }
    setSpinning(true);
    setResult(null);
    setMultiResults(null);

    setTimeout(() => {
      const idx = weightedRandom(slots);
      const desc = slots[idx].reward();
      const entry: HistoryEntry = { emoji: slots[idx].emoji, desc, time: Date.now(), rarity: slots[idx].rarity };
      setResult(`${slots[idx].emoji} ${desc}`);
      addToHistory([entry]);
      setSpinning(false);
      if (isFree) {
        markFreeUsed();
        setFreeAvail(false);
      } else {
        const t = Date.now();
        setLastSpin(t);
        localStorage.setItem(SAVE_KEY, String(t));
      }
      useGameStore.getState().save();
    }, 1500);
  };

  const doMultiSpin = () => {
    if (!canMultiSpin) return;
    useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi - MULTI_SPIN_COST } }));
    setSpinning(true);
    setResult(null);
    setMultiResults(null);

    setTimeout(() => {
      const results: HistoryEntry[] = [];
      let hasRare = false;
      for (let i = 0; i < MULTI_SPIN_COUNT; i++) {
        // Last spin: guarantee rare+ if none yet
        const idx = (i === MULTI_SPIN_COUNT - 1 && !hasRare)
          ? weightedRandomGuaranteeRare(slots)
          : weightedRandom(slots);
        const desc = slots[idx].reward();
        if (slots[idx].rarity !== 'common') hasRare = true;
        results.push({ emoji: slots[idx].emoji, desc, time: Date.now(), rarity: slots[idx].rarity });
      }
      setMultiResults(results);
      addToHistory(results);
      setSpinning(false);
      const t = Date.now();
      setLastSpin(t);
      localStorage.setItem(SAVE_KEY, String(t));
      useGameStore.getState().save();
    }, 2000);
  };

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">🎡 天道轮盘</h3>
      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
        {freeAvail ? '🎁 每日免费转盘可用！' : `消耗 ${formatNumber(SPIN_COST)} 灵石转动，每小时1次`}
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
            border: `1px solid ${RARITY_COLORS[s.rarity]}40`,
            transition: 'background 0.3s',
          }}>
            <div style={{ fontSize: 20 }}>{s.emoji}</div>
            <div style={{ color: RARITY_COLORS[s.rarity] }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Single result */}
      {result && !multiResults && (
        <div style={{
          textAlign: 'center', padding: '12px 16px', marginBottom: 12, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,100,50,0.1))',
          border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', fontSize: 14,
          animation: 'dropIn 0.3s ease-out',
        }}>
          🎉 {result}
        </div>
      )}

      {/* Multi-spin results */}
      {multiResults && (
        <div style={{
          padding: '12px', marginBottom: 12, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(168,130,255,0.1), rgba(255,215,0,0.1))',
          border: '1px solid rgba(168,130,255,0.3)',
        }}>
          <div style={{ fontWeight: 700, color: '#ffd700', marginBottom: 8, textAlign: 'center' }}>
            🎊 {MULTI_SPIN_COUNT}连抽结果
          </div>
          {multiResults.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '3px 0',
              borderBottom: i < multiResults.length - 1 ? '1px solid var(--border)' : 'none',
              color: RARITY_COLORS[r.rarity],
              fontSize: 12,
            }}>
              <span>{r.emoji} {r.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Spin buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {freeAvail ? (
          <button
            className="sign-in-btn pulse-glow"
            onClick={doSpin}
            disabled={spinning}
            style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }}
          >
            {spinning ? '🌀 转动中...' : '🎁 免费转一次（每日1次）'}
          </button>
        ) : cooldownLeft > 0 && !canMultiSpin ? (
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
            {spinning ? '🌀 转动中...' : `🎡 单抽（${formatNumber(SPIN_COST)} 灵石）`}
          </button>
        )}

        {/* Multi-spin button */}
        <button
          className="sign-in-btn"
          onClick={doMultiSpin}
          disabled={!canMultiSpin}
          style={{
            opacity: canMultiSpin ? 1 : 0.4,
            background: canMultiSpin ? 'linear-gradient(135deg, #7c3aed, #f59e0b)' : 'var(--panel)',
            border: canMultiSpin ? 'none' : '1px solid var(--border)',
            color: canMultiSpin ? '#fff' : 'var(--dim)',
          }}
        >
          {spinning ? '🌀 连抽中...' : `🎊 ${MULTI_SPIN_COUNT}连抽（${formatNumber(MULTI_SPIN_COST)} 灵石，保底稀有）`}
        </button>
      </div>

      {player.lingshi < SPIN_COST && !freeAvail && !spinning && (
        <div style={{ textAlign: 'center', color: '#f44', fontSize: 12, marginTop: 8 }}>
          灵石不足（需要 {formatNumber(SPIN_COST)}）
        </div>
      )}

      {/* History */}
      <div style={{ marginTop: 16 }}>
        <div style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}
          onClick={() => setShowHistory(!showHistory)}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>📜 抽奖记录</span>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>{showHistory ? '▲' : '▼'} {history.length}条</span>
        </div>
        {showHistory && history.length > 0 && (
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {history.map((h, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                borderBottom: '1px solid var(--border)', fontSize: 11,
              }}>
                <span style={{ color: RARITY_COLORS[h.rarity] }}>{h.emoji} {h.desc}</span>
                <span style={{ color: 'var(--dim)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {new Date(h.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
        {showHistory && history.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 12, padding: 12 }}>暂无记录</div>
        )}
      </div>
    </div>
  );
}
