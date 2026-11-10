// Story scenes: each page of a little one's story can say how its picture moves, so the screen follows the
// story (Hanuman flies up to the sun, rain falls, the goats bump on the bridge, the lamps flicker at Diwali).
// A page's "act" is { move, fx, with, sky, sound }:
//   move  how the page's picture moves (MOVES below)
//   fx    what happens around it (FX below): one, or a list of two
//   with  a second picture (a word id) that shares the page, e.g. the mother Krishna runs to
//   sky   the backdrop (SKIES below)
//   sound a sound effect to play instead of the move's own
// Pure: no DOM here, so the validator and tests can use it. The story game turns this into HTML and CSS
// does the moving; under "reduce motion" everything stands still.

// each move, and the sound it makes (if any)
export const MOVES = {
  enter: null, // walks in from the left
  'enter-right': null, // walks in from the right
  walk: null, // walks in slowly, step by step
  run: 'whoosh', // dashes in and keeps running on the spot
  scurry: 'pop', // something small darts in on little feet
  drive: 'vroom', // a vehicle rolls in, bumping along
  roll: 'whoosh', // rolls in, turning over (a laddoo, a stone)
  'fly-up': 'whoosh', // rises up and up into the sky
  'fly-across': 'whoosh', // flies to and fro across the sky
  jump: 'boing', // hops and hops
  dance: 'jingle', // sways and bobs to a tune
  fall: 'thud', // drops from the top and lands with a bounce
  grow: 'sparkle', // starts tiny and grows big
  peek: null, // rises up from below (the sun at dawn, an ant from the grass)
  shake: null, // shivers or trembles
  sleep: null, // breathes slowly, fast asleep
  float: null, // bobs gently (a boat, a cloud, the moon)
  sway: null, // sways from its feet like a tree in the breeze
  swim: null, // swims to and fro with a wiggle
  spin: null, // turns round and round (a clock's hands, a wheel)
  talk: null, // bounces a little, as if speaking or eating
  approach: null, // it and its partner come towards each other
  bump: 'thud', // it and its partner bump heads and spring back
  orbit: 'whoosh', // goes round and round its partner
  climb: null, // small, climbs up its partner (a mouse up the clock)
  shrink: 'pop', // gets smaller and smaller until it's gone (eaten up!)
  lift: null, // goes up high and hangs there, swinging (the butter pot hung out of reach)
};

// effects: how many bits each draws, whether they sit behind the picture, and the sound
export const FX = {
  rain: { n: 18, sound: 'rain' },
  splash: { n: 10, sound: 'splash' },
  sparkles: { n: 12, sound: 'sparkle' },
  stars: { n: 14, back: true },
  hearts: { n: 8, sound: 'chime' },
  wind: { n: 6, sound: 'whoosh' },
  music: { n: 7 },
  zzz: { n: 3 },
  lamps: { n: 5, sound: 'chime' },
  leaves: { n: 9 },
  bubbles: { n: 10 },
  confetti: { n: 22, sound: 'cheer' },
  glow: { n: 1, back: true },
  dust: { n: 5 },
  steam: { n: 4 },
};

// the sound effects a scene may play (all in sfx.js)
export const SOUNDS = ['whoosh', 'vroom', 'toot', 'boing', 'jingle', 'thud', 'sparkle', 'chime', 'cheer', 'rain', 'splash', 'pop', 'sneeze', 'siren'];

export const SKIES = ['day', 'night', 'dawn', 'rain', 'sky', 'field', 'river', 'sea', 'underwater', 'home'];

const fxList = (act) => [].concat(act.fx ?? []);

// where the bits of an effect go: spread evenly but not in rows (the same each time, so it's testable)
const spread = (k) => (k * 0.618034) % 1;
const pct = (x) => `${(x * 100).toFixed(1)}%`;

