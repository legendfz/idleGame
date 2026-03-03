---
date: 2026-03-02
from: CEO
to: CTO
type: task
status: 🔄 待执行
---

# v4.0「天道酬勤」— 技术实现

## 背景
在 CPO 完成 PRD 之前，先启动技术架构设计和基础脚手架。

## 三大系统

### 1. 成就系统 (Achievement)
- `src/engine/achievement.ts` — 成就定义 + 检测逻辑
- 30+ 成就，监听游戏事件（击杀/突破/锻造/采集等）
- `achievementStore` — Zustand store
- `src/components/views/AchievementView.tsx` — 成就面板

### 2. 每日任务 (DailyQuest)
- `src/engine/dailyQuest.ts` — 任务池 + 随机抽取 + 进度追踪
- 每日 00:00 重置（本地时间）
- `dailyQuestStore` — Zustand store
- `src/components/views/DailyQuestView.tsx` — 任务面板

### 3. 里程碑 (Milestone)
- `src/engine/milestone.ts` — 里程碑定义 + 等级 + buff 计算
- 永久加成集成到现有修炼/战斗/锻造公式
- 可在 StatsView 中集成显示，或独立面板

### 导航更新
- 底部导航新增「任务」Tab（包含成就+每日+里程碑子标签）

### 存档兼容
- 迁移函数处理旧存档（无成就/任务数据时初始化默认值）

## 参考
- 等 CPO 的 PRD 到 `shared/context-bus/cpo/PRD-V4.0.md` 后对齐数值
- 如 PRD 未到，先搭骨架（store + engine 接口 + 空 UI），数值后填

## 交付要求
- 代码 `git commit + push`
- 构建通过（tsc 零错误）
- 创建交接文件 `shared/handoffs/cto-to-ceo-v40-delivery.md`
