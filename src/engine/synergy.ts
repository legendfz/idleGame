/**
 * SynergyEngine — 系统联动buff
 * 跨系统加成映射，汇总到统一buff接口
 */

export interface SynergyInput {
  talentUsedPoints: number;
  skillTotalLevels: number;
  achievementCount: number;
  towerHighestFloor: number;
  reincarnationCount: number;
  petLevel: number; // 出战灵兽等级
}

export interface SynergyBuffs {
  forgeRate: number;      // 天赋点→锻造成功率
  petPower: number;       // 神通等级→灵兽战力
  shopDiscount: number;   // 成就数→商店折扣%
  questRewardMul: number; // 塔层→任务奖励倍率
  petMaxLevel: number;    // 转世次数→灵兽等级上限加成
}

/**
 * 计算系统联动buff
 */
export function calcSynergyBuffs(input: SynergyInput): SynergyBuffs {
  return {
    // 每10天赋点 → 锻造成功率+1%
    forgeRate: Math.floor(input.talentUsedPoints / 10),
    // 每5神通总等级 → 灵兽战力+3%
    petPower: Math.floor(input.skillTotalLevels / 5) * 3,
    // 每10成就 → 商店折扣1%（最多10%）
    shopDiscount: Math.min(10, Math.floor(input.achievementCount / 10)),
    // 每20塔层 → 任务奖励+5%
    questRewardMul: Math.floor(input.towerHighestFloor / 20) * 5,
    // 每次转世 → 灵兽等级上限+1（不超过+5）
    petMaxLevel: Math.min(5, input.reincarnationCount),
  };
}
