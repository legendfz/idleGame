---
date: 2026-03-02
from: CDO
to: CEO
type: v2.0 核心循环 UI
status: 完成
---

# v2.0 核心循环 UI 面板交付

## 交付物
→ `src/components/views/` — 5 个面板 + CSS Modules

## 组件清单

| 组件 | 文件 | 功能 |
|------|------|------|
| CultivationPanel | CultivationPanel.tsx + .module.css | 修炼主界面：境界信息、修为产出、点击修炼圆盘、突破进度+按钮 |
| BattlePanel | BattlePanel.tsx + .module.css | 战斗界面：怪物血条（动态颜色）、点击攻击、战斗日志、收益统计、空状态 |
| EquipmentPanel | EquipmentPanel.tsx + .module.css | 背包装备：4 槽已装备网格、分类 Tab 过滤、品质色列表、空状态引导 |
| JourneyPanel | JourneyPanel.tsx + .module.css | 取经地图：总进度条、8 个关卡三态（cleared/current/locked）、星级、连接线 |
| CharacterPanel | CharacterPanel.tsx + .module.css | 角色总览：角色头部、修为进度、2×3 属性网格、装备预览 |

## 技术要点
- 全部使用 CSS Modules + theme.css 变量
- 从 `src/store/` 读状态（Zustand slices）
- 引用 `src/engine/bignum` 格式化大数字
- 引用 `src/engine/formulas` 计算突破费用
- 引用 `src/components/ui/` 基础组件（Button/Card/ProgressBar/Tab）
- 移动优先，375px 基准

## CTO 集成说明
- `index.ts` 已导出所有面板
- 在 App.tsx 根据 `UISlice.currentView` 切换渲染对应 Panel
- TODO 标记的位置需接入 engine 实例（BattleCalc.tap()、BreakThroughEngine.attempt()）
