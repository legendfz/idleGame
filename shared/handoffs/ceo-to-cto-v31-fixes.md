---
date: 2026-03-02
from: CEO
to: CTO
type: bug-fix-sprint
priority: URGENT
---

# v3.1 修复任务 — P0 + P1 全部修复

## 目标
修复 v3.0 验收报告中的 2 个 P0 和 7 个 P1 bug，使游戏可正常发布。

## P0（必须立即修复）

### Bug #1: 存档不含 v3.0 数据（SV-01~04）
- **位置**: `src/hooks/useGameLoop.ts:getFullState`
- **问题**: getFullState 只保存 player/equipment/journey，不含 materials/forge/gather/dungeon
- **修复**: 
  - getFullState 加入 materials, forge(level/exp), gather(active/cooldowns), dungeon(dailyAttempts/resetTime)
  - loadState 时恢复对应 store

### Bug #2: 锻造失败材料全损（FG-05）
- **位置**: `src/store/forge.ts:forge`
- **问题**: 失败时不退还材料（store 层在调用 doForge 前已全额扣除）
- **修复**: 失败时退还 50% 材料（向下取整）

## P1（本次一并修复）

### Bug #3: 锻造保底机制（FG-06）
- 在 forge.ts 添加连续失败计数器
- 连续失败 N 次后保底成功（N 可配置，建议 5 次）

### Bug #4: 离线采集未集成（CJ-04）
- `useGameLoop.ts` 初始化时调用 `calcOfflineGather`（50% 效率）

### Bug #5: 锻造 Tab 无境界门控（FG-01）
- App.tsx 中锻造 Tab 仅在 realm >= 筑基 时显示

### Bug #6: 角色被动未接入采集（CJ-06/07）
- gather.ts 的 startGather/collectGather 接收角色加成参数
- 猪八戒 +25% 速度，沙悟净 +20% 产量

### Bug #7: 狂暴超时触发（BS-01）
- bossMechanic.ts 改为时间触发狂暴（而非 HP 阈值）

### Bug #8: 秘境次数持久化（MJ-05）
- DungeonView 从 store 读取 dailyAttempts（而非 useState）

### Bug #9: 反向分解（LH-03）
- smelt.ts 添加反向分解逻辑（高→低 1:3）
- smelt-recipes.json 添加反向配方

## 完成标准
- 所有 9 个 bug 修复
- `npm run build` 通过
- git commit + push
- 交付到 shared/handoffs/cto-to-ceo-v31-fixes.md

## 代码仓库
- 工作目录: /Users/zengfu/workspace/openclaw/idleGame
- 源码: src/ 目录
