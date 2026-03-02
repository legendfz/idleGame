# 锻造系统 UI 设计规格 v3.0

> 作者：CDO | 日期：2026-03-02
> 基于 v2.0 主题系统（theme.css）、设计指南（DESIGN-GUIDE-V2.0.md）

---

## 目录
1. [设计令牌扩展](#1-设计令牌扩展)
2. [锻造台界面](#2-锻造台界面)
3. [采集界面](#3-采集界面)
4. [秘境副本界面](#4-秘境副本界面)
5. [材料背包界面](#5-材料背包界面)
6. [共用组件](#6-共用组件)
7. [动画定义](#7-动画定义)

---

## 1. 设计令牌扩展

在 `theme.css :root` 追加：

```css
/* ── 锻造系统色 ── */
--color-forge:       #E8731A;  /* 炉火橙 */
--color-forge-glow:  #FF9D47;  /* 炉火高光 */
--color-gather:      #5BAE5B;  /* 采集绿 */
--color-gather-rare: #7ED6DF;  /* 灵泉青 */
--color-dungeon:     #7C4DFF;  /* 秘境紫 */
--color-dungeon-dim: #4A2E8A;  /* 秘境暗紫 */
--color-material:    #78909C;  /* 材料灰蓝 */

/* ── 材料品级色（复用品质色 + 新增） ── */
--mat-common:    var(--q-common);    /* 粗矿/凡草 */
--mat-spirit:    var(--q-spirit);    /* 灵铁/灵草 */
--mat-immortal:  var(--q-immortal);  /* 仙矿/仙材 */
--mat-divine:    var(--q-divine);    /* 神矿/Boss掉落 */
--mat-chaos:     #FF9800;            /* 混沌精华 */
--mat-hongmeng:  #FFD700;            /* 鸿蒙之源 */
```

---

## 2. 锻造台界面

### 2.1 入口
底部导航第 6 Tab 或 背包页内卡片入口（与现有 5-tab 保持一致，推荐使用背包子页面跳转）：
```
背包 → [🔨 锻造台] 按钮（卡片样式，位于装备区上方）
```

### 2.2 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│ ← 返回        🔨 锻造台         │ SubPageHeader
├─────────────────────────────────┤
│                                 │
│  ┌──── 配方列表 ──────────────┐ │
│  │ [全部] [武器] [护甲] [法宝] │ │ ← 分类 Tab
│  │                             │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ 🗡️ 紫电青霜剑           │ │ │
│  │ │ ◆上品 · 攻+1200         │ │ │ ← 品质色左边框
│  │ │ 灵铁×3  仙石×1  ✅ 可锻 │ │ │
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ 🛡️ 玄龟灵甲             │ │ │
│  │ │ ●良品 · 血+800          │ │ │
│  │ │ 灵铁×2  兽皮×2  ❌ 缺材 │ │ │ ← 不可锻灰色
│  │ └─────────────────────────┘ │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌──── 锻造区 ────────────────┐ │
│  │                             │ │
│  │   [材料1]  [材料2]  [材料3] │ │ ← 材料槽（已选/空）
│  │        ↓                    │ │
│  │   ┌──── 产出预览 ────┐     │ │
│  │   │ 🗡️ 紫电青霜剑    │     │ │
│  │   │ ◆ 攻+1200~1500  │     │ │ ← 属性范围
│  │   │ 成功率 85%       │     │ │
│  │   └──────────────────┘     │ │
│  │                             │ │
│  │  [ 🔥 开始锻造 · 500灵石 ] │ │ ← 主按钮
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 2.3 组件规格

#### 配方卡片 `.forge-recipe-card`
```css
.forge-recipe-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--mat-common); /* 按品质色变化 */
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  margin-bottom: var(--sp-sm);
  cursor: pointer;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.forge-recipe-card:active {
  background: var(--color-bg-elevated);
}
.forge-recipe-card.selected {
  border-color: var(--color-forge);
  box-shadow: 0 0 8px rgba(232, 115, 26, 0.2);
}
.forge-recipe-card.unavailable {
  opacity: 0.5;
}
.forge-recipe-name {
  font-family: var(--font-title);
  font-size: var(--fs-body);
  font-weight: 700;
}
.forge-recipe-quality {
  font-size: var(--fs-xs);
  margin-top: var(--sp-xs);
}
.forge-recipe-mats {
  display: flex; gap: var(--sp-sm);
  font-size: var(--fs-xs); color: var(--color-text-dim);
  margin-top: var(--sp-xs);
}
.forge-recipe-mats .mat-ok { color: var(--color-success); }
.forge-recipe-mats .mat-lack { color: var(--color-danger); }
```

#### 材料槽 `.forge-slot`
```css
.forge-slots {
  display: flex; justify-content: center;
  gap: var(--sp-md); margin: var(--sp-lg) 0;
}
.forge-slot {
  width: 64px; height: 64px;
  background: var(--color-bg-elevated);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-size: var(--fs-xs); color: var(--color-text-dim);
  transition: border-color var(--dur-fast);
}
.forge-slot.filled {
  border-style: solid;
  border-color: var(--color-forge);
}
.forge-slot .mat-icon { font-size: 24px; }
.forge-slot .mat-count {
  font-family: var(--font-number);
  font-size: 10px; margin-top: 2px;
}
```

#### 产出预览 `.forge-preview`
```css
.forge-preview {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-gold);
  border-radius: var(--radius-lg);
  padding: var(--sp-md); text-align: center;
  margin: var(--sp-md) auto; max-width: 200px;
}
.forge-preview-name {
  font-family: var(--font-title);
  font-size: var(--fs-md); font-weight: 700;
  color: var(--color-text);
}
.forge-preview-stats {
  font-family: var(--font-number);
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-top: var(--sp-xs);
}
.forge-preview-rate {
  font-family: var(--font-number);
  font-size: var(--fs-sm); margin-top: var(--sp-xs);
}
.forge-preview-rate.high { color: var(--color-success); }
.forge-preview-rate.mid  { color: var(--color-warning); }
.forge-preview-rate.low  { color: var(--color-danger); }
```

#### 成功率颜色阈值
- ≥80%：`var(--color-success)` 绿
- 50%~79%：`var(--color-warning)` 橙
- <50%：`var(--color-danger)` 红

#### 锻造按钮 `.btn-forge`
```css
.btn-forge {
  display: block; width: 80%; margin: var(--sp-lg) auto;
  padding: var(--sp-md) var(--sp-xl);
  background: linear-gradient(135deg, var(--color-forge), #C85A10);
  color: var(--color-text-on-primary);
  border: none; border-radius: var(--radius-lg);
  font-family: var(--font-title);
  font-size: var(--fs-md); font-weight: 700;
  cursor: pointer; transition: transform var(--dur-fast), box-shadow var(--dur-fast);
  box-shadow: var(--shadow-btn);
}
.btn-forge:active { transform: scale(0.95); }
.btn-forge:disabled {
  background: var(--color-bg-card);
  color: var(--color-text-dim);
  cursor: not-allowed;
  box-shadow: none;
}
```

### 2.4 锻造动画序列（1200ms）

1. **按钮按下** (0-100ms)：按钮 `scale(0.9)`
2. **炉火燃起** (100-500ms)：锻造区背景渐变为 `rgba(232,115,26,0.08)`，材料槽 `border-color` 脉冲 `var(--color-forge-glow)`
3. **锤击震动** (500-800ms)：整个锻造区 `animation: shake 0.3s`（复用 animations.css）
4. **结果揭示** (800-1200ms)：
   - 成功：产出预览 `animation: scaleIn 0.4s var(--ease-pop)` + 品质色光晕 `box-shadow: 0 0 20px [品质色]`
   - 失败：材料槽 `animation: shake 0.3s` + 颜色变灰 + Toast "锻造失败，材料返还50%"

```css
@keyframes forgeGlow {
  0%, 100% { background: transparent; }
  50% { background: rgba(232, 115, 26, 0.08); }
}
@keyframes forgeSlotPulse {
  0%, 100% { border-color: var(--color-forge); }
  50% { border-color: var(--color-forge-glow); box-shadow: 0 0 12px rgba(255, 157, 71, 0.3); }
}
.forge-area.forging {
  animation: forgeGlow 0.8s ease;
}
.forge-slot.forging {
  animation: forgeSlotPulse 0.4s ease 2;
}
.forge-result-reveal {
  animation: scaleIn 0.4s var(--ease-pop);
}
@keyframes scaleIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 3. 采集界面

### 3.1 入口
取经页（JourneyMap）中的子入口卡片：
```
🗺️ 取经 → [⛏️ 采集] 卡片
```

### 3.2 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│ ← 返回        ⛏️ 灵材采集       │
├─────────────────────────────────┤
│                                 │
│  ┌──── 采集地点 ──────────────┐ │
│  │ [矿脉] [药田] [灵泉]       │ │ ← 分类 Tab
│  │                             │ │
│  │ ┌─ 寒铁矿脉 ─────────────┐ │ │
│  │ │ ⛏️ Lv.1  可采集          │ │ │
│  │ │ 产出：灵铁×1~3           │ │ │
│  │ │ [████████░░] 80%         │ │ │ ← 采集进度
│  │ │ ⏱️ 刷新 02:35            │ │ │ ← 倒计时
│  │ └─────────────────────────┘ │ │
│  │                             │ │
│  │ ┌─ 千年灵泉 ─────────────┐ │ │
│  │ │ 💧 Lv.3  🔒 需练气五层   │ │ │ ← 锁定状态
│  │ │ 产出：灵泉水×1~2         │ │ │
│  │ │ [──────────] 锁定        │ │ │
│  │ └─────────────────────────┘ │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌──── 今日收获 ──────────────┐ │
│  │ 灵铁 ×12  灵草 ×5  仙石 ×1│ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 3.3 组件规格

#### 采集地点卡片 `.gather-node`
```css
.gather-node {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  margin-bottom: var(--sp-sm);
  transition: border-color var(--dur-fast);
}
.gather-node.available {
  border-left: 3px solid var(--color-gather);
}
.gather-node.cooldown {
  border-left: 3px solid var(--color-warning);
  opacity: 0.7;
}
.gather-node.locked {
  border-left: 3px solid var(--color-border);
  opacity: 0.4;
}
.gather-node-header {
  display: flex; justify-content: space-between; align-items: center;
}
.gather-node-name {
  font-family: var(--font-title);
  font-size: var(--fs-body); font-weight: 700;
}
.gather-node-level {
  font-size: var(--fs-xs); color: var(--color-text-dim);
  font-family: var(--font-number);
}
.gather-node-yield {
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-top: var(--sp-xs);
}
.gather-node-timer {
  font-family: var(--font-number);
  font-size: var(--fs-sm); color: var(--color-warning);
  margin-top: var(--sp-xs);
}
```

#### 采集进度条 `.gather-progress`
```css
.gather-progress {
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-top: var(--sp-sm);
}
.gather-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-gather), var(--color-gather-rare));
  border-radius: var(--radius-pill);
  transition: width 0.5s linear;
}
.gather-progress-fill.complete {
  background: var(--color-success);
  animation: pulse 1s infinite;
}
```

#### 采集按钮 `.btn-gather`
```css
.btn-gather {
  display: block; width: 100%;
  padding: var(--sp-sm) var(--sp-md);
  margin-top: var(--sp-sm);
  background: var(--color-gather);
  color: var(--color-text-on-primary);
  border: none; border-radius: var(--radius-md);
  font-size: var(--fs-sm); font-weight: 700;
  cursor: pointer;
  transition: transform var(--dur-fast);
}
.btn-gather:active { transform: scale(0.95); }
.btn-gather:disabled {
  background: var(--color-bg-card);
  color: var(--color-text-dim);
  cursor: not-allowed;
}
```

### 3.4 采集动画

**进度采集（持续型，每次 3-5 秒）：**
1. 按下按钮 → 进度条从 0% 线性增长
2. 每 20% 触发一次 icon 微震 `animation: shake 0.15s`
3. 100% 完成 → 产出飘字 `+灵铁×2`（复用 P2-01 飘字系统）
4. 稀有产出：飘字颜色用对应品质色 + `animation: pulse 0.3s`

**冷却状态：**
- 倒计时用 `var(--font-number)` 等宽字体
- 最后 30 秒倒计时文字颜色变 `var(--color-accent)` 金色

```css
@keyframes gatherBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.gather-icon.gathering {
  animation: gatherBounce 0.5s ease infinite;
}
```

### 3.5 今日收获 `.gather-summary`
```css
.gather-summary {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  margin-top: var(--sp-lg);
}
.gather-summary-title {
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-bottom: var(--sp-sm);
}
.gather-summary-items {
  display: flex; flex-wrap: wrap; gap: var(--sp-sm);
  font-size: var(--fs-sm);
}
.gather-summary-item {
  padding: var(--sp-xs) var(--sp-sm);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
  font-family: var(--font-number);
}
```

---

## 4. 秘境副本界面

### 4.1 入口
取经页子入口（与采集并列）：
```
🗺️ 取经 → [🌀 秘境] 卡片
```

### 4.2 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│ ← 返回        🌀 秘境探索       │
├─────────────────────────────────┤
│                                 │
│  ┌──── 秘境选择 ──────────────┐ │
│  │                             │ │
│  │ ┌─ 🌀 蟠桃秘境 ──────────┐ │ │
│  │ │ 难度 ⭐⭐                │ │ │
│  │ │ 推荐战力 12,000          │ │ │
│  │ │ ─────────────────────── │ │ │
│  │ │ 奖励预览:                │ │ │
│  │ │ 🍑 蟠桃 ×5~10           │ │ │
│  │ │ 💎 仙石 ×1~3            │ │ │
│  │ │ 📦 随机装备              │ │ │
│  │ │ ─────────────────────── │ │ │
│  │ │ 次数 2/3  ⏱ 重置 04:30  │ │ │
│  │ │                          │ │ │
│  │ │ [ 进入秘境 ]             │ │ │
│  │ └────────────────────────┘ │ │
│  │                             │ │
│  │ ┌─ 🔒 混沌秘境 ──────────┐ │ │
│  │ │ 需通关第27难解锁         │ │ │
│  │ └────────────────────────┘ │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌──── 限时活动 ──────────────┐ │
│  │ 🔥 火焰山试炼  剩余 1h23m  │ │ ← 闪烁金色边框
│  │ 难度 ⭐⭐⭐ · 双倍掉落       │ │
│  │ [ 立即挑战 ]               │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 4.3 副本战斗中界面

```
┌─────────────────────────────────┐
│  🌀 蟠桃秘境 — 第 2/5 波       │
│  ⏱️ 02:45                       │ ← 限时倒计时
├─────────────────────────────────┤
│                                 │
│  蟠桃仙猿  👹                   │
│  [██████████░░░░] 68%           │ ← HP条
│                                 │
│       [ ⚔️ 点击攻击 ]          │
│                                 │
│  连击 ×3 🔥                     │
│  总伤害: 125.6K                 │
├─────────────────────────────────┤
│  波次: ① ② ③ ④ ⑤              │ ← 波次指示器
│        ✅ 🔴 ○ ○ ○             │
└─────────────────────────────────┘
```

### 4.4 组件规格

#### 秘境卡片 `.dungeon-card`
```css
.dungeon-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-dungeon-dim);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  margin-bottom: var(--sp-md);
  transition: border-color var(--dur-fast);
}
.dungeon-card.available {
  border-left: 4px solid var(--color-dungeon);
}
.dungeon-card.locked {
  opacity: 0.4;
  border-left: 4px solid var(--color-border);
}
.dungeon-card-title {
  font-family: var(--font-title);
  font-size: var(--fs-md); font-weight: 700;
  color: var(--color-text);
}
.dungeon-card-diff {
  font-size: var(--fs-xs); color: var(--color-accent);
  margin-top: var(--sp-xs);
}
.dungeon-card-power {
  font-size: var(--fs-sm); color: var(--color-text-dim);
  font-family: var(--font-number);
}
.dungeon-reward-list {
  margin-top: var(--sp-sm);
  padding-top: var(--sp-sm);
  border-top: 1px solid var(--color-border);
}
.dungeon-reward-item {
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-bottom: var(--sp-xs);
}
.dungeon-card-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: var(--sp-sm);
  padding-top: var(--sp-sm);
  border-top: 1px solid var(--color-border);
  font-size: var(--fs-xs);
}
.dungeon-charges {
  font-family: var(--font-number);
  color: var(--color-text-dim);
}
.dungeon-charges .exhausted { color: var(--color-danger); }
.dungeon-reset-timer {
  font-family: var(--font-number);
  color: var(--color-warning);
}
```

#### 限时活动卡片 `.dungeon-event`
```css
.dungeon-event {
  background: var(--color-bg-card);
  border: 2px solid var(--color-accent);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  margin-top: var(--sp-lg);
  animation: goldGlow 2s infinite; /* 复用 animations.css */
}
.dungeon-event-title {
  font-family: var(--font-title);
  font-size: var(--fs-md); font-weight: 700;
  color: var(--color-accent);
}
.dungeon-event-timer {
  font-family: var(--font-number);
  font-size: var(--fs-sm); color: var(--color-danger);
}
```

#### 进入按钮 `.btn-dungeon`
```css
.btn-dungeon {
  display: block; width: 100%;
  padding: var(--sp-md);
  margin-top: var(--sp-md);
  background: linear-gradient(135deg, var(--color-dungeon), var(--color-dungeon-dim));
  color: var(--color-text-on-primary);
  border: none; border-radius: var(--radius-md);
  font-family: var(--font-title);
  font-size: var(--fs-body); font-weight: 700;
  cursor: pointer;
  transition: transform var(--dur-fast);
  box-shadow: var(--shadow-btn);
}
.btn-dungeon:active { transform: scale(0.95); }
.btn-dungeon:disabled {
  background: var(--color-bg-card);
  color: var(--color-text-dim);
  box-shadow: none; cursor: not-allowed;
}
```

#### 波次指示器 `.wave-indicator`
```css
.wave-indicator {
  display: flex; justify-content: center;
  gap: var(--sp-sm); padding: var(--sp-md) 0;
  border-top: 1px solid var(--color-border);
}
.wave-dot {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  color: var(--color-text-dim);
  transition: all var(--dur-fast);
}
.wave-dot.cleared {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}
.wave-dot.current {
  background: var(--color-primary);
  border-color: var(--color-accent);
  color: #fff;
  animation: pulse 1.5s infinite;
}
.wave-dot.locked {
  opacity: 0.3;
}
```

### 4.5 战斗结算弹窗

```
┌─────────────────────────────────┐
│                                 │
│         ✅ 秘境通关！            │ ← 成功：accent色 / 失败：danger色
│                                 │
│  ─────────────────────────────  │
│  💰 灵石     +5,200             │
│  🍑 蟠桃     +8                 │
│  💎 仙石     +2                 │
│  🗡️ 紫电剑   ◆上品  NEW!       │ ← 装备掉落高亮
│  ─────────────────────────────  │
│  用时 02:15  击杀 12  连击 ×5   │
│  评价 ⭐⭐⭐                     │
│                                 │
│  [ 确认 ]                       │
└─────────────────────────────────┘
```

```css
.dungeon-result-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: var(--z-modal);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn var(--dur-norm);
}
.dungeon-result-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--sp-xl);
  width: 90%; max-width: 340px;
  animation: slideUp var(--dur-slow) var(--ease-pop);
}
.dungeon-result-title {
  font-family: var(--font-title);
  font-size: var(--fs-xl);
  text-align: center;
  margin-bottom: var(--sp-lg);
}
.dungeon-result-title.victory { color: var(--color-accent); }
.dungeon-result-title.defeat { color: var(--color-danger); }
.dungeon-loot-item {
  display: flex; justify-content: space-between;
  padding: var(--sp-xs) 0;
  font-size: var(--fs-sm);
}
.dungeon-loot-item.equip-drop {
  color: var(--color-accent); font-weight: 700;
}
.dungeon-result-stats {
  font-size: var(--fs-xs); color: var(--color-text-dim);
  text-align: center; margin-top: var(--sp-md);
  padding-top: var(--sp-md);
  border-top: 1px solid var(--color-border);
}
.dungeon-result-stars {
  text-align: center; font-size: var(--fs-lg);
  margin-top: var(--sp-sm);
}
```

---

## 5. 材料背包界面

### 5.1 入口
背包页顶部 Tab 扩展：
```
[装备] [材料] ← 新增
```

### 5.2 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│  🎒 背包                        │
│  [装备] [材料]                   │ ← 顶部切换
├─────────────────────────────────┤
│  [全部] [矿石] [灵材] [Boss] [其他] │ ← 分类筛选
│                                 │
│  ┌─ 灵铁 ─────────── ×42 ────┐ │
│  │ ⛏️ 采集·矿石                │ │
│  │ 用于锻造良品~上品武器        │ │
│  └───────────────────────────┘ │
│  ┌─ 仙石 ─────────── ×7 ─────┐ │
│  │ 💎 采集·矿石  ●灵品          │ │ ← 品质色文字
│  │ 用于锻造上品~极品武器        │ │
│  └───────────────────────────┘ │
│  ┌─ 白骨精之牙 ────── ×3 ────┐ │
│  │ 💀 Boss掉落  ★极品          │ │ ← 紫色
│  │ 可炼化为灵铁×5              │ │
│  └───────────────────────────┘ │
│                                 │
│  ─────────────────────────────  │
│  容量 52/200                    │
│                                 │
│  [ 🔄 炼化 ]  [ 🧪 合成 ]      │ ← 底部操作
└─────────────────────────────────┘
```

