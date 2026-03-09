/**
 * v189.0 — Auto-action barrel + orchestrator
 * Split from 899-line monolith into 4 focused modules:
 *   autoEquip.ts    — enhance/reforge/socket/synth/decompose/refine
 *   autoResource.ts — sanctuary/affinity/pets/perks/scrolls/signIn
 *   autoProgress.ts — farm/sweep/breakthrough/reincarnate/transcend/explore/trial/ascension/weeklyBoss
 *   autoMisc.ts     — fate/wheel/titles/story/dailyChallenges/abyssMilestones/lucky/awaken/seasonPass
 */
import { PlayerState, BattleState, EquipmentItem } from '../types';

// ─── Shared tick context type ───
export interface TickContext {
  state: any;
  get: () => any;
  set: (partial: any) => void;
  updatedPlayer: PlayerState;
  updatedBattle: BattleState;
  updatedInventory: EquipmentItem[];
  log: any[];
  addLog: (log: any[], msg: string, type: 'attack' | 'crit' | 'kill' | 'drop' | 'levelup' | 'info' | 'boss') => any[];
  totalPlayTime: number;
}

// ─── Re-exports from sub-modules ───
export { autoEnhanceGear, autoReforgeGear, autoSocketGems, autoSynthEquip, autoDecompose, autoRefineEquipped } from './autoEquip';
export { autoUpgradeSanctuary, autoGiftAffinity, autoManagePets, autoBuyPerksAndAwakening, autoBuyScrolls, autoBuyTranscendPerks, autoSignIn } from './autoResource';
export { autoFarmPush, autoSweepChapters, autoBreakthrough, autoReincarnate, autoTranscend, autoExploreDungeons, autoQuickTrial, autoAscensionChallenge, autoWeeklyBoss } from './autoProgress';
export { autoActivateFate, autoSpinWheel, checkTitleUnlocks, checkStoryTriggers, autoClaimDailyChallenges, autoClaimAbyssMilestones, checkLuckyMoment, autoAwaken, autoClaimSeasonPass } from './autoMisc';

// ─── Import for orchestrator ───
import { autoEnhanceGear, autoReforgeGear, autoSocketGems, autoSynthEquip, autoDecompose, autoRefineEquipped } from './autoEquip';
import { autoUpgradeSanctuary, autoGiftAffinity, autoManagePets, autoBuyPerksAndAwakening, autoBuyScrolls, autoBuyTranscendPerks, autoSignIn } from './autoResource';
import { autoFarmPush, autoSweepChapters, autoBreakthrough, autoReincarnate, autoTranscend, autoExploreDungeons, autoQuickTrial, autoAscensionChallenge, autoWeeklyBoss } from './autoProgress';
import { autoActivateFate, autoSpinWheel, checkTitleUnlocks, checkStoryTriggers, autoClaimDailyChallenges, autoClaimAbyssMilestones, checkLuckyMoment, autoAwaken, autoClaimSeasonPass } from './autoMisc';

/** Run all auto-actions in sequence. Returns true if tick should exit early (reincarnate/transcend). */
export function runAllAutoActions(ctx: TickContext): boolean {
  checkLuckyMoment(ctx);
  autoUpgradeSanctuary(ctx);
  autoGiftAffinity(ctx);
  autoFarmPush(ctx);
  autoSweepChapters(ctx);
  autoActivateFate(ctx);
  autoSpinWheel(ctx);
  autoQuickTrial(ctx);
  autoAscensionChallenge(ctx);
  autoEnhanceGear(ctx);
  autoReforgeGear(ctx);
  autoSocketGems(ctx);
  autoManagePets(ctx);
  autoBuyPerksAndAwakening(ctx);
  autoSynthEquip(ctx);
  autoRefineEquipped(ctx);
  if (autoReincarnate(ctx)) return true;
  if (autoTranscend(ctx)) return true;
  autoBuyTranscendPerks(ctx);
  autoExploreDungeons(ctx);
  checkTitleUnlocks(ctx);
  checkStoryTriggers(ctx);
  autoDecompose(ctx);
  autoBreakthrough(ctx);
  autoWeeklyBoss(ctx);
  autoClaimDailyChallenges(ctx);
  autoClaimAbyssMilestones(ctx);
  autoSignIn(ctx);
  autoBuyScrolls(ctx);
  autoAwaken(ctx);
  autoClaimSeasonPass(ctx);
  return false;
}
