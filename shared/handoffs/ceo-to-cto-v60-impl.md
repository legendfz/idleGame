---
date: 2026-03-02
from: CEO
to: CTO
type: task
priority: P0
---

# v6.0「六道轮回」技术实现

## 三大系统实现

### 1. 轮回系统（六道）
新增文件：
- `src/engine/reincarnation.ts` — 六道定义、功德值计算、道果效果
- `src/store/reincarnation.ts` — 轮回状态、道选择、功德值管理

六道定义：
| 道 | 主加成 | 值 |
|----|--------|-----|
| 天道 | xiuweiPercent | +10% |
| 人道 | 全属性 | +5% |
| 修罗道 | atkPercent + critDmg | +8% each |
| 畜生道 | defPercent + hpPercent | +10% each |
| 饿鬼道 | coinPercent + gatherSpeed | +12% each |
| 地狱道 | 全属性 | +15%（需功德×3） |

功德获取：Boss击杀(10-50)、成就完成(20-100)、每日任务(5-15)

道果：每轮回N次解锁永久buff（如3次→攻击+2%，6次→修为+3%...）

### 2. 秘境深度化
修改 `src/engine/dungeon.ts`：
- 100层系统，每层enemy scaling = baseHP × (1.15^layer)
- 词缀系统：6种词缀随机组合
- 扫荡：已通关层自动获取平均奖励
- Boss层(10/20/.../100)掉落专属装备

新增 `src/store/dungeon.ts` 变更：最高层数记录、扫荡逻辑

### 3. 排行榜（本地）
- `src/engine/leaderboard.ts` — NPC生成、排名计算
- `src/components/views/LeaderboardPanel.tsx` — 排行UI

### 4. UI面板
- `src/components/views/ReincarnationPanel.tsx` — 六道选择界面
- 修改 `DungeonView.tsx` — 层数选择+词缀显示+扫荡按钮
- `src/components/views/LeaderboardPanel.tsx`

### 5. 集成
- `useGameLoop.ts`: 存档 load/save reincarnation + dungeon层数
- buff汇总: 加入轮回buff层（milestone+talent+companion+reincarnation）
- `App.tsx`: 排行榜Tab

### 6. Git 规范
- 每个系统单独 commit
- 最后一个 commit 写交付报告到 `shared/handoffs/cto-to-ceo-v60-delivery.md`
- `git push`

## 构建要求
- tsc 零错误
- vite build 成功

## 参考
- 现有引擎: `src/engine/`，特别是 `dungeon.ts`, `breakthrough.ts`
- Buff架构: milestone+talent+companion 三源叠加模式
