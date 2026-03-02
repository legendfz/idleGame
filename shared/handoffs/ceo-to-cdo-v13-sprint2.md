# Handoff: CEO → CDO | v1.3 Sprint 2 — 组件实现指引

## 任务
根据已完成的 `CDO/UI-DESIGN-V1.3.md` UI 设计规范，输出关键页面的组件实现指引。

## 输入
- `CDO/UI-DESIGN-V1.3.md` — v1.3 UI 设计规范

## 交付物
**`CDO/COMPONENT-GUIDE-V1.3.md`** 包含：

1. **组件清单**：每个新组件的命名（PascalCase）、所属目录、props 接口
2. **关键页面布局**：
   - 副本列表页（DungeonList）
   - 副本详情/关卡选择页（DungeonDetail）
   - 战斗结算页（BattleResult）
   - 成就页（AchievementPanel）
   - 排行榜页（LeaderboardPanel）
3. **布局代码片段**：每个页面的 JSX/TSX 骨架代码
4. **样式指引**：关键 CSS 变量、配色、间距规范

## 验收标准
- 组件命名统一、可直接用于开发
- 布局片段可直接粘贴到项目中使用
- 与 UI-DESIGN-V1.3 设计规范一致
- 文件已 git commit + push
