# 技术方案 v2.0 — 西游记 Idle Game

> 版本：2.0 | 作者：CTO | 日期：2026-03-02
> 状态：Draft → 待 CEO 审批

---

## 1. 架构设计

### 1.1 整体架构

```
┌──────────────────────────────────────────────────┐
│                  Presentation Layer               │
│  React 19 + CSS Modules + Framer Motion          │
│  ┌─────────┬──────────┬─────────┬──────────┐     │
│  │MainView │BattleView│CharView │ MapView  │     │
│  └────┬────┴────┬─────┴────┬────┴────┬─────┘     │
├───────┴─────────┴──────────┴────────┴────────────┤
│                  State Layer                      │
│  Zustand stores (slices) + Immer                 │
│  ┌──────┬───────┬────────┬───────┬──────────┐    │
│  │Player│Battle │Equipment│Journey│ Settings │    │
│  └──┬───┴───┬───┴────┬───┴───┬───┴────┬─────┘    │
├─────┴───────┴────────┴───────┴────────┴──────────┤
│                  Engine Layer                     │
│  Pure TS — no UI deps, fully testable            │
│  ┌──────────┬───────────┬──────────┬───────────┐ │
│  │TickEngine│BattleCalc │LootSystem│BigNumber  │ │
│  │IdleCalc  │BreakThru  │Equipment │FormulaLib │ │
│  └──────────┴───────────┴──────────┴───────────┘ │
├──────────────────────────────────────────────────┤
│                  Data Layer                       │
│  Static JSON configs + localStorage persistence  │
│  ┌──────────┬───────────┬──────────┐             │
│  │ConfigDB  │SaveManager│Migration │             │
│  └──────────┴───────────┴──────────┘             │
└──────────────────────────────────────────────────┘
```

### 1.2 核心设计原则

1. **Engine/UI 分离**：所有游戏逻辑在 Engine Layer，零 React 依赖，可独立单测
2. **Tick-driven**：统一游戏循环，Engine 每帧计算 delta，UI 按需订阅渲染
3. **Config-driven**：所有数值（境界、关卡、装备）来自 JSON 配置表，无硬编码
4. **大数字优先**：全部数值用 Decimal（break_infinity.js），从第一行代码开始

### 1.3 与 v1.x 关系：**全面重写**

**理由：**
- v1.x 无 Engine/UI 分离，逻辑散在组件中
- v1.x 数值系统不支持指数增长（无大数字库）
- v2.0 玩法完全不同（修炼境界 vs 装备掉落）
- 重写成本 < 渐进重构 + 适配成本

**迁移策略：**
- v1.x 存档不兼容 v2.0（完全不同的数据模型）
- 保留 v1.x 代码在 `CTO/idle-game/`，v2.0 新建 `src/` 目录
- 复用 v1.x 构建配置（Vite + React + TypeScript + GitHub Pages）

---

## 2. 组件拆分

### 2.1 模块列表

| 模块 | 路径 | 职责 |
|------|------|------|
| **TickEngine** | `src/engine/tick.ts` | 游戏主循环，每帧计算 deltaTime，分发给各子系统 |
| **IdleCalc** | `src/engine/idle.ts` | 修为产出计算、离线收益计算 |
| **BattleCalc** | `src/engine/battle.ts` | 战斗伤害、点击、自动攻击、Boss 限时 |
| **BreakThrough** | `src/engine/breakthrough.ts` | 境界突破逻辑、条件判断 |
| **EquipmentEngine** | `src/engine/equipment.ts` | 装备穿戴、强化、掉落生成 |
| **LootSystem** | `src/engine/loot.ts` | 战利品生成、概率表 |
| **JourneyEngine** | `src/engine/journey.ts` | 取经进度、关卡推进、星级评定 |
| **FormulaLib** | `src/engine/formulas.ts` | 所有数值公式集中管理 |
| **BigNum** | `src/engine/bignum.ts` | Decimal 封装 + 格式化（K/M/B/T/aa/ab...） |
| **EventBus** | `src/engine/events.ts` | 全局事件系统（发布/订阅） |
| **ConfigDB** | `src/data/config.ts` | 静态配置加载与查询 |
| **SaveManager** | `src/data/save.ts` | 存档读写、导入导出、版本迁移 |
| **PlayerStore** | `src/store/player.ts` | 玩家状态（修为、境界、资源） |
| **BattleStore** | `src/store/battle.ts` | 战斗状态（当前关卡、Boss 血量） |
| **EquipStore** | `src/store/equipment.ts` | 装备背包、穿戴状态 |
| **JourneyStore** | `src/store/journey.ts` | 取经进度状态 |
| **UIStore** | `src/store/ui.ts` | UI 状态（当前页面、弹窗、动画队列） |

