import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as L from '../js/logic.js';
import * as C from '../js/curriculum.js';
import { validateContent } from '../js/validate.js';
import { pictureExists } from '../js/art.js';
import { MASCOT_IDS } from '../js/mascot.js';
import { THEMES } from '../js/art-scenes.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
for (const [id, w] of Object.entries(content.words)) w.id = id;
const word = (id) => content.words[id];
const world = (id) => content.worlds.find((w) => w.id === id);

// ---- grades and worlds ----

test('eight grades, from toddler to grade 4 plus the Grade 7 and 8 comics, each with a Hindi world', () => {
  assert.deepEqual(
    content.levels.map((l) => l.id),
    ['toddler', 'kg', 'grade1', 'grade2', 'grade3', 'grade4', 'grade7', 'grade8'],
  );
  for (const l of content.levels) assert.ok(content.worlds.some((w) => w.level === l.id && w.subject === 'hindi'), l.id);
});

test('grades 1 to 4 each have their own lesson icons, not Vehicle Town ones', () => {
  const vehicles = ['bookbus', 'metro', 'place-parking', 'postvan', 'crane', 'place-matra', 'icecreamvan', 'firetruck'];
  const seen = new Map();
  for (const w of content.worlds.filter((x) => x.subject === 'hindi' && /^grade/.test(x.level))) {
    for (const lesson of C.worldLessons(w)) {
      assert.ok(!vehicles.includes(lesson.icon), `${lesson.id} still uses ${lesson.icon}`);
      assert.ok(pictureExists(content.words[lesson.icon]?.picture || lesson.icon) || lesson.icon.startsWith('letter:'), `${lesson.id}: ${lesson.icon}`);
      // the same activity icon (story book, speech bubble…) never appears in two grades
      if (lesson.icon.includes(':') && !lesson.icon.startsWith('letter:')) {
        const other = seen.get(lesson.icon);
        assert.ok(!other || other === w.level, `${lesson.icon} is in ${other} and ${w.level}`);
        seen.set(lesson.icon, w.level);
      }
    }
  }
  // the "any story" lessons: one storybook icon per grade
  const stories = content.worlds
    .filter((x) => /^grade/.test(x.level) && x.subject === 'hindi')
    .flatMap((x) => C.worldLessons(x).filter((l) => l.game === 'story' && !l.config.story))
    .map((l) => l.icon);
  assert.equal(new Set(stories).size, stories.length);
  assert.ok(stories.length >= 4);
});

test('grades 1 to 4 have their own helpers inside the games', () => {
  const ROLE = { read: 'courier', rhyme: 'vendor', sentence: 'engine', rescue: 'rescuer', matra: 'holder' };
  for (const w of content.worlds.filter((x) => x.subject === 'hindi' && /^grade/.test(x.level))) {
    for (const lesson of C.worldLessons(w)) {
      const role = lesson.game === 'construction' ? 'lifter' : ROLE[lesson.game];
      if (role) assert.ok(w.helpers?.[role] && word(w.helpers[role]), `${w.id} needs a ${role} for ${lesson.id}`);
    }
  }
  const bad = structuredClone(content);
  bad.worlds.find((x) => x.id === 'jungle').helpers.driver = 'bus';
  assert.ok(validateContent(bad).errors.some((e) => e.includes('"driver" is not one of')));
});

test('every grade from Kindergarten to Grade 4 has at least three worlds, each tagged with what it teaches', () => {
  for (const level of ['kg', 'grade1', 'grade2', 'grade3', 'grade4']) {
    const worlds = content.worlds.filter((w) => w.level === level);
    assert.ok(worlds.length >= 3, `${level} has ${worlds.length} worlds`);
    // the worlds of a grade teach different things
    const sets = worlds.map((w) => w.tags.slice().sort().join('+'));
    assert.equal(new Set(sets).size, sets.length, `${level}: ${sets}`);
  }
  for (const w of content.worlds) {
    assert.ok(w.tags.length >= 1, w.id);
    for (const t of w.tags) assert.ok(content.tags[t], `${w.id}: ${t}`);
  }
  for (const key of ['theme', 'mascot', 'collection']) assert.equal(new Set(content.worlds.map((w) => w[key])).size, content.worlds.length, key);
});

test('grammar, stories and phonics each have their own worlds from Grade 2', () => {
  for (const level of ['grade2', 'grade3', 'grade4']) {
    const tags = content.worlds.filter((w) => w.level === level).flatMap((w) => w.tags);
    for (const t of ['grammar', 'stories']) assert.ok(tags.includes(t), `${level} needs ${t}`);
  }
  const forest = content.worlds.find((w) => w.id === 'forest');
  assert.ok(C.worldLessons(forest).filter((l) => l.config.story).length >= 8, 'one lesson per story');
});

