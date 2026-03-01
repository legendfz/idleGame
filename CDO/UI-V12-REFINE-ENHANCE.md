# UI-V12-REFINE-ENHANCE.md — 精炼系统 & 高阶强化 UI 设计

**版本**：v1.2-sprint1
**日期**：2026-03-01
**作者**：CDO
**基于**：UI-DESIGN.md, EQUIPMENT-UI.md, UI-DESIGN-V1.1.md

---

## 一、精炼系统 UI

### 1. 入口与导航

精炼入口位于 **装备详情弹窗** 底部按钮组：

```
已装备且 +10 满级：
  [ 🔥 精炼 ]  [ ❌ 卸下 ]

已装备未满级：
  [ 🔨 强化 ]  [ ❌ 卸下 ]

背包中 +10 满级：
  [ ✅ 装备 ]  [ 🔥 精炼 ]  [ 🪙 卖出 ]
```

规则：**仅 +10 满级装备可精炼**。未满级时精炼按钮不显示。

---

### 2. 精炼界面布局

点击 `[ 🔥 精炼 ]` 后弹出精炼专属面板（替换 DetailSheet 内容）：

```
╔══════════════════════════════════╗
║          ── ●●● ──               ║
║                                  ║
║  🔥 装备精炼                     ║
║  ═══════════════════════════     ║
║                                  ║
║  ┌─ 精炼对象 ────────────────┐  ║
║  │                            │  ║
║  │   ⚔️ ✦如意金箍棒 +10      │  ║ ← 品质色文字
║  │   ⚡+3,200  💥暴伤+50%    │  ║
║  │                            │  ║
║  │   精炼等级 ☆☆☆☆☆          │  ║ ← 空星=未精炼
║  │   0/5 阶                   │  ║
║  │                            │  ║
║  └────────────────────────────┘  ║
║                                  ║
║  ┌─ 所需材料 ────────────────┐  ║
║  │                            │  ║
║  │  🔮 精炼石 ×5   (持有: 8) │  ║ ← 绿色=够
║  │  📜 仙铁   ×2   (持有: 1) │  ║ ← 红色=不够
║  │  🪙 50,000               │  ║
║  │                            │  ║
║  └────────────────────────────┘  ║
║                                  ║
║  ┌─ 精炼效果预览 ────────────┐  ║
║  │ 精炼 0阶 → 1阶            │  ║
║  │ ⚡ 攻击  3,200 → 3,520    │  ║ ← +10% 绿色
║  │ 🆕 精炼特效：攻击穿透 5%   │  ║ ← 金色高亮
║  └────────────────────────────┘  ║
║                                  ║
║  成功率 ██████████ 100%          ║ ← 1阶100%
║                                  ║
║  [ 🔥 确认精炼 ]    [ ← 返回 ] ║
║                                  ║
╚══════════════════════════════════╝
```

### 3. 精炼等级显示

用 **实星/空星** 表示精炼进度：

| 精炼阶 | 显示 | 星色 |
|--------|------|------|
| 0阶（未精炼） | `☆☆☆☆☆` | 灰色 |
| 1阶 | `★☆☆☆☆` | 金色 |
| 2阶 | `★★☆☆☆` | 金色 |
| 3阶 | `★★★☆☆` | 橙色 |
| 4阶 | `★★★★☆` | 橙色 |
| 5阶（满精炼） | `★★★★★` | 红色脉动 |

```css
.refine-stars { letter-spacing: 4px; font-size: 16px; }
.refine-star-filled { color: var(--accent); }
.refine-star-empty  { color: var(--border); }
.refine-star-3plus  { color: #ef6c00; }
.refine-star-max    { color: #c62828; animation: star-pulse 1.2s ease-in-out infinite; }
@keyframes star-pulse {
  0%, 100% { opacity: 1; text-shadow: 0 0 0 transparent; }
  50%      { opacity: 0.8; text-shadow: 0 0 8px rgba(198,40,40,0.6); }
}
```

### 4. 精炼成功率表

| 精炼阶 | 成功率 | 失败后果 |
|--------|--------|---------|
| 0→1 | 100% | — |
| 1→2 | 80% | 无损失 |
| 2→3 | 60% | 材料消耗 |
| 3→4 | 40% | 材料消耗 + 精炼阶降1级 |
| 4→5 | 20% | 材料消耗 + 精炼阶降1级 |

### 5. 精炼确认弹窗（含风险提示）

3 阶及以上精炼时，点击确认后弹出二次确认：

