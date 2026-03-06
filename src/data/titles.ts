/**
 * v81.0 Title System — 称号系统
 * Unlock titles through gameplay milestones, equip for stat bonuses
 */

export interface Title {
  id: string;
  name: string;
  desc: string;
  color: string; // CSS color for display
  condition: (stats: TitleCheckStats) => boolean;
  bonuses: { attack?: number; maxHp?: number; critRate?: number; critDmg?: number; expMul?: number; goldMul?: number };
}

export interface TitleCheckStats {
  level: number;
  reincarnations: number;
  totalKills: number;
  highestChapter: number;
  achievementCount: number;
  equipmentCollected: number;
  monsterCollected: number;
  trialBestFloor: number;
  totalPlayTimeSec: number;
  awakeningPoints: number;
}

export const TITLES: Title[] = [
  // Level-based
  { id: 'novice', name: '初入仙途', desc: '达到10级', color: '#aaa',
    condition: s => s.level >= 10, bonuses: { attack: 0.05 } },
  { id: 'warrior', name: '修行者', desc: '达到50级', color: '#4fc3f7',
    condition: s => s.level >= 50, bonuses: { attack: 0.1, maxHp: 0.1 } },
  { id: 'master', name: '一代宗师', desc: '达到200级', color: '#ab47bc',
    condition: s => s.level >= 200, bonuses: { attack: 0.15, critRate: 5 } },
  { id: 'immortal', name: '飞升仙人', desc: '达到500级', color: '#ff9800',
    condition: s => s.level >= 500, bonuses: { attack: 0.2, maxHp: 0.2, critDmg: 0.3 } },
  { id: 'supreme', name: '无上至尊', desc: '达到1000级', color: '#f44336',
    condition: s => s.level >= 1000, bonuses: { attack: 0.3, maxHp: 0.3, critRate: 10, critDmg: 0.5 } },

  // Reincarnation-based
  { id: 'reborn', name: '轮回新生', desc: '首次转世', color: '#26c6da',
    condition: s => s.reincarnations >= 1, bonuses: { expMul: 0.1 } },
  { id: 'sage', name: '三世修行', desc: '转世3次', color: '#7e57c2',
    condition: s => s.reincarnations >= 3, bonuses: { expMul: 0.2, goldMul: 0.1 } },
  { id: 'eternal', name: '万劫不灭', desc: '转世10次', color: '#ffd740',
    condition: s => s.reincarnations >= 10, bonuses: { attack: 0.25, expMul: 0.3, goldMul: 0.2 } },

  // Kill-based
  { id: 'slayer', name: '百妖斩', desc: '击杀100个敌人', color: '#ef5350',
    condition: s => s.totalKills >= 100, bonuses: { attack: 0.05 } },
  { id: 'demon_king', name: '万妖之主', desc: '击杀10000个敌人', color: '#d32f2f',
    condition: s => s.totalKills >= 10000, bonuses: { attack: 0.15, critRate: 5 } },

  // Collection-based
  { id: 'collector', name: '博物学家', desc: '收集20种装备', color: '#66bb6a',
    condition: s => s.equipmentCollected >= 20, bonuses: { goldMul: 0.15 } },
  { id: 'bestiary', name: '妖怪百科', desc: '遭遇30种妖怪', color: '#ff7043',
    condition: s => s.monsterCollected >= 30, bonuses: { expMul: 0.15 } },

  // Chapter-based
  { id: 'traveler', name: '西行求法', desc: '通关第5章', color: '#29b6f6',
    condition: s => s.highestChapter >= 5, bonuses: { attack: 0.1, maxHp: 0.1 } },
  { id: 'abyss_walker', name: '深渊行者', desc: '进入无尽深渊', color: '#e040fb',
    condition: s => s.highestChapter >= 9, bonuses: { attack: 0.2, critDmg: 0.4 } },

  // Trial-based
  { id: 'trial_5', name: '试炼勇者', desc: '试炼通关5层', color: '#8d6e63',
    condition: s => s.trialBestFloor >= 5, bonuses: { attack: 0.1 } },
  { id: 'trial_15', name: '劫境强者', desc: '试炼通关15层', color: '#ff6f00',
    condition: s => s.trialBestFloor >= 15, bonuses: { attack: 0.2, critRate: 8, critDmg: 0.3 } },

  // Time-based
  { id: 'veteran', name: '仙途老兵', desc: '游戏时长达1小时', color: '#78909c',
    condition: s => s.totalPlayTimeSec >= 3600, bonuses: { expMul: 0.05 } },
  { id: 'dedicated', name: '道心坚定', desc: '游戏时长达10小时', color: '#ffc107',
    condition: s => s.totalPlayTimeSec >= 36000, bonuses: { attack: 0.1, expMul: 0.1, goldMul: 0.1 } },
];
