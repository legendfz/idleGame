/**
 * EventBus — 全局事件系统（发布/订阅）
 * v2.0 Engine Layer
 */

export type EventHandler<T = unknown> = (data: T) => void;

export interface GameEvents {
  'tick': { delta: number; elapsed: number };
  'battle:start': { stageId: string };
  'battle:hit': { damage: string; isCrit: boolean };
  'battle:victory': { stageId: string; loot: unknown[] };
  'battle:defeat': { stageId: string };
  'breakthrough:attempt': { realmId: string };
  'breakthrough:success': { realmId: string; newRealm: string };
  'breakthrough:fail': { realmId: string };
  'loot:drop': { itemId: string; quality: number };
  'equip:enhance': { slotId: string; level: number };
  'journey:progress': { stage: number; total: number };
  'save:auto': { timestamp: number };
  'offline:reward': { duration: number; xiuwei: string };
}

class EventBusImpl {
  private listeners = new Map<string, Set<EventHandler<any>>>();

  on<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBusImpl();
export default eventBus;
