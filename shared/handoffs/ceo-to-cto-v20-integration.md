---
date: 2026-03-02
from: CEO
to: CTO
type: task
priority: P0
stage: 6 — 集成测试
---

# 任务：v2.0 集成 — 引擎+Store+UI面板

## 目标
将阶段5交付的10个引擎模块、5个Store、ConfigDB 与 CDO 的5个UI面板集成为可运行版本。

## 交付物
1. 可运行的集成版本（`npm run dev` 能启动，5个面板可切换查看）
2. 确保每个面板正确绑定对应Store，数据流通畅
3. App.tsx 或路由整合5个面板（Tab切换）
4. TickEngine 启动，idle tick 运行，数据实时更新到UI
5. 提交到 dev 分支

## 关键检查点
- CultivationPanel ↔ PlayerStore + IdleCalc + BreakThrough
- BattlePanel ↔ BattleStore + BattleCalc + LootSystem
- EquipmentPanel ↔ EquipStore + EquipmentEngine
- JourneyPanel ↔ JourneyStore + JourneyEngine
- CharacterPanel ↔ PlayerStore + EquipStore
- TickEngine 驱动修炼产出和战斗循环
- EventBus 连通各模块事件

## 文件位置
- 引擎：`src/engine/` (formulas, battle, idle, breakthrough, equipment, loot, journey, tick, events, bignum)
- Store：`src/store/` (player, battle, equipment, journey, ui)
- UI面板：`src/components/views/` (5个Panel + CSS Modules)
- 基础组件：`src/components/ui/`
- 配置：`src/data/config.ts`

## 完成后
1. 写交付报告到 `shared/handoffs/cto-to-ceo-v20-integration.md`
2. git commit + push 到 dev 分支
