/**
 * v87.0 天道考验 — Ascension Challenges
 * Weekly rotating hard-mode challenges with modifiers for bonus rewards
 */

export interface ChallengeModifier {
  id: string;
  name: string;
  desc: string;
  icon: string;
  // multipliers applied during challenge
  enemyHpMult: number;
  enemyAtkMult: number;
  playerAtkMult: number;
  playerDefMult: number;
  rewardMult: number; // bonus reward multiplier
}

export interface AscensionChallenge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  modifiers: string[]; // modifier ids
  waves: number; // enemies to defeat
  levelReq: number;
  rewards: {
    lingshi: number; // base, scaled by level
    pantao: number;
    shards: number;
    trialTokens: number;
    daoPoints: number;
  };
}

export const MODIFIERS: ChallengeModifier[] = [
  { id: 'ironSkin', name: '铁壁', desc: '敌人生命×3', icon: '🛡️', enemyHpMult: 3, enemyAtkMult: 1, playerAtkMult: 1, playerDefMult: 1, rewardMult: 1.5 },
  { id: 'berserk', name: '狂暴', desc: '敌人攻击×2', icon: '🔥', enemyHpMult: 1, enemyAtkMult: 2, playerAtkMult: 1, playerDefMult: 1, rewardMult: 1.5 },
  { id: 'fragile', name: '脆弱', desc: '你的攻击-50%', icon: '💔', enemyHpMult: 1, enemyAtkMult: 1, playerAtkMult: 0.5, playerDefMult: 1, rewardMult: 1.5 },
  { id: 'exposed', name: '破防', desc: '你的防御-80%', icon: '⚡', enemyHpMult: 1, enemyAtkMult: 1, playerAtkMult: 1, playerDefMult: 0.2, rewardMult: 1.3 },
  { id: 'swarm', name: '蜂拥', desc: '敌人数量×2', icon: '🐝', enemyHpMult: 1, enemyAtkMult: 1, playerAtkMult: 1, playerDefMult: 1, rewardMult: 1.8 },
  { id: 'titanic', name: '巨化', desc: '敌人HP×5 攻击×1.5', icon: '🗿', enemyHpMult: 5, enemyAtkMult: 1.5, playerAtkMult: 1, playerDefMult: 1, rewardMult: 2.0 },
  { id: 'cursed', name: '诅咒', desc: '攻击-30% 防御-50%', icon: '☠️', enemyHpMult: 1, enemyAtkMult: 1, playerAtkMult: 0.7, playerDefMult: 0.5, rewardMult: 1.6 },
  { id: 'elite', name: '精英', desc: '全属性强化', icon: '👑', enemyHpMult: 2, enemyAtkMult: 1.5, playerAtkMult: 0.8, playerDefMult: 0.8, rewardMult: 2.5 },
];

// Generate daily challenges based on date seed
export function getDailyChallenges(): AscensionChallenge[] {
  const now = new Date();
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  
  // Simple seeded random
  let seed = daySeed;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  
  // Pick 3 challenges with different modifier combos
  const challenges: AscensionChallenge[] = [];
  const modIds = MODIFIERS.map(m => m.id);
  
  const names = ['试炼·初', '试炼·承', '试炼·极'];
  const icons = ['⚔️', '🗡️', '🔱'];
  const descs = ['初级天道考验', '中级天道考验', '极限天道考验'];
  
  for (let i = 0; i < 3; i++) {
    const numMods = i + 1; // 1, 2, 3 modifiers
    const picked: string[] = [];
    const available = [...modIds];
    for (let j = 0; j < numMods && available.length > 0; j++) {
      const idx = Math.floor(rand() * available.length);
      picked.push(available.splice(idx, 1)[0]);
    }
    
    const totalRewardMult = picked.reduce((acc, id) => {
      const mod = MODIFIERS.find(m => m.id === id)!;
      return acc * mod.rewardMult;
    }, 1);
    
    challenges.push({
      id: `challenge-${daySeed}-${i}`,
      name: names[i],
      desc: descs[i],
      icon: icons[i],
      modifiers: picked,
      waves: 10 + i * 10, // 10, 20, 30 waves
      levelReq: [50, 150, 500][i],
      rewards: {
        lingshi: Math.floor(5000 * totalRewardMult),
        pantao: Math.floor(50 * totalRewardMult),
        shards: Math.floor(10 * totalRewardMult),
        trialTokens: Math.floor(5 * totalRewardMult),
        daoPoints: i >= 2 ? Math.floor(3 * totalRewardMult) : 0,
      },
    });
  }
  
  return challenges;
}

// Get combined modifiers for a challenge
export function getCombinedModifiers(modifierIds: string[]) {
  let enemyHpMult = 1, enemyAtkMult = 1, playerAtkMult = 1, playerDefMult = 1;
  for (const id of modifierIds) {
    const mod = MODIFIERS.find(m => m.id === id);
    if (mod) {
      enemyHpMult *= mod.enemyHpMult;
      enemyAtkMult *= mod.enemyAtkMult;
      playerAtkMult *= mod.playerAtkMult;
      playerDefMult *= mod.playerDefMult;
    }
  }
  return { enemyHpMult, enemyAtkMult, playerAtkMult, playerDefMult };
}
