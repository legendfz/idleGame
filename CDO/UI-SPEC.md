# UI-SPEC.md — 西游记 Idle Game 界面原型规范

**版本**：v1.0
**日期**：2026-03-01
**作者**：CDO
**基于**：UI-DESIGN.md v1.0

---

## 1. UI 资产清单

本项目零图片，所有视觉元素由以下资产类型构成。

### 1.1 符号资产表

| 资产ID | 符号 | 用途 | 分类 |
|--------|------|------|------|
| `ico-wukong` | 🐒 | 悟空/主角 | 角色 |
| `ico-tangseng` | 🧘 | 唐僧 | 角色 |
| `ico-bajie` | 🐷 | 八戒 | 角色 |
| `ico-shaseng` | 🏔️ | 沙僧 | 角色 |
| `ico-bailongma` | 🐴 | 白龙马 | 角色 |
| `ico-mob` | 👹 | 普通妖怪 | 敌人 |
| `ico-elite` | 👺 | 精英妖怪 | 敌人 |
| `ico-boss` | 🐉 | Boss | 敌人 |
| `ico-npc` | ☁️ | 神仙/NPC | NPC |
| `ico-weapon` | ⚔️ | 武器 | 装备 |
| `ico-armor` | 🛡️ | 防具 | 装备 |
| `ico-treasure` | 💎 | 法宝 | 装备 |
| `ico-pill` | 💊 | 丹药 | 消耗品 |
| `ico-scroll` | 📜 | 经书 | 材料 |
| `ico-mount` | 🐴 | 坐骑 | 装备 |
| `ico-hp` | ❤️ | 生命值 | 属性 |
| `ico-atk` | ⚡ | 攻击力 | 属性 |
| `ico-def` | 🛡️ | 防御力 | 属性 |
| `ico-spd` | 💨 | 速度 | 属性 |
| `ico-exp` | ✨ | 修为/经验 | 属性 |
| `ico-gold` | 🪙 | 金币 | 货币 |
| `ico-jade` | 💠 | 仙玉 | 货币 |
| `ico-crit` | 💥 | 暴击 | 战斗 |
| `ico-kill` | 💀 | 击杀 | 战斗 |
| `ico-loot` | 🎁 | 掉落 | 战斗 |
| `ico-trophy` | 🏆 | 成就/通关 | 系统 |
| `ico-fire` | 🔥 | 进行中/AOE | 状态 |
| `ico-lock` | 🔒 | 未解锁 | 状态 |
| `ico-check` | ✅ | 已完成 | 状态 |
| `ico-moon` | 🌙 | 离线 | 系统 |

### 1.2 品质前缀资产

| 资产ID | 符号 | CSS class | 色值 |
|--------|------|-----------|------|
| `q-common` | ○ | `.q-common` | `#9e9e9e` |
| `q-good` | ● | `.q-good` | `#4caf50` |
| `q-rare` | ◆ | `.q-rare` | `#2196f3` |
| `q-epic` | ★ | `.q-epic` | `#9c27b0` |
| `q-legend` | ✦ | `.q-legend` | `#ff9800` |
| `q-mythic` | ✧ | `.q-mythic` | `#f44336` |

### 1.3 进度条字符资产

| 资产ID | 字符 | 用途 |
|--------|------|------|
| `bar-full` | `█` | 已填充格 |
| `bar-empty` | `░` | 未填充格 |

标准进度条 = 10 格，渲染公式：`Math.round(percent / 10)` 个 `█` + 剩余 `░`

### 1.4 框线字符资产

| 资产ID | 字符 | 用途 |
|--------|------|------|
| `box-tl` | `┌` | 普通框左上 |
| `box-tr` | `┐` | 普通框右上 |
| `box-bl` | `└` | 普通框左下 |
| `box-br` | `┘` | 普通框右下 |
| `box-h` | `─` | 普通框水平线 |
| `box-v` | `│` | 普通框垂直线 |
| `box-dtl` | `╔` | 双线框左上（重要弹窗） |
| `box-dtr` | `╗` | 双线框右上 |
| `box-dbl` | `╚` | 双线框左下 |
| `box-dbr` | `╝` | 双线框右下 |
| `box-dh` | `═` | 双线框水平线 |
| `box-dv` | `║` | 双线框垂直线 |
| `sep-solid` | `─` | 实线分隔 |
| `sep-dash` | `─ ─` | 虚线分隔 |
| `tree-branch` | `├` | 树形分支 |
| `tree-end` | `└` | 树形末尾 |

