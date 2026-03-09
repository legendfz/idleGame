---
date: 2026-03-09
from: CDO
to: CEO
type: review
status: complete
---

# v189 UI 一致性审查报告

## 审查范围
- `src/index.css` (1570行) — 主样式
- `src/styles/` (5个CSS文件: animations, guide, settings, stats, tutorial)
- `src/pages/` (8个TSX组件)
- 重点：颜色/间距/移动端适配/暗色对比度/动画性能/a11y

---

## 🔴 P0 — 严重问题（6项）

### 1. 双变量体系冲突
`index.css` 使用 `--space-xs/sm/md/lg`、`--border`、`--card`、`--text-dim` 等变量。
`styles/*.css`（guide/settings/stats/tutorial）使用 `theme.css` 的 `--sp-xs`、`--color-border`、`--color-bg-card`、`--radius-md` 等。

**两套变量值不同**，同一页面混用会导致间距/颜色不一致：
| 属性 | index.css | theme.css |
|------|-----------|-----------|
| 背景 | `--bg: #0d0d0d` | `--color-bg: #1A1420` |
| 卡片底 | `--card: #201c14` | `--color-bg-card: #2E2838` |
| 边框 | `--border: #3d3422` | `--color-border: #3A3248` |
| 暗文字 | `--text-dim: #7a7466` | `--color-text-dim: #9A8E80` |
| 间距md | `--space-md: 16px` | `--sp-md: 12px` |

**修复 — 统一为 theme.css 变量：**
```css
/* index.css :root 追加映射，逐步迁移 */
:root {
  --space-xs: var(--sp-xs, 4px);
  --space-sm: var(--sp-sm, 8px);
  --space-md: var(--sp-md, 12px);  /* 16→12 或保持16并更新theme */
  --space-lg: var(--sp-lg, 16px);
  --card: var(--color-bg-card);
  --panel: var(--color-bg-elevated);
  --border: var(--color-border);
  --text-dim: var(--color-text-dim);
  --bg: var(--color-bg);
}
```

### 2. 暗色对比度不足（WCAG AA 失败）
| 元素 | 前景色 | 背景色 | 对比度 | 要求 |
|------|--------|--------|--------|------|
| `.color-dim` / `.color-info` | `#7a7466` | `#0d0d0d` | 3.8:1 | 4.5:1 ❌ |
| `.color-attack` | `#9a9688` | `#201c14` | 3.6:1 | 4.5:1 ❌ |
| `.color-kill` / `.color-success` | `#2d6b30` | `#0d0d0d` | 2.7:1 | 4.5:1 ❌ |
| `.color-boss` | `#8b2020` | `#201c14` | 2.1:1 | 4.5:1 ❌ |
| `.enemy-sub-stats` | `#7a7466` on card | | 3.5:1 | 4.5:1 ❌ |

**修复：**
```css
:root {
  --color-attack: #b5b0a4;   /* #9a9688 → 提亮，对比度 5.2:1 */
  --color-kill: #4caf50;      /* #2d6b30 → 使用 green-bright，5.1:1 */
  --color-boss: #c0392b;      /* #8b2020 → 使用 red-bright，4.8:1 */
  --color-info: #9a9488;      /* #7a7466 → 提亮，4.8:1 */
  --text-dim: #9a9488;        /* 同步 */
}
```

### 3. safe-area 处理不当
```css
/* 当前：padding 在 html 上 */
html { padding: env(safe-area-inset-top) ... }
```
这会在非刘海设备白白加 padding。且 `bottom-nav` 和 `boss-toast` (`position:fixed`) 不受 html padding 影响。

**修复：**
```css
html { padding: 0; }  /* 移除 */

.top-bar {
  padding-top: calc(var(--space-sm) + env(safe-area-inset-top, 0px));
}
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.boss-toast, .modal-overlay, .event-modal-overlay, .guide-overlay, .tutorial-overlay {
  /* fixed 元素已有 inset:0，但需确保内容不被刘海遮挡 */
  padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px)
           env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
}
```

