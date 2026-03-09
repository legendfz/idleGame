/**
 * v189.0 — Auto-resource actions (sanctuary/affinity/pets/perks/awakening/scrolls/transcendPerks)
 * Extracted from tickAutoActions.ts
 */
import { useSanctuaryStore } from './sanctuaryStore';
import { BUILDINGS as SANCT_BUILDINGS, getUpgradeCost as getSanctUpgradeCost } from '../engine/sanctuary';
import { useAffinityStore } from './affinityStore';
import { AFFINITY_NPCS as AFFINITY_NPCS_LIST } from '../engine/affinity';
import { REINC_PERKS } from '../data/reincarnation';
import { TRANSCEND_PERKS } from '../data/transcendence';
import { AWAKENING_PATHS, totalAwakeningPoints, AWAKENING_UNLOCK_REINC } from '../data/awakening';
import { PETS as PETS_DATA, EVOLUTION_STAGES as EVOLUTION_STAGES_DATA } from '../data/pets';
import { SCROLL_PRICES } from '../data/equipment';
import { useDailyStore } from './dailyStore';
import type { TickContext } from './tickAutoActions';

export { autoUpgradeSanctuary, autoGiftAffinity, autoManagePets, autoBuyPerksAndAwakening, autoBuyScrolls, autoBuyTranscendPerks, autoSignIn };

function autoUpgradeSanctuary(ctx: TickContext) {
  if (!ctx.state.autoSanctuary) return;
  const sanctStore = useSanctuaryStore.getState();
  const sanctLevels = sanctStore.sanctuary.levels;
  const upgradeable = SANCT_BUILDINGS
    .map(b => ({ id: b.id, cost: getSanctUpgradeCost(b, sanctLevels[b.id] ?? 0), lv: sanctLevels[b.id] ?? 0 }))
    .filter(x => x.lv < 10 && x.cost <= ctx.updatedPlayer.lingshi)
    .sort((a, b) => a.cost - b.cost);
  if (upgradeable.length > 0) {
    const best = upgradeable[0];
    const res = sanctStore.upgrade(best.id, ctx.updatedPlayer.lingshi);
    if (res) ctx.updatedPlayer.lingshi -= res.cost;
  }
}

function autoGiftAffinity(ctx: TickContext) {
  if (!ctx.state.autoAffinity || ctx.totalPlayTime % 10 !== 0) return;
  const affStore = useAffinityStore.getState();
  for (const npc of AFFINITY_NPCS_LIST) {
    const tier = ctx.updatedPlayer.lingshi >= 10000 ? 2 : ctx.updatedPlayer.lingshi >= 1000 ? 1 : 0;
    const cost = [100, 1000, 10000][tier];
    if (ctx.updatedPlayer.lingshi >= cost) {
      const result = affStore.gift(npc.id, ctx.updatedPlayer.lingshi, tier);
      if (result) ctx.updatedPlayer.lingshi -= result.cost;
    }
  }
}

