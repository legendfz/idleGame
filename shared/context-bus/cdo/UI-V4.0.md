# v4.0「天道酬勤」UI 设计规格

> 作者：CDO | 日期：2026-03-02
> 基于 v2.0 theme.css 变量体系

---

## 目录
1. [导航变更](#1-导航变更)
2. [任务页顶部子标签](#2-任务页顶部子标签)
3. [成就面板](#3-成就面板)
4. [每日任务面板](#4-每日任务面板)
5. [里程碑面板](#5-里程碑面板)
6. [动画定义](#6-动画定义)
7. [文件清单](#7-文件清单)

---

## 1. 导航变更

底部 Tab 新增「📜 任务」，调整为 6 Tab：

```
🧘修炼  ⚔️战斗  📜任务  🐒角色  🎒背包  🗺️取经
```

6 Tab 时 icon 保持 20px，label 10px（与现有 BottomNav 一致）。`≤374px` 隐藏 label 仅显示 icon 24px。

```css
/* 无需新增，现有 BottomNav 的 flex:1 自动适配 */
```

NAV_ITEMS 更新：
```ts
const NAV_ITEMS = [
  { id: 'idle',      icon: '🧘', label: '修炼' },
  { id: 'battle',    icon: '⚔️', label: '战斗' },
  { id: 'quests',    icon: '📜', label: '任务' },
  { id: 'character', icon: '🐒', label: '角色' },
  { id: 'inventory', icon: '🎒', label: '背包' },
  { id: 'journey',   icon: '🗺️', label: '取经' },
];
```

---

## 2. 任务页顶部子标签

进入「📜 任务」Tab 后，顶部三标签切换：

```
┌─────────────────────────────────┐
│  [🏆 成就]  [📋 每日]  [⭐ 里程碑] │
├─────────────────────────────────┤
│  （对应面板内容）                │
└─────────────────────────────────┘
```

```css
.quest-tabs {
  display: flex;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0;
  z-index: 10;
}
.quest-tab {
  flex: 1;
  padding: var(--sp-md) 0;
  text-align: center;
  font-size: var(--fs-sm); font-weight: 700;
  color: var(--color-text-dim);
  background: none; border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color var(--dur-fast), border-color var(--dur-fast);
}
.quest-tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
.quest-tab .tab-badge {
  display: inline-block;
  min-width: 16px; height: 16px;
  line-height: 16px; text-align: center;
  background: var(--color-primary);
  color: #fff; font-size: 10px; font-weight: 700;
  border-radius: var(--radius-pill);
  margin-left: var(--sp-xs);
  vertical-align: middle;
}
```

徽标逻辑：
- 成就：有可领取奖励时显示数量
- 每日：有已完成未领取时显示数量
- 里程碑：有新解锁时显示 `!`

---

## 3. 成就面板

### 3.1 分类筛选

```
[全部] [🧘修炼] [⚔️战斗] [📦收集] [🔨锻造] [🗺️探索]
```

水平滚动胶囊按钮，复用 `.mat-filters` / `.mat-filter-btn` 样式（DESIGN-FORGE-UI.md）。

### 3.2 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│ [全部] [🧘修炼] [⚔️战斗] ...    │ ← 分类筛选（横向滚动）
│                                 │
│  已解锁 12/48                    │ ← 总进度
│  [████████░░░░░░░░░░░░░░] 25%  │
│                                 │
│  ┌─ 🐵 齐天大圣 ─── ✅ 已解锁 ─┐ │
│  │ 达到练气九层                  │ │
│  │ [████████████████████] 100% │ │
│  │ 🎁 蟠桃×10 + 攻击+5%        │ │ ← 奖励（已领取灰色）
│  └──────────────────────────────┘ │
│                                 │
│  ┌─ ⚔️ 百战不殆 ─── 进行中 ────┐ │
│  │ 累计击杀 1000 只怪物          │ │
│  │ [████████░░░░░░░░░░░] 42%   │ │ ← 进度条
│  │ 420/1000                     │ │
│  │ 🎁 灵石×5000                 │ │ ← 奖励预览
│  └──────────────────────────────┘ │
│                                 │
│  ┌─ 🔒 ??? ──────── 未解锁 ────┐ │
│  │ 达成某个神秘条件              │ │ ← 隐藏成就
│  │ [──────────────────] ???     │ │
│  └──────────────────────────────┘ │
└─────────────────────────────────┘
```

### 3.3 成就卡片 CSS

```css
/* 成就卡片基础 */
.ach-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  margin-bottom: var(--sp-sm);
  transition: border-color var(--dur-norm), box-shadow var(--dur-norm);
}

/* === 三态 === */

/* 已解锁 */
.ach-card.unlocked {
  border-color: var(--color-accent);
  background: linear-gradient(135deg, var(--color-bg-card) 0%, rgba(212,168,67,0.06) 100%);
}

/* 进行中 */
.ach-card.in-progress {
  border-left: 3px solid var(--color-accent);
}

/* 未解锁/隐藏 */
.ach-card.locked {
  opacity: 0.45;
  border-color: var(--color-border);
}

/* 头部行 */
.ach-header {
  display: flex; justify-content: space-between; align-items: center;
}
.ach-title {
  display: flex; align-items: center; gap: var(--sp-sm);
}
.ach-icon {
  font-size: 20px;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
}
.ach-card.unlocked .ach-icon {
  background: rgba(212, 168, 67, 0.15);
}
.ach-name {
  font-family: var(--font-title);
  font-size: var(--fs-body); font-weight: 700;
}
.ach-status {
  font-size: var(--fs-xs); font-weight: 700;
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-pill);
}
.ach-status.done {
  background: rgba(58, 125, 68, 0.2);
  color: var(--color-success);
}
.ach-status.active {
  background: rgba(212, 168, 67, 0.15);
  color: var(--color-accent);
}
.ach-status.hidden {
  background: var(--color-bg-elevated);
  color: var(--color-text-dim);
}

/* 描述 */
.ach-desc {
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-top: var(--sp-xs);
}

/* 进度条 */
.ach-progress {
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-top: var(--sp-sm);
}
.ach-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-warning));
  border-radius: var(--radius-pill);
  transition: width var(--dur-norm) var(--ease-out);
}
.ach-card.unlocked .ach-progress-fill {
  background: var(--color-success);
}
.ach-progress-text {
  font-family: var(--font-number);
  font-size: var(--fs-xs); color: var(--color-text-dim);
  margin-top: 2px; text-align: right;
}

/* 奖励行 */
.ach-reward {
  display: flex; align-items: center; gap: var(--sp-sm);
  margin-top: var(--sp-sm);
  padding-top: var(--sp-sm);
  border-top: 1px solid rgba(58, 50, 72, 0.5);
  font-size: var(--fs-xs);
}
.ach-reward-icon { font-size: 14px; }
.ach-reward-text { color: var(--color-text-dim); }
.ach-card.unlocked .ach-reward-text { color: var(--color-accent); }

/* 领取按钮 */
.ach-claim-btn {
  margin-left: auto;
  padding: var(--sp-xs) var(--sp-md);
  background: var(--color-accent);
  color: var(--color-bg);
  border: none; border-radius: var(--radius-md);
  font-size: var(--fs-xs); font-weight: 700;
  cursor: pointer;
  animation: pulse 1.5s infinite;
}
.ach-claim-btn:active { transform: scale(0.9); }
.ach-claim-btn.claimed {
  background: var(--color-bg-elevated);
  color: var(--color-text-dim);
  animation: none; cursor: default;
}
```

### 3.4 总进度条
```css
.ach-total {
  margin-bottom: var(--sp-lg);
  font-size: var(--fs-sm); color: var(--color-text-dim);
}
.ach-total-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-top: var(--sp-xs);
}
.ach-total-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #FFD700);
  border-radius: var(--radius-pill);
}
```

### 3.5 排序
默认顺序：可领取（脉冲高亮）→ 进行中（按进度%降序）→ 未解锁 → 隐藏。已领取沉底。

---

## 4. 每日任务面板

### 4.1 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│  📋 每日任务                     │
│  重置倒计时 ⏱️ 06:23:45          │ ← 等宽字体，红色<1h
│                                 │
│  ┌─ ① 修炼 30 分钟 ────────────┐│
│  │ 🧘 修炼时长达到30分钟        ││
│  │ [████████████░░░░░] 22/30分  ││
│  │                    [ 领取 ]  ││ ← 未完成灰色禁用
│  └──────────────────────────────┘│
│                                 │
│  ┌─ ② 击杀 50 只怪物 ── ✅ ────┐│
│  │ ⚔️ 战斗击杀怪物50只          ││
│  │ [████████████████████] 50/50 ││
│  │                   [ 🎁领取 ] ││ ← 完成：金色按钮脉冲
│  └──────────────────────────────┘│
│                                 │
│  ┌─ ③ 强化 3 次 ───────────────┐│
│  │ 🔨 强化任意装备3次           ││
│  │ [██████░░░░░░░░░░░░] 1/3    ││
│  └──────────────────────────────┘│
│                                 │
│  ┌─ ④ 采集 5 次 ───────────────┐│
│  │ ⛏️ 完成5次资源采集           ││
│  │ [░░░░░░░░░░░░░░░░░░] 0/5   ││
│  └──────────────────────────────┘│
│                                 │
│  ┌─ ⑤ 通关 1 个秘境 ───────────┐│
│  │ 🌀 通关任意秘境1次           ││
│  │ [░░░░░░░░░░░░░░░░░░] 0/1   ││
│  └──────────────────────────────┘│
│                                 │
│  ┌──── 全勤奖励 ───── 3/5 ─────┐│
│  │ ① ② ③ ④ ⑤                  ││ ← 圆形指示器
│  │ ✅ 🎁 ○ ○ ○                 ││
│  │ ─────────────────────────── ││
│  │ 🎁 蟠桃×5 + 混沌碎片×1      ││
│  │ [ 全部完成后可领取 ]         ││
│  └──────────────────────────────┘│
└─────────────────────────────────┘
```

