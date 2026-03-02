/**
 * TickEngine — 游戏主循环
 * 基于 TECH-SPEC §2.1
 * 使用 setInterval (1s) 驱动挂机修炼, requestAnimationFrame 驱动战斗
 */

export type TickCallback = (dt: number) => void;

class TickEngine {
  private running = false;
  private paused = false;
  private tickCallbacks: Set<TickCallback> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastTick: number = 0;
  private frameId: number | null = null;
  private battleCallbacks: Set<TickCallback> = new Set();

  /**
   * 启动游戏主循环
   * - 1s interval for idle ticks
   * - rAF for battle ticks
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTick = Date.now();

    // Idle tick (1 Hz)
    this.intervalId = setInterval(() => {
      if (this.paused) return;
      const now = Date.now();
      const dt = (now - this.lastTick) / 1000;
      this.lastTick = now;
      for (const cb of this.tickCallbacks) {
        try { cb(Math.min(dt, 2)); } catch (e) { console.error('Tick error:', e); }
      }
    }, 1000);

    // Battle tick (rAF, ~60Hz)
    const battleLoop = () => {
      if (!this.running) return;
      if (!this.paused && this.battleCallbacks.size > 0) {
        const now = Date.now();
        const dt = (now - this.lastBattleTick) / 1000;
        this.lastBattleTick = now;
        for (const cb of this.battleCallbacks) {
          try { cb(Math.min(dt, 0.1)); } catch (e) { console.error('Battle tick error:', e); }
        }
      }
      this.frameId = requestAnimationFrame(battleLoop);
    };
    this.lastBattleTick = Date.now();
    this.frameId = requestAnimationFrame(battleLoop);
  }
  private lastBattleTick: number = 0;

  stop(): void {
    this.running = false;
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    if (this.frameId) { cancelAnimationFrame(this.frameId); this.frameId = null; }
  }

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; this.lastTick = Date.now(); this.lastBattleTick = Date.now(); }

  /** Register idle tick callback (1 Hz). Returns unsubscribe. */
  onTick(callback: TickCallback): () => void {
    this.tickCallbacks.add(callback);
    return () => this.tickCallbacks.delete(callback);
  }

  /** Register battle tick callback (rAF). Returns unsubscribe. */
  onBattleTick(callback: TickCallback): () => void {
    this.battleCallbacks.add(callback);
    return () => this.battleCallbacks.delete(callback);
  }

  get isRunning(): boolean { return this.running; }
  get isPaused(): boolean { return this.paused; }
}

export const tickEngine = new TickEngine();
