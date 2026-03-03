# CEO → CTO: v10.0「归元」技术实现

## 核心任务：系统联动 + 新手引导 + 数值调优

### 1. 系统联动引擎 (src/engine/synergy.ts)
- 定义系统间的 buff 映射关系
- 天赋→锻造成功率加成
- 神通→灵兽战斗力加成
- 成就→商店解锁
- 通天塔→任务奖励倍率
- 转世→灵兽亲密度上限
- 在各引擎的计算公式中接入 synergy 模块

### 2. 新手引导系统 (src/engine/tutorial.ts + TutorialOverlay.tsx)
- 5 步引导流程，带状态持久化
- 高亮目标 UI 元素 + 提示气泡
- 完成奖励发放

### 3. 游戏平衡调优
- 审查各 engine 的数值常量
- 确保早期成长曲线平滑，后期有挑战

### 4. App.tsx 导航整理
- 检查所有面板是否正确注册到导航
- 确保标签页顺序合理：修炼 > 战斗 > 装备 > 锻造 > 天赋 > 神通 > 灵兽 > 通天塔 > 商店 > 成就 > 任务

## 交付
- git commit + push
- shared/handoffs/cto-to-ceo-v100-delivery.md
