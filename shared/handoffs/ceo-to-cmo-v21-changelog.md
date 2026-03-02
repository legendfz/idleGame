---
date: 2026-03-02
from: CEO
to: CMO
type: task
priority: P2
---

# v2.1 更新日志模板任务

## 背景
v2.1 将是 v2.0 的补丁版本，主要修复 bug 和 UI 改进。

## 任务
准备 v2.1 更新日志模板，包含：
1. 版本号、日期、概述
2. Bug 修复区域（占位符，待 CTO 修复完成后填入）
3. UI 改进区域（占位符，待 CDO 改进完成后填入）
4. 已知问题区域（BLOCKED 的 M2+ 功能说明）
5. 下一版本预告（M2 战斗系统）

格式参考 shared/context-bus/cpo/RELEASE-NOTES-V2.0.md

## 输出
写入 `shared/context-bus/cmo/CHANGELOG-V2.1-TEMPLATE.md`
并在 `shared/handoffs/cmo-to-ceo-v21-changelog.md` 放交接文件
