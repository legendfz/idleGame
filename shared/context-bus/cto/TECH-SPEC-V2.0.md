# 技术方案 v2.0 — 西游记 Idle Game

> 版本：2.0 | 作者：CTO | 日期：2026-03-02
> 状态：Draft
> 基于：CPO/PRD-V2.0.md + CDO/DESIGN-GUIDE-V2.0.md

---

## 1. 架构设计

### 1.1 与 v1.x 的关系：渐进重构

**策略：在 v1.3 代码基础上渐进重构，而非完全重写。**

理由：
- v1.3 已有完整的战斗引擎、装备系统、副本系统，基础可复用
- 完全重写风险高、周期长，不适合小团队
- React + Zustand + Vite 技术栈无需更换
- 新增系统（境界体系、技能树、转世）以独立模块插入

迁移路径：
1. **Phase 1**：重构数据层 → 14境界 + 81难 + 新货币体系
2. **Phase 2**：重构角色层 → 5角色 + 6装备槽 + 技能树
3. **Phase 3**：重构 UI 层 → CDO 新设计系统
4. **Phase 4**：新增系统 → 转世、招降、炼丹

### 1.2 整体架构

```
┌─────────────────────────────────────────────┐
│                  UI 层                       │
│  React Components (页面/面板/弹窗/动画)       │
├─────────────────────────────────────────────┤
│              状态管理层                       │
│  Zustand Stores (game/dungeon/ach/lb/...)    │
├─────────────────────────────────────────────┤
│               引擎层                         │
│  GameLoop · BattleEngine · OfflineCalc       │
│  SkillTree · PrestigeCalc · AlchemyEngine    │
├─────────────────────────────────────────────┤
│              数据层                           │
│  配置表(境界/关卡/装备/技能/妖怪)             │
│  BigNumber 运算库                             │
├─────────────────────────────────────────────┤
│              持久化层                         │
│  localStorage · 存档迁移 · 导入导出           │
└─────────────────────────────────────────────┘
```

### 1.3 渲染管线

- **游戏循环**：`requestAnimationFrame` 驱动，60fps
- **UI 刷新**：Zustand selector 自动触发 React re-render，实际 UI 更新通过 `useSyncExternalStore` 节流到 ~10fps
- **动画**：CSS Animation + `requestAnimationFrame` 手动动画（伤害数字、特效粒子）
- **大数字显示**：所有数值通过 `formatBigNumber()` 统一格式化（K/M/B/T/...）

---

## 2. 组件拆分

### 2.1 目录结构

