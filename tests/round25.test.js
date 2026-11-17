// Roadmap sections 4 and 5 (layout, ease of use, animation and feel), built one item at a time.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { busSeats, countLabel } from '../js/games/busdepot.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = read('styles.css');

// ---- 4.3 the counting game ----
test('the bus seats every passenger as big as fits, in up to three rows', () => {
  assert.deepEqual(busSeats(0), { cols: 2, rows: 1 });
  assert.deepEqual(busSeats(1), { cols: 2, rows: 1 });
  assert.deepEqual(busSeats(4), { cols: 4, rows: 1 });
  assert.deepEqual(busSeats(5), { cols: 3, rows: 2 });
  assert.deepEqual(busSeats(10), { cols: 4, rows: 3 });
  for (let n = 1; n <= 10; n++) {
    const { cols, rows } = busSeats(n);
    assert.ok(cols * rows >= n && rows <= 3, `${n} fit`);
  }
});

test('each passenger wears its number in the script being counted in', () => {
  assert.equal(countLabel(content.numbers[2], 'hi'), '३');
  assert.equal(countLabel(content.numbers[2], 'en'), '3');
  assert.equal(countLabel({ value: 7 }, 'hi'), '7');
  const bus = read('js/games/busdepot.js');
  assert.match(bus, /tag\(m, countLabel\(num\(k\), lang\)\)/);
  assert.match(css, /\.inside\.count-bus \.mini \{[^}]*width: var\(--seat\)/);
});

// ---- 4.4 the 💡 in every game ----
import { stepHint } from '../js/games/kit.js';
import { uncoveredPoints, traceCoverage } from '../js/logic.js';
import { readdirSync } from 'node:fs';

const fakeButton = () => {
  const cls = new Set();
  return { classList: { add: (c) => cls.add(c), remove: (c) => cls.delete(c), contains: (c) => cls.has(c) }, has: (c) => cls.has(c) };
};

test('a step hint lights the next thing to do, moves on with each right step, and comes by itself after two misses', async () => {
  const said = [];
  let hintFn = null;
  const ctx = { say: (k) => said.push(k), setHint: (fn) => (hintFn = fn), alive: () => true };
  const steps = [fakeButton(), fakeButton(), fakeButton()];
  let at = 0;
  const h = stepHint(ctx, () => steps[at]);
  assert.equal(typeof hintFn, 'function', 'the 💡 is on');
  hintFn();
  assert.ok(steps[0].has('hint'));
  assert.deepEqual(said, ['hintLook']);
  assert.equal(h.used, 1);
  // a right step: the glow goes, the next one is lit on the next hint
  h.step();
  at = 1;
  assert.ok(!steps[0].has('hint'));
  h.hint();
  assert.ok(steps[1].has('hint'));
  // two wrong taps: the hint comes without asking
  h.step();
  at = 2;
  h.miss();
  h.miss();
  await new Promise((r) => setTimeout(r, 1400));
  assert.ok(steps[2].has('hint'));
  h.done();
  assert.ok(!steps[2].has('hint'));
  assert.equal(hintFn, null, 'the 💡 hides when the round is over');
});

test('a step hint can show something other than a glow (the tracing spots), and does nothing when there is nothing left', () => {
  const shown = [];
  const ctx = { say: () => {}, setHint: () => {} };
  let left = [{ x: 1, y: 1 }];
  const h = stepHint(ctx, () => (left.length ? left : null), { show: (spots) => shown.push(spots.length), say: 'hintTrace', autoAfter: 0 });
  h.hint();
  left = [];
  h.hint();
  assert.deepEqual(shown, [1]);
});