function autoManagePets(ctx: TickContext) {
  if (!ctx.state.autoFeedPet || ctx.totalPlayTime === 0) return;
  if (ctx.totalPlayTime % 20 === 0 && ctx.updatedPlayer.activePetId) {
    const pet = PETS_DATA.find(p => p.id === ctx.updatedPlayer.activePetId);
    if (pet) {
      const currentLv = ctx.updatedPlayer.petLevels?.[pet.id] ?? 0;
      if (currentLv < pet.maxLevel) {
        const cost = pet.feedCost(currentLv);
        if (ctx.updatedPlayer.lingshi >= cost) {
          ctx.updatedPlayer.lingshi -= cost;
          ctx.updatedPlayer.petLevels = { ...ctx.updatedPlayer.petLevels, [pet.id]: currentLv + 1 };
        }
      }
    }
  }
  if (ctx.totalPlayTime % 60 === 0) {
    for (const pet of PETS_DATA) {
      const lv = ctx.updatedPlayer.petLevels?.[pet.id] ?? 0;
      if (lv < pet.maxLevel) continue;
      const stage = ctx.updatedPlayer.petEvolutions?.[pet.id] ?? 0;
      if (stage >= 3) continue;
      const next = EVOLUTION_STAGES_DATA[stage + 1];
      if (ctx.updatedPlayer.lingshi >= next.cost.lingshi && ctx.updatedPlayer.pantao >= next.cost.pantao && ctx.updatedPlayer.hongmengShards >= next.cost.hongmengShards) {
        ctx.updatedPlayer.lingshi -= next.cost.lingshi;
        ctx.updatedPlayer.pantao -= next.cost.pantao;
        ctx.updatedPlayer.hongmengShards -= next.cost.hongmengShards;
        ctx.updatedPlayer.petEvolutions = { ...(ctx.updatedPlayer.petEvolutions ?? {}), [pet.id]: stage + 1 };
        ctx.log = ctx.addLog(ctx.log, `${pet.emoji}${pet.name} 自动进化为【${next.name}】！`, 'levelup');
        break;
      }
    }
  }
  if (ctx.totalPlayTime % 60 === 0) {
    let bestPet: string | null = null;
    let bestScore = -1;
    for (const pet of PETS_DATA) {
      if (ctx.updatedPlayer.level < pet.unlockLevel) continue;
      const lv = ctx.updatedPlayer.petLevels?.[pet.id] ?? 0;
      if (lv <= 0) continue;
      const b = pet.bonuses(lv);
      const score = (b.atkPct ?? 0) + (b.hpPct ?? 0) * 0.3 + (b.expPct ?? 0) * 0.5 + (b.goldPct ?? 0) * 0.3 + (b.critRate ?? 0) * 2 + (b.critDmg ?? 0) * 0.5 + (b.dropRate ?? 0) * 0.5;
      if (score > bestScore) { bestScore = score; bestPet = pet.id; }
    }
    if (bestPet && bestPet !== ctx.updatedPlayer.activePetId) {
      ctx.updatedPlayer.activePetId = bestPet;
    }
  }
}

