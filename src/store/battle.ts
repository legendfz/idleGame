/**
 * BattleStore — 战斗状态管理
 */
import { create } from 'zustand';
import {
  BattleRuntimeState, initBattle, processClick, tickBattle,
  calcClickDamage, calcAutoDps,
} from '../engine/battle';
import { bn, ZERO } from '../engine/bignum';
import { calcAttack } from '../engine/formulas';
import { getRealmConfig } from '../data/config';
import { usePlayerStore } from './player';
import { useMilestoneStore } from './milestone';

interface BattleStore {
  battle: BattleRuntimeState | null;

  startBattle: (stageId: number) => void;
  click: (x?: number, y?: number) => { damage: string; isCrit: boolean } | null;
  tickBattle: (dtMs: number) => void;
  endBattle: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  battle: null,

  startBattle: (stageId) => {
    const battle = initBattle(stageId);
    set({ battle });
  },

  click: () => {
    const { battle } = get();
    if (!battle || battle.status !== 'fighting') return null;

    const player = usePlayerStore.getState().player;
    const realm = getRealmConfig(player.realmId);
    const msBuffs = useMilestoneStore.getState().getBuffs();
    const baseAtk = calcAttack(1, realm?.multiplier ?? 1, 0);
    const attack = baseAtk.mul(1 + msBuffs.atkPercent / 100);
    const critRate = 0.05;

    const { damage, isCrit } = calcClickDamage(attack, 0, critRate, 2.0, battle.comboBuff > 0);
    const newBattle = processClick(battle, damage, isCrit, Date.now());

    usePlayerStore.getState().incrementClicks();
    set({ battle: newBattle });
    return { damage: damage.toString(), isCrit };
  },

  tickBattle: (dtMs) => {
    const { battle } = get();
    if (!battle || battle.status !== 'fighting') return;

    const player = usePlayerStore.getState().player;
    const realm = getRealmConfig(player.realmId);
    const msBuffs = useMilestoneStore.getState().getBuffs();
    const baseAtk = calcAttack(1, realm?.multiplier ?? 1, 0);
    const attack = baseAtk.mul(1 + msBuffs.atkPercent / 100);
    const dps = calcAutoDps(attack, 1.0, 0, 0.05, 2.0);

    const newBattle = tickBattle(battle, dtMs, dps);
    set({ battle: newBattle });

    if (newBattle.status === 'victory') {
      usePlayerStore.getState().incrementKills(newBattle.killCount);
    }
  },

  endBattle: () => set({ battle: null }),
}));
