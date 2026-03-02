# 技术方案 — 锻造系统 + 材料获取 + Boss机制

> 版本：3.0 | 作者：CTO | 日期：2026-03-02
> 状态：设计 + 实现（PRD 待 CPO 补充后可调整数值）

---

## 1. 系统概览

### 1.1 三大子系统

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│  锻造系统    │    │ 材料获取系统  │    │ Boss 机制增强  │
│ ForgeEngine  │◄───│ GatherEngine │    │ BossMechanic  │
│              │    │ DungeonEngine│    │               │
│ 配方+蓝图    │    │ 采集+秘境    │    │ 特殊技能      │
│ 随机属性     │    │ 炼化+日常    │    │ 多阶段        │
│ 成功率       │    │ 挂机产出     │    │ 狂暴          │
└──────┬───────┘    └──────┬───────┘    └──────┬────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                    EventBus 连通
```

### 1.2 模块化原则
- 所有新模块独立文件，不修改现有 engine 核心
- 通过 EventBus 与现有系统通信
- 新 JSON 配置独立文件
- 新 Store slice 独立

---

## 2. 锻造系统

### 2.1 数据模型

```typescript
// 材料
interface ForgeMaterial {
  id: string;           // 'iron_ore' | 'star_iron' | ...
  name: string;
  icon: string;
  tier: 1 | 2 | 3 | 4 | 5;  // 材料品级
  source: string;       // 获取途径描述
}

// 锻造配方
interface ForgeRecipe {
  id: string;
  name: string;
  resultTemplateId: string;  // 产出装备模板 ID
  resultSlot: EquipSlot;
  materials: { materialId: string; count: number }[];
  coinsCost: number;
  minQuality: Quality;       // 保底品质
  forgeTime: number;         // 锻造耗时(秒), 0=即时
  successRate: number;       // 基础成功率 0-1
  levelRequired: number;     // 锻造等级需求
}

// 锻造结果
interface ForgeResult {
  success: boolean;
  item?: EquipmentInstance;  // 成功时
  quality?: Quality;
  bonusRolls?: string[];     // 随机附加属性描述
  message: string;
}
```

### 2.2 锻造引擎 API

```typescript
const ForgeEngine = {
  // 检查材料是否足够
  canForge(recipe: ForgeRecipe, materials: Record<string, number>, coins: Decimal, forgeLevel: number): { ok: boolean; missing: string[] };

  // 执行锻造
  doForge(recipe: ForgeRecipe): ForgeResult;

  // 品质抽奖: 基于成功率和锻造等级
  rollQuality(recipe: ForgeRecipe, forgeLevel: number): Quality;

  // 随机属性: 0-3 条附加词条
  rollBonusStats(quality: Quality): BonusStat[];

  // 锻造经验: 每次锻造获得经验
  getForgeExp(recipe: ForgeRecipe): number;
};
```

### 2.3 锻造等级系统
- 1-50 级，每级需要递增经验
- 等级提升 → 解锁高级配方 + 提高成功率 + 提高品质概率
- 经验公式: `exp_required(lv) = 100 × lv^1.5`

### 2.4 随机属性系统
- 锻造产出装备可附带 0-3 条随机词条
- 词条数量: common=0, spirit=0-1, immortal=1-2, divine=2-3, chaos=3, hongmeng=3+特殊
- 词条池: 攻击%、防御%、HP%、暴击率、暴击伤害、修炼加速、金币加成

---

## 3. Boss 机制增强

### 3.1 Boss 特殊机制

```typescript
type BossMechanic =
  | { type: 'immune'; element: string; duration: number }     // 免疫某类伤害
  | { type: 'reflect'; percent: number; duration: number }    // 反击
  | { type: 'enrage'; hpThreshold: number; atkBoost: number } // 狂暴
  | { type: 'phase'; phases: BossPhase[] }                    // 多阶段
  | { type: 'summon'; minionId: string; count: number; interval: number } // 召唤小怪
  | { type: 'heal'; percent: number; cooldown: number }       // 自我回复
  | { type: 'shield'; amount: string; breakCondition: string }; // 护盾

