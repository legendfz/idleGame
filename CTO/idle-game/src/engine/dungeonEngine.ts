/**
 * v1.3 副本战斗引擎
 * requestAnimationFrame 驱动的实时战斗
 */

import { DungeonConfig, DungeonWave, BossSkill } from '../data/dungeons';
import { Stats } from '../types';

export interface DungeonEnemy {
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  skills?: BossSkill[];
  phase?: number;
  isBoss: boolean;
}

export interface DungeonBattleLog {
  id: number;
  text: string;
  type: 'attack' | 'crit' | 'skill' | 'dodge' | 'kill' | 'phase' | 'info' | 'warn';
  timestamp: number;
}

export interface DungeonBattleState {
  dungeonId: string;
  status: 'idle' | 'fighting' | 'victory' | 'defeat';
  // Wave progress
  currentWaveIndex: number;
  currentEnemyIndex: number;
  totalWaves: number;
  // Current enemy
  enemy: DungeonEnemy | null;
  // Player HP in this battle
  playerHp: number;
  playerMaxHp: number;
  // Timing
  elapsed: number;
  timeLimit: number;
  lastTick: number;
  // Auto attack accumulator
  attackAccumulator: number;
  // Boss mechanics
  activeSkillWarning: { skill: BossSkill; timeLeft: number } | null;
  dodgeAvailable: boolean;
  dodgeActive: boolean;
  bossSkillCooldowns: Map<string, number>;
  // Stats
  totalDamageDealt: number;
  totalDamageTaken: number;
  killCount: number;
  dodgeCount: number;
  // Log
  log: DungeonBattleLog[];
}

let logId = 0;

function addLog(log: DungeonBattleLog[], text: string, type: DungeonBattleLog['type']): DungeonBattleLog[] {
  const entry: DungeonBattleLog = { id: ++logId, text, type, timestamp: Date.now() };
  return [...log.slice(-30), entry];
}

/**
 * Initialize battle state from dungeon config
 */
export function initDungeonBattle(dungeon: DungeonConfig): DungeonBattleState {
  const allWaves = buildWaveEnemies(dungeon);
  const firstEnemy = allWaves.length > 0 ? allWaves[0] : null;

  return {
    dungeonId: dungeon.id,
    status: 'fighting',
    currentWaveIndex: 0,
    currentEnemyIndex: 0,
    totalWaves: allWaves.length,
    enemy: firstEnemy,
    playerHp: 0, // set by caller from player stats
    playerMaxHp: 0,
    elapsed: 0,
    timeLimit: dungeon.timeLimit,
    lastTick: 0,
    attackAccumulator: 0,
    activeSkillWarning: null,
    dodgeAvailable: false,
    dodgeActive: false,
    bossSkillCooldowns: new Map(),
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    killCount: 0,
    dodgeCount: 0,
    log: [{ id: ++logId, text: `⚔️ 进入副本：${dungeon.name}`, type: 'info', timestamp: Date.now() }],
  };
}

/**
 * Flatten dungeon waves + boss into a sequential enemy list
 */
function buildWaveEnemies(dungeon: DungeonConfig): DungeonEnemy[] {
  const enemies: DungeonEnemy[] = [];

  for (const wave of dungeon.waves) {
    for (let i = 0; i < wave.count; i++) {
      enemies.push({
        name: wave.enemyName,
        icon: wave.enemyIcon,
        hp: wave.hp,
        maxHp: wave.hp,
        attack: wave.attack,
        defense: wave.defense,
        isBoss: false,
      });
    }
  }

  // Boss as final enemy
  const b = dungeon.boss;
  enemies.push({
    name: b.name,
    icon: b.icon,
    hp: b.hp,
    maxHp: b.hp,
    attack: b.attack,
    defense: b.defense,
    skills: b.skills,
    phase: 0,
    isBoss: true,
  });

  return enemies;
}

// Store flattened enemies for lookup
const enemyCache = new Map<string, DungeonEnemy[]>();

function getEnemies(dungeon: DungeonConfig): DungeonEnemy[] {
  if (!enemyCache.has(dungeon.id)) {
    enemyCache.set(dungeon.id, buildWaveEnemies(dungeon));
  }
  return enemyCache.get(dungeon.id)!;
}

/**
 * Process one tick of dungeon battle
 * Returns updated state (immutable)
 */
