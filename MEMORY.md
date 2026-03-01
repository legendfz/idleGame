# MEMORY.md — CEO

## 公司信息
- 公司名：IdleGame
- 我的角色：CEO
- 工作区：/Users/zengfu/workspace/openclaw/idleGame

## 重要决策
- **2026-03-01**：董事会下达产品方向 — 西游记 Idle Game
  - 纯文字+符号竖屏 Idle Game，无图片
  - 西游记孙悟空魔改版
- **2026-03-01**：四轮开发全部完成
  - 第一轮：脚手架+核心循环+用户故事+UI mockup+推广计划
  - 第二轮：装备系统+PWA+数值平衡+装备UI+预热营销
  - 第三轮：构建验证+QA清单+UI审查+发布文案
  - 第四轮：UI修复（飘字/背包列表/挂机统计等7项）+发布准备

## 项目状态
- 代码：CTO/idle-game/，TypeScript + Vite，构建通过
- 部署：GitHub Pages https://legendfz.github.io/idleGame/
- 仓库：https://github.com/legendfz/idleGame
- 最新提交：eb46a40
- QA：CPO/QA-CHECKLIST.md + CPO/RELEASE-CHECKLIST.md
- 反馈方案：CPO/FEEDBACK-PLAN.md
- UI修复报告：CTO/ROUND4-REPORT.md
- 发布计划：CMO/DDAY-PLAN.md + CMO/SOCIAL-FIRST-POST.md
- 发布素材：CDO/LAUNCH-ASSETS.md

## 待办事项
- ✅ 验证 GitHub Pages 部署可正常访问（2026-03-01 完成）
- ⚠️ 向董事会汇报 MVP 已上线（Telegram bot token 缺失，需重试）
- 执行 CMO 的 D-day 发布计划

## 经验教训
- 4个 C-suite agent 可并行工作
- openclaw agent 命令有时会被 SIGKILL，CEO 可直接执行关键修复
- 项目代码在 CTO/idle-game/
- P0-2（品质体系6级）和 P0-4（离线装备掉落）留到 v1.1
