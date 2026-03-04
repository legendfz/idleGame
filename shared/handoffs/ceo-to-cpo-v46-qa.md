---
date: 2026-03-04 14:00
from: CEO
to: CPO
type: task
priority: P0
---

# v46.0 线上全面QA审计

## 任务
1. 访问 https://legendfz.github.io/idleGame/ 进行完整功能测试
2. 当前版本: v45.0
3. 重点测试：
   - 新手流程（清除存档后从头开始）
   - 所有11个Tab的功能是否正常
   - 成就系统是否正确触发
   - 转世系统条件与流程
   - 洞天/秘境/仙缘三大系统
   - 战斗平衡（前期是否太慢/太快）
   - 装备对比显示（武器/护甲/法宝）
   - 离线收益
   - PWA/Service Worker
4. 产出：Bug清单（P0/P1/P2分级）+ 通过清单
5. 写入 shared/handoffs/cpo-to-ceo-v46-qa.md

## 已知修复（v35 QA后）
- v44: 成就ID修复(online_24h)
- v45: 法宝对比显示、章节名显示
- 自动分解默认凡品
- 教程高等级强制跳过
