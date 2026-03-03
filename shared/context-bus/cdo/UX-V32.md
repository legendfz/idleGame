# v3.2 UX 优化设计规格

> 作者：CDO | 日期：2026-03-02
> 基于 v2.0 theme.css 变量体系

---

## 1. 新手引导流程

### 1.1 设计原则
- 3 步即完成，不阻塞主体验
- 聚焦式高亮（背景半透明遮罩 + 目标区域镂空）
- 底部弹窗式对话框，不遮挡高亮区
- 可跳过，进度点指示（①②③）

### 1.2 三步流程

| 步骤 | 高亮目标 | 文案 | 操作 |
|------|----------|------|------|
| ① | 修炼圆形按钮 `.click-cultivate` | **点击修炼**<br>点击这里积累修为，修为满后可突破境界！ | 点击按钮触发一次修炼→自动进下一步 |
| ② | 底部导航「⚔️ 战斗」Tab | **挑战取经路**<br>切换到战斗页面，挂机自动战斗赚取灵石和经验！ | 点击 Tab 切换→自动进下一步 |
| ③ | 底部导航「🎒 背包」Tab | **装备强化**<br>战斗获得的装备在这里管理，强化提升战力！ | 点击 Tab→引导结束 |

### 1.3 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← 遮罩层
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░┌────────────┐░░░░░░░░░ │
│ ░░░░░░░│  🧘 修炼   │░░░░░░░░░ │ ← 镂空区（目标组件）
│ ░░░░░░░│  点击修炼   │░░░░░░░░░ │
│ ░░░░░░░└────────────┘░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│ ① ● ○ ○                        │ ← 进度指示
│                                 │
│  👆 点击修炼                     │ ← 标题 font-title fs-md
│  点击这里积累修为，              │ ← 正文 fs-sm color-text-dim
│  修为满后可突破境界！            │
│                                 │
│  [ 下一步 ]         跳过 →      │
└─────────────────────────────────┘
```

### 1.4 CSS 规格

```css
/* 遮罩层 */
.tutorial-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: calc(var(--z-modal) + 10);
  transition: opacity var(--dur-norm);
}

/* 镂空高亮 — 通过 box-shadow 实现 */
.tutorial-spotlight {
  position: fixed;
  border-radius: var(--radius-lg);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
  z-index: calc(var(--z-modal) + 11);
  transition: top var(--dur-slow) var(--ease-out),
              left var(--dur-slow) var(--ease-out),
              width var(--dur-slow) var(--ease-out),
              height var(--dur-slow) var(--ease-out);
  pointer-events: none;
}
/* 高亮区域允许点击 */
.tutorial-spotlight-clickable {
  pointer-events: auto;
}

/* 底部引导弹窗 */
.tutorial-dialog {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--sp-lg) var(--sp-xl) calc(var(--sp-xl) + env(safe-area-inset-bottom));
  z-index: calc(var(--z-modal) + 12);
  animation: slideUp var(--dur-norm) var(--ease-pop);
}

/* 进度点 */
.tutorial-dots {
  display: flex; gap: var(--sp-sm);
  margin-bottom: var(--sp-md);
}
.tutorial-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  transition: background var(--dur-fast);
}
.tutorial-dot.active {
  background: var(--color-accent);
  width: 20px; border-radius: var(--radius-pill);
}
.tutorial-dot.done {
  background: var(--color-success);
}

/* 文案 */
.tutorial-title {
  font-family: var(--font-title);
  font-size: var(--fs-md); font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--sp-xs);
}
.tutorial-body {
  font-size: var(--fs-sm);
  color: var(--color-text-dim);
  line-height: 1.5;
}

