/** v110.0 仙途百科 — 游戏内帮助系统 */

export interface GuideEntry {
  id: string;
  title: string;
  icon: string;
  unlockLevel: number;
  content: string;
}

export const GUIDE_ENTRIES: GuideEntry[] = [
  {
    id: 'battle', title: '战斗系统', icon: '⚔️', unlockLevel: 0,
    content: '自动战斗击杀敌人获取灵石和经验。点击屏幕可额外攻击。击杀Boss进入下一关。连杀10+获得额外奖励。战斗速度可从1x提升到10x。',
  },
  {
    id: 'equip', title: '装备系统', icon: '🗡️', unlockLevel: 0,
    content: '敌人掉落装备（武器/护甲/法宝三槽位）。品质从低到高：凡→灵→仙→神→混沌→鸿蒙。装备可强化+1~+15提升属性。三件同品质装备触发共鸣加成。',
  },
  {
    id: 'realm', title: '境界突破', icon: '🌟', unlockLevel: 0,
    content: '消耗蟠桃突破境界，大幅提升属性。突破需通过天劫挑战（限时击败天劫Boss）。境界从炼气→筑基→金丹→…→天道圣人。',
  },
  {
    id: 'chapter', title: '章节旅途', icon: '🗺️', unlockLevel: 0,
    content: '8大章节+无尽深渊。每章包含多个关卡和Boss。已通关章节可传送回去刷怪。一键扫荡快速获取奖励。',
  },
  {
    id: 'bag', title: '背包管理', icon: '🎒', unlockLevel: 5,
    content: '查看和管理装备。支持快速分解低品质装备获取碎片。装备合成：3件同品质合成1件更高品质。',
  },
  {
    id: 'pets', title: '灵兽系统', icon: '🐉', unlockLevel: 10,
    content: '5种神兽（青龙/凤凰/玄武/白虎/麒麟）。喂养蟠桃升级（最高50级）。出战灵兽100%加成，待机30%加成。转世保留灵兽等级。',
  },
  {
    id: 'achievement', title: '成就系统', icon: '🏆', unlockLevel: 10,
    content: '完成各种目标解锁成就奖励。成就提供永久属性加成和资源奖励。',
  },
  {
    id: 'sanctuary', title: '洞天福地', icon: '🏔️', unlockLevel: 20,
    content: '5种建筑（聚灵阵/炼丹房/藏经阁/演武场/灵田），每种最高10级。建筑提供持续的属性加成和资源产出。',
  },
  {
    id: 'exploration', title: '秘境探索', icon: '🌀', unlockLevel: 30,
    content: '随机事件链探索。4个难度等级，奖励按等级缩放。每次探索消耗秘境令或免费次数。',
  },
  {
    id: 'affinity', title: '仙缘系统', icon: '💕', unlockLevel: 40,
    content: '6位NPC仙缘好感度。赠礼提升好感（三档礼物）。好感度提供攻击/生命/暴击/经验/灵石等加成。',
  },
  {
    id: 'reincarnation', title: '转世轮回', icon: '🔄', unlockLevel: 50,
    content: '达到大乘境界(Lv.500)可转世。重置等级换取道点，购买永久加成。转世保留图鉴/灵兽/觉醒等进度。多次转世解锁转世里程碑加成。',
  },
  {
    id: 'trial', title: '轮回试炼', icon: '⚡', unlockLevel: 60,
    content: 'Roguelike模式：每层选祝福/诅咒修饰器。击败所有敌人获取令牌奖励。试炼商店用令牌兑换永久加成。',
  },
  {
    id: 'awakening', title: '觉醒系统', icon: '💫', unlockLevel: 80,
    content: '3次转世后解锁。战/法/运三条路线，各6个节点。觉醒点大幅增强属性。每次转世(3次起)获得觉醒点。',
  },
  {
    id: 'worldboss', title: '世界Boss', icon: '👹', unlockLevel: 0,
    content: '每2小时刷新一次，持续30分钟。5种世界Boss轮换。击败获得大量灵石/蟠桃/碎片/道点。可设置自动挑战。',
  },
  {
    id: 'daily', title: '每日活动', icon: '📅', unlockLevel: 0,
    content: '每日签到（7日循环奖励+累计里程碑）。每日挑战（3个随机目标）。天道考验（3级战斗挑战）。幸运转盘（消耗灵石抽奖）。',
  },
  {
    id: 'skills', title: '主动技能', icon: '🔥', unlockLevel: 20,
    content: '3个战斗技能：金刚不坏(Lv.20)、七十二变(Lv.50)、筋斗云(Lv.100)。可手动或自动释放。冷却完毕后可再次使用。',
  },
  {
    id: 'consumables', title: '丹药系统', icon: '💊', unlockLevel: 0,
    content: '6种丹药提供临时增益（经验/灵石/暴击/攻击等）。Boss击杀20%掉落丹药。可设置自动使用。',
  },
  {
    id: 'titles', title: '称号系统', icon: '👑', unlockLevel: 0,
    content: '19个称号通过达成特定条件解锁。装备称号获得永久属性加成。称号在战斗页境界名旁展示。',
  },
];
