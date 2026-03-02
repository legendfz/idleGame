# V2.1 UI 改进设计规格

> 作者：CDO | 日期：2026-03-02 | 基于 v2.0 代码审查

---

## P2-01 · 修炼界面突破动画与数值反馈 [M]

### 问题
当前突破仅通过 Toast 文字通知，无视觉冲击感。点击修炼也无即时数值飘字，玩家感知弱。

### 现状
- `IdleView.tsx` → `handleBreakthrough()` 调用 `addToast(result.message, 'success')`
- `handleClick()` 调用 `addXiuwei()` 但无视觉反馈
- 突破按钮 `.btn-breakthrough.can-break` 仅有红底 + 阴影

### 设计规格

**A. 突破成功动画序列（800ms）：**
1. 屏幕闪白 `opacity: 0→0.6→0` (200ms)
2. 按钮爆裂扩散：`scale(1)→scale(1.3)→scale(1)` + `box-shadow: 0 0 40px var(--color-accent)` (400ms)
3. 境界文字替换动画：旧境界上滑淡出 + 新境界下滑淡入 (300ms)
4. 金色粒子雨（纯 CSS）：`::before` / `::after` 用 `radial-gradient` 模拟 8 个金色圆点向四周扩散

```css
@keyframes breakthroughFlash {
  0% { opacity: 0; }
  25% { opacity: 0.6; }
  100% { opacity: 0; }
}
@keyframes breakthroughPulse {
  0% { transform: scale(1); box-shadow: 0 0 12px rgba(193,59,59,0.4); }
  50% { transform: scale(1.3); box-shadow: 0 0 40px var(--color-accent); }
  100% { transform: scale(1); box-shadow: 0 0 12px rgba(193,59,59,0.4); }
}
@keyframes realmTextSwap {
  0% { transform: translateY(0); opacity: 1; }
  40% { transform: translateY(-20px); opacity: 0; }
  60% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.breakthrough-flash {
  position: fixed; inset: 0; background: var(--color-accent);
  pointer-events: none; z-index: var(--z-modal);
  animation: breakthroughFlash 0.5s ease-out forwards;
}
```

**B. 点击修炼飘字：**
- 每次点击在圆形按钮上方生成 `+{数值}` 飘字
- 颜色：`var(--color-accent)` 金色
- 动画：`translateY(0)→translateY(-40px)` + `opacity: 1→0`，时长 600ms
- 随机水平偏移 ±15px 避免重叠

```css
@keyframes floatUp {
  0% { transform: translate(var(--float-x), 0); opacity: 1; }
  100% { transform: translate(var(--float-x), -40px); opacity: 0; }
}
.click-float {
  position: absolute; top: -10px; left: 50%;
  color: var(--color-accent); font-family: var(--font-number);
  font-size: var(--fs-sm); font-weight: 700; pointer-events: none;
  animation: floatUp 0.6s var(--ease-out) forwards;
}
```

**C. 进度条动态闪光：**
- 当进度 ≥80% 时，进度条叠加 `goldGlow` 动画（已有 animations.css）
- 条内增加从左到右的光斑 sweep：`linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)` 位移动画

### 影响文件
- `src/components/views/IdleView.tsx` — 添加状态管理 + 飘字 DOM
- `src/styles/views.css` — 新增上述 keyframes + 类名
- `src/store/ui.ts` — 可选：增加 `breakthroughEffect` 布尔状态

### 工作量：M（~3h）

---

## P2-02 · 底部导航栏切换微交互 [S]

### 问题
Tab 切换无过渡动画，生硬。活动指示器仅为 4px 圆点，辨识度低。

### 现状
- `BottomNav.module.css` → `.active::after` 为 4×4 圆点
- 切换视图无任何过渡，内容区硬替换
- 5 个 Tab icon 20px，间距依赖 `flex:1`

### 设计规格

**A. 活动指示器升级：**
- 圆点 → 胶囊条：`width: 20px; height: 3px; border-radius: var(--radius-pill);`
- 位置：icon 下方 2px（`bottom: calc(env(safe-area-inset-bottom) + 2px)`）
- 颜色：`var(--color-accent)`
- 切换时胶囊滑动：`transition: left var(--dur-norm) var(--ease-out)` （需 JS 计算目标位置，或每个 item 自带伪元素用 `transform: scaleX(0→1)`）

