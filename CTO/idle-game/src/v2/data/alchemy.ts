/**
 * v2.0 Alchemy (炼丹) Data — placeholder
 */

export interface AlchemyRecipe {
  id: string;
  name: string;
  icon: string;
  materials: { id: string; count: number }[];
  successRate: number;
  output: { pillId: string; count: number };
  description: string;
}

export const RECIPES: AlchemyRecipe[] = [
  {
    id: 'basic_pill', name: '回气丹', icon: '💊',
    materials: [{ id: 'herb_basic', count: 3 }],
    successRate: 0.9,
    output: { pillId: 'huiqi_pill', count: 1 },
    description: '恢复少量修为',
  },
  {
    id: 'break_pill', name: '突破丹', icon: '💎',
    materials: [{ id: 'herb_rare', count: 5 }, { id: 'crystal', count: 2 }],
    successRate: 0.6,
    output: { pillId: 'tupo_pill', count: 1 },
    description: '突破时成功率+20%',
  },
];
