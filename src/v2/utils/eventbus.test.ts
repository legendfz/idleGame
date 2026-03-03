import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './eventbus';
import type { GameEvent } from './eventbus';

describe('EventBus', () => {
  it('subscribes and receives events', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe(handler);

    const event: GameEvent = { type: 'MONSTER_KILLED', count: 1, isBoss: false };
    bus.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe stops receiving', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsub = bus.subscribe(handler);

    bus.emit({ type: 'MONSTER_KILLED', count: 1, isBoss: false });
    expect(handler).toHaveBeenCalledTimes(1);

    unsub();
    bus.emit({ type: 'MONSTER_KILLED', count: 2, isBoss: false });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('multiple subscribers', () => {
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.subscribe(h1);
    bus.subscribe(h2);

    bus.emit({ type: 'STAGE_CLEARED', stage: 1, stars: 3, time: 60 });

    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('clear removes all', () => {
    const bus = new EventBus();
    bus.subscribe(vi.fn());
    bus.subscribe(vi.fn());
    expect(bus.listenerCount).toBe(2);

    bus.clear();
    expect(bus.listenerCount).toBe(0);
  });

  it('handler errors do not break other handlers', () => {
    const bus = new EventBus();
    const badHandler = vi.fn(() => { throw new Error('oops'); });
    const goodHandler = vi.fn();

    bus.subscribe(badHandler);
    bus.subscribe(goodHandler);

    bus.emit({ type: 'MONSTER_KILLED', count: 1, isBoss: false });

    expect(badHandler).toHaveBeenCalledTimes(1);
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });
});
