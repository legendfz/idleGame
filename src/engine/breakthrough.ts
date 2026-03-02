/**
 * BreakThrough — 境界突破逻辑
 */
import { Decimal, bn } from './bignum';
import { breakthroughCost } from './formulas';
import { eventBus } from './events';

export interface RealmConfig {
  id: string;
  name: string;
  tier: number;
  baseCost: Decimal;
  multiplier: Decimal;
  stages: number; // 每个境界的层数
}

export interface BreakthroughState {
  currentRealmId: string;
  currentStage: number; // 当前层
  xiuwei: Decimal;
}

export class BreakThroughEngine {
  private realms: RealmConfig[];

  constructor(realms: RealmConfig[]) {
    this.realms = realms;
  }

  canBreakthrough(state: BreakthroughState): boolean {
    const realm = this.getRealm(state.currentRealmId);
    if (!realm) return false;
    const cost = this.getCost(state);
    return state.xiuwei.gte(cost);
  }

  getCost(state: BreakthroughState): Decimal {
    const realm = this.getRealm(state.currentRealmId);
    if (!realm) return bn(Infinity);
    return breakthroughCost(realm.baseCost, realm.tier * realm.stages + state.currentStage);
  }

  attempt(state: BreakthroughState): boolean {
    if (!this.canBreakthrough(state)) {
      eventBus.emit('breakthrough:fail', { realmId: state.currentRealmId });
      return false;
    }

    const cost = this.getCost(state);
    state.xiuwei = state.xiuwei.sub(cost);

    const realm = this.getRealm(state.currentRealmId)!;
    if (state.currentStage < realm.stages - 1) {
      state.currentStage++;
    } else {
      // Advance to next realm
      const idx = this.realms.findIndex(r => r.id === state.currentRealmId);
      if (idx < this.realms.length - 1) {
        state.currentRealmId = this.realms[idx + 1].id;
        state.currentStage = 0;
      }
    }

    eventBus.emit('breakthrough:success', {
      realmId: state.currentRealmId,
      newRealm: state.currentRealmId,
    });
    return true;
  }

  private getRealm(id: string): RealmConfig | undefined {
    return this.realms.find(r => r.id === id);
  }
}