```
src/
├── app/
│   ├── App.tsx              # 根组件、路由、全局 Provider
│   ├── GameLoop.tsx         # rAF 游戏循环 hook
│   └── theme.ts             # CDO 设计系统变量
│
├── data/                    # 静态配置表
│   ├── realms.ts            # 14 境界 × 9 小层 = 126 级
│   ├── stages.ts            # 81 难关卡配置
│   ├── characters.ts        # 5 角色基础属性+被动
│   ├── equipment.ts         # 装备模板（6 槽位）
│   ├── skills.ts            # 技能树配置
│   ├── monsters.ts          # 妖怪（普通+Boss+可招降）
│   ├── alchemy.ts           # 炼丹配方
│   └── prestige.ts          # 转世升级表
│
├── engine/                  # 纯逻辑，不依赖 React
│   ├── gameLoop.ts          # 核心 tick：修为产出、自动攻击
│   ├── battleEngine.ts      # 战斗计算（点击+自动+Boss限时）
│   ├── offlineCalc.ts       # 离线收益模拟
│   ├── realmBreak.ts        # 境界突破逻辑
│   ├── skillTree.ts         # 技能点分配与效果计算
│   ├── alchemy.ts           # 炼丹概率+产出
│   ├── prestige.ts          # 转世重置+佛缘计算
│   ├── recruit.ts           # 妖怪招降判定
│   └── bignum.ts            # BigNumber 封装层
│
├── store/                   # Zustand stores
│   ├── gameStore.ts         # 核心状态：角色、资源、境界
│   ├── battleStore.ts       # 战斗状态：当前关卡、敌人、进度
│   ├── equipStore.ts        # 装备+背包+强化
│   ├── dungeonStore.ts      # 81难进度+星级+扫荡
│   ├── achievementStore.ts  # 成就+称号
│   ├── leaderboardStore.ts  # 排行榜
│   ├── alchemyStore.ts      # 炼丹状态
│   └── prestigeStore.ts     # 转世状态+佛缘
│
├── ui/                      # React 组件
│   ├── layout/
│   │   ├── TopBar.tsx       # 顶栏
│   │   ├── BottomNav.tsx    # 底部导航
│   │   └── Modal.tsx        # 通用弹窗
│   ├── screens/
│   │   ├── CultivateScreen.tsx  # 修炼主界面（挂机+点击）
│   │   ├── JourneyScreen.tsx    # 取经地图（81难路线）
│   │   ├── CharacterScreen.tsx  # 角色面板（属性+技能树+装备）
│   │   ├── BagScreen.tsx        # 背包+装备管理
│   │   ├── AlchemyScreen.tsx    # 炼丹
│   │   └── SettingsScreen.tsx   # 设置+存档
│   ├── battle/
│   │   ├── BattleView.tsx       # 战斗场景
│   │   ├── ClickArea.tsx        # 点击攻击区域
│   │   ├── DamageText.tsx       # 浮动伤害数字
│   │   └── BossTimer.tsx        # Boss 倒计时
│   ├── common/
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Button.tsx
│   │   └── Toast.tsx
│   └── effects/
│       ├── BreakthroughFX.tsx   # 突破动画
│       ├── DropFX.tsx           # 掉落动画
│       └── CritFX.tsx           # 暴击特效
│
├── utils/
│   ├── format.ts            # 数值格式化（大数字）
│   ├── save.ts              # 存档读写+迁移
│   └── random.ts            # 确定性随机（种子可选）
│
└── types/
    ├── game.ts              # 核心类型
    ├── character.ts         # 角色类型
    ├── equipment.ts         # 装备类型
    ├── battle.ts            # 战斗类型
    └── save.ts              # 存档类型
```

### 2.2 模块依赖

```
UI 层 → Store 层 → Engine 层 → Data 层
                                  ↓
                              BigNumber 库
```

规则：
- **Engine 不依赖 React**（纯函数/类，可单元测试）
- **Store 不依赖 UI**（可在 Node.js 环境运行）
- **Data 是纯静态数据**（JSON-like TS objects）
- **UI 通过 Store selectors 读数据**，通过 Store actions 写数据

---

## 3. 技术选型

### 3.1 框架与库

| 技术 | 选择 | 理由 |
|------|------|------|
| UI 框架 | React 19 | 沿用 v1，生态成熟 |
| 语言 | TypeScript 5.x | 类型安全，IDE 支持 |
| 构建 | Vite 6 | 沿用 v1，HMR 快 |
| 状态管理 | Zustand 5 | 沿用 v1，轻量+中间件 |
| 大数字 | break_infinity.js | 轻量（8KB gzip），支持 e9e15 级别数字 |
| 动画 | CSS + rAF 手动 | 无额外依赖，性能可控 |
| 字体 | Noto Sans SC + Noto Serif SC | CDO 指定，Google Fonts CDN |
| 部署 | GitHub Pages + Actions | 沿用 v1，免费 |

### 3.2 为什么 break_infinity.js

PRD 要求 14 个境界 × 指数增长，后期数值轻松达到 1e100+。原生 Number 在 ~1e308 溢出，且精度在 1e15 后丢失。

break_infinity.js 特性：
- 支持到 1e9e15（远超需求）
- API 简洁：`new Decimal(x).add(y).mul(z)`
- 体积小：gzip 约 8KB
- 兼容 JSON 序列化（toString/fromString）

封装策略：`engine/bignum.ts` 统一封装，业务层不直接用 Decimal 类。

### 3.3 动画方案