```css
.active::after {
  content: '';
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom) + 2px);
  left: 50%; transform: translateX(-50%);
  width: 20px; height: 3px;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  animation: scaleIn var(--dur-fast) var(--ease-pop);
}
@keyframes scaleIn {
  from { transform: translateX(-50%) scaleX(0); }
  to { transform: translateX(-50%) scaleX(1); }
}
```

**B. Icon 按下反馈：**
- `:active` 状态：`transform: scale(0.85); transition: transform 80ms;`
- 松手回弹：利用 `--ease-pop`

**C. 视图切换过渡（可选）：**
- 内容区 `<main>` 的子元素入场：`animation: fadeIn var(--dur-fast) ease-out`
- 已有 `.animate-fadeIn`，只需在 view 根 div 加类名

```css
.item:active .icon { transform: scale(0.85); }
.icon { transition: transform 80ms var(--ease-pop); }
```

### 影响文件
- `src/components/layout/BottomNav/BottomNav.module.css` — 修改 `.active::after` + 新增 `:active`
- 各 View 根元素 — 添加 `className="animate-fadeIn"`

### 工作量：S（~1h）

---

## P2-03 · 境界信息展示卡片化 [M]

### 问题
IdleView 的境界显示只有 `<h2>` + 倍率文字，信息密度低，无视觉层次。缺少下一境界预览和进度感。

### 现状
- `.realm-display` → 居中 h2（境界名·N层）+ 12px 倍率文字
- 无下一境界信息、无突破条件展示
- 与整体卡片化设计语言不统一

### 设计规格

**卡片布局：**
```
┌─────────────────────────────┐
│  🧘 练气·三层                │ ← font-title, fs-lg, color-accent
│  ─────────────────────────  │
│  修炼倍率  ×1.5             │ ← fs-sm, color-text-dim
│  突破需求  12.5K 修为       │ ← fs-sm, 达成显绿/未达显灰
│  下一境界  练气·四层         │ ← fs-sm, color-accent (若九层→显示新境界名)
│  ─────────────────────────  │
│  [进度条 ████░░░░ 67%]      │ ← 复用 .progress-bar
└─────────────────────────────┘
```

**CSS：**
```css
.realm-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  margin-bottom: var(--sp-lg);
}
.realm-card-title {
  font-family: var(--font-title);
  font-size: var(--fs-lg);
  color: var(--color-accent);
  margin-bottom: var(--sp-sm);
}
.realm-card-row {
  display: flex; justify-content: space-between;
  font-size: var(--fs-sm); color: var(--color-text-dim);
  margin-bottom: var(--sp-xs);
}
.realm-card-row .value { font-family: var(--font-number); }
.realm-card-row .met { color: var(--color-success); }
```

**交互：点击卡片展开更多信息（可选 v2.2）**
- 当前境界技能描述
- 已解锁能力列表

### 影响文件
- `src/components/views/IdleView.tsx` — 重构 `.realm-display` → `.realm-card`
- `src/styles/views.css` — 新增卡片样式

### 工作量：M（~2h）

---

## P2-04 · 取经地图节点可视化优化 [L]

### 问题
JourneyMap 当前为纯文字列表（boss icon + name + stars），无路线感和进度感。81难全部平铺显示，信息过载。

### 现状
- `.stage-list` → 简单 `div` 列表，每项一行
- `.stage-node` 只有 `cleared/locked` 两个状态类
- 进度条为顶部单一全局条

### 设计规格

**A. 章节折叠分组：**
- 81难按章节分组（每章 3 难），默认只展开当前章节
- 章节标题：`第一章 · 初出长安 [3/3 ⭐]`
- 点击展开/收起（accordion）

```
┌ 第一章 · 初出长安  ⭐⭐⭐ ────── ▼ ┐
│  ✅ 1. 白虎岭   ⭐⭐⭐              │
│  ✅ 2. 蛇盘山   ⭐⭐                │
│  🔴 3. 鹰愁涧   当前                │
└──────────────────────────────────┘
  第二章 · 流沙河  🔒              ── ▶
  第三章 · 火焰山  🔒              ── ▶
```

**B. 节点三态视觉：**
```css
.stage-node.cleared {
  color: var(--color-success);
  border-left: 3px solid var(--color-success);
  padding-left: var(--sp-md);
}
.stage-node.current {
  color: var(--color-accent);
  border-left: 3px solid var(--color-accent);
  padding-left: var(--sp-md);
  background: rgba(212, 168, 67, 0.08);
}
.stage-node.locked {
  color: var(--color-text-dim);
  opacity: 0.4;
  padding-left: calc(var(--sp-md) + 3px);
}
```

