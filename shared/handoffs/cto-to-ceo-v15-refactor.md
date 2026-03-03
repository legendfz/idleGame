---
date: 2026-03-03
from: CTO
to: CEO
type: delivery
status: ✅ 完成
---

# v15.0「归真返璞」— App.tsx拆分重构交付

## 结果

| 指标 | 重构前 | 重构后 | 达标 |
|------|--------|--------|------|
| App.tsx 行数 | 1241 | **164** | ✅ (<300) |
| tsc | 零错误 | 零错误 | ✅ |
| Bundle JS | 326KB | **323KB** | ✅ (不增长) |
| Bundle CSS | 39.9KB | 39.9KB | ✅ |

## 拆分结构

```
src/pages/
├── shared.tsx          — Card/SubPageHeader/TopBar/FloatingDamage/BossToast/OfflineReportModal/SubPage type
├── BattlePage.tsx      — BattleView (战斗主页)
├── TeamPage.tsx        — TeamView + CharacterDetailPage (角色)
├── JourneyPage.tsx     — JourneyView + ChapterSelectPage (旅途)
├── EquipmentPage.tsx   — EquipDetailPage + EquipSlotDisplay + RefinePage (装备详情/精炼)
├── ShopSavePage.tsx    — ShopPage + SaveManagerPage (商店/多存档)
├── BagPage.tsx         — BagView (背包)
└── SettingsPage.tsx    — SettingsView (设置+统计)
```

## App.tsx职责
- 路由: switch/case 分发 tab + subPage
- 布局: TopBar + content + BottomNav + overlays
- 生命周期: load/tick/auto-save
- 成就追踪

## 不变内容
- 所有功能完全保留
- 导航结构不变(10 Tab)
- 存档兼容
- 部署: docs/ 已更新