function autoBuyPerksAndAwakening(ctx: TickContext) {
  if (!ctx.state.autoBuyPerks || ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  if (ctx.updatedPlayer.daoPoints > 0) {
    let bought = true;
    while (bought) {
      bought = false;
      let cheapest: { id: string; cost: number } | null = null;
      for (const perk of REINC_PERKS) {
        const lv = ctx.updatedPlayer.reincPerks?.[perk.id] ?? 0;
        if (lv >= perk.maxLevel) continue;
        if (!cheapest || perk.costPerLevel < cheapest.cost) cheapest = { id: perk.id, cost: perk.costPerLevel };
      }
      if (cheapest && ctx.updatedPlayer.daoPoints >= cheapest.cost) {
        ctx.updatedPlayer.daoPoints -= cheapest.cost;
        ctx.updatedPlayer.reincPerks = { ...ctx.updatedPlayer.reincPerks, [cheapest.id]: (ctx.updatedPlayer.reincPerks?.[cheapest.id] ?? 0) + 1 };
        bought = true;
      }
    }
  }
  const reincCount = ctx.updatedPlayer.reincarnations ?? 0;
  if (reincCount >= AWAKENING_UNLOCK_REINC) {
    const awState = ctx.updatedPlayer.awakening ?? { unlockedNodes: [] as string[], selectedPath: null };
    const unlocked = new Set<string>(awState.unlockedNodes ?? []);
    const totalPts = totalAwakeningPoints(reincCount);
    const spentPts = (awState.unlockedNodes ?? []).reduce((sum: number, nid: string) => {
      for (const path of AWAKENING_PATHS) { const node = path.nodes.find(n => n.id === nid); if (node) return sum + node.cost; }
      return sum;
    }, 0);
    let avail = totalPts - spentPts;
    let changed = false;
    let found = true;
    const preferredPathId = awState.selectedPath;
    const sortedPaths = preferredPathId
      ? [AWAKENING_PATHS.find(p => p.id === preferredPathId)!, ...AWAKENING_PATHS.filter(p => p.id !== preferredPathId)]
      : AWAKENING_PATHS;
    while (found && avail > 0) {
      found = false;
      let cheapestNode: { id: string; cost: number } | null = null;
      for (const path of sortedPaths) {
        if (!path) continue;
        for (const node of path.nodes) {
          if (unlocked.has(node.id)) continue;
          if (node.requires && !unlocked.has(node.requires)) continue;
          if (node.cost <= avail && (!cheapestNode || node.cost < cheapestNode.cost)) {
            cheapestNode = { id: node.id, cost: node.cost };
            if (preferredPathId && path.id === preferredPathId) break;
          }
        }
        if (cheapestNode && preferredPathId && path.id === preferredPathId) break;
      }
      if (cheapestNode) { unlocked.add(cheapestNode.id); avail -= cheapestNode.cost; changed = true; found = true; }
    }
    if (changed) ctx.updatedPlayer.awakening = { ...awState, unlockedNodes: Array.from(unlocked) };
  }
}

function autoBuyTranscendPerks(ctx: TickContext) {
  if (!ctx.state.autoBuyTranscendPerks || ctx.totalPlayTime % 90 !== 0 || ctx.totalPlayTime === 0) return;
  if ((ctx.updatedPlayer.transcendPoints ?? 0) <= 0) return;
  let bought = true;
  while (bought) {
    bought = false;
    let cheapest: { id: string; cost: number } | null = null;
    for (const perk of TRANSCEND_PERKS) {
      const lv = (ctx.updatedPlayer.transcendPerks ?? {})[perk.id] ?? 0;
      if (lv >= perk.maxLevel) continue;
      if (!cheapest || perk.costPerLevel < cheapest.cost) cheapest = { id: perk.id, cost: perk.costPerLevel };
    }
    if (cheapest && (ctx.updatedPlayer.transcendPoints ?? 0) >= cheapest.cost) {
      ctx.updatedPlayer.transcendPoints = (ctx.updatedPlayer.transcendPoints ?? 0) - cheapest.cost;
      ctx.updatedPlayer.transcendPerks = { ...(ctx.updatedPlayer.transcendPerks ?? {}), [cheapest.id]: ((ctx.updatedPlayer.transcendPerks ?? {})[cheapest.id] ?? 0) + 1 };
      bought = true;
    }
  }
}

function autoBuyScrolls(ctx: TickContext) {
  if (!ctx.state.autoBuyScrolls || ctx.totalPlayTime % 120 !== 0 || ctx.totalPlayTime === 0) return;
  const scrollTypes: Array<{ key: 'tianming' | 'protect' | 'lucky'; field: 'tianmingScrolls' | 'protectScrolls' | 'luckyScrolls' }> = [
    { key: 'lucky', field: 'luckyScrolls' },
    { key: 'protect', field: 'protectScrolls' },
    { key: 'tianming', field: 'tianmingScrolls' },
  ];
  let bought = 0;
  for (const s of scrollTypes) {
    const price = SCROLL_PRICES[s.key];
    let count = 0;
    while (count < 5 && ctx.updatedPlayer.pantao >= price + 200) {
      ctx.updatedPlayer.pantao -= price;
      (ctx.updatedPlayer as any)[s.field] = ((ctx.updatedPlayer as any)[s.field] ?? 0) + 1;
      count++;
      bought++;
    }
  }
  if (bought > 0) ctx.log = ctx.addLog(ctx.log, `📜 自动购买 ${bought} 张卷轴`, 'info');
}

function autoSignIn(ctx: TickContext) {
  if (ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  try {
    const daily = useDailyStore.getState();
    daily.checkCanSignIn();
    if (daily.canSignIn) {
      const result = daily.signIn();
      if (result) {
        const r = result.reward;
        if (r.lingshi) ctx.updatedPlayer.lingshi += r.lingshi;
        if (r.pantao) ctx.updatedPlayer.pantao = (ctx.updatedPlayer.pantao ?? 0) + r.pantao;
        if (r.shards) ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + r.shards;
        if (r.consumable) {
          const inv: Record<string, number> = (ctx.updatedPlayer as any).consumables ?? {};
          inv[r.consumable.id] = (inv[r.consumable.id] ?? 0) + r.consumable.count;
          (ctx.updatedPlayer as any).consumables = inv;
        }
        if (r.scrollType === 'tianming') ctx.updatedPlayer.tianmingScrolls = (ctx.updatedPlayer.tianmingScrolls ?? 0) + 1;
        if (r.scrollType === 'lucky') ctx.updatedPlayer.luckyScrolls = (ctx.updatedPlayer.luckyScrolls ?? 0) + 1;
        ctx.log = ctx.addLog(ctx.log, `📅 自动签到：${r.desc}`, 'info');
      }
    }
  } catch {}
}
