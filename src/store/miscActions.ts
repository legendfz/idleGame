/**
 * miscActions.ts — v131.0「万法归元」
 * Extracted from gameStore.ts: skills, consumables, rewards, tutorial, utility actions
 */
import { PlayerState } from '../types';
import { ACTIVE_SKILLS } from '../data/skills';
import { getConsumable } from '../data/consumables';
import { ABYSS_MILESTONES } from '../data/abyssMilestones';
import { createEnemy } from '../data/chapters';
import { sfx } from '../engine/audio';
import { addLog } from './gameStore';

type Get = () => any;
type Set = (partial: any) => void;

// === Active Skills ===
export function useSkillAction(get: Get, set: Set, skillId: string): boolean {
  const state = get();
  const { player, battle } = state;
  const skill = ACTIVE_SKILLS.find((s: any) => s.id === skillId);
  if (!skill) return false;
  if (player.level < skill.unlockLevel) return false;
  const cd = player.activeSkills?.cooldowns?.[skillId] ?? 0;
  if (cd > 0) return false;

  const newSkillState = {
    cooldowns: { ...(player.activeSkills?.cooldowns ?? {}), [skillId]: skill.cooldown },
    buffs: { ...(player.activeSkills?.buffs ?? {}) },
  };

  if (skill.effect.type === 'shield' || skill.effect.type === 'attackBuff') {
    newSkillState.buffs[skillId] = skill.duration;
    sfx.breakthrough();
  }

  if (skill.effect.type === 'instantKill' && battle.currentEnemy) {
    const enemy = battle.currentEnemy;
    const mul = skill.effect.value;
    const updatedPlayer = { ...player, activeSkills: newSkillState };
    updatedPlayer.lingshi += Math.floor(enemy.lingshiDrop * mul);
    updatedPlayer.exp += Math.floor(enemy.expDrop * mul);
    updatedPlayer.totalKills += 1;
    updatedPlayer.totalGoldEarned += Math.floor(enemy.lingshiDrop * mul);
    let log = [...battle.log];
    log = addLog(log, `☁️ 筋斗云！瞬杀 ${enemy.name}，获得${mul}倍奖励！`, 'boss');
    const nextEnemy = createEnemy(battle.chapterId, battle.stageNum, false);
    set({
      player: updatedPlayer,
      battle: { ...battle, currentEnemy: nextEnemy, log, wave: battle.wave + 1 },
    });
    sfx.kill();
    return true;
  }

  set({ player: { ...player, activeSkills: newSkillState } });
  return true;
}

// === Consumables ===
export function useConsumableAction(get: Get, set: Set, buffId: string): boolean {
  const state = get();
  const player = state.player;
  const inv = player.consumableInventory ?? {};
  if ((inv[buffId] ?? 0) <= 0) return false;
  const def = getConsumable(buffId);
  if (!def) return false;
  const newInv = { ...inv, [buffId]: inv[buffId] - 1 };
  if (newInv[buffId] <= 0) delete newInv[buffId];
  const actives = [...(player.activeConsumables ?? [])];
  const existing = actives.find((a: any) => a.buffId === buffId);
  if (existing) {
    existing.remainingSec += def.durationSec;
  } else {
    actives.push({ buffId, remainingSec: def.durationSec });
  }
  set({ player: { ...player, consumableInventory: newInv, activeConsumables: actives } });
  return true;
}

export function addConsumableAction(get: Get, set: Set, buffId: string, count: number): void {
  const player = get().player;
  const inv = { ...(player.consumableInventory ?? {}) };
  inv[buffId] = (inv[buffId] ?? 0) + count;
  set({ player: { ...player, consumableInventory: inv } });
}

