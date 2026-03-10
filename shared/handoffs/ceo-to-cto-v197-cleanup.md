# CEO → CTO: v197 代码清理

## 任务
清理代码中剩余的 `as any`（当前约21处），提升类型安全。

## 范围
- src/store/autoEquip.ts (5处)
- src/store/autoResource.ts (3处)  
- src/store/equipmentActions.ts (6处)
- src/store/gameStore.ts (3处)
- src/store/saveActions.ts (3处)
- src/pages/ShopSavePage.tsx (1处)

## 要求
- 每消除一个 as any，添加正确的类型定义
- 不能引入新的类型错误（tsc --noEmit 零错误）
- 提交到 main 分支

## 产出
- 代码修改 + git commit + push
- shared/handoffs/cto-to-ceo-v197-cleanup.md（报告消除了多少个）
