import { ConsumableBuff } from '../types';

export const CONSUMABLE_BUFFS: ConsumableBuff[] = [
  {
    id: 'exp_pill',
    name: '悟道丹',
    emoji: '📗',
    description: '经验获取+100%，持续5分钟',
    durationSec: 300,
    effect: { expMult: 1.0 },
  },
  {
    id: 'gold_pill',
    name: '聚宝丹',
    emoji: '📙',
    description: '灵石获取+100%，持续5分钟',
    durationSec: 300,
    effect: { goldMult: 1.0 },
  },
  {
    id: 'drop_pill',
    name: '天运丹',
    emoji: '📕',
    description: '装备掉率+50%，持续3分钟',
    durationSec: 180,
    effect: { dropRateMult: 0.5 },
  },
  {
    id: 'atk_pill',
    name: '狂暴丹',
    emoji: '💊',
    description: '攻击力+50%，持续3分钟',
    durationSec: 180,
    effect: { atkMult: 0.5 },
  },
  {
    id: 'crit_pill',
    name: '破军丹',
    emoji: '💎',
    description: '暴击率+20%，持续3分钟',
    durationSec: 180,
    effect: { critRateAdd: 20 },
  },
  {
    id: 'mega_pill',
    name: '混元仙丹',
    emoji: '🌟',
    description: '全属性+50%/经验+200%，持续2分钟',
    durationSec: 120,
    effect: { expMult: 2.0, goldMult: 1.0, atkMult: 0.5, critRateAdd: 15 },
  },
];

export function getConsumable(id: string): ConsumableBuff | undefined {
  return CONSUMABLE_BUFFS.find(b => b.id === id);
}
