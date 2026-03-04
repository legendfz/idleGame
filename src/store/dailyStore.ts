import { create } from 'zustand';

// 7-day sign-in cycle rewards
const DAILY_REWARDS = [
  { day: 1, lingshi: 5000,  pantao: 0,  shards: 0,  scrollType: null, desc: '灵石 ×5000' },
  { day: 2, lingshi: 0,     pantao: 5,  shards: 0,  scrollType: null, desc: '蟠桃 ×5' },
  { day: 3, lingshi: 10000, pantao: 0,  shards: 0,  scrollType: null, desc: '灵石 ×10000' },
  { day: 4, lingshi: 0,     pantao: 0,  shards: 5,  scrollType: null, desc: '鸿蒙碎片 ×5' },
  { day: 5, lingshi: 20000, pantao: 10, shards: 0,  scrollType: null, desc: '灵石×20000 + 蟠桃×10' },
  { day: 6, lingshi: 0,     pantao: 0,  shards: 0,  scrollType: 'tianming', desc: '天命符 ×1' },
  { day: 7, lingshi: 50000, pantao: 20, shards: 10, scrollType: 'lucky', desc: '豪华大礼：灵石×50000 + 蟠桃×20 + 碎片×10 + 幸运符×1' },
];

interface DailyState {
  // Streak tracking
  currentDay: number;      // 1-7 cycle position
  totalSignIns: number;    // lifetime count
  lastSignInDate: string;  // YYYY-MM-DD
  canSignIn: boolean;      // computed

  // Actions
  checkCanSignIn: () => void;
  signIn: () => { reward: typeof DAILY_REWARDS[0] } | null;
  load: () => void;
  save: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DAILY_REWARDS_DATA = DAILY_REWARDS;

export const useDailyStore = create<DailyState>((set, get) => ({
  currentDay: 1,
  totalSignIns: 0,
  lastSignInDate: '',
  canSignIn: true,

  checkCanSignIn: () => {
    const today = todayStr();
    set({ canSignIn: get().lastSignInDate !== today });
  },

  signIn: () => {
    const st = get();
    const today = todayStr();
    if (st.lastSignInDate === today) return null;

    const dayIndex = ((st.currentDay - 1) % 7);
    const reward = DAILY_REWARDS[dayIndex];
    const nextDay = (st.currentDay % 7) + 1;

    set({
      currentDay: nextDay,
      totalSignIns: st.totalSignIns + 1,
      lastSignInDate: today,
      canSignIn: false,
    });

    get().save();
    return { reward };
  },

  load: () => {
    try {
      const raw = localStorage.getItem('idlegame_daily');
      if (raw) {
        const data = JSON.parse(raw);
        const today = todayStr();
        // If missed more than 1 day, reset streak
        const last = data.lastSignInDate || '';
        let currentDay = data.currentDay || 1;
        if (last) {
          const diff = Math.floor((new Date(today).getTime() - new Date(last).getTime()) / 86400000);
          if (diff > 2) currentDay = 1; // reset streak after 2 days miss
        }
        set({
          currentDay,
          totalSignIns: data.totalSignIns || 0,
          lastSignInDate: last,
          canSignIn: last !== today,
        });
      }
    } catch {}
  },

  save: () => {
    const { currentDay, totalSignIns, lastSignInDate } = get();
    localStorage.setItem('idlegame_daily', JSON.stringify({ currentDay, totalSignIns, lastSignInDate }));
  },
}));
