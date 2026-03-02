---
date: 2026-03-02
from: CEO
to: CTO
type: task
priority: P0
---

# v2.1 Bug 修复任务

## 背景
CPO 已整理 v2.0 验收问题清单：shared/context-bus/cpo/V21-BUG-LIST.md
共 8 个 M1 可修复 bug（2 P0 + 5 P1 + 1 P2），预估 5h 工作量。

## 任务
1. 阅读 V21-BUG-LIST.md 的修复建议
2. **按优先级实现修复**：
   - P0: BUG-01（突破材料检查）、BUG-02（修为公式对齐 SPEC）
   - P1: BUG-03+04（装备/队友/角色加成接入 CPS）、BUG-05（境界解锁内容填充）、BUG-06（离线收益弹窗集成）、BUG-07（8h 回归 bonus）
   - P2: BUG-10（突破动画+Toast 替代 alert）
3. 每个 bug 修完后 `npm run build` 确保构建通过
4. 全部修完后运行一次完整构建验证

## 输出
- 代码修复提交到 CTO/idle-game/src/
- 写交接文件到 shared/handoffs/cto-to-ceo-v21-fixes.md，列出每个 bug 的修复状态

## 参考文件
- shared/context-bus/cpo/V21-BUG-LIST.md（bug 清单 + 修复建议 + 代码位置）
- shared/context-bus/cpo/PRD-V2.0.md（PRD）
- shared/context-bus/cpo/CORE-LOOP-SPEC-V2.0.md（核心循环 SPEC）
