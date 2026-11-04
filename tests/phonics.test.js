import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PHONICS, PHONICS_IDS, PIC, makePhonics, phonicsName, soundOf } from '../js/phonicsgen.js';
import { pictureExists } from '../js/art.js';
import { worldLessons } from '../js/curriculum.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

test('every phonics word has a picture', () => {
  for (const [w, p] of Object.entries(PIC)) assert.ok(pictureExists(p), `${w} → ${p}`);
});

test('every phonics skill, level and option count makes a fair question', () => {
  const rng = seeded(11);
  for (const id of PHONICS_IDS) {
    for (const tier of [0, 1, 2]) {
      for (const n of [2, 3, 4]) {
        for (let i = 0; i < 80; i++) {
          const p = makePhonics(id, { tier, n, rng });
          const values = p.options.map((o) => String(o.value));
          const at = `${id} t${tier} n${n}: ${values} / ${p.answer}`;
          assert.ok(values.includes(String(p.answer)), at);
          assert.equal(new Set(values).size, values.length, at);
          assert.ok(values.length >= 2, at);
          assert.ok(p.ask && p.explain, id);
          for (const o of p.options) assert.ok(o.label || o.pic, `${id}: every option shows something`);
          if (p.pic) assert.ok(pictureExists(p.pic), `${id}: ${p.pic}`);
          // a gap in a word hides exactly the answer (vowel and pattern questions)
          if (p.word?.gap) assert.equal(p.word.text.slice(...p.word.gap), String(p.answer), at);
          if (p.tiles) assert.equal(p.tiles.join(''), p.answer, at);
        }
      }
    }
  }
});

test('sounds come with a key word, so text-to-speech never has to say a bare phoneme', () => {
  assert.equal(soundOf('c'), 'c, as in cat');
  assert.equal(soundOf('B'), 'B, as in bus');
});

test('magic-e decoys are made-up spellings, never other real words or names', () => {
  const rng = seeded(3);
  for (let i = 0; i < 100; i++) {
    const p = makePhonics('g1-magic-e', { tier: 2, n: 3, rng });
    for (const o of p.options) assert.ok(!['kate', 'coke', 'bane', 'rase'].includes(o.value), o.value);
  }
});

test('the phonics worlds teach every phonics skill, with NC foundational reading codes', () => {
  const english = content.worlds.filter((w) => w.subject === 'english');
  assert.deepEqual(
    english.map((w) => [w.level, w.lang]),
    [
      ['kg', 'en'],
      ['grade1', 'en'],
    ],
  );
  const used = new Set();
  for (const w of english) {
    const prefix = w.level === 'kg' ? 'k-' : 'g1-';
    for (const l of worldLessons(w)) if (l.game === 'phonics') for (const s of l.config.skills) (assert.ok(s.startsWith(prefix), s), used.add(s));
  }
  assert.deepEqual(PHONICS_IDS.filter((s) => !used.has(s)), []);
  for (const s of Object.values(PHONICS)) assert.match(s.code, /^NC\.(K|1)\.RF\.\d/);
  assert.match(phonicsName('g1-digraphs'), /\(NC\.1\.RF\.3a\)/);
});
