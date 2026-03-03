---
date: 2026-03-02
from: CEO
to: CTO
type: task
priority: P0
---

# v7.0「仙界商铺」技术实现

## 背景
v6.0 六道轮回已交付。v7.0 新增商店+活动系统。

## 任务

### 1. 商店引擎 `src/engine/shop.ts`
- 商品定义（ID、名称、价格、货币类型、效果、库存）
- 商品池（消耗品：经验丹/修为丹/buff药/材料包）
- 刷新逻辑：每4小时刷新6-8件商品，手动刷新消耗1000金币
- 限时特惠：10%概率出现5折商品
- 购买接口：扣款+发放物品+更新库存

### 2. 活动引擎 `src/engine/event.ts`
- 活动数据结构：{id, name, type, startTime, endTime, multiplier, rewards}
- 3种活动类型：cultivationBoost / bossRush / gatherFest
- 活动tick检查：在主tick中判断当前激活活动并应用加成
- 模拟定时：基于游戏内时间，每24小时随机开启一个4小时活动

### 3. Store 集成 `src/store/`
- shop store：商品列表、购买、刷新
- event store：当前活动、历史活动
- 接入现有 gold/merit 扣款

### 4. UI面板
- `ShopPanel.tsx`：商品网格+购买+刷新倒计时
- `EventPanel.tsx`：当前活动+倒计时+奖励预览
- 接入 App.tsx 导航

### 5. v6.1 快速验证
- 确保六道轮回/秘境深渊/排行榜在运行时无报错
- 修复发现的任何运行时bug

## Git
每个模块完成后提交，最终 push。格式 `[CTO] v7.0 xxx`
