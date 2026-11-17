// Section 10 of docs/ROADMAP.md: maths to add (10.4 onwards).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS, makeProblem } from '../js/mathgen.js';
import { mathModel } from '../js/art-math.js';
import { ACTIVITIES, ACTIVITY_SKILL } from '../js/games/handson.js';
import { validateContent } from '../js/validate.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const lessons = content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => ({ ...l, world: w, unit: u }))));
const lesson = (id) => lessons.find((l) => l.id === id);

// ---- 10.4 the gaps in Kindergarten and Grade 1 ----

test('10.4: each new skill is a lesson in the right unit and comes back in the review', () => {
  const where = {
    'k-countback': 'km-count',
    'k-pattern': 'km-count',
    'k-ordinal': 'km-numbers',
    'k-bond10': 'km-ten',
    'g1-countback': 'g1m-count',
    'g1-skip': 'g1m-count',
    'g1-doubles': 'g1m-facts',
    'g1-bond20': 'g1m-facts',
    'g1-fluency': 'g1m-facts',
  };
  for (const [skill, unit] of Object.entries(where)) {
    assert.ok(SKILLS[skill], skill);
    assert.ok(
      lessons.some((l) => l.unit.id === unit && l.game === 'math' && l.config.skills.length === 1 && l.config.skills[0] === skill),
      `${skill} has its own lesson in ${unit}`,
    );
  }
  const review = lessons.filter((l) => /party|challenge/.test(l.unit.id)).flatMap((l) => l.config.skills);
  for (const s of ['k-countback', 'k-bond10', 'k-ordinal', 'g1-doubles', 'g1-skip', 'g1-bond20', 'g1-countback']) assert.ok(review.includes(s), `${s} is in the review`);
  // a unit with a hands-on lesson still ends with one
  for (const w of content.worlds.filter((x) => x.subject === 'math'))
    for (const u of w.units) {
      const hands = u.lessons.findIndex((l) => l.game === 'handson');
      if (hands >= 0) assert.equal(u.lessons.at(-1).game, 'handson', u.id);
    }
  assert.deepEqual(validateContent(content).errors, []);
});

test('10.4: counting back goes down by one, and the gap is the number before', () => {
  const rng = seeded(3);
  for (const id of ['k-countback', 'g1-countback'])
    for (const tier of [0, 1, 2])
      for (let i = 0; i < 40; i++) {
        const p = makeProblem(id, { tier, n: 3, rng });
        const items = p.model.items;
        const gap = items.indexOf(null);
        const known = items.map((v, k) => (v === null ? null : [k, v])).filter(Boolean);
        const [k0, v0] = known[0];
        for (const [k, v] of known) assert.equal(v, v0 - (k - k0), `${id}: ${items}`);
        assert.equal(p.answer, v0 - (gap - k0));
        assert.ok(p.answer >= 0);
        if (id === 'k-countback') assert.ok(items.every((v) => v === null || v <= 10));
      }
  // Grade 1's top level crosses a ten going down
  for (let i = 0; i < 30; i++) {
    const p = makeProblem('g1-countback', { tier: 2, n: 3, rng });
    const all = p.model.items.map((v) => v ?? p.answer);
    assert.ok(all.some((v) => v % 10 === 0) && all.some((v) => v % 10 === 9), String(all));
  }
});

test('10.4: first, second, third: the answer is in that place from the flag', () => {
  const rng = seeded(5);
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth'];
  for (const tier of [0, 1, 2])
    for (let i = 0; i < 40; i++) {
      const p = makeProblem('k-ordinal', { tier, n: 3, rng });
      const pics = p.model.pics;
      assert.equal(pics.length, tier === 0 ? 3 : 5);
      if (ORD.includes(p.answer)) assert.ok(p.ask.includes(pics[ORD.indexOf(p.answer)]));
      else assert.equal(pics.indexOf(p.answer), ORD.indexOf(p.ask.match(/is (\w+)\?/)[1]));
    }
  assert.match(mathModel({ kind: 'queue', pics: ['duck', 'cat', 'penguin'] }), /mm-flag[\s\S]*mm-racer/);
});

test('10.4: number bonds: the parts make the whole, and the gap is drawn as a ?', () => {
  const rng = seeded(11);
  for (const [id, top] of [
    ['k-bond10', 10],
    ['g1-bond20', 20],
  ])
    for (const tier of [0, 1, 2])
      for (let i = 0; i < 40; i++) {
        const p = makeProblem(id, { tier, n: 3, rng });
        const { whole, parts } = p.model;
        const [a, b] = parts;
        if (whole === null) assert.equal(p.answer, a + b);
        else assert.equal(a + p.answer, whole);
        assert.ok((whole ?? a + b) <= top);
        assert.match(mathModel(p.model), /mm-bond-gap/);
      }
});

test('10.4: skip counting, doubles and near doubles, and facts with no picture', () => {
  const rng = seeded(13);
  for (let i = 0; i < 60; i++) {
    const s = makeProblem('g1-skip', { tier: 2, n: 3, rng });
    const known = s.model.items.filter((v) => v !== null);
    const step = known[1] - known[0] || known[2] - known[1];
    assert.ok([2, 5, 10, 4, 15, 20, 30].includes(Math.abs(step)), String(s.model.items));
    assert.equal(s.answer % ([2, 5, 10].find((k) => s.ask.includes(`by ${k}s`)) || 1), 0);
    const d = makeProblem('g1-doubles', { tier: 2, n: 3, rng });
    const [x, y] = d.eq.split(' = ')[0].split(' + ').map(Number);
    assert.ok(y === x || y === x + 1);
    assert.equal(d.answer, x + y);
    const f = makeProblem('g1-fluency', { tier: 1, n: 3, rng });
    assert.equal(f.model, null);
    assert.ok(f.answer >= 0 && f.answer <= 10);
  }
  // the facts-practice lessons bring a missed fact back
  for (const id of ['km-add-facts', 'g1m-facts-fluency']) assert.equal(lesson(id).config.retry, true, id);
  assert.match(read('js/games/math.js'), /ctx\.config\.retry && !right\.firstTry/);
});

