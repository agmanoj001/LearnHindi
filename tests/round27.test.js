// Round 27: the remaining items of roadmap sections 1, 3, 8 and 9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as L from '../js/logic.js';
import { changesSince, changeDate } from '../js/changes.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const content = JSON.parse(read('content.json'));
const DEVANAGARI = /[ऀ-ॿ]/;

test('3.3 easier reading: off by default, saved per child, and styled for every reading surface', () => {
  assert.equal(L.defaultSettings(content).readingComfort, false);
  assert.equal(L.normalizeSettings({ readingComfort: true }, content).readingComfort, true);
  assert.equal(L.normalizeSettings({ readingComfort: 'yes' }, content).readingComfort, false);
  const css = read('styles.css');
  for (const c of ['story-page', 'story-line', 'comic-bubble', 'gr-rule']) assert.match(css, new RegExp(`\\.reading-comfort[^{]*\\.${c}`), c);
  // Devanagari is never letter-spaced (it would break the line along the top of each word)
  const block = css.slice(css.indexOf('easier reading (roadmap 3.3)'));
  for (const m of block.matchAll(/([^{}]+)\{[^}]*letter-spacing/g)) assert.match(m[1], /\.en|:lang\(en\)/, `letter-spacing only for English: ${m[1].trim()}`);
});

test("8.6 what's new: changes.json is newest first, matches the service worker, and is cached", () => {
  const { changes } = JSON.parse(read('changes.json'));
  const sw = read('sw.js');
  const version = sw.match(/const VERSION = '([^']+)'/)[1];
  assert.equal(changes[0].version, version, 'the newest entry in changes.json is the version in sw.js: add a line for what this version brings');
  assert.equal(new Set(changes.map((c) => c.version)).size, changes.length, 'one entry per version');
  for (const c of changes) {
    assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/, c.version);
    assert.match(c.hi, DEVANAGARI, c.version);
    assert.ok(c.en, c.version);
    assert.ok(c.items?.length, c.version);
    for (const i of c.items) assert.ok(DEVANAGARI.test(i.hi) && i.en, `${c.version}: ${i.en}`);
  }
  for (let k = 1; k < changes.length; k++) assert.ok(changes[k - 1].date >= changes[k].date, 'newest first');
  assert.match(sw, /'changes\.json'/);
  assert.match(sw, /'js\/changes\.js'/);
});

test("8.6 what's new: the bar shows what is newer than the running version", () => {
  const cs = [{ version: 'v3' }, { version: 'v2' }, { version: 'v1' }];
  assert.deepEqual(changesSince(cs, 'v3'), []);
  assert.deepEqual(changesSince(cs, 'v1').map((c) => c.version), ['v3', 'v2']);
  assert.deepEqual(changesSince(cs, 'v0').map((c) => c.version), ['v3']);
  assert.deepEqual(changesSince(cs, null).map((c) => c.version), ['v3']);
  assert.match(changeDate('2026-11-18'), /2026/);
  assert.equal(changeDate('not a date'), 'not a date');
  const app = read('js/app.js');
  assert.match(app, /changesSince\(await loadChanges\(\), state\.runningVersion\)/);
  assert.match(app, /class: 'update-more'/);
  assert.match(read('js/parent.js'), /whatsNewSection\(api\)/);
});
