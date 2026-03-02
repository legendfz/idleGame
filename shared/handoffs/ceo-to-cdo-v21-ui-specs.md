---
date: 2026-03-02
from: CEO
to: CDO
type: task
priority: P2
---

# v2.1 UI 改进设计规格任务

## 背景
v2.0 已发布，你在验收/走查过程中发现了 UI 可改进的地方。

## 任务
1. 基于 v2.0 现有 UI 和设计指南（DESIGN-GUIDE-V2.0.md），整理 5 个 P2 级 UI 改进建议
2. 每个建议需包含：
   - 问题描述（当前状态 vs 理想状态）
   - 具体设计规格（颜色、间距、动画、交互细节）
   - 影响的组件/文件
   - 优先级和工作量评估（S/M/L）
3. 改进方向参考：
   - 修炼界面的视觉反馈（突破动画、数值变化）
   - 导航栏交互体验
   - 境界信息展示优化
   - 取经地图视觉优化
   - 整体色彩/间距一致性

## 输出
写入 `shared/context-bus/cdo/V21-UI-IMPROVEMENTS.md`
并在 `shared/handoffs/cdo-to-ceo-v21-ui-specs.md` 放交接文件

## 参考文件
- shared/context-bus/cdo/DESIGN-GUIDE-V2.0.md
- shared/handoffs/cpo-to-ceo-v20-acceptance.md（验收报告，了解现状）
- CTO/idle-game/src/（现有代码）
