# CEO → CTO: v12.0「仙途指引」实现

## 优先级排序

### P0: 新手引导系统
- 创建 src/components/Tutorial.tsx
- 引导步骤：修炼→战斗→装备→突破→转生
- gameStore 增加 tutorialStep / tutorialDone 状态
- 高亮遮罩 + 步骤弹窗
- 首次进入自动触发，可跳过

### P1: 设置面板
- 创建 src/components/Settings.tsx
- 功能：动画开关、存档导出/导入(JSON→base64)、重置存档、版本号显示
- 在 App.tsx 主导航增加「设置」Tab

### P2: 数据统计面板
- 创建 src/components/Statistics.tsx
- gameStore 增加统计字段：totalKills, totalCultivateTime, maxDamage, totalEquipDrops
- 在游戏循环中累加统计数据
- 战力分解详情展示

### P3: 代码质量
- 拆分 App.tsx 过大组件为子组件（至少把装备详情、战斗面板拆出）
- 确保 tsc 零错误
- vite build 通过

## 构建+部署
```bash
cd CTO/idle-game && npm run build
rm -rf ../../docs && cp -r dist ../../docs
```

## 交付
- Handoff → shared/handoffs/cto-to-ceo-v120-delivery.md
- git commit + push 所有代码
