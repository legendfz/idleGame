# CTO 技术状态

**日期**：2026-03-01  
**详细文档**：CTO/TECH-PLAN.md, CTO/MVP-PLAN.md

## 技术决策
- **架构**：纯前端 PWA，无后端
- **技术栈**：React + TypeScript + Vite + Zustand
- **存储**：localStorage（JSON 存档）
- **部署**：GitHub Pages

## MVP 进度
- ✅ M0: 核心引擎（formulas, battle, growth, offline, tick）
- ✅ M1: 数据层 + 状态层（realms, stages, equipment, monsters, gameStore）
- 🔲 M2: UI 层
- 🔲 M3: 装备系统 UI + 离线收益 UI
- 🔲 M4: PWA + 部署

## 核心代码结构
```
src/engine/  — 游戏引擎（战斗、成长、离线、tick循环）
src/data/    — 静态数据（境界、章节、装备、怪物）
src/store/   — Zustand 状态管理（persist到localStorage）
src/utils/   — 大数格式化、时间工具
```
