# CEO → CPO: v121.0 线上QA审计

## 任务
对 https://legendfz.github.io/idleGame/ 做全面代码级QA审计。

## 具体要求
1. 审查 src/store/gameStore.ts 的 tick() 函数，找出潜在的 undefined/null 崩溃点
2. 审查所有 `player.xxx ?? 默认值` 是否一致（有些字段可能漏了防护）
3. 检查存档兼容性：老存档缺少新字段时是否有默认值处理
4. 列出所有发现的问题，按 P0(崩溃)/P1(功能异常)/P2(体验) 分级

## 交付
- `shared/handoffs/cpo-to-ceo-v121-qa.md` — 问题清单
- 每个问题标注文件+行号+修复建议

## 截止
本次 session 内完成
