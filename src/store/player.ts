/**
 * PlayerStore — 玩家状态（修为、境界、资源）
 */
import { create } from 'zustand';
import Decimal from 'break_infinity.js';
import { bn, ZERO } from '../engine/bignum';
import { getXiuweiPerSecond } from '../engine/idle';
import { doBreakthrough } from '../engine/breakthrough';
import { getRealmConfig, getCharacterConfig } from '../data/config';
import { formatBigNum } from '../engine/bignum';
import { useEquipStore } from './equipment';
import { calcEquipBonusPercent } from '../engine/equipment';
import { useMilestoneStore } from './milestone';
import { useTalentStore } from './talent';
import { useCompanionStore } from './companion';
import { useReincarnationStore } from './reincarnation';
import { useEventStore } from './event';

export interface PlayerState {
  xiuwei: string;         // Decimal string
  coins: string;
  lingshi: string;
  realmId: string;
  realmLevel: number;     // 1-9
  activeCharId: string;   // 当前主控角色
  totalXiuwei: string;
  materials: Record<string, number>; // materialId -> count
  lastOnlineAt: number;
  createdAt: number;
  playTime: number;       // seconds
  totalClicks: number;
  totalKills: number;
  totalBreakthroughs: number;
  prestigeCount: number;
}

interface PlayerStore {
  player: PlayerState;
  xpsDisplay: string;

  tick: (dt: number) => void;
  addXiuwei: (amount: Decimal) => void;
  addCoins: (amount: Decimal) => void;
  addLingshi: (amount: number) => void;
  spendCoins: (amount: Decimal) => boolean;
  addMaterial: (id: string, count: number) => void;
  switchCharacter: (charId: string) => void;
  breakthrough: () => { success: boolean; message: string; unlockMessage?: string };
  incrementClicks: () => void;
  incrementKills: (count?: number) => void;
  setLastOnline: (t: number) => void;
  resetForPrestige: (startRealmId: string) => void;
  loadState: (state: PlayerState) => void;
  getState: () => PlayerState;
}

function createInitialPlayer(): PlayerState {
  return {
    xiuwei: '0',
    coins: '0',
    lingshi: '0',
    realmId: 'fanren',
    realmLevel: 1,
    activeCharId: 'wukong',
    totalXiuwei: '0',
    materials: {},
    lastOnlineAt: Date.now(),
    createdAt: Date.now(),
    playTime: 0,
    totalClicks: 0,
    totalKills: 0,
    totalBreakthroughs: 0,
    prestigeCount: 0,
  };
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player: createInitialPlayer(),
  xpsDisplay: '0/秒',

  tick: (dt) => {
    const { player } = get();

    // BUG-03+04 fix: 计算装备加成 + 角色被动加成
    const equipItems = useEquipStore.getState().getEquippedItems(player.activeCharId);
    const equipBonus = calcEquipBonusPercent(equipItems);
    const charConfig = getCharacterConfig(player.activeCharId);
    const teamBonus = charConfig?.passive.effect.type === 'xiuweiBonus'
      ? (charConfig.passive.effect.value ?? 0) : 0;

    // 里程碑 + 天赋 + 伙伴 buff 汇总
    const msBuffs = useMilestoneStore.getState().getBuffs();
    const talentBuffs = useTalentStore.getState().getBuffs();
    const companionBuffs = useCompanionStore.getState().getBuffs();
    const reinBuffs = useReincarnationStore.getState().getBuffs();
    const totalXiuweiBonus = (msBuffs.xiuweiPercent || 0) + (talentBuffs.xiuweiPercent || 0) + (companionBuffs.xiuweiPercent || 0) + (reinBuffs.xiuweiPercent || 0);
    const xps = getXiuweiPerSecond(player.realmId, equipBonus.atkPercent, teamBonus, totalXiuweiBonus);
    const gain = xps.mul(dt);
    const newXiuwei = bn(player.xiuwei).add(gain);
    const newTotal = bn(player.totalXiuwei).add(gain);

    set({
      player: {
        ...player,
        xiuwei: newXiuwei.toString(),
        totalXiuwei: newTotal.toString(),
        playTime: player.playTime + dt,
        lastOnlineAt: Date.now(),
      },
      xpsDisplay: formatBigNum(xps) + '/秒',
    });
  },

  addXiuwei: (amount) => {
    const { player } = get();
    set({
      player: {
        ...player,
        xiuwei: bn(player.xiuwei).add(amount).toString(),
        totalXiuwei: bn(player.totalXiuwei).add(amount).toString(),
      },
    });
  },

  addCoins: (amount) => {
    const { player } = get();
    const coinBonus = (useMilestoneStore.getState().getBuffs().coinPercent || 0)
      + (useTalentStore.getState().getBuffs().coinPercent || 0)
      + (useCompanionStore.getState().getBuffs().coinPercent || 0)
      + (useReincarnationStore.getState().getBuffs().coinPercent || 0);
    const boosted = coinBonus > 0 ? amount.mul(1 + coinBonus / 100) : amount;
    set({ player: { ...player, coins: bn(player.coins).add(boosted).toString() } });
  },

  addLingshi: (amount) => {
    const { player } = get();
    set({ player: { ...player, lingshi: bn(player.lingshi).add(amount).toString() } });
  },

  spendCoins: (amount) => {
    const { player } = get();
    const current = bn(player.coins);
    if (current.lt(amount)) return false;
    set({ player: { ...player, coins: current.sub(amount).toString() } });
    return true;
  },

  addMaterial: (id, count) => {
    const { player } = get();
    const newMats = { ...player.materials, [id]: (player.materials[id] ?? 0) + count };
    set({ player: { ...player, materials: newMats } });
  },

  breakthrough: () => {
    const { player } = get();
    const result = doBreakthrough(bn(player.xiuwei), player.realmId, player.realmLevel, player.materials);
    if (result.success) {
      // 扣除材料
      const newMats = { ...player.materials };
      for (const mat of result.materialsConsumed) {
        newMats[mat.id] = (newMats[mat.id] ?? 0) - mat.count;
        if (newMats[mat.id] <= 0) delete newMats[mat.id];
      }
      set({
        player: {
          ...player,
          xiuwei: bn(player.xiuwei).sub(result.xiuweiConsumed).toString(),
          realmId: result.newRealmId,
          realmLevel: result.newRealmLevel,
          materials: newMats,
          totalBreakthroughs: player.totalBreakthroughs + 1,
        },
      });
    }
    return { success: result.success, message: result.message, unlockMessage: result.unlockMessage };
  },

  switchCharacter: (charId: string) => set(s => ({ player: { ...s.player, activeCharId: charId } })),
  incrementClicks: () => set(s => ({ player: { ...s.player, totalClicks: s.player.totalClicks + 1 } })),
  incrementKills: (count = 1) => set(s => ({ player: { ...s.player, totalKills: s.player.totalKills + count } })),
  setLastOnline: (t) => set(s => ({ player: { ...s.player, lastOnlineAt: t } })),

  resetForPrestige: (startRealmId) => {
    const { player } = get();
    set({
      player: {
        ...createInitialPlayer(),
        realmId: startRealmId,
        createdAt: player.createdAt,
        prestigeCount: player.prestigeCount + 1,
        totalXiuwei: player.totalXiuwei, // keep for foyuan calc
      },
    });
  },

  loadState: (state) => set({ player: state }),
  getState: () => get().player,
}));
