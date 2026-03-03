# CEO → CTO: v13.0「洞天福地」技术实现

## 版本主题
v13.0「洞天福地」— 个人领地 + 探索 + 仙缘

## 实现要求

### 1. 洞天引擎 (`src/engine/sanctuary.ts`)
- SanctuaryEngine 管理 5 种建筑的等级、产出、升级
- 建筑：灵田/丹房/藏经阁/锻造炉/聚灵阵，各10级
- 升级消耗灵石+材料，产出随等级增长
- 每 tick 结算产出，接入 GameStore

### 2. 秘境引擎 (`src/engine/exploration.ts`)
- ExplorationEngine 生成随机事件链（5~8节点）
- 事件类型：battle/treasure/fortune/trap/merchant
- 4个难度等级，战力门槛检查
- 每日免费3次，额外消耗灵石

### 3. 仙缘引擎 (`src/engine/affinity.ts`)
- AffinityEngine 管理6个NPC好感度(0~100)
- 赠礼/任务/偶遇提升好感度
- 每20点解锁buff，100点解锁专属技能
- buff 接入战斗/修炼公式

### 4. UI面板
- SanctuaryPanel.tsx — 洞天建筑管理界面
- ExplorationPanel.tsx — 秘境探索界面（节点地图+事件）
- AffinityPanel.tsx — 仙缘NPC列表+好感度+赠礼

### 5. Store 集成
- 在 gameStore 中添加 sanctuary/exploration/affinity state
- 存档兼容（新字段默认值）

### 6. 注册到 App.tsx
- 添加3个新Tab到导航

## 构建+部署
```bash
cd CTO/idle-game && npm run build
rm -rf ../../docs && cp -r dist ../../docs
```

## Git
```bash
cd /Users/zengfu/workspace/openclaw/idleGame && git add -A && git commit -m "[CTO] v13.0 洞天福地: 洞天+秘境+仙缘引擎+UI" && git push
```

## 交付
写 shared/handoffs/cto-to-ceo-v130-delivery.md
