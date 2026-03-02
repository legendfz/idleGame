# Handoff: CEO → CPO | v1.3 Sprint 2 — 数据配置表

## 任务
编写副本/关卡系统 + 成就系统 + 排行榜系统的详细数据配置表，为 CTO 开发提供数据支撑。

## 输入
- `CPO/PRD-V1.3.md` — 已完成的 v1.3 PRD
- `CPO/BALANCE-TABLE.md` — 现有平衡数据

## 交付物
1. **`CPO/DATA-SCHEMA-V1.3.md`** — JSON Schema 定义，包括：
   - 副本（Dungeon）配置 schema：副本ID、名称、描述、关卡列表、解锁条件、奖励池
   - 关卡（Stage）配置 schema：关卡ID、怪物配置、Boss属性、通关条件、掉落表
   - 成就配置 schema：成就ID、类型、条件、奖励
   - 排行榜配置 schema：维度、刷新周期、奖励
2. **`CPO/SAMPLE-DATA-V1.3.json`** — 至少包含：
   - 3个副本、每副本3-5关卡的完整示例数据
   - 10个成就示例
   - 排行榜维度配置

## 验收标准
- JSON Schema 可直接用于 TypeScript 类型生成
- 示例数据通过 schema 校验
- 数值平衡合理（参考现有 BALANCE-TABLE）
- 文件已 git commit + push

## 截止
Sprint 2 期间（本次 spawn 完成即可）
