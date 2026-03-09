/**
 * v189.0 — Auto-progress actions (farm/sweep/breakthrough/reincarnate/transcend/explore/trial/ascension/weeklyBoss)
 * Extracted from tickAutoActions.ts
 */
import { CHAPTERS, createEnemy, ABYSS_CHAPTER_ID } from '../data/chapters';
import { REINC_MIN_REALM, REINC_MIN_LEVEL } from '../data/reincarnation';
import { TRANSCEND_MIN_REINC } from '../data/transcendence';
import { calcTrialRewards } from '../data/roguelikeTrial';
import { getDailyChallenges as getAscChallenges, MODIFIERS as ASC_MODIFIERS } from '../data/ascensionChallenge';
import { REALMS } from '../data/realms';
import { WEEKLY_FLOORS, getWeekStart } from '../data/weeklyBoss';
import { useExplorationStore } from './explorationStore';
import { sfx } from '../engine/audio';
import type { TickContext } from './tickAutoActions';

export { autoFarmPush, autoSweepChapters, autoBreakthrough, autoReincarnate, autoTranscend, autoExploreDungeons, autoQuickTrial, autoAscensionChallenge, autoWeeklyBoss };

function autoFarmPush(ctx: TickContext) {
  if (!ctx.state.autoFarm || ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const curChapter = ctx.updatedBattle.chapterId;
  if (curChapter >= ctx.state.highestChapter && ctx.state.highestChapter > 1 && curChapter < ABYSS_CHAPTER_ID) {
    const curEnemy = ctx.updatedBattle.currentEnemy;
    if (curEnemy && curEnemy.hp > curEnemy.maxHp * 0.5) {
      const farmChapter = ctx.state.highestChapter - 1;
      const farmCh = CHAPTERS.find(c => c.id === farmChapter);
      if (farmCh) {
        const farmEnemy = createEnemy(farmChapter, 1, false)!;
        ctx.log = ctx.addLog(ctx.log, `🧭 自动回退至「${farmCh.name}」高效刷怪`, 'info');
        ctx.updatedBattle = { ...ctx.updatedBattle, chapterId: farmChapter, stageNum: 1, wave: 1, isBossWave: false, currentEnemy: farmEnemy, log: ctx.log, tribulation: undefined };
      }
    }
  } else if (curChapter < ctx.state.highestChapter && curChapter < ABYSS_CHAPTER_ID) {
    const curEnemy = ctx.updatedBattle.currentEnemy;
    if (curEnemy && curEnemy.hp <= 0) {
      // If highestChapter is abyss (9+), push to abyss directly
      if (ctx.state.highestChapter >= ABYSS_CHAPTER_ID) {
        const abyssFloor = ctx.state.highestStage || 1;
        const abyssEnemy = createEnemy(ABYSS_CHAPTER_ID, abyssFloor, false)!;
        ctx.log = ctx.addLog(ctx.log, `🌀 实力提升！自动推进至「无尽深渊」第${abyssFloor}层`, 'info');
        ctx.updatedBattle = { ...ctx.updatedBattle, chapterId: ABYSS_CHAPTER_ID, stageNum: abyssFloor, wave: 1, isBossWave: false, currentEnemy: abyssEnemy, log: ctx.log, tribulation: undefined };
      } else {
        const pushCh = CHAPTERS.find(c => c.id === ctx.state.highestChapter);
        if (pushCh) {
          const pushEnemy = createEnemy(ctx.state.highestChapter, ctx.state.highestStage, false)!;
          ctx.log = ctx.addLog(ctx.log, `⚔️ 实力提升！自动推进至「${pushCh.name}」`, 'info');
          ctx.updatedBattle = { ...ctx.updatedBattle, chapterId: ctx.state.highestChapter, stageNum: ctx.state.highestStage, wave: 1, isBossWave: false, currentEnemy: pushEnemy, log: ctx.log, tribulation: undefined };
        }
      }
    }
  }
}

function autoSweepChapters(ctx: TickContext) {
  if (!ctx.state.autoSweep || ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  const result = ctx.get().sweepAll();
  if (result.chapters > 0) ctx.updatedPlayer = ctx.get().player;
}

function autoQuickTrial(ctx: TickContext) {
  if (!ctx.state.autoTrial || ctx.totalPlayTime % 300 !== 0 || ctx.totalPlayTime === 0) return;
  if ((ctx.updatedPlayer.trialBestFloor ?? 0) < 3) return;
  const quickFloor = Math.max(1, Math.floor((ctx.updatedPlayer.trialBestFloor ?? 0) * 0.7));
  const rewards = calcTrialRewards(quickFloor, ctx.updatedPlayer.level);
  ctx.updatedPlayer.lingshi += rewards.lingshi;
  ctx.updatedPlayer.exp += rewards.exp;
  ctx.updatedPlayer.pantao += rewards.pantao;
  ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens ?? 0) + rewards.trialTokens;
}

function autoAscensionChallenge(ctx: TickContext) {
  if (!ctx.state.autoAscension || ctx.totalPlayTime % 600 !== 0 || ctx.totalPlayTime === 0) return;
  const today = new Date().toDateString();
  const completed = ctx.state.completedChallengesDate === today ? [...(ctx.state.completedChallenges ?? [])] : [];
  const challenges = getAscChallenges();
  let changed = false;
  for (const ch of challenges) {
    if (completed.includes(ch.id)) continue;
    if (ctx.updatedPlayer.level < (ch.levelReq ?? 0)) continue;
    const rewardMult = ch.modifiers.reduce((m: number, mid: string) => {
      const mod = ASC_MODIFIERS.find((x) => x.id === mid);
      return m * (mod?.rewardMult ?? 1);
    }, 1);
    const lv = ctx.updatedPlayer.level;
    ctx.updatedPlayer.lingshi += Math.floor(ch.rewards.lingshi * lv * rewardMult);
    ctx.updatedPlayer.pantao += Math.floor(ch.rewards.pantao * rewardMult);
    ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + Math.floor(ch.rewards.shards * rewardMult);
    ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens ?? 0) + Math.floor(ch.rewards.trialTokens * rewardMult);
    ctx.updatedPlayer.daoPoints = (ctx.updatedPlayer.daoPoints ?? 0) + Math.floor(ch.rewards.daoPoints * rewardMult);
    completed.push(ch.id);
    changed = true;
  }
  if (changed) ctx.set({ completedChallenges: completed, completedChallengesDate: today });
}

