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
