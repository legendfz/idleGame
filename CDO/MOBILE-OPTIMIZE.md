# MOBILE-OPTIMIZE.md — 移动端适配优化建议

**版本**：v1.0
**日期**：2026-03-01
**作者**：CDO
**审查对象**：CTO/idle-game/src/index.css + App.tsx

---

## 当前状态评估

CTO 实现了基础移动适配：`max-width: 480px`、`100dvh`、`flex` 布局。但存在以下问题需优化。

---

## 🔴 P0 — 必须修复

### M-01: 缺少 safe-area 适配（刘海屏/底部横条）

**问题**：BottomNav 和 TopBar 未考虑 iOS safe-area，刘海屏顶部内容被遮挡，底部 Home 横条覆盖导航。

**修复**：

```css
/* index.css — 追加 */

/* 1. HTML meta viewport（已有，确认包含 viewport-fit） */
/* <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> */

/* 2. TopBar 顶部安全区 */
.top-bar {
  padding-top: calc(var(--space-sm) + env(safe-area-inset-top));
}

/* 3. BottomNav 底部安全区 */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 4. 内容区底部留白 — 防止被 BottomNav 遮挡 */
.main-content {
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
}
```

**还需检查**：`CTO/idle-game/index.html` 中 `<meta name="viewport">` 是否包含 `viewport-fit=cover`。

---

### M-02: 点击区域过小（不符合触控标准）

**问题**：多处可点击元素不足 44×44px 最小触控区。

| 元素 | 当前尺寸 | 问题 |
|------|---------|------|
| `.bag-item`（网格模式） | ~80×60px | ✅ 够大 |
| `.bag-filters button` | 高度 ~24px | ❌ 太矮 |
| `.equip-slot-row` 卸下按钮 | fontSize 11px 文字 | ❌ 极小 |
| `.bottom-nav button` | 高度 ~40px | ⚠️ 略小 |
| 装备详情关闭按钮 | 纯文字无 padding | ❌ 太小 |

**修复**：

```css
/* 背包过滤按钮最小高度 */
.bag-filters button {
  min-height: 36px;
  font-size: 12px;
}

/* BottomNav 最小高度 */
.bottom-nav button {
  min-height: 52px;
  padding: var(--space-sm) 0 calc(var(--space-sm) + 2px) 0;
}

/* 装备行卸下按钮 */
.equip-slot-row span[style*="cursor: pointer"] {
  /* 建议改为 class，增加点击区域 */
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

**JSX 修改建议**：装备详情关闭按钮改为有尺寸的按钮：
```tsx
<button onClick={onClose} className="close-btn">✕ 关闭</button>
```
```css
.close-btn {
  min-height: 44px;
  min-width: 44px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 13px;
  margin-top: var(--space-sm);
}
```

---

### M-03: 弹窗/模态框缺少移动端优化

**问题**：`modal-overlay` 使用 `align-items: center`，在小屏上弹窗可能被键盘顶起或被刘海遮挡。

**修复**：

```css
.modal-overlay {
  /* 改为偏上居中，避免键盘遮挡 */
  align-items: flex-start;
  padding-top: max(15vh, env(safe-area-inset-top, 0px) + 20px);
}

/* 弹窗最大高度限制 + 内容可滚动 */
.modal-content {
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

---

## 🟡 P1 — 建议优化

### M-04: 缺少 -webkit-overflow-scrolling（iOS 惯性滚动）

```css
.main-content {
  -webkit-overflow-scrolling: touch;
}
.battle-log {
  -webkit-overflow-scrolling: touch;
}
```

### M-05: 防止文字选中干扰操作

战斗日志和点击区域不应被长按选中：

```css
.click-area,
.battle-log,
.bottom-nav,
.bag-item,
.equip-slot-row {
  -webkit-user-select: none;
  user-select: none;
}
```

### M-06: 点击高亮移除（Android 蓝色闪烁）

```css
* {
  -webkit-tap-highlight-color: transparent;
}
```

### M-07: 防止页面下拉刷新（PWA 体验）

```css
body {
  overscroll-behavior: none;
}
```

已在 `overflow: hidden` 中部分生效，但显式声明更可靠。

### M-08: 字号防止 iOS 自动放大

```css
/* 防止 iOS Safari 在 input/select 上自动 zoom */
input, select, textarea, button {
  font-size: 16px; /* ≥16px 不触发 zoom */
}
```

当前无 input 元素，但未来加搜索/改名时会需要。

### M-09: 战斗日志滚动条隐藏

移动端不需要可见滚动条：

```css
.battle-log::-webkit-scrollbar { display: none; }
.battle-log { scrollbar-width: none; }
.main-content::-webkit-scrollbar { display: none; }
.main-content { scrollbar-width: none; }
```

### M-10: 横屏锁定提示

当前不做横屏适配，建议在横屏时提示：

```css
@media (orientation: landscape) and (max-height: 500px) {
  body::before {
    content: '📱 请竖屏使用';
    position: fixed;
    inset: 0;
    background: var(--bg);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    z-index: 9999;
  }
}
```

---

## 🟢 P2 — 进阶优化

### M-11: 300ms 点击延迟

现代浏览器已基本消除，但确认 `<meta name="viewport">` 中有 `width=device-width` 即可。

### M-12: PWA 全屏模式适配

已有 `manifest.json` 和 `sw.js`（PWA 支持）。确认 manifest 中：
```json
{
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e"
}
```

### M-13: 性能 — 战斗日志虚拟滚动

当前保留 30 条日志，DOM 数量可控。但如果后续增加到更多，建议用虚拟滚动（如 `@tanstack/react-virtual`）。当前不需要。

### M-14: 大屏适配（iPad/桌面）

当前 `max-width: 480px; margin: 0 auto` 已经居中，但两侧空白无处理。建议：

```css
@media (min-width: 481px) {
  body {
    background: #0d0d1a; /* 更深背景 */
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }
}
```

---

## 修复优先级汇总

| ID | 问题 | 优先级 | 工作量 |
|----|------|--------|--------|
| M-01 | Safe-area 适配 | 🔴 P0 | 15min |
| M-02 | 触控区域过小 | 🔴 P0 | 30min |
| M-03 | 弹窗移动端优化 | 🔴 P0 | 15min |
| M-04 | iOS 惯性滚动 | 🟡 P1 | 5min |
| M-05 | 防文字选中 | 🟡 P1 | 5min |
| M-06 | 去点击高亮 | 🟡 P1 | 1min |
| M-07 | 防下拉刷新 | 🟡 P1 | 1min |
| M-08 | 字号防 zoom | 🟡 P1 | 1min |
| M-09 | 隐藏滚动条 | 🟡 P1 | 5min |
| M-10 | 横屏提示 | 🟡 P1 | 5min |
| M-11 | 点击延迟 | 🟢 P2 | 确认即可 |
| M-12 | PWA 配置 | 🟢 P2 | 5min |
| M-13 | 虚拟滚动 | 🟢 P2 | 暂不需要 |
| M-14 | 大屏适配 | 🟢 P2 | 10min |

**P0 总工作量**：~1h
**P1 总工作量**：~25min