function autoReincarnate(ctx: TickContext): boolean {
  if (!ctx.state.autoReincarnate || ctx.totalPlayTime % 120 !== 0 || ctx.totalPlayTime === 0) return false;
  if (ctx.updatedPlayer.realmIndex >= REINC_MIN_REALM && ctx.updatedPlayer.level >= REINC_MIN_LEVEL) {
    ctx.set({ player: ctx.updatedPlayer, battle: ctx.updatedBattle, inventory: ctx.updatedInventory });
    ctx.get().reincarnate();
    return true;
  }
  return false;
}

function autoTranscend(ctx: TickContext): boolean {
  if (!ctx.state.autoTranscend || ctx.totalPlayTime % 180 !== 0 || ctx.totalPlayTime === 0) return false;
  const reincCount = ctx.updatedPlayer.reincarnations ?? 0;
  if (reincCount >= TRANSCEND_MIN_REINC && ctx.updatedPlayer.realmIndex >= REINC_MIN_REALM && ctx.updatedPlayer.level >= REINC_MIN_LEVEL) {
    ctx.set({ player: ctx.updatedPlayer, battle: ctx.updatedBattle, inventory: ctx.updatedInventory });
    ctx.get().transcend();
    return true;
  }
  return false;
}

function autoExploreDungeons(ctx: TickContext) {
  useExplorationStore.getState().tickReset();
  if (!ctx.state.autoExplore) return;
  const explStore = useExplorationStore.getState();
  const expl = explStore.exploration;
  if (expl.currentRun && !expl.currentRun.completed) {
    const result = explStore.resolveNode();
    if (result?.reward) {
      if (result.reward.lingshi) ctx.updatedPlayer.lingshi += result.reward.lingshi;
      if (result.reward.exp) ctx.updatedPlayer.exp += result.reward.exp;
      if (result.reward.pantao) ctx.updatedPlayer.pantao += result.reward.pantao;
    }
  } else if (!expl.currentRun || expl.currentRun.completed) {
    if (expl.dailyFree > 0) {
      const diff = Math.min(4, Math.max(1, Math.floor(ctx.updatedPlayer.level / 50) + 1));
      explStore.startRun(diff, ctx.updatedPlayer.lingshi);
    }
  }
}