| 效果 | 实现 |
|------|------|
| 按钮反馈 | CSS `transform: scale(0.95)` + `transition` |
| 伤害数字 | rAF 手动动画，DOM 节点池化复用 |
| 暴击特效 | CSS `@keyframes` + 屏幕微震 `translateX` |
| 突破动画 | 多阶段 CSS animation + JS 控制序列 |
| 掉落光柱 | CSS `linear-gradient` + `animation` |
| 进度条 | CSS `transition: width 0.3s` |

不引入 framer-motion 或 GSAP，控制打包体积。

### 3.4 性能策略

- **游戏循环与渲染分离**：engine tick 60fps，React render 节流 10fps
- **大数字缓存**：格式化结果缓存，同一 tick 内不重复计算
- **离线计算**：分块模拟（每 1000 tick 为一块），避免长时间阻塞
- **虚拟列表**：背包/成就列表超过 50 项时用虚拟滚动
- **Web Worker（预留）**：离线计算可移入 Worker，v2.0 暂不实现

---

## 4. 数据模型

### 4.1 核心游戏状态

```typescript
import Decimal from 'break_infinity.js';

// 序列化用 string，运行时用 Decimal
type DecStr = string; // Decimal.toString() 结果

interface GameState {
  player: PlayerState;
  characters: CharacterState[];
  activeCharId: string;         // 当前主控角色
  journey: JourneyState;
  resources: ResourceState;
  settings: SettingsState;
}

interface PlayerState {
  name: string;
  realmId: string;              // 当前境界 ID
  realmSubLevel: number;        // 小层级 1-9
  cultivationXp: DecStr;        // 当前修为
  totalCultivation: DecStr;     // 历史累计修为
  totalPlayTime: number;        // 秒
  createdAt: number;            // timestamp
}

interface CharacterState {
  id: string;                   // 'tangseng' | 'wukong' | 'bajie' | 'wujing' | 'bailongma'
  unlocked: boolean;
  level: number;
  exp: DecStr;
  stats: CharStats;
  equipment: Record<EquipSlotV2, string | null>; // slot → equipUid
  skillPoints: number;
  skills: Record<string, number>;  // skillId → level
}

interface CharStats {
  attack: DecStr;
  defense: DecStr;
  hp: DecStr;
  maxHp: DecStr;
  speed: number;                // 攻速倍率
  critRate: number;             // 0-100
  critDmg: number;              // 倍率
}

type EquipSlotV2 = 'weapon' | 'headgear' | 'armor' | 'accessory' | 'mount' | 'treasure';

interface ResourceState {
  gold: DecStr;                 // 金币
  lingshi: DecStr;              // 灵石（硬通货）
  materials: Record<string, number>;  // 天材地宝 ID → 数量
  pills: Record<string, number>;     // 仙丹 ID → 数量
  foyuan: number;               // 佛缘（转世货币）
}

interface JourneyState {
  currentStage: number;         // 1-81
  stageProgress: Record<number, StageResult>;  // 关卡号 → 结果
  dailySweepCount: Record<number, number>;     // 关卡号 → 今日扫荡次数
  dailyResetDate: string;
}

interface StageResult {
  cleared: boolean;
  stars: number;                // 1-3
  bestTime: number | null;
  clearCount: number;
}
```

### 4.2 装备模型

```typescript
interface EquipTemplateV2 {
  id: string;
  name: string;
  icon: string;                 // emoji 或 icon ID
  slot: EquipSlotV2;
  quality: Quality;             // 沿用 v1 的 6 品质
  baseStats: Partial<Record<'attack' | 'defense' | 'hp' | 'speed' | 'critRate' | 'critDmg', number>>;
  passive?: EquipPassive;
  setId?: string;
  dropSource: { type: 'stage'; stageMin: number } | { type: 'alchemy' } | { type: 'boss'; bossId: string };
}

interface EquipInstanceV2 {
  uid: string;
  templateId: string;
  enhanceLevel: number;         // 0-15
  refineLevel: number;          // 0-5 精炼阶
  quality: Quality;
  // 运行时缓存
  _cachedStats?: Partial<CharStats>;
}
```

### 4.3 境界配置表