### 2.2 目录结构

```
src/
├── engine/              # 纯逻辑引擎（零 UI 依赖）
│   ├── tick.ts          # 游戏主循环
│   ├── idle.ts          # 挂机计算
│   ├── battle.ts        # 战斗系统
│   ├── breakthrough.ts  # 境界突破
│   ├── equipment.ts     # 装备逻辑
│   ├── loot.ts          # 掉落系统
│   ├── journey.ts       # 取经进度
│   ├── formulas.ts      # 数值公式
│   ├── bignum.ts        # 大数字工具
│   ├── events.ts        # 事件总线
│   └── __tests__/       # 引擎单测
├── data/
│   ├── config.ts        # 配置加载器
│   ├── save.ts          # 存档管理
│   ├── configs/         # JSON 配置文件
│   │   ├── realms.json      # 境界配置
│   │   ├── characters.json  # 角色配置
│   │   ├── stages.json      # 关卡配置
│   │   ├── equipment.json   # 装备模板
│   │   ├── monsters.json    # 妖怪配置
│   │   └── loot-tables.json # 掉落表
│   └── migrations/      # 存档迁移脚本
├── store/               # Zustand 状态切片
│   ├── index.ts         # 合并 store
│   ├── player.ts
│   ├── battle.ts
│   ├── equipment.ts
│   ├── journey.ts
│   └── ui.ts
├── components/          # React UI 组件
│   ├── layout/
│   │   ├── TopBar.tsx       # 顶栏（资源显示）
│   │   ├── BottomNav.tsx    # 底部导航
│   │   └── AppShell.tsx     # 整体布局
│   ├── views/
│   │   ├── IdleView.tsx     # 修炼主界面（点击区+修炼信息）
│   │   ├── BattleView.tsx   # 战斗界面
│   │   ├── CharacterView.tsx# 角色面板
│   │   ├── InventoryView.tsx# 背包界面
│   │   ├── JourneyMap.tsx   # 取经地图
│   │   └── OfflineReward.tsx# 离线收益弹窗
│   ├── shared/
│   │   ├── BigNumber.tsx    # 大数字显示组件
│   │   ├── ProgressBar.tsx  # 进度条
│   │   ├── QualityBadge.tsx # 品质标签
│   │   ├── ItemCard.tsx     # 装备卡片
│   │   └── Modal.tsx        # 通用弹窗
│   └── effects/
│       ├── ClickEffect.tsx  # 点击涟漪+伤害数字
│       ├── BreakthroughFX.tsx # 突破动画
│       └── LootDrop.tsx     # 掉落动画
├── hooks/
│   ├── useGameLoop.ts   # 接入 TickEngine 的 React hook
│   ├── useIdleCalc.ts   # 修为计算 hook
│   └── useBattle.ts     # 战斗 hook
├── styles/
│   ├── variables.css    # CSS 变量（设计指南色彩）
│   ├── global.css       # 全局样式
│   └── animations.css   # 共用动画
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### 2.3 模块依赖关系

```
ConfigDB ← FormulaLib ← IdleCalc ← TickEngine
                      ← BattleCalc ←┘
                      ← BreakThrough
                      ← EquipmentEngine ← LootSystem
                      ← JourneyEngine

EventBus ← (所有引擎模块发布事件)

