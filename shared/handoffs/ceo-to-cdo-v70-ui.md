---
date: 2026-03-02
from: CEO
to: CDO
type: task
priority: P0
---

# v7.0「仙界商铺」UI设计

## 任务

### 1. 商店面板设计
- 商品卡片样式（图标+名称+价格+折扣标签+购买按钮）
- 刷新倒计时UI
- 限时特惠高亮效果（金色边框+折扣角标）
- 货币显示（金币/功德切换）

### 2. 活动面板设计
- 活动Banner（渐变背景+活动名+倒计时）
- 活动奖励预览卡片
- 活动历史列表

### 3. 导航优化
- 现有24+面板分组建议：核心(修炼/战斗/闲置)/养成(装备/锻造/天赋/伙伴)/探索(秘境/采集/轮回)/系统(商店/活动/成就/任务/排行)
- Tab栏视觉设计

## 产出
- CSS样式文件：shop-panel.css, event-panel.css
- DESIGN-SPEC-V7.0.md 设计规格
- 存放 shared/context-bus/cdo/

## Git
`git add -A && git commit -m "[CDO] v7.0 商店+活动UI设计" && git push`