export function tickDungeonBattle(
  state: DungeonBattleState,
  dt: number, // seconds since last tick
  playerStats: Stats,
  dungeon: DungeonConfig,
): DungeonBattleState {
  if (state.status !== 'fighting') return state;

  let s = { ...state };
  s.elapsed += dt;
  s.log = [...s.log];

  // Timeout check
  if (s.elapsed >= s.timeLimit) {
    s.status = 'defeat';
    s.log = addLog(s.log, '⏱️ 时间耗尽，挑战失败！', 'warn');
    return s;
  }

  // Player death check
  if (s.playerHp <= 0) {
    s.status = 'defeat';
    s.log = addLog(s.log, '💀 生命耗尽，挑战失败！', 'warn');
    return s;
  }

  if (!s.enemy) {
    s.status = 'victory';
    s.log = addLog(s.log, '🎉 副本通关！', 'info');
    return s;
  }

  const enemies = getEnemies(dungeon);

  // --- Process skill warnings ---
  if (s.activeSkillWarning) {
    s.activeSkillWarning = { ...s.activeSkillWarning, timeLeft: s.activeSkillWarning.timeLeft - dt };
    if (s.activeSkillWarning.timeLeft <= 0) {
      // Skill fires
      const skill = s.activeSkillWarning.skill;
      let dmg = skill.damage;
      if (s.dodgeActive) {
        dmg = Math.floor(dmg * 0.5);
        s.dodgeCount++;
        s.log = addLog(s.log, `🛡️ 闪避成功！${skill.name} 伤害减半 → -${dmg}`, 'dodge');
      } else {
        s.log = addLog(s.log, `💥 ${skill.name} → -${dmg}`, 'skill');
      }
      s.playerHp -= dmg;
      s.totalDamageTaken += dmg;
      s.activeSkillWarning = null;
      s.dodgeAvailable = false;
      s.dodgeActive = false;
    }
  }

  // --- Boss AI: skill cooldowns ---
  if (s.enemy.isBoss && s.enemy.skills && !s.activeSkillWarning) {
    const newCooldowns = new Map(s.bossSkillCooldowns);
    for (const skill of s.enemy.skills) {
      const remaining = (newCooldowns.get(skill.name) ?? skill.cooldown) - dt;
      if (remaining <= 0) {
        // Start skill warning (3 second warning)
        s.activeSkillWarning = { skill, timeLeft: 3 };
        s.dodgeAvailable = true;
        s.dodgeActive = false;
        s.log = addLog(s.log, `⚠️ ${skill.warning} (${skill.name} 3秒后释放)`, 'warn');
        newCooldowns.set(skill.name, skill.cooldown);
        break; // one skill at a time
      } else {
        newCooldowns.set(skill.name, remaining);
      }
    }
    s.bossSkillCooldowns = newCooldowns;

    // Boss phase check
    if (s.enemy.phase !== undefined) {
      const hpPct = s.enemy.hp / s.enemy.maxHp;
      const phases = dungeon.boss.phases;
      for (let i = phases.length - 1; i >= 0; i--) {
        if (hpPct <= phases[i].hpThreshold && s.enemy.phase < i) {
          s.enemy = {
            ...s.enemy,
            phase: i,
            attack: Math.floor(dungeon.boss.attack * phases[i].attackMultiplier),
          };
          s.log = addLog(s.log, `🔥 ${phases[i].description}`, 'phase');
          break;
        }
      }
    }
  }

  // --- Player auto-attack ---
  const attackSpeed = Math.max(0.5, playerStats.speed);
  s.attackAccumulator += dt * attackSpeed;

  while (s.attackAccumulator >= 1 && s.enemy && s.enemy.hp > 0) {
    s.attackAccumulator -= 1;

    const isCrit = Math.random() * 100 < playerStats.critRate;
    const baseDmg = Math.max(1, playerStats.attack - s.enemy.defense);
    const dmg = Math.floor(isCrit ? baseDmg * playerStats.critDmg : baseDmg);

    s.enemy = { ...s.enemy, hp: s.enemy.hp - dmg };
    s.totalDamageDealt += dmg;

    if (isCrit) {
      s.log = addLog(s.log, `💥 暴击！对 ${s.enemy.icon}${s.enemy.name} 造成 ${dmg} 伤害`, 'crit');
    }

    if (s.enemy.hp <= 0) {
      s.killCount++;
      s.log = addLog(s.log, `☠️ 击败 ${s.enemy.icon}${s.enemy.name}！`, 'kill');

      // Next enemy
      const currentIdx = enemies.findIndex(e => e.name === s.enemy!.name && e.isBoss === s.enemy!.isBoss);
      const nextIdx = currentIdx + 1;
      if (nextIdx < enemies.length) {
        const next = enemies[nextIdx];
        s.enemy = { ...next, hp: next.maxHp };
        s.currentEnemyIndex = nextIdx;
        if (next.isBoss) {
          s.log = addLog(s.log, `👹 Boss 登场：${next.icon}${next.name}！`, 'info');
          s.bossSkillCooldowns = new Map();
        }
      } else {
        s.enemy = null;
        s.status = 'victory';
        s.log = addLog(s.log, '🎉 副本通关！', 'info');
      }
      break;
    }
  }

  // --- Enemy auto-attack on player (non-skill damage) ---
  if (s.enemy && s.enemy.hp > 0) {
    const enemyDps = s.enemy.attack * dt;
    const dmg = Math.floor(enemyDps);
    if (dmg > 0) {
      s.playerHp -= dmg;
      s.totalDamageTaken += dmg;
    }
  }

  return s;
}

/**
 * Player dodge action
 */
export function doDodge(state: DungeonBattleState): DungeonBattleState {
  if (!state.dodgeAvailable || state.dodgeActive) return state;
  return { ...state, dodgeActive: true };
}

/**
 * Calculate dungeon rewards
 */
export function calculateDungeonRewards(
  dungeon: DungeonConfig,
  state: DungeonBattleState,
  isFirstClear: boolean,
): {
  lingshi: number;
  exp: number;
  pantao: number;
  firstClearLingshi: number;
  firstClearPantao: number;
  clearTime: number;
} {
  const [minL, maxL] = dungeon.rewards.lingshi;
  const [minE, maxE] = dungeon.rewards.exp;
  const lingshi = Math.floor(minL + Math.random() * (maxL - minL));
  const exp = Math.floor(minE + Math.random() * (maxE - minE));

  return {
    lingshi,
    exp,
    pantao: dungeon.rewards.pantao,
    firstClearLingshi: isFirstClear ? dungeon.firstClearReward.lingshi : 0,
    firstClearPantao: isFirstClear ? dungeon.firstClearReward.pantao : 0,
    clearTime: state.elapsed,
  };
}
