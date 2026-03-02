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

## v2.0 脚手架 (2026-03-02)
- feature/v2.0 分支, commit ab7d280
- 42文件 +1121行: types/data/engine/store/ui/utils/app 完整
- 21测试通过(bignum 16 + eventbus 5), build通过
- CDO已提交UI组件到 shared/handoffs/cdo-to-cto/v20-ui-components/

## v2.0 核心引擎 (2026-03-02)
- commit ce720fb, 28文件 +1073行
- engine/: formulas+battle+idle+breakthrough+equipment+loot+journey+tick+events+bignum 全实现
- store/: player+battle+equipment+journey+ui 5个Zustand store
- data/configs/: 6个JSON(realms/characters/stages/equipment/monsters/loot-tables)
- CORE-LOOP-SPEC全部公式实现, npm run build通过(239KB/75KB gzip)
- src/ 根目录为v2.0主项目, CTO/idle-game/src/v2/ 为旧脚手架

## v2.1 Bug修复 (2026-03-02)
- commit 209eb91, 8/8 bugs修复
- BUG-01: 大境界突破材料检查+扣除
- BUG-03+04: tick接入装备/角色被动加成
- BUG-06: OfflineModal离线收益弹窗
- PlayerState新增: materials, activeCharId

## v3.0 锻造系统 (2026-03-02)
- commit c0ee5aa, +831行, 5引擎+3store+7JSON
- forge.ts: 配方验证+品质抽奖+随机词条+锻造等级1-50
- gather.ts: 4采集节点+定时器+离线50%
- dungeon.ts: 4秘境+每日次数+体力
- smelt.ts: 5炼化配方
- bossMechanic.ts: 7种Boss机制(免疫/反击/狂暴/阶段/召唤/回复/护盾)
- MaterialStore: 独立材料背包
- 技术方案: shared/context-bus/cto/TECH-SPEC-FORGE.md
- 交付: shared/handoffs/cto-forge-delivery.md

## v3.0 UI集成 (2026-03-02)
- commit 651b157
- ForgeView: 锻造台+炼化+材料背包, 8配方+5炼化
- GatherView: 4采集节点, 实时CD, 开始/收取
- DungeonView: 4秘境, 挑战+结果弹窗
- BattleView: Boss机制标签(7种)
- 底部Nav 5→8标签, 横向滚动
- deploy.yml更新: 支持root src/ + feature/v2.0
- Build: 271KB/85KB gzip

## 待办事项
- 关卡19-81配置补全
- engine单测
- PWA图标等CDO
- CPO PRD后数值微调

## 经验教训
- Telegram bot token未配置，DM发送失败
- 每次小任务完成后commit+push
