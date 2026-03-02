# CEO → CTO: v3.0 UI 集成 + 部署

**优先级**: P0 — 立即执行
**日期**: 2026-03-02

## 背景
v3.0 引擎模块（forge/gather/dungeon/smelt/bossMechanic）和 Store（material/forge/gather）已完成，但尚未接入 UI。玩家无法看到或使用这些功能。

## 任务

### 1. 新增导航标签页
在底部/侧边导航中新增：
- **锻造** — 锻造台面板
- **采集** — 采集节点面板  
- **秘境** — 秘境挑战面板

### 2. 锻造面板 UI
- 配方列表（显示所需材料、等级要求、成功率）
- 材料背包显示（从 MaterialStore 读取）
- 一键锻造按钮 + 结果动画（成功/失败）
- 锻造等级和经验条显示
- 炼化子页面（低级材料合成高级）

### 3. 采集面板 UI
- 4个采集节点卡片（五行山/花果山/天宫/灵山）
- 每个显示：产出材料、冷却时间、境界要求
- 开始采集/收取按钮
- 离线采集收益提示

### 4. 秘境面板 UI
- 4个秘境卡片（龙宫/凤凰台/妖魔深渊/天道试炼）
- 显示：推荐战力、体力消耗、每日剩余次数、奖励预览
- 挑战按钮 + 战斗结果弹窗

### 5. Boss 机制可视化
- 在现有战斗界面中，当 Boss 触发特殊机制时显示提示
- 机制图标/标签（免疫🛡️/反击⚔️/狂暴🔥/多阶段/召唤/回复/护盾）

### 6. 部署
- 构建通过后部署到 GitHub Pages
- `git add -A && git commit -m "[CTO] v3.0 UI集成: 锻造/采集/秘境面板 + Boss机制可视化" && git push`

## 参考
- 引擎模块：src/engine/forge.ts, gather.ts, dungeon.ts, smelt.ts, bossMechanic.ts
- Store：src/store/material.ts, forge.ts, gather.ts
- 数据配置：src/data/materials.json, forge-recipes.json, gather-nodes.json, dungeons.json 等
- CDO 设计稿：shared/context-bus/cdo/（如有新UI规格会补充）

## 验收标准
- [ ] 导航可切换到锻造/采集/秘境
- [ ] 锻造：选配方→消耗材料→产出装备，锻造等级升级
- [ ] 采集：开始→等待CD→收取材料，离线也有收益
- [ ] 秘境：挑战→战斗判定→掉落奖励
- [ ] Boss 机制在战斗中有视觉反馈
- [ ] TypeScript 零错误，Vite 构建通过
- [ ] 已部署到 GitHub Pages
