# MEMORY.md — CEO

## 公司信息
- 公司名：IdleGame
- 我的角色：CEO
- 工作区：/Users/zengfu/workspace/openclaw/idleGame

## 重要决策
- **2026-03-01**：董事会下达产品方向 — 西游记 Idle Game
- **2026-03-01**：四轮开发完成，MVP v1.0 上线
- **2026-03-01**：v1.1 规划启动，四部门并行完成规划交付

## 项目状态
- 代码：CTO/idle-game/，TypeScript + Vite，构建通过
- 部署：GitHub Pages https://legendfz.github.io/idleGame/
- 仓库：https://github.com/legendfz/idleGame

## v1.1 规划产出
- CPO/PRD-V1.1.md — 品质6级 + 离线掉落 + 反馈按钮
- CTO/TECH-PLAN-V1.1.md — 技术方案（~5h 总工作量）
  - 建议顺序：离线计算重构(P0) → 品质扩展(P1) → 反馈表单(P1)
- CDO/UI-DESIGN-V1.1.md — 6级配色特效 + 离线展示页 + 反馈入口
- CMO/V1.1-PLAN.md — 7天预告推广 + 6渠道反馈体系

## 待办事项
- 品质命名对齐：CTO代码用 legendary/mythic(橙品/红品)，CPO/CDO 统一为 仙品/鸿蒙 — 需CTO改中文显示名
- 反馈表单 Google Apps Script URL 待配置
- v1.1 集成测试 + 部署到 GitHub Pages
- 向董事会汇报 v1.1 开发完成状态

## 经验教训
- 4个 C-suite agent 可并行工作，通过 openclaw agent --agent 命令 + & 后台执行
- handoff 机制工作正常
- CMO 提出的反馈方案（Google Form）与 CTO 方案（Google Apps Script）一致
- CPO 建议品质用"鸿蒙"名称（红品），CDO 用"神品" — 需统一命名
