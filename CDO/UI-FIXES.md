# UI-FIXES.md — 具体 CSS/样式修复建议

**版本**：v1.0
**日期**：2026-03-01
**作者**：CDO
**来源**：UI-REVIEW.md 差异项
**状态**：CTO 尚未修复任何项，以下为可直接应用的修复代码

---

## 修复状态总览

| ID | 差异 | CTO已修复 | 本文提供修复 |
|----|------|-----------|-------------|
| P0-1 | 背包网格→列表 | ❌ | ✅ CSS + JSX |
| P0-2 | 品质体系 | ❌ | ✅ types.ts |
| P0-3 | 飘字动画 | ❌ | ✅ CSS + 组件 |
| P0-5 | 挂机收益区 | ❌ | ✅ JSX |
| P1-2 | 数字K→万 | ❌ | ✅ format.ts |
| P1-6 | Nav选中圆点 | ❌ | ✅ CSS |
| P1-7 | Tab切换动画 | ❌ | ✅ CSS |
| P1-9 | 暴击日志样式 | ❌ | ✅ CSS |

---

## Fix 1: 品质体系对齐（P0-2）

**文件**：`src/types.ts`

将 `QUALITY_INFO` 替换为：

```ts
export type Quality = 'common' | 'good' | 'rare' | 'epic' | 'legend' | 'mythic';

export const QUALITY_INFO: Record<Quality, { label: string; prefix: string; multiplier: number; color: string }> = {
  common: { label: '凡品', prefix: '○', multiplier: 1,  color: '#9e9e9e' },
  good:   { label: '良品', prefix: '●', multiplier: 2,  color: '#4caf50' },
  rare:   { label: '上品', prefix: '◆', multiplier: 4,  color: '#2196f3' },
  epic:   { label: '极品', prefix: '★', multiplier: 8,  color: '#9c27b0' },
  legend: { label: '仙品', prefix: '✦', multiplier: 16, color: '#ff9800' },
  mythic: { label: '神品', prefix: '✧', multiplier: 30, color: '#f44336' },
};
```

**迁移映射**（旧→新）：
- `common` → `common`
- `spirit` → `good`
- `immortal` → `rare`
- `divine` → `epic`
- `chaos` → `legend`
- 新增 `mythic`（后续内容）

所有渲染中将 `qualityInfo.label` 改为 `qualityInfo.prefix + item.name`。

---

## Fix 2: 数字中文化（P1-2）

**文件**：`src/utils/format.ts`

```ts
export function formatNumber(n: number): string {
  if (n < 0) return '-' + formatNumber(-n);
  if (n < 10_000) return Math.floor(n).toLocaleString('zh-CN');
  if (n < 100_000_000) return (n / 10_000).toFixed(1) + '万';
  return (n / 100_000_000).toFixed(1) + '亿';
}
```

---

## Fix 3: 暴击日志样式（P1-9）

**文件**：`src/index.css`

替换：
```css
.battle-log .crit { color: var(--accent); }
```

为：
```css
.battle-log .crit {
  color: #ff5722;
  font-weight: bold;
  background: rgba(244, 67, 54, 0.08);
  border-radius: 2px;
  padding: 1px 4px;
  margin: 0 -4px;
}
```

---

## Fix 4: BottomNav 选中圆点（P1-6）

**文件**：`src/index.css`

追加：
```css
.bottom-nav button {
  position: relative;
}
.bottom-nav button.active::after {
  content: '';
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 2px;
}
```

---

## Fix 5: Tab 切换淡入动画（P1-7）

**文件**：`src/index.css`

追加：
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.main-content {
  animation: fadeIn 150ms ease;
}
```

---

## Fix 6: 挂机收益统计区（P0-5）

**文件**：`src/App.tsx` — `BattleView` 组件

在 `<div className="battle-log">` 之后、`</div>` (main-content) 之前添加：

```tsx
<div className="idle-stats">
  <span>💰 +{formatNumber(stats.attack * 0.3)}/秒</span>
  <span>✨ +{formatNumber(stats.attack * 0.2)}/秒</span>
  <span>⏱️ 挂机中… {formatTime(totalPlayTime)}</span>