### 5.3 组件规格

#### 顶部 Tab `.inventory-tabs`
```css
.inventory-tabs {
  display: flex;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}
.inventory-tab {
  flex: 1; padding: var(--sp-sm) 0;
  text-align: center;
  font-size: var(--fs-sm); font-weight: 700;
  color: var(--color-text-dim);
  background: none; border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color var(--dur-fast), border-color var(--dur-fast);
}
.inventory-tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
```

#### 材料分类筛选 `.mat-filters`
```css
.mat-filters {
  display: flex; gap: var(--sp-xs);
  padding: var(--sp-sm) var(--sp-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mat-filters::-webkit-scrollbar { display: none; }
.mat-filter-btn {
  flex-shrink: 0;
  padding: var(--sp-xs) var(--sp-md);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs); color: var(--color-text-dim);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.mat-filter-btn.active {
  background: var(--color-material);
  color: var(--color-text-on-primary);
  border-color: var(--color-material);
}
```

#### 材料卡片 `.mat-card`
```css
.mat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  margin: 0 var(--sp-md) var(--sp-sm);
  display: flex; align-items: center; gap: var(--sp-md);
}
.mat-card-icon {
  font-size: 24px; width: 40px; text-align: center;
}
.mat-card-info { flex: 1; min-width: 0; }
.mat-card-name {
  font-size: var(--fs-body); font-weight: 700;
  display: flex; justify-content: space-between;
}
.mat-card-count {
  font-family: var(--font-number);
  color: var(--color-accent);
}
.mat-card-source {
  font-size: var(--fs-xs); color: var(--color-text-dim);
  margin-top: 2px;
}
.mat-card-quality {
  font-size: var(--fs-xs); font-weight: 700;
  margin-left: var(--sp-sm);
}
.mat-card-desc {
  font-size: var(--fs-xs); color: var(--color-text-dim);
  margin-top: var(--sp-xs);
}
```

