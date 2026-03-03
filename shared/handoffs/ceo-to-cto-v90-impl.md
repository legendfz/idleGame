# CEO → CTO: v9.0「悟道成仙」技术实现

## 需实现的三大系统

### 1. 天赋树引擎 (src/engine/talent.ts)
- TalentTree: 3路线×8节点，状态管理
- 天赋点获取（转世时）、分配、重置
- 各天赋的属性加成计算，接入现有战斗/修炼公式
- 持久化到 GameState

### 2. 神通技能引擎 (src/engine/skill.ts)
- 6个神通定义，5级升级系统
- 悟道值资源管理（击败Boss/通天塔/任务奖励）
- 被动加成 + 主动效果（带冷却时间）
- 主动效果：时限buff（如双倍掉落10min）

### 3. 战斗策略引擎 (src/engine/strategy.ts)
- 3套预设策略配置
- 策略影响自动战斗权重
- 解锁条件检查

### UI 面板
- TalentPanel.tsx — 天赋树可视化（3列路线，节点点亮）
- SkillPanel.tsx — 神通技能卡片网格
- StrategyPanel.tsx — 策略选择器
- 注册到 App.tsx 导航

### 注意
- 等 CPO 的 PRD 出来后参考数值，但可先搭架构
- 天赋加成必须接入 cultivation.ts 和 combat.ts 的计算公式
- git commit + push，交接 shared/handoffs/cto-to-ceo-v90-delivery.md