### 4.2 CSS 规格

```css
/* 重置倒计时 */
.daily-timer {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: var(--sp-md);
}
.daily-timer-label {
  font-size: var(--fs-sm); color: var(--color-text-dim);
}
.daily-timer-value {
  font-family: var(--font-number);
  font-size: var(--fs-body); font-weight: 700;
  color: var(--color-text);
}
.daily-timer-value.urgent { /* <1h */
  color: var(--color-danger);
  animation: timerPulse 0.5s infinite alternate;
}

/* 任务卡片 */
.daily-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  margin-bottom: var(--sp-sm);
  transition: border-color var(--dur-fast);
}
.daily-card.completed {
  border-color: var(--color-success);
  background: linear-gradient(135deg, var(--color-bg-card) 0%, rgba(58,125,68,0.06) 100%);
}
.daily-card.claimed {
  opacity: 0.5;
  border-color: var(--color-border);
}

/* 任务头 */
.daily-header {
  display: flex; justify-content: space-between; align-items: center;
}
.daily-index {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-number);
  font-size: var(--fs-xs); font-weight: 700;
  color: var(--color-text-dim);
}
.daily-card.completed .daily-index {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}
.daily-card.claimed .daily-index {
  background: var(--color-border);
  color: var(--color-text-dim);
}
.daily-title {
  flex: 1; margin-left: var(--sp-sm);
  font-size: var(--fs-body); font-weight: 700;
}

/* 描述 */
.daily-desc {
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-top: var(--sp-xs);
  padding-left: calc(24px + var(--sp-sm)); /* 对齐序号右侧 */
}

/* 进度条 */
.daily-progress {
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-top: var(--sp-sm);
}
.daily-progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-pill);
  transition: width var(--dur-norm) ease;
}
.daily-card.completed .daily-progress-fill {
  background: var(--color-success);
}
.daily-progress-text {
  font-family: var(--font-number);
  font-size: var(--fs-xs); color: var(--color-text-dim);
  text-align: right; margin-top: 2px;
}

/* 领取按钮 */
.daily-claim {
  float: right;
  padding: var(--sp-xs) var(--sp-md);
  border: none; border-radius: var(--radius-md);
  font-size: var(--fs-xs); font-weight: 700;
  cursor: pointer;
  transition: transform var(--dur-fast);
}
.daily-claim:active { transform: scale(0.9); }
.daily-claim.ready {
  background: var(--color-accent);
  color: var(--color-bg);
  animation: pulse 1.5s infinite;
}
.daily-claim.pending {
  background: var(--color-bg-elevated);
  color: var(--color-text-dim);
  cursor: not-allowed;
  animation: none;
}
.daily-claim.done {
  background: var(--color-bg-elevated);
  color: var(--color-text-dim);
  cursor: default;
  animation: none;
}
```

