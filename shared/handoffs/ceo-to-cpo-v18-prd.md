# CEO → CPO: v18.0「仙途永恒」PRD

## 版本目标
将游戏转为 PWA（Progressive Web App），支持手机安装到桌面、离线访问。同时做全面可玩性测试。

## 需求

### P0: PWA 基础
1. 添加 Web App Manifest（name/icons/theme_color/display:standalone）
2. Service Worker 缓存策略（cache-first for assets, network-first for index）
3. 安装提示横幅（"添加到主屏幕"引导）

### P1: 性能优化
4. 游戏循环节流：非活跃 tab 降频（requestAnimationFrame → 1fps）
5. 大数据存档压缩（当前 localStorage 可能很大）
6. 组件懒加载（React.lazy for 非首屏 tab）

### P2: 可玩性验收
7. 编写 v18.0 验收清单（~30条），重点测试：
   - 新玩家前10分钟体验流畅度
   - 各系统数值平衡（升级节奏、装备掉率）
   - 存档导入导出完整性
   - 渐进解锁是否合理

## 交付物
- `shared/handoffs/cpo-to-ceo-v18-prd.md` — PRD + QA 清单
