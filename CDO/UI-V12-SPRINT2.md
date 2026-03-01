# UI-V12-SPRINT2.md — v1.2 Sprint 2 UI 规范

**版本**：v1.2-sprint2
**日期**：2026-03-01
**作者**：CDO

---

## 一、离线保底提示 UI

### 1. 设计目标

离线期间如果累计通关达到保底阈值，给玩家明确的「保底奖励」仪式感，与普通离线收益弹窗整合为一屏。

### 2. 整合后的离线弹窗结构

在 UI-DESIGN-V1.1.md 的离线弹窗基础上，**在装备掉落区之前插入保底奖励区**：

```
╔══════════════════════════════════╗
║                                  ║
║  ╔══════════════════════════╗    ║
║  ║      🌙 离线收益         ║    ║
║  ║      ══════════════      ║    ║
║  ║  ⏱️ 离开了 6小时 12分    ║    ║
║  ║                          ║    ║
║  ║  ┌─ 基础收益 ─────────┐ ║    ║
║  ║  │ 🪙 灵石   +86,400  │ ║    ║
║  ║  │ ✨ 经验   +10,200  │ ║    ║
║  ║  │ 🍑 蟠桃   +1       │ ║    ║
║  ║  └────────────────────┘ ║    ║
║  ║                          ║    ║
║  ║  ┌─ 战斗成果 ─────────┐ ║    ║
║  ║  │ ⚔️ 击败怪物  ×580   │ ║    ║
║  ║  │ 🐉 击败Boss  ×8    │ ║    ║
║  ║  │ 📈 等级 22 → 28    │ ║    ║
║  ║  └────────────────────┘ ║    ║
║  ║                          ║    ║
║  ║  ══ 🎁 保底奖励 ══════  ║    ║ ← 新增区域
║  ║                          ║    ║
║  ║  ┌─ 100关保底 ─────────┐║    ║
║  ║  │ 🎰 累计100关达成！   │║    ║
║  ║  │ ● 精炼石 ×3         │║    ║
║  ║  │ ●灵品装备 ×1（随机） │║    ║
║  ║  └─────────────────────┘║    ║
║  ║                          ║    ║
║  ║  ┌─ 500关保底 ─────────┐║    ║ ← 仅达成时显示
║  ║  │ 🎰 累计500关达成！   │║    ║
║  ║  │ ✦仙品装备 ×1（随机） │║    ║
║  ║  │ 🔮 精炼石 ×10       │║    ║
║  ║  └─────────────────────┘║    ║
║  ║                          ║    ║
║  ║  ┌─ 装备掉落 ─────────┐ ║    ║
║  ║  │ ◆降妖杖      ⚡+95 │ ║    ║
║  ║  └────────────────────┘ ║    ║
║  ║                          ║    ║
║  ║      [ ✅ 全部领取 ]    ║    ║
║  ║                          ║    ║
║  ╚══════════════════════════╝    ║
║                                  ║
╚══════════════════════════════════╝
```

### 3. 保底区标题分隔

用双等号 + emoji 分隔，区别于普通区块：

```css
.pity-divider {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: var(--accent);
  padding: var(--space-sm) 0;
  letter-spacing: 2px;
}
```

渲染：`══ 🎁 保底奖励 ══════`

### 4. 100 关保底卡片（灵品级）

```
┌─ 100关保底 ─────────────────┐
│                              │
│  🎰 累计 100 关达成！        │ ← 金色标题
│                              │
│  ● 精炼石 ×3                │ ← 绿色（良品色）
│  ●灵品装备 ×1               │
│    → ●铁棒  ⚡+30           │ ← 具体掉落，绿色品质
│                              │
└──────────────────────────────┘
```

样式：
```css
.pity-card-100 {
  background: var(--bg);
  border: 1px solid var(--q-good);
  border-left: 3px solid var(--q-good);
  border-radius: 8px;
  padding: var(--space-sm) var(--space-md);
  margin: 0 var(--space-md) var(--space-sm);
}
.pity-card-100 .pity-title {
  color: var(--accent);
  font-size: 13px;
  font-weight: bold;
  margin-bottom: var(--space-xs);
}
```

