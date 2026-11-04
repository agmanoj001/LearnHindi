import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as C from '../js/curriculum.js';
import * as L from '../js/logic.js';
import { PLACEMENT, PLACEMENT_LEVELS, placementResult, placementQuestions } from '../js/placement.js';
import { translateText, PARENT_HI_KEYS } from '../js/parent-hi.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const DEVANAGARI = /[ऀ-ॿ]/;

test('placement: two questions per level, every answer offered, picture options are real words', () => {
  for (const level of PLACEMENT_LEVELS) {
    const qs = placementQuestions(level);
    assert.equal(qs.length, 2, level);
    assert.ok(content.levels.some((l) => l.id === level));
    for (const q of qs) {
      assert.ok(q.options.includes(q.answer), q.ask.en);
      if (q.pictures) for (const o of q.options) assert.ok(content.words[o], o);
    }
  }
  assert.equal(PLACEMENT.length, 10);
});

test('placement: start at the first level the child does not know yet', () => {
  assert.equal(placementResult({}), null);
  assert.equal(placementResult({ kg: 1 }), 'kg');
  assert.equal(placementResult({ kg: 2 }), null);
  assert.equal(placementResult({ kg: 2, grade1: 2, grade2: 0 }), 'grade2');
  assert.equal(placementResult({ kg: 2, grade1: 2, grade2: 2, grade3: 2, grade4: 2 }), 'grade4');
});

test('learning gains: first and latest score for lessons played twice', () => {
  const town = content.worlds.find((w) => w.id === 'town');
  const lesson = C.worldLessons(town)[0];
  let p = L.defaultProgress(content);
  p = C.applyLessonResult(p, { world: town, lesson, collection: null, firstTry: 3, answered: 6 }).progress;
  assert.equal(C.learningGains(p, content).rows.length, 0, 'one play is not enough');
  p = C.applyLessonResult(p, { world: town, lesson, collection: null, firstTry: 6, answered: 6 }).progress;
  const g = C.learningGains(p, content);
  assert.equal(g.rows.length, 1);
  assert.deepEqual([g.rows[0].first, g.rows[0].recent, g.rows[0].gain], [50, 100, 50]);
  const again = L.normalizeProgress(JSON.parse(JSON.stringify(p)), content);
  assert.equal(again.lessons[lesson.id].first, 50);
  assert.equal(again.lessons[lesson.id].recent, 100);
});

test('settings: tell-it-back is off until a grown-up turns it on; the parent area can be in Hindi', () => {
  const s = L.normalizeSettings({}, content);
  assert.equal(s.retell, false);
  assert.equal(s.parentLang, 'en');
  assert.equal(L.normalizeSettings({ parentLang: 'hi', retell: true }, content).parentLang, 'hi');
  assert.equal(L.normalizeSettings({ parentLang: 'fr' }, content).parentLang, 'en');
});

test('the Hindi parent area translates headings, notes and numbers', () => {
  for (const k of PARENT_HI_KEYS) assert.match(translateText(k), DEVANAGARI, k);
  assert.equal(translateText('Grown-ups'), 'बड़ों के लिए');
  assert.equal(translateText('30 minutes a day'), '30 मिनट रोज़');
  assert.match(translateText('This week: 42 minutes, 7 lessons played. No reviews due.'), /42 मिनट, 7 पाठ/);
  assert.equal(translateText('Something new'), null);
  // every section heading in the parent area has a translation
  const src = readFileSync(new URL('../js/parent.js', import.meta.url), 'utf8');
  for (const [, title] of src.matchAll(/section\(\s*'([^']+)'/g)) assert.ok(translateText(title), title);
  for (const [, title] of src.matchAll(/toggle\(\s*'([^']+)'/g)) assert.ok(translateText(title), title);
});