function autoBreakthrough(ctx: TickContext) {
  const autoBreakNext = REALMS[ctx.updatedPlayer.realmIndex + 1];
  if (!autoBreakNext || ctx.updatedPlayer.level < autoBreakNext.levelReq || ctx.updatedPlayer.pantao < autoBreakNext.pantaoReq || ctx.updatedBattle.tribulation?.active) return;
  const tribNames = ['雷劫', '火劫', '风劫', '心魔', '天劫', '九天雷罚', '混沌劫', '灭世天劫', '鸿蒙劫'];
  const tribEmojis = ['[雷]', '[火]', '[风]', '[魔]', '[劫]', '[雷]', '[混]', '[灭]', '[鸿]'];
  const ri = ctx.updatedPlayer.realmIndex;
  const tribHp = Math.floor(ctx.updatedPlayer.stats.maxHp * (3 + ri * 2));
  const tribDef = Math.floor(ctx.updatedPlayer.level * 5 * (1 + ri * 0.15));
  const tribName = tribNames[Math.min(ri, tribNames.length - 1)];
  const tribEmoji = tribEmojis[Math.min(ri, tribEmojis.length - 1)];
  ctx.updatedPlayer = { ...ctx.updatedPlayer, pantao: ctx.updatedPlayer.pantao - autoBreakNext.pantaoReq };
  ctx.updatedBattle = { ...ctx.updatedBattle,
    currentEnemy: {
      name: tribName, emoji: tribEmoji, hp: tribHp, maxHp: tribHp, defense: tribDef,
      lingshiDrop: 0, expDrop: 0, pantaoDrop: Math.floor(autoBreakNext.pantaoReq * 0.3), isBoss: true,
    },
    isBossWave: true,
    tribulation: { active: true, realmIndex: ctx.updatedPlayer.realmIndex + 1, timer: 60 + ri * 10 },
    log: ctx.addLog(ctx.updatedBattle.log, `⚡ 自动渡劫！「${tribName}」降临 — ${60 + ri * 10}秒限时！`, 'boss'),
  };
  sfx.bossAppear();
}

function autoWeeklyBoss(ctx: TickContext) {
  if (!ctx.state.autoWeeklyBoss || ctx.totalPlayTime % 120 !== 0 || ctx.totalPlayTime === 0) return;
  const weekStart = getWeekStart();
  const wb = ctx.state.weeklyBoss;
  const current = (wb && wb.week === weekStart) ? wb : { week: weekStart, clearedFloors: [] as number[], claimed: [] as number[] };
  const stats = ctx.get().getEffectiveStats();
  const level = ctx.updatedPlayer.level;
  let changed = false;
  for (const floor of WEEKLY_FLOORS) {
    if (current.clearedFloors.includes(floor.floor)) continue;
    if (floor.floor > 1 && !current.clearedFloors.includes(floor.floor - 1)) break;
    const bossHp = Math.floor(floor.hpMul * level * (1 + level * 0.01));
    const bossAtk = Math.floor(floor.atkMul * level * (1 + level * 0.005));
    const bossDef = Math.floor(floor.defMul * level);
    const defRate = bossDef / (bossDef + 100 + level * 5);
    const playerDmg = Math.max(1, Math.floor(stats.attack * (1 - defRate)));
    const avgDmg = playerDmg * (1 + stats.critRate * (stats.critDmg - 1));
    const turnsToKill = Math.ceil(bossHp / avgDmg);
    const bossDmgPerTurn = Math.max(1, Math.floor(bossAtk));
    const turnsToSurvive = Math.ceil(stats.maxHp / bossDmgPerTurn);
    if (turnsToKill > turnsToSurvive) break;
    const rewards = floor.rewards;
    const scaledLingshi = Math.floor(rewards.lingshi * Math.max(1, level / 10));
    const scaledPantao = Math.floor(rewards.pantao * Math.max(1, level / 50));
    ctx.updatedPlayer.lingshi = (ctx.updatedPlayer.lingshi ?? 0) + scaledLingshi;
    ctx.updatedPlayer.pantao = (ctx.updatedPlayer.pantao ?? 0) + scaledPantao;
    if (rewards.shards > 0) ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + rewards.shards;
    if (rewards.daoPoints > 0) ctx.updatedPlayer.daoPoints = (ctx.updatedPlayer.daoPoints ?? 0) + rewards.daoPoints;
    if (rewards.trialTokens > 0) ctx.updatedPlayer.trialTokens = (ctx.updatedPlayer.trialTokens ?? 0) + rewards.trialTokens;
    current.clearedFloors = [...current.clearedFloors, floor.floor];
    changed = true;
  }
  if (changed) ctx.set({ weeklyBoss: current });
}