```typescript
interface RealmConfig {
  id: string;                   // 'fanren' | 'lianqi' | ...
  name: string;                 // '凡人'
  order: number;                // 0-13
  subLevels: number;            // 固定 9
  breakCost: {
    cultivation: DecStr;        // 需要修为
    materials?: { id: string; count: number }[];
    trialStage?: number;        // 需通过的试炼关卡号
  };
  multiplier: number;           // 修炼速度倍率
  unlockAbility?: string;       // 解锁能力描述
}

const REALMS_V2: RealmConfig[] = [
  { id: 'fanren',  name: '凡人', order: 0,  subLevels: 9, breakCost: { cultivation: '100' },   multiplier: 1 },
  { id: 'lianqi',  name: '练气', order: 1,  subLevels: 9, breakCost: { cultivation: '1000' },  multiplier: 1.5 },
  { id: 'zhuji',   name: '筑基', order: 2,  subLevels: 9, breakCost: { cultivation: '1e4' },   multiplier: 2 },
  { id: 'jindan',  name: '金丹', order: 3,  subLevels: 9, breakCost: { cultivation: '1e5' },   multiplier: 3 },
  { id: 'yuanying',name: '元婴', order: 4,  subLevels: 9, breakCost: { cultivation: '1e6' },   multiplier: 5 },
  { id: 'huashen', name: '化神', order: 5,  subLevels: 9, breakCost: { cultivation: '1e8' },   multiplier: 8 },
  { id: 'dujie',   name: '渡劫', order: 6,  subLevels: 9, breakCost: { cultivation: '1e10' },  multiplier: 13 },
  { id: 'dixian',  name: '地仙', order: 7,  subLevels: 9, breakCost: { cultivation: '1e13' },  multiplier: 20 },
  { id: 'tianxian',name: '天仙', order: 8,  subLevels: 9, breakCost: { cultivation: '1e16' },  multiplier: 35 },
  { id: 'jinxian', name: '金仙', order: 9,  subLevels: 9, breakCost: { cultivation: '1e20' },  multiplier: 60 },
  { id: 'taiyi',   name: '太乙', order: 10, subLevels: 9, breakCost: { cultivation: '1e25' },  multiplier: 100 },
  { id: 'daluo',   name: '大罗', order: 11, subLevels: 9, breakCost: { cultivation: '1e31' },  multiplier: 180 },
  { id: 'hunyuan', name: '混元', order: 12, subLevels: 9, breakCost: { cultivation: '1e38' },  multiplier: 350 },
  { id: 'shengren',name: '圣人', order: 13, subLevels: 9, breakCost: { cultivation: '1e46' },  multiplier: 700 },
];
```

### 4.4 关卡配置

```typescript
interface StageConfig {
  stage: number;                // 1-81
  chapter: number;              // 1-9
  name: string;
  waves: WaveConfig[];
  boss: BossConfig;
  rewards: StageRewards;
  sweepUnlockStars: number;     // 需要几星才能扫荡
  recommendedPower: DecStr;
}

interface BossConfig {
  id: string;
  name: string;
  icon: string;
  hp: DecStr;
  attack: DecStr;
  defense: DecStr;
  skills: BossSkillConfig[];
  phases: BossPhaseConfig[];
  timeLimit: number;            // 秒
  recruitable?: {               // 可招降
    condition: string;
    effect: string;
  };
}
```

### 4.5 存档格式

```typescript
interface SaveDataV2 {
  version: 'v2.0';
  timestamp: number;
  game: GameState;
  equipment: {
    instances: EquipInstanceV2[];
    inventory: string[];        // uid 列表
  };
  dungeon: JourneyState;
  achievements: Record<string, AchievementState>;
  leaderboard: Record<string, LeaderboardEntry[]>;
  prestige: {
    count: number;
    foyuan: number;
    permanentBonuses: Record<string, number>;
  };
}
```

迁移：v1.3 存档 → v2.0 存档的迁移函数，映射旧境界到新境界体系，旧装备3槽→新装备6槽。

---

## 5. API 设计

### 5.1 游戏引擎 API