### 1.5 CSS Token 资产

```css
:root {
  /* 色彩 — 暗色主题 */
  --c-bg:        #1a1a2e;
  --c-card:      #16213e;
  --c-text:      #e8e8e8;
  --c-text-sub:  #8b8b9e;
  --c-accent:    #f0c040;
  --c-success:   #4caf50;
  --c-danger:    #f44336;
  --c-link:      #64b5f6;
  --c-border:    #2a2a4a;

  /* 色彩 — 亮色主题 */
  --c-bg-light:        #f5f0e8;
  --c-card-light:      #ffffff;
  --c-text-light:      #2c2c2c;
  --c-text-sub-light:  #7a7a7a;
  --c-accent-light:    #c49000;
  --c-success-light:   #388e3c;
  --c-danger-light:    #d32f2f;
  --c-link-light:      #1976d2;
  --c-border-light:    #d4cfc4;

  /* 间距 */
  --sp-xs: 4px;
  --sp-sm: 8px;
  --sp-md: 16px;
  --sp-lg: 24px;

  /* 圆角 */
  --r-sm: 4px;
  --r-md: 8px;

  /* 动画 */
  --t-fast:   150ms ease;
  --t-normal: 300ms ease-out;

  /* 字体 */
  --font-body: system-ui, -apple-system, sans-serif;
  --font-mono: 'SF Mono', 'Menlo', 'Consolas', monospace;

  /* 字号 */
  --fs-sm:   12px;
  --fs-body: 14px;
  --fs-num:  15px;
  --fs-h:    16px;
  --fs-xl:   20px;

  /* 层级 */
  --z-content: 1;
  --z-nav:     100;
  --z-modal:   200;
  --z-toast:   300;
}
```

---

## 2. 核心界面布局规范

### 2.1 全局 Shell

```
┌─────────────────────────────┐ ← 屏幕顶部
│         TopBar (56px)       │ ← position: fixed; top: 0
│  左：📍 场景名 + 章节       │
│  右：（留空，未来放通知图标） │
├─────────────────────────────┤
│     ResourceBar (32px)      │ ← position: fixed; top: 56px
│  🪙 xxx  💠 xxx  ✨ Lv.xx  │
├─────────────────────────────┤
│                             │
│                             │
│      ContentArea            │ ← flex: 1; overflow-y: auto
│      padding-top: 88px     │    padding-bottom: 60px
│      (scroll region)        │
│                             │
│                             │
├─────────────────────────────┤
│      BottomNav (56px)       │ ← position: fixed; bottom: 0
│  🗡️   🐒   🗺️   📦   ⚙️   │
│  战斗  队伍  旅途 背包  更多 │
└─────────────────────────────┘
  safe-area-inset-bottom 额外
```

**尺寸约束**：
- 设计基准宽度：375px
- 最大内容宽度：480px（居中，`margin: 0 auto`）
- TopBar 高度：56px
- ResourceBar 高度：32px
- BottomNav 高度：56px + safe-area
- 内容区内边距：左右 `--sp-md`(16px)

### 2.2 Screen-A: 战斗界面

```
┌─────────── ContentArea ───────────┐
│                                   │
│  ┌─ EnemyPanel ────────────────┐  │
│  │ ── 第 N 波 ──               │  │
│  │ {ico} {name} ❤️ {bar} {%}  │  │  × 1~3 行
│  │ ...                         │  │
│  └─────────────────────────────┘  │
│                                   │
│  ─ ─ ─ ─ sep-dash ─ ─ ─ ─ ─ ─   │
│                                   │
│  ┌─ BattleLog ─────────────────┐  │
│  │ {ico} {name} {skill}→{tgt}  │  │  max-height: 40vh
│  │    {desc} {dmg}             │  │  overflow: auto
│  │ ...                         │  │  最新在顶部
│  └─────────────────────────────┘  │
│                                   │
│  ─ ─ ─ ─ sep-dash ─ ─ ─ ─ ─ ─   │
│                                   │
│  ┌─ IdleStats ─────────────────┐  │
│  │ 💰 +{n}/秒  ✨ +{n}/秒     │  │
│  │ ⏱️ 挂机中… {hh:mm:ss}      │  │
│  └─────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
```