动画：整个卡片从下方 slide-up + opacity 淡入，delay 比战斗成果区晚 400ms。

### 5. 500 关保底卡片（仙品级）

```
╔═ 500关保底 ═══════════════════╗
║                                ║
║  🎰 累计 500 关达成！          ║ ← 橙色标题
║                                ║
║  ✦仙品装备 ×1                 ║ ← 橙色（仙品色）
║    → ✦三叉戟  ⚡+100  💨+10% ║ ← 橙色 + text-shadow
║  🔮 精炼石 ×10                ║
║                                ║
╚════════════════════════════════╝
```

**差异化**：用双线框（非单线框）+ 仙品橙色边框 + 出场时全屏橙色闪屏。

```css
.pity-card-500 {
  background: var(--bg);
  border: 2px solid var(--q-legend);
  border-radius: 8px;
  padding: var(--space-md);
  margin: 0 var(--space-md) var(--space-sm);
  box-shadow: inset 0 0 12px rgba(239,108,0, 0.08);
}
.pity-card-500 .pity-title {
  color: var(--q-legend);
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 6px rgba(239,108,0, 0.4);
  margin-bottom: var(--space-sm);
}
```

### 6. 出场动画时序

在现有离线弹窗动画的基础上，保底区插入在战斗成果之后、装备掉落之前：

```
0ms       弹窗弹入
300ms     基础收益 countUp
1200ms    战斗成果 fade-slide-up
1800ms    ── 保底分隔线 fade-in ──
2000ms    100关卡片 slide-up（如达成）
2400ms    500关卡片 slide-up + 全屏橙闪（如达成）
2800ms    装备掉落逐行 slide-in
3200ms    领取按钮 fade-in
```

仅显示达成的保底，未达成的不渲染。如果两个都达成，500 关卡片延迟出现，有更强的仪式感。

### 7. 数据需求

离线计算需要额外输出：

```ts
interface OfflineReport {
  // 现有
  duration: number;
  lingshi: number;
  exp: number;
  pantao: number;
  // 新增
  stagesCleared: number;       // 离线通关总关数
  mobKills: number;
  bossKills: number;
  levelBefore: number;
  levelAfter: number;
  drops: EquipmentItem[];
  // 保底
  pity100: {
    triggered: boolean;
    count: number;             // 第几次触发（可能一次离线触发多次）
    rewards: PityReward[];
  };
  pity500: {
    triggered: boolean;
    count: number;
    rewards: PityReward[];
  };
}

interface PityReward {
  type: 'equipment' | 'material';
  item?: EquipmentItem;
  materialName?: string;
  materialIcon?: string;
  quantity: number;
}
```

### 8. 边界情况

| 场景 | 处理 |
|------|------|
| 一次离线触发多次 100 关保底 | 合并显示：`100关保底 ×3` + 汇总奖励 |
| 同时触发 100 和 500 | 两个卡片都显示，500 关更延迟更华丽 |
| 仅触发保底无其他掉落 | 装备掉落区隐藏，保底区正常显示 |
| 离线 < 100 关 | 保底区和分隔线都不渲染 |

---

## 二、背包分解确认 UI

### 1. 触发条件

背包满（50/50）且获得新装备时，弹出分解提示：

```
  ┌───────────────────────┐
  │ 📦 背包已满！          │
  │                        │
  │ 无法获得新装备          │
  │ 请分解不需要的装备      │
  │                        │
  │ [ 前往分解 ] [ 忽略 ]  │
  └───────────────────────┘
```

点击「前往分解」→ 进入分解界面。

### 2. 分解界面完整 Mockup

