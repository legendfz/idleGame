/**
 * LeaderboardEngine — NPC排行 + 玩家排名
 */

export interface LeaderboardEntry {
  name: string;
  icon: string;
  realmOrder: number;
  realmName: string;
  power: number;
  isPlayer?: boolean;
}

const NPC_NAMES = [
  { name: '牛魔王', icon: '🐂' }, { name: '铁扇公主', icon: '🌀' },
  { name: '金角大王', icon: '👑' }, { name: '银角大王', icon: '🥈' },
  { name: '黄风怪', icon: '🌪️' }, { name: '白骨精', icon: '💀' },
  { name: '蝎子精', icon: '🦂' }, { name: '蜈蚣精', icon: '🐛' },
  { name: '黄袍怪', icon: '👘' }, { name: '青牛精', icon: '🐃' },
  { name: '六耳猕猴', icon: '🐵' }, { name: '大鹏鸟', icon: '🦅' },
  { name: '九头虫', icon: '🐉' }, { name: '黑熊精', icon: '🐻' },
  { name: '灵感大王', icon: '🐢' }, { name: '奎木狼', icon: '🐺' },
  { name: '独角兕', icon: '🦏' }, { name: '赤脚大仙', icon: '👣' },
  { name: '卷帘大将', icon: '📜' },
];

const REALM_NAMES = [
  '凡人', '练气', '筑基', '金丹', '元婴',
  '化神', '合体', '大乘', '渡劫', '地仙',
  '天仙', '金仙', '大罗', '圣人',
];

/**
 * 生成排行榜 (含NPC + 玩家)
 */
export function generateLeaderboard(
  playerName: string,
  playerRealmOrder: number,
  playerPower: number,
): LeaderboardEntry[] {
  // 基于玩家实力生成NPC分布
  const entries: LeaderboardEntry[] = [];

  // 生成19个NPC
  for (let i = 0; i < NPC_NAMES.length; i++) {
    const npc = NPC_NAMES[i];
    // NPC实力在玩家的30%-300%之间随机分布
    const ratio = 0.3 + Math.random() * 2.7;
    const npcPower = Math.floor(playerPower * ratio);
    const npcRealm = Math.min(13, Math.max(0, Math.floor(playerRealmOrder * ratio)));

    entries.push({
      name: npc.name,
      icon: npc.icon,
      realmOrder: npcRealm,
      realmName: REALM_NAMES[npcRealm] ?? '凡人',
      power: npcPower,
    });
  }

  // 加入玩家
  entries.push({
    name: playerName,
    icon: '🐒',
    realmOrder: playerRealmOrder,
    realmName: REALM_NAMES[playerRealmOrder] ?? '凡人',
    power: playerPower,
    isPlayer: true,
  });

  // 按power排序
  entries.sort((a, b) => b.power - a.power);

  return entries;
}