**EnemyPanel 规范**：
- 每行：`{敌人图标} {名称}    ❤️ {进度条10格} {百分比}`
- 名称左对齐，宽度 max 6 中文字符
- 血条颜色：>50% 绿，20-50% 黄 `#f0c040`，<20% 红

**BattleLog 规范**：
- 每条日志两行：
  - 行1：`{角色图标} {名称} → {目标图标} {目标名}  {伤害值}`
  - 行2（可选）：`   {技能描述}`
- 伤害值 = 红色，治疗值 = 绿色带 `+`
- 暴击行追加 `💥 暴击！`
- 最多显示 20 条，FIFO

**IdleStats 规范**：
- 收益数字每秒更新（countUp 动画）
- 计时器 `hh:mm:ss` 实时走动

### 2.3 Screen-B: 队伍界面

```
┌─────────── ContentArea ───────────┐
│                                   │
│  ┌─ CharHeader ────────────────┐  │
│  │ {ico} {称号}·{名}           │  │
│  │ ─────────────               │  │
│  │ Lv.{n}  ✨ {cur}/{max}     │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─ StatsGrid (2×2) ──────────┐  │
│  │ ❤️ {hp}    ⚡ {atk}        │  │
│  │ 🛡️ {def}   💨 {spd}       │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─ EquipSlots (单线框) ───────┐  │
│  │ ⚔️ {品质}{武器名}           │  │
│  │ 🛡️ {品质}{防具名}          │  │
│  │ 💎 {品质}{法宝名}           │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─ SkillList (单线框) ────────┐  │
│  │ 1. {技能名} Lv.{n}         │  │
│  │ 2. {技能名} Lv.{n}         │  │
│  │ 3. {技能名} Lv.{n}         │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─ PartySelector ─────────────┐  │
│  │ [ {当前} ]  {队友2}  {队友3}│  │
│  └─────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
```

**PartySelector 规范**：
- 水平排列，居中
- 当前选中：`[ 🐒悟空 ]` — 加方括号 + 文字高亮 `--c-accent`
- 未选中：`🧘唐僧` — 默认文字色
- 点击切换，内容区淡入过渡

### 2.4 Screen-C: 旅途界面

```
┌─────────── ContentArea ───────────┐
│                                   │
│  西游之路                         │
│  ════════                         │
│                                   │
│  {status} 第{n}章 {章节名}        │  × N 章
│     {副标题} · {状态文字}          │
│                                   │
│  ── 展开态（当前章节）──           │
│  ── 进度 {bar} {%}               │
│     ├ {status} {关卡名}           │
│     ├ {status} {关卡名}           │
│     ├ {status} {关卡名} ← 当前    │
│     └ {status} {关卡名}           │
│                                   │
└───────────────────────────────────┘
```

**章节状态图标**：
- `✅` 已通关 — 文字色 `--c-success`
- `🔥` 进行中 — 文字色 `--c-accent`
- `🔒` 未解锁 — 文字色 `--c-text-sub`

**交互**：
- 点击已通关/进行中章节 → 展开子关卡列表
- 点击未解锁章节 → 无响应（置灰）
- 进行中章节默认展开

### 2.5 Screen-D: 背包界面

```
┌─────────── ContentArea ───────────┐
│                                   │
│  📦 背包  {cur}/{max}            │
│                                   │
│  ┌─ SubTabBar ─────────────────┐  │
│  │ [ 全部 ] 装备  法宝  丹药  材料│ │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─ ItemList ──────────────────┐  │
│  │ {类型ico} {品质}{名称}      │  │  × N 行
│  │     {属性ico}+{值}  {标签}  │  │
│  │ ...                         │  │
│  └─────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
```

**ItemList 行规范**：
- 单行模式：`{类型emoji} {品质前缀}{物品名}    {主属性}  {标签}`
- 标签：`[装备中]` `×{数量}` `[材料]`
- 物品名宽度：max 6 中文字符，超出截断 `…`
- 排序：品质降序 → 类型 → 名称

