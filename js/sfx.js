// Little synthesised sound effects (no audio files needed). All gentle; nothing sounds like "wrong".

let ctx = null;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, at, dur, { type = 'sine', vol = 0.12, to = null } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  unlock: () => ac(),
  pop: () => tone(520, 0, 0.12, { to: 880 }),
  chime: () => [660, 830, 990].forEach((f, i) => tone(f, i * 0.09, 0.3)),
  cheer: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.25, { type: 'triangle' })),
  boing: () => tone(300, 0, 0.25, { type: 'sine', to: 220, vol: 0.08 }),
  siren: () => [0, 0.45, 0.9].forEach((at) => (tone(660, at, 0.22, { type: 'triangle', vol: 0.06 }), tone(880, at + 0.22, 0.22, { type: 'triangle', vol: 0.06 }))),
  vroom: () => tone(70, 0, 0.7, { type: 'sawtooth', to: 180, vol: 0.05 }),
  thud: () => tone(120, 0, 0.18, { type: 'square', to: 50, vol: 0.06 }),
  toot: () => (tone(440, 0, 0.3, { type: 'square', vol: 0.05 }), tone(440, 0.4, 0.5, { type: 'square', vol: 0.05 })),
};
