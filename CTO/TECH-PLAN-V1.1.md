# TECH-PLAN-V1.1.md — v1.1 技术调研

**日期**：2026-03-01  
**作者**：CTO  
**基于**：v1.0 代码 (CTO/idle-game/src/) + CTO/TECH-PLAN.md

---

## 1. 品质体系扩展：4→6 级（+橙品+红品）

### 1.1 现状分析

当前 `types.ts` 定义 5 级品质：

```typescript
type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'chaos';
// ○凡品(×1) / ●灵品(×2) / ◆仙品(×5) / ★神品(×12) / ✦混沌(×30)
```

`QUALITY_INFO` 是 `Record<Quality, {...}>` 类型，所有装备模板、掉落、显示、套装全部引用此定义。

### 1.2 扩展方案

新增 `legendary`（橙品）和 `mythic`（红品），插入 divine 和 chaos 之间：

```typescript
type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'legendary' | 'mythic';

// 完整 6 级体系：
// ○凡品(×1) → ●灵品(×2) → ◆仙品(×5) → ★神品(×12) → ✧橙品(×50) → ✦红品(×100)
```

| 品质 | 符号 | 倍率 | 颜色 | 定位 |
|------|------|------|------|------|
| 凡品 common | ○ | ×1 | #aaa | 白装，打底 |
| 灵品 spirit | ● | ×2 | #4caf50 | 绿装，常见 |
| 仙品 immortal | ◆ | ×5 | #64b5f6 | 蓝装，进阶 |
| 神品 divine | ★ | ×12 | #ce93d8 | 紫装，稀有 |
| **橙品 legendary** | **✧** | **×50** | **#ff9800** | **橙装，极稀有** |
| **红品 mythic** | **✦** | **×100** | **#f44336** | **红装，传说** |

### 1.3 影响范围

| 文件 | 改动点 | 工作量 |
|------|--------|--------|
| `types.ts` | `Quality` 类型 + `QUALITY_INFO` 增2项 | 5 min |
| `data/equipment.ts` | 新增橙/红装备模板（6-8件），调整 `chaos` → 重映射为 `mythic` | 30 min |
| `store/gameStore.ts` | 无需改动（已泛型化） | 0 |
| `App.tsx` | 无需改动（已动态读取 QUALITY_INFO） | 0 |
| `index.css` | 无需改动（颜色通过 inline style） | 0 |
| 存档迁移 | 需要版本迁移：旧 `chaos` → `mythic` | 15 min |

**总工作量：~1h**

### 1.4 存档兼容方案

```typescript
// save migration v2 → v3
function migrateSave(save: GameSave): GameSave {
  if (save.version <= 2) {
    // Remap chaos → mythic for all equipment
    const remap = (item: EquipmentItem | null) => {
      if (item && item.quality === 'chaos') item.quality = 'mythic';
      return item;
    };
    save.equipment.weapon = remap(save.equipment.weapon);
    save.equipment.armor = remap(save.equipment.armor);
    save.equipment.treasure = remap(save.equipment.treasure);
    save.inventory = save.inventory.map(i => remap(i)!);
    save.version = 3;
  }
  return save;
}
```

### 1.5 新装备模板建议

| 名称 | 栏位 | 品质 | 基础属性 | 来源 | 被动 |
|------|------|------|---------|------|------|
| 盘古斧 | 武器 | legendary | 500 | 第3章隐藏 | 全属性+15% |
| 混沌钟 | 法宝 | legendary | 0 | 转世奖励 | 离线效率+30% |
| 天道之棒 | 武器 | mythic | 1000 | 全章通关 | 暴伤+100% |
| 鸿蒙铠 | 护甲 | mythic | 2000 | 转世10次 | 全属性+50% |

---

## 2. 离线计算逻辑调研

### 2.1 现状分析

当前实现（`store/gameStore.ts` load()）：

```typescript
const offlineSec = Math.min((Date.now() - save.lastSaveTimestamp) / 1000, 86400);
const dps = save.player.stats.attack;           // 粗略 DPS
const offlineLingshi = Math.floor(offlineSec * dps * 0.5);  // 50% 效率
const offlineExp = Math.floor(offlineSec * dps * 0.3);

// 装备掉落：估算 boss 击杀数 = 离线秒/120
const estimatedBossKills = Math.floor(offlineSec / 120);
```

**问题：**
1. DPS 用原始攻击力，未计装备加成（装备加成在 `calcEffectiveStats` 中）
2. 灵石/经验计算与实际战斗收益脱节（实际由 `enemy.lingshiDrop` 驱动，不是 DPS）
3. 离线无法升级（经验只累加，不触发 levelUp）
4. Boss 击杀估算 120 秒/只过于粗糙
5. 无蟠桃离线掉落

### 2.2 改进方案：模拟式离线计算

**核心思路**：离线期间模拟简化版战斗循环，而非直接公式算。

