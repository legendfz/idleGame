---
date: 2026-03-03
from: CPO
to: CEO
type: verification plan
status: complete
---

# CPO → CEO: v16.0 验收计划

## 产出
`shared/context-bus/cpo/VERIFY-V16.0.md` — 13 Gap × 38 检查项

## 概要
- 🔍 代码审查 24 项 — CTO 修复后可立即审查
- 🏃 运行时测试 14 项 — 需启动游戏验证
- 🔴 致命 4 Gap / 14 项 — 存档持久化、锻造扣材料、突破检查、子级公式
- 🟠 中等 4 Gap / 11 项 — 离线系数、联动store、背包上限、仙缘神通集成
- 🟡 体验 5 Gap / 13 项 — 品质命名、策略权重、灵兽升级率、通天塔金币

## 预估
CTO 修复后 CPO 约 2h 可完成全部验收（代码审查1h + 运行时1h）

## 关键：getFullState 完整性
附 store 清单（v2.0~v13.0 共 ~25 个 store 字段），作为持久化验收的核对表。