/* 按钮行 */
.tutorial-actions {
  display: flex; justify-content: space-between;
  align-items: center; margin-top: var(--sp-lg);
}
.tutorial-next {
  padding: var(--sp-sm) var(--sp-xl);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border: none; border-radius: var(--radius-md);
  font-size: var(--fs-sm); font-weight: 700;
  cursor: pointer;
}
.tutorial-next:active { transform: scale(0.95); }
.tutorial-skip {
  background: none; border: none;
  color: var(--color-text-dim);
  font-size: var(--fs-xs); cursor: pointer;
}
```

### 1.5 实现要点
- 用 `getBoundingClientRect()` 获取目标元素位置，设置 `.tutorial-spotlight` 的 top/left/width/height
- 存储 `tutorialStep` 于 `localStorage`（`idle_tutorial_done=1`），只首次展示
- 每步完成条件：监听目标元素 click 事件

### 1.6 影响文件
| 类型 | 文件 |
|------|------|
| 新增 | `src/components/shared/Tutorial.tsx` |
| 新增 | `src/styles/tutorial.css` |
| 修改 | `src/App.tsx` — 挂载 `<Tutorial />` |
| 修改 | `src/store/ui.ts` — 增加 `tutorialStep` 状态 |

**工作量：M（~3h）**

---

## 2. 秘境战斗动画

### 2.1 限时进度条

双层结构：外层为总时间条，内层为当前波次 Boss HP 条。

```
┌─────────────────────────────────┐
│  ⏱️ 02:45 / 03:00               │ ← 倒计时文字
│  [████████████████░░░░░░░] 75%  │ ← 时间条（从右向左消耗）
│                                 │
│  蟠桃仙猿  HP                   │
│  [██████████░░░░░░░░░░░] 52%   │ ← HP条
└─────────────────────────────────┘
```

### 2.2 时间条规格

```css
.dungeon-timer-bar {
  position: relative;
  height: 10px;
  background: var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin: var(--sp-sm) 0;
}
.dungeon-timer-fill {
  height: 100%;
  border-radius: var(--radius-pill);
  transition: width 1s linear; /* 每秒线性减少 */
}

/* 三段颜色 */
.dungeon-timer-fill.safe {
  background: linear-gradient(90deg, var(--color-success), #4CAF50);
}
.dungeon-timer-fill.warning {  /* ≤50% */
  background: linear-gradient(90deg, var(--color-warning), #F5A623);
}
.dungeon-timer-fill.danger {   /* ≤20% */
  background: linear-gradient(90deg, var(--color-danger), #FF5252);
  animation: timerPulse 0.5s infinite alternate;
}

@keyframes timerPulse {
  from { opacity: 1; }
  to { opacity: 0.6; }
}

/* 倒计时文字 */
.dungeon-timer-text {
  font-family: var(--font-number);
  font-size: var(--fs-sm);
  color: var(--color-text-dim);
  margin-bottom: var(--sp-xs);
}
.dungeon-timer-text.danger {
  color: var(--color-danger);
  font-weight: 700;
  animation: timerPulse 0.5s infinite alternate;
}
```

颜色阈值：>50% 绿 → ≤50% 橙 → ≤20% 红+脉冲

### 2.3 Boss HP 条（秘境增强版）

```css
.dungeon-hp-bar {
  position: relative;
  height: 16px;
  background: var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin: var(--sp-sm) 0;
}
/* 双层：底层为受伤延迟条（白色半透明），上层为实际HP */
.dungeon-hp-delayed {
  position: absolute; inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  transition: width 0.8s ease-out; /* 延迟消退 */
}
.dungeon-hp-fill {
  position: absolute; top: 0; bottom: 0; left: 0;
  border-radius: var(--radius-md);
  transition: width 0.2s ease;
}
/* HP色段 */
.dungeon-hp-fill.healthy { background: var(--color-success); }   /* >50% */
.dungeon-hp-fill.wounded { background: var(--color-warning); }   /* 20-50% */
.dungeon-hp-fill.critical { background: var(--color-danger); }   /* <20% */

.dungeon-hp-text {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-number);
  font-size: 10px; color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
```

### 2.4 伤害数字系统

7 种飘字类型，与 v1.0 BATTLE-VFX.md 对齐：

| 类型 | 格式 | 颜色 | 字号 | 特殊动画 |
|------|------|------|------|----------|
| 普通 | `-{n}` | `var(--color-text)` | fs-sm | 上浮淡出 |
| 暴击 | `💥 -{n}!` | `var(--color-accent)` | fs-md | 放大弹出→上浮 |
| 连击 | `🔥 ×{combo}` | `var(--color-warning)` | fs-sm | 右侧滑入 |
| 闪避 | `MISS` | `var(--color-text-dim)` | fs-xs | 左右晃动 |
| 治疗 | `+{n}` | `var(--color-success)` | fs-sm | 下方浮入 |
| Boss伤害 | `-{n}` | `var(--color-danger)` | fs-lg | 震屏+大字 |
| 技能 | `⚡{name}` | `var(--color-dungeon)` | fs-sm | 闪烁入场 |

```css
.dmg-float {
  position: absolute;
  pointer-events: none;
  font-family: var(--font-number);
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
  animation-fill-mode: forwards;
}

/* 普通上浮 */
.dmg-normal {
  font-size: var(--fs-sm); color: var(--color-text);
  animation: dmgFloatUp 0.7s var(--ease-out) forwards;
}
@keyframes dmgFloatUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-50px); opacity: 0; }
}

