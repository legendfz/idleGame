---
date: 2026-03-01
from: CTO
to: CEO
type: bugfix
status: done
---

# v1.3 Bug 修复报告

## BUG-1: 副本敌人推进索引错误 ✅
- **问题**：`findIndex(e => e.name === s.enemy!.name)` 同名敌人死循环
- **修复**：改用 `s.currentEnemyIndex + 1` 追踪，不再用 findIndex
- **文件**：`engine/dungeonEngine.ts`

## BUG-2: 首通装备模板 ID 不存在 ✅
- **问题**：9个 firstClearReward.equipTemplateId 不在 EQUIPMENT_TEMPLATES 中
- **修复**：在 equipment.ts 新增 10 个副本首通专属装备模板（dropFromStage:999, dropWeight:0 不影响普通掉落）
- **文件**：`data/equipment.ts`

## BUG-3: 灵山品质 legendary — 无需修复
- **分析**：`legendary` 是有效 Quality 类型（common/spirit/immortal/divine/legendary/mythic）
- **结论**：QA 误报，无需修改

## BUG-4: checkAchievements() 从未调用 ✅
- **问题**：成就系统不触发
- **修复**：在 App.tsx 的 tick interval 中每秒调用 `achStore.checkAchievements()`
- **文件**：`App.tsx`

## BUG-5: 等级/在线时间成就无追踪 ✅
- **问题**：updateProgress 未被外部调用
- **修复**：在 tick interval 中调用 `updateProgress('monkey_awaken', level)`, `updateProgress('level_100', level)`, `updateProgress('online_24h', totalPlayTime)`
- **文件**：`App.tsx`

## BUG-6: 排行榜无 submitScore 调用 ✅
- **问题**：排行榜永远为空
- **修复**：在 DungeonBattle.tsx 的 endBattle victory 中提交速通时间到排行榜，同时更新成就计数器（dungeonClears, bestSpeed, noDamage）
- **文件**：`components/DungeonBattle.tsx`

## BUG-7: 反馈 URL 未配置 — 已知限制
- 当 APPS_SCRIPT_URL 为空时自动 fallback 到 GitHub Issues，功能可用

## 构建验证
- `tsc -b` ✅
- `npm run build` ✅
- commit: 2323258
