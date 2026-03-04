/**
 * Achievement Toast notification
 */

import { useEffect, useState } from 'react';
import { useAchievementStore } from '../store/achievementStore';
import { AchievementDef } from '../data/achievements';

export default function AchievementToast() {
  const consumeToast = useAchievementStore(s => s.consumeToast);
  const [current, setCurrent] = useState<AchievementDef | null>(null);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (current) return;
    const interval = setInterval(() => {
      const toast = consumeToast();
      if (toast) {
        setCurrent(toast);
        setDismissing(false);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [current, consumeToast]);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      setDismissing(true);
      setTimeout(() => setCurrent(null), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [current]);

  if (!current) return null;

  return (
    <div
      className={`achievement-toast ${dismissing ? 'dismissing' : ''}`}
      onClick={() => {
        setDismissing(true);
        setTimeout(() => setCurrent(null), 300);
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 'bold' }}>★ 成就达成！</div>
      <div style={{ fontSize: 14, marginTop: 2 }}>
        {current.icon} {current.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
        奖励: {current.reward.description}
      </div>
    </div>
  );
}