```
╔══════════════════════════════════╗
║ ← 返回         🔨 装备分解       ║
╠══════════════════════════════════╣
║                                  ║
║  📦 背包 50/50                   ║
║                                  ║
║  ┌─ 💡 智能推荐 ─────────────┐  ║
║  │ 以下装备低于已装备品质，    │  ║
║  │ 建议分解：                 │  ║
║  │                            │  ║
║  │ [✅] ○木棍        ⚡+8    │  ║ ← 预选中
║  │ [✅] ○粗布衣      🛡️+30  │  ║ ← 预选中
║  │ [✅] ○猴皮甲      🛡️+30  │  ║ ← 预选中
║  │ [ ] ●铁棒        ⚡+60   │  ║ ← 未选中
║  │                            │  ║
║  │ 推荐 3 件 · [ 全选推荐 ]  │  ║
║  └────────────────────────────┘  ║
║                                  ║
║  ┌─ 其他装备 ────────────────┐  ║
║  │                            │  ║
║  │ [ ] ●石锤        ⚡+30   │  ║
║  │ [ ] ●兽皮衣      🛡️+120 │  ║
║  │ [ ] ◆降妖杖      ⚡+190  │  ║
║  │ [ ] ◆锁子甲      🛡️+400 │  ║
║  │ ...                        │  ║
║  └────────────────────────────┘  ║
║                                  ║
║  ── 已选择 3 件 ──               ║
║                                  ║
║  ┌─ 分解预览 ────────────────┐  ║
║  │ 🪙 灵石       +1,240      │  ║
║  │ 🔮 精炼碎片   +6          │  ║
║  │ 📜 精铁       +2          │  ║
║  └────────────────────────────┘  ║
║                                  ║
║  [ 🔨 分解 3 件 ]   [ 取消 ]   ║
║                                  ║
╠══════════════════════════════════╣
║  🗡️     🐒     🗺️     📦    ⚙️  ║
╚══════════════════════════════════╝
```

### 3. 智能推荐逻辑

推荐分解的装备按以下规则自动选中：

```
优先推荐（自动 ✅）：
1. 品质 < 已装备同槽位品质 且 强化等级 = 0
2. 同品质但属性低于已装备 50% 以上
3. 重复装备（同 templateId 已有更高强化版本）

不推荐（不自动选中，但可手动选）：
4. 品质 ≥ 上品◆ 的装备
5. 套装件（即使品质低）
6. 已强化过的装备（level > 0）
```

推荐区标题：
```css
.recommend-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 12px;
  color: var(--text-dim);
  padding: var(--space-xs) 0 var(--space-sm);
}
.recommend-header .bulb { color: var(--accent); }
```

### 4. 列表行规范

```
[{checkbox}] {品质前缀}{装备名}    {主属性ico}+{值}
```

每行结构：
```css
.decompose-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
}
.decompose-row:active { background: rgba(240,192,64, 0.04); }
.decompose-row:last-child { border-bottom: none; }
.decompose-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  transition: all 0.15s;
}
.decompose-checkbox.checked {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--bg);
}
.decompose-item-name { flex: 1; font-size: 13px; }
.decompose-item-stat { font-size: 12px; color: var(--text-dim); flex-shrink: 0; }
```

点击整行 = 切换选中状态（不仅是 checkbox）。

### 5. 批量操作栏

```
── 已选择 {n} 件 ──

[ 全选推荐 ]  [ 全选 ]  [ 清除 ]
```

```css
.batch-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  padding: var(--space-sm) 0;
}
.batch-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}
.batch-btn:active { background: var(--border); }
.batch-btn.primary {
  border-color: var(--accent);
  color: var(--accent);
}
```

### 6. 分解预览区

实时计算选中装备的分解产出：

```
┌─ 分解预览 ────────────────┐
│ {ico} {名称}     +{数量}   │ × N 行
└────────────────────────────┘
```

分解公式（供 CTO 参考）：
```
灵石 = Σ(装备有效属性 × 2 + (强化等级+1) × 50)
精炼碎片 = Σ(品质等级)    // common=0, good=1, rare=2, epic=3, legend=4, hongmeng=5
精铁 = Σ(强化等级 ≥ 5 ? 1 : 0)
```

预览区随选择实时更新，数值用 countUp 短动画（200ms）。

### 7. 分解确认弹窗

点击「分解 N 件」后弹出二次确认：

```
  ╔═══════════════════════════╗
  ║  🔨 确认分解？             ║
  ║  ═══════════════════════  ║
  ║                            ║
  ║  将分解以下 3 件装备：     ║
  ║                            ║
  ║  ○木棍                    ║
  ║  ○粗布衣                  ║
  ║  ○猴皮甲                  ║
  ║                            ║
  ║  获得：                    ║
  ║  🪙 +1,240                ║
  ║  🔮 +6 碎片               ║
  ║  📜 +2 精铁               ║
  ║                            ║
  ║  ⚠️ 分解后无法恢复         ║
  ║                            ║
  ║  [ 🔨 确认 ]  [ 取消 ]   ║
  ╚═══════════════════════════╝
```