const BITS = {
  star: '<svg viewBox="0 0 20 20"><path d="M10 1l2.6 5.6 6 .7-4.5 4.1 1.2 6L10 14.4 4.7 17.4l1.2-6L1.4 7.3l6-.7z" fill="currentColor"/></svg>',
  heart: '<svg viewBox="0 0 20 20"><path d="M10 17.5S2 12.6 2 7.2C2 4.4 4.1 2.5 6.4 2.5c1.6 0 2.9.9 3.6 2.1.7-1.2 2-2.1 3.6-2.1 2.3 0 4.4 1.9 4.4 4.7 0 5.4-8 10.3-8 10.3z" fill="currentColor"/></svg>',
  note: '<svg viewBox="0 0 20 20"><path d="M7 3l10-2v12.2a3 3 0 1 1-2-2.8V5L9 6.2v9a3 3 0 1 1-2-2.8z" fill="currentColor"/></svg>',
  leaf: '<svg viewBox="0 0 20 20"><path d="M3 17C3 8 9 3 18 2c0 9-5 15-14 15zm0 0l8-8" fill="currentColor" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/></svg>',
  lamp: '<svg viewBox="0 0 40 34"><path class="flame" d="M20 2c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="#FFB020"/><path d="M20 8c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7z" fill="#FFF3B0"/><path d="M2 20h36c0 8-8 13-18 13S2 28 2 20z" fill="#D9622B"/><path d="M2 20h36c-1 3-3 5-5 6H7c-2-1-4-3-5-6z" fill="#F08A4B"/></svg>',
};
const BIT_OF = { stars: BITS.star, sparkles: BITS.star, hearts: BITS.heart, music: BITS.note, leaves: BITS.leaf, lamps: BITS.lamp };
const CONFETTI = ['#FFC93C', '#2EC27E', '#6C63FF', '#FF5A5F', '#3D7BFF', '#FF8FB1'];

function fxHtml(name, front) {
  const f = FX[name];
  if (!f || !!f.back === front) return '';
  const bits = [];
  for (let k = 0; k < f.n; k++) {
    const x = name === 'lamps' ? (k + 0.5) / f.n : spread(k + 1);
    const style = [`--k:${k}`, `--r:${x.toFixed(3)}`, `--x:${pct(x)}`, `--y:${pct(spread(k * 3 + 2))}`, `--d:${(spread(k * 7 + 5) * 1.6).toFixed(2)}s`, `--s:${(0.7 + spread(k * 5 + 3) * 0.6).toFixed(2)}`];
    if (name === 'confetti') style.push(`--c:${CONFETTI[k % CONFETTI.length]}`);
    bits.push(`<i style="${style.join(';')}">${name === 'zzz' ? 'z' : BIT_OF[name] || ''}</i>`);
  }
  return `<div class="fx fx-${name}" aria-hidden="true">${bits.join('')}</div>`;
}

// The scene's inside, for a page's act: the backdrop, the picture(s) and the effects.
// `art(wordId)` draws a word's picture as SVG.
export function sceneHtml(act, mainWord, art) {
  const actor = (role, id) => `<div class="actor ${role}"><div class="body">${art(id)}</div></div>`;
  return [
    `<div class="scene-ground" aria-hidden="true"></div>`,
    ...fxList(act).map((f) => fxHtml(f, false)),
    act.with ? actor('partner', act.with) : '',
    actor('main', mainWord),
    ...fxList(act).map((f) => fxHtml(f, true)),
  ].join('');
}

export const sceneClass = (act) => `scene sky-${act.sky || 'day'} mv-${act.move || 'enter'}${act.with ? ' duo' : ''}${fxList(act).map((f) => ` has-${f}`).join('')}`;

// the sound a page makes as it opens: its own, else its move's, else its effect's
export const sceneSound = (act) => act.sound || MOVES[act.move] || fxList(act).map((f) => FX[f]?.sound).find(Boolean) || null;

// The problems with an act (for the validator). `hasWord` says whether a word id exists.
export function actProblems(act, hasWord) {
  const out = [];
  if (act === null || typeof act !== 'object' || Array.isArray(act)) return ['must be an object like { "move": "jump" }'];
  for (const k of Object.keys(act)) if (!['move', 'fx', 'with', 'sky', 'sound'].includes(k)) out.push(`has an unknown field "${k}"`);
  if (act.move !== undefined && !(act.move in MOVES)) out.push(`move "${act.move}" is not one of ${Object.keys(MOVES).join(', ')}`);
  const fx = fxList(act);
  if (act.fx !== undefined && (!fx.length || fx.length > 2 || new Set(fx).size < fx.length)) out.push('fx must be one effect or a list of two different ones');
  for (const f of fx) if (!(f in FX)) out.push(`fx "${f}" is not one of ${Object.keys(FX).join(', ')}`);
  if (act.sky !== undefined && !SKIES.includes(act.sky)) out.push(`sky "${act.sky}" is not one of ${SKIES.join(', ')}`);
  if (act.with !== undefined && !hasWord(act.with)) out.push(`with "${act.with}" is not a word id`);
  if (['approach', 'bump', 'orbit', 'climb'].includes(act.move) && !act.with) out.push(`move "${act.move}" needs a partner ("with")`);
  if (act.sound !== undefined && !SOUNDS.includes(act.sound)) out.push(`sound "${act.sound}" is not a sound effect`);
  return out;
}
