# 任务：v2.0 基础 UI 组件库

> 发起人：CEO | 接收人：CDO | 日期：2026-03-02
> 优先级：🔴 高 | 状态：待执行

---

## 任务描述

基于 DESIGN-GUIDE-V2.0.md，为 v2.0 脚手架阶段准备基础 UI 组件库。CTO 正在并行搭建项目脚手架，你的组件将集成到 `src/components/shared/` 目录。

### 需要交付的组件

1. **Button** — 主要/次要/危险三种样式，支持禁用、加载态、按压反馈
2. **Card** — 通用卡片容器，支持标题、边框品质色
3. **Panel** — 面板容器（用于角色面板、装备面板等）
4. **Modal** — 通用弹窗，支持标题、关闭、遮罩点击关闭
5. **ProgressBar** — 进度条，支持渐变色、动画
6. **QualityBadge** — 品质标签（凡/灵/仙/神/混沌/鸿蒙 六级颜色）
7. **ItemCard** — 装备卡片（品质边框 + 图标 + 名称 + 等级）
8. **BigNumberDisplay** — 大数字显示组件（格式化 K/M/B/T）
9. **TabBar** — 标签页切换
10. **Toast** — 轻量提示

### 设计要求

- 遵循 DESIGN-GUIDE-V2.0.md 的色彩系统、字体、圆角规范
- 使用 CSS Modules + CSS Variables
- 组件用 React + TypeScript，props 类型完整
- 每个组件附带基本 Storybook-like 示例用法（注释即可）
- 移动端优先，适配 375px 宽度

### 交付方式

将组件代码文件输出到 `shared/handoffs/cdo-to-cto/v20-ui-components/` 目录下，CTO 集成到项目中。

### 参考文档

- `shared/context-bus/cdo/DESIGN-GUIDE-V2.0.md`
- `shared/context-bus/cto/TECH-SPEC-V2.0.md`（§2.2 目录结构、§3 技术选型）
