# 正式发布文案包 — 西游 Idle

**日期**：2026-03-01  
**作者**：CMO  
**状态**：Ready for Review  
**链接占位**：所有游戏链接用 `[GAME_URL]` 代替

---

## 1. Reddit r/incremental_games — 正式发布帖

**标题**: `Journey to the West: Idle Cultivation — A text-only incremental where you grow from a stone monkey to the Monkey King 🐒`

**正文**:

After weeks of dev and alpha feedback from this sub, **Journey to the West: Idle Cultivation** is live!

🔗 **Play free, no login:** [GAME_URL]

### What is it?

An idle/incremental game set in the Chinese epic *Journey to the West*. You start as a stone monkey on Flower-Fruit Mountain and cultivate your way to becoming the legendary Sun Wukong.

The twist: **the entire UI is text and emoji. Zero images.** It looks like this:

```
═══ 花果山 · Stage 3 [7/10] ═══

🐺 Grey Wolf Spirit
  ████████░░  HP 847 / 1,200

  ⚔️ -156 auto   👆 -23 tap

💰 12,847 gold    ✨ 4,521 exp
🔄 Realm: 练气 (1/10)
```

### Why you might like it

- ⚡ **Instant load** — no images = <1s load, works offline as PWA
- 📱 **Vertical mobile-first** — one thumb, portrait mode
- 🌙 **Up to 24h offline earnings** — close and come back to loot
- 📈 **10 cultivation realms** — each one a meaningful prestige layer with new mechanics
- 🐉 **210 stages across 3 chapters** — Flower-Fruit Mountain → Dragon Palace → Heavenly Court
- 🔇 **No ads, no accounts, no tracking** — localStorage save, your data stays yours

### What's in v1.0

- Auto-battle + tap boost
- Stat allocation & realm breakthroughs
- 9 enemy types + 3 chapter bosses
- Equipment system (weapons, armor, accessories)
- Companion system (recruit journey companions: Pigsy, Sandy, etc.)
- Offline progress calculator

### What's coming in v1.1

- Chapter 4–6 (Five Elements Mountain → Journey begins)
- Legendary equipment sets
- Achievements & milestones

Built with React + TypeScript + Zustand. Might open-source — would that interest you?

Happy to answer any questions. Every comment gets a reply. 🙏

---

## 2. Reddit r/WebGames — 短版帖

**标题**: `Journey to the West: Idle Cultivation — free browser idle game, pure text UI, no images`

**正文**:

🔗 [GAME_URL]

A free idle game set in Chinese mythology (Journey to the West / Monkey King). The entire UI is built with Unicode text and emoji — no images at all.

**Quick pitch:**
- Idle/incremental with auto-battle + tap
- 210 stages, 3 chapters, 10 prestige-like cultivation tiers
- Mobile-optimized vertical layout
- Offline earnings up to 24h
- No ads, no signup, no tracking
- Loads in <1 second

Made it as a solo dev experiment in "zero-asset game design." Feedback welcome!

---

## 3. Hacker News — Show HN

**标题**: `Show HN: A text-only idle RPG with zero images – Journey to the West`

**正文**:

I built a browser idle game using only Unicode text and emoji for the UI — no images, sprites, or canvas. The theme is Journey to the West (Chinese Monkey King epic).

Play: [GAME_URL]

The constraint was intentional: can a game feel engaging with pure text? Turns out emoji + box-drawing characters + careful spacing create a surprisingly readable battle UI.

Tech: React, TypeScript, Zustand, Vite. PWA with offline support. All state in localStorage. Total bundle ~150KB gzipped.

Interesting problems I ran into:
- Emoji width inconsistency across OS/browser (the classic monospace lie)
- Designing "prestige" progression that maps to Chinese cultivation mythology
- Making idle math feel rewarding without images for visual feedback

Considering open-sourcing. Happy to discuss the design decisions.

---

## 4. V2EX — 中文社区帖

**标题**: `纯文字+Emoji 做了一个西游记放置游戏，零图片`

**正文**:

做了个小东西：一个纯文字符号的西游记放置游戏。

🔗 在线玩：[GAME_URL]

**特点**：
- 零图片，整个界面用 Unicode 符号 + Emoji 构成
- 从石猴开始，练气→筑基→金丹→...→大乘，10 个境界
- 花果山→龙宫→天庭，3 章 210 关
- 离线挂机最长 24 小时
- 手机竖屏优化，单手玩
- 无广告、无登录、无追踪

**为什么做这个？**

西游题材的游戏多到泛滥，但全都在卷美术。我反其道——如果完全不用图片，纯靠文字和符号，能不能做出好玩的放置游戏？

界面长这样：

