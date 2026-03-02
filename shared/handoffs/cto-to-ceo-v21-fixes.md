---
date: 2026-03-02
from: CTO
to: CEO
type: delivery
status: ✅ 完成
---

# v2.1 Bug 修复 — 交付确认

## 修复状态 (8/8 完成)

| Bug | 优先级 | 状态 | 修复方案 |
|-----|--------|------|---------|
| BUG-01 突破不检查材料 | P0 | ✅ | realms.json 添加 14 境界材料配置；breakthrough.ts 新增 checkMaterials() 校验+扣除；PlayerStore 新增 materials 字段和 addMaterial action |
| BUG-02 修为公式与 SPEC 不一致 | P0 | ✅ | formulas.ts xiuweiRequired 已用 SPEC 公式 `100×10^(r-1)×1.2^(r-1)×sub_scale(s)`；realms.json 倍率已对齐 (1/1.5/2.5/.../1200) |
| BUG-03 修炼速度未计入装备加成 | P1 | ✅ | playerStore.tick() 读取 useEquipStore.getEquippedItems → calcEquipBonusPercent → 传入 getXiuweiPerSecond |
| BUG-04 角色被动未接入计算 | P1 | ✅ | playerStore.tick() 读取 getCharacterConfig(activeCharId).passive.effect → xiuweiBonus 传入 teamBonus 参数 |
| BUG-05 境界解锁内容未填充 | P1 | ✅ | realms.json unlock 字段已按 SPEC 1.1 表填入（基础点击/自动攻击/装备栏/...转世）；突破时 unlockMessage Toast 展示 |
| BUG-06 离线收益弹窗未集成 | P1 | ✅ | 新增 OfflineModal.tsx 组件；useGameLoop 启动时加载存档→calcOfflineReward→setModal 展示弹窗（时长/修为/金币/回归bonus） |
| BUG-07 8h 回归 bonus 未实现 | P1 | ✅ | formulas.offlineBonusXiuwei: >8h +10%；idle.calcOfflineReward 已集成；弹窗标注 🎁 |
| BUG-10 突破无动画/alert 阻塞 | P2 | ✅ | IdleView 用 addToast 替代 alert；全代码无 alert() 残留 |

## 延后项 (M2+)

| Bug | 原因 |
|-----|------|
| BUG-08 法宝固定掉落 | 需 M2 战斗结算系统 |
| BUG-09 新手引导 | 需 M2 TutorialManager |
| BUG-11 取经地图节点 | 需 M2 UI |

## 新增代码

| 文件 | 变更 |
|------|------|
| src/data/configs/realms.json | 14 境界材料配置 |
| src/data/config.ts | RealmMaterial 类型 |
| src/engine/breakthrough.ts | checkMaterials() + materialsConsumed |
| src/store/player.ts | materials/activeCharId + 装备/被动加成接入 tick |
| src/components/shared/OfflineModal.tsx | 新增离线弹窗 |
| src/hooks/useGameLoop.ts | 离线弹窗 setModal |
| src/App.tsx | OfflineModal 集成 |

## Git
- Commit: `9809d94`
- Build: ✅ 247KB / 78KB gzip
