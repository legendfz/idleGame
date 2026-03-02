/**
 * TickEngine — 游戏主循环
 * 每帧计算 deltaTime，分发给各子系统
 */
import { eventBus } from './events';

export interface TickSubscriber {
  update(delta: number): void;
}

class TickEngineImpl {
  private subscribers: TickSubscriber[] = [];
  private lastTime = 0;
  private rafId: number | null = null;
  private _running = false;
  private _elapsed = 0;

  get running(): boolean { return this._running; }
  get elapsed(): number { return this._elapsed; }

  register(subscriber: TickSubscriber): () => void {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    this._running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (): void => {
    if (!this._running) return;
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000; // seconds
    this.lastTime = now;
    this._elapsed += delta;

    for (const sub of this.subscribers) {
      sub.update(delta);
    }

    eventBus.emit('tick', { delta, elapsed: this._elapsed });
    this.rafId = requestAnimationFrame(this.loop);
  };
}

export const tickEngine = new TickEngineImpl();
export default tickEngine;
