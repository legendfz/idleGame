# v10.0「归元」UI 设计规格

> 作者：CDO | 日期：2026-03-02
> CSS：tutorial.css / synergy.css / scroll-nav.css

---

## 1. 新手引导覆层

### 布局
```
┌─────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← 遮罩 rgba(0,0,0,0.78)
│ ░░░░┌────────────┐░░░░░░░░ │
│ ░░░░│  高亮目标   │░░░░░░░░ │ ← box-shadow镂空+金色脉冲边框
│ ░░░░└────────────┘░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│         ▼ 箭头               │
│  ┌─ 气泡 ──────────────┐    │
│  │ ① 1/5               │    │ ← 步骤编号
│  │ 👆 点击修炼           │    │
│  │ 点击积累修为...       │    │
│  │ ● ●━━ ○ ○ ○          │    │ ← 进度点（胶囊active）
│  │ [下一步]    跳过 →   │    │
│  └──────────────────────┘    │
└─────────────────────────────┘
```

### 核心组件
- **镂空**：`.tutorial-spotlight` box-shadow 9999px 方案，position跟随目标 `getBoundingClientRect()`
- **脉冲边框**：`::after` 金色2px + `tutorialPulse` 1.5s infinite
- **气泡**：4方向箭头（CSS旋转45°伪元素），金色边框，max-width 280px
- **底部sheet**：备选方案（竖屏空间不足时），复用 slideUp 动画
- **进度点**：active=16px胶囊金色，done=绿色圆点

### CSS: `src/styles/tutorial.css`（4.5KB）

---

## 2. 系统联动提示

### Buff 来源标签
10 个系统各自品牌色 pill 标签：

| 来源 | 类名 | 颜色 |
|------|------|------|
| 境界 | `.synergy-tag.realm` | 金色 |
| 装备 | `.synergy-tag.equip` | 蓝色 |
| 天赋 | `.synergy-tag.talent` | 红色 |
| 伙伴 | `.synergy-tag.companion` | 绿色 |
| 灵兽 | `.synergy-tag.pet` | 青色 |
| 里程碑 | `.synergy-tag.milestone` | 金色 |
| 神通 | `.synergy-tag.skill` | 紫色 |
| 策略 | `.synergy-tag.strategy` | 靛蓝 |
| 活动 | `.synergy-tag.event` | 橙色 |
| 轮回 | `.synergy-tag.reincarn` | 金色 |

### Buff 汇总面板
```
┌─ 属性加成来源 ──────────────┐
│ 攻击  +45%  [境界][装备][天赋] │ ← 总值金色 + 来源标签
│ 防御  +28%  [装备][灵兽]      │
│ 暴击  +12%  [天赋][伙伴]      │
│          [展开更多 ▼]         │
└─────────────────────────────┘
```

### CSS: `src/styles/synergy.css`（3.4KB）

---

## 3. 导航栏优化

### 方案：横向滚动 pill + 更多抽屉

```
顶部二级导航（sticky）：
[🧘修炼] [⚔️战斗] [🏯通天塔] | [📜任务] [🎒背包] [···更多]
                              ↑ 分隔线         ↑ 展开抽屉

抽屉内（4列grid）：
── 养成 ──
[🔨锻造] [🐾伙伴] [🐉灵兽] [🌳天赋]
── 探索 ──
[🌀秘境] [⛏️采集] [☸️轮回] [🗺️取经]
── 系统 ──
[🏪商店] [🎉活动] [🏆成就] [📊排行]
[👤角色] [⚙️设置]
```

### 核心组件
- **滚动导航**：`overflow-x: auto` + `scrollbar-width: none`，pill 胶囊 `flex-shrink: 0`
- **分隔线**：1px 竖线 `.scroll-nav-divider`
- **徽标**：红色 pill 14px `.scroll-nav-badge`
- **抽屉**：底部 sheet，4列grid（≤374px降3列），分组标题+网格

### CSS: `src/styles/scroll-nav.css`（3.5KB）

---

## 汇总

| 模块 | CSS | 大小 | 核心设计 |
|------|-----|------|----------|
| 新手引导 | tutorial.css | 4.5KB | box-shadow镂空+金色脉冲边框+4方向箭头气泡+进度胶囊点 |
| 联动提示 | synergy.css | 3.4KB | 10系统品牌色pill标签+buff来源汇总面板+联动Toast |
| 导航优化 | scroll-nav.css | 3.5KB | 横滚pill导航+分隔线+徽标+底部4列grid抽屉 |