/* 暴击弹出 */
.dmg-crit {
  font-size: var(--fs-md); color: var(--color-accent);
  animation: dmgCritPop 0.8s var(--ease-pop) forwards;
}
@keyframes dmgCritPop {
  0% { transform: scale(0.3) translateY(0); opacity: 0; }
  30% { transform: scale(1.4) translateY(-10px); opacity: 1; }
  100% { transform: scale(1) translateY(-60px); opacity: 0; }
}

/* 连击滑入 */
.dmg-combo {
  font-size: var(--fs-sm); color: var(--color-warning);
  animation: dmgSlideIn 0.6s var(--ease-out) forwards;
}
@keyframes dmgSlideIn {
  0% { transform: translateX(40px); opacity: 0; }
  30% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(0) translateY(-30px); opacity: 0; }
}

/* 闪避晃动 */
.dmg-miss {
  font-size: var(--fs-xs); color: var(--color-text-dim);
  animation: dmgMiss 0.5s ease forwards;
}
@keyframes dmgMiss {
  0% { transform: translateX(0); opacity: 1; }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
  100% { transform: translateX(0) translateY(-20px); opacity: 0; }
}

/* Boss大字震屏 */
.dmg-boss {
  font-size: var(--fs-lg); color: var(--color-danger);
  animation: dmgBoss 0.9s var(--ease-pop) forwards;
}
@keyframes dmgBoss {
  0% { transform: scale(0.5); opacity: 0; }
  15% { transform: scale(1.6); opacity: 1; }
  30% { transform: scale(1.2); }
  100% { transform: scale(1) translateY(-70px); opacity: 0; }
}

