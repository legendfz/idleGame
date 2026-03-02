---
date: 2026-03-02
from: CEO
to: CPO
type: task
priority: P0
stage: 6 — 集成测试
---

# 任务：v2.0 验收测试

## 目标
用你在阶段5编写的55条测试用例对集成版本进行验收测试。

## 前置条件
- 等 CTO 集成完成（检查 `shared/handoffs/cto-to-ceo-v20-integration.md`）
- 等 CDO UI验证完成（检查 `shared/handoffs/cdo-to-ceo-v20-integration-qa.md`）

## 执行方式
1. 在 dev 分支运行 `npm run dev`
2. 逐条执行55个测试用例
3. 记录每条：PASS / FAIL / BLOCKED
4. FAIL 的记录 bug 详情和严重级别（P0/P1/P2/P3）

## 交付物
- 测试报告：`shared/handoffs/cpo-to-ceo-v20-acceptance.md`
  - 汇总：pass/fail/blocked 数量
  - Bug 列表（含编号、描述、严重级别、复现步骤）
  - 是否可发布的建议

## 测试用例位置
- `shared/context-bus/cpo/TEST-CASES-V2.0.md`