```typescript
// engine/gameLoop.ts
class GameEngine {
  /** 每帧调用，dt 为秒 */
  tick(dt: number, state: GameState): GameState;

  /** 计算当前每秒修为产出 */
  getCultivationPerSec(state: GameState): Decimal;

  /** 执行境界突破 */
  attemptBreakthrough(state: GameState): { success: boolean; newState: GameState; message: string };

  /** 计算角色综合战力 */
  getCombatPower(char: CharacterState, equips: EquipInstanceV2[]): Decimal;
}

// engine/battleEngine.ts
class BattleEngine {
  /** 初始化战斗 */
  initBattle(stageConfig: StageConfig, party: CharacterState[]): BattleState;

  /** 战斗 tick */
  tickBattle(state: BattleState, dt: number): BattleState;

  /** 玩家点击攻击 */
  playerClick(state: BattleState): { state: BattleState; damage: Decimal; isCrit: boolean };

  /** 闪避 Boss 技能 */
  dodge(state: BattleState): BattleState;

  /** 结算奖励 */
  calculateRewards(state: BattleState, stageConfig: StageConfig): BattleRewards;
}

// engine/offlineCalc.ts
function calculateOfflineEarnings(
  offlineSeconds: number,
  state: GameState,
  config: { maxHours: number; efficiencyRate: number }
): OfflineReport;
```

### 5.2 事件系统

```typescript
// 全局事件总线（Zustand middleware 实现）
type GameEvent =
  | { type: 'REALM_BREAKTHROUGH'; realmId: string; subLevel: number }
  | { type: 'STAGE_CLEARED'; stage: number; stars: number; time: number }
  | { type: 'EQUIPMENT_OBTAINED'; equipUid: string; quality: Quality }
  | { type: 'EQUIPMENT_ENHANCED'; equipUid: string; level: number }
  | { type: 'CHARACTER_UNLOCKED'; charId: string }
  | { type: 'MONSTER_KILLED'; count: number; isBoss: boolean }
  | { type: 'CLICK_ATTACK'; damage: Decimal; isCrit: boolean }
  | { type: 'PRESTIGE'; count: number; foyuan: number }
  | { type: 'ALCHEMY_SUCCESS'; pillId: string }
  | { type: 'RECRUIT_SUCCESS'; monsterId: string };

// 事件监听器注册
function onGameEvent(handler: (event: GameEvent) => void): () => void;

// 成就系统订阅事件
achievementTracker.subscribe(onGameEvent);
// 排行榜订阅事件
leaderboardTracker.subscribe(onGameEvent);
```

### 5.3 存档 API

```typescript
// utils/save.ts
const SaveAPI = {
  /** 保存到 localStorage */
  save(state: SaveDataV2): void;

  /** 从 localStorage 加载（含版本迁移） */
  load(): SaveDataV2 | null;

  /** 导出为 JSON 字符串（可分享） */
  exportSave(): string;

  /** 从 JSON 字符串导入 */
  importSave(json: string): SaveDataV2;

  /** v1.3 → v2.0 迁移 */
  migrateV1ToV2(v1Save: any): SaveDataV2;

  /** 自动保存（30秒间隔） */
  startAutoSave(getState: () => SaveDataV2): void;
};
```

---

## 6. 里程碑拆分

### M1：核心循环重构（MVP 最小可玩）— 5天

**范围：**
- [ ] break_infinity.js 集成 + bignum 封装层
- [ ] 14 境界 × 9 小层配置表
- [ ] 修为产出引擎（每秒自动 + 点击）
- [ ] 境界突破逻辑（修为消耗 + 突破动画占位）
- [ ] 唐僧 + 孙悟空 角色数据 + 切换
- [ ] 新 UI 骨架（顶栏 + 底部导航 + 修炼主界面）
- [ ] 离线收益（基于新境界体系）
- [ ] 存档 v1.3 → v2.0 迁移
- [ ] npm run build 通过 + 部署

**交付物：** 可挂机修炼 + 突破境界 + 切换角色的最小可玩版本

### M2：战斗系统 + 第一章（1-9难）— 5天

