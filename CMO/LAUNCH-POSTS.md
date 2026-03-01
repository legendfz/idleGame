# 种子用户获取计划 — Reddit r/incremental_games

**日期**：2026-03-01  
**目标**：首批 200 DAU

---

## 发帖策略

### 时间安排
- **Week 1（开发中）**：潜水研究社区，了解热门帖格式，回复其他开发者帖
- **Week 2（Alpha）**：发帖 #1（开发日志），收集反馈
- **Week 3（Beta）**：发帖 #2（可试玩链接），邀请测试
- **Week 4（Launch）**：发帖 #3（正式发布），邀请评价

### 发帖注意事项
- r/incremental_games 社区讨厌纯广告，**必须真诚分享开发过程**
- 包含可试玩链接是金标准
- 主动回复每一条评论
- 标注是否开源、是否有广告/内购
- 发帖时间：周六上午 10-12 EST（社区最活跃）

---

## 帖子 #1 — 开发日志角度

**标题**: `[Dev] Building a Journey to the West idle game with pure text/emoji — no images at all`

**正文**:

Hey everyone! Long-time lurker here. I've been working on an idle game based on "Journey to the West" (the Chinese epic with the Monkey King). The twist? **The entire UI is built with Unicode symbols and emoji — zero images.**

Here's what it looks like:

```
═══ 花果山·第3关 [7/10] ═══
🐺 灰狼精  ████████░░  HP: 847/1,200
⚔️ Auto attack  -156
👆 Tap attack   -23
💰 Gold: 12,847  ✨ EXP: 4,521
```

**Core features so far:**
- Auto-battle with tap-to-boost
- 10 realms of cultivation (like prestige tiers with Chinese mythology flavor)
- 3 chapters: Flower-Fruit Mountain → Dragon Palace → Heavenly Court
- Offline earnings
- Pure client-side, localStorage save, zero backend

**Why text-only?**
- Loads instantly, works offline (PWA)
- Unique aesthetic — like a terminal RPG meets incremental
- Zero asset cost, pure gameplay focus
- Actually looks kinda cool with the right emoji combos

Tech stack: React + TypeScript + Zustand. Planning to open-source it.

Would love to hear your thoughts! Is the Chinese mythology theme interesting to non-Chinese players? Any must-have features for this genre?

---

## 帖子 #2 — 可试玩角度

**标题**: `[Playable] 西游 Idle — A text-only Monkey King incremental. Try it in your browser!`

**正文**:

A few weeks ago I posted about building a Journey to the West idle game with pure emoji/text UI. Thanks for all the feedback! Here's the **playable alpha**:

🔗 **[Play Now]** (link)

**What's in this build:**
- ⚔️ Auto-battle + tap attacks
- 📈 Level up, allocate stats, break through cultivation realms
- 🗺️ 3 chapters (50+ stages each) with unique enemies
- 🌙 Offline earnings — close the tab, come back to loot
- 💾 Auto-saves every 30s to localStorage

**What I'm looking for feedback on:**
1. Does the number scaling feel right? Too fast? Too slow?
2. Is the text-only UI readable and enjoyable?
3. Any QoL features you want?

**Not in this build yet:** equipment system, team/companion system, prestige. Coming in the next update.

No ads, no tracking, no accounts. Pure idle fun. Works on mobile (vertical layout optimized).

---

## 帖子 #3 — 正式发布角度

**标题**: `Journey to the West: Idle Cultivation — A text-based incremental where you play as the Monkey King 🐒`

**正文**:

After a month of development and great feedback from this community, **Journey to the West: Idle Cultivation** is ready for its first proper release!

🔗 **[Play Free — No Login Required]** (link)

**What makes it different:**
- 🎨 **Pure text/emoji UI** — no images, loads in <1 second
- 🐒 **Chinese mythology setting** — play as Sun Wukong (the Monkey King), fight through iconic Journey to the West locations
- 📱 **Mobile-first vertical layout** — designed for one-handed phone play
- 🌙 **Generous offline earnings** — up to 24h of idle progress
- ⚡ **Fast progression** — frequent level-ups, 10 cultivation realms, meaningful milestones
- 🔒 **No ads, no accounts** — your save is in your browser

**Content:**
- 3 chapters, 210 stages
- 9 enemy types + 3 bosses
- 10-tier cultivation/realm system
- Equipment coming in v0.2

Built with React + TypeScript. Considering open-sourcing it — would that interest anyone?

Thanks to everyone who gave feedback on the earlier alpha posts. This community is the best. 🙏

---

## 补充渠道

| 渠道 | 行动 | 时间 |
|------|------|------|
| r/incremental_games | 3 篇帖子（上述） | Week 2-4 |
| r/WebGames | 发布帖 #3 的精简版 | Week 4 |
| Incremental Games Plaza (Discord) | 分享链接 + 征求反馈 | Week 3 |
| Hacker News (Show HN) | "text-only idle game" 技术角度 | Week 4 |
| V2EX / 少数派 | 中文圈推广 | Week 4 |

## 成功指标

| 指标 | Week 2 | Week 4 |
|------|--------|--------|
| Reddit 帖子 upvotes | 30+ | 100+ |
| 试玩链接点击 | 100+ | 500+ |
| DAU | 20+ | 200+ |
| Reddit 评论回复率 | 100% | 100% |
