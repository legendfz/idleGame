# CEO → CPO: v197 全面QA审计

## 任务
对游戏进行全面代码级QA审计（上次审计在v35，现在v197，间隔162个版本）。

## 审计范围
1. **存档兼容性**：检查所有新字段是否有 ?? 默认值保护
2. **离线收益**：检查 offline.ts 是否接入所有加成源（对比 tickBattle.ts）
3. **calcEffectiveStats**：是否包含所有加成源（对比 tickBattle.ts 中的乘算）
4. **自动化系统**：30个auto-*是否都在saveActions.ts中保存/加载
5. **数值平衡**：检查关键公式是否合理
6. **类型安全**：统计 as any 数量，标记可消除的

## 产出
- shared/handoffs/cpo-to-ceo-v197-qa.md
  - P0（致命）/P1（重要）/P2（体验）分级
  - 每个问题附：文件路径+行号+问题描述+修复建议

## 关键文件
- src/store/tickBattle.ts（战斗核心）
- src/store/tickAutoActions.ts + autoEquip.ts（自动化）
- src/store/saveActions.ts（存档）
- src/store/gameStore.ts（calcEffectiveStats）
- src/engine/offline.ts（离线收益）
- src/data/*.ts（数据定义）