如果选中了上品◆及以上装备，增加额外警告：

```
  ║  ⚠️ 包含 1 件上品装备！    ║ ← 蓝色警告
  ║  ⚠️ 分解后无法恢复         ║ ← 红色
```

```css
.decompose-warning-rare {
  color: var(--q-rare);
  font-weight: bold;
  background: rgba(30,136,229,0.08);
  padding: 4px 8px;
  border-radius: 4px;
}
```

### 8. 分解成功反馈

```
  ┌───────────────────────┐
  │ ✅ 分解完成！          │
  │                        │
  │ 🪙 +1,240             │
  │ 🔮 +6 碎片            │
  │ 📜 +2 精铁            │
  │                        │
  │ 📦 背包 47/50         │
  └───────────────────────┘

  Toast 自动消失 2s
  获得材料数字 countUp
```

### 9. 边界情况

| 场景 | 处理 |
|------|------|
| 未选中任何装备 | 「分解」按钮禁用灰色 |
| 选中已强化装备 | 确认弹窗追加：`含 {n} 件已强化装备` 黄色提示 |
| 分解后仍满 | Toast 提示「背包仍满，继续分解？」 |
| 背包仅有已装备物品 | 推荐区显示「无可分解装备」 |

---

## 三、反馈模板选择 UI

### 1. 入口

更多 Tab → 💬 意见反馈（沿用 UI-DESIGN-V1.1.md 入口位置）。

### 2. 模板选择页

```
╔══════════════════════════════════╗
║ ← 返回         💬 意见反馈       ║
╠══════════════════════════════════╣
║                                  ║
║  请选择反馈类型：                 ║
║                                  ║
║  ┌──────────────────────────┐   ║
║  │                          │   ║
║  │  🐛  Bug 报告            │   ║
║  │  游戏崩溃、显示异常、     │   ║
║  │  数据丢失等问题          │   ║
║  │                    →     │   ║
║  │                          │   ║
║  ├──────────────────────────┤   ║
║  │                          │   ║
║  │  💡  功能建议             │   ║
║  │  新功能、改进想法、       │   ║
║  │  希望添加的内容          │   ║
║  │                    →     │   ║
║  │                          │   ║
║  ├──────────────────────────┤   ║
║  │                          │   ║
║  │  💬  体验反馈             │   ║
║  │  数值平衡、难度感受、     │   ║
║  │  操作手感等体验问题       │   ║
║  │                    →     │   ║
║  │                          │   ║
║  └──────────────────────────┘   ║
║                                  ║
╠══════════════════════════════════╣
║  🗡️     🐒     🗺️     📦    ⚙️  ║
╚══════════════════════════════════╝
```

```css
.feedback-template-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: 16px var(--space-md);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
}
.feedback-template-card:active { background: rgba(240,192,64,0.04); }
.feedback-template-card:last-child { border-bottom: none; }
.feedback-template-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
.feedback-template-body { flex: 1; }
.feedback-template-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.feedback-template-desc { font-size: 12px; color: var(--text-dim); line-height: 1.4; }
.feedback-template-arrow { color: var(--text-dim); font-size: 14px; align-self: center; }
```

### 3. Bug 报告表单

点击「🐛 Bug 报告」进入：

