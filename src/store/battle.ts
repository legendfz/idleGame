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
import { useTalentStore } from './talent';
import { useCompanionStore } from './companion';
import { useReincarnationStore } from './reincarnation';
import { usePetStore } from './pet';
import { useSkillStore } from './skill';
import { useStrategyStore } from './strategy';
import { useGuildStore } from './guild';
import { useFestivalStore } from './festival';
import { useAchievementStore } from './achievement';
import { useDailyQuestStore } from './dailyQuest';

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
    const rB = useReincarnationStore.getState().getBuffs();
    const pB = usePetStore.getState().getBuffs();
    const sB = useSkillStore.getState().getAllBuffs();
    const stB = useStrategyStore.getState().getBuffs();
    const totalAtk = (useMilestoneStore.getState().getBuffs().atkPercent || 0)
      + (useTalentStore.getState().getBuffs().atkPercent || 0)
      + (useCompanionStore.getState().getBuffs().atkPercent || 0)
      + (rB.atkPercent || 0) + (pB.atkPercent || 0) + (sB.atkPercent || 0) + (stB.atkPercent || 0);
    const totalCrit = (useTalentStore.getState().getBuffs().critRate || 0)
      + (useCompanionStore.getState().getBuffs().critRate || 0)
      + (rB.critRate || 0) + (sB.critRate || 0) + (stB.critRate || 0);
    const baseAtk = calcAttack(1, realm?.multiplier ?? 1, 0);
    const attack = baseAtk.mul(1 + totalAtk / 100);
    const critRate = 0.05 + totalCrit / 100;

    const { damage, isCrit } = calcClickDamage(attack, 0, critRate, 2.0, battle.comboBuff > 0);
    const newBattle = processClick(battle, damage, isCrit, Date.now());

    usePlayerStore.getState().incrementClicks();
    useDailyQuestStore.getState().addProgress('clicks', 1);
    set({ battle: newBattle });
    return { damage: damage.toString(), isCrit };
  },

  tickBattle: (dtMs) => {
    const { battle } = get();
    if (!battle || battle.status !== 'fighting') return;

    const player = usePlayerStore.getState().player;
    const realm = getRealmConfig(player.realmId);
    const rB2 = useReincarnationStore.getState().getBuffs();
    const pB2 = usePetStore.getState().getBuffs();
    const sB2 = useSkillStore.getState().getAllBuffs();
    const stB2 = useStrategyStore.getState().getBuffs();
    const totalAtk2 = (useMilestoneStore.getState().getBuffs().atkPercent || 0)
      + (useTalentStore.getState().getBuffs().atkPercent || 0)
      + (useCompanionStore.getState().getBuffs().atkPercent || 0)
      + (rB2.atkPercent || 0) + (pB2.atkPercent || 0) + (sB2.atkPercent || 0) + (stB2.atkPercent || 0);
    const totalCrit2 = 0.05 + ((useTalentStore.getState().getBuffs().critRate || 0)
      + (useCompanionStore.getState().getBuffs().critRate || 0)
      + (rB2.critRate || 0) + (sB2.critRate || 0) + (stB2.critRate || 0)) / 100;
    const baseAtk = calcAttack(1, realm?.multiplier ?? 1, 0);
    const attack = baseAtk.mul(1 + totalAtk2 / 100);
    const dps = calcAutoDps(attack, 1.0, 0, totalCrit2, 2.0);

    const newBattle = tickBattle(battle, dtMs, dps);
    set({ battle: newBattle });

    if (newBattle.status === 'victory') {
      usePlayerStore.getState().incrementKills(newBattle.killCount);
      useDailyQuestStore.getState().addProgress('kills', newBattle.killCount);
      useDailyQuestStore.getState().addProgress('stages', 1);
      // Boss击杀获得功德 10-50 + 悟道值 5-15
      useReincarnationStore.getState().addMerit(10 + Math.floor(Math.random() * 41));
      useSkillStore.getState().addWudao(5 + Math.floor(Math.random() * 11));
      useGuildStore.getState().addQuestProgress('kills', newBattle.killCount);
      useFestivalStore.getState().addScore('kills', newBattle.killCount);
    }
  },

  endBattle: () => set({ battle: null }),
}));
