// Sound design, all synthesised (no audio files): FM bells, marimba and kalimba notes, soft noise
// whooshes, and a gentle generative tune per world that ducks while speech plays.

let ctx = null;
let master, sfxBus, musicBus, verb;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.8;
    musicBus = ctx.createGain();
    musicBus.gain.value = MUSIC_LEVEL;
    // a small room so bells shimmer instead of beeping
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 1.6;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    verb.connect(wet).connect(master);
    sfxBus.connect(master);
    sfxBus.connect(verb);
    musicBus.connect(master);
    musicBus.connect(verb);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const MUSIC_LEVEL = 0.16;
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

function env(g, t, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

// FM bell: bright, glassy, decays naturally.
function bell(freq, at = 0, { dur = 1.2, vol = 0.18, ratio = 3.5, index = 2, bus } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const car = c.createOscillator();
  const mod = c.createOscillator();
  const modGain = c.createGain();
  const g = c.createGain();
  car.frequency.value = freq;
  mod.frequency.value = freq * ratio;
  modGain.gain.setValueAtTime(freq * index, t);
  modGain.gain.exponentialRampToValueAtTime(1, t + dur);
  mod.connect(modGain).connect(car.frequency);
  env(g, t, 0.005, vol, dur);
  car.connect(g).connect(bus || sfxBus);
  car.start(t);
  mod.start(t);
  car.stop(t + dur + 0.1);
  mod.stop(t + dur + 0.1);
}

// Marimba: warm wooden note.
function marimba(freq, at = 0, { vol = 0.2, dur = 0.55, bus } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const g = c.createGain();
  env(g, t, 0.004, vol, dur);
  g.connect(bus || sfxBus);
  for (const [mult, gain] of [
    [1, 1],
    [4, 0.22],
    [10, 0.05],
  ]) {
    const o = c.createOscillator();
    const og = c.createGain();
    o.frequency.value = freq * mult;
    og.gain.value = gain;
    o.connect(og).connect(g);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

// Kalimba: soft plucked tine.
function kalimba(freq, at = 0, { vol = 0.16, bus } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const f = c.createBiquadFilter();
  const g = c.createGain();
  o.type = 'triangle';
  o.frequency.value = freq;
  f.type = 'lowpass';
  f.frequency.value = freq * 3;
  env(g, t, 0.003, vol, 0.9);
  o.connect(f).connect(g).connect(bus || sfxBus);
  o.start(t);
  o.stop(t + 1);
}

function tone(freq, at, dur, { type = 'sine', vol = 0.12, to = null, bus } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  env(g, t, 0.01, vol, dur);
  o.connect(g).connect(bus || sfxBus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

let noiseBuf = null;
function noise(at, dur, { from = 800, to = 3000, q = 1.2, vol = 0.18, type = 'bandpass', bus } = {}) {
  const c = ac();
  if (!c) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + at;
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  env(g, t, 0.02, vol, dur);
  s.connect(f).connect(g).connect(bus || sfxBus);
  s.start(t);
  s.stop(t + dur + 0.05);
}

const C5 = 72;
const MAJ = [0, 2, 4, 7, 9, 12, 14, 16];
const on = (fn) => (...a) => (sfx.enabled ? fn(...a) : undefined);

export const sfx = {
  enabled: true,
  unlock: () => ac(),
  // a light tap of vibration on phones that have it (most Android phones; iPhones ignore it)
  haptic: on((pattern = 14) => {
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* not allowed before the first tap */
    }
  }),
  tap: on(() => tone(900, 0, 0.05, { type: 'triangle', vol: 0.06 })),
  pop: on(() => {
    tone(420, 0, 0.12, { to: 900, vol: 0.14 });
    noise(0, 0.05, { from: 2000, to: 4000, vol: 0.05 });
  }),
  chime: on(() => [0, 4, 7].forEach((s, i) => bell(midi(C5 + s), i * 0.08, { dur: 0.9, vol: 0.12 }))),
  star: on((i = 0) => {
    bell(midi(C5 + 12 + MAJ[i * 2] || 0), 0, { dur: 1, vol: 0.16 });
    bell(midi(C5 + 19 + MAJ[i * 2] || 0), 0.06, { dur: 0.8, vol: 0.08 });
  }),
  sparkle: on(() => [0, 4, 7, 11, 14, 19].forEach((s, i) => bell(midi(C5 + 12 + s), i * 0.05, { dur: 0.6, vol: 0.07, ratio: 5 }))),
  cheer: on(() => {
    [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => marimba(midi(C5 - 12 + s), i * 0.07, { vol: 0.16 }));
    noise(0, 0.8, { from: 3000, to: 9000, vol: 0.05, type: 'highpass' });
  }),
  jingle: on(() => [0, 7, 12, 16, 19, 24].forEach((s, i) => kalimba(midi(C5 + s), i * 0.09, { vol: 0.15 }))),
  boing: on(() => {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    const g = c.createGain();
    o.frequency.setValueAtTime(320, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.45);
    lfo.frequency.value = 22;
    lg.gain.value = 18;
    lfo.connect(lg).connect(o.frequency);
    env(g, t, 0.01, 0.12, 0.45);
    o.connect(g).connect(sfxBus);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.5);
    lfo.stop(t + 0.5);
  }),
  whoosh: on(() => noise(0, 0.45, { from: 300, to: 4000, q: 0.8, vol: 0.12 })),
  sneeze: on(() => {
    noise(0, 0.25, { from: 600, to: 1200, vol: 0.06 });
    noise(0.3, 0.25, { from: 3000, to: 1200, q: 0.6, vol: 0.2 });
  }),
  page: on(() => noise(0, 0.25, { from: 1500, to: 6000, q: 0.5, vol: 0.08, type: 'highpass' })),
  siren: on(() => [0, 0.45, 0.9].forEach((at) => (tone(660, at, 0.22, { type: 'triangle', vol: 0.05 }), tone(880, at + 0.22, 0.22, { type: 'triangle', vol: 0.05 })))),
  vroom: on(() => {
    tone(70, 0, 0.7, { type: 'sawtooth', to: 180, vol: 0.04 });
    noise(0, 0.6, { from: 200, to: 600, vol: 0.05, type: 'lowpass' });
  }),
  thud: on(() => (tone(120, 0, 0.18, { to: 50, vol: 0.1 }), noise(0, 0.12, { from: 300, to: 120, vol: 0.08, type: 'lowpass' }))),
  toot: on(() => (tone(440, 0, 0.3, { type: 'square', vol: 0.04 }), tone(440, 0.4, 0.5, { type: 'square', vol: 0.04 }))),
};

// ---------- background music ----------
// A short generative loop per world: pentatonic melody on an instrument that suits the world,
// soft bass, light shaker. Quiet by default and ducked under speech.

const STYLES = {
  hub: { root: 60, scale: [0, 2, 4, 7, 9], bpm: 96, inst: 'kalimba' },
  farm: { root: 62, scale: [0, 2, 4, 7, 9], bpm: 100, inst: 'marimba' },
  town: { root: 60, scale: [0, 2, 4, 7, 9], bpm: 108, inst: 'kalimba' },
  jungle: { root: 57, scale: [0, 3, 5, 7, 10], bpm: 104, inst: 'marimba' },
  dino: { root: 55, scale: [0, 2, 4, 7, 9], bpm: 92, inst: 'marimba' },
  space: { root: 64, scale: [0, 2, 4, 7, 11], bpm: 80, inst: 'bell' },
  ocean: { root: 59, scale: [0, 2, 4, 7, 9], bpm: 84, inst: 'kalimba' },
  igloo: { root: 67, scale: [0, 2, 4, 7, 9], bpm: 96, inst: 'bell' },
  carnival: { root: 65, scale: [0, 2, 4, 7, 9], bpm: 118, inst: 'marimba' },
  garden: { root: 64, scale: [0, 2, 4, 7, 9], bpm: 104, inst: 'kalimba' },
  castle: { root: 62, scale: [0, 2, 4, 5, 7, 9], bpm: 100, inst: 'bell' },
  desert: { root: 57, scale: [0, 1, 4, 5, 7, 8], bpm: 96, inst: 'marimba' },
  forest: { root: 55, scale: [0, 2, 4, 7, 9], bpm: 84, inst: 'kalimba' },
  palace: { root: 60, scale: [0, 1, 4, 5, 7, 8, 11], bpm: 88, inst: 'bell' },
  village: { root: 62, scale: [0, 2, 4, 7, 9], bpm: 98, inst: 'marimba' },
  mountain: { root: 59, scale: [0, 2, 5, 7, 9], bpm: 80, inst: 'bell' },
  city: { root: 65, scale: [0, 2, 4, 7, 11], bpm: 112, inst: 'kalimba' },
};

let theme = null;
let timer = 0;
let step = 0;
let nextTime = 0;
let pattern = [];

function makePattern(style, seed) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out = [];
  let deg = 2;
  for (let i = 0; i < 32; i++) {
    if (r() < 0.32) {
      out.push(null);
      continue;
    }
    deg = Math.max(0, Math.min(style.scale.length * 2 - 1, deg + Math.round((r() - 0.5) * 3)));
    out.push(deg);
  }
  return out;
}

function noteOf(style, deg) {
  const oct = Math.floor(deg / style.scale.length);
  return midi(style.root + 12 * oct + style.scale[deg % style.scale.length]);
}

function schedule() {
  const c = ctx;
  if (!c || !theme) return;
  const style = STYLES[theme] || STYLES.hub;
  const spb = 60 / style.bpm / 2; // eighth notes
  while (nextTime < c.currentTime + 0.25) {
    const at = nextTime - c.currentTime;
    const deg = pattern[step % pattern.length];
    if (deg != null) {
      const f = noteOf(style, deg);
      if (style.inst === 'bell') bell(f, at, { dur: 1.4, vol: 0.06, ratio: 2, index: 1.2, bus: musicBus });
      else if (style.inst === 'marimba') marimba(f, at, { vol: 0.09, bus: musicBus });
      else kalimba(f, at, { vol: 0.08, bus: musicBus });
    }
    if (step % 8 === 0) tone(midi(style.root - 12 + (step % 32 < 16 ? 0 : 7)), at, spb * 7, { vol: 0.05, bus: musicBus });
    if (step % 2 === 1) noise(at, 0.05, { from: 6000, to: 9000, vol: 0.012, type: 'highpass', bus: musicBus });
    step++;
    nextTime += spb;
  }
}

export const music = {
  enabled: true,
  unlocked: false,
  unlock() {
    this.unlocked = true;
    if (theme) this.play(theme, true);
  },
  play(next, force = false) {
    if (!force && next === theme && timer) return;
    theme = next;
    clearInterval(timer);
    timer = 0;
    if (!this.enabled || !this.unlocked || !ac()) return;
    const style = STYLES[theme] || STYLES.hub;
    pattern = makePattern(style, [...String(theme)].reduce((a, ch) => a + ch.charCodeAt(0), 7));
    step = 0;
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(schedule, 90);
  },
  stop() {
    clearInterval(timer);
    timer = 0;
  },
  setEnabled(v) {
    this.enabled = v;
    if (!v) this.stop();
    else if (theme) this.play(theme, true);
  },
};

// Duck the music while anything is being said.
if (typeof window !== 'undefined') {
  window.addEventListener('vt-speaking', (e) => {
    if (!ctx || !musicBus) return;
    const t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setTargetAtTime(e.detail ? MUSIC_LEVEL * 0.25 : MUSIC_LEVEL, t, 0.15);
  });
}
