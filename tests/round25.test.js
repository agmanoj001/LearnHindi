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