```
  ╔═══════════════════════════╗
  ║  ⚠️ 精炼风险提示           ║
  ║  ═══════════════════════  ║
  ║                            ║
  ║  ⚔️ ✦如意金箍棒 +10       ║
  ║  精炼 2阶 → 3阶           ║
  ║                            ║
  ║  成功率：██████░░░░ 60%    ║
  ║                            ║
  ║  ✅ 成功：获得 3阶精炼特效  ║
  ║  ❌ 失败：消耗材料          ║ ← 1~2阶
  ║  ❌ 失败：材料消耗+降1阶    ║ ← 3~4阶，红色加粗
  ║                            ║
  ║  消耗：                    ║
  ║  🔮 精炼石 ×15            ║
  ║  📜 仙铁 ×8               ║
  ║  🪙 200,000               ║
  ║                            ║
  ║  [ 🔥 确认 ]  [ 取消 ]    ║
  ╚═══════════════════════════╝
```

降级风险行样式：
```css
.risk-warning {
  color: var(--red);
  font-weight: bold;
  background: rgba(244,67,54,0.08);
  padding: 4px 8px;
  border-radius: 4px;
  border-left: 3px solid var(--red);
}
```

---

### 6. 精炼动画

#### 6.1 精炼成功动画

```
阶段1：聚能（800ms）
───────────────────

         🔥
    ⚔️ ✦如意金箍棒
      ·  ✨  ·

    火焰符号上下浮动（translateY -3px↔3px，400ms循环）
    物品名缓慢脉动（scale 1.0↔1.03）
    两侧出现聚能粒子 · 向中心移动


阶段2：聚爆（300ms）
───────────────────

       🔥💥🔥
    ⚔️ ✦如意金箍棒
     ✨ ✨ ✨ ✨ ✨

    三个火焰急速收缩为一点
    碰撞闪光 💥
    粒子 ✨ 从中心向四周爆散


阶段3：升星（600ms）
───────────────────

    ⚔️ ✦如意金箍棒 +10

    ☆ → ★  ← 空星逐个点亮为实星
           每颗星 scale(0→1.3→1)弹入
           点亮时释放小粒子

    ★★★☆☆
    精炼 3阶！


阶段4：结果面板（800ms）
───────────────────

  ╔═══════════════════════╗
  ║  🔥 精炼成功！         ║
  ║                        ║
  ║  ⚔️ ✦如意金箍棒 +10   ║
  ║  ★★★☆☆  3阶          ║
  ║                        ║
  ║  ⚡ 3,200 → 3,840 ▲640║
  ║  🆕 攻击穿透 10%      ║
  ║                        ║
  ╚═══════════════════════╝

  双线框 scale(0.8→1.05→1) 弹入
  属性数值 countUp 递增
  新获得特效行金色闪烁 2 次
```

CSS 动画：
```css
/* 聚能火焰浮动 */
@keyframes flame-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
.refine-flame { animation: flame-float 400ms ease-in-out infinite; }

/* 聚爆粒子扩散 */
@keyframes refine-burst {
  0%   { transform: scale(0); opacity: 1; }
  60%  { transform: scale(1.5); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}
.refine-burst { animation: refine-burst 500ms ease-out forwards; }

/* 星星弹入 */
@keyframes star-pop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.star-filling {
  display: inline-block;
  animation: star-pop 300ms cubic-bezier(0.34,1.56,0.64,1) forwards;
}

/* 结果面板弹入 */
@keyframes refine-result-pop {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
.refine-result { animation: refine-result-pop 500ms cubic-bezier(0.34,1.56,0.64,1); }

/* 新特效行闪烁 */
@keyframes new-effect-flash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75%      { opacity: 0.4; }
}
.new-effect { animation: new-effect-flash 800ms ease; color: var(--accent); }
```

#### 6.2 精炼失败动画（无降级）

```
阶段1：聚能（800ms）
───────────────────
    同上


阶段2：熄灭（400ms）
───────────────────

       🔥💫
    ⚔️ ✦如意金箍棒
       · · ·

    火焰闪烁 2 次后缩小消失
    出现 💫（不是 💥）
    物品左右震动 2 次


阶段3：结果（600ms）
───────────────────

  ┌───────────────────────┐
  │  ❌ 精炼失败            │
  │                        │
  │  ⚔️ ✦如意金箍棒 +10   │
  │  ★★☆☆☆  仍为 2阶     │
  │                        │
  │  材料已消耗             │
  │  装备未受损             │ ← 绿色，安慰
  └───────────────────────┘

  单线框淡入（无弹性），红色标题
```

