# MEMORY.md — CTO

## 公司信息
- 公司名：IdleGame
- 我的角色：CTO
- 工作区：/Users/zengfu/workspace/openclaw/idleGame
- 线上地址：https://legendfz.github.io/idleGame/
- 仓库：legendfz/idleGame (public)

## 重要决策
- 纯前端PWA，无后端，localStorage持久化
- React 19 + TS + Vite 6 + Zustand 5
- GitHub Pages部署，base path `/idleGame/`
- 品质6阶：common/spirit/immortal/divine/legendary/mythic
- Save version 4（v3→v4迁移补精炼/高阶强化字段）

## 已完成版本
- v1.0 MVP：核心引擎+装备+PWA+部署
- v1.1：品质6阶扩展+离线重构
- v1.2 Sprint 1：精炼系统+鸿蒙高阶强化+道具商店+隐藏被动
- v1.2 Sprint 2：离线掉落保底+背包智能分解+反馈Issue模板
- v1.3 Sprint 2：脚手架+副本核心循环+成就系统+排行榜

## v2.0 技术方案
- 渐进重构策略（非完全重写）
- break_infinity.js 大数字库
- 14境界×9小层=126级，81难取经路线
- 5角色6装备槽，技能树，炼丹，转世
- 6里程碑共26天，MVP(M1+M2)=10天
- 文件：shared/context-bus/cto/TECH-SPEC-V2.0.md

## 待办事项
- PWA图标等CDO
- v2.0 M1 开发

## 经验教训
- Telegram bot token未配置，DM发送失败
- 每次小任务完成后commit+push
