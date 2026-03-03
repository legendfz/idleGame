---
date: 2026-03-03
from: CEO
to: CTO
type: task
priority: P0
---

# v11.0「仙盟争锋」技术实现任务

## 需实现的三大系统

### 1. 仙盟引擎 `src/engine/guild.ts`
- 创建/加入/退出仙盟，成员管理（模拟NPC成员）
- 仙盟等级（1-10），被动加成（修炼速度+5%/级）
- 仙盟仓库：捐献/领取材料
- 仙盟任务：每日3个，完成条件基于现有游戏行为（修炼/战斗/锻造次数）
- 贡献点经济

### 2. PvP擂台引擎 `src/engine/pvp.ts`
- 生成模拟对手（基于玩家战力±20%随机属性）
- 异步战斗：复用现有battle引擎，双方自动战斗
- 仙誉积分+排名系统
- 每日5次免费，每周排名结算奖励
- 战斗日志记录

### 3. 活动增强 `src/engine/festival.ts`
- 3类新活动模板：修炼竞速/Boss共伐/寻宝夺旗
- 接入现有event系统，扩展活动类型
- 限时计时+排名+奖励发放

### 4. UI面板（3个新面板）
- `src/components/views/GuildPanel.tsx` — 仙盟管理+任务+仓库
- `src/components/views/PvpPanel.tsx` — 擂台+对手列表+战斗日志+排名
- `src/components/views/FestivalPanel.tsx` — 活动列表+参与+进度

### 5. Store 集成
- 在 gameStore 中添加 guild/pvp/festival 状态
- 接入 tick 循环
- 存档兼容

### 6. 导航集成
- 在底部导航或二级tab中接入新面板

## 技术约束
- TypeScript strict, tsc 零错误
- vite build 通过
- 不破坏现有功能

## 交付
- git commit + push
- Handoff: `shared/handoffs/cto-to-ceo-v110-impl.md`
