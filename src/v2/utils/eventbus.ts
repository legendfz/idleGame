/**
 * v2.0 Game Event Bus
 */

import { Quality, DecStr } from '../types';

export type GameEvent =
  | { type: 'REALM_BREAKTHROUGH'; realmId: string; subLevel: number }
  | { type: 'STAGE_CLEARED'; stage: number; stars: number; time: number }
  | { type: 'EQUIPMENT_OBTAINED'; equipUid: string; quality: Quality }
  | { type: 'EQUIPMENT_ENHANCED'; equipUid: string; level: number }
  | { type: 'CHARACTER_UNLOCKED'; charId: string }
  | { type: 'MONSTER_KILLED'; count: number; isBoss: boolean }
  | { type: 'CLICK_ATTACK'; damage: DecStr; isCrit: boolean }
  | { type: 'PRESTIGE'; count: number; foyuan: number }
  | { type: 'ALCHEMY_SUCCESS'; pillId: string }
  | { type: 'RECRUIT_SUCCESS'; monsterId: string };

export type GameEventHandler = (event: GameEvent) => void;

class EventBus {
  private handlers: Set<GameEventHandler> = new Set();

  subscribe(handler: GameEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(event: GameEvent): void {
    for (const handler of this.handlers) {
      try { handler(event); } catch (e) { console.error('EventBus handler error:', e); }
    }
  }

  clear(): void {
    this.handlers.clear();
  }

  get listenerCount(): number {
    return this.handlers.size;
  }
}

export const gameEventBus = new EventBus();
export { EventBus };