interface BossPhase {
  hpPercent: number;    // 触发血量百分比
  atkMultiplier: number;
  defMultiplier: number;
  mechanic?: BossMechanic;
  announcement: string; // "Boss 进入狂暴状态！"
}
```

### 3.2 Boss 属性缩放

```
boss_atk(n) = floor(bossHp(n) / 15 × (1 + mechanics_bonus(n)))
boss_def(n) = floor(bossHp(n) / 20)

mechanics_bonus(n):
  n <= 9:  0      (纯数值战)
  n <= 27: 0.1    (引入单一机制)
  n <= 54: 0.25   (组合机制)
  n <= 81: 0.5    (复杂机制)
```

### 3.3 机制分配

| 关卡区间 | 机制 |
|---------|------|
| 1-9 | 无特殊机制 |
| 10-18 | enrage (30% HP → 攻击×1.5) |
| 19-27 | phase (2阶段) + enrage |
| 28-36 | reflect + phase |
| 37-45 | immune + summon |
| 46-54 | shield + heal |
| 55-63 | 3阶段 + enrage + immune |
| 64-72 | shield + summon + reflect |
| 73-81 | 全机制组合 |

---

## 4. 材料获取系统

### 4.1 采集系统

```typescript
interface GatherNode {
  id: string;
  name: string;
  icon: string;
  location: string;       // 采集地点
  materials: { materialId: string; chance: number; countRange: [number, number] }[];
  gatherTime: number;     // 采集耗时(秒)
  cooldown: number;       // 冷却(秒)
  unlockRealm: string;    // 解锁境界
}
```

- 玩家可同时采集 1 个节点（后期升级可+1）
- 采集为定时器模式：点击开始 → 等待 → 收取
- 支持离线采集（效率 50%）

### 4.2 秘境/副本系统

```typescript
interface Dungeon {
  id: string;
  name: string;
  icon: string;
  tier: number;
  waves: number;
  bossId: string;
  rewards: { materialId: string; count: number; chance: number }[];
  dailyLimit: number;     // 每日次数
  staminaCost: number;
  unlockStage: number;    // 需通关第 N 难
}
```

### 4.3 炼化合成

```typescript
interface SmeltRecipe {
  id: string;
  inputs: { materialId: string; count: number }[];
  output: { materialId: string; count: number };
  coinsCost: number;
}
```

- 低级材料合成高级材料 (3:1 or 5:1)
- 特殊材料通过特定组合获得

### 4.4 挂机产出差异化

| 地点 | 修为倍率 | 材料产出 | 解锁条件 |
|------|---------|---------|---------|
| 长安城 | ×1.0 | 无 | 初始 |
| 五行山 | ×1.2 | 铁矿、灵石碎片 | 练气 |
| 花果山 | ×1.5 | 灵木、仙果 | 筑基 |
| 天宫 | ×2.0 | 星铁、天材 | 金丹 |
| 灵山 | ×3.0 | 佛光石、圣物 | 天仙 |

---

## 5. 文件结构

```
src/engine/
├── forge.ts          # 锻造引擎
├── gather.ts         # 采集系统
├── dungeon.ts        # 秘境引擎
├── smelt.ts          # 炼化合成
├── bossMechanic.ts   # Boss 特殊机制
src/store/
├── forge.ts          # 锻造状态
├── gather.ts         # 采集状态
├── material.ts       # 材料背包
src/data/configs/
├── forge-recipes.json
├── materials.json
├── gather-nodes.json
├── dungeons.json
├── smelt-recipes.json
├── boss-mechanics.json
├── idle-locations.json
```

---

## 6. 与现有系统集成

- **EventBus**: FORGE_SUCCESS / GATHER_COMPLETE / DUNGEON_CLEAR / SMELT_DONE
- **PlayerStore**: forgeLevel + forgeExp 新增字段
- **EquipStore**: 锻造产出装备直接进背包
- **Battle**: Boss 机制通过 bossMechanic.ts 注入 tickBattle
- **SaveManager**: 新 store 数据纳入存档
