# COMPONENT-GUIDE-V1.3.md — v1.3 组件实现指引

**版本**：v1.3
**日期**：2026-03-01
**作者**：CDO
**基于**：UI-DESIGN-V1.3.md

---

## 1. 组件清单

### 1.1 目录结构

```
src/components/
├── dungeon/
│   ├── DungeonList.tsx         # 副本列表页
│   ├── DungeonCard.tsx         # 副本卡片（列表行）
│   ├── DungeonDetail.tsx       # 副本详情/关卡选择页
│   ├── DungeonBattle.tsx       # 副本战斗界面
│   ├── BossHpBar.tsx           # Boss 血条（渐变色）
│   ├── SkillWarning.tsx        # 技能预警条
│   ├── DodgeButton.tsx         # 闪避按钮
│   └── BattleResult.tsx        # 战斗结算弹窗
├── achievement/
│   ├── AchievementPanel.tsx    # 成就列表页
│   ├── AchievementItem.tsx     # 成就单行
│   ├── AchievementToast.tsx    # 成就达成 Toast
│   └── TitleSelector.tsx       # 称号选择
├── leaderboard/
│   ├── LeaderboardPanel.tsx    # 排行榜页
│   ├── LeaderboardRow.tsx      # 排行单行
│   └── NewRecordToast.tsx      # 新纪录 Toast
└── shared/
    ├── TabBar.tsx              # 顶部 Sub-Tab（可复用）
    └── MiniProgressBar.tsx     # 迷你进度条（成就等）
```

### 1.2 Props 接口总览

```ts
// ── 副本系统 ──

interface DungeonListProps {
  dungeons: Dungeon[];
  currentDungeonId: string | null;
  onSelect: (id: string) => void;
}

interface DungeonCardProps {
  dungeon: Dungeon;
  status: 'cleared' | 'available' | 'locked';
  bestTime?: number;         // 秒
  clearCount?: number;
  remainAttempts?: number;   // 今日剩余次数
  onChallenge?: () => void;
}

interface DungeonDetailProps {
  dungeon: Dungeon;
  stages: DungeonStage[];
  selectedStage: number;
  onStageSelect: (index: number) => void;
  onStart: () => void;
  onBack: () => void;
}

interface DungeonBattleProps {
  dungeon: Dungeon;
  boss: BossState;
  party: PartyMember[];
  phaseInfo: { current: number; total: number; label: string };
  timeLeft: number;          // 秒
  earnings: { lingshi: number; exp: number };
  onDodge: () => void;
}

interface BossHpBarProps {
  current: number;
  max: number;
  bossName: string;
  bossEmoji: string;
}

interface SkillWarningProps {
  skillName: string;
  countdown: number;         // 秒，保留 1 位小数
  visible: boolean;
}

interface DodgeButtonProps {
  onDodge: () => void;
  disabled: boolean;
  cooldown?: number;         // 冷却剩余秒
}

interface BattleResultProps {
  dungeonName: string;
  clearTime: number;
  isNewRecord: boolean;
  isFirstClear: boolean;
  rewards: BattleReward[];
  remainAttempts: number;
  onConfirm: () => void;
  onRetry?: () => void;     // 有剩余次数时
}

// ── 成就系统 ──

interface AchievementPanelProps {
  achievements: Achievement[];
  totalCompleted: number;
  totalCount: number;
  activeTab: 'milestone' | 'challenge';
  onTabChange: (tab: 'milestone' | 'challenge') => void;
}

interface AchievementItemProps {
  achievement: Achievement;
  status: 'completed' | 'in_progress' | 'locked';
  progress?: { current: number; target: number };
}

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  onClick?: () => void;     // 跳转详情
}

interface TitleSelectorProps {
  titles: Title[];
  currentTitleId: string;
  onSelect: (id: string) => void;
}

// ── 排行榜 ──

interface LeaderboardPanelProps {
  tabs: LeaderboardTab[];
  activeTab: string;
  entries: LeaderboardEntry[];
  currentValue: number;
  bestValue: number;
  onTabChange: (tabId: string) => void;
}

interface LeaderboardRowProps {
  rank: number;
  value: number;
  date: string;
  isHighlight?: boolean;
}

interface NewRecordToastProps {
  category: string;
  value: string;
  rank: number;
  onDismiss: () => void;
}

// ── 共享 ──

interface TabBarProps {
  tabs: { id: string; label: string; icon?: string }[];
  activeId: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
}

interface MiniProgressBarProps {
  current: number;
  max: number;
  color?: string;
  height?: number;
  showText?: boolean;
}
```

