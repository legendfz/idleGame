// ═══════════════════════════════════════════
// Web Audio API 音效引擎 — 纯合成，零依赖
// ═══════════════════════════════════════════

let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.3;

function getCtx(): AudioContext | null {
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function play(freq: number, type: OscillatorType, dur: number, vol = volume, ramp = 0.02) {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

function playSeq(notes: [number, OscillatorType, number][], gap: number) {
  if (!enabled) return;
  notes.forEach(([freq, type, dur], i) => {
    setTimeout(() => play(freq, type, dur), i * gap * 1000);
  });
}

// ─── 公共音效 ───

export const sfx = {
  /** 普通攻击 */
  hit() { play(200, 'square', 0.08, volume * 0.5); },

  /** 暴击 */
  crit() {
    play(400, 'sawtooth', 0.1);
    setTimeout(() => play(600, 'sawtooth', 0.15), 50);
  },

  /** 击杀 */
  kill() { playSeq([[300, 'square', 0.1], [450, 'square', 0.15]], 0.08); },

  /** 升级 */
  levelUp() {
    playSeq([
      [523, 'sine', 0.15],
      [659, 'sine', 0.15],
      [784, 'sine', 0.25],
    ], 0.12);
  },

  /** 装备获得 */
  itemDrop() {
    playSeq([
      [800, 'sine', 0.1],
      [1000, 'sine', 0.1],
      [1200, 'sine', 0.2],
    ], 0.08);
  },

  /** Boss出现 */
  bossAppear() {
    play(100, 'sawtooth', 0.3, volume * 0.6);
    setTimeout(() => play(80, 'sawtooth', 0.4, volume * 0.6), 200);
  },

  /** 按钮点击 */
  click() { play(600, 'sine', 0.05, volume * 0.3); },

  /** 突破成功 */
  breakthrough() {
    playSeq([
      [523, 'sine', 0.2],
      [659, 'sine', 0.2],
      [784, 'sine', 0.2],
      [1047, 'sine', 0.4],
    ], 0.15);
  },

  /** 成就解锁 */
  achievement() {
    playSeq([
      [784, 'sine', 0.15],
      [988, 'sine', 0.15],
      [1175, 'sine', 0.3],
    ], 0.1);
  },

  /** 错误/失败 */
  fail() { play(150, 'square', 0.2, volume * 0.4); },
};

// ─── 设置 ───

export function setSfxEnabled(v: boolean) { enabled = v; }
export function getSfxEnabled() { return enabled; }
export function setSfxVolume(v: number) { volume = Math.max(0, Math.min(1, v)); }
export function getSfxVolume() { return volume; }
