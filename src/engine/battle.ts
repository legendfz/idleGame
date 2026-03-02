/**
 * BattleCalc — 战斗伤害、点击、自动攻击、Boss 限时
 */
import { Decimal, bn, ZERO } from './bignum';
import { battleDamage } from './formulas';
import { TickSubscriber } from './tick';
import { eventBus } from './events';

export interface BattleState {
  active: boolean;
  stageId: string;
  monsterHp: Decimal;
  monsterMaxHp: Decimal;
  monsterAttack: Decimal;
  playerAttack: Decimal;
  critRate: number;
  critMultiplier: number;
  autoAttackInterval: number; // seconds
  bossTimeLimit: number; // seconds, 0 = no limit
  bossTimeElapsed: number;
  isBoss: boolean;
}

export class BattleCalc implements TickSubscriber {
  private state: BattleState;
  private autoTimer = 0;

  constructor(state: BattleState) {
    this.state = state;
  }

  update(delta: number): void {
    if (!this.state.active) return;

    // Auto attack
    this.autoTimer += delta;
    if (this.autoTimer >= this.state.autoAttackInterval) {
      this.autoTimer -= this.state.autoAttackInterval;
      this.doAttack();
    }

    // Boss timer
    if (this.state.isBoss) {
      this.state.bossTimeElapsed += delta;
      if (this.state.bossTimeElapsed >= this.state.bossTimeLimit) {
        this.state.active = false;
        eventBus.emit('battle:defeat', { stageId: this.state.stageId });
      }
    }
  }

  /** 点击攻击 */
  tap(): void {
    if (!this.state.active) return;
    this.doAttack();
  }

  private doAttack(): void {
    const isCrit = Math.random() < this.state.critRate;
    const damage = battleDamage(
      this.state.playerAttack,
      this.state.critMultiplier,
      isCrit
    );
    this.state.monsterHp = Decimal.max(ZERO, this.state.monsterHp.sub(damage));

    eventBus.emit('battle:hit', { damage: damage.toString(), isCrit });

    if (this.state.monsterHp.lte(ZERO)) {
      this.state.active = false;
      eventBus.emit('battle:victory', { stageId: this.state.stageId, loot: [] });
    }
  }
}