### 4.3 全勤奖励区

```css
.daily-bonus {
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  margin-top: var(--sp-md);
  text-align: center;
}
.daily-bonus.all-done {
  border-color: var(--color-accent);
  animation: goldGlow 2s infinite;
}
.daily-bonus-title {
  font-family: var(--font-title);
  font-size: var(--fs-body); font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--sp-md);
}

/* 圆形完成指示器 */
.daily-bonus-dots {
  display: flex; justify-content: center;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}
.daily-bonus-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  color: var(--color-text-dim);
  transition: all var(--dur-fast);
}
.daily-bonus-dot.complete {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}
.daily-bonus-dot.claimable {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
  animation: pulse 1.5s infinite;
}

/* 奖励预览 */
.daily-bonus-reward {
  font-size: var(--fs-sm); color: var(--color-accent);
  margin-bottom: var(--sp-md);
}
.daily-bonus-btn {
  padding: var(--sp-sm) var(--sp-xl);
  background: var(--color-accent);
  color: var(--color-bg);
  border: none; border-radius: var(--radius-md);
  font-size: var(--fs-sm); font-weight: 700;
  cursor: pointer;
}
.daily-bonus-btn:disabled {
  background: var(--color-bg-elevated);
  color: var(--color-text-dim);
  cursor: not-allowed;
}
```

