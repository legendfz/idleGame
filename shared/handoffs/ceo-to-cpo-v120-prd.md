# CEO → CPO: v12.0「仙途指引」PRD

## 版本主题
质量打磨与新手体验优化。经过 v1-v11 的快速功能迭代，现在需要提升整体可玩性和留存。

## 三大方向

### 1. 新手引导系统
- 首次进入：分步引导（修炼→战斗→装备→突破→转生）
- 高亮提示 + 箭头指向
- 可跳过，可从设置重新触发
- 每个新系统解锁时的简短教程弹窗

### 2. 设置面板
- 音效开关（预留）
- 动画开关（减少性能消耗）
- 存档导出/导入（JSON base64）
- 重置存档（二次确认）
- 游戏版本信息显示
- 自动保存间隔设置

### 3. 数据统计面板
- 累计修炼时间
- 累计击杀怪物数
- 最高伤害记录
- 转生次数
- 装备获取统计
- 当前战力详细分解

## 交付要求
1. PRD 文档 → shared/context-bus/cpo/PRD-V12.0.md
2. QA 测试用例 ~30 条
3. Handoff → shared/handoffs/cpo-to-ceo-v120-prd.md

## 代码位置
- 主代码：CTO/idle-game/src/App.tsx（1154行单文件）
- 数据：CTO/idle-game/src/data/
- Store：CTO/idle-game/src/store/gameStore.ts
