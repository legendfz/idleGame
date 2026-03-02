/**
 * EventBus — 全局事件系统（发布/订阅）
 * 基于 TECH-SPEC §5.2
 */
import Decimal from 'break_infinity.js';

// === 事件类型 ===
export type GameEvent =
  | { type: 'XIUWEI_GAINED'; amount: Decimal }
  | { type: 'BREAKTHROUGH'; fromRealm: string; toRealm: string; fromLevel: number; toLevel: number }
  | { type: 'CLICK'; damage: Decimal; isCrit: boolean; position?: { x: number; y: number } }
  | { type: 'COMBO_ACTIVATED'; multiplier: number }
  | { type: 'ENEMY_KILLED'; monsterId: string }
  | { type: 'BOSS_KILLED'; monsterId: string; timeUsed: number }
  | { type: 'BOSS_TIMEOUT'; stageId: number }
  | { type: 'STAGE_COMPLETE'; stageId: number; stars: number }
  | { type: 'LOOT_DROP'; items: LootDropItem[] }
  | { type: 'EQUIP_ENHANCED'; itemUid: string; level: number; success: boolean }
  | { type: 'EQUIP_EQUIPPED'; charId: string; slot: string; itemUid: string }
  | { type: 'OFFLINE_REWARD'; duration: number; xiuwei: Decimal; coins: Decimal; bonusApplied: boolean }
  | { type: 'SAVE_COMPLETE' }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'AUTO_ATTACK'; damage: Decimal; isCrit: boolean }
  | { type: 'CAPTURE_ATTEMPT'; monsterId: string; success: boolean };

export interface LootDropItem {
  templateId: string;
  quality: string;
  uid: string;
}

type Handler<T extends GameEvent['type']> = (event: Extract<GameEvent, { type: T }>) => void;

class EventBus {
  private handlers = new Map<string, Set<Function>>();

  emit(event: GameEvent): void {
    const set = this.handlers.get(event.type);
    if (set) {
      for (const handler of set) {
        try { handler(event); } catch (e) { console.error(`EventBus error [${event.type}]:`, e); }
      }
    }
    // Also emit to wildcard '*' listeners
    const wildcard = this.handlers.get('*');
    if (wildcard) {
      for (const handler of wildcard) {
        try { handler(event); } catch (e) { console.error('EventBus wildcard error:', e); }
      }
    }
  }

  on<T extends GameEvent['type']>(type: T, handler: Handler<T>): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  once<T extends GameEvent['type']>(type: T, handler: Handler<T>): void {
    const unsub = this.on(type, (event) => {
      unsub();
      handler(event);
    });
  }

  off(type: GameEvent['type'], handler: Function): void {
    this.handlers.get(type)?.delete(handler);
  }

  onAll(handler: (event: GameEvent) => void): () => void {
    if (!this.handlers.has('*')) this.handlers.set('*', new Set());
    this.handlers.get('*')!.add(handler);
    return () => this.handlers.get('*')?.delete(handler);
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
export { EventBus };
