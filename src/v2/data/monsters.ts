/**
 * v2.0 Monster Data — recruitable monsters placeholder
 */

export interface RecruitableMonster {
  id: string;
  name: string;
  icon: string;
  appearStage: number;
  recruitCondition: string;
  effect: { stat: string; value: number; description: string };
}

export const RECRUITABLE_MONSTERS: RecruitableMonster[] = [
  { id: 'black_bear', name: '黑熊精', icon: '🐻', appearStage: 3,
    recruitCondition: '击败3次', effect: { stat: 'defense', value: 0.1, description: '防御+10%' } },
  { id: 'yellow_wind', name: '黄风怪', icon: '🌪️', appearStage: 8,
    recruitCondition: '使用定风珠', effect: { stat: 'attack', value: 0.1, description: '风属性攻击+10%' } },
  { id: 'white_bone', name: '白骨精', icon: '💀', appearStage: 13,
    recruitCondition: '悟空专属任务', effect: { stat: 'critRate', value: 5, description: '暴击+5%' } },
  { id: 'red_boy', name: '红孩儿', icon: '👶', appearStage: 21,
    recruitCondition: '观音法水', effect: { stat: 'attack', value: 0.2, description: '三昧真火+20%攻击' } },
  { id: 'bull_king', name: '牛魔王', icon: '🐂', appearStage: 40,
    recruitCondition: '击败+铁扇公主剧情', effect: { stat: 'attack', value: 0.3, description: '力量+30%' } },
  { id: 'spider', name: '蜘蛛精', icon: '🕷️', appearStage: 55,
    recruitCondition: '击败5次', effect: { stat: 'speed', value: 0.15, description: '束缚减速+15%' } },
];
