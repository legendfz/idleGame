# v2.1 Bug 清单

**来源**：v2.0 验收报告 (`cpo-to-ceo-v20-acceptance.md`)
**日期**：2026-03-02 | **作者**：CPO
**统计**：P0 × 2 | P1 × 7 | P2 × 2 | BLOCKED × 24（归入 M2-M6）

---

## P0 — 影响核心 Idle 循环（必须 M1 修复）

### BUG-01 | 突破不检查材料 ⭐ M1可修复
- **用例**：XL-05
- **问题**：`attemptBreakthrough()` 只检查修为是否足够，完全跳过 `breakCost.materials` 检查
- **影响**：玩家可无限突破境界，破坏全局节奏和经济平衡
- **位置**：`src/v2/engine/gameLoop.ts:attemptBreakthrough`
- **修复建议**：在突破前遍历 `realm.breakCost.materials`，校验 `resources.materials` 库存并扣除；不足时返回失败+缺失材料名

### BUG-02 | 修为需求公式与 SPEC 不一致 ⭐ M1可修复
- **用例**：XL-12
- **问题**：
  - 小层级修为：代码用 `breakCost.cultivation × subLevel`（线性），SPEC 要求 `base(r) × sub_scale(s)`（二次曲线）
  - 境界倍率：代码与 SPEC 偏差从筑基开始，圣人偏差达 -42%
- **影响**：全局数值平衡崩坏，前期过快后期过慢
- **数值偏差**：

| 境界 | SPEC 倍率 | 代码倍率 | 偏差 |
|------|----------|---------|------|
| 筑基 | 2.5 | 2 | -20% |
| 金丹 | 4 | 3 | -25% |
| 元婴 | 7 | 5 | -29% |
| 化神 | 12 | 8 | -33% |
| 圣人 | 1200 | 700 | -42% |

- **位置**：`src/v2/engine/gameLoop.ts` + `src/v2/data/realms.ts`
- **修复建议**：
  1. `realms.ts` 倍率改为 SPEC 值（1/1.5/2.5/4/7/12/20/35/60/100/180/320/600/1200）
  2. 实现 SPEC 公式：`xiuwei_required(r,s) = floor(100 × 10^(r-1) × 1.2^(r-1) × (1 + (s-1)×0.4 + (s-1)²×0.05))`
  3. 删除 `breakCost.cultivation` 硬编码，改用公式计算

---

## P1 — 影响已实现功能完整度

### BUG-03 | 修炼速度未计入装备/队友/buff 加成 ⭐ M1可修复
- **用例**：XL-06, XL-07, XL-08
- **问题**：`getCultivationPerSec()` 只算 `base × realmMul × subLevelMul`，TODO 标注的 equipment_bonus / team_bonus / buff_bonus 全未实现
- **影响**：唐僧 +15% 修炼、装备加成等核心 idle 机制无效，角色选择无意义
- **位置**：`src/v2/engine/gameLoop.ts:getCultivationPerSec`
- **修复建议**：读取 `activeCharId` 对应角色的被动技能 effect，加上已装备物品的修炼加成，叠入 CPS 计算

### BUG-04 | 角色被动技能未接入计算 ⭐ M1可修复
- **用例**：KS-02
- **问题**：`switchCharacter` 正确切换 `activeCharId`，但 `getCultivationPerSec` 不读取角色被动 → 切换无实际效果
- **影响**：角色切换功能形同虚设
- **位置**：`src/v2/engine/gameLoop.ts` + `src/v2/data/characters.ts`
- **修复建议**：与 BUG-03 合并修复，从 `CHARACTERS[activeCharId].passiveSkill.effect` 取 `cultivationRate` 加入公式

### BUG-05 | 境界解锁内容未实现 ⭐ M1可修复
- **用例**：XL-11
- **问题**：`RealmConfig.unlockAbility` 全部为 `undefined`，突破境界无新功能解锁
- **影响**：玩家突破无新能力获得感；SPEC 要求练气解锁自动攻击、筑基解锁装备栏×2 等
- **位置**：`src/v2/data/realms.ts`
- **修复建议**：填入 SPEC 1.1 表的解锁内容字符串，在突破成功时 Toast 显示

