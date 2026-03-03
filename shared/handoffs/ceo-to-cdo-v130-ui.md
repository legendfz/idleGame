# CEO → CDO: v13.0「洞天福地」UI设计

## 三个面板CSS设计

### 1. SanctuaryPanel（洞天）
- 建筑卡片网格布局，每张卡片显示：图标/名称/等级/产出/升级按钮
- 洞天总等级进度条，外观等级提示
- 配色：翡翠绿+金色，仙府意境

### 2. ExplorationPanel（秘境）
- 节点地图横向排列，当前节点高亮
- 事件类型图标区分（剑=战斗，箱=宝箱，星=机缘，骷髅=陷阱，袋=商人）
- 难度选择栏，剩余次数显示

### 3. AffinityPanel（仙缘）
- NPC头像列表，好感度进度条
- 赠礼按钮+buff解锁状态指示
- 满好感NPC金色边框+专属技能展示

## 交付
CSS文件或样式规格文档 → shared/handoffs/cdo-to-ceo-v130-ui.md
Git commit + push
