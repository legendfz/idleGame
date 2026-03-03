/**
 * v2.0 Player Store — core game state
 */

import { create } from 'zustand';
import { GameState, PlayerState, CharacterState, ResourceState, JourneyState, SettingsState, EquipSlotV2 } from '../types';
import { CHARACTERS } from '../data/characters';
import { tick as engineTick, getCultivationPerSec, attemptBreakthrough } from '../engine/gameLoop';
import { toDecStr, formatBig, D } from '../utils/bignum';

function makeInitialCharacter(id: string, unlocked: boolean): CharacterState {
  const def = CHARACTERS.find(c => c.id === id);
  return {
    id,
    unlocked,
    level: 1,
    exp: '0',
    stats: {
      attack: String(def?.baseStats.attack ?? 10),
      defense: String(def?.baseStats.defense ?? 5),
      hp: String(def?.baseStats.hp ?? 100),
      maxHp: String(def?.baseStats.hp ?? 100),
      speed: def?.baseStats.speed ?? 1,
      critRate: def?.baseStats.critRate ?? 5,
      critDmg: def?.baseStats.critDmg ?? 1.5,
    },
    equipment: { weapon: null, headgear: null, armor: null, accessory: null, mount: null, treasure: null },
    skillPoints: 0,
    skills: {},
  };
}

function makeInitialState(): GameState {
  return {
    player: {
      name: '取经人',
      realmId: 'fanren',
      realmSubLevel: 1,
      cultivationXp: '0',
      totalCultivation: '0',
      totalPlayTime: 0,
      createdAt: Date.now(),
    },
    characters: [
      makeInitialCharacter('tangseng', true),
      makeInitialCharacter('wukong', true),
      makeInitialCharacter('bajie', false),
      makeInitialCharacter('wujing', false),
      makeInitialCharacter('bailongma', false),
    ],
    activeCharId: 'wukong',
    journey: { currentStage: 1, stageProgress: {}, dailySweepCount: {}, dailyResetDate: '' },
    resources: { gold: '0', lingshi: '0', materials: {}, pills: {}, foyuan: 0 },
    settings: { musicEnabled: true, sfxEnabled: true, autoSave: true },
  };
}

interface PlayerStore {
  game: GameState;
  cpsDisplay: string;

  tick: (dt: number) => void;
  breakthrough: () => { success: boolean; message: string };
  switchCharacter: (charId: string) => void;
  setState: (game: GameState) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  game: makeInitialState(),
  cpsDisplay: '0',

  tick: (dt) => {
    const newGame = engineTick(get().game, dt);
    const cps = getCultivationPerSec(newGame);
    set({ game: newGame, cpsDisplay: formatBig(cps) + '/秒' });
  },

  breakthrough: () => {
    const result = attemptBreakthrough(get().game);
    if (result.success) set({ game: result.newState });
    return { success: result.success, message: result.message };
  },

  switchCharacter: (charId) => {
    const game = get().game;
    const char = game.characters.find(c => c.id === charId);
    if (!char?.unlocked) return;
    set({ game: { ...game, activeCharId: charId } });
  },

  setState: (game) => set({ game }),
  reset: () => set({ game: makeInitialState(), cpsDisplay: '0' }),
}));