Store(s) ← Engine(s)  (Store 调用 Engine 计算，存储结果)
Components ← Store(s) (组件订阅 Store，渲染 UI)
Components ← EventBus (组件监听事件，触发动画)
```

---

## 3. 技术选型

| 类别 | 选择 | 理由 |
|------|------|------|
| **语言** | TypeScript 5.7+ strict | 类型安全，v1.x 已验证 |
| **框架** | React 19 | v1.x 已用，团队熟悉，生态成熟 |
| **构建** | Vite 6 | v1.x 已用，HMR 快，配置简单 |
| **状态管理** | Zustand 5 + Immer | 轻量、切片化、v1.x 已用 |
| **大数字** | break_infinity.js | Idle Game 标准库，支持 e9e15 级别数字 |
| **动画** | Framer Motion 11 | 声明式动画、手势支持、性能好 |
| **CSS** | CSS Modules + CSS Variables | 局部作用域、设计 token 用变量管理 |
| **字体** | Noto Serif SC + Noto Sans SC (CDN) | 设计指南指定，Google Fonts 免费 |
| **数字字体** | Roboto Mono (CDN) | 等宽数字，清晰 |
| **测试** | Vitest | 与 Vite 原生集成，快 |
| **部署** | GitHub Pages (gh-pages) | 沿用 v1.x，零成本 |
| **Lint** | ESLint + Prettier | 代码规范 |

### 新增依赖

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "immer": "^10.0.0",
    "break_infinity.js": "^2.0.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "~5.7.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

### 打包体积预估

| 包 | gzip 大小 |
|----|----------|
| React + ReactDOM | ~45KB |
| Zustand + Immer | ~8KB |
| break_infinity.js | ~5KB |
| Framer Motion | ~35KB |
| 业务代码 | ~50KB |
| JSON 配置 | ~20KB |
| **总计** | **~163KB** (远 < 2MB 限制) |

---

## 4. 数据模型

### 4.1 游戏状态（TypeScript Interface）

```typescript
import Decimal from 'break_infinity.js';

// ========== 核心状态 ==========

interface GameState {
  version: string;           // 存档版本号
  createdAt: number;         // 创建时间戳
  lastSavedAt: number;       // 最后保存时间
  lastOnlineAt: number;      // 最后在线时间（离线计算用）
  player: PlayerState;
  characters: CharacterState[];
  activeCharId: string;      // 当前主控角色 ID
  inventory: InventoryState;
  journey: JourneyState;
  stats: GameStats;          // 统计数据
}

// ========== 玩家状态 ==========

interface PlayerState {
  xiuwei: string;            // 修为（Decimal 序列化为 string）
  coins: string;             // 金币
  lingshi: string;           // 灵石
  realmId: string;           // 当前境界 ID
  realmLevel: number;        // 境界小层级 (1-9)
}

// ========== 角色状态 ==========

interface CharacterState {
  id: string;                // 'tangseng' | 'wukong' | ...
  unlocked: boolean;
  level: number;
  exp: string;               // Decimal string
  equipment: EquippedSlots;
  // 技能树 (v2.1)
}

interface EquippedSlots {
  weapon: string | null;     // 装备实例 ID
  headgear: string | null;
  armor: string | null;
  accessory: string | null;
  mount: string | null;
  treasure: string | null;
}

// ========== 装备状态 ==========

interface InventoryState {
  items: EquipmentInstance[];
  maxSlots: number;
}

interface EquipmentInstance {
  uid: string;               // 唯一实例 ID (nanoid)
  templateId: string;        // 装备模板 ID
  quality: Quality;
  enhanceLevel: number;      // +0 ~ +15
  baseAtk: string;           // Decimal string
  baseDef: string;
  baseHp: string;
}

type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'chaos' | 'hongmeng';

// ========== 取经进度 ==========

interface JourneyState {
  currentStage: number;      // 当前难数 (1-81)
  stages: StageRecord[];     // 每关记录
  dailyReset: number;        // 每日劫难重置时间
}

interface StageRecord {
  stageId: number;
  stars: 0 | 1 | 2 | 3;     // 0=未通关
  bestTime: number | null;   // 最快通关时间(ms)
  sweepUnlocked: boolean;
}

// ========== 战斗状态（运行时，不存档）==========

interface BattleRuntimeState {
  active: boolean;
  stageId: number;
  wave: number;              // 当前波次
  totalWaves: number;
  enemies: EnemyRuntime[];
  boss: BossRuntime | null;
  bossTimer: number;         // Boss 倒计时(ms)
  clickCombo: number;        // 连击计数
  comboBuff: number;         // 连击 buff 剩余时间(ms)
  autoDps: string;           // Decimal string
  lootQueue: LootDrop[];     // 待领取掉落
}

interface EnemyRuntime {
  id: string;
  templateId: string;
  currentHp: string;
  maxHp: string;
}

interface BossRuntime extends EnemyRuntime {
  timeLimit: number;         // 限时(ms)
  elapsed: number;
}

// ========== 统计 ==========