### 1.3 数据类型

```ts
interface Dungeon {
  id: string;
  name: string;
  emoji: string;
  bossName: string;
  bossEmoji: string;
  recommendLevel: number;
  recommendRealm: string;
  maxAttempts: number;       // 每日次数
  stages: DungeonStage[];
}

interface DungeonStage {
  phase: number;
  label: string;             // "狂暴" 等
  bossHpMultiplier: number;
}

interface BossState {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  currentSkill: { name: string; countdown: number } | null;
}

interface PartyMember {
  name: string;
  emoji: string;
  hp: number;
  action: string;            // "自动攻击 -3,420" 等
}

interface BattleReward {
  icon: string;
  name: string;
  amount: number;
  isFragment?: boolean;      // 碎片类
  quality?: Quality;
}

interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  reward: string;
  category: 'milestone' | 'challenge';
}

interface Title {
  id: string;
  icon: string;
  name: string;
  source: string;            // 来源成就名
}

interface LeaderboardTab {
  id: string;
  icon: string;
  label: string;
}

interface LeaderboardEntry {
  rank: number;
  value: number;
  date: string;
}
```

---

## 2. 关键页面布局

### 2.1 DungeonList — 副本列表页

```tsx
export function DungeonList({ dungeons, currentDungeonId, onSelect }: DungeonListProps) {
  return (
    <div className="main-content">
      {/* 标题 */}
      <div className="page-title-bar">
        <span>═══ 🏔️ 取经路线 ═══</span>
      </div>

      {/* 当前进度 */}
      {currentDungeonId && (
        <div className="dungeon-progress-hint">
          📍 当前进度：{/* 从 dungeons 中查找 */}
        </div>
      )}

      {/* 副本卡片列表 */}
      <div className="dungeon-list">
        {dungeons.map(d => {
          const status = getDungeonStatus(d); // cleared | available | locked
          return (
            <DungeonCard
              key={d.id}
              dungeon={d}
              status={status}
              bestTime={getBestTime(d.id)}
              clearCount={getClearCount(d.id)}
              remainAttempts={getRemainAttempts(d.id)}
              onChallenge={() => onSelect(d.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
```

#### DungeonCard 骨架

```tsx
export function DungeonCard({ dungeon, status, bestTime, clearCount, remainAttempts, onChallenge }: DungeonCardProps) {
  return (
    <div className={`dungeon-card dungeon-${status}`}>
      {/* 行1：状态图标 + 副本名 */}
      <div className="dungeon-card-header">
        <span className="dungeon-status-icon">
          {status === 'cleared' ? '✅' : status === 'available' ? '🔓' : '🔒'}
        </span>
        <span className="dungeon-name">
          {dungeon.emoji} {dungeon.name}
        </span>
      </div>

      {/* 行2：Boss 信息 */}
      <div className="dungeon-card-boss">
        Boss: {dungeon.bossEmoji} {dungeon.bossName}
      </div>

      {/* 行3：状态相关内容 */}
      {status === 'cleared' && (
        <div className="dungeon-card-stats">
          最佳：{bestTime}秒 | 通关 ×{clearCount}
        </div>
      )}

      {status === 'available' && (
        <div className="dungeon-card-action">
          <span className="dungeon-recommend">
            推荐 Lv.{dungeon.recommendLevel} | {dungeon.recommendRealm}
          </span>
          <button className="dungeon-challenge-btn" onClick={onChallenge}>
            挑战
          </button>
          <span className="dungeon-attempts">剩余 {remainAttempts}/{dungeon.maxAttempts} 次</span>
        </div>
      )}

      {status === 'locked' && (
        <div className="dungeon-card-locked">
          需通关：{/* 前置副本名 */}
          <br />
          推荐 Lv.{dungeon.recommendLevel} | {dungeon.recommendRealm}
        </div>
      )}
    </div>
  );
}
```

