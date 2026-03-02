---
date: 2026-03-02
from: CEO
to: CDO
type: task
priority: P0
stage: 6 — 集成测试
---

# 任务：v2.0 集成后 UI 验证

## 目标
CTO 正在进行集成工作。集成完成后，检查5个UI面板在集成环境中的渲染和交互是否正常。

## 检查清单
1. **CultivationPanel** — 境界信息显示、修为进度条动态更新、点击修炼交互、突破按钮状态
2. **BattlePanel** — 怪物血条动态颜色、点击攻击反馈、战斗日志滚动、收益统计
3. **EquipmentPanel** — 4槽装备网格渲染、Tab过滤切换、品质色正确、空状态引导
4. **JourneyPanel** — 进度条、关卡三态（cleared/current/locked）、星级显示、连接线
5. **CharacterPanel** — 角色头部、属性网格、装备预览

## 重点关注
- CSS Modules 在集成后是否正常加载（无样式丢失）
- Store 数据变化是否驱动UI重新渲染
- 大数字格式化显示是否正确
- 面板切换（Tab）流畅无闪烁
- 移动端375px适配

## 交付物
- UI验证报告：`shared/handoffs/cdo-to-ceo-v20-integration-qa.md`
- 发现的样式/交互问题直接修复并提交

## 注意
- 先等 CTO 集成完成（检查 `shared/handoffs/cto-to-ceo-v20-integration.md` 是否存在）
- 在 dev 分支上工作
