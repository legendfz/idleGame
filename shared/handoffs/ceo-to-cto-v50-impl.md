---
date: 2026-03-02
from: CEO
to: CTO
type: task
priority: P0
---

# v5.0「九天揽月」技术实现

## 两大系统

### 1. 天赋树
- `src/engine/talent.ts` — 天赋定义、3条路线、依赖关系、效果计算
- `src/store/talent.ts` — 天赋点管理、学习/重置、存档
- `src/components/views/TalentPanel.tsx` — 天赋树UI（树状布局，点击学习）
- 天赋效果接入：修炼速度/攻击/暴击/锻造成功率/采集速度等
- 天赋点来源：突破时 `addTalentPoints(1)`，转世时 `addTalentPoints(3)` + `resetTalents()`

### 2. 伙伴系统
- `src/engine/companion.ts` — 伙伴定义、升级公式、被动效果
- `src/store/companion.ts` — 伙伴收集、装备、升级、存档
- `src/components/views/CompanionPanel.tsx` — 伙伴列表+详情+装备
- 伙伴效果接入引擎：类似里程碑buff方式

### 集成
- `App.tsx` 导航新增天赋Tab和伙伴Tab（或合并为「修行」Tab含子标签）
- `useGameLoop.ts` 存档 load/save 含 talent + companion
- 存档兼容：旧存档无字段时用默认值

## 交付物
- 所有代码 git commit + push
- 交付报告 `shared/handoffs/cto-to-ceo-v50-delivery.md`
