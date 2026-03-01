# CTO v1.2 开发完成

## 完成内容
1. ✅ 精炼系统（混沌→鸿蒙，10%成功率，碎片保底10次必出）
2. ✅ 鸿蒙高阶强化（+11~+15，降级机制，护级符/幸运符）
3. ✅ 道具商店（天命符/护级符/幸运符，蟠桃购买）
4. ✅ +15隐藏被动（鸿蒙一击/混沌护盾/鸿蒙之力）
5. ✅ 存档迁移 v3→v4
6. ✅ UI：精炼面板、高阶强化面板、道具商店
7. ✅ Build 通过

## 文件变更
- types.ts: 新增碎片/道具字段
- data/equipment.ts: 精炼/高阶强化/隐藏被动逻辑
- store/gameStore.ts: refineItem/buyScroll/增强enhanceEquip
- App.tsx: RefinePanel/ScrollShop组件 + 高阶强化UI