interface GameStats {
  totalXiuwei: string;       // 累计修为
  totalClicks: number;
  totalKills: number;
  totalBreakthroughs: number;
  playTime: number;          // 总在线时间(ms)
  prestigeCount: number;     // 转世次数 (v2.2+)
}
```

### 4.2 存档格式

```typescript
interface SaveFile {
  magic: 'XIYOU_IDLE';      // 魔数标识
  version: number;           // 存档版本（递增整数）
  timestamp: number;
  compressed: boolean;       // 是否 LZ 压缩
  data: string;              // JSON.stringify(GameState) 或压缩后 base64
  checksum: string;          // SHA-256 hash（防篡改）
}
```

- **存储位置**：`localStorage['xiyou_idle_save']`
- **自动保存**：每 30 秒 + 页面关闭前
- **导出**：下载 `.json` 文件
- **导入**：上传 `.json`，校验 checksum + 版本迁移
- **版本迁移**：`migrations/` 下按版本号顺序执行迁移函数

### 4.3 配置表结构

#### realms.json — 境界配置

```typescript
interface RealmConfig {
  id: string;           // 'fanren' | 'lianqi' | ...
  name: string;         // '凡人'
  order: number;        // 排序
  maxLevel: number;     // 小层级数 (9)
  xiuweiRequired: string; // 突破需要修为 (Decimal string)
  multiplier: number;   // 突破后修炼速度倍率
  materials?: { itemId: string; count: number }[]; // 突破材料
  trialStageId?: number; // 试炼关卡 ID
}
```

#### characters.json — 角色配置

```typescript
interface CharacterConfig {
  id: string;
  name: string;         // '孙悟空'
  role: string;         // 'dps' | 'tank' | 'support' | 'speed'
  baseAtk: number;
  baseDef: number;
  baseHp: number;
  atkGrowth: number;    // 每级攻击成长
  passive: PassiveSkill;
  unlockCondition: string; // 解锁条件描述
}

interface PassiveSkill {
  id: string;
  name: string;
  description: string;
  effect: { type: string; value: number }; // e.g. { type: 'critRate', value: 0.1 }
}
```

#### stages.json — 关卡配置

```typescript
interface StageConfig {
  id: number;            // 1-81
  chapter: number;       // 章节号 1-9
  name: string;          // '初遇虎妖'
  waves: WaveConfig[];
  boss: BossConfig;
  rewards: RewardConfig;
  recommendedPower: number;
}

interface WaveConfig {
  enemies: { monsterId: string; count: number }[];
}

interface BossConfig {
  monsterId: string;
  hpMultiplier: number;
  timeLimit: number;     // 秒
  specialMechanic?: string;
}

interface RewardConfig {
  firstClear: { coins: string; lingshi: number; items?: string[] };
  normal: { coins: string; expRange: [string, string] };
  lootTableId: string;
}
```

#### equipment.json — 装备模板

```typescript
interface EquipmentTemplate {
  id: string;
  name: string;          // '如意金箍棒'
  slot: 'weapon' | 'headgear' | 'armor' | 'accessory' | 'mount' | 'treasure';
  baseQuality: Quality;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
  enhanceCostBase: number;  // 强化基础金币消耗
  description: string;
  lore: string;          // 西游记典故
}
```

---

## 5. API 设计

### 5.1 游戏引擎 API

```typescript
// ===== TickEngine =====
class TickEngine {
  start(): void;                    // 启动游戏循环
  stop(): void;                     // 停止
  pause(): void;
  resume(): void;
  onTick(callback: (dt: number) => void): () => void;  // 注册 tick 回调，返回 unsubscribe
  getFps(): number;
}

// ===== IdleCalc =====
const IdleCalc = {
  getXiuweiPerSecond(state: PlayerState, chars: CharacterState[], configs: RealmConfig[]): Decimal;
  calcOfflineReward(lastOnline: number, now: number, xps: Decimal): OfflineReward;
  canBreakthrough(state: PlayerState, realmConfig: RealmConfig): boolean;
  doBreakthrough(state: PlayerState, realmConfig: RealmConfig): PlayerState;
};

interface OfflineReward {
  duration: number;      // 离线秒数（capped 24h）
  xiuwei: Decimal;
  coins: Decimal;
  bonusApplied: boolean; // 是否触发 >8h bonus
}

// ===== BattleCalc =====
const BattleCalc = {
  calcClickDamage(state: GameState): { damage: Decimal; isCrit: boolean };
  calcAutoDps(state: GameState): Decimal;
  processClick(battle: BattleRuntimeState, damage: Decimal): BattleRuntimeState;
  tickBattle(battle: BattleRuntimeState, dt: number, autoDps: Decimal): BattleRuntimeState;
  checkWaveComplete(battle: BattleRuntimeState): boolean;
  generateLoot(stage: StageConfig, stars: number): LootDrop[];
};

