# v7.0「仙界商铺」设计规格

> 作者：CDO | 日期：2026-03-02
> CSS 已实现：shop.css / event.css

---

## 1. 商店面板

### 布局
```
┌─────────────────────────────┐
│ 🏪 仙界商铺    ⏱ 刷新 23:45 │
├─────────────────────────────┤
│ [🪙 12.5K] [☸️ 350] [🍑 28]│ ← 货币栏
├─────────────────────────────┤
│ ── 限时特惠 ──               │
│ ┌──────┐ ┌──────┐           │
│ │-30%  │ │      │           │ ← 2列grid
│ │ 🗡️   │ │ 🛡️   │           │
│ │紫电剑 │ │玄龟甲 │           │
│ │🪙 700 │ │🪙 500 │           │
│ │[购买] │ │[购买] │           │
│ └──────┘ └──────┘           │
│                              │
│ ── 每日商品 ──               │
│ ┌──────┐ ┌──────┐           │
│ │ ⛏️   │ │ 📜   │           │
│ │灵铁×5 │ │天命符 │           │
│ │🪙 200 │ │☸️ 100│           │
│ │[购买] │ │[购买] │           │
│ └──────┘ └──────┘           │
└─────────────────────────────┘
```

### 核心组件
- **货币栏**：3格flex，金币/功德/蟠桃，各自品牌色
- **商品卡**：2列grid，居中排列（icon 52px + 名称 + 描述 + 价格 + 购买按钮）
- **限时特惠**：金色边框 + `goldGlow` 呼吸动画 + 折扣角标（右上红色）
- **价格双色**：买得起=金色，买不起=红色；有折扣时显示划线原价
- **售罄态**：整卡 `opacity: 0.4` + `pointer-events: none`

### CSS 文件
`src/styles/shop.css`（4.7KB）

---

## 2. 活动面板

### 布局
```
┌─────────────────────────────┐
│ 🎉 活动                     │
├─────────────────────────────┤
│ ┌─ Banner ─────────────────┐│
│ │  🔥 火焰山试炼            ││ ← 渐变背景(fire/ice/gold/spring)
│ │  限时双倍掉落              ││
│ │  ⏱ 剩余 01:23:45          ││ ← pill倒计时(<1h红色脉冲)
│ └──────────────────────────┘│
│                              │
│ ┌─ 奖励阶梯 ───────────────┐│
│ │ ✅ 100分  灵石×1000       ││ ← reached 绿色左边框
│ │ 🔶 300分  蟠桃×5         ││ ← current 金色左边框
│ │ ○  500分  随机极品装备    ││ ← 灰色
│ │ ○  1000分 天命符×3       ││
│ │ [████████░░░░░] 280/300  ││
│ └──────────────────────────┘│
│                              │
│ ── 历史活动 ──               │
│  春节庆典  01/28  ✅ 已完成  │
│  元宵挑战  02/15  ❌ 已过期  │
└─────────────────────────────┘
```

### 核心组件
- **Banner**：4种渐变主题(fire红/ice蓝/gold金/spring绿) + 装饰圆形光效
- **倒计时**：pill胶囊，`<1h` 时红色脉冲
- **奖励阶梯**：左边框三态（reached绿/current金/未达灰），claimable态按钮脉冲
- **进度条**：金色渐变，10px数字标注
- **历史列表**：名称+日期+状态(completed绿/missed灰)

### CSS 文件
`src/styles/event.css`（5.4KB）

---

## 3. 导航分组方案

现有面板已超 15+，建议重构为分组导航：

### 推荐方案：4组 + 二级抽屉

```
底部固定4Tab：
  🧘 修行    ⚔️ 冒险    🎒 养成    📋 更多
```

| 一级 Tab | 二级面板 |
|----------|----------|
| 🧘 修行 | 修炼(默认) · 突破 · 天赋树 |
| ⚔️ 冒险 | 战斗(默认) · 秘境 · 取经地图 · 轮回 |
| 🎒 养成 | 背包(默认) · 锻造 · 伙伴 · 采集 |
| 📋 更多 | 商店 · 活动 · 成就 · 每日任务 · 里程碑 · 排行榜 · 角色 · 设置 |

### 二级导航 CSS
```css
.sub-nav {
  display: flex;
  gap: var(--sp-xs);
  padding: var(--sp-xs) var(--sp-md);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0;
  z-index: 10;
}
.sub-nav::-webkit-scrollbar { display: none; }
.sub-nav-item {
  flex-shrink: 0;
  padding: var(--sp-xs) var(--sp-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--color-text-dim);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.sub-nav-item.active {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}
.sub-nav-item .nav-badge {
  display: inline-block;
  min-width: 14px; height: 14px;
  line-height: 14px; text-align: center;
  background: var(--color-primary);
  color: #fff; font-size: 9px;
  border-radius: var(--radius-pill);
  margin-left: 4px;
  vertical-align: middle;
}
```

---

## 汇总

| 交付 | 文件 | 大小 |
|------|------|------|
| 商店样式 | `src/styles/shop.css` | 4.7KB |
| 活动样式 | `src/styles/event.css` | 5.4KB |
| 设计规格 | `shared/context-bus/cdo/DESIGN-SPEC-V7.0.md` | 本文件 |
| 导航分组CSS | 内含于设计规格（二级导航 `.sub-nav`） |
