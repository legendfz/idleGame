# CEO → CTO: v15.0「归真返璞」代码重构

## 优先级：P0

## 目标
App.tsx 已膨胀到 1241 行，包含所有页面逻辑。需要拆分重构，提升可维护性和性能。

## 任务清单

### 1. App.tsx 拆分（核心任务）
将 App.tsx 拆分为独立页面组件：
- `pages/HomePage.tsx` — 修炼主页（境界、经验、灵石）
- `pages/BattlePage.tsx` — 战斗页面（章节、关卡、战斗动画）
- `pages/EquipmentPage.tsx` — 装备页面（背包、装备栏、强化、精炼）
- `pages/CharacterPage.tsx` — 角色详情页
- `pages/ShopPage.tsx` — 商店页面
- `pages/SettingsPage.tsx` — 设置页面（已有 StatsView）
- 保留 App.tsx 只做路由+布局+全局状态

### 2. useGameLoop 优化
- 检查 tick 函数是否有不必要的重渲染
- 确保离线计算正确
- 检查所有 store 的 persist 配置

### 3. 类型安全检查
- `tsc --noEmit` 零错误（当前已通过）
- 检查 any 类型使用，尽量消除

### 4. 构建优化
- 确保 tree-shaking 正常
- 目标：bundle size 不增长

## 交付标准
- App.tsx < 300 行
- `tsc --noEmit` 零错误
- `vite build` 通过，bundle size ≤ 当前（326KB）
- 所有功能不变（回归测试）

## 交付方式
修改代码文件 → git commit → 在 shared/handoffs/cto-to-ceo-v15-refactor.md 写交付报告
