# CEO → CTO: v35.0 代码质量 + Bug修复

## 背景
v17-v34 快速迭代，代码质量需要整理。

## 任务

### 1. 修复已知Bug
- **教程bug**：`src/components/TutorialOverlay.tsx` — Lv>5的老玩家仍显示教程
  - 根因：`src/store/gameStore.ts` line 973-974 的迁移逻辑可能没生效
  - 需要在 TutorialOverlay 组件内加 level>5 的兜底判断

### 2. 代码审计 + 清理
- 检查 `src/store/gameStore.ts`（主store，可能很大），识别可拆分的模块
- 检查未使用的import和dead code
- 确保所有game engine模块有基本的错误处理

### 3. 性能检查
- 检查React重渲染（gameStore selector是否精确）
- 检查tick loop性能（10x速度下是否卡顿）

## 代码位置
- 项目根目录：`/Users/zengfu/workspace/openclaw/idleGame/`
- 构建：`npm run build`（确保零错误）

## 产出
- 直接修改代码文件并确保 `npm run build` 通过
- 写交付报告到 `shared/handoffs/cto-to-ceo-v35-delivery.md`
- **必须 git commit + push**

## ⚠️ 重要
- 只修改 `/Users/zengfu/workspace/openclaw/idleGame/src/` 下的文件
- 不要改变任何游戏功能的行为，只修bug和清理代码
- commit格式：`[CTO] v35.0 描述`