#### 容量条 `.mat-capacity`
```css
.mat-capacity {
  text-align: center;
  font-family: var(--font-number);
  font-size: var(--fs-sm); color: var(--color-text-dim);
  padding: var(--sp-md) 0;
}
.mat-capacity.near-full { color: var(--color-warning); }
.mat-capacity.full { color: var(--color-danger); }
```
- 阈值：≥80% → `near-full`（橙色）；100% → `full`（红色）

#### 底部操作按钮
```css
.mat-actions {
  display: flex; gap: var(--sp-sm);
  padding: var(--sp-md);
}
.mat-actions .btn-action {
  flex: 1; padding: var(--sp-sm);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text); font-size: var(--fs-sm);
  font-weight: 700; cursor: pointer;
  text-align: center;
  transition: background var(--dur-fast);
}
.mat-actions .btn-action:active {
  background: var(--color-bg-elevated);
}
```

### 5.4 炼化弹窗

选择材料 → 预览产出 → 确认炼化。复用秘境结算弹窗样式（`.dungeon-result-overlay` / `.dungeon-result-card`），替换标题和内容。

```
┌─────────────────────────────────┐
│          🔄 炼化                │
│  ─────────────────────────────  │
│  投入: 白骨精之牙 ×3            │
│  产出: 灵铁 ×15                 │
│  ─────────────────────────────  │
│  [ 取消 ]  [ 确认炼化 ]         │
└─────────────────────────────────┘
```