#### 6.3 精炼失败动画（降级）

```
阶段1-2：同上


阶段3：降级警告（800ms）
───────────────────

  ╔═══════════════════════╗
  ║  ❌ 精炼失败！降级！    ║  ← 红色加粗，全屏微红闪
  ║                        ║
  ║  ⚔️ ✦如意金箍棒 +10   ║
  ║  ★★★☆☆ → ★★☆☆☆      ║  ← 第3颗星碎裂动画
  ║  3阶 → 2阶             ║
  ║                        ║
  ║  材料已消耗             ║
  ║  ⚠️ 精炼等级降低1阶    ║  ← 红色
  ╚═══════════════════════╝

  屏幕微红闪 100ms
  弹窗 shake 震动
  降级的星星：scale(1→1.3→0) 碎裂消失
```

```css
/* 星星碎裂 */
@keyframes star-shatter {
  0%   { transform: scale(1); opacity: 1; }
  40%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0) rotate(45deg); opacity: 0; }
}
.star-shattering { animation: star-shatter 400ms ease-in forwards; }

/* 降级弹窗震动 */
@keyframes refine-fail-shake {
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-4px); }
  30%, 60%, 90% { transform: translateX(4px); }
}
.refine-fail-shake { animation: refine-fail-shake 400ms ease; }
```

---

### 7. 碎片进度条

精炼材料「精炼石」可从怪物掉落碎片，收集满后合成。显示在背包/材料 Tab 中：

```
  📦 背包  材料

  ┌──────────────────────────┐
  │ 🔮 精炼石       持有: 8  │
  │   碎片 ██████░░░░ 12/20  │ ← 下次合成进度
  │                          │
  │ 📜 仙铁         持有: 3  │
  │   碎片 ████░░░░░░  8/20  │
  └──────────────────────────┘
```

进度条规范：
- 10 格 `█`/`░`，`filled = Math.round((fragments / required) * 10)`
- 颜色：进度 < 50% = `--c-text-dim`，≥ 50% = `--c-accent`，100% = `--c-success` + 自动合成提示

满碎片时：
```
  │ 🔮 精炼石       持有: 8  │
  │   碎片 ██████████ 20/20  │ ← 绿色
  │   ✅ 可合成！ [ 合成 ]   │ ← 金色按钮
```

---

## 二、鸿蒙高阶强化 UI（+11 ~ +15）

### 1. 高阶强化入口

+10 满级装备的详情弹窗中，强化按钮变化：

```
+10 装备（品质 ≥ 极品★）：
  [ 🔨 强化 ] 变为 → [ ⚡ 高阶强化 ]  金色按钮，脉动边框

+10 装备（品质 < 极品）：
  [ 🔨 已满级 ]  灰色禁用（低品质不可高阶强化）
```

高阶强化按钮样式：
```css
.btn-high-enhance {
  background: linear-gradient(135deg, #f0c040, #ef6c00);
  color: var(--bg);
  font-weight: bold;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}
.btn-high-enhance::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 7px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #f0c040, #ef6c00) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: border-glow 2s ease-in-out infinite;
}
@keyframes border-glow {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}
```

---

### 2. 高阶强化界面

```
╔══════════════════════════════════╗
║          ── ●●● ──               ║
║                                  ║
║  ⚡ 高阶强化                     ║
║  ═══════════════════════════     ║
║                                  ║
║  ⚔️ ✧如意金箍棒 +12             ║ ← 品质色+光晕
║                                  ║
║  ┌─ 强化详情 ────────────────┐  ║
║  │ 等级   +12 → +13          │  ║
║  │ ⚡攻击  4,800 → 5,280 ▲480│  ║ ← 绿色
║  │ 💥暴伤  50% → 55%   ▲5%  │  ║
║  └───────────────────────────┘  ║
║                                  ║
║  ┌─ 消耗 ────────────────────┐  ║
║  │ 🪙 500,000                │  ║
║  │ 🔮 精炼石 ×10             │  ║
║  │ 💎 鸿蒙碎片 ×1            │  ║ ← 稀有材料
║  └───────────────────────────┘  ║
║                                  ║
║  成功率 ████░░░░░░ 40%          ║ ← 黄色
║                                  ║
║  ┌─ ⚠️ 风险 ─────────────────┐  ║
║  │ ❌ 失败：+12 降为 +11      │  ║ ← 红色
║  │ 🛡️ 保护道具可防止降级      │  ║ ← 蓝色链接
║  └───────────────────────────┘  ║
║                                  ║
║  ┌─ 🛡️ 保护道具 ─────────────┐  ║ ← 可折叠
║  │ [ ] 防降符   持有: 2       │  ║ ← 复选框
║  │     失败时不降级            │  ║
║  │ [ ] 幸运符   持有: 0       │  ║ ← 灰色=无
║  │     成功率 +10%            │  ║
║  └───────────────────────────┘  ║
║                                  ║
║  [ ⚡ 确认强化 ]   [ ← 返回 ]  ║
║                                  ║
╚══════════════════════════════════╝
```

