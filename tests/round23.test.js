// Roadmap 7.10, 9.1, 9.3, 10.2 and 10.3: a guide with more to say, toddler stories, rhymes, counting
// stories and the Hindi numbers strand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { timeSlot, daysAway, greeting, milestones, milestoneLine, storiesRead, totalStars, guideLines, SLOTS, AWAY_DAYS } from '../js/guide.js';
import { nearNumbers } from '../js/games/ginti.js';
import { GINTI_MODES, validateContent } from '../js/validate.js';
import { sceneHtml, sceneClass, actProblems } from '../js/scene.js';
import { appVoiceLines, sentenceTokens } from '../js/logic.js';
import { worldLessons } from '../js/curriculum.js';
import { pictureExists } from '../js/art.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const story = (id) => content.stories.find((s) => s.id === id);
const lessonsOf = (worldId) => worldLessons(content.worlds.find((w) => w.id === worldId));

// ---- 10.3 Hindi numbers ----
test('the numbers go from एक to सौ, with their words in both languages and Devanagari digits', () => {
  assert.equal(content.numbers.length, 100);
  content.numbers.forEach((n, i) => assert.equal(n.value, i + 1));
  const at = (v) => content.numbers[v - 1];
  assert.equal(at(19).hi, 'उन्नीस');
  assert.equal(at(27).hi, 'सत्ताईस');
  assert.equal(at(50).hi, 'पचास');
  assert.equal(at(99).hi, 'निन्यानवे');
  assert.equal(at(100).hi, 'सौ');
  assert.equal(at(27).en, 'twenty-seven');
  assert.equal(at(100).en, 'one hundred');
  assert.equal(at(47).digitHi, '४७');
  assert.equal(new Set(content.numbers.map((n) => n.hi)).size, 100, 'no word twice');
  assert.deepEqual(validateContent(content).errors, []);
});