---

## 5. 里程碑面板

### 5.1 布局（ASCII Mockup）

```
┌─────────────────────────────────┐
│  ⭐ 里程碑                       │
│  永久加成一览                    │
│                                 │
│  ┌─ 🗡️ 战斗之道 ── 🥈 银 ─────┐ │
│  │                              │ │
│  │  铜 → [银] → 金 → 💎         │ │ ← 等级路径指示
│  │  ⬜ → [🥈] → ⬜ → ⬜          │ │
│  │                              │ │
│  │  当前效果: 攻击 +5%          │ │ ← 绿色
│  │  下一级:   攻击 +10%         │ │ ← 金色
│  │  ─────────────────────────  │ │
│  │  进度: 击杀 500/1000         │ │
│  │  [██████████░░░░░░░░] 50%   │ │
│  └──────────────────────────────┘ │
│                                 │
│  ┌─ 🧘 修行之路 ── 🥉 铜 ─────┐ │
│  │  铜 → 银 → 金 → 💎           │ │
│  │  [🥉] → ⬜ → ⬜ → ⬜          │ │
│  │                              │ │
│  │  当前效果: 修为速度 +3%      │ │
│  │  下一级:   修为速度 +8%      │ │
│  │  ─────────────────────────  │ │
│  │  进度: 突破 5/15             │ │
│  │  [██████░░░░░░░░░░░░] 33%   │ │
│  └──────────────────────────────┘ │
│                                 │
│  ┌─ 💰 聚财之路 ── 🔒 未解锁 ──┐ │
│  │  ⬜ → ⬜ → ⬜ → ⬜             │ │
│  │                              │ │
│  │  首个效果: 灵石获取 +2%      │ │ ← 灰色
│  │  ─────────────────────────  │ │
│  │  解锁条件: 累计获得 10K 灵石 │ │
│  │  [████░░░░░░░░░░░░░░] 21%   │ │
│  └──────────────────────────────┘ │
│                                 │
│  ┌──── 总加成汇总 ────────────┐  │
│  │ 攻击 +5%  修为 +3%  暴击 +2%│  │ ← 横排标签
│  └────────────────────────────┘  │
└─────────────────────────────────┘
```

