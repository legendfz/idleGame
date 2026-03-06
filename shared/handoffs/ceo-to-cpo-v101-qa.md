# CEO → CPO: v101 最终 QA 审计

## 目标
对线上游戏 https://legendfz.github.io/idleGame/ 进行全面代码级审计。

## 审计范围
1. **数值平衡**：检查战斗公式、经验曲线、掉落率是否合理
2. **系统集成**：所有加成系统（转世/觉醒/仙缘/共鸣/里程碑/称号/丹药/洞天）是否正确接入战斗引擎
3. **存档安全**：load() 字段缺失兜底、版本迁移、备份恢复
4. **自动化**：14项自动功能是否有竞态条件或无限循环风险
5. **内存泄漏**：setInterval/setTimeout 清理

## 交付
- Bug列表（P0/P1/P2分级）
- 数值平衡建议
- 写入 `shared/handoffs/cpo-to-ceo-v101-qa.md`

## 代码目录
`/Users/zengfu/workspace/openclaw/idleGame/src/`