### 2.2 DungeonDetail — 副本详情/关卡选择

```tsx
export function DungeonDetail({ dungeon, stages, selectedStage, onStageSelect, onStart, onBack }: DungeonDetailProps) {
  return (
    <div className="main-content">
      {/* 子页面顶栏 */}
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="title">{dungeon.emoji} {dungeon.name}</span>
      </div>

      {/* Boss 信息 */}
      <div className="detail-boss-card">
        <div className="detail-boss-emoji">{dungeon.bossEmoji}</div>
        <div className="detail-boss-name">{dungeon.bossName}</div>
        <div className="detail-boss-recommend">
          推荐 Lv.{dungeon.recommendLevel} | {dungeon.recommendRealm}
        </div>
      </div>

      {/* 阶段选择 */}
      <div className="detail-section-title">── 战斗阶段 ──</div>
      <div className="stage-list">
        {stages.map((stage, i) => (
          <div
            key={i}
            className={`stage-item ${i === selectedStage ? 'selected' : ''}`}
            onClick={() => onStageSelect(i)}
          >
            <span className="stage-phase">阶段 {stage.phase}</span>
            <span className="stage-label">{stage.label}</span>
            <span className="stage-hp">HP ×{stage.bossHpMultiplier}</span>
          </div>
        ))}
      </div>

      {/* 奖励预览 */}
      <div className="detail-section-title">── 通关奖励 ──</div>
      <div className="detail-reward-preview">
        <span>💰 灵石 ×15,200</span>
        <span>✨ 经验 ×8,400</span>
        <span>🟣 碎片 ×1 (概率)</span>
      </div>

      {/* 开始按钮 */}
      <button className="dungeon-start-btn" onClick={onStart}>
        ⚔️ 开始挑战
      </button>
    </div>
  );
}
```

### 2.3 BattleResult — 战斗结算弹窗