### BUG-06 | 离线收益弹窗未集成到 App ⭐ M1可修复
- **用例**：JJ-01
- **问题**：`offlineCalc.ts` 存在且修为计算正确，但 `App.tsx` / `GameLoop.tsx` **从未调用**，无离线弹窗
- **影响**：Idle Game 核心体验缺失——玩家回归看不到离线收益
- **位置**：`src/v2/app/App.tsx`
- **修复建议**：App 挂载时比较 `savedAt` 与 `Date.now()`，调用 `calculateOfflineEarnings`，用 Modal 展示结果

### BUG-07 | 离线 8h 回归 bonus 未实现 ⭐ M1可修复
- **用例**：JJ-03
- **问题**：`offlineCalc.ts` 无回归奖励逻辑，SPEC 要求离线 >8h 额外 +10%
- **影响**：长时间离线玩家体验打折
- **位置**：`src/v2/engine/offlineCalc.ts`
- **修复建议**：`if (capped > 28800) { cultivation *= 1.1; gold *= 1.1; }` 并在报告中标注 bonus

### BUG-08 | 法宝固定掉落未配置 ⚠️ 需M2战斗系统
- **用例**：QJ-06
- **问题**：SPEC 要求第1难紧箍咒、第3难金箍棒 100% 固定掉落，`stages.ts` 无法宝字段
- **影响**：核心法宝获取路径缺失
- **位置**：`src/v2/data/stages.ts`
- **修复建议**：在 StageConfig.rewards 增加 `fixedDrops: [{id, name, type}]`；但实际触发需 M2 战斗结算

### BUG-09 | 新手引导系统缺失 ⚠️ 需M2
- **用例**：KS-01
- **问题**：无开场文案、无步骤引导、无功能提示
- **影响**：新玩家不知如何操作，前 5 分钟流程 SPEC 无法执行
- **位置**：全局（需新组件）
- **修复建议**：M2 新增 TutorialManager 组件，按 SPEC 5.1 编排引导步骤

---

## P2 — 体验优化

### BUG-10 | 突破无动画，失败用 alert() ⭐ M1可修复
- **用例**：XL-03
- **问题**：突破成功直接 setState 无动画反馈；失败用浏览器 `alert()` 阻塞 UI
- **位置**：`src/v2/ui/screens/CultivateScreen.tsx`
- **修复建议**：成功时触发 `BreakthroughFX` 组件（已存在但未使用）；失败改用 Toast

### BUG-11 | 取经地图仅进度条，无 81 节点路线图 ⚠️ 需M2
- **用例**：QJ-01
- **问题**：JourneyMap 只显示 `第X难/81` + 进度条，无可点击节点
- **位置**：`src/v2/ui/screens/JourneyMap.tsx`
- **修复建议**：M2 实现 81 节点列表/路线图 UI

---

## BLOCKED 用例里程碑归类（不纳入 v2.1）

| 里程碑 | 用例编号 | 数量 | 说明 |
|--------|---------|------|------|
| **M2 战斗** | XL-09, XL-10, ZD-01~04, ZD-06~07, ZD-09~10, ZB-01~02, QJ-03, QJ-07, QJ-08, JJ-04, KS-05 | 17 | 战斗引擎+UI+掉落 |
| **M3 装备** | ZB-03, ZB-05~07, ZB-09, ZB-10 | 6 | 背包UI+穿戴+强化+分解 |
| **M6 转世** | ZS-01~05 | 5 | Prestige 全系统 |

---

## v2.1 修复计划建议

### 第一批（P0，阻塞发布）
| Bug | 预估工时 | 依赖 |
|-----|---------|------|
| BUG-01 材料检查 | 0.5h | 无 |
| BUG-02 公式对齐 | 1h | 无 |

### 第二批（P1，M1 完整度）
| Bug | 预估工时 | 依赖 |
|-----|---------|------|
| BUG-03+04 加成系统 | 1h | 无 |
| BUG-05 解锁内容 | 0.5h | 无 |
| BUG-06 离线弹窗 | 1h | 无 |
| BUG-07 回归bonus | 0.5h | BUG-06 |

### 第三批（P2，体验）
| Bug | 预估工时 | 依赖 |
|-----|---------|------|
| BUG-10 突破动画+Toast | 0.5h | 无 |

### 延后至 M2+
BUG-08（法宝配置）、BUG-09（新手引导）、BUG-11（地图UI）

**总预估**：M1 可修复部分 ≈ 5 小时 CTO 工作量

---

*文档结束*