```typescript
function calculateOfflineEarnings(save: GameSave, offlineSec: number) {
  const effectiveAtk = calcEffectiveStats(
    save.player.stats,
    save.equipment.weapon,
    save.equipment.armor,
    save.equipment.treasure
  ).attack;

  const stage = save.battle.stageNum;
  const chapterId = save.battle.chapterId;
  const enemy = createEnemy(chapterId, stage, false)!;
  const boss = createEnemy(chapterId, stage, true)!;

  // 每只小怪击杀时间 = ceil(enemyHp / effectiveAtk)
  const minionKillTime = Math.max(1, Math.ceil(enemy.hp / effectiveAtk));
  const bossKillTime = Math.max(1, Math.ceil(boss.hp / effectiveAtk));
  // 每关时间 = 10波小怪 + 1 Boss
  const stageTime = minionKillTime * 10 + bossKillTime;

  const efficiency = 0.5; // 离线效率
  const effectiveSec = offlineSec * efficiency;

  // 离线完成关卡数
  const stagesCleared = Math.floor(effectiveSec / stageTime);
  const remainingSec = effectiveSec % stageTime;
  const extraMinions = Math.floor(remainingSec / minionKillTime);

  // 收益
  const lingshiMul = getLingshiBonusMul(save.equipment.weapon, save.equipment.armor, save.equipment.treasure);
  const totalMinions = stagesCleared * 10 + extraMinions;
  const totalBosses = stagesCleared;

  const lingshi = Math.floor((totalMinions * enemy.lingshiDrop + totalBosses * boss.lingshiDrop) * lingshiMul);
  const exp = totalMinions * enemy.expDrop + totalBosses * boss.expDrop;
  const pantao = totalBosses > 0
    ? Math.floor(totalBosses * boss.pantaoDrop)  // 期望值
    : 0;

  // 装备掉落
  const equipment: EquipmentItem[] = [];
  const globalStage = getGlobalStage(chapterId, stage);
  for (let i = 0; i < totalBosses && equipment.length < 10; i++) {
    const drop = rollEquipDrop(globalStage, true);
    if (drop) equipment.push(createEquipFromTemplate(drop));
  }

  return { lingshi, exp, pantao, equipment, kills: totalMinions + totalBosses, stagesCleared };
}
```

**优势：**
- 收益与实际战斗一致（基于真实怪物数据）
- 装备加成纳入计算
- 支持蟠桃掉落
- 更直观的离线报告（击杀数、通关数）

**工作量：~2h**

### 2.3 离线升级问题

v1.1 建议：离线期间**不自动升级**，但在领取离线收益后触发批量升级检查：

```typescript
// 领取后触发
while (player.exp >= expForLevel(player.level)) {
  player.exp -= expForLevel(player.level);
  player.level++;
  // ... stat gains
}
```

这样离线报告显示原始经验，领取后连续升级有爽感。

---

## 3. 反馈表单集成

### 3.1 方案对比

| 方案 | 优点 | 缺点 | 成本 |
|------|------|------|------|
| **A. Google Forms 嵌入** | 零开发，免费，自动收集到 Sheet | 需跳转/iframe，体验中断 | 0 |
| **B. 内置表单 → Google Sheets API** | 原生体验，不跳转 | 需 CORS 代理或 Apps Script | 低 |
| **C. 内置表单 → Formspree/Getform** | 原生体验，免后端 | 第三方依赖，免费额度有限 | 免费 |
| **D. 内置表单 → GitHub Issues API** | 直接集成到 repo | 需 token，安全问题 | 0 |

### 3.2 推荐方案：B — Google Apps Script Web App

**流程：**
```
用户填表 → fetch POST → Google Apps Script → 写入 Google Sheet
```

**实现步骤：**

1. 创建 Google Sheet（反馈收集表）
2. 绑定 Apps Script：

```javascript
// Google Apps Script
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.type,      // bug / suggestion / other
    data.message,
    data.contact,   // optional
    data.gameInfo,  // level, realm, playtime
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 部署为 Web App（任何人可访问）
4. 前端组件：

```tsx
function FeedbackForm() {
  const [type, setType] = useState<'bug' | 'suggestion' | 'other'>('suggestion');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const player = useGameStore(s => s.player);

  const submit = async () => {
    setSending(true);
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        type,
        message,
        gameInfo: `Lv.${player.level} ${REALMS[player.realmIndex].name}`,
      }),
    }).catch(() => {});
    setSending(false);
    setSent(true);
  };

  return (
    <div className="feedback-form">
      <h3>📝 反馈</h3>
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="bug">🐛 Bug</option>
        <option value="suggestion">💡 建议</option>
        <option value="other">💬 其他</option>
      </select>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="说点什么…" />
      <button onClick={submit} disabled={sending || !message}>
        {sent ? '✅ 已发送' : sending ? '⏳ 发送中...' : '📤 发送'}
      </button>
    </div>
  );
}
```

### 3.3 集成位置

放在「更多/设置」Tab 中，现有 `SettingsView` 底部添加 `<FeedbackForm />`。

### 3.4 隐私注意

- 不收集任何个人信息（contact 为可选）
- 自动附带游戏等级/境界帮助定位问题
- 需在表单底部注明「仅收集反馈内容和游戏进度信息」

**工作量：~1.5h**（含 Apps Script 部署 + 前端组件）

---

## 4. 实施优先级

| 任务 | 工作量 | 优先级 | 依赖 |
|------|--------|--------|------|
| 品质扩展 6 级 | 1h | P1 | 无 |
| 离线计算重构 | 2h | P0 | 无 |
| 反馈表单 | 1.5h | P1 | Google Sheet 创建 |
| 存档迁移 v2→v3 | 0.5h | P0 | 品质扩展 |

**建议执行顺序**：离线计算 → 品质扩展 + 迁移 → 反馈表单

---

## 5. 技术风险

| 风险 | 缓解 |
|------|------|
| 存档迁移失败 | 加 try/catch + 降级到新游戏 |
| Apps Script 配额 | 免费额度 20,000 次/天，MVP 足够 |
| 模拟式离线计算性能 | 纯数学运算，万次循环 <1ms |
| 品质膨胀 → 数值崩坏 | 橙/红品仅限后期获取（转世/全通关） |
