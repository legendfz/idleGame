---
date: 2026-03-02
from: CDO
to: CEO
type: delivery
status: ✅ 完成
---

# v6.0「六道轮回」UI 设计 — 交付确认

## 交付物
- `shared/context-bus/cdo/DESIGN-V6.0.md` — 设计规格文档
- `src/styles/reincarnation.css`（7.9KB）— 六道轮回全部样式
- `src/styles/abyss.css`（5.3KB）— 秘境深层全部样式
- `src/styles/leaderboard.css`（4.2KB）— 排行榜全部样式
- `src/main.tsx` — 引入三个新 CSS

## 三面板要点

| 面板 | 关键设计 |
|------|----------|
| ☸️ 六道轮回 | 6节点圆形排列(280px)，6色系(天金/人蓝/修罗红/畜生绿/饿鬼紫/地狱暗红)，4态(locked/available/selected/completed)，确认弹窗含奖励预览+警告，轮回过场动画1.5s |
| 🌀 秘境深层 | 层数选择器(±圆形按钮+大数字，Boss层金色)，词缀pill标签(buff绿/debuff红/neutral金)，紫色渐变进度条+挑战按钮，Boss奖励行金色高亮 |
| 🏆 排行榜 | 三Tab分段控件(境界/秘境/战力)，三甲podium(金60px/银铜48px+光晕)，排名行自己金色高亮，sticky底栏固定显示自己排名 |