### 3. 高阶强化成功率

| 强化 | 成功率 | 失败后果 | 保护道具 |
|------|--------|---------|---------|
| +10→+11 | 60% | 降至 +10 | 防降符 |
| +11→+12 | 50% | 降至 +11 | 防降符 |
| +12→+13 | 40% | 降至 +12 | 防降符 |
| +13→+14 | 25% | 降至 +12（降2级） | 防降符（仅降1级） |
| +14→+15 | 10% | 降至 +12（降2级） | 防降符（仅降1级） |

### 4. 保护道具使用界面

保护道具区默认折叠，点击「🛡️ 保护道具可防止降级」展开：

```
  ┌─ 🛡️ 保护道具 ─────────────┐
  │                             │
  │  [✅] 防降符    持有: 2     │ ← 选中态=蓝色勾
  │       失败时不降级          │
  │       消耗 1 个             │
  │                             │
  │  [ ] 幸运符     持有: 0    │ ← 灰色=不可用
  │      成功率 +10%           │
  │      消耗 1 个             │
  │                             │
  └─────────────────────────────┘
```

选中态：
```css
.protect-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border);
}
.protect-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  font-size: 14px;
  margin-top: 2px;
}
.protect-checkbox.checked {
  border-color: var(--blue);
  color: var(--blue);
}
.protect-checkbox.disabled {
  opacity: 0.3;
  cursor: default;
}
.protect-name { font-size: 13px; color: var(--text); }
.protect-desc { font-size: 11px; color: var(--text-dim); }
.protect-count { font-size: 11px; color: var(--text-dim); }
```

选中保护道具后，风险区更新：

```
  ┌─ ⚠️ 风险 ─────────────────┐
  │ ❌ 失败：+12 不变（🛡️已保护）│ ← 蓝色，不再红色
  └───────────────────────────┘
```

选中幸运符后，成功率更新：

```
  成功率 ██████░░░░ 50%  (+10%🛡️)  ← 额外显示加成来源
```

---

### 5. 降级风险确认弹窗

无保护道具时点击「确认强化」弹出：

```
  ╔═══════════════════════════╗
  ║                            ║
  ║  ⚠️ 高阶强化风险确认       ║
  ║  ═══════════════════════  ║
  ║                            ║
  ║  ⚔️ ✧如意金箍棒            ║
  ║  +12 → +13                ║
  ║                            ║
  ║  成功率：40%               ║
  ║                            ║
  ║  ┌── 失败后果 ──────────┐ ║
  ║  │                       │ ║
  ║  │  ⚠️ 强化等级 +12→+11 │ ║ ← 红色
  ║  │  ⚠️ 材料全部消耗     │ ║ ← 红色
  ║  │  装备本身不会消失     │ ║ ← 灰色，安慰
  ║  │                       │ ║
  ║  └───────────────────────┘ ║
  ║                            ║
  ║  💡 使用防降符可避免降级   ║ ← 蓝色提示
  ║                            ║
  ║  [ ⚡ 我确定 ]  [ 取消 ]  ║
  ║                            ║
  ╚═══════════════════════════╝
```

「我确定」按钮用红色底表示危险操作：
```css
.btn-danger-confirm {
  background: var(--red);
  color: #fff;
  font-weight: bold;
}
```

---

### 6. 高阶强化动画

#### 6.1 成功动画

```
阶段1：蓄能（1000ms）—— 比普通强化更长
───────────────────

          ⚡
     ⚔️ ✧如意金箍棒
       ·  ⚡  ·
      ⚡       ⚡

    多道闪电符号从四周聚向中心
    物品名发光脉动（text-shadow 增强）
    整个面板微弱震动（translateY ±1px）


阶段2：雷击（300ms）
───────────────────

        ⚡💥⚡
     ⚔️ ✧如意金箍棒
      ✨✨✨✨✨✨

    闪电汇聚碰撞
    全屏白色闪光（比普通强化更亮，opacity 0.25）
    爆散粒子 ✨ 数量更多


阶段3：结果（800ms）
───────────────────

  ╔═══════════════════════╗
  ║  ⚡ 高阶强化成功！     ║  ← 金色标题
  ║                        ║
  ║  ⚔️ ✧如意金箍棒        ║
  ║  +12 → +13  ⚡         ║  ← 闪电装饰
  ║                        ║
  ║  ⚡攻击  4,800 → 5,280 ║
  ║  ▲480                  ║
  ║                        ║
  ╚═══════════════════════╝

  弹窗弹入 + 金色边框
  数值 countUp
```

