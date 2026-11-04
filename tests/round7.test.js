import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trailPath, PRAISE } from '../js/screens.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const DEVANAGARI = /[ऀ-ॿ]/;

test('map trail: one smooth curve through every lesson stop, in order', () => {
  assert.equal(trailPath([]), '');
  assert.equal(trailPath([[10, 20]]), 'M10 20');
  const pts = [[100, 50], [160, 200], [100, 350], [40, 500]];
  const d = trailPath(pts);
  assert.ok(d.startsWith('M100 50'));
  const curves = d.match(/C/g) || [];
  assert.equal(curves.length, pts.length - 1);
  // each curve ends on the next stop
  const ends = [...d.matchAll(/C[^C]*?(-?[\d.]+) (-?[\d.]+)(?= C|$)/g)].map((m) => [+m[1], +m[2]]);
  assert.deepEqual(ends, pts.slice(1));
  assert.ok(!/NaN/.test(d));
});

test('results praise: a ribbon for every star count, Hindi and English', () => {
  assert.equal(PRAISE.length, 4);
  for (const p of PRAISE) {
    assert.ok(DEVANAGARI.test(p.hi), p.hi);
    assert.ok(p.en && !DEVANAGARI.test(p.en), p.en);
  }
});

test('round 7 stories: Panchatantra, Akbar–Birbal, folk tales and rhymes are all in', () => {
  const ids = new Set(content.stories.map((s) => s.id));
  for (const id of ['jackal-drum', 'four-friends', 'pot-dreams', 'birbal-parrot', 'birbal-well', 'birbal-bottle', 'golden-swan', 'hare-moon', 'twinkle', 'humpty', 'rhyme-machhli', 'rhyme-chanda'])
    assert.ok(ids.has(id), id);
  const poems = content.stories.filter((s) => s.kind === 'poem');
  assert.ok(poems.filter((s) => s.lang === 'en').length >= 8, 'English nursery rhymes');
  assert.ok(poems.filter((s) => s.lang !== 'en').length >= 13, 'Hindi बाल गीत');
  // every story is reachable: some lesson or a library at its level plays it
  const lessonStories = new Set(content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => l.config?.story).filter(Boolean))));
  for (const id of ['jackal-drum', 'birbal-well', 'twinkle', 'rhyme-chanda']) assert.ok(lessonStories.has(id), `${id} has a lesson`);
});
