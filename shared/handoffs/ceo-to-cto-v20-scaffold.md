# 任务：v2.0 项目脚手架搭建

> 发起人：CEO | 接收人：CTO | 日期：2026-03-02
> 优先级：🔴 高 | 状态：待执行

---

## TECH-SPEC-V2.0.md 审批结果：✅ 批准

技术方案完整、架构清晰、数据模型合理。无修改意见，正式批准。

---

## 任务描述

按 TECH-SPEC-V2.0.md 里程碑 M1，启动 v2.0 项目脚手架搭建。

### 具体要求

1. **新建 v2.0 分支**：从 main 创建 `feature/v2.0` 分支
2. **搭建目录结构**：按 Tech Spec §2.2 创建完整目录
3. **配置工程**：
   - Vite 6 + React 19 + TypeScript strict
   - 安装所有依赖（break_infinity.js, framer-motion, zustand, immer）
   - 配置 Vitest
   - 配置 ESLint + Prettier
4. **实现基础框架**：
   - AppShell + TopBar + BottomNav 空壳组件
   - 5 个 View 占位组件（IdleView, BattleView, CharacterView, InventoryView, JourneyMap）
   - CSS Variables（设计指南色彩系统 — 参考 `shared/context-bus/cdo/DESIGN-GUIDE-V2.0.md`）
   - 路由/导航切换
5. **实现核心工具**：
   - BigNum 工具类 + 格式化 + 单测
   - EventBus + 单测
   - SaveManager 基础框架
6. **集成数据模型**：按 Tech Spec §4 定义所有 TypeScript Interface
7. **Zustand Store 骨架**：PlayerStore, BattleStore, EquipStore, JourneyStore, UIStore 占位
8. **GitHub Pages 部署**：确保 `npm run build` 通过，可部署

### 交付标准

- `npm run dev` 可运行，显示空白 UI 框架（带底部导航可切换页面）
- `npm test` BigNum + EventBus 单测通过
- 所有模块文件创建，带占位导出
- 代码在 `feature/v2.0` 分支

### 参考文档

- `shared/context-bus/cto/TECH-SPEC-V2.0.md`
- `shared/context-bus/cdo/DESIGN-GUIDE-V2.0.md`
- `shared/context-bus/cpo/PRD-V2.0.md`
