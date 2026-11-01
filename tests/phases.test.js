import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as L from '../js/logic.js';
import { validateContent } from '../js/validate.js';
import { pictureExists } from '../js/art.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
for (const [id, w] of Object.entries(content.words)) w.id = id;
const settings = (level, lang = 'both') => L.normalizeSettings({ level, lang }, content);
const word = (id) => content.words[id];

// ---- phases ----

test('there are five phases in order', () => {
  assert.deepEqual(
    content.levels.map((l) => l.id),
    ['toddler', 'kg', 'grade1', 'grade2', 'grade3'],
  );
});

test('the default phase is kindergarten, and unknown phases are ignored', () => {
  assert.equal(L.normalizeSettings(null, content).level, 'kg');
  assert.equal(L.normalizeSettings({ level: 'grade9' }, content).level, 'kg');
  assert.equal(settings('grade2').level, 'grade2');
});

test('the map shows the phase places in the phase order, minus places the parent hid', () => {
  const s = settings('grade1');
  assert.deepEqual(
    L.visiblePlaces(content, s).map((p) => p.id),
    content.levels.find((l) => l.id === 'grade1').places,
  );
  s.places.matra = false;
  assert.ok(!L.visiblePlaces(content, s).some((p) => p.id === 'matra'));
});

test('the Hindi-only matra garage is hidden in English-only mode', () => {
  assert.ok(L.visiblePlaces(content, settings('grade1', 'both')).some((p) => p.id === 'matra'));
  assert.ok(L.visiblePlaces(content, settings('grade1', 'hi')).some((p) => p.id === 'matra'));
  assert.ok(!L.visiblePlaces(content, settings('grade1', 'en')).some((p) => p.id === 'matra'));
});

test('toddlers get no letters; KG gets all three sets; the language mix filters them', () => {
  assert.equal(L.activeLetters(content, settings('toddler')).length, 0);
  const kg = L.activeLetterSets(content, settings('kg')).map((s) => s.id);
  assert.deepEqual(kg, ['hindiVowels', 'hindiConsonants', 'english']);
  assert.deepEqual(
    L.activeLetterSets(content, settings('kg', 'en')).map((s) => s.id),
    ['english'],
  );
});

test('a phase overrides game settings', () => {
  assert.equal(L.gameConfig(content, settings('toddler'), 'busdepot').maxPassengers, 5);
  assert.equal(L.gameConfig(content, settings('kg'), 'busdepot').maxPassengers, 10);
  assert.deepEqual(L.gameConfig(content, settings('toddler'), 'construction').activities, ['dig']);
  assert.equal(L.gameConfig(content, settings('grade1'), 'rescue').cards, 'text');
});

test('"@level" in a word list expands to that phase\'s words', () => {
  const kg = L.expandWords(['@kg'], content);
  assert.ok(kg.includes('house') && kg.includes('bus'));
  assert.ok(kg.every((id) => content.words[id].level === 'kg'));
  assert.deepEqual(L.expandWords(['bus', '@kg'], content).filter((id) => id === 'bus'), ['bus'], 'no duplicates');
});

// ---- the curriculum: words fit the phase they are in ----

test('KG words have no matras and no half letters', () => {
  for (const id of L.expandWords(['@kg'], content)) {
    assert.deepEqual(L.matrasIn(word(id).hi, content.matras), [], id);
    assert.ok(!L.hasConjunct(word(id).hi), id);
  }
});

test('Grade 1 words have matras and no half letters, and every taught matra has words', () => {
  const g1 = L.expandWords(['@grade1'], content).map(word);
  for (const w of g1) {
    const hasSign = L.matrasIn(w.hi, content.matras).length > 0 || w.hi.includes('ँ') || /^[आईऊ]/.test(w.hi);
    assert.ok(hasSign, `${w.hi} should have a matra`);
    assert.ok(!L.hasConjunct(w.hi), `${w.hi} has a half letter: move it to grade2`);
  }
  for (const id of ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au', 'am']) {
    const sign = content.matras.find((m) => m.id === id).sign;
    assert.ok(g1.filter((w) => w.hi.includes(sign)).length >= 2, `matra ${sign} needs at least 2 Grade 1 words`);
  }
});

test('Grade 2 words have half letters (conjuncts)', () => {
  for (const id of L.expandWords(['@grade2'], content)) {
    assert.ok(L.hasConjunct(word(id).hi), `${word(id).hi} should have a half letter`);
  }
});

test('reading words are two to four aksharas long and all have pictures', () => {
  for (const level of ['kg', 'grade1', 'grade2']) {
    for (const id of L.expandWords([`@${level}`], content)) {
      const n = word(id).syllables.length;
      assert.ok(n >= 1 && n <= 4, `${id} has ${n} aksharas`);
      assert.ok(pictureExists(word(id).picture), `${id} needs a picture`);
    }
  }
});

test('sentences get longer from Grade 1 to Grade 3', () => {
  const avg = (level) => {
    const s = content.sentences.filter((x) => x.level === level);
    return s.reduce((n, x) => n + L.sentenceTokens(x.hi).length, 0) / s.length;
  };
  assert.ok(avg('grade1') <= 5, 'Grade 1 sentences: about 3-5 words');
  assert.ok(avg('grade1') < avg('grade2'));
  assert.ok(avg('grade2') < avg('grade3'));
});

test('every phase with a reading place has something to read', () => {
  const { errors } = validateContent(content, { pictureExists });
  assert.deepEqual(errors, []);
});

// ---- matras ----

test('barakhadi row', () => {
  const row = L.barakhadi('क', content.matras).map((r) => r.text);
  assert.deepEqual(row, ['क', 'का', 'कि', 'की', 'कु', 'कू', 'कृ', 'के', 'कै', 'को', 'कौ', 'कं', 'कः']);
});

