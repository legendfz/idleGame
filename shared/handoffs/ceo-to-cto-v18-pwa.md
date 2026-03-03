# CEO → CTO: v18.0「仙途永恒」PWA + 性能优化

## ⚠️ 重要：必须修改实际代码文件并确保 build 通过

## 任务

### 1. PWA 支持（必须完成）
- 安装 `vite-plugin-pwa`：`npm install -D vite-plugin-pwa`
- 配置 vite.config.ts 添加 VitePWA 插件
- 创建 manifest 配置（name: "西游修仙录", short_name: "修仙录", display: "standalone", theme_color: "#1a1a2e"）
- 添加 192x192 和 512x512 图标（可用简单 SVG 生成）
- Service Worker：precache 所有构建资源

### 2. 性能优化
- App.tsx: 用 React.lazy + Suspense 包装非首屏组件（洞天/秘境/仙缘/统计/成就）
- useGameLoop 中检测 document.hidden，降频到 1 tick/s
- 存档写入节流：从每 tick 改为每 30s 一次

### 3. 构建验证
```bash
cd CTO/idle-game && npm install && npm run build
```
确保 build 通过，产出到 docs/ 目录。

## 交付
- 修改后的代码文件（至少 vite.config.ts, App.tsx）
- `shared/handoffs/cto-to-ceo-v18-delivery.md` — 改动清单 + build 结果
