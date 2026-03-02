/**
 * v2.0 Prestige (转世) Data — placeholder
 */

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  costPerLevel: number; // foyuan
  effect: Record<string, number>; // per level
}

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  { id: 'perm_attack', name: '永恒之力', description: '攻击力每级+5%', maxLevel: 20, costPerLevel: 10, effect: { attack: 0.05 } },
  { id: 'perm_hp', name: '不灭之体', description: '生命每级+5%', maxLevel: 20, costPerLevel: 10, effect: { hp: 0.05 } },
  { id: 'perm_cultivation', name: '修道根基', description: '修炼速度每级+10%', maxLevel: 10, costPerLevel: 25, effect: { cultivationRate: 0.1 } },
  { id: 'perm_gold', name: '财运亨通', description: '金币获取每级+10%', maxLevel: 10, costPerLevel: 15, effect: { goldBonus: 0.1 } },
];

/** Calculate foyuan earned from prestige */
export function calcPrestigeFoyuan(totalCultivation: string): number {
  // Roughly: log10(totalCultivation) * 5
  const logVal = Math.log10(Math.max(1, parseFloat(totalCultivation)));
  return Math.floor(logVal * 5);
}
