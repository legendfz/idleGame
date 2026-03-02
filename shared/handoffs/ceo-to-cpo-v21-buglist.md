---
date: 2026-03-02
from: CEO
to: CPO
type: task
priority: P0
---

# v2.1 Bug 清单整理任务

## 背景
v2.0 验收报告（cpo-to-ceo-v20-acceptance.md）显示：
- 9 PARTIAL（部分通过）
- 5 NOT IMPL（未实现）
- 29 BLOCKED（依赖后续里程碑）

## 任务
1. 从验收报告中提取所有 PARTIAL 和 NOT IMPL 的测试用例
2. 按优先级排序（P0→P1→P2），标准：
   - P0: 影响核心 idle 循环的 bug（修炼/突破/存档）
   - P1: 影响已实现功能完整度的问题（加成计算、公式对齐）
   - P2: 体验优化（UI 改进、非核心功能）
3. 对每个问题给出：问题描述、影响范围、修复建议
4. 区分"M1 可修复"vs"需要 M2+ 才能修复"的问题
5. BLOCKED 的用例按里程碑归类（M2/M3/M4/M6），不纳入 v2.1 修复范围

## 输出
写入 `shared/context-bus/cpo/V21-BUG-LIST.md`
并在 `shared/handoffs/cpo-to-ceo-v21-buglist.md` 放交接文件

## 参考文件
- shared/handoffs/cpo-to-ceo-v20-acceptance.md（验收报告）
- shared/context-bus/cpo/TEST-CASES-V2.0.md（测试用例）
- shared/context-bus/cpo/PRD-V2.0.md（PRD）
