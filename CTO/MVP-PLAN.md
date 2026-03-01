# MVP-PLAN.md — 西游记 Idle Game MVP 开发计划

**日期**：2026-03-01  
**作者**：CTO  
**状态**：执行中

---

## 1. MVP 范围（对齐 PRD Phase 1）

- 核心战斗循环（自动攻击 + 点击攻击）
- 等级 + 境界系统（前5个境界：灵猴初醒→金丹）
- 章节 1-3（花果山·石猴出世 / 方寸山·拜师学艺 / 龙宫·夺宝）
- 离线收益（基础版）
- 装备系统（武器 + 护甲）
- 存档系统（localStorage 自动存档）
- PWA 支持（离线可用、添加到主屏幕）

## 2. 技术栈

| 组件 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 状态管理 | Zustand + persist middleware |
| 样式 | CSS Modules |
| 部署 | GitHub Pages + GitHub Actions |

## 3. 项目结构

```
src/
├── main.tsx                 # 入口
├── App.tsx                  # 根组件 + 游戏主循环
├── store/
│   └── gameStore.ts         # Zustand 全局游戏状态
├── engine/
│   ├── tick.ts              # 每秒 tick（自动战斗 + 资源累积）
│   ├── battle.ts            # 战斗计算（伤害、击杀、掉落）
│   ├── growth.ts            # 升级、境界突破
│   ├── offline.ts           # 离线收益计算
│   └── formulas.ts          # 数值公式集中管理
├── data/
│   ├── stages.ts            # 章节/关卡数据
│   ├── realms.ts            # 境界数据
│   ├── equipment.ts         # 装备数据
│   └── monsters.ts          # 怪物数据（由关卡公式生成）
├── components/
│   ├── BattleView.tsx       # 战斗主界面
│   ├── StatusBar.tsx        # 顶部状态栏
│   ├── UpgradePanel.tsx     # 升级面板
│   ├── EquipmentPanel.tsx   # 装备面板
│   ├── OfflineReport.tsx    # 离线报告弹窗
│   └── TabNav.tsx           # 底部导航
└── utils/
    ├── format.ts            # 大数格式化
    └── save.ts              # 存档工具
```

## 4. 模块拆分与职责

### M1: 游戏引擎层（engine/）
- **formulas.ts**：所有数值公式（怪物HP、掉落、升级经验、伤害）
- **battle.ts**：单次攻击计算、击杀判定、掉落结算、关卡推进
- **growth.ts**：经验→升级、属性分配、境界突破检查
- **tick.ts**：每秒调用 battle，累积资源，驱动游戏循环
- **offline.ts**：离线时长计算 → 模拟 tick 结果

### M2: 数据层（data/）
- 静态配置：章节、境界、装备模板
- 怪物数据由公式动态生成（不硬编码每只怪）

### M3: 状态层（store/）
- 单一 Zustand store，persist 到 localStorage
- 包含：角色属性、当前关卡、背包、战斗日志

### M4: UI 层（components/）
- 纯展示 + 事件触发，不含游戏逻辑
- 竖屏布局：状态栏 → 战斗区 → 操作区 → 底部Tab

## 5. 里程碑

| 里程碑 | 内容 | 交付物 |
|--------|------|--------|
| **M0** | 项目脚手架 + 核心引擎 | Vite项目 + engine/ 全部代码 |
| **M1** | 数据层 + 状态层 | data/ + store/ |
| **M2** | 战斗UI + 升级面板 | 可玩的战斗循环 |
| **M3** | 装备系统 + 离线收益 | 完整 MVP 功能 |
| **M4** | PWA + 部署 + 打磨 | 上线可用 |

当前任务：**M0 + M1**（引擎 + 数据 + 状态）
