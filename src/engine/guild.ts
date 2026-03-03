/**
 * GuildEngine — 仙盟系统
 */

export interface GuildMember {
  name: string;
  icon: string;
  contribution: number;
  isPlayer: boolean;
}

export interface GuildQuest {
  id: string;
  name: string;
  desc: string;
  trackType: string; // kills/forges/gathers/xiuwei/clicks
  target: number;
  progress: number;
  reward: { contribution: number; coins: number };
  claimed: boolean;
}

export interface GuildState {
  name: string;
  level: number; // 1-10
  exp: number;
  joined: boolean;
  contribution: number; // 个人贡献点
  members: GuildMember[];
  warehouse: Record<string, number>; // materialId -> count
  quests: GuildQuest[];
  questResetTime: number;
}

// NPC 成员
const NPC_MEMBERS: Omit<GuildMember, 'contribution'>[] = [
  { name: '太乙真人', icon: '🧙', isPlayer: false },
  { name: '镇元子', icon: '🌳', isPlayer: false },
  { name: '菩提祖师', icon: '📿', isPlayer: false },
  { name: '南极仙翁', icon: '👴', isPlayer: false },
  { name: '赤脚大仙', icon: '👣', isPlayer: false },
  { name: '黎山老母', icon: '👵', isPlayer: false },
  { name: '福禄寿三星', icon: '⭐', isPlayer: false },
];

const QUEST_POOL: Omit<GuildQuest, 'id' | 'progress' | 'claimed'>[] = [
  { name: '除魔卫道', desc: '击杀20个妖怪', trackType: 'kills', target: 20, reward: { contribution: 30, coins: 2000 } },
  { name: '勤修不辍', desc: '点击修炼100次', trackType: 'clicks', target: 100, reward: { contribution: 20, coins: 1000 } },
  { name: '铸器大师', desc: '锻造5次', trackType: 'forges', target: 5, reward: { contribution: 40, coins: 3000 } },
  { name: '采药寻宝', desc: '采集3次', trackType: 'gathers', target: 3, reward: { contribution: 25, coins: 1500 } },
  { name: '秘境探险', desc: '通关秘境2次', trackType: 'dungeons', target: 2, reward: { contribution: 50, coins: 5000 } },
  { name: '塔中试炼', desc: '通天塔挑战5次', trackType: 'tower', target: 5, reward: { contribution: 35, coins: 2500 } },
];

export function createGuildState(): GuildState {
  return {
    name: '', level: 1, exp: 0, joined: false, contribution: 0,
    members: [], warehouse: {}, quests: [], questResetTime: 0,
  };
}

export function guildLevelExp(level: number): number {
  return Math.floor(500 * Math.pow(level, 2));
}

/** 仙盟被动: 修炼速度 +5%/级 */
export function calcGuildBuffs(level: number, joined: boolean): Record<string, number> {
  if (!joined) return {};
  return { xiuweiPercent: level * 5 };
}

export function generateGuildQuests(): GuildQuest[] {
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((q, i) => ({
    ...q, id: `gq_${Date.now()}_${i}`, progress: 0, claimed: false,
  }));
}

export function createGuildWithNPCs(name: string): Partial<GuildState> {
  const members: GuildMember[] = [
    { name: '悟空', icon: '🐒', contribution: 0, isPlayer: true },
    ...NPC_MEMBERS.slice(0, 4 + Math.floor(Math.random() * 3)).map(m => ({
      ...m, contribution: Math.floor(Math.random() * 500),
    })),
  ];
  return {
    name, joined: true, members,
    quests: generateGuildQuests(),
    questResetTime: Date.now() + 24 * 3600 * 1000,
  };
}
