# PRD：反馈按钮与 Issue 模板

**版本**：v1.2 Sprint 2
**日期**：2026-03-01
**作者**：CPO

---

## 1. 概述

设置页 3 个反馈按钮，对应 3 种 GitHub Issue 模板。点击后自动预填游戏状态信息，降低玩家反馈门槛。

---

## 2. 三种模板定义

### 2.1 Bug 报告 (`bug.yml`)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 问题描述 | textarea | ✅ | 遇到了什么问题？ |
| 复现步骤 | textarea | ✅ | 预填 `1.\n2.\n3.` |
| 期望行为 | textarea | ✅ | 正常应该是什么样？ |
| 实际行为 | textarea | ✅ | 实际发生了什么？ |
| 设备信息 | input | ☐ | 自动预填（见 §3） |
| 游戏进度 | input | ☐ | 自动预填 |
| 截图 | textarea | ☐ | 拖拽上传 |

**标签**：`bug`
**标题前缀**：`[Bug] `

```yaml
# .github/ISSUE_TEMPLATE/bug.yml
name: 🐛 Bug 报告
description: 游戏功能异常
title: "[Bug] "
labels: ["bug"]
body:
  - type: textarea
    id: description
    attributes:
      label: 问题描述
      placeholder: 简述你遇到的问题
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 复现步骤
      value: |
        1. 
        2. 
        3. 
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: 期望行为
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: 实际行为
    validations:
      required: true
  - type: input
    id: device
    attributes:
      label: 设备/浏览器
      placeholder: 自动填入
  - type: input
    id: progress
    attributes:
      label: 游戏进度
      placeholder: 自动填入
  - type: textarea
    id: screenshot
    attributes:
      label: 截图（可选）
```

---

### 2.2 功能建议 (`feature.yml`)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 功能描述 | textarea | ✅ | 你希望增加什么功能？ |
| 使用场景 | textarea | ✅ | 在什么情况下需要这个功能？ |
| 优先级感受 | dropdown | ☐ | 非常需要 / 有了更好 / 锦上添花 |
| 游戏进度 | input | ☐ | 自动预填 |
| 补充说明 | textarea | ☐ | 其他想法 |

**标签**：`enhancement`
**标题前缀**：`[建议] `

```yaml
# .github/ISSUE_TEMPLATE/feature.yml
name: 💡 功能建议
description: 提出新功能想法
title: "[建议] "
labels: ["enhancement"]
body:
  - type: textarea
    id: description
    attributes:
      label: 功能描述
      placeholder: 你希望增加什么功能？
    validations:
      required: true
  - type: textarea
    id: scenario
    attributes:
      label: 使用场景
      placeholder: 什么时候你会用到这个功能？
    validations:
      required: true
  - type: dropdown
    id: priority
    attributes:
      label: 对你来说有多重要？
      options:
        - 🔥 非常需要
        - 👍 有了更好
        - ✨ 锦上添花
  - type: input
    id: progress
    attributes:
      label: 游戏进度
      placeholder: 自动填入
  - type: textarea
    id: extra
    attributes:
      label: 补充说明
```

---

### 2.3 体验反馈 (`experience.yml`)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 整体评分 | dropdown | ✅ | ⭐~⭐⭐⭐⭐⭐ |
| 最喜欢的部分 | textarea | ☐ | 开放式 |
| 最不满意的部分 | textarea | ☐ | 开放式 |
| 数值感受 | dropdown | ☐ | 太简单/刚好/太难/掉落太少/掉落太多 |
| 游戏进度 | input | ☐ | 自动预填 |
| 游戏时长 | input | ☐ | 自动预填 |
| 其他想说的 | textarea | ☐ | 自由发挥 |

**标签**：`feedback`
**标题前缀**：`[体验] `

