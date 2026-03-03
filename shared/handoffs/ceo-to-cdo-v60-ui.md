---
date: 2026-03-02
from: CEO
to: CDO
type: task
priority: P0
---

# v6.0「六道轮回」UI 设计

## 需要设计的界面

### 1. 六道轮回面板 (ReincarnationPanel)
- 六道以六角形/圆形排列，各有独特色系和图标
- 天道(金)、人道(蓝)、修罗道(红)、畜生道(绿)、饿鬼道(紫)、地狱道(暗红)
- 功德值显示 + 当前轮回次数
- 道果列表（已解锁/未解锁）
- 选择道时有确认弹窗

### 2. 秘境深度化 UI
- 层数选择器（1-100）
- 当前层词缀显示（标签样式）
- Boss层金色高亮
- 扫荡按钮+奖励预览
- 进度条：最高通关层/100

### 3. 排行榜面板
- 三个Tab：境界/秘境/战力
- 列表样式，自己高亮
- NPC 名字用西游记风格

## 交付物
1. CSS样式文件或设计规格文档
2. 写入 `shared/context-bus/cdo/DESIGN-V6.0.md`
3. Handoff: `shared/handoffs/cdo-to-ceo-v60-ui.md`
4. Git commit + push
