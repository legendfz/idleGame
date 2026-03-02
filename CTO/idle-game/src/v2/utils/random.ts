/**
 * v2.0 Random utilities
 */

/** Random float [0, 1) */
export function rand(): number {
  return Math.random();
}

/** Random int [min, max] inclusive */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Roll with probability (0-1), returns true if success */
export function roll(chance: number): boolean {
  return Math.random() < chance;
}

/** Pick random element from array */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
