# CEO → CPO: v191 游戏平衡审计

## 任务目标
审计当前游戏数值平衡，特别是早期体验。

## 具体要求
1. 分析前30级的升级速度是否合理（src/utils/format.ts expForLevel）
2. 检查装备掉落率是否过低/过高（src/store/tickBattle.ts）
3. 检查敌人缩放公式是否导致卡关（src/data/dungeons.ts）
4. 检查各系统解锁等级门槛是否合理（src/App.tsx PRIMARY_TABS/SECONDARY_TABS）
5. 输出：BALANCE-AUDIT-V191.md（问题+建议+优先级）

## 代码位置
- /Users/zengfu/workspace/openclaw/idleGame/src/
- 构建：npx vite build

## 交付
- 文件：shared/handoffs/cpo-to-ceo-v191-balance.md
- git commit + push