```tsx
export function BattleResult({
  dungeonName, clearTime, isNewRecord, isFirstClear,
  rewards, remainAttempts, onConfirm, onRetry
}: BattleResultProps) {
  return (
    <div className="modal-overlay">
      <div className={`modal-content battle-result ${isFirstClear ? 'first-clear' : ''}`}>
        {/* 标题 */}
        <h2 className="result-title">🎉 副本通关！</h2>
        <div className="result-dungeon">{dungeonName} · {clearTime}秒</div>

        {/* 新纪录 */}
        {isNewRecord && (
          <div className="result-record">🏆 新纪录！最佳速通！</div>
        )}

        {/* 奖励列表 */}
        <div className="result-divider">── 奖励 ──</div>
        <div className="result-rewards">
          {rewards.map((r, i) => (
            <div
              key={i}
              className={`result-reward-row ${r.quality ? `q-${r.quality}` : ''}`}
              style={{ animationDelay: `${300 + i * 200}ms` }}
            >
              <span className="reward-icon">{r.icon}</span>
              <span className="reward-name">{r.name}</span>
              <span className="reward-amount">×{r.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* 按钮 */}
        <div className="result-actions">
          <button className="btn-primary" onClick={onConfirm}>确认</button>
          {onRetry && remainAttempts > 0 && (
            <button className="btn-secondary" onClick={onRetry}>
              再次挑战 ({remainAttempts}次)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2.4 AchievementPanel — 成就页

```tsx
export function AchievementPanel({
  achievements, totalCompleted, totalCount, activeTab, onTabChange
}: AchievementPanelProps) {
  const filtered = achievements.filter(a => a.category === activeTab);
  const pct = Math.round((totalCompleted / totalCount) * 100);

  return (
    <div className="main-content">
      {/* 标题 + 总进度 */}
      <div className="page-title-bar">
        <span>═══ 🏆 成就 ═══</span>
      </div>
      <div className="achievement-summary">
        <span>📊 完成进度：{totalCompleted}/{totalCount} ({pct}%)</span>
        <MiniProgressBar current={totalCompleted} max={totalCount} color="var(--green)" height={8} />
      </div>

      {/* Tab 切换 */}
      <TabBar
        tabs={[
          { id: 'milestone', label: '里程碑' },
          { id: 'challenge', label: '挑战' },
        ]}
        activeId={activeTab}
        onChange={id => onTabChange(id as 'milestone' | 'challenge')}
      />

      {/* 成就列表 */}
      <div className="achievement-list">
        {filtered.map(a => {
          const status = getAchievementStatus(a);
          const progress = getAchievementProgress(a);
          return (
            <AchievementItem
              key={a.id}
              achievement={a}
              status={status}
              progress={progress}
            />
          );
        })}
      </div>
    </div>
  );
}
```

#### AchievementItem 骨架

```tsx
export function AchievementItem({ achievement, status, progress }: AchievementItemProps) {
  return (
    <div className={`achievement-item ach-${status}`}>
      {/* 左侧：状态图标 */}
      <span className="ach-status-icon">
        {status === 'completed' ? '✅' : status === 'in_progress' ? '🔄' : '🔒'}
      </span>

      {/* 中间：信息 */}
      <div className="ach-info">
        <div className="ach-name">
          {achievement.icon} {achievement.name}
        </div>
        <div className="ach-desc">{achievement.description}</div>
        {status === 'in_progress' && progress && (
          <MiniProgressBar
            current={progress.current}
            max={progress.target}
            height={4}
            showText
          />
        )}
      </div>

      {/* 右侧：奖励 */}
      <span className="ach-reward">{achievement.reward}</span>
    </div>
  );
}
```

### 2.5 LeaderboardPanel — 排行榜页

```tsx
const LEADERBOARD_TABS: LeaderboardTab[] = [
  { id: 'power',   icon: '🏆', label: '战力' },
  { id: 'speed',   icon: '⚔️', label: '速通' },
  { id: 'kills',   icon: '💀', label: '击杀' },
  { id: 'level',   icon: '📈', label: '等级' },
  { id: 'collect', icon: '💎', label: '收集' },
];