test('every world has its own theme, mascot and collection', () => {
  const hindi = content.worlds.filter((w) => w.subject === 'hindi');
  for (const key of ['theme', 'mascot', 'collection']) assert.equal(new Set(hindi.map((w) => w[key])).size, hindi.length, key);
});

test('lesson ids are unique and findLesson finds every lesson', () => {
  const ids = content.worlds.flatMap((w) => C.worldLessons(w).map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.equal(C.findLesson(content, id).lesson.id, id);
});

test('content.json is valid with the real pictures, mascots and themes', () => {
  const { errors, warnings } = validateContent(content, { pictureExists, mascots: MASCOT_IDS, themes: THEMES });
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('every grade from 1 to 4 has a shelf of stories, and folktales end with a moral', () => {
  for (const level of ['grade1', 'grade2', 'grade3', 'grade4']) {
    const shelf = content.stories.filter((s) => s.level === level);
    assert.ok(shelf.length >= 6, `${level} has ${shelf.length} stories`);
    assert.ok(shelf.every((s) => s.questions.length >= 2), `${level}: every story asks questions`);
  }
  const ids = content.stories.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['lion-mouse', 'monkey-crocodile', 'birbal-khichdi', 'tenali-thieves']) {
    const s = content.stories.find((x) => x.id === id);
    assert.ok(s?.moral?.hi && s.moral.en, `${id} has a moral`);
  }
  // older grades ask about the story in words, not only pictures
  for (const level of ['grade3', 'grade4']) assert.ok(content.stories.some((s) => s.level === level && s.questions.some((q) => q.text)), level);
});

test('story recordings include the moral', () => {
  const keys = L.clipKeysFor(content);
  assert.ok(keys.includes('story-lion-mouse-1_hi'));
  assert.ok(keys.includes('story-lion-mouse-moral_en'));
});

// ---- unlocking, stars, tiers, streaks ----

const town = world('town');
const lessons = C.worldLessons(town);

test('lessons open one after another, or all at once for grown-ups', () => {
  const p = L.defaultProgress(content);
  assert.ok(C.isUnlocked(p, town, lessons[0].id));
  assert.ok(!C.isUnlocked(p, town, lessons[1].id));
  assert.ok(C.isUnlocked(p, town, lessons[5].id, true));
  const after = { ...p, lessons: { [lessons[0].id]: { stars: 1, plays: 1, tier: 0 } } };
  assert.ok(C.isUnlocked(after, town, lessons[1].id));
  assert.equal(C.currentLesson(after, town).id, lessons[1].id);
  assert.equal(C.nextLesson(town, lessons[0].id).id, lessons[1].id);
  assert.equal(C.nextLesson(town, lessons[lessons.length - 1].id), null);
});

test('stars: never fewer than one; three for nine in ten right first time', () => {
  assert.equal(C.starsFor(0, 5), 1);
  assert.equal(C.starsFor(4, 5), 2);
  assert.equal(C.starsFor(5, 5), 3);
  assert.equal(C.starsFor(0, 0), 3, 'games with nothing to get wrong');
});

test('tiers go up after an easy lesson and down after a hard one', () => {
  assert.equal(C.nextTier(0, 6, 6), 1);
  assert.equal(C.nextTier(2, 6, 6), 2);
  assert.equal(C.nextTier(1, 2, 6), 0);
  assert.equal(C.nextTier(1, 4, 6), 1);
});

test('inside a lesson the level follows the child', () => {
  let s = { tier: 0 };
  s = C.adaptTier(s, true);
  assert.deepEqual([s.tier, s.changed], [0, 0]);
  s = C.adaptTier(s, true);
  assert.deepEqual([s.tier, s.changed], [1, 1]); // two right in a row: harder
  s = C.adaptTier(s, false);
  s = C.adaptTier(s, true);
  s = C.adaptTier(s, false);
  assert.equal(s.tier, 1); // a miss between rights doesn't drop the level
  s = C.adaptTier(s, false);
  assert.deepEqual([s.tier, s.changed], [0, -1]); // two misses in a row: easier
  s = C.adaptTier(C.adaptTier(C.adaptTier(C.adaptTier({ tier: 1 }, true), true), true), true);
  assert.equal(s.tier, 2); // never above the top level
  assert.equal(C.adaptTier(C.adaptTier({ tier: 0 }, false), false).tier, 0);
});

test('the next visit starts from the level the child reached', () => {
  const p0 = L.defaultProgress(content);
  const r = C.applyLessonResult(p0, { world: town, lesson: lessons[0], collection: null, firstTry: 5, answered: 6, tier: 2 });
  assert.equal(r.tier, 2);
  const r2 = C.applyLessonResult(p0, { world: town, lesson: lessons[0], collection: null, firstTry: 2, answered: 6, tier: 1 });
  assert.equal(r2.tier, 0);
});

test('finishing a lesson saves stars, gives a collectible, and counts the day', () => {
  const col = { id: 'vehicles', ...content.collections.vehicles };
  const p0 = L.defaultProgress(content);
  const r = C.applyLessonResult(p0, { world: town, lesson: lessons[0], collection: col, firstTry: 5, answered: 5, now: new Date(2026, 10, 4) });
  assert.equal(r.stars, 3);
  assert.equal(r.item, col.items[2], 'the first two vehicles are free, so the third comes next');
  assert.deepEqual(r.progress.days, ['2026-11-04']);
  assert.equal(r.progress.lessons[lessons[0].id].tier, 1);
  assert.equal(r.unitComplete, false, 'the first unit has more lessons');
  // a unit with one lesson is complete as soon as that lesson is
  const farm = world('farm');
  const one = farm.units.find((u) => u.lessons.length === 1);
  const r1 = C.applyLessonResult(p0, { world: farm, lesson: one.lessons[0], collection: { id: 'farm', ...content.collections.farm }, firstTry: 1, answered: 2 });
  assert.ok(r1.unitComplete);
  // a 1-star replay keeps the best stars and gives nothing new
  const again = C.applyLessonResult(r.progress, { world: town, lesson: lessons[0], collection: col, firstTry: 0, answered: 4 });
  assert.equal(again.progress.lessons[lessons[0].id].stars, 3);
  assert.equal(again.item, null);
});

test('streak counts days in a row up to today or yesterday', () => {
  const days = ['2026-11-01', '2026-11-02', '2026-11-03'];
  assert.equal(C.streak(days, new Date(2026, 10, 3)), 3);
  assert.equal(C.streak(days, new Date(2026, 10, 4)), 3);
  assert.equal(C.streak(days, new Date(2026, 10, 6)), 0);
});

test('the hub shows the child\'s grade first, or only that grade when locked', () => {
  const s = L.normalizeSettings({ level: 'grade2' }, content);
  assert.equal(C.hubWorlds(content, s)[0].level, 'grade2');
  assert.ok(C.hubWorlds(content, { ...s, lockGrade: true }).every((w) => w.level === 'grade2'));
  assert.equal(C.homeWorld(content, s).id, 'dino');
});

test('letter lessons can take a slice of a set', () => {
  const [set] = C.lessonLetters(content, { sets: ['hindiConsonants'], from: 0, to: 10 });
  assert.equal(set.letters.length, 10);
  assert.equal(set.letters[0].char, 'क');
  assert.equal(set.id, 'hindiConsonants:0-10');
  assert.equal(C.lessonLetters(content, { sets: ['english'] })[0].id, 'english');
});

test('matra lessons give each unit words that use its matras', () => {
  const g1 = world('jungle');
  for (const unit of g1.units.filter((u) => u.id.startsWith('g1-m'))) {
    for (const lesson of unit.lessons.filter((l) => l.config.focus)) {
      const words = L.wordsForMatras(L.expandWords(lesson.config.words || lesson.config.buildWords, content).map(word), content.matras, lesson.config.focus, lesson.config.allow || []);
      assert.ok(words.length >= 3, `${lesson.id} has only ${words.length} words`);
    }
  }
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

test('easier levels offer fewer choices in rhymes and pairs', () => {
  const groups = content.games.rhyme.groups;
  assert.equal(L.makeRhymeRound(groups, 'hi', L.makeRng(3), 1).options.length, 2);
  const sets = content.games.pairs.sets;
  for (let seed = 1; seed < 20; seed++) {
    for (const count of [2, 3, 4]) {
      const r = L.makePairRound(sets, ['opposite', 'plural', 'female'], L.makeRng(seed), count);
      assert.equal(r.options.length, count);
      assert.ok(r.options.includes(r.to));
    }
  }
});

test('plural and female words have the matching picture', () => {
  for (const [one, many] of content.games.pairs.sets.plural) assert.equal(word(many).picture, `many:${word(one).picture}`);
});

// ---- validator: new sections ----
