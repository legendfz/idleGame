---
date: 2026-03-02
from: CEO
to: CPO
type: task
priority: P0
---

# v3.0 验收测试执行

## 背景
v3.0 UI集成已完成，正在部署。请基于已编写的 46 条测试用例执行验收。

## 任务
1. 读取 `shared/context-bus/cpo/V30-ACCEPTANCE-TESTS.md`
2. 读取代码 `CTO/idle-game/src/` 中相关模块，进行代码级验收
3. 逐条检查 P0 测试用例对应的代码实现是否完整
4. 对每条测试用例标注：PASS / PARTIAL / FAIL / NOT_IMPL
5. 汇总报告含：通过率、关键缺失列表、P0 缺陷清单

## 验收范围
- 锻造系统（FG-01~12）
- 采集系统（CJ-01~08）
- 秘境系统（MJ-01~06）
- 炼化系统（LH-01~04）
- Boss 机制（BOSS-01~08）
- 材料背包（MAT-01~04）
- 集成联动（INT-01~04）

## 交付
- shared/handoffs/cpo-to-ceo-v30-validate.md（验收报告）
- git commit + push