**C. 星级显示：**
- 满星：`⭐` (color-accent)
- 空星：`☆` (color-text-dim)
- 每难最多 3 星

**D. 章节进度 mini bar：**
- 章节标题右侧显示 `[已通关/总数]` + 3 格 mini 进度条

```css
.chapter-header {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: var(--sp-md);
  margin-bottom: var(--sp-xs); cursor: pointer;
}
.chapter-stars { font-size: var(--fs-xs); color: var(--color-accent); }
```

### 影响文件
- `src/components/views/JourneyMap.tsx` — 重构为 accordion 分组
- `src/styles/views.css` — 新增章节/节点样式
- `src/data/config.ts` — 确认 `chapter` 字段可用于分组

### 工作量：L（~4h）

---

## P2-05 · 全局色彩与间距一致性修正 [S]

### 问题
多处内联 style 与主题变量不一致，间距不统一，字号硬编码。

### 现状（代码审查发现）
1. **ToastContainer.tsx** — 全部内联 style，未用 CSS 类/变量：`top: 60`, `gap: 6`, `padding: '8px 20px'`, `fontSize: 13`
2. **IdleView.tsx** — `.stats-footer` 字号 `11px` 应为 `var(--fs-xs)`
3. **BattleView.tsx** — `.battle-header` 字号 `12px` 应为 `var(--fs-sm)`
4. **EquipmentPanel.tsx** — 无样式类，输出裸 div
5. **InventoryView.tsx** — `.equip-actions button` 用 `var(--color-bg-elevated)` 作按钮底色，与设计指南中按钮应为 `transparent` 或 `var(--color-bg-card)` 不一致

### 设计规格

**A. Toast 组件样式外置：**
```css
.toast-container {
  position: fixed; top: calc(env(safe-area-inset-top) + 56px);
  left: 50%; transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex; flex-direction: column; gap: var(--sp-xs);
  align-items: center; pointer-events: none;
}
.toast-item {
  padding: var(--sp-sm) var(--sp-xl);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm); font-weight: 700;
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-card);
  animation: slideUp var(--dur-norm) var(--ease-out);
  pointer-events: auto;
}
.toast-success { background: var(--color-success); }
.toast-info    { background: var(--color-info); }
.toast-warn    { background: var(--color-warning); }
.toast-error   { background: var(--color-danger); }
```

**B. 全局字号替换表：**
| 位置 | 当前 | 应改为 |
|------|------|--------|
| `.stats-footer` | `11px` | `var(--fs-xs)` |
| `.battle-header` | `12px` | `var(--fs-sm)` |
| `.stage-detail` | `12px` | `var(--fs-sm)` |
| `.char-role` | `11px` | `var(--fs-xs)` |
| `.char-passive` | `12px` | `var(--fs-sm)` |
| `.char-stats` | `11px` | `var(--fs-xs)` |
| `.empty-msg` | (无) | `var(--fs-body)` |

**C. 间距变量统一：**
- 所有 `margin-bottom: 8px` → `var(--sp-sm)`
- 所有 `margin-top: 12px` → `var(--sp-md)`
- 所有 `padding: 12px` → `var(--sp-md)`
- 所有 `gap: 8px` → `var(--sp-sm)`

### 影响文件
- `src/components/shared/ToastContainer.tsx` — 内联→className
- `src/styles/views.css` — 硬编码值→变量
- `src/components/views/EquipmentPanel.tsx` — 添加样式类

### 工作量：S（~1.5h）

---

## 汇总

| ID | 改进项 | 优先级 | 工作量 | 影响面板 |
|----|--------|--------|--------|----------|
| P2-01 | 突破动画 + 点击飘字 + 进度条闪光 | P2 | M | IdleView |
| P2-02 | 底部导航胶囊指示器 + 按压反馈 | P2 | S | BottomNav + 全局 |
| P2-03 | 境界信息卡片化 | P2 | M | IdleView |
| P2-04 | 取经地图章节折叠 + 节点三态 | P2 | L | JourneyMap |
| P2-05 | Toast外置 + 字号/间距变量统一 | P2 | S | 全局 |

**建议执行顺序：** P2-05 → P2-02 → P2-03 → P2-01 → P2-04
（先统一基础再加特效，地图重构最大放最后）

**总估时：~11.5h**
