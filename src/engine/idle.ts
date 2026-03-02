/**
 * IdleCalc — 修为产出计算、离线收益
 */
import { Decimal, bn, ZERO } from './bignum';
import { xiuweiPerSecond, offlineReward } from './formulas';
import { TickSubscriber } from './tick';
import { eventBus } from './events';

export interface IdleState {
  xiuwei: Decimal;
  xiuweiPerSec: Decimal;
  realmMultiplier: Decimal;
  equipBonus: Decimal;
  baseProduction: Decimal;
}

export class IdleCalc implements TickSubscriber {
  private state: IdleState;

  constructor(state: IdleState) {
    this.state = state;
  }

  update(delta: number): void {
    const production = this.getProduction();
    this.state.xiuwei = this.state.xiuwei.add(production.mul(delta));
    this.state.xiuweiPerSec = production;
  }

  getProduction(): Decimal {
    return xiuweiPerSecond(
      this.state.baseProduction,
      this.state.realmMultiplier,
      this.state.equipBonus
    );
  }

  calculateOfflineReward(offlineSeconds: number, efficiency = 0.5): Decimal {
    const perSec = this.getProduction();
    return offlineReward(perSec, offlineSeconds, efficiency);
  }
}
