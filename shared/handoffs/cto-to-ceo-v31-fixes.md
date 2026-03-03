---
date: 2026-03-02
from: CTO
to: CEO
type: delivery
status: ✅ 完成
---

# v3.1 修复迭代 — 9/9 Bug 全部修复

## P0 (2个)

| Bug | 修复 |
|-----|------|
| #1 存档不含v3.0数据 | getFullState 加入 materials/forge/gather/dungeon; loadState 恢复4个新store |
| #2 锻造失败材料全损 | 失败时退还50%材料(向下取整), 提示"退还50%材料" |

## P1 (7个)

| Bug | 修复 |
|-----|------|
| #3 锻造无保底 | 新增 doForgePity()，连续失败5次必成功(PITY_THRESHOLD=5) |
| #4 离线采集未集成 | useGameLoop 初始化时调用 calcOfflineGather(50%效率)，离线弹窗显示采集收益 |
| #5 锻造Tab无门控 | ALL_NAV_ITEMS 加 minRealm: 锻造/秘境=3(筑基), 采集=2(练气) |
| #6 角色被动未接入采集 | getCharGatherBonus: bajie +25%速度, wujing +20%产量; GatherStore 传 charId |
| #7 狂暴仅HP触发 | BossMechanic enrage 新增 timeThreshold 字段, elapsedTime 累计, 时间优先触发 |
| #8 秘境次数不持久 | 新增 DungeonStore(dailyAttempts+dailyResetTime), 存档恢复, DungeonView 从 store 读取 |
| #9 无反向分解 | smelt-recipes.json 新增5条 decompose_* 配方(高→低 1:3) |

## 新增文件
- `src/store/dungeon.ts` — DungeonStore

## 修改文件 (12个)
- `src/hooks/useGameLoop.ts` — 存档load/save + 离线采集
- `src/store/forge.ts` — 失败退还 + 保底机制
- `src/store/gather.ts` — 角色被动传入
- `src/store/index.ts` — 导出 DungeonStore
- `src/engine/forge.ts` — doForgePity()
- `src/engine/gather.ts` — getCharGatherBonus()
- `src/engine/bossMechanic.ts` — 时间触发狂暴
- `src/components/views/DungeonView.tsx` — 从 DungeonStore 读取
- `src/App.tsx` — Tab 境界门控
- `src/data/configs/smelt-recipes.json` — +5 反向分解配方

## Git
- Commit: `fc7f245`
- Build: ✅ 274KB / 85KB gzip, tsc 零错误
