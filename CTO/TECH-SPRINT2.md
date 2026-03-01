# 技术方案：v1.2 Sprint 2

## 功能1：离线掉落保底

### 设计
在 `engine/offline.ts` 的 `calculateOfflineEarnings` 中添加保底逻辑：
- 每100关（stagesCleared）保底1件灵品(spirit)装备
- 每500关保底1件仙品(immortal)装备
- 保底装备从对应品质模板池随机选取
- 保底在正常boss掉落之外额外给予
- 受 INVENTORY_MAX 限制

### 变更文件
- `engine/offline.ts` — 添加保底掉落逻辑

## 功能2：背包溢出智能分解

### 设计
- 新增 `decomposeItem(uid)` action，分解装备获得灵石（sellPrice×0.6）+ 鸿蒙碎片（仅legendary+mythic）
- 新增 `batchDecompose(uids[])` action，批量分解
- 新增 `getDecomposeRecommendations()` — 按品质升序、等级升序推荐分解（不推荐已装备的）
- 背包满时弹出分解提示面板，显示推荐列表
- UI：背包Tab顶部显示 `[🔨分解模式]` 按钮，点击进入多选分解

### 变更文件
- `store/gameStore.ts` — 新增 decomposeItem, batchDecompose actions
- `App.tsx` — 分解模式UI、溢出提示弹窗

## 功能3：反馈按钮（3种Issue模板）

### 设计
- 设置Tab新增反馈按钮，点击弹出模板选择
- 3种模板：🐛Bug报告 / 💡建议 / 🎮体验反馈
- 选择后打开预填的 GitHub Issue URL（`legendfz/idleGame/issues/new?template=...`）
- 纯前端，不需要后端

### 变更文件
- `App.tsx` — 设置Tab添加反馈按钮+模板选择弹窗

## Save版本
保持 v4，无新字段需要（分解用现有灵石/碎片字段）。
