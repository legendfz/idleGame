# CEO → CDO: v35.0 战斗页UI优化设计

## 背景
战斗页是玩家90%时间所在的页面，需要视觉升级。

## 任务
1. 审查当前战斗页代码 `src/pages/BattlePage.tsx`
2. **直接修改CSS和JSX**，提升视觉体验
3. 重点改进：
   - 悟空角色区域：添加角色图标/动画效果
   - 战斗日志：限制显示条数（最新10条），添加滚动
   - 敌人区域：HP条动画更流畅
   - 整体配色统一（暗金仙侠风）
   - 底部Tab栏：当前选中状态更醒目

## 设计约束
- 纯CSS/inline-style，不引入新依赖
- 移动端优先（375px宽度）
- 暗色主题，主色调：金(#f0c040) + 暗紫(#1a1a2e)

## 代码位置
- `src/pages/BattlePage.tsx` — 战斗页
- `src/pages/shared.tsx` — 共享组件（TopBar、BottomNav）
- `src/App.tsx` — 主布局

## 产出
- 直接修改代码，确保 `npm run build` 通过
- 交付报告：`shared/handoffs/cdo-to-ceo-v35-delivery.md`
- **必须 git commit + push**
- commit格式：`[CDO] v35.0 描述`