```
═══ 花果山 · 第3关 [7/10] ═══

🐺 灰狼精
  ████████░░  HP 847/1,200

  ⚔️ 自动攻击 -156   👆 点击 -23

💰 12,847    ✨ 4,521
🔄 境界：练气 (1/10)
```

技术栈：React + TypeScript + Zustand + Vite，PWA 离线可用，localStorage 存档，总包 ~150KB。

欢迎试玩反馈，也欢迎讨论「零美术资源游戏设计」这个方向。

---

## 5. 少数派 — 推荐文风格

**标题**: 「用最少的像素讲最老的故事」—— 一个零图片的西游放置游戏

**正文**:

如果一个游戏完全没有图片，你还会玩吗？

「西游 Idle」给出了一个有趣的答案。这是一个用纯文字符号构建的放置游戏，灵感来自 A Dark Room 和 Candy Box 这类极简经典，但套上了所有中国人都熟悉的西游记外壳。

🔗 [GAME_URL]

### 第一眼

打开游戏，你看到的是这样的界面：

```
═══ 花果山 · 第3关 ═══

🐺 灰狼精  ████████░░

⚔️ -156   👆 -23
💰 12,847   ✨ 4,521
```

没有精美立绘，没有 3D 建模，有的只是 Unicode 符号和 Emoji。但奇妙的是，你的大脑会自动补全画面——就像读小说时的想象力。

### 玩什么

你从花果山的一只石猴开始，通过战斗、升级、突破境界，走完经典的西游路线：

- 🏔️ 花果山：拜师学艺
- 🐉 龙宫：夺取如意金箍棒
- ☁️ 天庭：大闹天宫

核心是放置机制——关掉手机去睡觉，第二天回来发现悟空替你打了一晚上的妖怪。10 个修仙境界构成了 prestige 系统，每次突破都解锁新机制。

### 为什么推荐

- **包体极小**：~150KB，秒开
- **完全免费**：无广告、无内购、无登录
- **手机友好**：竖屏单手操作
- **离线友好**：最长 24 小时离线收益
- **独特审美**：在满屏 3D 大作中，这股清流让人眼前一亮

适合在通勤、午休、睡前打开看看的轻量游戏。如果你喜欢 A Dark Room，你大概率会喜欢这个。

---

## 6. TapTap — 游戏详情页文案

**游戏名**: 西游 Idle · 文字修仙

**一句话描述**: 零图片纯文字的西游放置游戏 — 从石猴修炼到斗战胜佛

**详细描述**:

从花果山的一块仙石开始，你化为灵猴，踏上修仙之路。

这不是又一个西游卡牌手游。这是一个**完全没有图片**的文字放置游戏——所有界面用符号和 Emoji 构成，用想象力填充画面。

**✨ 特色**
- 🔤 纯文字 UI，零图片，独特视觉风格
- 🐒 从石猴到斗战胜佛的完整成长线
- 🌙 离线挂机最长 24 小时
- 📱 竖屏单手，随时随地
- 🔇 无广告、无内购
- ⚡ 包体极小，秒开秒玩

**📖 内容**
- 3 大章节：花果山 → 龙宫 → 天庭
- 210+ 关卡，9 种妖怪，3 大 Boss
- 10 个修仙境界（练气→筑基→金丹→...→大乘）
- 装备系统 & 同伴系统

**标签**: 放置 / 文字 / 独立 / 西游 / 免费

---

## 7. 小红书 — 种草帖

**标题**: 发现一个超酷的纯文字西游游戏！零图片全靠符号

**正文**:

刷到一个宝藏独立游戏 🫣

完全没有图片！！整个界面都是文字和 emoji 拼出来的！

但是超好玩！从小猴子开始修炼，一路打到大闹天宫 🐒→🦍→👑

关掉手机睡觉，第二天回来悟空替你打了一晚上怪 💤✨

而且——
✅ 完全免费
✅ 没有广告
✅ 手机竖屏单手玩
✅ 秒开不用下载

链接放评论区！[GAME_URL]

适合通勤/午休/睡前的挂机小游戏 📱

\#独立游戏 #放置游戏 #西游记 #文字游戏 #宝藏游戏

---

## 8. 社交媒体通用短文案（微博/即刻/推特）

### 中文版
> 做了一个完全没有图片的西游放置游戏。从石猴修炼到齐天大圣，全靠符号和文字。关掉手机，悟空替你打妖怪。免费无广告 → [GAME_URL] 🐒

### 英文版
> Built an idle game set in Journey to the West — with zero images. The entire UI is text & emoji. Grow from a stone monkey to the Monkey King. Free, no ads, plays in your browser → [GAME_URL] 🐒

---

*所有文案中 [GAME_URL] 待正式链接确定后全局替换。*