test('every grade from Toddler to Grade 2 has a गिनती unit, and each mode is used', () => {
  const ginti = content.worlds.flatMap((w) => worldLessons(w).filter((l) => l.game === 'ginti').map((l) => ({ ...l, level: w.level })));
  for (const level of ['toddler', 'kg', 'grade1', 'grade2']) assert.ok(ginti.some((l) => l.level === level), level);
  const used = new Set(ginti.flatMap((l) => l.config.modes));
  for (const m of GINTI_MODES) assert.ok(used.has(m), `mode ${m} is used`);
  // the ranges grow with the grade: to 10, to 20, to 50, to 100
  const top = (level) => Math.max(...ginti.filter((l) => l.level === level).map((l) => l.config.to));
  assert.deepEqual(['toddler', 'kg', 'grade1', 'grade2'].map(top), [10, 20, 50, 100]);
  // toddlers can't read: only counting and finding groups
  for (const l of ginti.filter((x) => x.level === 'toddler')) assert.ok(l.config.modes.every((m) => ['count', 'show'].includes(m)), l.id);
  // the maths words: जोड़ो, घटाओ, आधा, ज़्यादा / कम / बराबर
  for (const k of ['gintiAdd', 'gintiTake', 'gintiHalf', 'gintiMore', 'gintiFewer', 'gintiEqual', 'numAfter', 'gintiCount', 'gintiRead']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
  for (const [k, w] of [['gintiAdd', 'जोड़'], ['gintiMore', 'ज़्यादा'], ['gintiFewer', 'कम'], ['gintiEqual', 'बराबर'], ['gintiHalf', 'आधा']]) assert.ok(content.phrases[k].hi.includes(w), k);
});

test('the choices near a number always hold the answer, once, inside the range', () => {
  for (let answer = 1; answer <= 100; answer += 7) {
    const lo = Math.max(1, answer - 5);
    const hi = Math.min(100, answer + 5);
    for (const n of [2, 3, 4]) {
      const opts = nearNumbers(answer, n, lo, hi, () => 0.42);
      assert.equal(opts.length, n);
      assert.equal(new Set(opts).size, n);
      assert.ok(opts.includes(answer));
      assert.ok(opts.every((v) => v >= lo && v <= hi));
    }
  }
});

test('a ginti lesson with an unknown mode or a bad range is caught', () => {
  const c = structuredClone(content);
  const l = c.worlds.find((w) => w.id === 'town').units.flatMap((u) => u.lessons).find((x) => x.game === 'ginti');
  l.config = { modes: ['juggle'], from: 30, to: 20 };
  const errs = validateContent(c).errors.join(' | ');
  assert.match(errs, /modes must list/);
  assert.match(errs, /"from" and "to"/);
});

// ---- 10.2 counting stories ----
test('counting stories: eight for Kindergarten, each page showing the number it says', () => {
  const ids = ['c-bandar', 'c-roti', 'c-pahiye', 'c-bus', 'c-laddoo', 'c-batakh', 'c-taare', 'c-chinti'];
  const linked = lessonsOf('town').map((l) => l.config?.story);
  const NUM = { एक: 1, दो: 2, तीन: 3, चार: 4, पाँच: 5, छह: 6, दस: 10 };
  for (const id of ids) {
    const s = story(id);
    assert.ok(s && s.level === 'kg', id);
    assert.ok(linked.includes(id), `Vehicle Town opens ${id}`);
    const counted = s.pages.filter((p) => Number.isInteger(p.act?.count));
    assert.ok(counted.length >= 3, `${id} counts on most pages`);
    // the last number word on a counting page is the number drawn (when the page says one)
    for (const p of counted) {
      const said = sentenceTokens(p.hi).map((t) => NUM[t.replace(/[।!,.?…]/g, '')]).filter(Boolean);
      if (said.length) assert.equal(said.at(-1), p.act.count, `${id}: "${p.hi}" shows ${p.act.count}`);
    }
  }
  // the scene draws that many, numbered, under the picture when something else is counted
  const html = sceneHtml({ count: 3, of: 'wheel' }, 'car', (id) => `<svg data-id="${id}"></svg>`);
  assert.equal((html.match(/class="count-item"/g) || []).length, 3);
  assert.match(html, /data-id="car"/);
  assert.equal((html.match(/data-id="wheel"/g) || []).length, 3);
  assert.match(html, /<b class="count-num">3<\/b>/);
  assert.ok(!sceneHtml({ count: 2 }, 'roti', (id) => id).includes('actor main'), 'counting the page picture replaces it');
  assert.match(sceneClass({ count: 2, of: 'wheel' }), / counting has-of/);
  assert.equal(actProblems({ count: 11 }, () => true).length, 1);
  assert.equal(actProblems({ of: 'wheel' }, () => true).length, 1);
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.scene\.play \.count-item \{/);
});

// ---- 9.1 toddler stories ----
test('twelve stories about a toddler’s own day, each on the farm map', () => {
  const ids = ['t-daant', 't-nahana', 't-kapde', 't-dal', 't-chhupan', 't-haath', 't-park', 't-nani', 't-sabzi', 't-sona', 't-gaadi', 't-khana'];
  const linked = lessonsOf('farm').map((l) => l.config?.story);
  for (const id of ids) {
    const s = story(id);
    assert.ok(s && s.level === 'toddler', id);
    assert.ok(linked.includes(id), id);
  }
  // the new things they need are drawn
  for (const w of ['toothbrush', 'soap', 'shirt', 'dal', 'hand', 'slide', 'ball', 'tomato', 'grass', 'rasgulla', 'wheel', 'peanut', 'grain']) {
    assert.ok(content.words[w], w);
    assert.ok(pictureExists(content.words[w].picture), `${w} has a picture`);
  }
});

// ---- 9.3 rhymes ----
test('twelve rhymes and counting-out games, with where each one comes from', () => {
  const rhymes = content.stories.filter((s) => s.id.startsWith('r-'));
  assert.equal(rhymes.length, 12);
  for (const r of rhymes) {
    assert.equal(r.kind, 'poem', r.id);
    assert.ok(/folk|adapted|original/.test(r.source || ''), `${r.id} says where it comes from`);
  }
  const all = [...lessonsOf('farm'), ...lessonsOf('town')].map((l) => l.config?.story);
  for (const r of rhymes) assert.ok(all.includes(r.id), `${r.id} is on a map`);
  // the traditional counting-out rhyme counts to a hundred
  assert.match(story('r-akkad').pages[1].hi, /अस्सी नब्बे पूरे सौ/);
});

// ---- 7.10 the guide ----
test('the guide has 40 or more tap lines and a greeting for every time of day', () => {
  assert.ok(content.mascotLines.length >= 40);
  for (const m of content.mascotLines) assert.ok(m.hi && m.en && m.move, m.en);
  for (const slot of SLOTS) assert.ok(content.guide.greet[slot].length >= 2, slot);
  assert.equal(timeSlot(new Date(2026, 0, 1, 7)), 'morning');
  assert.equal(timeSlot(new Date(2026, 0, 1, 13)), 'day');
  assert.equal(timeSlot(new Date(2026, 0, 1, 18)), 'evening');
  assert.equal(timeSlot(new Date(2026, 0, 1, 22)), 'night');
  assert.equal(timeSlot(new Date(2026, 0, 1, 3)), 'night');
  // every line is recorded
  const keys = new Set(appVoiceLines(content).map((l) => l.key));
  for (const l of guideLines(content.guide)) for (const lang of ['hi', 'en']) assert.ok(keys.has(`${l.key}_${lang}`), l.key);
});

test('after a few days away the guide is glad, and never mentions a streak', () => {
  const now = new Date(2026, 10, 17, 10).getTime();
  const day = (d) => `2026-11-${String(d).padStart(2, '0')}`;
  assert.equal(daysAway([], now), null);
  assert.equal(daysAway([day(16)], now), 1);
  assert.equal(daysAway([day(10), day(12)], now), 5);
  const first = greeting(content.guide, { days: [], now, rng: () => 0 });
  assert.equal(first.id, 'first-1');
  const back = greeting(content.guide, { days: [day(10)], now, rng: () => 0 });
  assert.match(back.id, /^back-/);
  assert.ok(AWAY_DAYS >= 2);
  const usual = greeting(content.guide, { days: [day(16)], now, rng: () => 0 });
  assert.match(usual.id, /^morning-/);
  for (const l of guideLines(content.guide)) assert.ok(!/streak|लगातार|टूट/i.test(`${l.hi} ${l.en}`), `${l.id} doesn't talk about streaks`);
});

test('milestones: the first lesson, stars, stories read, days played and a finished world', () => {
  const p = (lessons, days = []) => ({ lessons, days });
  const storyLessons = new Map([['t-kahani-1', 't-chooza']]);
  const first = milestones(p({}), p({ 't-kahani-1': { stars: 3 } }, ['2026-11-17']), { storyLessons });
  assert.deepEqual(first, ['first-lesson'], 'the first lesson is also the first story: one cheer');
  const lessons = Object.fromEntries(Array.from({ length: 4 }, (_, i) => [`a${i}`, { stars: 2 }]));
  const more = milestones(p(lessons), p({ ...lessons, b: { stars: 3 } }), {});
  assert.deepEqual(more, ['stars-10']);
  assert.equal(totalStars(p(lessons)), 8);
  assert.equal(storiesRead(p({ 'story:x': { stars: 1 }, 't-kahani-1': { stars: 2 }, other: { stars: 3 } }), storyLessons), 2);
  const days = milestones(p({ a: { stars: 1 } }, ['d1', 'd2']), p({ a: { stars: 1 } }, ['d1', 'd2', 'd3']), {});
  assert.deepEqual(days, ['days-3']);
  const world = milestones(p({ a: { stars: 1 } }), p({ a: { stars: 1 }, b: { stars: 1 } }), { worldLessonIds: ['a', 'b'] });
  assert.equal(world[0], 'world');
  for (const id of ['world', 'first-lesson', 'stars-10', 'stars-500', 'stories-1', 'stories-50', 'days-3', 'days-100']) assert.ok(milestoneLine(content.guide, id), id);
});

test('the home screen greets, and the results screen cheers a milestone', () => {
  const screens = readFileSync(new URL('../js/screens.js', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.match(screens, /greet\(api\)/);
  assert.match(screens, /sayLines\(milestone, `guide-\$\{milestone\.id\}`\)/);
  assert.match(app, /milestones\(before, state\.progress/);
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  for (const f of ['js/guide.js', 'js/games/ginti.js']) assert.ok(sw.includes(`'${f}'`), f);
});

test('the numbers game keeps answers in its own property (a button turns "value" into text)', () => {
  const src = readFileSync(new URL('../js/games/ginti.js', import.meta.url), 'utf8');
  assert.ok(!/\{ value: /.test(src) && !/\b[bx]\.value\b/.test(src), 'no button.value for numbers');
});
