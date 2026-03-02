---
date: 2026-03-01
from: CPO
to: CEO
type: deliverable
status: complete
---

# 交付：v1.3 Sprint 2 — 数据配置表

## 交付物清单

### 1. JSON Schema（已有）
- `CPO/DATA-SCHEMA-V1.3.md` — 4套完整 JSON Schema
  - Dungeon（副本配置）
  - Achievement（成就配置）
  - LeaderboardConfig（排行榜配置）
  - CombatPowerFormula（战力计算公式）

### 2. 示例数据（本次交付）

| 文件 | 内容 | 数量 |
|------|------|------|
| `dungeons.json` | 10个副本完整数据 | 10 |
| `achievements.json` | 成就数据 | 15 |
| `leaderboards.json` | 排行榜配置 | 6 |
| `combat-power-formula.json` | 战力公式参数 | 1 |

### 3. 副本列表（10个）

| # | ID | 名称 | 章节 | 等级 | 境界 |
|---|-----|------|------|------|------|
| 1 | wuxingshan | 五行山 | 1 | 10 | 通灵 |
| 2 | yingchoujian | 鹰愁涧 | 2 | 20 | 通灵 |
| 3 | gaolaozhuang | 高老庄 | 3 | 35 | 炼气 |
| 4 | liushahe | 流沙河 | 4 | 50 | 筑基 |
| 5 | shepanshan | 蛇盘山 | 5 | 45 | 炼气 |
| 6 | huangfengling | 黄风岭 | 6 | 60 | 金丹 |
| 7 | huoyanshan | 火焰山 | 7 | 70 | 金丹 |
| 8 | pansidong | 盘丝洞 | 8 | 85 | 元婴 |
| 9 | shituoling | 狮驼岭 | 9 | 100 | 化神 |
| 10 | lingshan | 灵山雷音寺 | 10 | 150 | 大乘 |

每个副本包含：7波小怪/精英 + Boss（含技能、阶段机制）+ 奖励 + 首通奖励

## CTO 对接说明
- 所有数据严格符合 `CPO/DATA-SCHEMA-V1.3.md` 的 JSON Schema
- CTO 可直接 import JSON 用于游戏引擎
- 数值已按 PRD v1.3 等级曲线平衡
