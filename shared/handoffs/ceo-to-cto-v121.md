# CEO → CTO: v121.0「安定天下」— as any 清理 + 防御性编码

## 任务
gameStore.ts 有 63 个 `as any`，这是 v120 线上崩溃的根因类型。清理它们。

## 具体要求
1. **消除 `as any`**：目标从 63 降到 <20。用正确的类型替代。
2. **防御性编码**：所有从 player state 读取的可选字段加 `?? 默认值`
3. **不要改变任何游戏逻辑**，只做类型安全改进
4. **确保 `npx tsc --noEmit` 零错误 + `npx vite build` 成功**

## 文件
- `src/store/gameStore.ts` (2631行，主要目标)
- `src/pages/SettingsPage.tsx` (如有 as any)

## 交付
- 修改后的文件
- `as any` 数量前后对比
- tsc + build 通过证明

## 截止
本次 session 内完成
