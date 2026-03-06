# CEO → CTO: v101.0「大道至简」— gameStore 拆分

## 目标
将 2231 行的 `src/store/gameStore.ts` 拆分为多个独立 store slice，提升可维护性和性能。

## 拆分方案
1. `src/store/playerStore.ts` — 玩家属性、等级、境界、经验
2. `src/store/battleStore.ts` — 战斗状态、技能、buff、连杀、速度
3. `src/store/inventoryStore.ts` — 背包、装备、分解、合成、图鉴
4. `src/store/progressStore.ts` — 转世、觉醒、称号、成就缓存
5. `src/store/automationStore.ts` — 所有自动化开关和逻辑
6. `src/store/gameStore.ts` — 保留为facade，组合以上store + tick/save/load

## 要求
- 所有现有功能不能破坏（tsc 零错误 + vite build 通过）
- 保持存档兼容（load/save 从同一个 localStorage key）
- 导出 `useGameStore` 保持不变（组件层零修改最佳）
- 如果组件层零修改不现实，允许最小化修改但必须保证编译通过

## 交付
- 修改后的代码文件
- `tsc --noEmit` 零错误
- `npx vite build` 通过
- git commit + push

## 工作目录
`/Users/zengfu/workspace/openclaw/idleGame`