### 5.2 等级系统

| 等级 | 图标 | 颜色 | CSS 变量 |
|------|------|------|----------|
| 铜 | 🥉 | `#CD7F32` | `--ms-bronze` |
| 银 | 🥈 | `#C0C0C0` | `--ms-silver` |
| 金 | 🥇 | `#FFD700` | `--ms-gold` |
| 钻石 | 💎 | `#B9F2FF` | `--ms-diamond` |

追加 theme.css：
```css
--ms-bronze:  #CD7F32;
--ms-silver:  #C0C0C0;
--ms-gold:    #FFD700;
--ms-diamond: #B9F2FF;
```

### 5.3 CSS 规格

```css
/* 里程碑卡片 */
.ms-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  margin-bottom: var(--sp-md);
}
.ms-card.locked {
  opacity: 0.5;
}

/* 头部 */
.ms-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: var(--sp-md);
}
.ms-title {
  display: flex; align-items: center; gap: var(--sp-sm);
  font-family: var(--font-title);
  font-size: var(--fs-body); font-weight: 700;
}
.ms-tier-badge {
  font-size: var(--fs-xs); font-weight: 700;
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-pill);
}
.ms-tier-badge.bronze  { background: rgba(205,127,50,0.2);  color: var(--ms-bronze); }
.ms-tier-badge.silver  { background: rgba(192,192,192,0.2); color: var(--ms-silver); }
.ms-tier-badge.gold    { background: rgba(255,215,0,0.2);   color: var(--ms-gold); }
.ms-tier-badge.diamond { background: rgba(185,242,255,0.2); color: var(--ms-diamond); }

/* 等级路径 */
.ms-path {
  display: flex; justify-content: center; align-items: center;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-md);
}
.ms-path-node {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  transition: all var(--dur-fast);
}
.ms-path-node.reached {
  border-color: var(--color-success);
  background: rgba(58, 125, 68, 0.15);
}
.ms-path-node.current {
  border-width: 3px;
  transform: scale(1.15);
}
.ms-path-node.current.bronze  { border-color: var(--ms-bronze); box-shadow: 0 0 8px rgba(205,127,50,0.3); }
.ms-path-node.current.silver  { border-color: var(--ms-silver); box-shadow: 0 0 8px rgba(192,192,192,0.3); }
.ms-path-node.current.gold    { border-color: var(--ms-gold);   box-shadow: 0 0 8px rgba(255,215,0,0.3); }
.ms-path-node.current.diamond { border-color: var(--ms-diamond); box-shadow: 0 0 8px rgba(185,242,255,0.3); }
.ms-path-arrow {
  color: var(--color-border);
  font-size: var(--fs-xs);
}

/* 效果行 */
.ms-effect {
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-xs);
}
.ms-effect-label { color: var(--color-text-dim); }
.ms-effect-current { color: var(--color-success); font-weight: 700; }
.ms-effect-next { color: var(--color-accent); font-weight: 700; }

/* 进度 */
.ms-progress-label {
  font-size: var(--fs-xs); color: var(--color-text-dim);
  margin-top: var(--sp-sm);
}
.ms-progress {
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-top: var(--sp-xs);
}
.ms-progress-fill {
  height: 100%;
  border-radius: var(--radius-pill);
  transition: width var(--dur-norm) var(--ease-out);
}
.ms-progress-fill.bronze  { background: var(--ms-bronze); }
.ms-progress-fill.silver  { background: var(--ms-silver); }
.ms-progress-fill.gold    { background: var(--ms-gold); }
.ms-progress-fill.diamond { background: linear-gradient(90deg, var(--ms-diamond), #7DD3FC); }

/* 总加成汇总 */
.ms-summary {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-gold);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  margin-top: var(--sp-lg);
}
.ms-summary-title {
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-bottom: var(--sp-sm);
}
.ms-summary-tags {
  display: flex; flex-wrap: wrap; gap: var(--sp-sm);
}
.ms-summary-tag {
  padding: var(--sp-xs) var(--sp-sm);
  background: rgba(212, 168, 67, 0.1);
  border: 1px solid rgba(212, 168, 67, 0.2);
  border-radius: var(--radius-pill);
  font-family: var(--font-number);
  font-size: var(--fs-xs); font-weight: 700;
  color: var(--color-accent);
}
```