export function LeaderboardPanel({
  tabs, activeTab, entries, currentValue, bestValue, onTabChange
}: LeaderboardPanelProps) {
  const diff = currentValue - bestValue;

  return (
    <div className="main-content">
      {/* 标题 */}
      <div className="page-title-bar">
        <span>═══ 📊 排行榜 ═══</span>
      </div>

      {/* Tab 横向滚动 */}
      <TabBar
        tabs={LEADERBOARD_TABS}
        activeId={activeTab}
        onChange={onTabChange}
        scrollable
      />

      {/* 当前类别标题 */}
      <div className="lb-category-title">
        ── {LEADERBOARD_TABS.find(t => t.id === activeTab)?.icon}{' '}
        {LEADERBOARD_TABS.find(t => t.id === activeTab)?.label}排行 ──
      </div>

      {/* 排名列表 */}
      <div className="lb-list">
        {entries.map(e => (
          <LeaderboardRow
            key={e.rank}
            rank={e.rank}
            value={e.value}
            date={e.date}
            isHighlight={e.value === currentValue}
          />
        ))}
      </div>

      {/* 当前数据 */}
      <div className="lb-current">
        <div>📊 当前{LEADERBOARD_TABS.find(t => t.id === activeTab)?.label}：{currentValue.toLocaleString()}</div>
        <div className={diff >= 0 ? 'lb-positive' : 'lb-negative'}>
          📈 距历史最高：{diff >= 0 ? '+' : ''}{diff.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
```

#### LeaderboardRow 骨架

```tsx
const RANK_ICONS = ['', '🥇', '🥈', '🥉'];
const RANK_COLORS = ['', '#ffd700', '#c0c0c0', '#cd7f32'];

export function LeaderboardRow({ rank, value, date, isHighlight }: LeaderboardRowProps) {
  return (
    <div className={`lb-row ${isHighlight ? 'lb-highlight' : ''}`}>
      <span
        className="lb-rank"
        style={rank <= 3 ? { color: RANK_COLORS[rank] } : undefined}
      >
        {rank <= 3 ? RANK_ICONS[rank] : `${rank}.`}
      </span>
      <span className="lb-value">{value.toLocaleString()}</span>
      <span className="lb-date">{date}</span>
      {isHighlight && <span className="lb-current-tag">← 当前</span>}
    </div>
  );
}
```

---

## 3. 共享组件

### 3.1 TabBar

```tsx
export function TabBar({ tabs, activeId, onChange, scrollable }: TabBarProps) {
  return (
    <div className={`tab-bar ${scrollable ? 'tab-bar-scroll' : ''}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeId === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

### 3.2 MiniProgressBar

```tsx
export function MiniProgressBar({ current, max, color, height = 6, showText }: MiniProgressBarProps) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="mini-progress">
      <div className="mini-progress-bg" style={{ height }}>
        <div
          className="mini-progress-fill"
          style={{ width: `${pct}%`, background: color || 'var(--green)' }}
        />
      </div>
      {showText && (
        <span className="mini-progress-text">{current}/{max}</span>
      )}
    </div>
  );
}
```

---

## 4. 样式指引

### 4.1 新增 CSS 变量

```css
:root {
  /* v1.3 新增 */
  --dungeon-available: #ff9800;
  --dungeon-locked-bg: #2a2a2a;
  --skill-warning:     #ff4444;
  --dodge-btn:         #42a5f5;
  --ach-completed-bg:  #1a3a1a;
  --rank-gold:         #ffd700;
  --rank-silver:       #c0c0c0;
  --rank-bronze:       #cd7f32;
}
```

### 4.2 副本组件样式

```css
/* ── 页面标题 ── */
.page-title-bar {
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  color: var(--accent);
  padding: var(--space-md) 0 var(--space-sm);
  letter-spacing: 2px;
}

/* ── 进度提示 ── */
.dungeon-progress-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: var(--space-md);
}

/* ── 副本卡片 ── */
.dungeon-card {
  background: var(--panel);
  border-radius: 8px;
  padding: 12px var(--space-md);
  margin-bottom: var(--space-sm);
  border-left: 3px solid var(--border);
}
.dungeon-cleared  { border-left-color: var(--green); }
.dungeon-available { border-left-color: var(--dungeon-available); }
.dungeon-locked {
  background: var(--dungeon-locked-bg);
  opacity: 0.6;
}
.dungeon-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.dungeon-card-boss { font-size: 13px; color: var(--text-dim); }
.dungeon-card-stats { font-size: 12px; color: var(--text-dim); margin-top: 4px; }
.dungeon-card-action {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: 8px;
  flex-wrap: wrap;
}
.dungeon-recommend { font-size: 12px; color: var(--text-dim); }
.dungeon-attempts  { font-size: 11px; color: var(--text-dim); }
.dungeon-challenge-btn {
  background: var(--dungeon-available);
  color: var(--bg);
  border: none;
  padding: 6px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
}
.dungeon-card-locked { font-size: 12px; color: var(--text-dim); margin-top: 4px; }

/* ── Boss 血条（渐变） ── */
.boss-hp-bar {
  width: 100%;
  height: 20px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin: var(--space-sm) 0;
}
.boss-hp-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease-out;
  /* JS 动态设置 background 渐变 */
}
.boss-hp-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-family: monospace;
  color: var(--text);
  text-shadow: 0 0 3px #000;
}

/* ── 技能预警 ── */
.skill-warning {
  border: 2px solid var(--skill-warning);
  border-radius: 8px;
  padding: var(--space-sm) var(--space-md);
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  color: var(--skill-warning);
  margin: var(--space-sm) 0;
  animation: warning-blink 600ms ease-in-out infinite;
}
@keyframes warning-blink {
  0%, 100% { border-color: var(--skill-warning); }
  50%      { border-color: transparent; }
}

/* ── 闪避按钮 ── */
.dodge-btn {
  display: block;
  width: 200px;
  margin: var(--space-sm) auto;
  padding: 14px 0;
  background: var(--dodge-btn);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  animation: dodge-pulse 1s ease-in-out infinite;
}
@keyframes dodge-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
}
.dodge-btn:disabled { opacity: 0.4; animation: none; }

