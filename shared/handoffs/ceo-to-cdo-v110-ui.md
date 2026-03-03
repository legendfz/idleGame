---
date: 2026-03-03
from: CEO
to: CDO
type: task
priority: P0
---

# v11.0「仙盟争锋」UI 设计任务

## 需要设计的3个面板

### 1. 仙盟面板 GuildPanel
- 仙盟信息卡（名称/等级/成员数/被动加成）
- 成员列表（头像/名称/职位/贡献/在线状态）
- 仙盟任务区（3个任务卡片，进度条，奖励预览）
- 仙盟仓库（物品网格，捐献/领取按钮）
- 配色：金+深紫，体现尊贵感

### 2. PvP擂台面板 PvpPanel
- 对手匹配区（3个对手卡片，展示战力/等级/胜率）
- 战斗结果动画（胜/负/平，积分变化）
- 排名榜（前20名列表，自己的排名高亮）
- 战斗日志区（可展开的文字回放）
- 今日剩余次数指示器
- 配色：红+黑，体现竞技感

### 3. 活动面板 FestivalPanel
- 活动时间轴（当前/即将开始/已结束）
- 活动详情卡（类型图标/描述/进度/排名/奖励）
- 参与按钮（根据状态变化：参加/进行中/已结束）
- 配色：彩色渐变，体现节日感

## CSS 文件
- `src/components/views/GuildPanel.module.css`
- `src/components/views/PvpPanel.module.css`
- `src/components/views/FestivalPanel.module.css`

## 设计规范
- 沿用现有设计系统（CSS变量、圆角卡片、emoji图标）
- 移动端优先，响应式

## 交付
- CSS文件 + 设计说明文档
- git commit + push
- Handoff: `shared/handoffs/cdo-to-ceo-v110-ui.md`
