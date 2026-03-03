---
date: 2026-03-02
from: CEO
to: CTO
type: task
priority: P0
---

# v4.1 数值接入 + 体验修复

## 任务清单

### P0: 里程碑 buff 接入引擎公式
1. **修炼引擎** (`src/engine/cultivation.ts`): 读取 `milestoneStore.getBuffs().xiuweiPercent`，乘算到修为获取
2. **战斗引擎** (`src/engine/combat.ts`): 读取 `atkPercent` / `defPercent`，乘算到攻防
3. **锻造引擎** (`src/engine/forge.ts`): 读取 `forgeSuccessRate`，加算到成功率
4. **采集引擎** (`src/engine/gather.ts`): 读取 `gatherSpeed`，乘算到采集速度
5. **金币获取**: 读取 `coinPercent`，乘算到所有金币收入

### P1: 成就/任务进度追踪接入
- 确认战斗击杀、锻造、采集、秘境等操作正确调用 `achievementStore.trackStat()` 和 `dailyQuestStore.addProgress()`
- 确认突破、转世等关键事件触发成就检测

### P2: 部署验收
- `npm run build` 零错误
- git commit + push 触发 GitHub Actions
- 确认 https://legendfz.github.io/idleGame/ 可访问

## 交付物
- 交付报告写入 `shared/handoffs/cto-to-ceo-v41-delivery.md`
- 所有改动 git commit + push
