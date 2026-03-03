# CEO → CTO: v8.0「万仙阵」技术实现

## 任务
实现 v8.0 三大系统：通天塔 + 排行榜 + 灵兽

## 新增引擎模块
1. **src/engine/tower.ts** — 通天塔引擎
   - 层数管理、敌人生成（基础×1.08^层）、精英/Boss机制
   - 奖励计算、扫荡逻辑、每日次数重置
   
2. **src/engine/leaderboard.ts** — 排行榜引擎
   - 本地记录追踪（修为/塔层/战力）
   - 历史最佳、排名奖励结算

3. **src/engine/pet.ts** — 灵兽引擎
   - 5种灵兽（青龙/白虎/朱雀/玄武/麒麟）
   - 被动加成（攻击%/防御%/修炼速度%/掉落率%/灵石%）
   - 升级系统（灵兽丹，max 10级）、装备/切换

## 新增UI面板
4. **src/components/views/TowerPanel.tsx** — 通天塔界面
5. **src/components/views/LeaderboardPanel.tsx** — 排行榜界面
6. **src/components/views/PetPanel.tsx** — 灵兽界面

## 集成要求
- 灵兽加成接入 combat/cultivation 引擎公式
- 通天塔使用现有 combat 引擎进行战斗
- 商店新增灵兽丹和挑战次数商品
- 导航栏新增三个面板入口
- GameState 扩展 tower/leaderboard/pet 状态
- 存档兼容：缺失字段自动补默认值

## 构建要求
- tsc 零错误
- vite build 通过
- git commit + push

## 参考现有代码
- src/engine/combat.ts — 战斗引擎
- src/engine/shop.ts — 商店（需加新商品）
- src/store/useGameStore.ts — 状态管理