test('10.4: the number-bond bubbles make 10 in Kindergarten and 20 in Grade 1', () => {
  assert.ok(ACTIVITIES.includes('bonds'));
  assert.equal(ACTIVITY_SKILL.bonds, 'k-bond10');
  assert.equal(lesson('km-ten-bubbles').config.target, 10);
  assert.equal(lesson('g1m-facts-bubbles').config.target, 20);
  assert.equal(lesson('g1m-facts-bubbles').config.skill, 'g1-bond20');
  const bad = structuredClone(content);
  bad.worlds.flatMap((w) => w.units).flatMap((u) => u.lessons).find((l) => l.id === 'km-ten-bubbles').config.target = 12;
  assert.ok(validateContent(bad).errors.some((e) => e.includes('target must be 10 or 20')));
});

// ---- 10.5 the Grade 2 maths world ----
import { numberWords } from '../js/mathgen.js';
import { MASCOT_IDS } from '../js/mascot.js';
import { THEMES } from '../js/art-scenes.js';

test('10.5: Gilu\'s Number Bazaar: a Grade 2 maths world of about 24 lessons, with its own guide, scene and prizes', () => {
  const w = content.worlds.find((x) => x.id === 'bazaar');
  assert.equal(w.level, 'grade2');
  assert.equal(w.subject, 'math');
  assert.equal(w.lang, 'en');
  assert.ok(MASCOT_IDS.includes(w.mascot) && THEMES.includes(w.theme));
  assert.ok(content.collections[w.collection].items.every((id) => content.words[id]));
  const ls = w.units.flatMap((u) => u.lessons);
  assert.ok(ls.length >= 24, `${ls.length} lessons`);
  const skills = new Set(ls.flatMap((l) => (l.game === 'math' ? l.config.skills : [l.config.skill])));
  const g2 = Object.keys(SKILLS).filter((s) => s.startsWith('g2-'));
  assert.ok(g2.length >= 19);
  for (const s of g2) assert.ok(skills.has(s), `${s} is taught`);
  // the standards the roadmap names
  const codes = new Set(g2.map((s) => SKILLS[s].code));
  for (const c of ['NC.2.NBT.1', 'NC.2.NBT.5', 'NC.2.NBT.7', 'NC.2.OA.3', 'NC.2.OA.4', 'NC.2.MD.7', 'NC.2.MD.1', 'NC.2.MD.8', 'NC.2.G.3', 'NC.2.MD.10']) assert.ok(codes.has(c), c);
  // four hands-on games, each recording a Grade 2 skill
  const hands = ls.filter((l) => l.game === 'handson');
  assert.deepEqual(hands.map((l) => l.config.activity).sort(), ['array', 'clock', 'jumps', 'shop']);
  assert.ok(hands.every((l) => l.config.skill.startsWith('g2-')));
  assert.equal(hands.find((l) => l.config.activity === 'clock').config.minutes, 5);
  assert.equal(hands.find((l) => l.config.activity === 'shop').config.dollars, true);
});

test('10.5: place value with a zero, the slips as wrong answers, and numbers in words', () => {
  assert.equal(numberWords(406), 'four hundred six');
  assert.equal(numberWords(342), 'three hundred forty-two');
  assert.equal(numberWords(1729), 'one thousand seven hundred twenty-nine');
  const rng = seeded(17);
  let zero = 0;
  for (let i = 0; i < 60; i++) {
    const p = makeProblem('g2-place', { tier: 2, n: 4, rng });
    if (/^\d00 \+ \d = \?$/.test(p.eq)) {
      zero++;
      // 400 + 6: 46 is among the wrong answers
      const [h, o] = p.eq.match(/\d+/g).map(Number);
      assert.ok(p.options.some((x) => x.value === (h / 100) * 10 + o), p.eq);
    }
    const s = makeProblem('g2-sub100', { tier: 1, n: 4, rng });
    const [a, b] = s.eq.match(/\d+/g).map(Number);
    assert.equal(s.answer, a - b);
    assert.ok(a % 10 < b % 10, 'tier 1 always breaks a ten');
  }
  assert.ok(zero > 10);
  // base-ten pictures with hundreds, money with a dollar bill, a ruler, arrays, grids and bar graphs draw
  assert.match(mathModel({ kind: 'base10', hundreds: 2, tens: 3, ones: 4 }), /mm-flat/);
  assert.match(mathModel({ kind: 'money', items: ['dollar', 'quarter', 'dime'] }), /mm-bill[\s\S]*25¢/);
  assert.match(mathModel({ kind: 'ruler', unit: 'cm', len: 6, start: 2, thing: 'pencil' }), /cm/);
  assert.equal((mathModel({ kind: 'array', rows: 3, cols: 4, pic: 'apple' }).match(/mm-cell/g) || []).length, 12);
  assert.match(mathModel({ kind: 'grid', rows: 2, cols: 3 }), /mm-grid/);
  assert.match(mathModel({ kind: 'bars', rows: [{ pic: 'apple', n: 3 }], max: 6 }), /mm-barfill/);
  assert.match(mathModel({ kind: 'parts', shape: 'circle', parts: 3, equal: true, shade: 1 }), /mm-parts/);
});