**SubTabBar 规范**：
- 当前选中：`[ 全部 ]` — 方括号 + accent 色
- 未选中：纯文字 — `--c-text-sub`
- 切换时列表淡入过渡

### 2.6 Screen-E: 更多界面

```
┌─────────── ContentArea ───────────┐
│                                   │
│  ┌─ MenuList ──────────────────┐  │
│  │ 🏪 商店              →      │  │
│  │ 🏆 成就              →      │  │
│  │ 📊 统计              →      │  │
│  │ ─────────────────────       │  │
│  │ ⚙️ 设置              →     │  │
│  │ ❓ 关于              →      │  │
│  └─────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
```

- 标准列表菜单，右侧 `→` 箭头
- 点击进入子页面（push 动画，左侧出现返回按钮）

---

## 3. 组件规范

### 3.1 `<ProgressBar>` 进度条

**Props**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `value` | number | 当前值 |
| `max` | number | 最大值 |
| `icon` | string | 前缀图标（如 `❤️`） |
| `showPercent` | boolean | 是否显示百分比 |
| `color` | string | 条颜色（可选，默认根据百分比自动） |

**渲染**：
```
{icon} {'█'.repeat(filled)}{'░'.repeat(10-filled)} {percent}%
```
`filled = Math.round((value / max) * 10)`

**颜色规则**（血条场景）：
- `> 50%` → `--c-success`
- `20% ~ 50%` → `--c-accent`
- `< 20%` → `--c-danger`

**动画**：值变化时 300ms ease-out 过渡（逐格填充）

---

### 3.2 `<BattleLogEntry>` 战斗日志条目

**变体**：

| 变体 | 触发条件 | 模板 |
|------|----------|------|
| `normal` | 普通攻击 | `{atk_ico} {atk_name} → {def_ico} {def_name}  -{dmg}` |
| `crit` | 暴击 | `{atk_ico} {atk_name} →→ {def_ico} {def_name}  -{dmg} 💥 暴击！` |
| `skill` | 技能释放 | `{ico} ──── {skill_name} ────`<br>`   {desc} {dmg} 🔥` |
| `boss` | Boss 出场 | 双线框包裹（见 4.3） |
| `kill` | 击杀 | `{ico} {name} 💀 击败！`<br>`  → 🪙 +{gold}  ✨ +{exp}` |
| `heal` | 治疗 | `{ico} {name} → {tgt_ico} {tgt}  +{heal} ❤️` |

**样式**：
- 伤害数字：`--c-danger`
- 治疗数字：`--c-success`
- 暴击行：文字加粗
- 技能分隔线：`──── {name} ────` 居中

**动画**：新条目从底部 slide-up 进入，duration `--t-fast`

---

### 3.3 `<Toast>` 通知弹窗

**变体**：

| 变体 | 框线 | 用途 |
|------|------|------|
| `info` | 单线框 `┌┐└┘` | 物品获得 |
| `major` | 双线框 `╔╗╚╝` | 升级、离线收益、章节通关 |
| `boss` | 双等号框 `═══` | Boss 出场 |
| `chapter` | 星号行 `★ ★ ★` | 章节通关 |

**行为**：
- `info`：自动消失 3s，可点击关闭
- `major`：需要玩家点击 `[ 确认 ]` / `[ 领取 ]` 关闭
- 同时最多 1 个 Toast，排队显示
- z-index: `--z-toast`

**布局**：
- 水平居中，垂直居中偏上（top: 30%）
- 最大宽度：`min(90vw, 320px)`
- 背景：`--c-card` + 2px border `--c-border`

---

### 3.4 `<ItemRow>` 物品行

**结构**：
```
{type_ico} {quality_prefix}{item_name}    {stat_ico}+{value}  {tag}
```

**Props**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | enum | weapon/armor/treasure/pill/scroll/mount |
| `quality` | enum | common/good/rare/epic/legend/mythic |
| `name` | string | 物品名 |
| `mainStat` | {icon, value} | 主属性 |
| `tag` | string | `[装备中]` / `×{n}` / `[材料]` 等 |

**交互**：
- 点击 → 弹出详情半屏面板（见 3.6）
- 左滑 → 显示操作按钮：`[使用]` / `[装备]` / `[卖出]`
- 长按 → tooltip 显示完整属性

