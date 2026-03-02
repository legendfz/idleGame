# TECH-PLAN v1.3 — 西游记 Idle Game

**日期**：2026-03-01
**作者**：CTO
**状态**：草案
**基于**：CPO/PRD-V1.3.md

---

## 1. 技术概述

v1.3 新增三个系统：副本/关卡、成就、排行榜。均为纯前端实现，数据持久化到 localStorage，状态管理通过 Zustand。

**技术栈不变**：React + TypeScript + Vite + Zustand + CSS Modules

---

## 2. 副本/关卡系统

### 2.1 架构设计

```
src/
├── data/
│   └── dungeons.ts          # 副本静态配置（10 个副本数据）
├── engine/
│   ├── dungeonEngine.ts     # 副本战斗引擎（区别于普通挂机战斗）
│   └── bossAI.ts            # Boss AI 和技能系统
├── stores/
│   └── dungeonStore.ts      # 副本状态（进度、每日次数、首通记录）
├── components/
│   ├── DungeonList.tsx       # 副本列表页
│   ├── DungeonBattle.tsx     # 副本战斗界面
│   └── DungeonReward.tsx     # 奖励结算弹窗
```

### 2.2 副本战斗引擎

与普通挂机战斗的区别：
- **实时制**：不使用 `setInterval` 挂机循环，改用 `requestAnimationFrame` 驱动
- **有时间限制**：300 秒倒计时
- **Boss 阶段机制**：HP 阈值触发阶段切换
- **玩家交互**：闪避按钮需要点击响应

```typescript
class DungeonEngine {
  private state: DungeonBattleState;
  private animFrameId: number;

  start(dungeonId: string): void {
    this.state = initBattleState(dungeonId);
    this.loop(performance.now());
  }

  private loop(timestamp: number): void {
    const dt = (timestamp - this.state.lastTick) / 1000;
    this.state.lastTick = timestamp;
    this.state.elapsed += dt;

    // 超时检查
    if (this.state.elapsed >= 300) {
      this.onFail('timeout');
      return;
    }

    // 自动攻击 tick
    this.processAutoAttack(dt);
    // 队友攻击
    this.processCompanionAttack(dt);
    // Boss AI tick
    this.processBossAI(dt);
    // 技能预警倒计时
    this.processSkillWarnings(dt);

    this.animFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  dodge(): void {
    // 玩家点击闪避，当前技能伤害减半
    if (this.state.activeWarning) {
      this.state.dodgeActive = true;
    }
  }

  private processBossAI(dt: number): void {
    const boss = this.state.boss;
    // 阶段切换
    if (boss.hp / boss.maxHp <= 0.5 && boss.phase === 1) {
      boss.phase = 2;
      boss.attack *= 1.5;  // 狂暴
    }
    // 技能 CD
    boss.skills.forEach(skill => {
      skill.currentCd -= dt;
      if (skill.currentCd <= 0) {
        this.startSkillWarning(skill);
        skill.currentCd = skill.cooldown;
      }
    });
  }
}
```

### 2.3 数据存储

```typescript
// dungeonStore.ts (Zustand)
interface DungeonState {
  progress: Record<string, DungeonProgress>;  // dungeonId -> progress
  dailyAttempts: Record<string, number>;       // dungeonId -> 今日次数
  dailyResetDate: string;                      // 'YYYY-MM-DD'
}

interface DungeonProgress {
  cleared: boolean;
  clearCount: number;
  bestTime: number | null;    // 秒，用于排行榜
  firstClearClaimed: boolean;
}
```

每日次数在 `dailyResetDate !== today` 时重置。

### 2.4 性能考虑

- `requestAnimationFrame` 循环在副本战斗页面才启动，离开页面自动停止
- Boss 技能预警用 CSS animation 而非 JS 计时器
- 副本静态数据 tree-shake friendly，按需导入

---

## 3. 成就系统

### 3.1 架构设计

```
src/
├── data/
│   └── achievements.ts      # 成就配置表（所有成就定义）
├── engine/
│   └── achievementTracker.ts # 成就进度追踪器
├── stores/
│   └── achievementStore.ts   # 成就状态
├── components/
│   ├── AchievementList.tsx   # 成就列表页
│   └── AchievementToast.tsx  # 达成通知
```

### 3.2 事件驱动追踪

成就追踪采用事件订阅模式，不侵入现有业务逻辑：

```typescript
// achievementTracker.ts
type GameEvent =
  | { type: 'LEVEL_UP'; level: number }
  | { type: 'MONSTER_KILLED'; count: number }
  | { type: 'EQUIPMENT_OBTAINED'; total: number }
  | { type: 'DUNGEON_CLEARED'; dungeonId: string; time: number; noDamage: boolean }
  | { type: 'ENHANCE_SUCCESS'; level: number; quality: string }
  | { type: 'ONLINE_TIME'; totalSeconds: number }
  | { type: 'GOLD_EARNED'; totalGold: number }
  | { type: 'DODGE_SUCCESS'; streak: number };

class AchievementTracker {
  private achievements: Achievement[];

  onEvent(event: GameEvent): Achievement[] {
    const completed: Achievement[] = [];
    for (const ach of this.achievements) {
      if (ach.completed) continue;
      const newProgress = this.evaluate(ach, event);
      if (newProgress >= 1) {
        ach.completed = true;
        ach.completedAt = Date.now();
        completed.push(ach);
        this.applyReward(ach.reward);
      } else {
        ach.progress = newProgress;
      }
    }
    return completed; // 返回新达成的成就，用于 toast
  }
}
```

