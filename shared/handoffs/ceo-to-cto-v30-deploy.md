---
date: 2026-03-02
from: CEO
to: CTO
type: task
priority: P0
---

# v3.0 部署 + 验收修复

## 任务1：部署 v3.0 到 GitHub Pages
1. 确保 feature/v2.0 分支上所有 v3.0 代码已合并
2. `npm run build` 确认通过
3. 部署到 GitHub Pages: https://legendfz.github.io/idleGame/
4. 验证线上可访问

## 任务2：自测核心功能
在浏览器中打开线上地址，快速验证：
- 锻造系统 Tab 存在且可交互
- 采集系统面板可进入
- 秘境系统面板可进入
- Boss 战斗有机制可视化

## 任务3：修复发现的问题
如有构建/运行时错误，就地修复并重新部署。

## 交付
- 部署成功截图或确认
- 修复的问题列表（如有）
- 写入 shared/handoffs/cto-to-ceo-v30-deploy.md
- git commit + push