**品质颜色**：物品名文字色 = 品质对应色值

---

### 3.5 `<BottomNav>` 底部导航

**结构**：
```html
<nav class="bottom-nav">
  <div class="nav-item {active}">
    <span class="nav-icon">{emoji}</span>
    <span class="nav-label">{text}</span>
  </div>
  × 5
</nav>
```

**样式**：
- 高度：56px + safe-area-inset-bottom
- 背景：`--c-card`
- 上边框：1px solid `--c-border`
- 等宽 5 列，图标上 + 文字下
- 选中态：图标 + 文字 = `--c-accent`
- 未选中：`--c-text-sub`
- 选中图标下方 2px 圆点指示器（`--c-accent`）

**动画**：切换时选中态 `--t-fast` 过渡

---

### 3.6 `<DetailSheet>` 详情半屏面板

**触发**：点击物品/角色/关卡等列表项

**布局**：
```
┌─────────────────────────────┐
│ ░░░░ 拖拽手柄 ░░░░          │ 4px × 40px 圆角条，居中
├─────────────────────────────┤
│                             │
│  {详情标题}                  │
│  ─────────                  │
│  {详情内容，因上下文而异}     │
│                             │
│  [ 操作按钮1 ]  [ 按钮2 ]   │
│                             │
└─────────────────────────────┘
  ↕ 半屏高度（50vh），可拖拽展开至 80vh
```

**行为**：
- 从底部上滑出现，背景半透明遮罩 `rgba(0,0,0,0.5)`
- 点击遮罩或下滑关闭
- z-index: `--z-modal`

---

### 3.7 `<SubTabBar>` 二级选项卡

**结构**：
```
[ 选中项 ]  未选中A  未选中B  未选中C
```

**样式**：
- 水平排列，左对齐，间距 `--sp-md`
- 选中：`[ {text} ]` 方括号包裹，文字 `--c-accent`
- 未选中：纯文字，`--c-text-sub`
- 可横向滚动（超出时）

---

### 3.8 `<ResourceBar>` 资源栏

**结构**：
```
🪙 {gold}  💠 {jade}  ✨ Lv.{level}
```

**样式**：
- 高度 32px，背景 `--c-bg` 略透明
- 数字用 `--font-mono`，保证对齐
- 数字变化时 countUp 动画（500ms）

---

## 4. 导航流程

### 4.1 主导航流程图

```
                    App Launch
                        │
                        ▼
                ┌── 离线收益？──┐
                │ YES          │ NO
                ▼              │
          [OfflineToast]       │
          点击 [领取]          │
                │              │
                ▼◄─────────────┘
            Screen-A 战斗
           （默认首页）
                │
    ┌───┬───┼───┬───┐
    ▼   ▼   ▼   ▼   ▼
   🗡️  🐒  🗺️  📦  ⚙️
   A    B    C    D    E
  战斗 队伍 旅途 背包 更多
```

### 4.2 Screen 内导航

```
Screen-B 队伍
  │
  ├── 点击 PartySelector 队友 → 切换角色（原地刷新）
  ├── 点击 EquipSlot → DetailSheet（装备详情）
  │     └── [卸下] / [强化]
  └── 点击 SkillRow → DetailSheet（技能详情）
        └── [升级]

Screen-C 旅途
  │
  ├── 点击已通关章节 → 展开/收起子关卡
  ├── 点击进行中章节 → 默认展开
  ├── 点击子关卡 → DetailSheet（关卡详情）
  │     └── [扫荡] / [挑战]
  └── 点击未解锁 → 无操作

Screen-D 背包
  │
  ├── SubTabBar 切换分类 → 过滤列表
  ├── 点击 ItemRow → DetailSheet（物品详情）
  │     └── [装备] / [使用] / [卖出]
  └── 左滑 ItemRow → 快捷操作

Screen-E 更多
  │
  ├── 🏪 商店 → push 商店页
  ├── 🏆 成就 → push 成就页
  ├── 📊 统计 → push 统计页
  └── ⚙️ 设置 → push 设置页
        ├── 主题切换（暗/亮）
        ├── 音效开关
        └── 语言（预留）
```

### 4.3 弹窗层级与优先级