/* 技能闪烁 */
.dmg-skill {
  font-size: var(--fs-sm); color: var(--color-dungeon);
  animation: dmgSkill 0.7s ease forwards;
}
@keyframes dmgSkill {
  0% { opacity: 0; }
  20% { opacity: 1; }
  40% { opacity: 0.3; }
  60% { opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}

/* 治疗浮入 */
.dmg-heal {
  font-size: var(--fs-sm); color: var(--color-success);
  animation: dmgHeal 0.7s var(--ease-out) forwards;
}
@keyframes dmgHeal {
  0% { transform: translateY(20px); opacity: 0; }
  30% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-30px); opacity: 0; }
}
```

### 2.5 屏幕震动（Boss 攻击时）
```css
@keyframes screenShake {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-3px, 2px); }
  40% { transform: translate(3px, -2px); }
  60% { transform: translate(-2px, -1px); }
  80% { transform: translate(2px, 1px); }
}
.screen-shake {
  animation: screenShake 0.3s ease;
}
```
应用于 `.shell`（GameLayout 根元素），Boss 攻击时添加类名 300ms 后移除。

### 2.6 影响文件
| 类型 | 文件 |
|------|------|
| 新增 | `src/styles/dungeon-battle.css` |
| 修改 | `src/styles/animations.css` — 追加 screenShake |
| 修改 | `src/components/views/DungeonView.tsx` — 接入动画 |
| 新增 | `src/components/shared/DamageFloat.tsx` — 飘字组件 |

**工作量：M（~3h）**

---

## 3. 统计面板

### 3.1 入口
设置页（⚙️ 更多）中的卡片入口，或独立子页面。

### 3.2 信息架构

```
统计面板
├── 总览卡片（关键数字网格）
├── 战斗统计
├── 修炼统计
├── 经济统计
└── 里程碑时间线
```

### 3.3 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│ ← 返回        📊 数据统计       │
├─────────────────────────────────┤
│                                 │
│  ┌──── 总览 ──────────────────┐ │
│  │  ┌──────┐  ┌──────┐       │ │
│  │  │ 42h  │  │ Lv.67│       │ │ ← 2×2网格大数字
│  │  │游戏时长│  │ 等级 │       │ │
│  │  ├──────┤  ├──────┤       │ │
│  │  │ 1.2M │  │ 第3章│       │ │
│  │  │总击杀  │  │ 进度 │       │ │
│  │  └──────┘  └──────┘       │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌──── ⚔️ 战斗 ───────────────┐ │
│  │ 总伤害输出    125.6M        │ │
│  │ 最高单次伤害  52.3K         │ │
│  │ 暴击次数      4,521         │ │
│  │ 暴击率        34.2%         │ │
│  │ Boss击杀      17            │ │
│  │ 秘境通关      8             │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌──── 🧘 修炼 ───────────────┐ │
│  │ 总修为获得    8.9B          │ │
│  │ 总点击次数    12,345        │ │
│  │ 突破次数      23            │ │
│  │ 最高境界      筑基·七层     │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌──── 💰 经济 ───────────────┐ │
│  │ 总灵石获得    3.4M          │ │
│  │ 总灵石消耗    2.1M          │ │
│  │ 装备出售收入  890K          │ │
│  │ 强化消耗      1.8M          │ │
│  │ 锻造消耗      300K          │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌──── 🏆 里程碑 ─────────────┐ │
│  │ ● 03/01 首次突破            │ │ ← 时间线
│  │ │                           │ │
│  │ ● 03/01 通关第1章           │ │
│  │ │                           │ │
│  │ ● 03/02 首次Boss击杀       │ │
│  │ │                           │ │
│  │ ○ ??? 下一个里程碑...       │ │ ← 未解锁灰色
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

### 3.4 CSS 规格

#### 总览网格 `.stats-overview`
```css
.stats-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-lg);
}
.stats-big-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  text-align: center;
}
.stats-big-value {
  font-family: var(--font-number);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--color-accent);
}
.stats-big-label {
  font-size: var(--fs-xs);
  color: var(--color-text-dim);
  margin-top: var(--sp-xs);
}
```

#### 统计卡片 `.stats-section`
```css
.stats-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  margin-bottom: var(--sp-md);
}
.stats-section-title {
  font-family: var(--font-title);
  font-size: var(--fs-body);
  font-weight: 700;
  color: var(--color-accent);
  margin-bottom: var(--sp-md);
}
.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-xs) 0;
  font-size: var(--fs-sm);
}
.stats-row + .stats-row {
  border-top: 1px solid rgba(58, 50, 72, 0.5);
}
.stats-row-label {
  color: var(--color-text-dim);
}
.stats-row-value {
  font-family: var(--font-number);
  font-weight: 700;
  color: var(--color-text);
}
```

#### 里程碑时间线 `.milestone-timeline`
```css
.milestone-timeline {
  position: relative;
  padding-left: 20px;
}
.milestone-timeline::before {
  content: '';
  position: absolute;
  left: 6px; top: 0; bottom: 0;
  width: 2px;
  background: var(--color-border);
}
.milestone-item {
  position: relative;
  padding: var(--sp-sm) 0 var(--sp-sm) var(--sp-md);
}
.milestone-item::before {
  content: '';
  position: absolute;
  left: -14px; top: 12px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--color-accent);
  border: 2px solid var(--color-bg-card);
}
.milestone-item.locked::before {
  background: var(--color-border);
}
.milestone-date {
  font-family: var(--font-number);
  font-size: var(--fs-xs);
  color: var(--color-text-dim);
}
.milestone-text {
  font-size: var(--fs-sm);
  color: var(--color-text);
  margin-top: 2px;
}
.milestone-item.locked .milestone-text {
  color: var(--color-text-dim);
  font-style: italic;
}
```

### 3.5 数据来源映射

| 统计项 | Store 字段 |
|--------|-----------|
| 游戏时长 | `playerStore.player.playTime` |
| 等级 | `playerStore.player.realmLevel` |
| 总击杀 | `playerStore.player.totalKills`（需新增） |
| 进度 | `journeyStore.journey.currentStage` |
| 总伤害 | 需新增 `stats.totalDamage` |
| 暴击次数 | 需新增 `stats.critCount` |
| 总修为 | `playerStore.player.totalXiuwei` |
| 总点击 | `playerStore.player.totalClicks` |
| 灵石收支 | 需新增 `stats.goldEarned` / `stats.goldSpent` |

建议在 `playerStore` 中新增 `stats` 子对象统一管理，存档时一并序列化。

### 3.6 影响文件
| 类型 | 文件 |
|------|------|
| 新增 | `src/components/views/StatsView.tsx` |
| 新增 | `src/styles/stats.css` |
| 修改 | `src/store/player.ts` — 增加 stats 子对象 |
| 修改 | `src/App.tsx` — 设置页增加统计入口 |

**工作量：M（~3h）**

---

## 汇总

| 模块 | 工作量 | 核心交付 |
|------|--------|----------|
| 新手引导 | M | 3步聚焦式教程，spotlight镂空+底部弹窗+进度点 |
| 秘境战斗动画 | M | 三段色时间条+双层HP条+7种飘字+屏幕震动 |
| 统计面板 | M | 2×2总览网格+3分类统计卡片+里程碑时间线 |

**总估时：~9h**
**建议执行顺序：** 统计面板 → 秘境战斗动画 → 新手引导（引导依赖完整 UI 稳定后再加）
