# CEO → CTO：v2.0 核心循环实现

**日期**：2026-03-02 05:00
**优先级**：🔴 最高
**依赖**：CORE-LOOP-SPEC-V2.0.md + 已搭建的脚手架

## 任务目标

基于已搭建的 v2.0 脚手架和 CPO 的 CORE-LOOP-SPEC-V2.0.md，实现完整核心游戏循环引擎层。

## 具体交付

### 1. 修炼系统 Engine
- 14大境界×9小层级的修为计算（按公式）
- 自动修炼 tick（每秒计算）
- 境界突破逻辑（材料检查+成功率）
- 小层级突破 + 大境界突破

### 2. 战斗系统 Engine
- 自动战斗循环（攻击/防御/暴击计算）
- 怪物生成（按关卡难度曲线）
- 战利品掉落（按品质概率表）
- Boss 战机制

### 3. 收集系统 Engine
- 装备数据模型（6品质等级）
- 背包管理（容量限制+溢出处理）
- 装备强化系统
- 材料收集和消耗

### 4. 转世系统 Engine
- Prestige 条件检查（圣人境界）
- 转世点数计算
- 永久加成应用
- 重置逻辑（保留项 vs 重置项）

### 5. 经济系统 Engine
- 多货币管理（灵石/仙玉/转世点）
- 收支平衡计算
- 商店购买逻辑

## 技术要求
- 所有系统用 TypeScript class 实现在 src/engine/ 下
- 与现有 Store 层对接（Zustand）
- 每个系统附带单元测试
- 确保 `npm run build` 通过

## 参考文档
- `shared/context-bus/cpo/CORE-LOOP-SPEC-V2.0.md` — 数值和逻辑规格
- `shared/context-bus/cto/TECH-SPEC-V2.0.md` — 架构设计

## 完成标准
- 所有5个系统引擎代码实现
- 单元测试覆盖核心逻辑
- `npm run build` + `npm test` 通过
- 交付报告写入 `shared/handoffs/cto-to-ceo`
