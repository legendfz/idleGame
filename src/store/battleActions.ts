// v136.0: Battle actions extracted from gameStore
import { PlayerState, BattleState, BattleLogEntry, EquipmentItem, FloatingText } from '../types';
import { REALMS } from '../data/realms';
import { sfx } from '../engine/audio';
import { addLog, calcEffectiveStats } from './gameStore';
import { getEquipEffectiveStat } from '../data/equipment';

let floatIdCounter = 100000; // offset to avoid collision with gameStore

function calcClickPower(baseClick: number, treasure: EquipmentItem | null): number {
  let cp = baseClick;
  if (treasure) cp += Math.floor(getEquipEffectiveStat(treasure) * 0.3);
  return Math.max(1, cp);
}

export function clickAttackAction(get: () => any, set: (partial: any) => void) {
  const { player, battle, equippedTreasure, floatingTexts } = get();
  if (!battle.currentEnemy) return;
  const enemy = { ...battle.currentEnemy };
  const cp = calcClickPower(player.clickPower, equippedTreasure);
  enemy.hp -= cp;
  sfx.hit();
  const log = addLog([...battle.log], `点击 > ${enemy.name}  -${cp}`, 'attack');
  const newFloat: FloatingText = {
    id: floatIdCounter++,
    text: `点击 ${cp}`,
    type: 'click',
    timestamp: Date.now(),
  };
  set({
    battle: { ...battle, currentEnemy: enemy.hp <= 0 ? { ...enemy, hp: 0 } : enemy, log },
    floatingTexts: [...floatingTexts, newFloat].slice(-10),
  });
}

export function attemptBreakthroughAction(get: () => any, set: (partial: any) => void) {
  const { player, battle } = get();
  const nextRealm = REALMS[player.realmIndex + 1];
  if (!nextRealm) return;
  if (player.level < nextRealm.levelReq || player.pantao < nextRealm.pantaoReq) return;
  if (battle.tribulation?.active) return;

  const tribNames = ['雷劫', '火劫', '风劫', '心魔', '天劫', '九天雷罚', '混沌劫', '灭世天劫', '鸿蒙劫'];
  const tribEmojis = ['[雷]', '[火]', '[风]', '[魔]', '[劫]', '[雷]', '[混]', '[灭]', '[鸿]'];
  const ri = player.realmIndex;
  const tribHp = Math.floor(player.stats.maxHp * (3 + ri * 2));
  const tribDef = Math.floor(player.level * 5 * (1 + ri * 0.15));
  const tribAtk = Math.floor(player.stats.maxHp * 0.08 * (1 + ri * 0.2));
  const tribName = tribNames[Math.min(ri, tribNames.length - 1)];
  const tribEmoji = tribEmojis[Math.min(ri, tribEmojis.length - 1)];

  set({
    player: {
      ...player,
      pantao: player.pantao - nextRealm.pantaoReq,
    },
    battle: {
      ...battle,
      currentEnemy: {
        name: tribName,
        emoji: tribEmoji,
        hp: tribHp,
        maxHp: tribHp,
        defense: tribDef,
        lingshiDrop: 0,
        expDrop: 0,
        pantaoDrop: Math.floor(nextRealm.pantaoReq * 0.3),
        isBoss: true,
      },
      isBossWave: true,
      tribulation: {
        active: true,
        realmIndex: player.realmIndex + 1,
        timer: 60 + ri * 10,
      },
      log: addLog(battle.log, `⚡ 天劫降临！「${tribName}」— 在 ${60 + ri * 10}秒内击败它！`, 'boss'),
    },
  });
  sfx.bossAppear();
}
