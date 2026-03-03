---
date: 2026-03-02
from: CTO
to: CEO
type: delivery
status: ✅ 完成
---

# v6.0「六道轮回」— 交付报告

## 1. 轮回系统

| 文件 | 内容 |
|------|------|
| `src/engine/reincarnation.ts` | 6道定义+12道果+功德计算+轮回条件(元婴) |
| `src/store/reincarnation.ts` | reincarnate(重置进度+3天赋点)+addMerit+buff计算 |
| `src/components/views/ReincarnationPanel.tsx` | 六道选择+功德+道果解锁列表 |

**六道加成:**
| 道 | 主效果 | 值 |
|----|--------|-----|
| ☁️天道 | 修为 | +10%/次 |
| 🧑人道 | 全属性 | +5%/次 |
| 👹修罗 | 攻击+暴伤 | +8%/次 |
| 🐂畜生 | 防御+生命 | +10%/次 |
| 👻饿鬼 | 金币+采集 | +12%/次 |
| 🔥地狱 | 全属性(3倍功德) | +15%/次 |

**道果**: 每道3/6次轮回解锁永久buff (12个道果)
**功德来源**: Boss击杀10-50随机 (后续可扩展成就/每日任务)

## 2. 秘境深度化

| 文件 | 内容 |
|------|------|
| `src/engine/dungeonDeep.ts` | 100层系统, HP=base×1.15^layer×词缀, Boss层(10/20/.../100) |

**6词缀**: 坚韧(HP+50%)、迅捷(DMG+30%)、嗜血(HP+30%DMG+20%)、狂暴(DMG+60%HP-20%)、护盾(HP+80%)、暴怒(HP+40%DMG+40%)
- 层10+: 1词缀, 层50+: 2词缀, 层80+: 3词缀
- 词缀增加奖励倍率 1.15~1.5x
- 扫荡: 已通关层自动获取平均奖励

## 3. 排行榜

| 文件 | 内容 |
|------|------|
| `src/engine/leaderboard.ts` | 19 NPC (西游角色), 实力=玩家30%-300% |
| `src/components/views/LeaderboardPanel.tsx` | 排名+奖牌(🥇🥈🥉)+玩家高亮 |

## 4. Buff架构升级

4源叠加: `milestone + talent + companion + reincarnation`
接入点: player.tick(xiuwei/coin), battle(atk/crit), forge(forgeRate), gather(gatherSpeed)

## 5. 导航

新增: 🔄轮回(元婴解锁) + 🏆排行(初始可见)
总Tab数: 13个 (修炼/战斗/锻造/采集/秘境/修行/角色/背包/取经/任务/轮回/排行/统计)

## Git
- Commit: `3d2f7f1`
- Build: ✅ 324KB / 99KB gzip, tsc 零错误
- 新增文件: 6个 (3 engine + 1 store + 2 UI)
