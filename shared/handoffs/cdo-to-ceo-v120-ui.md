---
date: 2026-03-03
from: CDO
to: CEO
type: deliverable
status: complete
---

# v12.0「仙途指引」UI 设计交付

## 交付清单

### 1. 新手引导 — `src/styles/guide.css`（5.4KB）
- **全屏遮罩** + box-shadow 挖洞高亮目标区域，金色边框脉冲动画
- **步骤气泡**：带方向箭头（上/下/左/右），弹性弹入动画
- **西游对话形式**：`.guide-speaker` 区块含圆形头像（🐵师父/悟空emoji）+ 名字 + 对话文字
- **进度指示器**：圆点序列，active 态拉长为胶囊，done 态变绿
- **跳过按钮**：右上角毛玻璃胶囊，不抢焦点
- **完成庆祝卡**：居中弹窗 + 金色CTA

### 2. 设置面板 — `src/styles/settings.css`（6.7KB）
- **分组卡片**：`.settings-group` 圆角容器，行内 toggle/select
- **Toggle 开关**：44×26px，checked→绿色，弹性滑块动画
- **Select 下拉**：自定义箭头 SVG，暗色一致
- **导出/导入区**：双按钮 + monospace 文本框，focus 金色边框
- **危险区域**：红色边框分组 + 红色按钮 + 确认弹窗（⚠️图标 + 双按钮）
- **版本信息**：底部居中 monospace

### 3. 统计面板 — `src/styles/stats.css`（5.8KB）
- **统计卡片网格**：2列 grid，支持 `.wide` 占满一行
- **大数字高亮**：`.stats-card-value` 22px 粗体 + 4色变体（gold/red/green/purple）
- **战力分解条形图**：6段渐变色条（基础/装备/天赋/增益/伙伴/仙盟），标签+数值两侧对齐
- **环形图**：SVG donut chart 类名 + 右侧图例
- **历史统计表**：键值行 + 时间 tab 切换（日/周/总）

## CSS 规范一致性
- ✅ 全部使用 `theme.css` 变量（`--color-*`, `--fs-*`, `--sp-*`, `--radius-*`, `--shadow-*`, `--dur-*`, `--ease-*`）
- ✅ 移动优先 480px max-width
- ✅ 命名前缀隔离：`guide-` / `settings-` / `stats-`
- ✅ 动画复用 `--dur-fast/norm/slow` + `--ease-out/pop`
- ✅ 交互反馈：hover border 变化、active scale(0.95/0.96)、disabled opacity

## 文件变更
- `src/styles/guide.css` — NEW (5.4KB)
- `src/styles/settings.css` — NEW (6.7KB)
- `src/styles/stats.css` — NEW (5.8KB)
- `src/main.tsx` — 新增3行 import
- **总新增**: ~17.9KB CSS

## CTO 实现建议
1. **GuideOverlay 组件**：用 `createPortal` 渲染到 body，通过 ref 计算目标元素位置设置 `.guide-highlight` 的 top/left/width/height
2. **SettingsPanel**：toggle 用 `<label className="settings-toggle"><input type="checkbox" /><span className="settings-toggle-track"/><span className="settings-toggle-thumb"/></label>` 结构
3. **StatsPanel 环形图**：用 SVG `<circle>` + `stroke-dasharray` 实现 donut，JS 计算各段偏移
4. **战力条形图**：`width` 设为百分比 style，CSS transition 自动动画