### 3.3 属性加成整合

成就的永久属性加成需整合到战斗计算：

```typescript
// 在 gameStore 的属性计算中
function getTotalStats(base: Stats, equipment: Equipment[], achievements: Achievement[]): Stats {
  const achBonus = achievements
    .filter(a => a.completed && a.reward.type === 'stat_boost')
    .reduce((acc, a) => {
      const stat = a.reward.stat!;
      if (stat === 'all') {
        acc.attack += a.reward.value;
        acc.defense += a.reward.value;
        acc.speed += a.reward.value;
      } else {
        acc[stat] += a.reward.value;
      }
      return acc;
    }, { attack: 0, defense: 0, speed: 0 });

  return {
    attack: Math.floor(base.attack * (1 + achBonus.attack / 100)),
    defense: Math.floor(base.defense * (1 + achBonus.defense / 100)),
    speed: Math.floor(base.speed * (1 + achBonus.speed / 100)),
    // ...
  };
}
```

### 3.4 称号系统

- 称号存储在 `achievementStore.selectedTitle`
- 仅展示用途，无属性加成
- 默认称号「花果山猴王」

---

## 4. 排行榜系统

### 4.1 架构设计

```
src/
├── stores/
│   └── leaderboardStore.ts  # 排行榜数据
├── services/
│   └── leaderboardAPI.ts    # 排行榜 API（本地实现 + 在线接口预留）
├── components/
│   └── Leaderboard.tsx      # 排行榜页面
```

### 4.2 本地实现

```typescript
// leaderboardStore.ts
interface LeaderboardState {
  rankings: Record<string, LeaderboardEntry[]>;  // type -> Top 10
}

// leaderboardAPI.ts
class LocalLeaderboardAPI implements LeaderboardAPI {
  getLocalRanking(type: string): LeaderboardEntry[] {
    return useLeaderboardStore.getState().rankings[type] || [];
  }

  submitLocalScore(type: string, entry: LeaderboardEntry): void {
    const store = useLeaderboardStore.getState();
    const list = [...(store.rankings[type] || []), entry]
      .sort((a, b) => this.getSortOrder(type, a, b))
      .slice(0, 10);
    store.setRanking(type, list);
  }

  private getSortOrder(type: string, a: LeaderboardEntry, b: LeaderboardEntry): number {
    // 速通：升序（时间越短越好）
    if (type.startsWith('dungeon_speed_')) return a.score - b.score;
    // 其他：降序（越高越好）
    return b.score - a.score;
  }
}
```

### 4.3 在线扩展预留

```typescript
// 未来 v1.4+ 实现
class OnlineLeaderboardAPI implements LeaderboardAPI {
  private baseUrl: string;

  async getOnlineRanking(type: string, page: number): Promise<LeaderboardEntry[]> {
    const res = await fetch(`${this.baseUrl}/leaderboard/${type}?page=${page}`);
    return res.json();
  }

  async submitOnlineScore(type: string, entry: LeaderboardEntry): Promise<void> {
    await fetch(`${this.baseUrl}/leaderboard/${type}`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }
}

// 工厂函数，根据配置选择实现
function createLeaderboardAPI(): LeaderboardAPI {
  if (config.onlineEnabled) return new OnlineLeaderboardAPI(config.apiUrl);
  return new LocalLeaderboardAPI();
}
```

### 4.4 战力计算

```typescript
function calculateCombatPower(player: PlayerState, achievements: Achievement[]): number {
  const { attack, defense, speed, hp } = player.stats;
  const equipBonus = player.equipment.reduce((sum, e) => sum + e.qualityMultiplier, 0);
  const achBonus = getAchievementTotalBonus(achievements);
  const realmCoeff = REALM_COEFFICIENTS[player.realm]; // 1.0 ~ 4.0

  return Math.floor(
    (attack * 1.0 + defense * 0.8 + speed * 0.5 + hp * 0.3)
    * (1 + equipBonus * 0.01)
    * (1 + achBonus)
    * realmCoeff
  );
}
```

---

## 5. 存档迁移

v1.3 新增数据需要存档版本迁移：

```typescript
// saveMigration.ts
function migrateV12toV13(save: SaveDataV12): SaveDataV13 {
  return {
    ...save,
    version: '1.3',
    dungeons: { progress: {}, dailyAttempts: {}, dailyResetDate: '' },
    achievements: INITIAL_ACHIEVEMENTS,  // 所有成就初始状态
    leaderboard: { rankings: {} },
    selectedTitle: '花果山猴王',
  };
}
```

---

## 6. 开发计划

| Sprint | 任务 | 工作量 |
|--------|------|--------|
| Sprint 2.1 | 副本数据配置 + 副本列表 UI | 1 天 |
| Sprint 2.2 | 副本战斗引擎 + Boss AI | 1.5 天 |
| Sprint 2.3 | 成就系统（数据+追踪+UI） | 1 天 |
| Sprint 2.4 | 排行榜（本地实现+UI） | 0.5 天 |
| Sprint 2.5 | 集成测试 + 存档迁移 | 0.5 天 |

**总计预估**：4.5 天
