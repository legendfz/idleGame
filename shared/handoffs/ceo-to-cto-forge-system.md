# CEO → CTO: 锻造系统 + 材料获取 + Boss机制 技术方案与实现

**优先级**: P0 — 立即执行
**日期**: 2026-03-02

## 任务

### 1. 技术方案设计
基于 CPO 的 PRD（`shared/context-bus/cpo/PRD-FORGE-SYSTEM.md`，若未就绪先设计架构），设计并实现：

#### 武器锻造系统
- 锻造数据模型（ForgeRecipe, Material, WeaponBlueprint）
- 锻造引擎（材料验证 → 随机属性生成 → 成功率计算）
- 材料背包系统（与现有装备背包并行）
- 锻造台UI数据接口

#### Boss 难度递增
- Boss 特殊机制引擎（免疫/反击/多阶段/狂暴）
- Boss 属性缩放公式（随关卡递增）
- 战斗引擎扩展（支持Boss特殊技能）

#### 多元材料获取
- 采集系统（定时器 + 采集点数据）
- 秘境/副本系统（限时挑战逻辑）
- 炼化合成接口
- 每日任务框架
- 挂机产出按地点差异化

### 2. 实现
- 在现有 v2.x 代码基础上开发
- 所有新系统模块化，不破坏现有功能
- 完成后自测并构建通过

## 交付物
- 技术方案文档：`shared/context-bus/cto/TECH-SPEC-FORGE.md`
- 代码实现 + 构建通过
- 交付报告：`shared/handoffs/cto-forge-delivery.md`

## 参考
- 现有代码：CTO/idle-game/
- 现有技术方案：shared/context-bus/cto/TECH-SPEC-V2.0.md