---

## 6. 动画定义

### 6.1 成就解锁动画（1000ms）

```css
@keyframes achUnlock {
  0% { transform: scale(0.8); opacity: 0; }
  40% { transform: scale(1.08); opacity: 1; }
  60% { transform: scale(0.97); }
  100% { transform: scale(1); }
}
@keyframes achGlow {
  0% { box-shadow: 0 0 0 rgba(212,168,67,0); }
  50% { box-shadow: 0 0 24px rgba(212,168,67,0.5); }
  100% { box-shadow: 0 0 0 rgba(212,168,67,0); }
}

/* 解锁时叠加 */
.ach-card.just-unlocked {
  animation: achUnlock 0.6s var(--ease-pop), achGlow 1s ease-out;
}
```

### 6.2 每日任务完成闪光
```css
@keyframes dailyComplete {
  0% { border-color: var(--color-border); }
  50% { border-color: var(--color-success); box-shadow: 0 0 12px rgba(58,125,68,0.3); }
  100% { border-color: var(--color-success); }
}
.daily-card.just-completed {
  animation: dailyComplete 0.6s ease;
}
```

### 6.3 里程碑升级动画
```css
@keyframes msTierUp {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1.15); }
}
.ms-path-node.just-upgraded {
  animation: msTierUp 0.8s var(--ease-pop);
}
```

### 6.4 全勤奖励解锁
```css
@keyframes bonusUnlock {
  0% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
.daily-bonus.just-unlocked {
  animation: bonusUnlock 0.6s var(--ease-pop), goldGlow 2s infinite;
}
```

---

## 7. 文件清单

| 类型 | 文件 | 内容 |
|------|------|------|
| 修改 | `src/styles/theme.css` | 追加 `--ms-bronze/silver/gold/diamond` |
| 新增 | `src/styles/quests.css` | 全部三面板样式 |
| 修改 | `src/styles/animations.css` | 追加 4 个 keyframes |
| 新增 | `src/components/views/QuestsView.tsx` | 任务页主容器 + 子标签切换 |
| 新增 | `src/components/views/AchievementPanel.tsx` | 成就面板 |
| 新增 | `src/components/views/DailyQuestPanel.tsx` | 每日任务面板 |
| 新增 | `src/components/views/MilestonePanel.tsx` | 里程碑面板 |
| 新增 | `src/store/quest.ts` | 成就/每日/里程碑 store |
| 修改 | `src/App.tsx` | NAV_ITEMS 增加任务 Tab |
| 修改 | `src/store/ui.ts` | ViewId 增加 `'quests'` |
| 修改 | `src/main.tsx` | 引入 `quests.css` |

---

## 汇总

| 面板 | 核心设计 | 工作量 |
|------|----------|--------|
| 🏆 成就 | 5分类筛选 + 三态卡片(解锁/进行中/锁定) + 进度条 + 奖励行 + 解锁弹出金光动画 | L |
| 📋 每日 | 5任务卡+进度条+领取按钮+全勤奖励区(5圆形指示器)+重置倒计时 | M |
| ⭐ 里程碑 | 铜银金钻4级路径 + 等级色进度条 + 永久buff + 总加成汇总标签 | M |

**总估时：~12h**
**建议执行顺序：** 每日任务（交互最简单）→ 成就面板 → 里程碑面板