---

## 6. 共用组件

### 6.1 分类 Tab 筛选栏
锻造/采集/材料背包均使用相同筛选栏组件，统一为 `.filter-tabs`：
```css
.filter-tabs {
  display: flex; gap: var(--sp-xs);
  padding: var(--sp-sm) 0;
  margin-bottom: var(--sp-sm);
}
.filter-tab {
  padding: var(--sp-xs) var(--sp-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs); color: var(--color-text-dim);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.filter-tab.active {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}
```

### 6.2 SubPageHeader
复用现有 `.subpage-header`（App.tsx），保持 ← 返回 + 标题居中。

### 6.3 确认弹窗
复用现有 `confirm()` 模式，后续可升级为自定义 Modal。

---

## 7. 动画定义

所有新增动画汇总（追加至 `animations.css`）：

```css
/* 锻造 */
@keyframes forgeGlow {
  0%, 100% { background: transparent; }
  50% { background: rgba(232, 115, 26, 0.08); }
}
@keyframes forgeSlotPulse {
  0%, 100% { border-color: var(--color-forge); }
  50% { border-color: var(--color-forge-glow); box-shadow: 0 0 12px rgba(255, 157, 71, 0.3); }
}

/* 采集 */
@keyframes gatherBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* 通用缩放入场 */
@keyframes scaleIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

已有动画直接复用：`fadeIn`、`slideUp`、`pulse`、`shake`、`goldGlow`。

---

## 响应式适配

| 断点 | 处理 |
|------|------|
| ≤374px | 材料筛选栏水平滚动；材料卡片 icon 缩小至 20px |
| 375-480px | 标准布局（设计基准） |
| ≥481px | `max-width: 480px; margin: 0 auto;`（已由 GameLayout 处理） |

---

## 文件清单

| 新增/修改 | 文件 | 内容 |
|-----------|------|------|
| 修改 | `src/styles/theme.css` | 追加锻造/采集/秘境色令牌 |
| 修改 | `src/styles/animations.css` | 追加 3 个 keyframes |
| 新增 | `src/styles/forge.css` | 锻造台全部样式 |
| 新增 | `src/styles/gather.css` | 采集界面全部样式 |
| 新增 | `src/styles/dungeon-v3.css` | 秘境副本样式 |
| 修改 | `src/styles/views.css` | 追加材料背包样式 |
| 新增 | `src/components/views/ForgeView.tsx` | 锻造台组件 |
| 新增 | `src/components/views/GatherView.tsx` | 采集界面组件 |
| 新增 | `src/components/views/DungeonView.tsx` | 秘境副本组件（升级版） |
| 修改 | `src/components/views/InventoryView.tsx` | 增加装备/材料 Tab |
