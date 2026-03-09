/**
 * v189.0 — Auto-misc actions (fate/wheel/titles/story/dailyChallenges/abyssMilestones/luckyMoment/awaken/seasonPass)
 * Extracted from tickAutoActions.ts
 */
import { ABYSS_MILESTONES } from '../data/abyssMilestones';
import { TITLES, type TitleCheckStats } from '../data/titles';
import { STORIES as STORY_LIST } from '../data/story';
import { AWAKENING_PATHS, totalAwakeningPoints, AWAKENING_UNLOCK_REINC } from '../data/awakening';
import { getDailyChallenges as getDCChallenges } from '../data/dailyChallenge';
import { useSeasonStore } from './seasonStore';
import { getSeasonQuests, SEASON_REWARDS } from '../data/seasonPass';
import { useDailyChallengeStore } from './dailyChallengeStore';
import type { TickContext } from './tickAutoActions';

export { autoActivateFate, autoSpinWheel, checkTitleUnlocks, checkStoryTriggers, autoClaimDailyChallenges, autoClaimAbyssMilestones, checkLuckyMoment, autoAwaken, autoClaimSeasonPass };

function autoActivateFate(ctx: TickContext) {
  if (!ctx.state.autoFate || ctx.state.fateBlessing.active || ctx.updatedPlayer.tianmingScrolls <= 0) return;
  ctx.updatedPlayer.tianmingScrolls -= 1;
  ctx.set({ fateBlessing: { active: true, expiresAt: Date.now() + 2 * 60 * 60 * 1000 } });
}

function autoSpinWheel(ctx: TickContext) {
  if (!ctx.state.autoWheel || ctx.totalPlayTime % 30 !== 0 || ctx.updatedPlayer.lingshi < 5000) return;
  const now = Date.now();
  if (now - ctx.state.lastWheelSpin < 3600_000) return;
  ctx.updatedPlayer.lingshi -= 5000;
  const roll = Math.random();
  const lv = ctx.updatedPlayer.level;
  const goldBase = Math.max(1000, lv * 500);
  if (roll < 0.25) { ctx.updatedPlayer.lingshi += goldBase; }
  else if (roll < 0.45) { ctx.updatedPlayer.exp += Math.floor(goldBase * 0.8); }
  else if (roll < 0.60) { ctx.updatedPlayer.pantao += Math.max(10, Math.floor(lv / 2)); }
  else if (roll < 0.72) { ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + Math.max(5, Math.floor(lv / 10)); }
  else if (roll < 0.82) { ctx.updatedPlayer.lingshi += Math.floor(goldBase * 1.5); }
  else if (roll < 0.90) { ctx.updatedPlayer.pantao += Math.max(20, lv); }
  else if (roll < 0.95) { ctx.updatedPlayer.tianmingScrolls = (ctx.updatedPlayer.tianmingScrolls ?? 0) + 1; }
  else if (roll < 0.98) { ctx.updatedPlayer.lingshi += goldBase * 3; }
  else { ctx.updatedPlayer.lingshi += goldBase * 10; }
  ctx.set({ lastWheelSpin: now });
}

function checkTitleUnlocks(ctx: TickContext) {
  if (ctx.totalPlayTime % 30 !== 0) return;
  const titleStats: TitleCheckStats = {
    level: ctx.updatedPlayer.level,
    reincarnations: ctx.updatedPlayer.reincarnations ?? 0,
    totalKills: ctx.updatedPlayer.totalKills ?? 0,
    highestChapter: ctx.state.highestChapter,
    achievementCount: 0,
    equipmentCollected: (ctx.updatedPlayer.codexEquipIds ?? []).length,
    monsterCollected: (ctx.updatedPlayer.codexEnemyNames ?? []).length,
    trialBestFloor: ctx.updatedPlayer.trialBestFloor ?? 0,
    totalPlayTimeSec: ctx.state.totalPlayTime,
    awakeningPoints: ctx.updatedPlayer.awakeningPoints ?? 0,
  };
  const current = ctx.state.unlockedTitles ?? [];
  const newUnlocked = TITLES.filter(t => t.condition(titleStats)).map(t => t.id);
  if (newUnlocked.length > current.length) {
    const newlyEarned = newUnlocked.filter((id: string) => !current.includes(id));
    const newTitle = newlyEarned.length > 0 ? TITLES.find(t => t.id === newlyEarned[0]) : null;
    ctx.set({ unlockedTitles: newUnlocked, titleToast: newTitle ? `🏅 称号解锁：${newTitle.name}` : null });
    if (newTitle) setTimeout(() => ctx.set({ titleToast: null }), 4000);
  }
}

function checkStoryTriggers(ctx: TickContext) {
  if (ctx.totalPlayTime % 10 !== 0) return;
  const seen = ctx.state.seenStories ?? [];
  for (const story of STORY_LIST) {
    if (seen.includes(story.id)) continue;
    let triggered = false;
    if (story.trigger.type === 'level' && ctx.updatedPlayer.level >= story.trigger.value) triggered = true;
    if (story.trigger.type === 'reincarnation' && ctx.updatedPlayer.reincarnations >= story.trigger.value) triggered = true;
    if (triggered) {
      const newSeen = [...seen, story.id];
      if (story.reward) {
        if (story.reward.type === 'lingshi') ctx.updatedPlayer.lingshi += story.reward.amount;
        if (story.reward.type === 'pantao') ctx.updatedPlayer.pantao += story.reward.amount;
        if (story.reward.type === 'exp') ctx.updatedPlayer.exp += story.reward.amount;
      }
      ctx.set({ seenStories: newSeen, activeStory: { title: story.title, text: story.text, reward: story.reward }, player: ctx.updatedPlayer });
      break;
    }
  }
}

