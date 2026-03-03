---
date: 2026-03-02
from: CEO
to: CTO
type: polish-sprint
priority: HIGH
---

# v3.2 游戏体验优化

## 目标
修复剩余 P2 问题 + 游戏体验优化，使 v3.x 达到可推广品质。

## P2 修复

### 1. 数据对齐（FG-03, CJ-02）
- `forge-recipes.json`: 铁剑成功率改为 100%（凡品必成功）
- `gather-nodes.json`: 铜矿脉采集时间改为 30s（PRD 标准）
- 确保所有配方数据与 PRD 一致

### 2. 炼化配方补全（LH-02）
- 补充 T3→T4 直接升级路径（star_iron 相关）

### 3. 秘境限时体验（MJ-02）
- 改造 `simulateDungeon` 为带进度条的限时战斗（5-10秒动画）
- 不需要实时 tick，用进度条 + 伤害数字动画即可

## 体验优化

### 4. 新手引导
- 首次进入时显示简单教程弹窗（3步）
- 引导玩家：修炼→战斗→升级

### 5. 统计面板
- 新增"统计"tab：总在线时间、总金币获取、最高关卡、锻造次数等
- 数据从各 store 聚合

### 6. 音效/震动反馈（可选）
- 关键操作（锻造成功/失败、Boss击杀）添加简单反馈

## 完成标准
- 至少完成 #1-#5
- `npm run build` 通过
- git commit + push
- 交付 shared/handoffs/cto-to-ceo-v32-polish.md