</div>
```

需要在 `BattleView` 中获取 `totalPlayTime`：
```tsx
const totalPlayTime = useGameStore(s => s.totalPlayTime);
```

**CSS**（`src/index.css`）：
```css
.idle-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  font-size: 12px;
  color: var(--text-dim);
  padding: var(--space-sm) 0;
  border-top: 1px dashed var(--border);
  margin-top: var(--space-sm);
}
```

---

## Fix 7: 背包列表布局（P0-1）

**替换** `.bag-grid` 的 CSS：

```css
/* 替换网格为列表 */
.bag-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.bag-item {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  transition: transform 0.1s;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-align: left;
}
.bag-item:active { transform: scale(0.98); }
.bag-item .item-icon { font-size: 20px; flex-shrink: 0; }
.bag-item .item-info { flex: 1; min-width: 0; }
.bag-item .item-name { font-size: 13px; }
.bag-item .item-stat { font-size: 11px; color: var(--text-dim); }
.bag-item .item-level { font-size: 11px; color: var(--accent); flex-shrink: 0; }
```

**对应 JSX 修改**（`BagView` 中 `bag-grid` 内的 map）：

```tsx
{sorted.map(item => {
  const qi = QUALITY_INFO[item.quality];
  return (
    <div key={item.uid} className="bag-item"
      style={{ borderLeftColor: qi.color, borderLeftWidth: 3 }}
      onClick={() => setSelectedItem(item)}>
      <span className="item-icon">{item.emoji}</span>
      <div className="item-info">
        <div className="item-name" style={{ color: qi.color }}>
          {qi.prefix}{item.name}
        </div>
        <div className="item-stat">
          {item.slot === 'weapon' && `⚡+${formatNumber(getEquipEffectiveStat(item))}`}
          {item.slot === 'armor' && `❤️+${formatNumber(getEquipEffectiveStat(item))}`}
          {item.passive && ` ${item.passive.description}`}
        </div>
      </div>
      {item.level > 0 && <span className="item-level">+{item.level}</span>}
    </div>
  );
})}
```

---

## Fix 8: 伤害飘字（P0-3）— 最小可用版本

**文件**：`src/index.css` 追加：

```css
/* 飘字容器 */
.float-damage {
  position: absolute;
  right: 16px;
  pointer-events: none;
  font-family: monospace;
  font-weight: bold;
  animation: dmg-float 800ms ease-out forwards;
  z-index: 10;
}
.float-damage.crit {
  font-size: 18px;
  animation: dmg-crit 1000ms ease-out forwards;
}
.float-damage.normal {
  font-size: 14px;
  color: var(--red);
}

@keyframes dmg-float {
  0%   { transform: translateY(0); opacity: 1; }
  30%  { transform: translateY(-12px); opacity: 1; }
  100% { transform: translateY(-30px); opacity: 0; }
}

@keyframes dmg-crit {
  0%   { transform: translateY(0) scale(1.8); opacity: 1; }
  15%  { transform: translateY(-5px) scale(1.0); }
  30%  { transform: translateY(-12px) scale(1.0); opacity: 1; }
  100% { transform: translateY(-40px) scale(1.0); opacity: 0; }
}
```

**实现建议**：在 `enemy-section` 中添加 `position: relative`，当 tick 产生伤害时在敌人面板内创建飘字 DOM 元素，800ms 后移除。可使用 React state 数组 + `useEffect` 定时清理。

---

## Fix 9: 卖出确认弹窗（P2-8）

**文件**：`src/App.tsx` — `EquipDetail` 组件

将卖出按钮的 onClick 改为：

```tsx
onClick={() => {
  if (confirm(`确定卖出 ${item.name}？`)) {
    sellItem(item.uid);
    onClose();
  }
}}
```

---

## 修复优先级建议

| 优先 | Fix | 预估 | 影响 |
|------|-----|------|------|
| 1 | Fix 1 品质体系 | 1h | 数据层基础 |
| 2 | Fix 2 数字中文 | 15min | 全局显示 |
| 3 | Fix 7 背包列表 | 1h | 核心页面 |
| 4 | Fix 6 挂机统计 | 30min | 战斗页 |
| 5 | Fix 3 暴击样式 | 5min | 纯 CSS |
| 6 | Fix 4 Nav圆点 | 5min | 纯 CSS |
| 7 | Fix 5 Tab动画 | 5min | 纯 CSS |
| 8 | Fix 8 飘字 | 2h | 核心体验 |
| 9 | Fix 9 卖出确认 | 5min | 一行改动 |