```
╔══════════════════════════════════╗
║ ← 返回        🐛 Bug 报告       ║
╠══════════════════════════════════╣
║                                  ║
║  问题发生在哪里？                ║
║  ┌──────────────────────────┐   ║
║  │ [  ] 🗡️ 战斗             │   ║
║  │ [  ] 📦 背包/装备         │   ║
║  │ [✅] 🔨 强化/精炼         │   ║
║  │ [  ] 🗺️ 旅途             │   ║
║  │ [  ] ⚙️ 其他              │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  问题描述 *                      ║
║  ┌──────────────────────────┐   ║
║  │ 强化 +5 时显示成功但属性  │   ║
║  │ 没有变化…                 │   ║
║  │                           │   ║
║  │                   42/500  │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  复现步骤（选填）                ║
║  ┌──────────────────────────┐   ║
║  │ 1. 打开装备详情          │   ║
║  │ 2. 点击强化              │   ║
║  │ 3.                       │   ║
║  │                   28/300  │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  📎 自动附加信息                 ║
║  · Lv.28 · 通灵 · 第3章        ║
║  · iPhone 14 · Safari 17       ║
║                                  ║
║       [ 📤 提交报告 ]           ║
║                                  ║
╠══════════════════════════════════╣
║  🗡️     🐒     🗺️     📦    ⚙️  ║
╚══════════════════════════════════╝
```

#### 字段规范

| 字段 | 类型 | 必填 | 限制 |
|------|------|------|------|
| 问题发生位置 | 单选 radio | 是 | 5 选项 |
| 问题描述 | 多行文本 | 是 | 10~500 字 |
| 复现步骤 | 多行文本 | 否 | 0~300 字 |
| 自动上下文 | 自动采集 | — | 只读展示 |

#### 位置选择器

```css
.location-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px var(--space-md);
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  border-bottom: 1px solid var(--border);
}
.location-option:last-child { border-bottom: none; }
.location-option:active { background: rgba(240,192,64,0.04); }
.location-radio {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.location-radio.selected {
  border-color: var(--accent);
}
.location-radio.selected::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
}
```

### 4. 功能建议表单

```
╔══════════════════════════════════╗
║ ← 返回        💡 功能建议        ║
╠══════════════════════════════════╣
║                                  ║
║  建议类型                        ║
║  ┌──────────────────────────┐   ║
║  │ [  ] 🆕 新功能           │   ║
║  │ [✅] 🔧 改进现有功能      │   ║
║  │ [  ] 🎨 界面/美观         │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  建议标题 *                      ║
║  ┌──────────────────────────┐   ║
║  │ 希望增加自动分解功能      │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  详细描述 *                      ║
║  ┌──────────────────────────┐   ║
║  │ 背包经常满，希望可以设置  │   ║
║  │ 自动分解凡品/良品装备…   │   ║
║  │                           │   ║
║  │                   56/500  │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  📎 自动附加 · Lv.28 · 通灵    ║
║                                  ║
║       [ 📤 提交建议 ]           ║
║                                  ║
╠══════════════════════════════════╣
```

#### 字段规范

| 字段 | 类型 | 必填 | 限制 |
|------|------|------|------|
| 建议类型 | 单选 | 是 | 3 选项 |
| 建议标题 | 单行文本 | 是 | 5~50 字 |
| 详细描述 | 多行文本 | 是 | 10~500 字 |

### 5. 体验反馈表单

```
╔══════════════════════════════════╗
║ ← 返回        💬 体验反馈        ║
╠══════════════════════════════════╣
║                                  ║
║  整体评分                        ║
║  ☆ ☆ ☆ ☆ ☆                    ║ ← 点击评星
║                                  ║
║  你觉得哪方面可以改进？          ║
║  ┌──────────────────────────┐   ║
║  │ [✅] ⚖️ 数值平衡         │   ║
║  │ [  ] 🎮 操作手感          │   ║
║  │ [✅] 📈 成长节奏          │   ║
║  │ [  ] 🎨 界面视觉          │   ║
║  │ [  ] 📖 剧情内容          │   ║
║  │ [  ] 💬 其他              │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  具体反馈（选填）                ║
║  ┌──────────────────────────┐   ║
║  │ 第3章难度突然上升很多，   │   ║
║  │ 需要刷很久才能过…        │   ║
║  │                   38/500  │   ║
║  └──────────────────────────┘   ║
║                                  ║
║  📎 自动附加 · Lv.28 · 通灵    ║
║                                  ║
║       [ 📤 提交反馈 ]           ║
║                                  ║
╠══════════════════════════════════╣
```

#### 字段规范

| 字段 | 类型 | 必填 | 限制 |
|------|------|------|------|
| 整体评分 | 星级 1~5 | 是 | 点击选择 |
| 改进方面 | 多选 checkbox | 是（至少 1 项） | 6 选项 |
| 具体反馈 | 多行文本 | 否 | 0~500 字 |