function autoClaimDailyChallenges(ctx: TickContext) {
  if (!ctx.state.autoClaimChallenges || ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const dcStore = useDailyChallengeStore.getState();
  if (!dcStore.hasUnclaimed()) return;
  const challenges = getDCChallenges();
  for (const ch of challenges) {
    const result = dcStore.claim(ch.id, ctx.updatedPlayer.level);
    if (result) {
      if (result.type === 'lingshi') ctx.updatedPlayer.lingshi += result.amount;
      else if (result.type === 'pantao') ctx.updatedPlayer.pantao += result.amount;
      else if (result.type === 'hongmengShards') ctx.updatedPlayer.hongmengShards += result.amount;
      else if (result.type === 'trialTokens') ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens || 0) + result.amount;
      ctx.log = ctx.addLog(ctx.log, `🎯 自动领取每日挑战奖励: ${result.type} ×${result.amount}`, 'info');
    }
  }
  dcStore.save();
}

function autoClaimAbyssMilestones(ctx: TickContext) {
  if (ctx.totalPlayTime % 10 !== 0 || ctx.totalPlayTime === 0) return;
  const claimed = [...(ctx.state.claimedAbyssMilestones ?? [])];
  const highest = ctx.state.highestAbyssFloor ?? 0;
  let changed = false;
  for (const m of ABYSS_MILESTONES) {
    if (m.floor <= highest && !claimed.includes(m.floor)) {
      claimed.push(m.floor);
      ctx.log = ctx.addLog(ctx.log, `🏔️ 深渊里程碑「${m.label}」已解锁！`, 'info');
      changed = true;
    }
  }
  if (changed) ctx.set({ claimedAbyssMilestones: claimed });
}

function checkLuckyMoment(ctx: TickContext) {
  const now = Date.now();
  const lm = ctx.state.luckyMoment ?? { active: false, expiresAt: 0 };
  if (lm.active && now > lm.expiresAt) {
    ctx.set({ luckyMoment: { active: false, expiresAt: 0 } });
    ctx.log = ctx.addLog(ctx.log, '⏳ 幸运时刻结束', 'info');
    return;
  }
  if (!lm.active && ctx.totalPlayTime % 600 === 0 && ctx.totalPlayTime > 0 && Math.random() < 0.03) {
    const duration = 10 * 60 * 1000;
    ctx.set({ luckyMoment: { active: true, expiresAt: now + duration } });
    ctx.log = ctx.addLog(ctx.log, '🍀 幸运时刻降临！全收益×1.5 持续10分钟', 'levelup');
  }
}

function autoAwaken(ctx: TickContext) {
  if (!ctx.state.autoAwaken || ctx.totalPlayTime % 90 !== 0 || ctx.totalPlayTime === 0) return;
  const reincCount = ctx.updatedPlayer.reincarnations ?? 0;
  if (reincCount < AWAKENING_UNLOCK_REINC) return;
  const awState = ctx.updatedPlayer.awakening ?? { unlockedNodes: [] as string[], selectedPath: null };
  const unlockedNodes: string[] = [...(awState.unlockedNodes ?? [])];
  const totalPts = totalAwakeningPoints(reincCount);
  const spentPts = unlockedNodes.reduce((sum: number, nid: string) => {
    for (const p of AWAKENING_PATHS) { const node = p.nodes.find(n => n.id === nid); if (node) return sum + node.cost; }
    return sum;
  }, 0);
  let availablePts = totalPts - spentPts;
  if (availablePts <= 0) return;
  let allocated = 0;
  for (let attempt = 0; attempt < 18 && availablePts > 0; attempt++) {
    let bestNode: { id: string; cost: number } | null = null;
    for (const path of AWAKENING_PATHS) {
      for (const node of path.nodes) {
        if (unlockedNodes.includes(node.id)) continue;
        if (node.requires && !unlockedNodes.includes(node.requires)) continue;
        if (node.cost > availablePts) continue;
        if (!bestNode || node.cost < bestNode.cost) bestNode = node;
      }
    }
    if (!bestNode) break;
    unlockedNodes.push(bestNode.id);
    availablePts -= bestNode.cost;
    allocated++;
  }
  if (allocated > 0) {
    ctx.updatedPlayer.awakening = { unlockedNodes, selectedPath: awState.selectedPath };
    ctx.log = ctx.addLog(ctx.log, `✨ 自动觉醒 ${allocated} 个节点`, 'info');
  }
}

function autoClaimSeasonPass(_ctx: TickContext) {
  if (_ctx.totalPlayTime % 30 !== 0 || _ctx.totalPlayTime === 0) return;
  try {
    const state = useSeasonStore.getState();
    const quests = getSeasonQuests();
    for (const q of quests) {
      if (!state.questClaimed.includes(q.id) && (state.questProgress[q.id] ?? 0) >= q.target) state.claimQuest(q.id);
    }
    const updated = useSeasonStore.getState();
    for (const r of SEASON_REWARDS) {
      if (r.level <= updated.level && !updated.claimedRewards.includes(r.level)) updated.claimReward(r.level);
    }
  } catch { /* ignore */ }
}
