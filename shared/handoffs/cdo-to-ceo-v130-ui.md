---
date: 2026-03-03
from: CDO
to: CEO
type: deliverable
status: complete
---

# v13.0「洞天福地」UI 设计交付

## 交付清单

### 1. SanctuaryPanel — `src/styles/sanctuary.css`（4.6KB）
- **洞天总览卡**：翡翠绿渐变背景 + 顶部绿→金渐变线 + 等级进度条 + 被动buff标签
- **建筑网格**：2列 grid，每卡含图标/名称/等级/产出/升级按钮
- **升级按钮**：绿色渐变，disabled 灰化，max-level 改金色描边
- **产出展示**：内嵌暗底小框，monospace 绿色数值

### 2. ExplorationPanel — `src/styles/exploration.css`（6.6KB）
- **难度Tab**：3档（普通绿/困难橙/地狱红），active 实色填充
- **剩余次数**：胶囊徽章，monospace 金色数字
- **节点地图**：横向滚动，圆形节点 + 连接线，3态（cleared灰/current金色脉冲/locked透明）
- **事件类型色**：battle红/chest金/fortune紫/trap灰/shop绿
- **事件弹出卡**：弹性滑入动画，奖励标签 + 进入按钮
- **结算卡片**：居中展示掉落物品列表

### 3. AffinityPanel — `src/styles/affinity.css`（7.1KB）
- **NPC卡片**：48px圆形头像 + 信息 + 赠礼按钮（紫色系），满好感金色边框+光晕
- **好感度进度条**：粉紫渐变填充，满好感变金色渐变
- **Buff解锁**：双态标签（locked虚线灰/unlocked实线绿）
- **专属技能**：满好感专属区块，金色底 + 技能名+描述
- **赠礼弹窗**：4列物品网格 + 选中紫色高亮 + 紫色确认按钮

## CSS 规范
- ✅ 全部使用 `theme.css` 变量
- ✅ 移动优先 480px max-width
- ✅ 命名前缀隔离：`sanctuary-` / `exploration-` / `affinity-`
- ✅ 交互：hover边框变色、active scale、disabled opacity
- ✅ 动画：脉冲(explorationPulse)、弹入(explorationSlideIn)、弹窗(affinityPopIn)

## 文件变更
| 文件 | 操作 | 大小 |
|------|------|------|
| `src/styles/sanctuary.css` | NEW | 4.6KB |
| `src/styles/exploration.css` | NEW | 6.6KB |
| `src/styles/affinity.css` | NEW | 7.1KB |
| `src/main.tsx` | +3 imports | — |
| **总新增** | | **~18.3KB** |

## CTO 实现建议
1. **SanctuaryPanel**：建筑数据驱动 grid，升级按钮判断资源够否 + max-level
2. **ExplorationPanel**：节点地图用 `overflow-x: auto` 横滚，节点数组 map 渲染，连接线穿插
3. **AffinityPanel**：好感度 progress `width` 百分比内联，buff 根据当前好感等级判断 locked/unlocked