```yaml
# .github/ISSUE_TEMPLATE/experience.yml
name: 📝 体验反馈
description: 分享游戏体验和感受
title: "[体验] "
labels: ["feedback"]
body:
  - type: dropdown
    id: rating
    attributes:
      label: 整体评分
      options:
        - ⭐ 很差
        - ⭐⭐ 一般
        - ⭐⭐⭐ 还行
        - ⭐⭐⭐⭐ 好玩
        - ⭐⭐⭐⭐⭐ 超棒
    validations:
      required: true
  - type: textarea
    id: likes
    attributes:
      label: 最喜欢的部分
      placeholder: 什么让你觉得好玩？
  - type: textarea
    id: dislikes
    attributes:
      label: 最不满意的部分
      placeholder: 什么让你觉得不爽？
  - type: dropdown
    id: difficulty
    attributes:
      label: 数值感受
      options:
        - 太简单了
        - 难度刚好
        - 有点难
        - 太难了
        - 掉落太少
        - 掉落太多
  - type: input
    id: progress
    attributes:
      label: 游戏进度
      placeholder: 自动填入
  - type: input
    id: playtime
    attributes:
      label: 游戏时长
      placeholder: 自动填入
  - type: textarea
    id: extra
    attributes:
      label: 其他想说的
```

---

## 3. 自动预填游戏状态

### 3.1 预填信息

点击反馈按钮时，从 gameStore 读取并编码到 URL 参数：

```typescript
// utils/feedback.ts
function buildFeedbackUrl(template: string, label: string): string {
  const state = useGameStore.getState();
  const realm = REALMS[state.player.realmIndex].name;
  const progress = `Lv.${state.player.level} | ${realm} | 第${state.battle.chapterId}章-${state.battle.stageNum}关`;
  const playtime = formatTime(state.totalPlayTime);
  const device = `${navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Unknown'}`;

  const params = new URLSearchParams({
    template: `${template}.yml`,
    labels: label,
    'game-progress': progress,
    'game-playtime': playtime,
    'device-info': device,
  });

  return `https://github.com/legendfz/idleGame/issues/new?${params}`;
}
```

### 3.2 预填映射

| URL 参数 | 映射到 Issue 字段 |
|---------|-----------------|
| game-progress | 游戏进度 (input) |
| game-playtime | 游戏时长 (input) |
| device-info | 设备/浏览器 (input) |

注：GitHub Issue 模板 URL 参数只支持预填 title 和 body，不支持直接填 form 字段。实际实现改为将信息拼入 body 参数：

```
&body=---游戏信息---\n进度：Lv.45 | 炼气 | 第2章-30关\n时长：12h 30m\n设备：iPhone; CPU iPhone OS 17_0
```

---

## 4. 设置页 UI

```
═══ ⚙️ 设置 ═══
⏱️ 总游戏时间：12h 30m
[💾 手动存档]  [🗑️ 重置]

═══ 📝 反馈与帮助 ═══
游戏有问题或建议？告诉我们！

[🐛 报告Bug]  [💡 功能建议]  [📝 体验反馈]

反馈将通过 GitHub 提交，需要网络连接。
```

---

## 5. 代码变更

| 文件 | 变更 |
|------|------|
| 新增 `utils/feedback.ts` | URL 构建函数 |
| `App.tsx` → SettingsView | 增加反馈区块 + 3 按钮 |
| 仓库新增 `.github/ISSUE_TEMPLATE/bug.yml` | Bug 模板 |
| 仓库新增 `.github/ISSUE_TEMPLATE/feature.yml` | 功能建议模板 |
| 仓库新增 `.github/ISSUE_TEMPLATE/experience.yml` | 体验反馈模板 |

---

## 6. 用户故事

### US-FB01: Bug 报告
> 作为玩家，我想快速报告游戏 Bug。

验收标准：
- [ ] 点击「🐛 报告Bug」→ 新标签打开 GitHub Issue（bug.yml）
- [ ] body 自动含游戏进度/设备信息
- [ ] 4 个必填字段（描述/步骤/期望/实际）

### US-FB02: 功能建议
> 作为玩家，我想提交功能建议。

验收标准：
- [ ] 点击「💡 功能建议」→ feature.yml
- [ ] 2 个必填字段（描述/场景）+ 优先级 dropdown

### US-FB03: 体验反馈
> 作为玩家，我想分享整体游戏体验。

验收标准：
- [ ] 点击「📝 体验反馈」→ experience.yml
- [ ] 1 个必填（评分 ⭐~⭐⭐⭐⭐⭐）
- [ ] 自动填入游戏时长