// ===== EquipmentEngine =====
const EquipmentEngine = {
  generateEquip(templateId: string, qualityOverride?: Quality): EquipmentInstance;
  calcEnhanceCost(item: EquipmentInstance): Decimal;
  calcEnhanceRate(item: EquipmentInstance): number; // 0-1
  tryEnhance(item: EquipmentInstance): { success: boolean; result: EquipmentInstance };
  calcEquipStats(item: EquipmentInstance): { atk: Decimal; def: Decimal; hp: Decimal };
  calcTotalStats(char: CharacterState, inventory: InventoryState): CharTotalStats;
};

// ===== JourneyEngine =====
const JourneyEngine = {
  canEnterStage(stageId: number, journey: JourneyState): boolean;
  initBattle(stageConfig: StageConfig): BattleRuntimeState;
  completeStage(stageId: number, result: BattleResult): { journey: JourneyState; rewards: RewardConfig };
  canSweep(stageId: number, journey: JourneyState): boolean;
  doSweep(stageId: number, journey: JourneyState): SweepResult;
};
```

### 5.2 事件系统

```typescript
// 事件类型枚举
type GameEvent =
  | { type: 'XIUWEI_GAINED'; amount: Decimal }
  | { type: 'BREAKTHROUGH'; fromRealm: string; toRealm: string }
  | { type: 'CLICK'; damage: Decimal; isCrit: boolean; position: { x: number; y: number } }
  | { type: 'COMBO_ACTIVATED'; multiplier: number }
  | { type: 'ENEMY_KILLED'; monsterId: string }
  | { type: 'BOSS_KILLED'; monsterId: string; timeUsed: number }
  | { type: 'BOSS_TIMEOUT' }
  | { type: 'STAGE_COMPLETE'; stageId: number; stars: number }
  | { type: 'LOOT_DROP'; items: LootDrop[] }
  | { type: 'EQUIP_ENHANCED'; item: EquipmentInstance; success: boolean }
  | { type: 'EQUIP_EQUIPPED'; charId: string; slot: string; item: EquipmentInstance }
  | { type: 'OFFLINE_REWARD'; reward: OfflineReward }
  | { type: 'SAVE_COMPLETE' }
  | { type: 'SAVE_ERROR'; error: string };

// EventBus API
class EventBus {
  emit(event: GameEvent): void;
  on<T extends GameEvent['type']>(type: T, handler: (event: Extract<GameEvent, { type: T }>) => void): () => void;
  once<T extends GameEvent['type']>(type: T, handler: (event: Extract<GameEvent, { type: T }>) => void): void;
  off(type: GameEvent['type'], handler: Function): void;
}