// === Rewards ===
export function activateFateBlessingAction(get: Get, set: Set): boolean {
  const state = get();
  if (state.player.tianmingScrolls <= 0) return false;
  const now = Date.now();
  if (state.fateBlessing.active && state.fateBlessing.expiresAt > now) return false;
  const updatedPlayer = { ...state.player, tianmingScrolls: state.player.tianmingScrolls - 1 };
  set({ player: updatedPlayer, fateBlessing: { active: true, expiresAt: now + 2 * 60 * 60 * 1000 } });
  return true;
}

export function claimOnlineRewardAction(get: Get, set: Set, minutes: number): { gold: number; exp: number; pantao: number; desc: string } | null {
  const state = get();
  if (state.onlineRewardsClaimed.includes(minutes)) return null;
  const level = state.player.level;
  const rewards: Record<number, { gold: number; exp: number; pantao: number; desc: string }> = {
    10:  { gold: Math.max(5000, level * 200), exp: Math.max(3000, level * 150), pantao: 0, desc: '在线10分钟奖励' },
    30:  { gold: Math.max(20000, level * 500), exp: Math.max(10000, level * 400), pantao: Math.max(5, Math.floor(level / 20)), desc: '在线30分钟奖励' },
    60:  { gold: Math.max(50000, level * 1000), exp: Math.max(30000, level * 800), pantao: Math.max(15, Math.floor(level / 10)), desc: '在线1小时奖励' },
    120: { gold: Math.max(150000, level * 3000), exp: Math.max(80000, level * 2000), pantao: Math.max(30, Math.floor(level / 5)), desc: '在线2小时奖励' },
    240: { gold: Math.max(500000, level * 8000), exp: Math.max(200000, level * 5000), pantao: Math.max(80, Math.floor(level / 3)), desc: '在线4小时奖励' },
  };
  const r = rewards[minutes];
  if (!r) return null;
  set({
    player: { ...state.player, lingshi: state.player.lingshi + r.gold, exp: state.player.exp + r.exp, pantao: state.player.pantao + r.pantao },
    onlineRewardsClaimed: [...state.onlineRewardsClaimed, minutes],
  });
  return r;
}

export function claimAbyssMilestoneAction(get: Get, set: Set, floor: number): boolean {
  const state = get();
  if (state.claimedAbyssMilestones.includes(floor)) return false;
  const milestone = ABYSS_MILESTONES.find((m: any) => m.floor === floor);
  if (!milestone || state.highestAbyssFloor < floor) return false;
  const p = { ...state.player };
  if (milestone.rewards.lingshi) p.lingshi += milestone.rewards.lingshi;
  if (milestone.rewards.pantao) p.pantao += milestone.rewards.pantao;
  if (milestone.rewards.shards) p.hongmengShards += milestone.rewards.shards;
  if (milestone.rewards.daoPoints) p.daoPoints = (p.daoPoints ?? 0) + milestone.rewards.daoPoints;
  if (milestone.rewards.trialTokens) p.trialTokens = (p.trialTokens ?? 0) + milestone.rewards.trialTokens;
  if (milestone.rewards.tianmingScrolls) p.tianmingScrolls += milestone.rewards.tianmingScrolls;
  set({ player: p, claimedAbyssMilestones: [...state.claimedAbyssMilestones, floor] });
  return true;
}

// === Tutorial ===
export function advanceTutorialAction(get: Get, set: Set): void {
  const { player } = get();
  if (player.tutorialDone) return;
  const next = player.tutorialStep + 1;
  const done = next > 5;
  set({ player: { ...player, tutorialStep: next, tutorialDone: done } });
}

export function skipTutorialAction(get: Get, set: Set): void {
  const { player } = get();
  set({ player: { ...player, tutorialStep: 6, tutorialDone: true } });
}

export function dismissSystemTutorialAction(get: Get, set: Set, id: string): void {
  const { player } = get();
  if (player.systemTutorials.includes(id)) return;
  set({ player: { ...player, systemTutorials: [...player.systemTutorials, id] } });
}

// === Utility ===
export function updatePlayerAction(get: Get, set: Set, partial: Partial<PlayerState>): void {
  set({ player: { ...get().player, ...partial } });
}