test('the tracing hint finds the parts of the letter not driven over yet', () => {
  const targets = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 50, y: 50 },
  ];
  const trail = [{ x: 1, y: 1 }, { x: 11, y: 0 }];
  assert.deepEqual(uncoveredPoints(targets, trail, 3), [{ x: 50, y: 50 }]);
  assert.equal(uncoveredPoints(targets, [...trail, { x: 50, y: 49 }], 3).length, 0);
  // the hint and the finish line agree on what is covered
  assert.equal(targets.length - uncoveredPoints(targets, trail, 3).length, Math.round(traceCoverage(targets, trail, 3) * targets.length));
});

test('every game turns the 💡 on: answers go through choose() with ctx, and step-by-step games use stepHint()', () => {
  const games = readdirSync(new URL('../js/games/', import.meta.url)).filter((f) => f.endsWith('.js') && f !== 'kit.js');
  for (const f of games) {
    const src = read(`js/games/${f}`);
    const calls = src.match(/choose\([\s\S]*?\)\s*[;.]/g) || [];
    for (const c of calls) assert.match(c, /\{\s*ctx\b/, `${f}: choose() without ctx has no 💡: ${c.slice(0, 80)}`);
  }
  for (const g of ['construction', 'sentence', 'sequence', 'matra', 'railway', 'trace']) assert.match(read(`js/games/${g}.js`), /stepHint\(ctx/, g);
  // the phrases the hints say are recorded
  for (const k of ['hintOne', 'hintLook', 'hintTrace', 'hintAny']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
  assert.match(css, /\.mound\.hint/);
});

// ---- 4.5 "how to play" for first-timers ----
import { COACH_KINDS, coachKey, needsCoach, coachPath } from '../js/coach.js';
import { normalizeProgress, defaultProgress } from '../js/logic.js';

test('each kind of game is shown once per child', () => {
  assert.equal(coachKey('busdepot', 'tap'), 'busdepot:tap');
  assert.ok(needsCoach([], 'busdepot', 'tap'));
  assert.ok(!needsCoach(['busdepot:tap'], 'busdepot', 'tap'));
  assert.ok(needsCoach(['busdepot:tap'], 'construction', 'tap'), 'another game is shown again');
  assert.ok(needsCoach(['construction:each'], 'construction', 'order'), 'another part of the same game is shown too');
  assert.ok(!needsCoach([], 'busdepot', 'juggle'), 'only known kinds');
  // what has been shown is kept with the progress (and so in backups), cleanly
  assert.deepEqual(defaultProgress(content).coached, []);
  const p = normalizeProgress({ coached: ['busdepot:tap', 'busdepot:tap', 'trace:drag', 42, 'Bad Key', null] }, content);
  assert.deepEqual(p.coached, ['busdepot:tap', 'trace:drag']);
  assert.deepEqual(normalizeProgress({}, content).coached, []);
});

test('the hand moves over every answer without picking one, taps the first step, or drags along the letter', () => {
  const r = (left, top, w = 100, h = 100) => ({ left, top, width: w, height: h });
  const tap = coachPath('tap', [r(0, 0), r(200, 0), r(400, 0)]);
  assert.equal(tap.length, 4);
  assert.ok(tap.every((p) => !p.press), 'it never presses an answer');
  assert.deepEqual(new Set(tap.slice(0, 3).map((p) => p.x)).size, 3);
  const order = coachPath('order', [r(50, 50)]);
  assert.equal(order.filter((p) => p.press).length, 2);
  assert.ok(order.every((p) => p.x === order[1].x));
  const drag = coachPath('drag', [r(0, 0, 400, 400)]);
  assert.ok(drag.filter((p) => p.press).length >= 2 && drag[1].x < drag[3].x && drag[1].y > drag[3].y, 'drags up and across');
  assert.deepEqual(coachPath('tap', []), []);
});

test('every kind has its line, recorded, and the games say which kind they wait for', () => {
  for (const [kind, key] of Object.entries(COACH_KINDS)) assert.ok(content.phrases[key]?.hi && content.phrases[key]?.en, kind);
  const kit = read('js/games/kit.js');
  assert.match(kit, /setHint\?\.\(hint, \{ kind: 'tap', targets: buttons \}\)/);
  assert.match(read('js/games/construction.js'), /coach: 'each'/);
  assert.match(read('js/games/trace.js'), /coach: 'drag'/);
  assert.match(read('js/games/railway.js'), /coach: 'any'/);
  assert.match(read('js/games/story.js'), /ctx\.coach\?\.\('page', \[next\]\)/);
  assert.match(read('sw.js'), /'js\/coach\.js'/);
  assert.match(read('js/parent.js'), /progress\.coached = \[\]/);
});

// ---- 4.6 grown-up text behind an ⓘ ----
test('notes for grown-ups on child screens sit behind an ⓘ', () => {
  const ui = read('js/ui.js');
  assert.match(ui, /export function infoButton\(scope/);
  assert.match(ui, /export const forGrownups/);
  // hidden until the ⓘ is tapped, everywhere the scope is marked
  assert.match(css, /\.grownup-scope:not\(\.show-grownup\) \.for-grownups \{\s*display: none !important;/);
  const shows = read('js/shows.js');
  assert.match(shows, /forGrownups\(el\('p', \{ class: 'mode-note'/, 'Show time: how the modes work');
  assert.match(shows, /forGrownups\(el\('span', \{ class: 'show-teaches', text: show\.teaches\.en \}\)\)/, 'Show time: what each episode teaches');
  assert.match(shows, /forGrownups\(el\('p', \{ class: 'radio-note' \}\)\)/, 'Story radio: the dark screen');
  assert.match(shows, /infoButton\(screen/);
  const comic = read('js/games/comic.js');
  assert.match(comic, /forGrownups\(el\('p', \{ class: 'comic-howto'/, 'comic covers');
  assert.match(comic, /infoButton\(cover/);
  const screens = read('js/screens.js');
  assert.match(screens, /forGrownups\(el\('p', \{ class: 'rest-note'/, 'the break screen');
  assert.match(screens, /forGrownups\(el\('p', \{ class: 'voice-tip-steps'/, 'the voice setup steps');
  // no long English sentence for grown-ups is left showing on Show time's cards
  assert.doesNotMatch(shows, /el\('span', \{ text: 'Story radio: stories and rhymes/);
});

// ---- 4.7 tablet layouts ----
test('on a tablet the hub top is two columns, world cards are bigger and the map stops grow', () => {
  const screens = read('js/screens.js');
  assert.match(screens, /el\('div', \{ class: 'hub-top' \}, \[\s*\(simple \? playHero : todayCard\)/, "today's path first");
  assert.match(screens, /el\('div', \{ class: 'hub-side' \}, \[\s*showtime,/, 'Show time, Story radio and Play together beside it');
  const tablet = css.slice(css.indexOf('/* ---- tablets (roadmap 4.7)'));
  assert.match(tablet, /@media \(min-width: 760px\) and \(min-height: 600px\)/);
  assert.match(tablet, /\.hub-top \{[^}]*grid-template-columns: minmax\(0, 1\.55fr\) minmax\(250px, 1fr\)/);
  assert.match(tablet, /\.world-cards \{[^}]*minmax\(min\(100%, 340px\), 1fr\)/);
  assert.match(tablet, /\.node \{[^}]*width: 124px/);
  // phones keep their layout: none of it applies below the breakpoint
  const before = css.slice(0, css.indexOf('/* ---- tablets (roadmap 4.7)'));
  assert.doesNotMatch(before, /\.hub-top \{/);
});

// ---- 5.3 a guide that reacts to every answer ----
import { REACTION_BUBBLES } from '../js/mascot.js';

test('the guide claps, thinks along and encourages, with a bubble that says so', () => {
  assert.deepEqual(Object.keys(REACTION_BUBBLES).sort(), ['cheer', 'clap', 'dance', 'encourage', 'think']);
  const app = read('js/app.js');
  assert.match(app, /mascot\.react\(firstTry \? 'clap' : 'cheer'\)/, 'right: clap, or cheer after help');
  assert.match(app, /miss\(\) \{[^}]*mascot\.react\('encourage'\)/, 'wrong: encourage');
  assert.match(app, /if \(fn && !coaching\) mascot\.react\('think'\)/, 'a new question: think');
  // every wrong tap reaches the guide, from the shared answer handler too, and only once
  assert.match(read('js/games/kit.js'), /ctx\?\.miss\?\.\(\);\s*onWrong\?\.\(b\)/);
  for (const g of ['math', 'phonics']) assert.doesNotMatch(read(`js/games/${g}.js`), /ctx\.miss\(\)/, `${g} doesn't report a miss twice`);
  for (const k of ['clap', 'think', 'encourage']) assert.match(css, new RegExp(`\\.mascot\\.m-${k} `), k);
  assert.match(css, /\.mascot-corner \.mascot\.small \{\s*width: clamp\(96px/, 'bigger in lessons');
  assert.match(css, /prefers-reduced-motion: reduce\) \{\s*\.mascot\.m-clap \.m-arm-l/);
});

// ---- 5.4 shared-element transitions ----
test('a tapped world, lesson, story or episode grows into its screen, and shrinks back', () => {
  const app = read('js/app.js');
  assert.match(app, /function grow\(change, from, to\)/);
  assert.match(app, /document\.startViewTransition\(/);
  assert.match(app, /prefers-reduced-motion: reduce/, 'not with reduce motion');
  assert.match(app, /typeof document\.startViewTransition === 'function'/, 'not where unsupported');
  assert.match(app, /grow: from\.dataset\.grow/, 'the route remembers its card');
  assert.match(app, /\[data-grow="\$\{CSS\.escape\(leaving\.grow\)\}"\]/, 'back shrinks into the same card');
  const screens = read('js/screens.js');
  for (const k of ['world:', 'lesson:', 'story:']) assert.ok(screens.includes(`'data-grow': \`${k}`), k);
  for (const from of ['{ from: c }', '{ from: node }', '{ from: b }', '{ from: play }']) assert.ok(screens.includes(from), from);
  assert.ok(read('js/shows.js').includes("'data-grow': `show:"));
  assert.match(css, /::view-transition-group\(grow\) \{[^}]*animation-duration: 0\.42s/);
  assert.match(css, /\.growing \.enter \{\s*animation: none;/);
});

// ---- 5.5 the motion budget ----
import { tooSlow, liteMotion, MOTION_MODES } from '../js/motion.js';
import { normalizeSettings, defaultSettings } from '../js/logic.js';

test('a device is slow when frames run under 40 a second, or a fifth miss the budget; hidden-tab gaps do not count', () => {
  const run = (ms, n = 120) => Array(n).fill(ms);
  assert.equal(tooSlow(run(16.7)), false, '60 fps');
  assert.equal(tooSlow(run(22)), false, '45 fps');
  assert.equal(tooSlow(run(30)), true, '33 fps');
  assert.equal(tooSlow([...run(16.7, 90), ...run(50, 30)]), true, 'a quarter of the frames janky');
  assert.equal(tooSlow([...run(16.7, 110), ...run(50, 10)]), false, 'a few janky frames');
  assert.equal(tooSlow([...run(16.7, 100), ...run(5000, 40)]), false, 'the tab was in the background');
  assert.equal(tooSlow(run(40, 20)), false, 'too few frames to say');
});

test('lighter animations: chosen, or automatic on a slow device; the setting is kept cleanly', () => {
  assert.deepEqual(MOTION_MODES, ['auto', 'full', 'lite']);
  assert.equal(liteMotion('auto', false), false);
  assert.equal(liteMotion('auto', true), true);
  assert.equal(liteMotion('full', true), false, 'full always wins');
  assert.equal(liteMotion('lite', false), true);
  assert.equal(defaultSettings(content).motion, 'auto');
  assert.equal(normalizeSettings({ motion: 'lite' }, content).motion, 'lite');
  assert.equal(normalizeSettings({ motion: 'turbo' }, content).motion, 'auto');
});

test('lighter animations drop what stuttered and keep what teaches', () => {
  const lite = css.slice(css.indexOf('/* lighter animations (html.lite'));
  for (const sel of ['.lite .backdrop *', '.lite .world-card-mascot *', '.lite .life', '.lite .layer', '.lite .glass']) assert.ok(lite.includes(sel), sel);
  assert.ok(!/\.lite \.scene|\.lite \.mascot-corner|\.lite \.stage/.test(lite), 'story scenes, the guide and the games keep moving');
  const app = read('js/app.js');
  assert.match(app, /const canGrow = \(\) => [^;]*!isLite\(\)/, 'no grow transition');
  assert.match(app, /if \(isLite\(\)\) return; \/\/ lighter animations: the background stays still/, 'no parallax');
  assert.match(read('js/ui.js'), /contains\('lite'\)\) count = Math\.min\(count, 4\)/, 'fewer sparkles');
  assert.match(read('js/parent.js'), /'Lighter \(for slower phones\)'/);
  assert.match(read('sw.js'), /'js\/motion\.js'/);
  // cheaper maps for everyone
  const screens = read('js/screens.js');
  assert.match(screens, /new ResizeObserver\(draw\)\.observe\(path\)/);
  assert.match(screens, /requestAnimationFrame\(\(\) => setTimeout\(\(\) => \(\(pending = 0\), drawTrail\(path, walked\)\), 0\)\)/, 'the trail is drawn after the map paints');
  assert.match(css, /\.path > \.unit \{\s*content-visibility: auto;/);
  assert.doesNotMatch(screens, /mini-star [^']*', html: ICONS\.star/, 'CSS stars');
});

// ---- 5.6 Hindi text animation ----
import { strokeOrder, skeleton } from '../js/logic.js';
import { sayPieces } from '../js/games/kit.js';

test('a thick shape thins to its one-cell centre line', () => {
  // a bar 5 cells tall and 20 long becomes a line one cell tall
  const w = 24;
  const h = 9;
  const mask = new Uint8Array(w * h);
  for (let y = 2; y <= 6; y++) for (let x = 2; x <= 21; x++) mask[y * w + x] = 1;
  const thin = skeleton(mask, w, h);
  const rows = new Set();
  let n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (thin[y * w + x]) (rows.add(y), n++);
  assert.equal(rows.size, 1, 'one row');
  assert.ok(n >= 12, 'most of the length is kept');
  assert.equal(mask.reduce((a, v) => a + v, 0), 100, 'the input is untouched');
});

test('a Hindi letter is written body first, then the standing line, then the top line, then marks above', () => {
  const step = 6;
  const pts = [];
  for (let x = 0; x <= 120; x += step) pts.push({ x, y: 30 }); // the top line
  for (let y = 36; y <= 150; y += step) pts.push({ x: 102, y }); // the standing line
  for (let y = 36; y <= 96; y += step) pts.push({ x: 18, y }); // the body: down the left...
  for (let x = 24; x <= 84; x += step) pts.push({ x, y: 96 }); // ...and along the bottom
  for (let y = 0; y <= 18; y += step) pts.push({ x: 60, y }); // a mark above the top line
  const s = strokeOrder(pts, { step });
  assert.deepEqual(s.map((t) => t.kind), ['body', 'stem', 'line', 'mark']);
  const [body, stem, line] = s;
  assert.deepEqual(body.pts[0], { x: 18, y: 36 }, 'the body starts at its loose end, top left');
  assert.ok(stem.pts[0].y < stem.pts.at(-1).y, 'the standing line goes down');
  assert.ok(line.pts[0].x < line.pts.at(-1).x, 'the top line goes left to right');
  // a Latin letter is only its pen paths
  assert.ok(strokeOrder(pts, { step, devanagari: false }).every((t) => t.kind === 'body'));
  assert.deepEqual(strokeOrder([], { step }), []);
});

test('the tracing letter writes itself first, and syllables pop as they are said', async () => {
  const trace = read('js/games/trace.js');
  assert.match(trace, /const strokes = strokeOrder\(centre, \{ step: cell, devanagari: letter\.lang === 'hi' \}\)/);
  assert.match(trace, /writeItself\(\);\s*prompt\(\);/);
  assert.match(trace, /prefers-reduced-motion: reduce/, 'not with reduce motion');
  assert.match(read('js/games/matra.js'), /sayPieces\(ctx, tiles, row\.map\(\(r\) => r\.text\), 'hi'/);
  assert.match(read('js/games/construction.js'), /await sayPieces\(ctx, slots, tiles, lang\);/);
  assert.match(css, /@keyframes say-pop/);
  // sayPieces says each piece in turn, and stops when asked
  const said = [];
  const node = () => ({ classList: { add() {}, remove() {} }, offsetWidth: 0 });
  const ctx = { alive: () => true, sayText: async (t) => said.push(t) };
  assert.equal(await sayPieces(ctx, [node(), node()], ['ब', 'स'], 'hi'), true);
  assert.deepEqual(said, ['ब', 'स']);
  let go = true;
  ctx.sayText = async (t) => (said.push(t), (go = false));
  assert.equal(await sayPieces(ctx, [node(), node()], ['क', 'ल'], 'hi', () => go), false);
  assert.deepEqual(said, ['ब', 'स', 'क']);
});

// ---- 5.7 haptics and sound polish ----
import { FEEDBACK, sfxLevel, SFX_LEVEL, musicLevel as musicAt, sfx } from '../js/sfx.js';

test('one soft sound and one touch per kind of interaction', () => {
  assert.deepEqual(Object.keys(FEEDBACK), ['tap', 'select', 'place', 'right', 'wrong', 'reward', 'page']);
  // each kind sounds different, and each has its own vibration
  assert.equal(new Set(Object.values(FEEDBACK).map((f) => f.sound)).size, 7);
  assert.equal(new Set(Object.values(FEEDBACK).map((f) => JSON.stringify(f.haptic))).size, 7);
  for (const f of Object.values(FEEDBACK)) assert.equal(typeof sfx[f.sound], 'function', f.sound);
  // used where they belong
  assert.match(read('js/app.js'), /miss\(\) \{\s*sfx\.feel\('wrong'\)/);
  assert.match(read('js/games/kit.js'), /ctx\.sfx\.feel \? ctx\.sfx\.feel\('right'\)/);
  for (const g of ['construction', 'sentence', 'sequence']) assert.match(read(`js/games/${g}.js`), /ctx\.sfx\.feel\('place'\)/, g);
  assert.match(read('js/games/story.js'), /ctx\.sfx\.feel\('page'\)/);
  assert.match(read('js/freeplay.js'), /api\.sfx\.feel\('select'\)/);
  assert.match(read('js/app.js'), /closest\?\.\('\.round-btn, \.bubble, \.info-btn'\) && sfx\.feel\('tap'\)/);
  // a wrong tap is felt once, not twice
  assert.doesNotMatch(read('js/games/kit.js'), /haptic\?\.\(\[18, 60, 18\]\)/);
});

test('everything sits back under speech: the music everywhere, and the sound effects too', () => {
  assert.ok(musicAt('free', true) <= musicAt('free', false) * 0.15 + 1e-9, 'music on the home screen and maps');
  assert.ok(musicAt('lesson', true) < musicAt('lesson', false) * 0.1, 'music in lessons');
  assert.equal(sfxLevel(false), SFX_LEVEL);
  assert.equal(sfxLevel(true), SFX_LEVEL / 2);
});