// 全局单例
export const eventBus = new EventBus();
```

**事件用途：**
- Engine → Store：状态更新通知
- Engine → UI：触发动画（点击特效、突破特效、掉落动画）
- Store → SaveManager：状态变更后自动保存

### 5.3 存档 API

```typescript
const SaveManager = {
  save(state: GameState): void;             // 保存到 localStorage
  load(): GameState | null;                 // 加载存档
  exportToFile(): Blob;                     // 导出 JSON 文件
  importFromFile(file: File): Promise<GameState>;  // 导入并验证
  deleteSave(): void;                       // 删除存档
  getLastSaveTime(): number | null;
  migrateIfNeeded(raw: any): GameState;     // 版本迁移
};
```

---

## 6. 里程碑拆分

### 总览

| # | 里程碑 | 范围 | 预计工时 | 交付物 |
|---|--------|------|----------|--------|
| M1 | 项目脚手架 | 工程搭建+基础框架 | 1 天 | 可运行的空壳项目 |
| M2 | 核心循环 | 挂机修炼+境界突破+点击 | 2 天 | 可挂机可点击的原型 |
| M3 | 战斗系统 | 关卡战斗+Boss 战+掉落 | 2 天 | 第一章可战斗 |
| M4 | 装备系统 | 背包+穿戴+强化 | 1.5 天 | 完整装备流程 |
| M5 | UI 打磨 | 设计指南落地+动画+地图 | 2 天 | 视觉完整的产品 |
| M6 | 数据平衡+测试+部署 | 数值调优+QA+上线 | 1.5 天 | v2.0 发布 |

**总计：约 10 个工作日**

---

### M1：项目脚手架（1 天）

**范围：**
- 新建 v2.0 项目目录结构
- 配置 Vite + React + TypeScript + Vitest
- 安装所有依赖（break_infinity.js, framer-motion, immer）
- 实现 CSS Variables（设计指南色彩系统）
- 实现 AppShell + BottomNav + TopBar 空壳
- 实现 BigNum 工具类 + 格式化
- 实现 EventBus
- 实现 SaveManager 基础框架
- 配置 GitHub Pages 部署

**交付：**
- `npm run dev` 可运行，显示空白 UI 框架
- `npm test` BigNum + EventBus 单测通过
- GitHub Pages 部署成功

### M2：核心循环（2 天）

**范围：**
- TickEngine 游戏主循环
- IdleCalc 修为产出 + 离线收益
- BreakThrough 境界突破
- PlayerStore 状态管理
- IdleView 界面：修为显示、产出速度、突破按钮
- OfflineReward 弹窗
- 点击产出修为（基础点击 + 暴击 + 连击）
- 前 5 个境界配置数据
- 自动保存

**交付：**
- 可挂机修炼，修为自动增长
- 可点击加速
- 可突破境界（凡人→练气→筑基→金丹→元婴→化神）
- 关闭再打开有离线收益
- **这是 MVP 最小可玩版本**

### M3：战斗系统（2 天）

**范围：**
- BattleCalc 战斗引擎
- JourneyEngine 取经进度
- BattleView 战斗界面：妖怪显示、血条、点击攻击
- Boss 限时战
- 波次推进逻辑
- LootSystem 掉落生成
- 第一章（1-9 难）关卡+妖怪配置数据
- 星级评定 + 扫荡

**交付：**
- 可进入关卡战斗
- 点击 + 自动攻击击败妖怪
- Boss 战有倒计时
- 战斗掉落金币和装备
- 第一章 9 关可通关

### M4：装备系统（1.5 天）

**范围：**
- EquipmentEngine 装备逻辑
- EquipStore 状态管理
- InventoryView 背包界面
- CharacterView 角色面板（装备槽位、属性面板）
- 装备穿戴/卸下
- 强化系统（+1~+10）
- 角色切换（唐僧/悟空）
- 装备品质显示（凡/灵/仙 三个品质）

**交付：**
- 背包查看装备
- 穿戴装备到角色
- 强化装备，属性提升
- 角色切换生效

### M5：UI 打磨（2 天）

**范围：**
- 按设计指南落地全部色彩、字体、组件规范
- JourneyMap 取经地图（81 节点路线图）
- 点击特效（涟漪 + 伤害数字 + 暴击金字）
- 突破动画（全屏金光）
- 掉落动画（品质光柱）
- 按钮按压反馈
- 移动端适配（响应式）
- Loading 界面

**交付：**
- 视觉上完整的产品
- 流畅的动画反馈
- 手机可玩

### M6：数据平衡 + 测试 + 部署（1.5 天）

**范围：**
- CPO 提供完整数值表，CTO 导入
- 难度曲线调优
- QA 测试（CPO 主导）
- Bug 修复
- 性能优化（大数字计算、动画帧率）
- 最终部署 GitHub Pages
- CMO 发布推广

**交付：**
- v2.0 正式发布
- 数值体验平滑
- 无阻断性 Bug

---

## 7. 性能考量

### 7.1 大数字运算
- 所有数值运算使用 `Decimal`，避免 JS Number 精度溢出
- 序列化时转 string，反序列化时还原 `Decimal`
- 格式化显示：`< 1e4` 原数，`1e4~1e6` 用 K，`1e6~1e9` 用 M，以此类推

### 7.2 游戏循环
- `requestAnimationFrame` 驱动，实际计算用 deltaTime
- Engine tick 每帧执行，UI 渲染由 React 按需更新
- 数字显示组件使用 `React.memo` + 500ms 节流

### 7.3 离线计算
- 页面加载时一次性计算，不用 Web Worker
- 离线时间 capped 24h，计算量可控
- 复杂场景（战斗中离线）简化为纯挂机收益

### 7.4 内存
- 配置表加载后缓存，不重复解析
- 战斗结束后清理 runtime 状态
- 背包上限控制物品数量

---

## 8. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 大数字序列化/反序列化性能 | 存档加载慢 | 压缩存档 + 惰性加载 |
| Framer Motion 动画卡顿 | 手机体验差 | 低端设备降级关闭动画 |
| 配置表数据量大 | 首屏加载慢 | 按章节懒加载关卡配置 |
| v1 用户流失 | 无存档迁移 | 弹窗告知 v2 新版本 |

---

*文档结束 — 待 CEO 审批后进入 M1 项目脚手架阶段*
