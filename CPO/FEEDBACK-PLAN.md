# 用户反馈收集方案

**版本**：v1.0
**日期**：2026-03-01

---

## 1. 方案概述

MVP 阶段采用**双通道**反馈：游戏内入口 + GitHub Issues。轻量实现，无需后端。

---

## 2. 通道一：游戏内反馈入口

### 位置
设置页（更多 Tab）底部增加「📝 反馈建议」按钮。

### 实现方式
点击后打开预填的 GitHub Issue 链接：

```
https://github.com/legendfz/idleGame/issues/new?template=feedback.yml&title=[反馈]&labels=feedback
```

### 优点
- 零后端成本
- 自动关联仓库
- 支持分类标签

---

## 3. 通道二：GitHub Issues 模板

### 文件：`.github/ISSUE_TEMPLATE/feedback.yml`

```yaml
name: 🎮 游戏反馈
description: 提交 Bug 报告或功能建议
title: "[反馈] "
labels: ["feedback"]
body:
  - type: dropdown
    id: type
    attributes:
      label: 反馈类型
      options:
        - 🐛 Bug
        - 💡 功能建议
        - ⚖️ 数值平衡
        - 📱 兼容性问题
        - 🎨 UI/UX
        - 📝 其他
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: 详细描述
      placeholder: 请描述你遇到的问题或建议...
    validations:
      required: true

  - type: input
    id: device
    attributes:
      label: 设备信息
      placeholder: "例：iPhone 14, iOS 17, Safari"

  - type: input
    id: progress
    attributes:
      label: 游戏进度
      placeholder: "例：第2章 30关, Lv.45"

  - type: textarea
    id: screenshot
    attributes:
      label: 截图（可选）
      placeholder: 拖拽图片到此处
```

### 文件：`.github/ISSUE_TEMPLATE/bug.yml`

```yaml
name: 🐛 Bug 报告
description: 游戏功能异常
title: "[Bug] "
labels: ["bug"]
body:
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
      placeholder: "Chrome 120 / iPhone 15 Safari"
```

---

## 4. 反馈处理流程

```
用户提交 → GitHub Issue 创建 → 自动打标签
                ↓
        CPO 每周 review（周一）
                ↓
      ┌─────────┼──────────┐
      Bug      建议      数值
      ↓         ↓         ↓
   CTO 修复   评估排期   CPO 调整
```

### 响应时间目标
| 类型 | 响应 | 解决 |
|------|------|------|
| 🐛 严重 Bug | 24h | 48h |
| 🐛 一般 Bug | 48h | 1 周 |
| 💡 功能建议 | 1 周 | 按迭代排期 |
| ⚖️ 数值反馈 | 48h | 下次更新 |

---

## 5. MVP 阶段数据收集（可选）

### 轻量埋点（无后端）
在游戏内用 `navigator.sendBeacon` 向免费统计服务（如 Plausible / Umami）发送：
- 日活跃用户数
- 平均游戏时长
- 最高章节分布
- 转化率（第 1 章→第 2 章）

### 不收集
- 个人信息
- 存档内容
- 精确位置

---

## 6. 实施优先级

| 优先级 | 任务 | 工时 |
|--------|------|------|
| P0 | GitHub Issue 模板（2 个 yml） | 0.5h |
| P0 | 设置页「反馈」按钮 | 0.5h |
| P1 | 轻量埋点接入 | 2h |