```css
/* 闪电聚能 */
@keyframes lightning-gather {
  0%   { transform: translate(var(--start-x), var(--start-y)); opacity: 0; }
  40%  { opacity: 1; }
  100% { transform: translate(0, 0); opacity: 0; }
}
.lightning-particle {
  position: absolute;
  font-size: 14px;
  animation: lightning-gather 800ms ease-in forwards;
}

/* 高阶闪光（更亮） */
.screen-flash-enhance {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.25);
  pointer-events: none;
  z-index: 280;
  animation: flash-in 200ms ease-out forwards;
}

/* 蓄能面板微震 */
@keyframes micro-vibrate {
  0%, 100% { transform: translateY(0); }
  25%      { transform: translateY(-1px); }
  75%      { transform: translateY(1px); }
}
.enhance-charging { animation: micro-vibrate 100ms linear infinite; }
```

#### 6.2 失败动画（降级）

```
阶段1：蓄能（1000ms）
───────────────────
    同上


阶段2：短路（400ms）
───────────────────

        ⚡💫
     ⚔️ ✧如意金箍棒
         · ·

    闪电碰撞产生 💫 而非 💥
    火花乱飞（随机方向小粒子）
    面板剧烈震动（±6px，比精炼更强）


阶段3：降级（800ms）
───────────────────

  全屏红色闪光 150ms

  ╔═══════════════════════╗
  ║  ❌ 强化失败！等级降低  ║ ← 红色标题
  ║                        ║
  ║  ⚔️ ✧如意金箍棒        ║
  ║  +12 → +11  ⬇️        ║ ← 红色下降箭头
  ║                        ║
  ║  ⚡攻击 5,280 → 4,800  ║
  ║  ▼480                  ║ ← 红色
  ║                        ║
  ║  材料已消耗             ║
  ╚═══════════════════════╝

  弹窗 shake 动画（500ms）
  数字用 countDown（红色递减）
```

#### 6.3 失败动画（有保护道具）

```
阶段2后：

  闪光较弱（opacity 0.1）

  ┌───────────────────────┐
  │  ❌ 强化失败            │
  │                        │
  │  ⚔️ ✧如意金箍棒        │
  │  仍为 +12              │
  │                        │
  │  🛡️ 防降符已生效       │ ← 蓝色
  │  防降符 -1（剩余: 1）   │
  │  材料已消耗             │
  └───────────────────────┘

  单线框淡入，无震动
  保护道具行蓝色高亮，有盾牌闪烁效果
```

```css
@keyframes shield-flash {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
.shield-active { animation: shield-flash 600ms ease 2; color: var(--blue); }
```

---

### 7. +15 满级特殊展示

达到 +15 时的装备名渲染：

```
普通装备名：  ✧如意金箍棒 +10
高阶强化名：  ✧如意金箍棒 +15 ⚡

+15 等级数字用渐变金红色，追加 ⚡ 闪电符号
```

```css
.enhance-max-15 {
  background: linear-gradient(90deg, #f0c040, #c62828);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}
```

背包列表中 +15 装备行额外样式：
```css
.item-row-max-enhance {
  border-left: 3px solid;
  border-image: linear-gradient(to bottom, #f0c040, #c62828) 1;
  box-shadow: inset 0 0 8px rgba(240,192,64, 0.08);
}
```

---

## 三、新增符号资产

| 资产ID | 符号 | 用途 |
|--------|------|------|
| `ico-refine` | 🔥 | 精炼 |
| `ico-refine-stone` | 🔮 | 精炼石 |
| `ico-hongmeng-shard` | 💎 | 鸿蒙碎片 |
| `ico-protect` | 🛡️ | 保护道具 |
| `ico-lucky` | 🍀 | 幸运符 |
| `ico-lightning` | ⚡ | 高阶强化 |
| `ico-star-filled` | ★ | 精炼已点亮 |
| `ico-star-empty` | ☆ | 精炼未点亮 |
| `ico-downgrade` | ⬇️ | 降级 |