/* ── 队友行 ── */
.party-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 13px;
  padding: 4px 0;
}
.party-row .member-emoji { font-size: 16px; }
.party-row .member-hp    { color: var(--green); }
.party-row .member-action { color: var(--text-dim); font-size: 12px; }

/* ── 战斗信息栏 ── */
.battle-info-bar {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-dim);
  padding: var(--space-sm) 0;
  border-top: 1px dashed var(--border);
  margin-top: var(--space-sm);
}

/* ── 开始按钮 ── */
.dungeon-start-btn {
  display: block;
  width: 100%;
  margin-top: var(--space-lg);
  padding: 14px 0;
  background: linear-gradient(135deg, var(--accent), var(--dungeon-available));
  color: var(--bg);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.dungeon-start-btn:active { transform: scale(0.97); }
```

### 4.3 结算弹窗样式

```css
.battle-result { text-align: center; }
.battle-result.first-clear { border-color: var(--accent); border-width: 2px; }
.result-title { color: var(--accent); font-size: 18px; margin-bottom: 4px; }
.result-dungeon { color: var(--text-dim); font-size: 13px; margin-bottom: var(--space-sm); }
.result-record {
  color: var(--accent);
  font-size: 14px;
  font-weight: bold;
  margin-bottom: var(--space-sm);
  animation: record-glow 1s ease-in-out infinite alternate;
}
@keyframes record-glow {
  from { text-shadow: 0 0 4px rgba(240,192,64,0.3); }
  to   { text-shadow: 0 0 12px rgba(240,192,64,0.6); }
}
.result-divider {
  color: var(--text-dim);
  font-size: 12px;
  margin: var(--space-sm) 0;
}
.result-reward-row {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  font-size: 14px;
  padding: 4px 0;
  animation: slide-in-right 300ms ease-out both;
}
.result-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  margin-top: var(--space-md);
}
.btn-primary {
  background: var(--accent);
  color: var(--bg);
  border: none;
  padding: 10px 32px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
.btn-secondary {
  background: var(--border);
  color: var(--text);
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
```

### 4.4 成就组件样式

```css
.achievement-summary {
  padding: 0 var(--space-md) var(--space-md);
  font-size: 12px;
  color: var(--text-dim);
}
.achievement-list { padding: 0; }
.achievement-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: 12px var(--space-md);
  border-bottom: 1px solid var(--border);
}
.ach-completed { background: var(--ach-completed-bg); }
.ach-locked    { opacity: 0.6; }
.ach-status-icon { font-size: 16px; flex-shrink: 0; margin-top: 2px; }
.ach-info { flex: 1; min-width: 0; }
.ach-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.ach-desc { font-size: 12px; color: var(--text-dim); }
.ach-reward { font-size: 11px; color: var(--accent); flex-shrink: 0; white-space: nowrap; }

/* 迷你进度条 */
.mini-progress { display: flex; align-items: center; gap: var(--space-xs); margin-top: 4px; }
.mini-progress-bg {
  flex: 1;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.mini-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.mini-progress-text { font-size: 10px; color: var(--text-dim); white-space: nowrap; }

/* 成就 Toast */
.achievement-toast {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  background: var(--panel);
  border: 1px solid var(--accent);
  border-radius: 0 0 12px 12px;
  padding: 12px var(--space-lg);
  z-index: 300;
  text-align: center;
  min-width: 240px;
  animation: toast-slide-down 300ms ease-out forwards;
  cursor: pointer;
}
@keyframes toast-slide-down {
  to { transform: translateX(-50%) translateY(0); }
}
.achievement-toast.dismissing {
  animation: toast-slide-up 300ms ease-in forwards;
}
@keyframes toast-slide-up {
  to { transform: translateX(-50%) translateY(-100%); }
}
```

### 4.5 排行榜样式

```css
.lb-category-title {
  text-align: center;
  font-size: 13px;
  color: var(--text-dim);
  padding: var(--space-sm) 0;
}
.lb-list { padding: 0 var(--space-md); }
.lb-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-family: monospace;
}
.lb-row:last-child { border-bottom: none; }
.lb-highlight { background: rgba(240,192,64, 0.06); border-radius: 4px; padding: 10px var(--space-sm); margin: 0 calc(-1 * var(--space-sm)); }
.lb-rank { width: 32px; text-align: center; font-size: 16px; flex-shrink: 0; }
.lb-value { flex: 1; font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.lb-date { font-size: 11px; color: var(--text-dim); }
.lb-current-tag { font-size: 10px; color: var(--accent); }
.lb-current {
  padding: var(--space-md);
  font-size: 13px;
  border-top: 1px dashed var(--border);
  margin-top: var(--space-sm);
}
.lb-positive { color: var(--green); }
.lb-negative { color: var(--red); }

/* 新纪录 Toast（蓝色边框） */
.new-record-toast {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  background: var(--panel);
  border: 1px solid var(--blue);
  border-radius: 0 0 12px 12px;
  padding: 12px var(--space-lg);
  z-index: 300;
  text-align: center;
  min-width: 240px;
  animation: toast-slide-down 300ms ease-out forwards;
}

/* ── Tab Bar（通用） ── */
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-md);
}
.tab-bar-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tab-bar-scroll::-webkit-scrollbar { display: none; }
.tab-item {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-dim);
  padding: 10px 0;
  font-size: 13px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.tab-item.active { color: var(--accent); font-weight: 600; }
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}
.tab-bar-scroll .tab-item { flex: 0 0 auto; padding: 10px 16px; }
```

---

## 5. 底部导航更新

6 Tab 导航，图标缩小：

```tsx
const TABS_V13 = [
  { id: 'home',        icon: '🏠', label: '主页' },
  { id: 'battle',      icon: '⚔️', label: '战斗' },
  { id: 'bag',         icon: '🎒', label: '背包' },
  { id: 'dungeon',     icon: '🏔️', label: '副本' },
  { id: 'achievement', icon: '🏆', label: '成就' },
  { id: 'leaderboard', icon: '📊', label: '排行' },
];
```

```css
/* 6-Tab 适配 */
.bottom-nav button .icon { font-size: 16px; }            /* 从 18px 缩至 16px */
.bottom-nav button { font-size: 10px; padding: 6px 0; }  /* 标签文字缩小 */

@media (max-width: 374px) {
  .bottom-nav button span:not(.icon) { display: none; }  /* 小屏隐藏文字 */
  .bottom-nav button .icon { font-size: 20px; }
}
```
