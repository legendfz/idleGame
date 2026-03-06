import { Realm } from '../types';

export const REALMS: Realm[] = [
  { name: '灵猴初醒', levelReq: 1,   pantaoReq: 0,    description: '石破天惊，灵猴出世', bonus: '基础攻击' },
  { name: '通灵',     levelReq: 10,  pantaoReq: 5,    description: '通灵开窍，初识天地', bonus: '自动战斗' },
  { name: '炼气',     levelReq: 30,  pantaoReq: 20,   description: '吐纳天地灵气', bonus: '技能栏×1' },
  { name: '筑基',     levelReq: 60,  pantaoReq: 80,   description: '筑基成功，脱胎换骨', bonus: '队友栏×1' },
  { name: '金丹',     levelReq: 100, pantaoReq: 200,  description: '金丹大成', bonus: '法宝栏×1' },
  { name: '元婴',     levelReq: 200, pantaoReq: 500,  description: '元婴出窍', bonus: '离线收益×2' },
  { name: '化神',     levelReq: 350, pantaoReq: 1200, description: '化神合道', bonus: '技能栏×2' },
  { name: '大乘',     levelReq: 500, pantaoReq: 3000, description: '大乘圆满', bonus: '转世系统' },
  { name: '齐天大圣', levelReq: 800, pantaoReq: 8000, description: '齐天大圣，到此一游！', bonus: '全属性×5' },
  { name: '斗战胜佛', levelReq: 1500, pantaoReq: 20000, description: '终成正果', bonus: '终极形态' },
  { name: '混元金仙', levelReq: 2500, pantaoReq: 50000, description: '混元一气，金仙之体', bonus: '全属性×8' },
  { name: '太乙真仙', levelReq: 4000, pantaoReq: 120000, description: '太乙雷池，真仙降世', bonus: '全属性×12' },
  { name: '大罗金仙', levelReq: 6000, pantaoReq: 300000, description: '大罗天宫，万法归一', bonus: '全属性×20' },
  { name: '准圣', levelReq: 8000, pantaoReq: 800000, description: '圣人之下第一人', bonus: '全属性×35' },
  { name: '天道圣人', levelReq: 9999, pantaoReq: 2000000, description: '合道天地，永恒不灭', bonus: '至高无上' },
];