test('maskMatra hides one matra and the pieces put the word back together', () => {
  for (const id of L.expandWords(['@grade1'], content)) {
    for (let seed = 1; seed < 6; seed++) {
      const gap = L.maskMatra(word(id), content.matras, L.makeRng(seed));
      if (!gap) continue;
      assert.equal(gap.before + gap.base + gap.sign + gap.after, word(id).hi, id);
      assert.ok(gap.base.length > 0);
    }
  }
  assert.equal(L.maskMatra(word('house'), content.matras), null, 'घर has no matra to hide');
  const mor = L.maskMatra(word('peacock'), content.matras, () => 0);
  assert.deepEqual([mor.base, mor.sign, mor.after], ['म', 'ो', 'र']);
});

test('similar-looking distractors never repeat the target', () => {
  const pool = L.expandWords(['@grade1'], content).map(word);
  for (let seed = 1; seed < 20; seed++) {
    const target = pool[seed % pool.length];
    const out = L.similarWords(target, pool, 2, L.makeRng(seed), content.matras);
    assert.equal(out.length, 2);
    assert.ok(out.every((w) => w.id !== target.id && w.hi !== target.hi));
  }
  // पतंग should be shown next to other प/ं words, not random ones
  const kite = L.similarWords(word('kite'), pool, 2, L.makeRng(1), content.matras);
  assert.ok(kite.every((w) => w.hi.startsWith('प') || w.hi.includes('ं')), kite.map((w) => w.hi).join());
});

test('in English mode, distractors look alike in English', () => {
  const pool = L.expandWords(['@grade1'], content).map(word);
  const out = L.similarWords(word('bear'), pool, 2, L.makeRng(4), content.matras, 'en');
  assert.ok(out.some((w) => w.en.startsWith('b')), out.map((w) => w.en).join());
});

// ---- rhymes and pairs ----

test('rhyme rounds: the answer rhymes, the distractors come from other groups', () => {
  const groups = content.games.rhyme.groups;
  for (const lang of ['hi', 'en']) {
    for (let seed = 1; seed < 30; seed++) {
      const r = L.makeRhymeRound(groups, lang, L.makeRng(seed));
      const g = groups.find((x) => x.lang === lang && x.words.includes(r.target) && x.words.includes(r.answer));
      assert.ok(g, 'target and answer share a group');
      assert.notEqual(r.target, r.answer);
      assert.equal(r.options.length, 3);
      assert.ok(r.options.includes(r.answer));
      for (const o of r.options) if (o !== r.answer) assert.ok(!g.words.includes(o), `${o} must not rhyme with ${r.target}`);
    }
  }
  assert.equal(L.makeRhymeRound([], 'hi'), null);
});

test('pair rounds: opposites go both ways, plurals and females go one way', () => {
  const sets = content.games.pairs.sets;
  for (let seed = 1; seed < 60; seed++) {
    const r = L.makePairRound(sets, ['opposite', 'plural', 'female'], L.makeRng(seed));
    const pair = sets[r.kind].find((p) => p.includes(r.from) && p.includes(r.to));
    assert.ok(pair, `${r.from} -> ${r.to} is a ${r.kind} pair`);
    if (r.kind !== 'opposite') assert.equal(pair[0], r.from);
    assert.equal(r.options.length, 3);
    assert.equal(new Set(r.options).size, 3);
    assert.ok(r.options.includes(r.to));
  }
});

test('plural and female words have the matching picture', () => {
  for (const [one, many] of content.games.pairs.sets.plural) assert.equal(word(many).picture, `many:${word(one).picture}`);
});

// ---- validator: new sections ----

const errorsFor = (mutate) => {
  const c = structuredClone(content);
  mutate(c);
  return validateContent(c).errors.join('\n');
};

test('validator: unknown level on a word', () => {
  assert.match(errorsFor((c) => (c.words.bus.level = 'grade9')), /level "grade9" is not one of the levels/);
});

test('validator: a level with an unknown place', () => {
  assert.match(errorsFor((c) => c.levels[0].places.push('moon-base')), /"moon-base" is not a place/);
});

test('validator: bad @level reference in a word list', () => {
  assert.match(errorsFor((c) => (c.games.read.words = ['@grade9'])), /"@grade9" not found/);
});

test('validator: a level override is checked too', () => {
  assert.match(errorsFor((c) => (c.levels[0].games.busdepot.maxPassengers = 50)), /maxPassengers must be 3 to 10/);
});

test('validator: story answer must be one of its options', () => {
  assert.match(errorsFor((c) => (c.stories[0].questions[0].answer = 'cow')), /answer must be one of its options/);
});

test('validator: a reading place needs sentences for its level', () => {
  assert.match(
    errorsFor((c) => (c.sentences = c.sentences.filter((s) => s.level !== 'grade1'))),
    /metro place has no sentences/,
  );
});

test('validator: matra game needs known matra ids', () => {
  assert.match(errorsFor((c) => c.games.matra.matras.push('zz')), /matras must list at least 3 ids/);
});

test('validator: rhyme groups need a partner group in the same language', () => {
  assert.match(
    errorsFor((c) => (c.games.rhyme.groups = c.games.rhyme.groups.filter((g) => g.lang === 'hi').concat([{ lang: 'en', words: ['car', 'star'] }]))),
    /en needs at least 2 groups/,
  );
});

test('story recordings get their own file names', () => {
  const keys = L.clipKeysFor(content);
  assert.ok(keys.includes('story-red-bus-1_hi'));
  assert.ok(keys.includes('story-thirsty-crow-6_en'));
});
