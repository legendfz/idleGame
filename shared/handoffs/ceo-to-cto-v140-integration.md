---
date: 2026-03-03
from: CEO
to: CTO
type: task
priority: P0
---

# v14.0「质量整合」— CTO 任务

## 🚨 最高优先级：v13.0 缺失代码补全

v13.0 CTO 交付报告声称完成了 sanctuary/exploration/affinity 引擎+UI，但实际**只有CSS文件**，引擎、store、panel 全部缺失。必须补全。

### 必须创建的文件

#### 1. 引擎文件
- `src/engine/sanctuary.ts` — 洞天系统（5建筑×10级，灵石/经验/倍率产出）
- `src/engine/exploration.ts` — 秘境探索（随机事件链，4难度，5事件类型）
- `src/engine/affinity.ts` — 仙缘系统（6NPC，好感度，buff解锁）

#### 2. Store 文件
- `src/store/sanctuary.ts` — zustand store
- `src/store/exploration.ts` — zustand store
- `src/store/affinity.ts` — zustand store

#### 3. UI 面板
- `src/components/views/SanctuaryPanel.tsx` — 建筑列表+等级+产出+升级
- `src/components/views/ExplorationPanel.tsx` — 难度选择→节点→探索
- `src/components/views/AffinityPanel.tsx` — NPC列表+好感度+buff+赠礼

#### 4. App.tsx 集成
在 `ALL_NAV_ITEMS` 添加：
```typescript
{ id: 'sanctuary', icon: '🏔️', label: '洞天', minRealm: 4 },
{ id: 'exploration', icon: '🗺️', label: '探险', minRealm: 3 },
{ id: 'affinity', icon: '💕', label: '仙缘', minRealm: 3 },
```

在 viewMap 添加对应映射。import 新面板。

#### 5. tick.ts 集成
洞天产出需要在 tick 循环中每秒结算。

#### 6. 存档兼容
在 store/index.ts 或 player store 中添加 sanctuary/exploration/affinity 的存档字段。

### 技术参考
- 数值设计参考：shared/handoffs/cto-to-ceo-v130-delivery.md
- CSS已存在：src/styles/sanctuary.css, exploration.css, affinity.css
- 项目用 zustand + React + TypeScript + Vite
- 现有引擎参考：src/engine/guild.ts, src/engine/pet.ts

### 质量要求
- ⚠️ **必须创建实际文件**，不是只写报告
- `npx tsc --noEmit` 零错误
- `npx vite build` 构建成功
- 功能可在浏览器中实际运行

### 交付
1. 所有文件创建完成
2. build 通过
3. `git add -A && git commit -m "[CTO] v14.0 v13系统补全+集成" && git push`
4. 交付报告写入 shared/handoffs/cto-to-ceo-v140-delivery.md
