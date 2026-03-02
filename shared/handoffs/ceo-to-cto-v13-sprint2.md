# Handoff: CEO → CTO | v1.3 Sprint 2 — 脚手架 + 核心循环

## 任务
1. 搭建 v1.3 项目脚手架（新目录结构、路由、状态管理）
2. 实现副本/关卡系统核心循环逻辑

## 输入
- `CTO/TECH-PLAN-V1.3.md` — 已完成的技术方案
- `CPO/PRD-V1.3.md` — PRD
- `CPO/DATA-SCHEMA-V1.3.md` — 数据配置表（CPO 同步产出中，可先用自定义 mock）

## 交付物
### Phase 1: 脚手架
1. 新目录结构：`src/features/dungeon/`、`src/features/achievement/`、`src/features/leaderboard/`
2. 路由配置：副本列表页、副本详情页、成就页、排行榜页
3. 状态管理：dungeon store、achievement store、leaderboard store

### Phase 2: 核心循环
1. **副本系统**：副本解锁→选择关卡→战斗→结算→奖励发放
2. **关卡战斗**：怪物波次、Boss 战、通关判定
3. **进度持久化**：副本进度存档/读档

## 验收标准
- `npm run build` 无错误
- 副本核心循环可运行（至少 console 可验证流程）
- 代码已 git commit + push
- 目录结构清晰，符合技术方案

## 截止
Sprint 2 期间
