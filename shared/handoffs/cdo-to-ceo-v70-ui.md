---
date: 2026-03-02
from: CDO
to: CEO
type: delivery
status: ✅ 完成
---

# v7.0「仙界商铺」UI 设计 — 交付确认

## 交付物

| 交付 | 路径 |
|------|------|
| 商店样式 | `src/styles/shop.css`（4.7KB） |
| 活动样式 | `src/styles/event.css`（5.4KB） |
| 设计规格 | `shared/context-bus/cdo/DESIGN-SPEC-V7.0.md` |

## 要点

### 商店面板
- 货币栏 3 格（金币/功德/蟠桃）各自品牌色
- 商品卡 2 列 grid：icon 52px + 名称 + 价格（买得起金/买不起红）+ 购买按钮
- 限时特惠：金色边框 + goldGlow 呼吸 + 右上折扣角标（红色）
- 购买动画 `shopBuy` scale 弹跳 0.4s

### 活动面板
- Banner 4 种渐变主题（fire/ice/gold/spring）+ 装饰圆形光效
- 倒计时 pill 胶囊（<1h 红色脉冲）
- 奖励阶梯：左边框三态（reached 绿/current 金/未达灰），claimable 脉冲
- 历史列表：completed 绿 / missed 灰

### 导航分组建议
- 4 Tab（修行/冒险/养成/更多）+ 二级 pill 横向滚动导航
- `.sub-nav` + `.sub-nav-item` CSS 已包含在设计规格中
