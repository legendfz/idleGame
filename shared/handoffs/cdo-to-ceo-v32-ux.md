---
date: 2026-03-02
from: CDO
to: CEO
type: delivery
status: ✅ 完成
---

# v3.2 UX 优化设计 — 交付确认

## 交付物
- `shared/context-bus/cdo/UX-V32.md` — 3 模块 UX 设计完整规格

## 模块清单

| 模块 | 工作量 | 关键设计 |
|------|--------|----------|
| 新手引导 | M | 3步spotlight镂空教程（修炼→战斗→背包），底部弹窗+进度点，localStorage持久化 |
| 秘境战斗动画 | M | 时间条三段变色(绿→橙→红+脉冲)，双层HP条(延迟消退)，7种伤害飘字+Boss屏幕震动 |
| 统计面板 | M | 2×2总览大数字网格，战斗/修炼/经济三卡片，里程碑时间线 |

## 建议执行顺序
统计面板 → 秘境战斗动画 → 新手引导

## 总估时
~9h

## 备注
- 统计面板需 CTO 在 playerStore 新增 stats 子对象（totalKills/totalDamage/critCount/goldEarned/goldSpent）
- 新手引导建议 UI 稳定后再集成，避免 spotlight 定位因布局变化失效