### 4. 大量 inline style（276处）
统计：BattlePage 51处、SettingsPage 66处、TeamPage 50处、JourneyPage 44处、BagPage 28处。

这些导致：无法媒体查询响应、无法被用户样式覆盖、不可缓存。

**优先迁移**（影响最大的3个文件）：
- `SettingsPage.tsx` — 66处 → 提取为 `.settings-*` class（已有 settings.css 未使用）
- `TeamPage.tsx` — 50处 → 提取为 `.team-*` class
- `BattlePage.tsx` — 51处（v35已迁移部分，剩余在子组件 Card style prop）

### 5. 动画缺少 GPU 加速
多个动画使用 `box-shadow`、`opacity`、`filter` 变化，未用 `will-change` 或 `transform: translateZ(0)` 提示 GPU 合成。

**修复 — 高频动画元素添加：**
```css
.floating-text,
.enemy-emoji.boss-glow,
.enemy-emoji.elite-glow,
.boss-toast-inner,
.breakthrough-btn,
.skill-btn.skill-active {
  will-change: transform, opacity;
}
/* 动画结束后移除 will-change 需 JS 配合，或接受常驻开销（元素少可接受） */
```

### 6. guide.css 与 tutorial.css 功能重叠
两个文件都实现新手引导覆层，使用不同 z-index 计算（`var(--z-modal)+50` vs `+10`）、不同类名前缀（`guide-` vs `tutorial-`）。

**修复：** 删除 `guide.css`，统一使用 `tutorial.css`（已被实际代码引用）。或反之——需确认 CTO 实际用哪个。

---

## 🟡 P1 — 中等问题（8项）

### 7. 字体栈不一致
- `index.css body`: `'Segoe UI', system-ui, -apple-system, sans-serif`
- `theme.css`: `--font-body: 'Noto Sans SC', system-ui, sans-serif`
- monospace: `'Cascadia Mono', Consolas, monospace` (index) vs `'Roboto Mono', monospace` (theme)

**修复：** index.css 改用 theme 变量：
```css
body { font-family: var(--font-body, 'Segoe UI', system-ui, sans-serif); }
.battle-log, .hp-bar-text, .stats-row, .idle-stats, .lb-row {
  font-family: var(--font-number, 'Cascadia Mono', Consolas, monospace);
}
```

### 8. 间距不统一
- `.card` 的 `margin-bottom: 12px` — 不是任何变量值（xs=4, sm=8, md=16）
- `.battle-realm-bar padding: 4px 12px` — 混合硬编码
- `.skill-bar gap: 8px` — 应为 `var(--space-sm)`

**修复：** 全局替换 `12px` → `var(--space-md)` 或 `var(--sp-md)`，`8px` → `var(--space-sm)`

### 9. 圆角不一致
| 组件 | 圆角 |
|------|------|
| `.card` | 6px |
| `.click-area` | 8px |
| `.event-modal` | 16px |
| `.sign-in-btn` | 12px |
| `.skill-btn` | 12px |
| `.breakthrough-btn` | 8px |
| `.filter-btn` | 4px |
| `.back-btn` | 4px |

**修复：** 统一为变量：
```css
/* 建议规范 */
.card, .dungeon-card, .filter-btn, .back-btn { border-radius: var(--radius-sm, 6px); }
.click-area, .breakthrough-btn { border-radius: var(--radius-md, 8px); }
.event-modal, .skill-btn, .sign-in-btn { border-radius: var(--radius-lg, 12px); }
```

### 10. 触摸目标过小
- `.filter-btn padding: 4px 12px` — 高度约 24px，低于 44px 推荐
- `.small-btn padding: 4px 10px` — 同上
- `.back-btn padding: 4px 12px`
- `.tab-item` 无 min-height

**修复：**
```css
.filter-btn, .small-btn, .back-btn {
  min-height: 36px; /* 至少36px，理想44px */
  display: inline-flex;
  align-items: center;
}
.tab-item { min-height: 44px; }
```

