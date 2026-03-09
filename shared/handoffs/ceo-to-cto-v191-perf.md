# CEO → CTO: v191 性能+稳定性优化

## 任务目标
主包482KB偏大。请优化：

## 具体要求
1. **App.tsx 拆分**：538行太长，把 tick loop / tracking / effects 提取到 hooks
2. **data文件瘦身**：检查 dungeons.ts(462行) equipment.ts(420行) 是否有冗余数据
3. **懒加载优化**：确认所有非首屏组件都是 lazy loaded
4. **as any 清理**：从21个降到<10个

## 约束
- tsc 零错误
- build 通过
- 不改变任何游戏逻辑
- git commit + push

## 代码位置
- /Users/zengfu/workspace/openclaw/idleGame/src/