#### 星级选择器

```css
.star-rating {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: var(--space-md) 0;
}
.star-rating .star {
  font-size: 28px;
  cursor: pointer;
  transition: transform 0.1s;
  color: var(--border);
}
.star-rating .star.filled { color: var(--accent); }
.star-rating .star:active { transform: scale(1.2); }
```

交互：hover/点击第 N 颗星 → 1~N 全部填充，N+1~5 清空。

### 6. 通用表单样式

```css
/* ── 表单标签 ── */
.form-label {
  font-size: 13px;
  color: var(--text);
  font-weight: 600;
  margin-bottom: var(--space-xs);
  display: block;
}
.form-label .required { color: var(--red); }

/* ── 单行输入 ── */
.form-input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: 10px var(--space-md);
  font-size: 16px;
  -webkit-appearance: none;
}
.form-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 2px rgba(240,192,64,0.15);
}

/* ── 多行输入 ── */
.form-textarea {
  width: 100%;
  min-height: 100px;
  max-height: 180px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: var(--space-md);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  -webkit-appearance: none;
}
.form-textarea:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 2px rgba(240,192,64,0.15);
}
.form-textarea::placeholder { color: var(--text-dim); }

/* ── 字数计数 ── */
.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 2px;
}
.char-count.warning { color: var(--accent); }
.char-count.over { color: var(--red); }

/* ── 多选项 ── */
.checkbox-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px var(--space-md);
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  -webkit-user-select: none;
  user-select: none;
}
.checkbox-option:last-child { border-bottom: none; }
.checkbox-option:active { background: rgba(240,192,64,0.04); }

/* ── 提交按钮 ── */
.form-submit {
  width: 100%;
  background: var(--accent);
  color: var(--bg);
  border: none;
  padding: 14px 0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  margin-top: var(--space-lg);
  transition: all 0.15s;
}
.form-submit:active { transform: scale(0.97); }
.form-submit:disabled {
  background: var(--border);
  color: var(--text-dim);
  cursor: default;
  transform: none;
}

/* ── 表单分组间距 ── */
.form-group {
  margin-bottom: var(--space-lg);
}

/* ── 自动附加信息 ── */
.auto-context {
  background: var(--bg);
  border-radius: 8px;
  padding: var(--space-sm) var(--space-md);
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.6;
  margin-top: var(--space-md);
}
.auto-context .prefix { font-size: 11px; color: var(--text-dim); }
```

### 7. 提交状态与结果

所有三种模板共享相同的提交流程：

```
点击提交 → 按钮变 loading → 请求 → 成功/失败

成功 Toast（自动消失 2s，然后返回上一页）：
  ┌───────────────────────┐
  │ ✅ 感谢你的反馈！      │
  │ 我们会认真查看每一条   │
  └───────────────────────┘

失败 Toast：
  ┌───────────────────────┐
  │ ❌ 提交失败            │
  │ 请检查网络后重试       │
  │ [ 重试 ]              │
  └───────────────────────┘
```

### 8. 导航流程

```
⚙️ 更多
  └─ 💬 意见反馈（模板选择）
       ├─ 🐛 Bug 报告表单 → 提交 → Toast → 返回
       ├─ 💡 功能建议表单 → 提交 → Toast → 返回
       └─ 💬 体验反馈表单 → 提交 → Toast → 返回
```

所有子页面用 push 动画（从右滑入），返回用 pop（左滑出）。

---

## 四、新增符号资产

| 资产ID | 符号 | 用途 |
|--------|------|------|
| `ico-pity` | 🎰 | 保底触发 |
| `ico-decompose` | 🔨 | 分解 |
| `ico-recommend` | 💡 | 智能推荐 |
| `ico-star-rate` | ⭐ | 评分星 |
| `ico-balance` | ⚖️ | 数值平衡 |
| `ico-gamepad` | 🎮 | 操作手感 |
| `ico-growth` | 📈 | 成长/升级 |
| `ico-palette` | 🎨 | 界面视觉 |
| `ico-book` | 📖 | 剧情内容 |
