import { useEffect } from 'react';
import { useDailyStore, DAILY_REWARDS_DATA } from '../store/dailyStore';
import { useGameStore } from '../store/gameStore';

export function DailyPanel() {
  const { currentDay, totalSignIns, canSignIn, checkCanSignIn, signIn } = useDailyStore();

  useEffect(() => { checkCanSignIn(); }, [checkCanSignIn]);

  const handleSignIn = () => {
    const result = signIn();
    if (!result) return;
    const r = result.reward;
    // Apply rewards directly via setState
    useGameStore.setState(state => {
      const p = { ...state.player };
      if (r.lingshi) p.lingshi += r.lingshi;
      if (r.pantao) p.pantao += r.pantao;
      if (r.shards) p.hongmengShards += r.shards;
      if (r.scrollType === 'tianming') p.tianmingScrolls += 1;
      if (r.scrollType === 'lucky') p.luckyScrolls += 1;
      // v53.0: Consumable rewards
      if (r.consumable) {
        const inv = { ...(p.consumableInventory ?? {}) };
        inv[r.consumable.id] = (inv[r.consumable.id] ?? 0) + r.consumable.count;
        p.consumableInventory = inv;
      }
      return { player: p };
    });
    useGameStore.getState().save();
  };

  const todayIndex = (currentDay - 1) % 7;

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">📅 每日签到</h3>
      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
        累计签到 {totalSignIns} 天
      </div>

      <div className="daily-grid">
        {DAILY_REWARDS_DATA.map((r, i) => {
          const isPast = i < todayIndex;
          const isToday = i === todayIndex;
          const signed = isToday && !canSignIn;

          return (
            <div key={i} className={`daily-cell ${signed || isPast ? 'signed' : ''} ${isToday && canSignIn ? 'today' : ''} ${!signed && !isPast && !isToday ? 'future' : ''}`}>
              <div className="daily-day">第{r.day}天</div>
              <div className="daily-reward">{r.desc}</div>
              {(signed || isPast) && <div className="daily-check">✓</div>}
              {isToday && canSignIn && <div className="daily-available">可领</div>}
            </div>
          );
        })}
      </div>

      {canSignIn ? (
        <button className="sign-in-btn pulse-glow" onClick={handleSignIn}>
          🎁 签到领取 — {DAILY_REWARDS_DATA[todayIndex].desc}
        </button>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '16px 0', fontSize: 13 }}>
          ✅ 今日已签到，明天再来！
        </div>
      )}
    </div>
  );
}
