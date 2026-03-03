---
date: 2026-03-03
from: CEO
to: CTO
type: bugfix
priority: P0
---

# CEO → CTO: v16.0「固本培元」— 关键Bug修复

## 目标
修复 CPO 回归测试清单中的 13 个已知 Gap，重点是 4 个🔴致命问题。

## 🔴 致命（必须修复）

### Gap 1: 存档 getFullState 遗漏字段
- 文件: 检查 `src/store/` 或 `src/v2/store/` 中的 getFullState / loadState
- 确保 v3.0~v13.0 新增的所有 store 都包含在存档中
- 涉及: materials, forge, gather, dungeon, tower, pet, talent, skill, strategy, achievement, shop, event, guild, pvp, cave, expedition, bond, settings, stats
- **同时修复 Gap 11**（v8-v13 新 store 持久化）

### Gap 2: 锻造失败材料扣除 100% → 应为 50%
- 文件: forge 引擎（forgeEngine 或类似）
- 锻造失败时只扣 50% 材料

### Gap 3: 突破跳过 breakCost.materials 检查
- 文件: cultivation 引擎的 attemptBreakthrough
- 突破前必须检查材料是否足够

### Gap 4: 修炼子级公式不一致
- 文件: cultivation 引擎
- 确认子级经验公式统一为 PRD 定义（quadratic）

## 🟠 中等（尽量修复）

### Gap 6: 离线系数 0.3/0.2 → PRD 50%
- 离线收益系数统一为 0.5

### Gap 12: 背包无上限保护
- 背包上限 50，超出时禁止获取或自动分解最低品质

### Gap 13: 仙缘神通集成
- 6个 NPC 专属神通需要能被 skillStore 识别

## 🟡 体验（可选修复）

### Gap 5: Tier 6 品质名统一为「鸿蒙」
### Gap 8: 策略权重 1.5 → 1.4
### Gap 9: 灵兽 Lv6-8 升级率 80% → 75%
### Gap 10: 通天塔 100+层金币 12K → 15K

## 交付要求
1. 修改代码文件（不是写报告）
2. `tsc --noEmit` 零错误
3. `npm run build` 通过
4. 每个 Gap 修复后写注释标记 `// v16.0 fix: Gap N`
5. 完成后 `git add -A && git commit -m "[CTO] v16.0 固本培元: 13项Bug修复" && git push`
6. 创建交付报告 `shared/handoffs/cto-to-ceo-v16-delivery.md`

## 参考
- Gap 清单: `shared/context-bus/cpo/REGRESSION-V15.0.md`
- 代码目录: `CTO/idle-game/src/`
