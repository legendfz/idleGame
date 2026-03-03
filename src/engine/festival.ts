/**
 * FestivalEngine — 活动增强: 3类新模板
 */

export type FestivalType = 'xiuweiRace' | 'bossRaid' | 'treasureHunt';

export interface FestivalDef {
  type: FestivalType;
  name: string;
  icon: string;
  desc: string;
  durationSec: number;
  trackType: string; // 追踪类型
  rewardTiers: { threshold: number; reward: { coins: number; merit: number } }[];
}

export interface FestivalState {
  active: FestivalInstance | null;
  lastCheckTime: number;
  history: number; // 参与次数
}

export interface FestivalInstance {
  type: FestivalType;
  name: string;
  icon: string;
  desc: string;
  startTime: number;
  endTime: number;
  trackType: string;
  score: number;
  rewardTiers: FestivalDef['rewardTiers'];
  claimed: boolean[];
}

export const FESTIVAL_DEFS: FestivalDef[] = [
  {
    type: 'xiuweiRace', name: '修炼竞速', icon: '🏃', desc: '限时内获取尽可能多的修为',
    durationSec: 3600,
    trackType: 'xiuwei',
    rewardTiers: [
      { threshold: 10000, reward: { coins: 5000, merit: 20 } },
      { threshold: 50000, reward: { coins: 15000, merit: 50 } },
      { threshold: 200000, reward: { coins: 50000, merit: 100 } },
    ],
  },
  {
    type: 'bossRaid', name: 'Boss共伐', icon: '👹', desc: '限时内击杀尽可能多的Boss',
    durationSec: 3600,
    trackType: 'kills',
    rewardTiers: [
      { threshold: 10, reward: { coins: 3000, merit: 15 } },
      { threshold: 30, reward: { coins: 10000, merit: 40 } },
      { threshold: 100, reward: { coins: 30000, merit: 80 } },
    ],
  },
  {
    type: 'treasureHunt', name: '寻宝夺旗', icon: '🏴', desc: '限时内采集+锻造积分最高',
    durationSec: 7200,
    trackType: 'craft',
    rewardTiers: [
      { threshold: 5, reward: { coins: 4000, merit: 20 } },
      { threshold: 15, reward: { coins: 12000, merit: 50 } },
      { threshold: 50, reward: { coins: 40000, merit: 100 } },
    ],
  },
];

export function createFestivalState(): FestivalState {
  return { active: null, lastCheckTime: Date.now(), history: 0 };
}

export function startFestival(def: FestivalDef): FestivalInstance {
  const now = Date.now();
  return {
    type: def.type, name: def.name, icon: def.icon, desc: def.desc,
    startTime: now, endTime: now + def.durationSec * 1000,
    trackType: def.trackType, score: 0,
    rewardTiers: def.rewardTiers,
    claimed: def.rewardTiers.map(() => false),
  };
}

export function checkFestivalEnd(state: FestivalState): FestivalState {
  if (state.active && Date.now() >= state.active.endTime) {
    return { ...state, active: null, history: state.history + 1 };
  }
  return state;
}
