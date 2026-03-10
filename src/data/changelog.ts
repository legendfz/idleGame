// v202.0: In-game changelog
export interface ChangelogEntry {
  version: string;
  title: string;
  date: string;
  highlights: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v202.0', title: '仙途纪事', date: '2026-03-10',
    highlights: ['游戏内更新日志', '战斗页idle效率对比', '自动功能状态概览'],
  },
  {
    version: 'v201.0', title: '战场重塑', date: '2026-03-10',
    highlights: ['BattlePage深度拆分优化', '4个新子组件提取'],
  },
  {
    version: 'v200.0', title: '万道归一', date: '2026-03-10',
    highlights: ['成长回顾系统：35个旅程里程碑', '统计页旅程Tab'],
  },
  {
    version: 'v197.0', title: '仙途极速', date: '2026-03-09',
    highlights: ['连杀加速(30+×1.5/100+×2.0)', '连杀保护(死亡保留50%)'],
  },
  {
    version: 'v192.0', title: '仙途双修', date: '2026-03-09',
    highlights: ['转世后自动跳转对应等级章节', '道点分配后自动更新章节'],
  },
  {
    version: 'v188.0', title: '仙途快捷', date: '2026-03-09',
    highlights: ['战斗页快捷操作栏', '无需切Tab即可管理装备'],
  },
  {
    version: 'v180.0', title: '赛季通行证', date: '2026-03-09',
    highlights: ['30天赛季系统', '每日5赛季任务', '30级奖励轨道'],
  },
  {
    version: 'v178.0', title: '仙途天气', date: '2026-03-08',
    highlights: ['8种天气每小时轮换', '天气影响战斗属性'],
  },
  {
    version: 'v175.0', title: '五行之力', date: '2026-03-08',
    highlights: ['五行克制系统', '装备随机五行属性', '克制+30%/被克-25%'],
  },
  {
    version: 'v168.0', title: '仙途双栏', date: '2026-03-08',
    highlights: ['底部导航双行布局', '核心5tab+展开9功能tab'],
  },
  {
    version: 'v162.0', title: '词缀降世', date: '2026-03-08',
    highlights: ['装备副属性系统', '8种词缀按品质阶梯'],
  },
  {
    version: 'v155.0', title: '仙途璀璨', date: '2026-03-08',
    highlights: ['宝石镶嵌系统', '6种宝石×10级', 'Boss掉落宝石'],
  },
  {
    version: 'v151.0', title: '精英降临', date: '2026-03-08',
    highlights: ['精英敌人系统', '8种修饰器', '精英保底掉落'],
  },
  {
    version: 'v118.0', title: '周天秘境', date: '2026-03-07',
    highlights: ['每周Boss连战5层', '实时战斗系统'],
  },
  {
    version: 'v116.0', title: '超越轮回', date: '2026-03-07',
    highlights: ['第二层转世系统', '8种超越加成×20级'],
  },
  {
    version: 'v101.0', title: '仙途传说', date: '2026-03-06',
    highlights: ['14段西游记剧情', '等级+转世触发故事'],
  },
  {
    version: 'v55.0', title: '万劫轮回', date: '2026-03-04',
    highlights: ['Roguelike试炼系统', '12种修饰器随机3选1'],
  },
  {
    version: 'v22.0', title: '天命轮回', date: '2026-03-03',
    highlights: ['转世系统', '道点商店永久加成'],
  },
  {
    version: 'v1.0', title: '初出茅庐', date: '2026-03-01',
    highlights: ['西游·悟空传 首发', '战斗/装备/境界/离线收益'],
  },
];
