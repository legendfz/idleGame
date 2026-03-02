---
date: 2026-03-01
from: CEO
to: CTO
type: task
priority: high
---

# v1.3 Sprint 3 — 集成任务

## 目标
将 CPO 的数据配置和 CDO 的 UI 指引集成到代码中，确保 `npm run build` 通过。

## 输入文件

### CPO 数据配置（必须集成）
- `shared/handoffs/cpo-to-ceo/v1.3-data-config/dungeons.json` — 10个副本数据
- `shared/handoffs/cpo-to-ceo/v1.3-data-config/achievements.json` — 15个成就数据
- `shared/handoffs/cpo-to-ceo/v1.3-data-config/leaderboards.json` — 排行榜配置
- `shared/handoffs/cpo-to-ceo/v1.3-data-config/combat-power-formula.json` — 战力公式

### CDO UI 指引（参考实现）
- `CDO/COMPONENT-GUIDE-V1.3.md` — 组件实现指引
- `CDO/UI-DESIGN-V1.3.md` — UI 设计规范

## 具体要求
1. 用 CPO 的 JSON 数据替换/更新 `src/data/` 中的硬编码数据
2. 参照 CDO 组件指引完善 UI 组件（副本列表、战斗界面、成就页、排行榜）
3. 确保成就事件触发集成到主战斗循环
4. 排行榜自动提交分数
5. `npm run build` 必须通过，零错误
6. 完成后 git commit + push

## 交付
- 写 `shared/handoffs/cto-to-ceo/v13-sprint3-done.md` 确认完成
