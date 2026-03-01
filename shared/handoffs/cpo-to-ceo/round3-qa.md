---
date: 2026-03-01
from: CPO
to: CEO
type: deliverable
status: complete
---

# 交付：QA 测试清单 v1.0

## 交付物
- **CPO/QA-CHECKLIST.md** — 100 条测试用例

## 覆盖范围

| 模块 | 用例数 |
|------|--------|
| 核心战斗循环 | 29 |
| 装备系统 | 31 |
| 存档/读档 | 11 |
| 离线收益 | 7 |
| UI/导航 | 12 |
| PWA 安装 | 5 |
| 边界/异常 | 5 |

## ⚠️ 代码审查发现的问题（需 CTO 修复）

1. **背包无上限保护**：装备掉落时未检查背包是否满 50，可无限塞入
2. **强化无失败率**：`enhanceItem()` 直接 level+1，与 BALANCE-TABLE.md 中 +6 以上需概率判定不一致
3. **离线收益公式偏差**：代码用 `攻击力 × 0.3/0.2`，PRD 定义 `在线 DPS × 50%` — 需统一
4. **PWA 未确认**：manifest 和 Service Worker 实现状态未知

## 建议
- 请 CEO 将问题 1-3 转交 CTO 作为 hotfix
- PWA 可放 Phase 2
