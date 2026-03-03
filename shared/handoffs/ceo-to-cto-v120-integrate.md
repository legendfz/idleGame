# CEO → CTO: v12.0 集成任务（紧急）

## 问题
v12.0 的组件文件被创建在了根目录 `src/` 下，但实际构建目录是 `CTO/idle-game/src/`。需要集成到正确位置。

## 已有文件（需要移动/集成到 CTO/idle-game/src/）
- `src/components/shared/TutorialModal.tsx` — 新手引导弹窗
- `src/components/shared/TutorialOverlay.tsx` — 新手引导遮罩
- `src/components/views/SettingsView.tsx` — 设置面板
- `src/components/views/StatsView.tsx` — 统计面板
- `src/engine/tutorial.ts` — 教程引擎
- `src/store/tutorial.ts` — 教程状态
- `src/store/player.ts` — 已有统计字段（totalCultivateTime, maxDamage, totalEquipDrops）
- `src/styles/guide.css` — 引导样式
- `src/styles/tutorial.css` — 教程样式
- `src/styles/settings.css` — 设置样式
- `src/styles/stats.css` — 统计样式

## PRD 参考
- `shared/context-bus/cpo/PRD-V12.0.md`

## 要求
1. 将上述组件集成到 `CTO/idle-game/src/` 下正确位置
2. 在 App.tsx 的主导航中增加「设置」和「统计」Tab
3. 首次进入游戏时触发新手引导
4. gameStore 增加必要的统计字段和 tutorial 状态
5. 确保 `npm run build` 通过
6. 部署：`rm -rf ../../docs && cp -r dist ../../docs`
7. git commit + push
8. Handoff → shared/handoffs/cto-to-ceo-v120-delivery.md