```
z-300  Toast（战斗反馈、升级、通关）
z-200  DetailSheet / Modal（物品详情、确认弹窗）
z-100  BottomNav（始终可见）
z-1    ContentArea（主内容）
```

**规则**：
- Toast 最高优先，覆盖一切
- DetailSheet 出现时，BottomNav 仍可见但不可交互（遮罩挡住）
- 同层级后出现的覆盖先出现的

---

## 5. 交互状态

### 5.1 按钮状态

| 状态 | 样式 |
|------|------|
| `default` | 背景 `--c-card`，文字 `--c-text`，border `--c-border` |
| `hover/active` | 背景 `--c-accent`，文字 `--c-bg`（反转） |
| `disabled` | 文字 `--c-text-sub`，border `--c-border`，无响应 |
| `loading` | 文字替换为 `…`，无响应 |

按钮文字格式：`[ {文字} ]`

### 5.2 列表项状态

| 状态 | 样式 |
|------|------|
| `default` | 正常渲染 |
| `active/pressed` | 背景 `--c-card` 变亮 10%，scale(0.98)，duration `--t-fast` |
| `equipped` | 追加 `[装备中]` 标签，accent 色 |
| `new` | 名称前追加 `🆕`，3 秒后消失 |
| `swipe-left` | 右侧露出操作区（红色 [卖出]，蓝色 [使用/装备]） |

### 5.3 Tab 状态

| 状态 | BottomNav | SubTabBar |
|------|-----------|-----------|
| `selected` | 图标+文字 `--c-accent`，下方圆点 | `[ {text} ]` accent 色 |
| `unselected` | `--c-text-sub` | 纯文字 sub 色 |
| `badge`（未来） | 右上角红点 `●` | 文字后 `●` |

### 5.4 进度条状态

| 状态 | 表现 |
|------|------|
| `normal` | 静态显示当前值 |
| `animating` | 从旧值滑动到新值，300ms ease-out |
| `critical` | `< 20%` 血条闪烁（opacity 0.5↔1，800ms loop） |
| `full` | 显示 `MAX` 替代百分比 |
| `empty` | 全 `░`，图标变灰 |

### 5.5 战斗界面状态

| 状态 | 表现 |
|------|------|
| `idle` | 挂机中，日志持续滚动，收益计时器走动 |
| `boss` | Boss 出场 Toast → 日志加速 → Boss 血条特殊显示（加粗） |
| `victory` | 击杀 Toast → 战利品 Toast → 下一波 |
| `chapter-clear` | 章节通关 Toast（星号框）→ 奖励 → 进入下一章 |
| `offline-return` | 离线收益 Toast（双线框）→ 点击领取 → 进入 idle |

### 5.6 页面过渡

| 过渡 | 动画 |
|------|------|
| Tab 切换 | 内容区 `opacity 0→1`，`--t-fast` |
| Push 子页面 | 新页面从右滑入，旧页面左移 30%，`--t-normal` |
| Pop 返回 | 反向动画 |
| DetailSheet 出现 | 从底部 `translateY(100%)→0`，遮罩 `opacity 0→0.5`，`--t-normal` |
| DetailSheet 关闭 | 反向 |
| Toast 出现 | `scale(0.9)→1` + `opacity 0→1`，`--t-fast` |
| Toast 消失 | `opacity 1→0`，`--t-fast` |

### 5.7 空状态

| 场景 | 显示 |
|------|------|
| 背包为空 | `📦 背包空空如也…` 居中灰字 |
| 无技能 | `尚未习得任何技能` |
| 章节全锁 | 不会出现（第1章默认解锁） |
| 网络错误 | `⚠️ 连接断开，正在重试…` + 自动重连 |

---

## 附录：Screen ID 对照表

| Screen ID | 名称 | 对应 Tab | 路由 |
|-----------|------|----------|------|
| A | 战斗 | 🗡️ | `/battle` |
| B | 队伍 | 🐒 | `/party` |
| C | 旅途 | 🗺️ | `/journey` |
| D | 背包 | 📦 | `/inventory` |
| E | 更多 | ⚙️ | `/more` |
| E1 | 商店 | — | `/more/shop` |
| E2 | 成就 | — | `/more/achievements` |
| E3 | 统计 | — | `/more/stats` |
| E4 | 设置 | — | `/more/settings` |
