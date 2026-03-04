/**
 * v2.0 Stage Configuration — 81 stages (placeholder, Chapter 1 detailed)
 */

import { StageConfig } from '../types/battle';

// Chapter 1: 初出长安 (stages 1-9)
export const STAGES: StageConfig[] = [
  {
    stage: 1, chapter: 1, name: '长安城外',
    waves: [
      { type: 'minion', enemyName: '山贼', enemyIcon: '[刃]', count: 3, hp: '50', attack: '5', defense: '2' },
    ],
    boss: {
      id: 'tiger_spirit_1', name: '虎妖', icon: '[虎]',
      hp: '500', attack: '15', defense: '5',
      skills: [{ id: 's1', name: '虎啸', damage: '30', cooldown: 8, type: 'aoe', warning: '虎妖仰天长啸！' }],
      phases: [{ hpThreshold: 1, attackMultiplier: 1, description: '虎妖出没' }],
      timeLimit: 120,
    },
    rewards: {
      gold: ['100', '200'], exp: ['50', '80'], equipDropChance: 0.2, equipQualityMin: 'common',
      firstClear: { gold: '500', lingshi: '10' },
    },
    sweepUnlockStars: 3, recommendedPower: '50',
  },
  {
    stage: 2, chapter: 1, name: '荒野小径',
    waves: [
      { type: 'minion', enemyName: '狼妖', enemyIcon: '[狼]', count: 4, hp: '80', attack: '8', defense: '3' },
    ],
    boss: {
      id: 'wolf_king', name: '狼王', icon: '[狼]',
      hp: '800', attack: '20', defense: '8',
      skills: [{ id: 's2', name: '狼嚎', damage: '40', cooldown: 7, type: 'single', warning: '狼王凶光毕露！' }],
      phases: [{ hpThreshold: 1, attackMultiplier: 1, description: '狼王出击' }],
      timeLimit: 120,
    },
    rewards: {
      gold: ['150', '300'], exp: ['80', '120'], equipDropChance: 0.25, equipQualityMin: 'common',
      firstClear: { gold: '800', lingshi: '15' },
    },
    sweepUnlockStars: 3, recommendedPower: '80',
  },
  {
    stage: 3, chapter: 1, name: '黑风山',
    waves: [
      { type: 'minion', enemyName: '黑风妖', enemyIcon: '[风]', count: 4, hp: '120', attack: '12', defense: '5' },
      { type: 'elite', enemyName: '黑熊将', enemyIcon: '[熊]', count: 1, hp: '400', attack: '25', defense: '12' },
    ],
    boss: {
      id: 'black_bear', name: '黑熊精', icon: '[熊]',
      hp: '2000', attack: '35', defense: '15',
      skills: [
        { id: 's3a', name: '熊掌拍', damage: '80', cooldown: 6, type: 'single', warning: '黑熊精举起巨掌！' },
        { id: 's3b', name: '黑风术', damage: '50', cooldown: 10, type: 'aoe', warning: '黑风呼啸而来！' },
      ],
      phases: [
        { hpThreshold: 1, attackMultiplier: 1, description: '黑熊精现身' },
        { hpThreshold: 0.5, attackMultiplier: 1.5, description: '狂暴：黑熊精暴怒！' },
      ],
      timeLimit: 180,
      recruitable: { condition: '击败3次', effect: '防御+10%' },
    },
    rewards: {
      gold: ['300', '500'], exp: ['150', '250'], equipDropChance: 0.3, equipQualityMin: 'common',
      firstClear: { gold: '1500', lingshi: '25' },
    },
    sweepUnlockStars: 3, recommendedPower: '200',
  },
];

// TODO: Stages 4-81 to be added incrementally

export function getStage(num: number): StageConfig | undefined {
  return STAGES.find(s => s.stage === num);
}

export function getStagesByChapter(chapter: number): StageConfig[] {
  return STAGES.filter(s => s.chapter === chapter);
}