**范围：**
- [ ] 第一章 9 关配置（小怪波次 + Boss）
- [ ] 点击战斗引擎（点击伤害 + 自动 DPS + 暴击 + 连击加速）
- [ ] Boss 限时战（倒计时 + 技能预警 + 闪避）
- [ ] 战斗 UI（角色区 + 点击区 + 伤害数字 + Boss 血条）
- [ ] 关卡奖励（金币 + 经验 + 装备掉落）
- [ ] 取经进度地图（81 节点路线图，第一章可玩）
- [ ] 星级评价 + 扫荡（3星后）

**交付物：** 可战斗推图的完整第一章

### M3：装备系统 v2 — 4天

**范围：**
- [ ] 6 装备槽位（武器/头饰/衣服/饰品/坐骑/法宝）
- [ ] 装备模板（每品质每槽位至少 3 件 = ~100 件）
- [ ] 强化 +1~+15（沿用 v1 逻辑，适配新品质体系）
- [ ] 精炼系统（沿用 v1.2 逻辑）
- [ ] 背包 UI（筛选/排序/分解/批量操作）
- [ ] 角色面板 UI（6 槽位装备展示 + 属性面板）
- [ ] 套装系统

**交付物：** 完整装备管理系统

### M4：UI 主题升级（CDO 设计系统）— 3天

**范围：**
- [ ] CDO 色彩系统（朱红/金黄/靛蓝主题）
- [ ] 字体：Noto Serif SC（标题）+ Noto Sans SC（正文）+ Roboto Mono（数字）
- [ ] 组件库（Card/Button/ProgressBar/Modal/Toast）按 CDO 规范重做
- [ ] 突破动画（全屏金光 + 境界文字飞入）
- [ ] 掉落动画（光柱 + 品质色）
- [ ] 点击反馈（涟漪 + 伤害弹出 + 暴击屏震）
- [ ] 进度条、血条统一样式

**交付物：** 视觉全面升级到 v2 国风主题

### M5：扩展系统 — 5天

**范围：**
- [ ] 猪八戒 + 沙悟净 + 白龙马角色
- [ ] 技能树（每角色 3 路线 × 5 技能 = 75 技能）
- [ ] 炼丹系统（配方 + 概率 + 临时 buff）
- [ ] 成就系统 v2（扩展到 30+ 成就）
- [ ] 排行榜 v2（战力/速通/修为 维度）
- [ ] 妖怪招降（前 2 个可招降妖怪）
- [ ] 神仙助力（观音菩萨，限时 buff）

**交付物：** 完整角色阵容 + 技能树 + 炼丹

### M6：第二章 + 转世 + 打磨 — 4天

**范围：**
- [ ] 第二章（10-18 难）关卡配置
- [ ] 转世系统（通关 81 难后 → 重置 + 佛缘 + 永久加成）
- [ ] 每日劫难（随机关卡）
- [ ] 隐藏关卡（大闹天宫回忆关）
- [ ] 存档导入/导出
- [ ] 性能优化 + bug 修复
- [ ] CDO 视觉打磨

**交付物：** v2.0 正式发布版本

---

### 总计预估

| 里程碑 | 工时 | 累计 |
|--------|------|------|
| M1 核心循环 MVP | 5天 | 5天 |
| M2 战斗+第一章 | 5天 | 10天 |
| M3 装备系统 v2 | 4天 | 14天 |
| M4 UI 主题 | 3天 | 17天 |
| M5 扩展系统 | 5天 | 22天 |
| M6 第二章+转世 | 4天 | 26天 |

**MVP（M1+M2）= 10天**，可挂机+可战斗+第一章完整。

---

## 附录：关键技术决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 重写 vs 重构 | 渐进重构 | 风险低，复用 v1 基础设施 |
| 大数字库 | break_infinity.js | 轻量、够用、社区验证 |
| 动画方案 | CSS + rAF | 无额外依赖，体积可控 |
| 路由 | 无（Tab 切换） | 单页 Idle Game 无需 router |
| 状态管理 | Zustand（多 store） | 沿用 v1，按系统拆分 |
| 字体加载 | Google Fonts CDN | 免费，全球 CDN |
| 部署 | GitHub Pages | 沿用 v1，零成本 |