### 11. 横屏布局溢出
`body { max-width: 480px }` + `overflow: hidden` 在横屏时内容被截断。

**修复：**
```css
@media (orientation: landscape) and (max-height: 500px) {
  body { max-width: 100vw; }
  .main-content { padding: 8px 12px; }
  .bottom-nav { padding: 4px 0; }
  .bottom-nav button .icon { font-size: 14px; }
}
```

### 12. 小屏幕（≤320px）适配缺失
仅有 `@media (max-width: 374px)` 隐藏 nav 文字。其他元素在 320px 下可能溢出。

**修复：**
```css
@media (max-width: 320px) {
  .stats-row { gap: var(--space-sm); font-size: 11px; }
  .idle-stats { font-size: 10px; }
  .skill-bar { gap: 4px; }
  .skill-btn { min-width: 56px; padding: 6px 8px; }
  .daily-grid { grid-template-columns: repeat(3, 1fr); }
}
```

### 13. `.breakthrough-btn` 定义重复
在 index.css 中出现两次定义（第一次 v35.0 样式，第二次 Realm 部分）。后者覆盖前者，导致 v35.0 的渐变和动画失效。

**修复：** 删除第二个 `.breakthrough-btn` 定义（约 L580），将 `:disabled` 合并到第一个。

### 14. 战斗日志 mask-image 兼容性
`mask-image` 需要 `-webkit-` 前缀（已有），但 Firefox 需要标准属性。当前顺序错误。

**修复：**
```css
.battle-log {
  -webkit-mask-image: linear-gradient(...);
  mask-image: linear-gradient(...);  /* 标准属性放后面 */
}
```

---

## 🟢 P2 — 优化建议（5项）

### 15. a11y: 缺少 focus 可见样式
所有 button 无 `:focus-visible` 样式，键盘导航时无法识别焦点。

```css
button:focus-visible, .tab-item:focus-visible, .click-area:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### 16. a11y: 动画偏好
已有 `.no-anim` class 但缺少系统级媒体查询。

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 17. 性能: `@keyframes` 重复定义
`fadeIn` 在 index.css 中定义两次。`pulse` 在 index.css 中定义后又在 animations.css 隐式使用。

**修复：** 删除重复的 `@keyframes fadeIn`（保留第一个）。

### 18. 颜色语义化建议
部分颜色直接写死在 CSS 中，建议提取为变量：
```css
:root {
  --color-wukong-glow: rgba(201,168,76,0.3);
  --color-boss-red: rgba(139,32,32,0.15);
  --color-elite-purple: rgba(168,85,247,0.7);
  --color-tribulation: #9b59b6;
}
```

### 19. CSS 文件加载顺序优化
`main.tsx` 导入了 guide.css、settings.css、stats.css 等 v2.0 体系的文件，但实际页面用的是 index.css 里的样式。未使用的 CSS 增加了约 18KB 冗余。

**建议：** 按需 lazy import 或确认实际使用后清理未引用文件。

---

## 📊 审查总结

| 等级 | 数量 | 主要问题 |
|------|------|----------|
| 🔴 P0 | 6 | 双变量冲突、对比度、safe-area、inline style、GPU、文件重复 |
| 🟡 P1 | 8 | 字体栈、间距、圆角、触摸目标、横屏、小屏、重复定义、兼容性 |
| 🟢 P2 | 5 | focus样式、reduced-motion、重复keyframes、语义化、冗余CSS |

## 推荐执行顺序
1. **P0-1 双变量统一** — 影响全局一致性，最先修
2. **P0-2 对比度修复** — 可访问性基础，改 6 个颜色值
3. **P0-3 safe-area** — 移动端必须
4. **P0-5 will-change** — 一行 CSS 改善动画性能
5. **P0-6 + P1-13** — 删除重复文件/规则
6. **P1 批量** — 间距/圆角/字体统一（可一个 PR）
7. **P0-4 inline style 迁移** — 工作量最大，分 3 个文件逐步进行
8. **P2** — 后续优化

估时：P0 约 4h、P1 约 3h、P2 约 2h，总计 ~9h
